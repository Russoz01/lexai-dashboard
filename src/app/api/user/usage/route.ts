import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_QUOTAS } from '@/lib/quotas'
import { ok, unauthorized, serverError } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/usage — aggregated current-month consumption.
 *
 * Returns per-agent counts + plan limit + effective remaining quota,
 * used by the dashboard UsagePanel to show the user where they stand.
 *
 * The `limit` reflects the EFFECTIVE plan (enterprise during trial),
 * matching what /api/user/plan returns so both panels stay consistent.
 */
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, plano, subscription_status, trial_ended_at')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!usuario) return unauthorized('Usuario nao encontrado.')

    const isTrialing =
      usuario.subscription_status === 'trialing' &&
      usuario.trial_ended_at &&
      new Date(usuario.trial_ended_at).getTime() > Date.now()
    const effectivePlan = isTrialing ? 'enterprise' : (usuario.plano || 'free')
    const limit = PLAN_QUOTAS[effectivePlan] ?? PLAN_QUOTAS.free

    const mes = new Date().toISOString().slice(0, 7)
    const { data: rows } = await supabase
      .from('user_quotas')
      .select('agente, count')
      .eq('usuario_id', usuario.id)
      .eq('mes', mes)

    const byAgent: Record<string, number> = {}
    let total = 0
    for (const r of rows ?? []) {
      byAgent[r.agente] = r.count
      total += r.count
    }

    // Next reset — first day of next month, 00:00 UTC
    const now = new Date()
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

    return ok({
      plan: effectivePlan,
      isTrialing: !!isTrialing,
      limit,
      totalUsed: total,
      remaining: Math.max(0, limit - total),
      percentUsed: limit > 0 ? Math.min(100, Math.round((total / limit) * 100)) : 0,
      byAgent,
      month: mes,
      nextResetAt: nextReset.toISOString(),
    })
  } catch (err) {
    return serverError('user/usage', err)
  }
}
