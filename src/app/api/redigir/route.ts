import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer } from '@/lib/api-utils'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const TEMPLATES: Record<string, string> = {
  peticao: 'Peticao Inicial',
  recurso: 'Recurso (Apelacao)',
  contestacao: 'Contestacao',
  parecer: 'Parecer Juridico',
  contrato: 'Contrato',
  notificacao: 'Notificacao Extrajudicial',
}

const SYSTEM_PROMPT = `You are an elite litigation attorney with 20+ years before Brazilian superior courts (STF, STJ, TST). You draft legal documents at the level expected by ministers of the Supreme Federal Tribunal.

DRAFTING STANDARDS:
- Impeccable technical-legal language: precise, formal, but never unnecessarily verbose.
- Every legal argument must cite specific articles, paragraphs, and items of applicable legislation.
- Jurisprudence citations must include: Court, Panel/Chamber, Case Type and Number, Reporting Justice, and judgment date. Only cite real, verifiable decisions.
- Logical structure: facts -> legal framework -> subsumption -> conclusion.
- Anticipate and preemptively address opposing arguments.
- Quantify damages, values, and claims with specificity.
- If essential data is missing (CPF, address, case number), use placeholder [INFORMACAO A COMPLETAR].
- Never invent facts the user did not provide.
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
  "titulo": "Full title of the legal document",
  "documento": "Complete text of the legal document with paragraphs separated by \\n\\n. Must include: proper header addressing competent court, full party qualification, facts section, legal arguments with citations, specific numbered requests, closing with city/date/signature placeholder.",
  "referencias_legais": ["Every statute, article, sumula, and jurisprudence cited"],
  "observacoes": ["Points the attorney must review or complete before filing"],
  "tipo": "document type key",
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

    // Sliding-window rate limit (20 req/min per user per agent)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:redator`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'redator')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const body = await req.json().catch(() => ({}))
    const template = typeof body?.template === 'string' ? body.template : ''
    const instrucoes = typeof body?.instrucoes === 'string' ? body.instrucoes : ''

    if (!template || !TEMPLATES[template]) {
      return NextResponse.json({ error: 'Template invalido.' }, { status: 400 })
    }
    if (!instrucoes || instrucoes.trim().length < 20) {
      return NextResponse.json({ error: 'Instrucoes muito curtas.' }, { status: 400 })
    }
    if (instrucoes.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
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
      messages: [{ role: 'user', content: `Type of document: ${TEMPLATES[template]}\n\nFacts of the case:\n${instrucoes}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    let peca
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      peca = JSON.parse(jsonStr)
    } catch {
      peca = { titulo: TEMPLATES[template], documento: responseText, referencias_legais: [], observacoes: ['Resposta nao estruturada'], tipo: template }
    }

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId, agente: 'redator',
        mensagem_usuario: `Redigir: ${TEMPLATES[template]}`,
        resposta_agente: peca.titulo || TEMPLATES[template],
      })
    }

    events.agentUsed(user.id, 'redator', 'unknown').catch(() => {})

    return NextResponse.json({ peca })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /redigir]', message)
    return NextResponse.json({ error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }, { status: 500 })
  }
}
