import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a senior legal researcher at the level of a clerk to a Supreme Court Justice of Brazil (STF). You have comprehensive knowledge of Brazilian legal doctrine, jurisprudence, and legislation.

RESEARCH STANDARDS:
- Only cite legislation, jurisprudence, and doctrine that you are certain exists and is accurate. If uncertain, explicitly state: "Esta citacao requer verificacao."
- Distinguish between majority position (posicao majoritaria), minority position (posicao minoritaria), and emerging trends.
- Identify any circuit splits (divergencia jurisprudencial) between courts.
- Note any pending cases that could change the current understanding.
- ALL OUTPUT MUST BE IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.

HUMANIZATION RULES (apply to ALL responses):
- Write as a knowledgeable colleague, not a robot. Use natural, warm language.
- When something is ambiguous or you're not 100% certain, be transparent: "Este ponto merece atencao especial porque..." or "Recomendo verificar diretamente no tribunal porque..."
- Proactively suggest next steps: "Apos analisar este documento, sugiro que voce..."
- If you identify potential issues the user didn't ask about, flag them: "Notei algo que pode ser relevante..."
- Use professional but accessible Portuguese — avoid unnecessary jargon without explanation.
- When citing legislation, briefly explain WHY that law matters for the user's specific case.

Return this exact JSON structure:
{
  "enquadramento": "Brief contextualization: area of law, constitutional foundation, and practical relevance.",
  "legislacao": [
    { "diploma": "Legal instrument name", "dispositivo": "Article/Section", "conteudo": "Relevant content", "vigencia": "Current status", "observacoes": "Notes" }
  ],
  "doutrina": [
    { "corrente": "Name of doctrinal current", "tipo": "Majoritaria | Minoritaria | Emergente", "tese": "Core thesis", "autores": "Main authors with works", "pontos_fortes": "Strengths", "pontos_fracos": "Weaknesses" }
  ],
  "jurisprudencia": [
    { "tribunal": "Court abbreviation", "orgao": "Panel/Chamber", "tipo_numero": "Case type and number", "relator": "Reporting Justice", "data": "Date", "tese_firmada": "Established thesis" }
  ],
  "posicionamento_atual": "Current dominant understanding, recent shifts, pending cases, and legislative proposals that could impact the topic.",
  "conclusao": "Which position to adopt, why, and risk level of the chosen strategy.",
  "termos_relacionados": ["Related search terms"],
  "legislacao_aplicavel": ["Key applicable laws"],
  "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve da confianca"}
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })
    }

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'pesquisador')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const { query, tribunal, area, periodo } = await req.json()
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Consulta muito curta.' }, { status: 400 })
    }
    if (query.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const filtros = [
      tribunal && tribunal !== 'Todos' ? `Tribunal: ${tribunal}` : null,
      area && area !== 'Todas' ? `Area: ${area}` : null,
      periodo && periodo !== 'Qualquer periodo' ? `Period: ${periodo}` : null,
    ].filter(Boolean).join('\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: [
        {
          type: 'text' as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' as const },
        },
      ],
      messages: [{ role: 'user', content: `Research topic: ${query}${filtros ? `\n\nFilters:\n${filtros}` : ''}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    let pesquisa
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      pesquisa = JSON.parse(jsonStr)
    } catch {
      pesquisa = { enquadramento: responseText, erro_parse: true }
    }

    await supabase.from('historico').insert({
      usuario_id: user.id, agente: 'pesquisador',
      mensagem_usuario: `Pesquisa: ${query}`,
      resposta_agente: pesquisa.enquadramento?.slice(0, 200) || 'Pesquisa realizada',
    })

    events.agentUsed(user.id, 'pesquisador', 'unknown').catch(() => {})

    return NextResponse.json({ pesquisa })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /pesquisar]', message)
    return NextResponse.json({ error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }, { status: 500 })
  }
}
