import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer } from '@/lib/api-utils'
import { buildGroundingContext, validateCitations, WEB_SEARCH_TOOL, groundingStats } from '@/lib/legal-grounding'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a senior legal researcher specializing in Brazilian legislation. You explain articles of law, codes, regulations, and normative instructions with clarity and depth.

EXPERTISE:
- Federal Constitution (CF/1988)
- Civil Code (CC/2002), Criminal Code (CP/1940)
- CPC/2015, CPP, CLT, CDC
- Administrative law, Tax law, Environmental law
- Regulatory agencies (ANVISA, ANATEL, CVM, etc.)
- Recent legislative changes and pending bills

RULES:
- Explain each article clearly with practical examples
- Distinguish between literal interpretation and jurisprudential interpretation
- Note any recent changes or pending modifications
- Cross-reference related articles
- ALL OUTPUT IN BRAZILIAN PORTUGUESE
- Return ONLY valid JSON

HUMANIZATION RULES (apply to ALL responses):
- Write as a knowledgeable colleague, not a robot. Use natural, warm language.
- When something is ambiguous or you're not 100% certain, be transparent: "Este ponto merece atencao especial porque..." or "Recomendo verificar diretamente no tribunal porque..."
- Proactively suggest next steps: "Apos analisar este documento, sugiro que voce..."
- If you identify potential issues the user didn't ask about, flag them: "Notei algo que pode ser relevante..."
- Use professional but accessible Portuguese — avoid unnecessary jargon without explanation.
- When citing legislation, briefly explain WHY that law matters for the user's specific case.

Return this JSON:
{
  "dispositivo": "Full citation of the legal provision",
  "texto_legal": "Exact text of the article/provision",
  "explicacao": "Clear explanation in accessible language",
  "exemplos_praticos": ["Practical examples of application"],
  "jurisprudencia": ["Relevant court interpretations"],
  "artigos_relacionados": ["Cross-referenced articles"],
  "alteracoes_recentes": "Recent changes or pending modifications",
  "observacoes": ["Important notes"],
  "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve da confianca"}
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Sliding-window rate limit (20 req/min per user per agent)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:legislacao`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'legislacao')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const body = await req.json().catch(() => ({}))
    const consulta = typeof body?.consulta === 'string' ? body.consulta : ''
    if (!consulta || consulta.trim().length < 5) return NextResponse.json({ error: 'Informe o dispositivo legal.' }, { status: 400 })
    if (consulta.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const grounding = buildGroundingContext(consulta, { topK: 8 })
    const gstats = groundingStats(grounding)
    console.log('[API /legislacao] grounding:', gstats)

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      // 6144 (era 4096): explicacao + texto_legal + exemplos + jurisprudencia
      // + artigos_relacionados estourava o teto em artigos longos (CF, CPC).
      max_tokens: 6144,
      system: [
        {
          type: 'text' as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' as const },
        },
        {
          type: 'text' as const,
          text: grounding.contextBlock,
        },
      ],
      tools: [WEB_SEARCH_TOOL],
      messages: [{ role: 'user', content: `Legal provision to explain:\n\n${consulta}` }],
    })

    // Concatena TODOS os text blocks (WEB_SEARCH_TOOL gera preambulo + tool_use + JSON)
    const responseText = message.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()
    let resultado
    try {
      resultado = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      resultado = { explicacao: responseText, erro_parse: true }
    }

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId, agente: 'legislacao',
        mensagem_usuario: `Legislacao: ${consulta.slice(0, 100)}`,
        resposta_agente: resultado.dispositivo || 'Consulta realizada',
      })
    }

    const validation = validateCitations(responseText)
    console.log('[API /legislacao] validation:', validation.stats)

    events.agentUsed(user.id, 'legislacao', 'unknown').catch(() => {})

    return NextResponse.json({
      resultado,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /legislacao]', msg)
    if (err instanceof Error && (msg.includes('529') || msg.toLowerCase().includes('overloaded'))) {
      return NextResponse.json({
        error: 'Agente temporariamente sobrecarregado. Aguarde 30 segundos e tente novamente.',
        retry: true,
      }, { status: 503 })
    }
    return NextResponse.json({
      error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.',
      details: msg,
    }, { status: 500 })
  }
}
