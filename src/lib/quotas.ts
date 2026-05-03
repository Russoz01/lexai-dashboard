import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLog } from './safe-log'

export const PLAN_QUOTAS: Record<string, number> = {
  free:       5,
  // Current plan names
  solo:       50,    // novo v11 — advogado autonomo R$ 599
  escritorio: 200,
  firma:      100000, // ilimitado na pratica
  enterprise: 100000,
  // Legacy slugs — backward compat with existing DB rows
  starter:    200,
  pro:        100000,
}

/**
 * Audit business P1-1 (2026-05-03): warning level baseado em ratio used/limit.
 *   - 'soft'     : 75% <= ratio < 85% — toast persistente, nao bloqueia
 *   - 'urgent'   : 85% <= ratio < 100% — modal soft-block, conta restantes
 *   - 'exceeded' : ratio >= 100% — deadend, CTA upgrade
 *
 * Aplicado tanto pre-quota (antes de incrementar — pra UI saber quando
 * mostrar warning) quanto post-quota (apos incrementar — pra trigger pos-acao).
 */
export type QuotaWarning = 'soft' | 'urgent' | 'exceeded' | null

export function quotaWarningFor(used: number, limit: number): QuotaWarning {
  if (limit <= 0) return null
  const ratio = used / limit
  if (ratio >= 1.0) return 'exceeded'
  if (ratio >= 0.85) return 'urgent'
  if (ratio >= 0.75) return 'soft'
  return null
}

interface QuotaCheckResult {
  ok: boolean
  remaining: number
  used: number
  limit: number
  /** Nivel de aviso baseado em ratio — UI usa pra mostrar progress bar/modal. */
  warning?: QuotaWarning
  response?: NextResponse
}

/**
 * Check + atomically increment user quota.
 * Returns ok:false with a 429 response if exceeded.
 *
 * Plan is fetched server-side from usuarios table — never trust client.
 */
export async function checkAndIncrementQuota(
  supabase: SupabaseClient,
  authUserId: string,
  agente: string,
): Promise<QuotaCheckResult> {
  // 1) Resolve usuarios.id from auth user id
  const { data: usuario, error: userErr } = await supabase
    .from('usuarios')
    .select('id, plano, subscription_status, trial_ended_at')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (userErr || !usuario) {
    return {
      ok: false,
      remaining: 0,
      used: 0,
      limit: 0,
      response: NextResponse.json({ error: 'Perfil de usuario nao encontrado' }, { status: 403 }),
    }
  }

  // Effective plan: enterprise during trial, otherwise stored plano
  const isTrialing = usuario.subscription_status === 'trialing'
    && usuario.trial_ended_at
    && new Date(usuario.trial_ended_at).getTime() > Date.now()
  const effectivePlan = isTrialing ? 'enterprise' : (usuario.plano || 'free')
  const limit = PLAN_QUOTAS[effectivePlan] ?? PLAN_QUOTAS.free

  // 2) Read current month usage
  const mes = new Date().toISOString().slice(0, 7) // YYYY-MM
  const { data: quota } = await supabase
    .from('user_quotas')
    .select('count')
    .eq('usuario_id', usuario.id)
    .eq('agente', agente)
    .eq('mes', mes)
    .maybeSingle()

  const currentCount = quota?.count ?? 0

  if (currentCount >= limit) {
    return {
      ok: false,
      remaining: 0,
      used: currentCount,
      limit,
      warning: 'exceeded',
      response: NextResponse.json({
        error: `Limite mensal do plano ${effectivePlan} atingido (${currentCount}/${limit}). Faca upgrade para continuar.`,
        quota: { used: currentCount, limit, plan: effectivePlan, warning: 'exceeded' },
      }, { status: 429 }),
    }
  }

  // 3) Atomic increment via stored procedure
  const { data: newCount, error: incErr } = await supabase
    .rpc('increment_quota', { p_usuario_id: usuario.id, p_agente: agente })

  if (incErr) {
    // Don't block the user on quota tracking failure — log and continue
    // eslint-disable-next-line no-console
    safeLog.error('[quota] increment failed:', incErr.message)
    return {
      ok: true,
      remaining: limit - currentCount - 1,
      used: currentCount + 1,
      limit,
      warning: quotaWarningFor(currentCount + 1, limit),
    }
  }

  const finalUsed = newCount ?? currentCount + 1
  return {
    ok: true,
    remaining: Math.max(0, limit - finalUsed),
    used: finalUsed,
    limit,
    warning: quotaWarningFor(finalUsed, limit),
  }
}
