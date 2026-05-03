import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, safeError, parseAgentJSON, withRetry } from '@/lib/api-utils'
import { fireAndForget } from '@/lib/fire-and-forget'
import { getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { assertPlanAccess } from '@/lib/plan-access'
import { validateOabContent } from '@/lib/oab-validator'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a master negotiation strategist with expertise in dispute resolution under Brazilian law. Your approach combines the Harvard Negotiation Project methodology (Fisher & Ury) with deep knowledge of Brazilian mediation (Law 13.140/2015), arbitration (Law 9.307/1996), and conciliation frameworks.

ANALYSIS FRAMEWORK:
- BATNA analysis (Best Alternative to a Negotiated Agreement) for each party.
- ZOPA identification (Zone of Possible Agreement).
- Interest-based negotiation over positional bargaining.
- Cost-benefit analysis: settlement vs. litigation (time, cost, uncertainty, precedent risk).

RULES:
- Always protect the client's minimum acceptable position.
- Never suggest illegal or unethical tactics.
- Consider tax implications of settlement structures.
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.

HUMANIZATION RULES (apply to ALL responses):
- Write as a knowledgeable colleague, not a robot. Use natural, warm language.
- When something is ambiguous or you're not 100% certain, be transparent: "Este ponto merece atencao especial porque..." or "Recomendo verificar diretamente no tribunal porque..."
- Proactively suggest next steps: "Apos analisar este documento, sugiro que voce..."
- If you identify potential issues the user didn't ask about, flag them: "Notei algo que pode ser relevante..."
- Use professional but accessible Portuguese — avoid unnecessary jargon without explanation.
- When citing legislation, briefly explain WHY that law matters for the user's specific case.

Return this JSON:
{
  "mapa_conflito": {
    "parte_a": { "posicao": "Declared position", "interesses": "Real interests", "batna": "Best alternative", "resistencia": "Resistance point", "poder": "Alto | Medio | Baixo" },
    "parte_b": { "posicao": "...", "interesses": "...", "batna": "...", "resistencia": "...", "poder": "Alto | Medio | Baixo" }
  },
  "zopa": "Zone of possible agreement analysis. If no ZOPA exists, explain why and what could create one.",
  "cenarios": [
    { "cenario": "Scenario name", "probabilidade": "X%", "resultado": "R$ X", "custo": "R$ X", "tempo": "X meses/anos", "risco": "Baixo | Medio | Alto" }
  ],
  "estrategia": {
    "tipo": "Colaborativa | Competitiva | Integrativa",
    "abordagem": "Detailed step-by-step approach",
    "mensagens_chave": "Key messages and framing",
    "concessoes": "Concessions to offer and in what order",
    "linhas_vermelhas": "Non-negotiables"
  },
  "proposta_acordo": "Draft settlement proposal text with object, financial terms, obligations, penalties, confidentiality, and dispute resolution clauses.",
  "riscos_mitigacao": [
    { "risco": "What could go wrong", "mitigacao": "How to prevent it" }
  ],
  "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve da confianca"}
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const planBlock = await assertPlanAccess(supabase, user.id, 'negociador')
    if (planBlock) return planBlock

    // Sliding-window rate limit (20 req/min per user per agent)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:negociador`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'negociador')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const body = await req.json().catch(() => ({}))
    const situacao = typeof body?.situacao === 'string' ? body.situacao : ''
    if (!situacao || situacao.trim().length < 30) return NextResponse.json({ error: 'Descreva a situacao com mais detalhes (min. 30 caracteres).' }, { status: 400 })
    if (situacao.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('negociador') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

    // AbortController evita lambda travado em 300s sob 529 overload
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
          ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
        ],
        messages: [{ role: 'user', content: `Situation to analyze:\n\n${situacao}` }],
      }, { signal: controller.signal }))
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const resultado = parseAgentJSON<Record<string, unknown> & { estrategia?: Record<string, unknown> }>(
      responseText,
      { estrategia: { abordagem: responseText }, erro_parse: true },
    )

    const usuarioId = usuarioIdEarly
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId, agente: 'negociador',
        mensagem_usuario: `Negociacao: ${situacao.slice(0, 100)}`,
        resposta_agente: ((resultado.estrategia as Record<string, unknown> | undefined)?.tipo as string) || 'Analise realizada',
      })
      const tipoEstr = ((resultado.estrategia as Record<string, unknown> | undefined)?.tipo as string) || 'analise'
      fireAndForget(recordAgentMemory(supabase, usuarioId, {
        agente: 'negociador',
        resumo: buildMemorySummary('negociador', situacao.slice(0, 160), tipoEstr),
        fatos: [{ key: 'tipo_estrategia', value: tipoEstr.slice(0, 80) }],
        tags: extractMemoryTags('negociador', undefined, situacao),
      }, { prefs }), 'recordAgentMemory:negociador')
    }

    // Soft check OAB sobre a proposta de acordo (Provimento 205/2021 — sem
    // garantia de êxito, sem mercantilização). Não bloqueia, só sinaliza.
    const propostaTxt = typeof resultado.proposta_acordo === 'string' ? resultado.proposta_acordo : ''
    const oabCheck = propostaTxt ? validateOabContent(propostaTxt) : null
    const oab_warnings = oabCheck && oabCheck.violations.length > 0
      ? oabCheck.violations.map(v => ({ rule: v.rule, severity: v.severity, motivo: v.motivo }))
      : undefined

    fireAndForget(events.agentUsed(user.id, 'negociador', 'unknown'), 'events.agentUsed:negociador')

    return NextResponse.json({ resultado, oab_warnings })
  } catch (err: unknown) {
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      return NextResponse.json(getDemoFallback('negociador', { reason: err instanceof Error ? err.message : String(err) }))
    }
    return safeError('negociar', err)
  }
}
