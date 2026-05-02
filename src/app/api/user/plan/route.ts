import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeLog } from '@/lib/safe-log'

export const dynamic = 'force-dynamic'

/**
 * Server-side plan verification.
 * Returns the authenticated user's plan + trial status from the database.
 * Replaces the previous localStorage-based approach which was exploitable.
 *
 * Founder override: usuarios.is_founder = true (DB flag, gravável só com
 * service-role) ganha enterprise lifetime, ignorando subscription/trial.
 * Antes era allowlist por email — vetor de spoofing via Supabase Auth com
 * confirm_email off. is_founder no DB elimina esse risco completamente.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ plano: 'free', authenticated: false }, { status: 401 })
    }

    // Fetch from usuarios table (linked via auth_user_id) + is_founder
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('plano, subscription_status, trial_started_at, trial_ended_at, current_period_end, stripe_customer_id, is_founder')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (dbError && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.error('[api/user/plan] db error:', dbError.message)
    }

    // Founder flag vem direto da DB — não há vetor de spoofing
    const isFounder = Boolean(usuario?.is_founder)

    // Founder bypass — retorna enterprise lifetime sem depender do banco
    if (isFounder) {
      return NextResponse.json({
        plano: 'enterprise',
        realPlano: 'enterprise',
        authenticated: true,
        subscription_status: 'active',
        founder: true,
        trial: { active: false, ends_at: null, days_left: 0 },
        stripe_customer_id: usuario?.stripe_customer_id || null,
      })
    }

    // Determine effective plan
    const now = Date.now()
    const trialEnd = usuario?.trial_ended_at ? new Date(usuario.trial_ended_at).getTime() : 0
    const isTrialing = usuario?.subscription_status === 'trialing' && trialEnd > now
    const isActive = usuario?.subscription_status === 'active'

    // During trial, users get full enterprise-level access
    const effectivePlan = isTrialing ? 'enterprise' : (isActive ? (usuario?.plano || 'free') : 'free')

    return NextResponse.json({
      plano: effectivePlan,
      realPlano: usuario?.plano || 'free',
      authenticated: true,
      subscription_status: usuario?.subscription_status || 'trialing',
      trial: {
        active: isTrialing,
        ends_at: usuario?.trial_ended_at,
        // Trial agora dura 50 minutos — minutes_left e o campo principal.
        // days_left mantido pra retro-compat de UI antiga.
        minutes_left: isTrialing ? Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60))) : 0,
        seconds_left: isTrialing ? Math.max(0, Math.floor((trialEnd - now) / 1000)) : 0,
        days_left: isTrialing ? Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))) : 0,
      },
      stripe_customer_id: usuario?.stripe_customer_id || null,
    })
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.error('[api/user/plan] error:', e)
    }
    return NextResponse.json({ plano: 'free', authenticated: false, error: 'internal' }, { status: 500 })
  }
}
