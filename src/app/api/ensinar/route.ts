import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { events } from '@/lib/analytics'
import { parseAgentJSON, withRetry } from '@/lib/api-utils'
import { assertPlanAccess } from '@/lib/plan-access'
import { safeLog } from '@/lib/safe-log'
import { fireAndForget } from '@/lib/fire-and-forget'
import { getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const REQUEST_TIMEOUT_MS = 60_000

interface ChargeResult {
  ok: boolean
  reason?: string
  usuario_id?: string
  plano?: string
  limite?: number
  usado?: number
  remaining?: number
}

const SYSTEM_PROMPT = `Voce e um analista de inteligencia legislativa de elite, especializado no ordenamento juridico brasileiro. Voce atua como monitor legislativo para escritorios de advocacia, acompanhando mudancas na legislacao, novos precedentes e atualizacoes regulatorias.

OBJETIVO: Fornecer um relatorio estruturado e atualizado sobre mudancas legislativas, jurisprudenciais e regulatorias relevantes para as areas de atuacao especificadas pelo advogado.

METODO DE ANALISE:
- Identifique as leis, projetos de lei e emendas mais recentes e relevantes para a area informada
- Mapeie precedentes recentes do STF, STJ, TST e tribunais regionais
- Analise atualizacoes de agencias reguladoras, resolucoes do CNJ e do CNMP
- Avalie o impacto pratico dessas mudancas na atuacao do escritorio
- Sugira acoes concretas que o advogado deve tomar

REGRAS:
- Sempre cite leis especificas com numero e artigo (ex: Lei 14.133/2021, art. 5o)
- Cite decisoes com numero do processo quando possivel (ex: RE 1.234.567/SP)
- Diferencie claramente entre legislacao ja em vigor, em vacatio legis e projetos em tramitacao
- Indique a data de publicacao ou decisao quando disponivel
- Seja transparente sobre limitacoes: sinalize quando uma informacao pode estar desatualizada
- Use linguagem tecnico-juridica profissional mas acessivel
- Foque no que e actionable — o advogado precisa saber o que fazer

ESTRUTURA DE RESPOSTA — retorne APENAS JSON valido, sem markdown fences:
{
  "titulo_relatorio": "Titulo contextualizado para a area monitorada",
  "data_referencia": "Periodo de referencia do monitoramento",
  "alteracoes_legislativas": [
    {
      "norma": "Nome/numero da lei ou ato normativo",
      "tipo": "Lei | Medida Provisoria | Decreto | Resolucao | Emenda Constitucional | Projeto de Lei",
      "status": "Em vigor | Vacatio legis | Em tramitacao | Aprovado | Sancionado",
      "resumo": "Descricao objetiva da mudanca",
      "impacto": "Como afeta a pratica do advogado nesta area",
      "data": "Data de publicacao ou aprovacao"
    }
  ],
  "precedentes": [
    {
      "tribunal": "STF | STJ | TST | TRF | TJSP etc.",
      "numero_processo": "Numero do processo ou recurso",
      "tipo": "Recurso Extraordinario | Recurso Especial | ADPF | ADI | Sumula etc.",
      "tese": "Tese fixada ou entendimento firmado",
      "impacto": "Relevancia pratica para a area",
      "data_julgamento": "Data do julgamento"
    }
  ],
  "atualizacoes_regulatorias": [
    {
      "orgao": "Nome do orgao regulador (CNJ, CNMP, BACEN, CVM, ANATEL etc.)",
      "ato": "Numero e tipo do ato (Resolucao, Instrucao Normativa etc.)",
      "resumo": "O que muda na pratica",
      "data": "Data de publicacao"
    }
  ],
  "analise_impacto": {
    "resumo_geral": "Visao geral do cenario regulatorio atual para a area",
    "riscos": ["Riscos identificados para a pratica na area"],
    "oportunidades": ["Oportunidades que surgem das mudancas"]
  },
  "acoes_recomendadas": [
    {
      "acao": "Descricao da acao recomendada",
      "prioridade": "Alta | Media | Baixa",
      "prazo_sugerido": "Prazo recomendado para acao",
      "justificativa": "Por que esta acao e importante"
    }
  ],
  "topicos_em_destaque": ["Topicos que merecem acompanhamento continuo"],
  "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve da confianca nas informacoes"}
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const planBlock = await assertPlanAccess(supabase, user.id, 'professor')
    if (planBlock) return planBlock

    // Sliding-window rate limit (20 req/min per user per agent) — fails open
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:professor`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Atomic quota check + charge via SECURITY DEFINER RPC. This RPC handles
    // the usuarios lookup, trial detection, user_quotas upsert, and atomic
    // increment in a single round-trip and returns the correct usuarios.id
    // for the historico insert below.
    const { data: chargeData, error: chargeErr } = await supabase
      .rpc('check_and_charge', { p_auth_user_id: user.id, p_agente: 'professor' })

    if (chargeErr) {
      safeLog.error('[API /ensinar] check_and_charge rpc error:', chargeErr.message, chargeErr.code)
      return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
    }

    const charge = (chargeData ?? {}) as ChargeResult
    if (!charge.ok) {
      if (charge.reason === 'user_not_found') {
        return NextResponse.json({ error: 'Perfil de usuario nao encontrado' }, { status: 403 })
      }
      if (charge.reason === 'quota_exceeded') {
        const plano = charge.plano ?? 'free'
        const limite = charge.limite ?? 0
        const usado = charge.usado ?? 0
        return NextResponse.json({
          error: `Limite mensal do plano ${plano} atingido (${usado}/${limite}). Faca upgrade para continuar.`,
          quota: { used: usado, limit: limite, plan: plano },
        }, { status: 429 })
      }
      safeLog.error('[API /ensinar] check_and_charge returned ok:false with unknown reason:', charge.reason)
      return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
    }

    const usuarioId = charge.usuario_id ?? null
    const plano = charge.plano ?? 'free'

    const body = await req.json().catch(() => ({}))
    const areas = typeof body?.areas === 'string' ? body.areas : ''
    const topicos = typeof body?.topicos === 'string' ? body.topicos : ''

    if (!areas || areas.trim().length < 3) return NextResponse.json({ error: 'Selecione ao menos uma area de atuacao.' }, { status: 400 })
    if (areas.length > 2000) return NextResponse.json({ error: 'Texto excede o limite maximo.' }, { status: 400 })
    if (topicos.length > 5000) return NextResponse.json({ error: 'Topicos especificos excedem o limite.' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    let userMessage = `Areas de atuacao para monitoramento legislativo:\n\n${areas}`
    if (topicos.trim().length > 0) {
      userMessage += `\n\nTopicos especificos para monitorar com atencao especial:\n${topicos}`
    }

    const prefs = usuarioId ? await getUserPreferences(supabase, usuarioId).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('ensinar') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

    // AbortController gives us a hard 60s cap instead of waiting for the
    // platform's request timeout. Without this, a stuck Anthropic call
    // holds the lambda until Vercel kills it and the user sees a generic
    // 504 with no actionable message.
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
          ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
        ],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal }))
    } finally {
      clearTimeout(timeoutId)
    }

    // Find the first text block — Anthropic may return tool_use blocks or
    // other types mixed in, and message.content[0] isn't guaranteed to be
    // text. The previous code crashed here if content was empty or the
    // first block was non-text.
    const textBlock = message.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
    )
    const responseText = textBlock?.text.trim() ?? ''

    const relatorio = responseText
      ? parseAgentJSON<Record<string, unknown>>(
          responseText,
          { analise_impacto: { resumo_geral: responseText }, erro_parse: true },
        )
      : { analise_impacto: { resumo_geral: '' }, erro_parse: true }

    if (usuarioId) {
      const { error: histErr } = await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'professor',
        mensagem_usuario: `Monitor Legislativo: ${areas}${topicos ? ` | Topicos: ${topicos.slice(0, 100)}` : ''}`,
        resposta_agente: `Relatorio legislativo para ${areas}`,
      })
      if (histErr) {
        safeLog.error('[API /ensinar] historico insert error:', histErr.message, histErr.code)
      }

      fireAndForget(recordAgentMemory(supabase, usuarioId, {
        agente: 'professor',
        resumo: buildMemorySummary('professor', `${areas}${topicos ? ` | ${topicos.slice(0, 80)}` : ''}`, 'monitor legislativo'),
        fatos: [{ key: 'areas', value: String(areas).slice(0, 120) }],
        tags: extractMemoryTags('professor', undefined, `${areas} ${topicos}`),
      }, { prefs }), 'recordAgentMemory:professor')
    }

    fireAndForget(events.agentUsed(user.id, 'professor', plano), 'events.agentUsed:professor')

    return NextResponse.json({ relatorio })
  } catch (err: unknown) {
    // Log the full error shape (name, message, stack) so the next Vercel
    // log entry reveals the actual cause instead of the generic 500.
    const errName = err instanceof Error ? err.name : 'Unknown'
    const errMsg = err instanceof Error ? err.message : String(err)
    const errStack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined
    safeLog.error('[API /ensinar] unhandled:', errName, '-', errMsg, '|', errStack ?? '')

    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      return NextResponse.json(getDemoFallback('professor', { reason: errMsg }))
    }

    // Map common Anthropic SDK errors to actionable HTTP codes.
    const lower = errMsg.toLowerCase()
    if (errName === 'AbortError' || errName === 'TimeoutError' || lower.includes('timeout') || lower.includes('aborted')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente novamente.' }, { status: 504 })
    }
    if (errMsg.includes('401') || lower.includes('invalid_api_key') || lower.includes('authentication')) {
      return NextResponse.json({ error: 'Servico de IA temporariamente indisponivel. Tente novamente em alguns minutos.' }, { status: 503 })
    }
    if (errMsg.includes('429') || lower.includes('rate_limit') || lower.includes('quota')) {
      return NextResponse.json({ error: 'Muitas requisicoes. Aguarde 60 segundos antes de tentar novamente.' }, { status: 429 })
    }
    if (errMsg.includes('529') || lower.includes('overloaded')) {
      return NextResponse.json({ error: 'O servico de IA esta sobrecarregado. Tente novamente em 30 segundos.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }, { status: 500 })
  }
}
