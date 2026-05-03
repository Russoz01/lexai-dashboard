import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, safeError, parseAgentJSON, withRetry } from '@/lib/api-utils'
import { DEMO_FALLBACKS, getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { fireAndForget } from '@/lib/fire-and-forget'
import { assertPlanAccess } from '@/lib/plan-access'
import { createAgentStream } from '@/lib/agent-stream'
import { buildGroundingContext, validateCitations, groundingStats } from '@/lib/legal-grounding'
import { safeLog } from '@/lib/safe-log'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const TIPOS_RECURSO: Record<string, string> = {
  apelacao: 'Apelacao (Art. 1.009 CPC)',
  agravo_instrumento: 'Agravo de Instrumento (Art. 1.015 CPC)',
  agravo_interno: 'Agravo Interno (Art. 1.021 CPC)',
  embargos_declaracao: 'Embargos de Declaracao (Art. 1.022 CPC)',
  recurso_especial: 'Recurso Especial (Art. 105 III CF)',
  recurso_extraordinario: 'Recurso Extraordinario (Art. 102 III CF)',
}

const SYSTEM_PROMPT = `You are an elite Brazilian appellate attorney with 20+ years before superior courts (STF, STJ, TST). You master the CPC/2015 recurso system, repetitivos (Art. 1.036 CPC), IRDR, and repercussao geral.

METHODOLOGY:
1. Analyze the decision being challenged.
2. Establish cabimento (adequacy, timeliness, preparo, legitimidade, interesse recursal).
3. For RE/REsp: demonstrate specifically the violated federal/constitutional norm and prequestionamento.
4. Develop razoes with clear structure: ratio decidendi errors, legal violations, jurisprudential divergences.
5. Cite legislation, sumulas, and real STF/STJ jurisprudence with Court/Case/Justice/Date.
6. Formulate specific pedidos.

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Use [INFORMACAO A COMPLETAR] for missing data.
- Never invent cases. Be transparent about weak points.

Return exactly this JSON:
{
  "recurso": {
    "titulo": "Recurso type title",
    "tipo_recurso": "recurso type key",
    "cabimento": {
      "fundamento_legal": "Art. X CPC or CF",
      "tempestividade": "Deadline analysis",
      "preparo": "Payment/exemption rule",
      "legitimidade": "Who can file",
      "sintese": "Why this is the correct recurso"
    },
    "prequestionamento": "Prequestionamento analysis when applicable (REsp/RE). Empty string if not applicable.",
    "razoes": {
      "sintese_do_julgado": "Summary of the decision being challenged",
      "fundamentos_de_reforma": [
        { "ponto": "Error name", "argumentacao": "Full argument paragraph", "fundamento_legal": "Art. X", "jurisprudencia": "Court, case, Rel, date" }
      ],
      "divergencia_jurisprudencial": "For REsp: demonstrate divergence with cited precedents. Empty otherwise."
    },
    "pedidos": ["Specific request 1", "Specific request 2"],
    "fechamento": "City/date/signature with [INFORMACAO A COMPLETAR]",
    "confianca": {"nivel": "alta | media | baixa", "nota": "short justification"}
  }
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Plan-based access (Wave R1 audit): Recursos é Escritório+
    const planBlock = await assertPlanAccess(supabase, user.id, 'recursos')
    if (planBlock) return planBlock

    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:recursos`)
    if (!rl.ok) return rateLimitResponse(rl)

    const quota = await checkAndIncrementQuota(supabase, user.id, 'recursos')
    if (!quota.ok && quota.response) return quota.response

    const body = await req.json().catch(() => ({}))
    const tipo = typeof body?.tipo === 'string' ? body.tipo : ''
    const decisao = typeof body?.decisao === 'string' ? body.decisao : ''

    if (!tipo || !TIPOS_RECURSO[tipo]) {
      return NextResponse.json({ error: 'Tipo de recurso invalido.' }, { status: 400 })
    }
    if (!decisao || decisao.trim().length < 50) {
      return NextResponse.json({ error: 'Descreva a decisao recorrida (minimo 50 caracteres).' }, { status: 400 })
    }
    if (decisao.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const userMessage = `Tipo de recurso: ${TIPOS_RECURSO[tipo]}\n\nDecisao recorrida e contexto processual:\n${decisao}`

    const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('recursos') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

    // P0-1 (audit elite IA): grounding obrigatorio.
    // Recurso a tribunal superior cita REsp/RE — sem grounding, jurisprudencia
    // hallucinated chega na peca filed. Sancao OAB se descoberto.
    const grounding = buildGroundingContext(decisao.slice(0, 2000), { topK: 8 })
    const gstats = groundingStats(grounding)

    // P1-2 (audit elite IA): streaming opt-in via ?stream=1.
    const wantsStream = req.nextUrl.searchParams.get('stream') === '1'
    if (wantsStream) {
      const usuarioId = usuarioIdEarly
      return createAgentStream<Record<string, unknown>>({
        client,
        agente: 'recursos',
        params: {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          system: [
            { type: 'text' as const, text: enhancedSystem, cache_control: { type: 'ephemeral' as const } },
            { type: 'text' as const, text: grounding.contextBlock, cache_control: { type: 'ephemeral' as const } },
            ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
          ],
          messages: [{ role: 'user', content: userMessage }],
        },
        fallback: { recurso: { titulo: TIPOS_RECURSO[tipo], razoes: { sintese_do_julgado: '' } } },
        demoFallback: DEMO_FALLBACKS.recursos as Record<string, unknown>,
        wrapResult: (parsed) => {
          const r = ((parsed as Record<string, unknown>)?.recurso ?? parsed) as Record<string, unknown>
          return { recurso: r }
        },
        onPersist: async (parsed) => {
          const r = ((parsed as Record<string, unknown>)?.recurso ?? parsed) as Record<string, unknown>
          if (usuarioId) {
            const tituloR = (r?.titulo as string) || TIPOS_RECURSO[tipo]
            await supabase.from('historico').insert({
              usuario_id: usuarioId,
              agente: 'recursos',
              mensagem_usuario: `Recurso: ${TIPOS_RECURSO[tipo]}`,
              resposta_agente: tituloR,
            })
            fireAndForget(recordAgentMemory(supabase, usuarioId, {
              agente: 'recursos',
              resumo: buildMemorySummary('recursos', `${TIPOS_RECURSO[tipo]}: ${decisao.slice(0, 120)}`, tituloR),
              fatos: [{ key: 'tipo', value: tipo }],
              tags: extractMemoryTags('recursos', tipo, decisao),
            }, { prefs }), 'recordAgentMemory:recursos')
          }
          fireAndForget(events.agentUsed(user.id, 'recursos', 'unknown'), 'events.agentUsed:recursos')
        },
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90_000)
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
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal }))
    } finally {
      clearTimeout(timeoutId)
    }

    const responseText = message.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()
    const parsed = parseAgentJSON<Record<string, unknown> & { recurso?: Record<string, unknown> }>(
      responseText,
      { recurso: { titulo: TIPOS_RECURSO[tipo], razoes: { sintese_do_julgado: responseText } } },
    )
    const recurso = (parsed?.recurso ?? parsed) as Record<string, unknown>
    const tituloRecurso = (recurso?.titulo as string) || TIPOS_RECURSO[tipo]

    const usuarioId = usuarioIdEarly
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'recursos',
        mensagem_usuario: `Recurso: ${TIPOS_RECURSO[tipo]}`,
        resposta_agente: tituloRecurso,
      })
      fireAndForget(recordAgentMemory(supabase, usuarioId, {
        agente: 'recursos',
        resumo: buildMemorySummary('recursos', `${TIPOS_RECURSO[tipo]}: ${decisao.slice(0, 120)}`, tituloRecurso),
        fatos: [{ key: 'tipo', value: tipo }],
        tags: extractMemoryTags('recursos', tipo, decisao),
      }, { prefs }), 'recordAgentMemory:recursos')
    }

    const validation = validateCitations(responseText)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /recursos] validation:', validation.stats)
    }

    fireAndForget(events.agentUsed(user.id, 'recursos', 'unknown'), 'events.agentUsed:recursos')
    return NextResponse.json({
      recurso,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      return NextResponse.json(getDemoFallback('recursos', { reason: err instanceof Error ? err.message : String(err) }))
    }
    return safeError('recursos', err)
  }
}
