import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { buscarJurisprudenciaReal, isJusBrasilConfigured } from '@/lib/jusbrasil'
import { resolveUsuarioIdServer, safeError, parseAgentJSON } from '@/lib/api-utils'
import { getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { buildGroundingContext, validateCitations, WEB_SEARCH_TOOL, groundingStats } from '@/lib/legal-grounding'
import { safeLog } from '@/lib/safe-log'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Whitelist of accepted filter values — anything outside this list is coerced
// to the safe default so user input can never be injected into the prompt.
const VALID_TRIBUNAIS = [
  'Todos', 'STF', 'STJ', 'TST', 'TSE',
  'TRF 1ª', 'TRF 2ª', 'TRF 3ª', 'TRF 4ª', 'TRF 5ª',
  'TJSP', 'TJRJ', 'TJMG',
]
const VALID_AREAS = [
  'Todas', 'Civil', 'Penal', 'Trabalhista', 'Tributário',
  'Constitucional', 'Administrativo', 'Ambiental', 'Consumidor',
]
const VALID_PERIODOS = [
  'Qualquer período', 'Último mês', 'Último trimestre', 'Último ano', 'Últimos 5 anos',
]

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

    // Sliding-window rate limit (20 req/min per user per agent)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:pesquisador`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'pesquisador')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const body = await req.json().catch(() => ({}))
    const query = typeof body?.query === 'string' ? body.query : ''
    const tribunal = typeof body?.tribunal === 'string' ? body.tribunal : 'Todos'
    const area = typeof body?.area === 'string' ? body.area : 'Todas'
    const periodo = typeof body?.periodo === 'string' ? body.periodo : 'Qualquer período'

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Consulta muito curta.' }, { status: 400 })
    }
    if (query.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    // Enforce filter whitelist — anything outside the whitelist falls back to
    // the safe default, preventing prompt injection through the filter fields.
    const safeTribunal = VALID_TRIBUNAIS.includes(tribunal) ? tribunal : 'Todos'
    const safeArea = VALID_AREAS.includes(area) ? area : 'Todas'
    const safePeriodo = VALID_PERIODOS.includes(periodo) ? periodo : 'Qualquer período'

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const filtros = [
      safeTribunal !== 'Todos' ? `Tribunal: ${safeTribunal}` : null,
      safeArea !== 'Todas' ? `Area: ${safeArea}` : null,
      safePeriodo !== 'Qualquer período' ? `Period: ${safePeriodo}` : null,
    ].filter(Boolean).join('\n')

    const areaForGrounding = safeArea !== 'Todas' ? safeArea.toLowerCase() : undefined
    const grounding = buildGroundingContext(query, { area: areaForGrounding, topK: 10 })
    const gstats = groundingStats(grounding)

    const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('pesquisador') + SYSTEM_PROMPT + buildAntiHallucinationFooter()
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /pesquisar] grounding:', gstats)
    }

    // Wave C5 fix: AbortController 90s — Anthropic + WEB_SEARCH_TOOL pode
    // demorar e sem hard cap a lambda penduraria 300s.
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 90_000)
    let message: Anthropic.Messages.Message
    try {
      message = await client.messages.create({
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
            // Wave C5 fix: cache_control no grounding também
            cache_control: { type: 'ephemeral' as const },
          },
          ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
        ],
        tools: [WEB_SEARCH_TOOL],
        messages: [{ role: 'user', content: `Research topic: ${query}${filtros ? `\n\nFilters:\n${filtros}` : ''}` }],
      }, { signal: abortController.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const pesquisa = parseAgentJSON<Record<string, unknown>>(
      responseText,
      { enquadramento: responseText, erro_parse: true },
    )

    // Enrich with real JusBrasil results when configured — degrades to AI results otherwise
    if (isJusBrasilConfigured()) {
      const realResults = await buscarJurisprudenciaReal(query, safeTribunal).catch(() => [])
      if (realResults.length > 0) {
        pesquisa.jurisprudencia_real = realResults
        pesquisa.fonte = 'jusbrasil_api'
      }
    }

    const usuarioId = usuarioIdEarly
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId, agente: 'pesquisador',
        mensagem_usuario: `Pesquisa: ${query}`,
        resposta_agente: (pesquisa.enquadramento as string)?.slice(0, 200) || 'Pesquisa realizada',
      })
      const enqOut = (pesquisa.enquadramento as string)?.slice(0, 160) || 'pesquisa realizada'
      recordAgentMemory(supabase, usuarioId, {
        agente: 'pesquisador',
        resumo: buildMemorySummary('pesquisador', query, enqOut),
        fatos: [
          ...(safeArea !== 'Todas' ? [{ key: 'area', value: safeArea }] : []),
          ...(safeTribunal !== 'Todos' ? [{ key: 'tribunal', value: safeTribunal }] : []),
        ],
        tags: extractMemoryTags('pesquisador', safeArea !== 'Todas' ? safeArea : undefined, query),
      }, { prefs }).catch(() => {})
    }

    const validation = validateCitations(responseText)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /pesquisar] validation:', validation.stats, 'warnings:', validation.warnings.length)
    }

    events.agentUsed(user.id, 'pesquisador', 'unknown').catch(() => {})

    return NextResponse.json({
      pesquisa,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      const fallback = getDemoFallback('pesquisador', { reason: err instanceof Error ? err.message : String(err) })
      // Wrap pra match shape de sucesso ({pesquisa, fontes, grounding_stats})
      return NextResponse.json({ pesquisa: fallback, fontes: [], grounding_stats: {} })
    }
    return safeError('pesquisar', err)
  }
}
