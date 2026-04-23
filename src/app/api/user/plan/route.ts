import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Founder email — Leonardo tem acesso lifetime ao tier supremo */
const FOUNDER_EMAILS = new Set<string>([
  'luizfernandoleonardoleonardo@gmail.com',
])

/**
 * Server-side plan verification.
 * Returns the authenticated user's plan + trial status from the database.
 * Replaces the previous localStorage-based approach which was exploitable.
 *
 * Founder override: emails em FOUNDER_EMAILS ganham enterprise lifetime,
 * ignorando subscription_status e trial — garante que Leonardo nunca perca acesso.
 */
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ plano: 'free', authenticated: false }, { status: 401 })
    }

    const email = user.email?.toLowerCase?.() ?? ''
    const isFounder = FOUNDER_EMAILS.has(email)

    // Fetch from usuarios table (linked via auth_user_id)
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('plano, subscription_status, trial_started_at, trial_ended_at, current_period_end, stripe_customer_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (dbError) {
      // eslint-disable-next-line no-console
      console.error('[api/user/plan] db error:', dbError.message)
    }

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
        days_left: isTrialing ? Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))) : 0,
      },
      stripe_customer_id: usuario?.stripe_customer_id || null,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api/user/plan] error:', e)
    return NextResponse.json({ plano: 'free', authenticated: false, error: 'internal' }, { status: 500 })
  }
}
