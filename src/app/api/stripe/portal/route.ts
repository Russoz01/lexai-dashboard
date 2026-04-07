import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Creates a Stripe Customer Portal session.
 * Lets the authenticated user manage their subscription, payment method,
 * invoices, and cancel — all hosted by Stripe (no UI to maintain).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('stripe_customer_id, email')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (dbError || !usuario) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    let customerId = usuario.stripe_customer_id

    // If user doesn't have a Stripe customer yet, create one (lazy provisioning)
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: usuario.email || user.email || undefined,
        metadata: { auth_user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('usuarios')
        .update({ stripe_customer_id: customerId })
        .eq('auth_user_id', user.id)
    }

    const { origin } = new URL(req.url)
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/configuracoes`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    // eslint-disable-next-line no-console
    console.error('[api/stripe/portal] error:', msg)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
