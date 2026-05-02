import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, safeError, parseAgentJSON } from '@/lib/api-utils'
import { DEMO_FALLBACKS, getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { createAgentStream } from '@/lib/agent-stream'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a senior legal analyst with 20+ years of experience in Brazilian law, specializing in document synthesis and risk assessment. You operate at the level of a federal appellate judge reviewing case files.

STRICT RULES:
- Base your analysis EXCLUSIVELY on the provided document. Never infer, assume, or fabricate information not present in the source material.
- If a section does not apply, write "N/A".
- Never omit deadlines, monetary values, penalty clauses, or conditions.
- Flag any ambiguity, missing information, or potential drafting errors.
- ALL OUTPUT MUST BE IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences, no extra text.

DEADLINE EXTRACTION RULES (prazos array):
- For each deadline (prazo), attempt to extract an absolute ISO date (YYYY-MM-DD) into "data_iso". If only a relative period is given (e.g. "30 dias apos a assinatura", "dentro de 15 dias"), set "data_iso" to null but include the relative text in "data".
- If the document contains an explicit calendar date (e.g. "ate 15 de maio de 2026", "05/06/2026", "2026-06-05"), convert it to YYYY-MM-DD and place it in "data_iso".
- Always classify "prioridade" as "alta" for deadlines under 15 days OR with critical consequences (perda de direito, preclusao, multa alta, rescisao), "media" for deadlines between 15 and 60 days, "baixa" for anything longer or without critical consequences.
- Never omit a deadline even when "data_iso" is null — relative deadlines still matter for the user.

HUMANIZATION RULES (apply to ALL responses):
- Write as a knowledgeable colleague, not a robot. Use natural, warm language.
- When something is ambiguous or you're not 100% certain, be transparent: "Este ponto merece atencao especial porque..." or "Recomendo verificar diretamente no tribunal porque..."
- Proactively suggest next steps: "Apos analisar este documento, sugiro que voce..."
- If you identify potential issues the user didn't ask about, flag them: "Notei algo que pode ser relevante..."
- Use professional but accessible Portuguese — avoid unnecessary jargon without explanation.
- When citing legislation, briefly explain WHY that law matters for the user's specific case.

Return this exact JSON structure:
{
  "classificacao": {
    "tipo": "Type of document",
    "data": "Date if found or N/A",
    "jurisdicao": "Jurisdiction if applicable or N/A",
    "protocolo": "Registration number if found or N/A"
  },
  "partes": [
    { "nome": "Name", "qualificacao": "Role (Autor, Reu, etc.)", "documento": "CPF/CNPJ if found or N/A", "representacao": "Legal representation if found or N/A" }
  ],
  "objeto": "One precise paragraph defining the core subject matter, legal nature, and scope",
  "pontos_chave": [
    "Each point must reference the specific clause/article number. Minimum 5 points."
  ],
  "obrigacoes": [
    { "parte": "Party name", "obrigacao": "Description", "clausula": "Clause/Article", "prazo": "Deadline", "penalidade": "Penalty for non-compliance" }
  ],
  "valores": [
    { "descricao": "Description", "valor": "Amount", "pagamento": "Payment method", "reajuste": "Adjustment rule", "base_legal": "Legal basis" }
  ],
  "prazos": [
    { "evento": "Event", "data": "Date/Deadline (verbatim text from document)", "data_iso": "YYYY-MM-DD or null if no absolute date", "consequencia": "Consequence of non-compliance", "clausula": "Clause", "prioridade": "alta | media | baixa" }
  ],
  "fundamentacao": ["Art. X of Law Y/YYYY - brief description of relevance"],
  "riscos": [
    { "descricao": "Issue description", "gravidade": "CRITICO | ALTO | MODERADO | BAIXO", "clausula": "Related clause", "consequencia": "Potential consequences", "mitigacao": "Suggested mitigation" }
  ],
  "conclusao": "Strategic assessment: what this document means for the client, recommended next steps, and key decisions required.",
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

    // Wave C5 fix: validar input ANTES de quota+rate-limit.
    // Antes, payload inválido queimava quota legítima (ataque trivial).
    const body = await req.json().catch(() => ({}))
    const texto = typeof body?.texto === 'string' ? body.texto : ''
    if (!texto || texto.trim().length < 50) {
      return NextResponse.json({ error: 'Texto muito curto. Forneca pelo menos 50 caracteres.' }, { status: 400 })
    }
    if (texto.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    // Sliding-window rate limit (20 req/min per user per agent)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:resumidor`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'resumidor')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    // Wave C5: streaming opt-in via ?stream=1. Frontend lê NDJSON e mostra
    // chars recebidos em tempo real. Default mantém comportamento legacy.
    const wantsStream = req.nextUrl.searchParams.get('stream') === '1'
    if (wantsStream) {
      const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
      return createAgentStream<Record<string, unknown>>({
        client,
        agente: 'resumidor',
        params: {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 8192,
          system: [
            { type: 'text' as const, text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' as const } },
          ],
          messages: [{ role: 'user', content: `Document to analyze:\n\n${texto}` }],
        },
        fallback: { resumo: '', erro_parse: true },
        demoFallback: DEMO_FALLBACKS.resumidor as Record<string, unknown>,
        wrapResult: (parsed) => ({ analise: parsed }),
        onPersist: async (parsed) => {
          if (usuarioId) {
            await supabase.from('historico').insert({
              usuario_id: usuarioId,
              agente: 'resumidor',
              mensagem_usuario: `Analise: ${texto.slice(0, 100)}`,
              resposta_agente: typeof parsed.objeto === 'string' ? parsed.objeto.slice(0, 200) : 'Documento analisado',
            })
          }
          events.agentUsed(user.id, 'resumidor', 'unknown').catch(() => {})
        },
      })
    }

    // AbortController evita lambda travado em 300s sob 529 overload
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90_000)
    let message: Anthropic.Messages.Message
    try {
      message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        system: [
          {
            type: 'text' as const,
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' as const },
          },
        ],
        messages: [{ role: 'user', content: `Document to analyze:\n\n${texto}` }],
      }, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const analise = parseAgentJSON<Record<string, unknown>>(
      responseText,
      { resumo: responseText, erro_parse: true },
    )

    // Save to historico (was missing — only agent without it)
    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'resumidor',
        mensagem_usuario: `Analise: ${texto.slice(0, 100)}`,
        resposta_agente: typeof analise.objeto === 'string' ? analise.objeto.slice(0, 200) : 'Documento analisado',
      })
    }

    events.agentUsed(user.id, 'resumidor', 'unknown').catch(() => {})

    return NextResponse.json({ analise })
  } catch (err: unknown) {
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      const fallback = getDemoFallback('resumidor', { reason: err instanceof Error ? err.message : String(err) })
      return NextResponse.json({ analise: fallback })
    }
    return safeError('resumir', err)
  }
}
