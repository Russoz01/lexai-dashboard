import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { userCanAccessAgent, getUpgradeMessage, getMinPlanFor } from '@/lib/plan-access'
import { safeLog } from '@/lib/safe-log'

/* ═════════════════════════════════════════════════════════════
 * withAgentAuth — v10.10 agent route guard
 * ─────────────────────────────────────────────────────────────
 * Uniforme em TODOS os 27 agentes Pralvex: auth, rate-limit, quota,
 * error handling (529/overloaded) num só wrapper. O handler do
 * agente recebe `{ req, supabase, user, agentSlug }` e devolve a
 * Response do negócio.
 *
 * Antes (30 linhas de boilerplate por rota):
 *   export async function POST(req) { try { auth, key-check, rate-limit,
 *   quota, validate, claude-call, history-insert, events, catch 529... } }
 *
 * Depois (2 linhas de boilerplate + 100% do código é negócio):
 *   export const POST = withAgentAuth('calculador', async ({ req, supabase, user }) => {
 *     // só a lógica do agente
 *     return NextResponse.json({ resultado })
 *   })
 *
 * Benefícios:
 *  - Rate-limit + quota passam a ser impossíveis de esquecer
 *  - Error shape idêntico entre agentes (melhor UX no front)
 *  - Detecção central de 529/overloaded do Anthropic
 *  - Audit log (agente, user, ts) via eventos de telemetria (TODO)
 *
 * Fail-open em Supabase: rate-limit já é fail-open no checkRateLimit.
 * ═════════════════════════════════════════════════════════════ */

export interface AgentAuthContext {
  req: NextRequest
  supabase: SupabaseClient
  user: User
  agentSlug: string
}

export type AgentHandler = (ctx: AgentAuthContext) => Promise<Response>

interface WithAgentAuthOptions {
  /** Pula a checagem de quota (default: false). Útil para consultas que só leem. */
  skipQuota?: boolean
  /** Pula rate-limit (default: false). Não recomendado — só para rotas internas. */
  skipRateLimit?: boolean
  /** Pula a checagem de ANTHROPIC_API_KEY (default: false). Útil pra agentes que não chamam LLM. */
  skipLLMKeyCheck?: boolean
  /** Pula plan-access check (default: false). Útil pra rotas free-tier (chat router, ex). */
  skipPlanCheck?: boolean
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

/**
 * Empacota um handler de agente com auth + rate-limit + quota + error handling.
 *
 * @param agentSlug  Chave canônica do agente (ex.: 'calculador', 'audiencia')
 *                   — usada pra rate-limit key, quota bucket e logs.
 * @param handler    Lógica de negócio. Recebe contexto com supabase/user já prontos.
 * @param options    Flags para pular etapas (raramente necessário).
 */
export function withAgentAuth(
  agentSlug: string,
  handler: AgentHandler,
  options: WithAgentAuthOptions = {},
) {
  return async function POST(req: NextRequest): Promise<Response> {
    try {
      const supabase = await createClient()

      // 1) Auth — Supabase SSR cookie
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
      }

      // 2) LLM key present
      if (!options.skipLLMKeyCheck && !ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })
      }

      // 3) Plan-based access check (Wave R1 audit fix)
      // Cada plano libera um subset distinto de agentes. Solo R$599 só
      // tem 8 essenciais; Firma R$1.459 libera todos 27. Sem isso,
      // pricing era cosmético — backend liberava qualquer agente.
      if (!options.skipPlanCheck) {
        const { data: planoRow } = await supabase
          .from('usuarios')
          .select('plano')
          .eq('auth_user_id', user.id)
          .maybeSingle()
        const plano = planoRow?.plano as string | undefined
        if (!userCanAccessAgent(plano, agentSlug)) {
          const minPlan = getMinPlanFor(agentSlug)
          return NextResponse.json(
            {
              error: getUpgradeMessage(agentSlug),
              code: 'plan_upgrade_required',
              required_plan: minPlan,
              current_plan: plano || 'unknown',
            },
            { status: 403 },
          )
        }
      }

      // 4) Rate limit — 20 req/min/user/agent (sliding window via Supabase)
      if (!options.skipRateLimit) {
        const rl = await checkRateLimit(supabase, `user:${user.id}:${agentSlug}`)
        if (!rl.ok) return rateLimitResponse(rl)
      }

      // 5) Quota — enforcado no server, nunca confiar em localStorage
      if (!options.skipQuota) {
        const quota = await checkAndIncrementQuota(supabase, user.id, agentSlug)
        if (!quota.ok && quota.response) return quota.response
      }

      // 6) Delega pra lógica do agente
      return await handler({ req, supabase, user, agentSlug })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro interno'
      // eslint-disable-next-line no-console
      safeLog.error(`[API /${agentSlug}]`, msg)

      // 529 / overloaded — erro esperado do Anthropic, não é bug
      if (err instanceof Error && (msg.includes('529') || msg.toLowerCase().includes('overloaded'))) {
        return NextResponse.json(
          {
            error: 'Agente temporariamente sobrecarregado. Aguarde 30 segundos e tente novamente.',
            retry: true,
          },
          { status: 503 },
        )
      }

      // AbortError / timeout
      if (err instanceof Error && (err.name === 'AbortError' || msg.toLowerCase().includes('aborted') || msg.toLowerCase().includes('timeout'))) {
        return NextResponse.json(
          { error: 'O servico de IA demorou muito para responder. Tente uma entrada mais curta.' },
          { status: 504 },
        )
      }

      // Production: nunca vazar `details: msg` — pode revelar nome de tabela,
      // stack do SDK, query DB, env paths etc. Em dev mantém pra debug local.
      return NextResponse.json(
        process.env.NODE_ENV === 'production'
          ? { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }
          : { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.', details: msg },
        { status: 500 },
      )
    }
  }
}
