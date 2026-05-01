import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

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

interface QuotaCheckResult {
  ok: boolean
  remaining: number
  used: number
  limit: number
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
      response: NextResponse.json({
        error: `Limite mensal do plano ${effectivePlan} atingido (${currentCount}/${limit}). Faca upgrade para continuar.`,
        quota: { used: currentCount, limit, plan: effectivePlan },
      }, { status: 429 }),
    }
  }

  // 3) Atomic increment via stored procedure
  const { data: newCount, error: incErr } = await supabase
    .rpc('increment_quota', { p_usuario_id: usuario.id, p_agente: agente })

  if (incErr) {
    // Don't block the user on quota tracking failure — log and continue
    // eslint-disable-next-line no-console
    console.error('[quota] increment failed:', incErr.message)
    return { ok: true, remaining: limit - currentCount - 1, used: currentCount + 1, limit }
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - (newCount ?? currentCount + 1)),
    used: newCount ?? currentCount + 1,
    limit,
  }
}
