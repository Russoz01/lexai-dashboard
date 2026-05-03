import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON, withRetry } from '@/lib/api-utils'
import { DEMO_FALLBACKS, getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { createAgentStream } from '@/lib/agent-stream'
import { buildGroundingContext, validateCitations, groundingStats } from '@/lib/legal-grounding'
import { safeLog } from '@/lib/safe-log'
import { fireAndForget } from '@/lib/fire-and-forget'
import { validateOabContent } from '@/lib/oab-validator'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const REQUEST_TIMEOUT_MS = 90_000

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

    // Wave C5 fix: validar input ANTES de quota+rate-limit
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

    // Sliding-window rate limit (20 req/min per user per agent)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:redator`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'redator')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('redator') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

    // P0-1 (audit elite IA): grounding obrigatorio.
    // Redator gera peca processual citando STF/STJ/artigos — sem grounding,
    // hallucination de REsp na peca filed = sancao OAB. Pattern de pesquisar/contestador.
    const groundingQuery = instrucoes.slice(0, 2000)
    const grounding = buildGroundingContext(groundingQuery, { topK: 8 })
    const gstats = groundingStats(grounding)

    // Wave C5: streaming opt-in via ?stream=1
    const wantsStream = req.nextUrl.searchParams.get('stream') === '1'
    if (wantsStream) {
      const usuarioId = usuarioIdEarly
      return createAgentStream<Record<string, unknown>>({
        client,
        agente: 'redator',
        params: {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          system: [
            { type: 'text' as const, text: enhancedSystem, cache_control: { type: 'ephemeral' as const } },
            { type: 'text' as const, text: grounding.contextBlock, cache_control: { type: 'ephemeral' as const } },
            ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
          ],
          messages: [{ role: 'user', content: `Type of document: ${TEMPLATES[template]}\n\nFacts of the case:\n${instrucoes}` }],
        },
        fallback: { titulo: TEMPLATES[template], documento: '', referencias_legais: [], observacoes: ['Resposta nao estruturada'], tipo: template },
        demoFallback: DEMO_FALLBACKS.redator as Record<string, unknown>,
        wrapResult: (parsed) => ({ peca: parsed }),
        onPersist: async (parsed) => {
          if (usuarioId) {
            await supabase.from('historico').insert({
              usuario_id: usuarioId, agente: 'redator',
              mensagem_usuario: `Redigir: ${TEMPLATES[template]}`,
              resposta_agente: (parsed.titulo as string) || TEMPLATES[template],
            })
            const tituloOut = (parsed?.titulo as string) || TEMPLATES[template]
            fireAndForget(recordAgentMemory(supabase, usuarioId, {
              agente: 'redator',
              resumo: buildMemorySummary('redator', `${TEMPLATES[template]}: ${instrucoes.slice(0, 120)}`, tituloOut),
              fatos: [{ key: 'tipo', value: template }, { key: 'titulo', value: String(tituloOut).slice(0, 120) }],
              tags: extractMemoryTags('redator', template, instrucoes),
            }, { prefs }), 'recordAgentMemory:redator')
          }
          fireAndForget(events.agentUsed(user.id, 'redator', 'unknown'), 'events.agentUsed:redator')
        },
      })
    }

    // 90s hard cap — Anthropic Sonnet 4 com 8192 tokens leva ate ~60s.
    // Sem AbortController, lambda travada consome funcao-segundos ate
    // Vercel matar em 300s e usuario ve 504 sem mensagem util.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    let message: Anthropic.Messages.Message
    try {
      message = await withRetry(() => client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: [
          {
            type: 'text' as const,
            text: enhancedSystem,
            cache_control: { type: 'ephemeral' as const },
          },
          {
            type: 'text' as const,
            text: grounding.contextBlock,
            cache_control: { type: 'ephemeral' as const },
          },
          ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
        ],
        messages: [{ role: 'user', content: `Type of document: ${TEMPLATES[template]}\n\nFacts of the case:\n${instrucoes}` }],
      }, { signal: controller.signal }))
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const peca = parseAgentJSON<Record<string, unknown>>(
      responseText,
      { titulo: TEMPLATES[template], documento: responseText, referencias_legais: [], observacoes: ['Resposta nao estruturada'], tipo: template },
    )

    const usuarioId = usuarioIdEarly
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId, agente: 'redator',
        mensagem_usuario: `Redigir: ${TEMPLATES[template]}`,
        resposta_agente: peca.titulo || TEMPLATES[template],
      })
      const tituloOut3 = (peca.titulo as string) || TEMPLATES[template]
      fireAndForget(recordAgentMemory(supabase, usuarioId, {
        agente: 'redator',
        resumo: buildMemorySummary('redator', `${TEMPLATES[template]}: ${instrucoes.slice(0, 120)}`, tituloOut3),
        fatos: [{ key: 'tipo', value: template }, { key: 'titulo', value: String(tituloOut3).slice(0, 120) }],
        tags: extractMemoryTags('redator', template, instrucoes),
      }, { prefs }), 'recordAgentMemory:redator')
    }

    fireAndForget(events.agentUsed(user.id, 'redator', 'unknown'), 'events.agentUsed:redator')

    // Provimento 205/2021 OAB soft check — peça processual não é publicidade,
    // mas se modelo gerou trecho promocional inadvertido (ex: rodapé de
    // "consulte-nos pra garantir vitória"), opera vê warning. Não bloqueia.
    const oabBody = typeof peca.documento === 'string' ? peca.documento : ''
    const oabCheck = oabBody ? validateOabContent(oabBody) : null
    const oab_warnings = oabCheck && oabCheck.violations.length > 0
      ? oabCheck.violations.map(v => ({ rule: v.rule, severity: v.severity, motivo: v.motivo }))
      : undefined

    // P0-1 (audit elite IA): valida citacoes contra corpus + extrai fontes.
    // Texto bruto inclui o documento + referencias_legais; analisa ambos.
    const fullForValidation = `${oabBody}\n${Array.isArray(peca.referencias_legais) ? (peca.referencias_legais as unknown[]).join('\n') : ''}`
    const validation = validateCitations(fullForValidation)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /redigir] validation:', validation.stats)
    }

    return NextResponse.json({
      peca,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
      oab_warnings,
    })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const msg = err instanceof Error ? err.message : 'Erro interno'
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.error('[API /redigir]', errName, msg)
    }
    // Demo-mode fallback (Wave C5)
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      const fallback = getDemoFallback('redator', { reason: msg })
      return NextResponse.json({ peca: fallback })
    }
    if (errName === 'AbortError' || msg.toLowerCase().includes('aborted') || msg.toLowerCase().includes('timeout')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente instrucoes mais curtas.' }, { status: 504 })
    }
    if (err instanceof Error && (msg.includes('529') || msg.toLowerCase().includes('overloaded'))) {
      return NextResponse.json({
        error: 'Agente temporariamente sobrecarregado. Aguarde 30 segundos e tente novamente.',
        retry: true,
      }, { status: 503 })
    }
    return NextResponse.json(
      process.env.NODE_ENV === 'production'
        ? { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }
        : { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.', details: msg },
      { status: 500 }
    )
  }
}
