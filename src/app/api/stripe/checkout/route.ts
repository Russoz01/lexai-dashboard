import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/stripe/checkout
 * Body: { plan: 'starter' | 'pro' | 'enterprise' }
 *
 * Cria (ou reusa) cliente Stripe do usuário autenticado e devolve a URL da Checkout Session.
 * Substitui os antigos links hardcoded buy.stripe.com/test_* no client.
 */

type PlanId = 'solo' | 'starter' | 'pro' | 'enterprise'

function priceIdFor(plan: PlanId): string | null {
  switch (plan) {
    case 'solo':
      return process.env.STRIPE_PRICE_SOLO || null
    case 'starter':
      return process.env.STRIPE_PRICE_ESCRITORIO || process.env.STRIPE_PRICE_STARTER || null
    case 'pro':
      return process.env.STRIPE_PRICE_FIRMA || process.env.STRIPE_PRICE_PRO || null
    case 'enterprise':
      return process.env.STRIPE_PRICE_ENTERPRISE || null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { plan?: string }
    const plan = body.plan as PlanId | undefined
    if (!plan || !['solo', 'starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
    }

    const priceId = priceIdFor(plan)
    if (!priceId) {
      return NextResponse.json({ error: 'price_not_configured' }, { status: 500 })
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    // Rate limit: sem RL, atacante autenticado dispara 1000 POSTs e cria 1000 Customers
    // no Stripe (lixo + fraud detection trigger contra a conta Pralvex).
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:stripe_checkout`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Lazy-provision customer
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('stripe_customer_id, email, nome')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    let customerId = usuario?.stripe_customer_id ?? null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: usuario?.email || user.email || undefined,
        name: usuario?.nome || (user.user_metadata?.nome as string | undefined) || undefined,
        metadata: { auth_user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('usuarios')
        .upsert({ auth_user_id: user.id, stripe_customer_id: customerId }, { onConflict: 'auth_user_id' })
    }

    const { origin } = new URL(req.url)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId!,
      // client_reference_id + metadata.auth_user_id pro webhook conseguir
      // mapear o customer ao usuario PELO ID e nunca por email — antes era
      // eq('email', ...) que permitia sequestro de billing via spoofing de
      // email no Supabase Auth quando email_confirm está off.
      client_reference_id: user.id,
      metadata: { auth_user_id: user.id, plan },
      line_items: [{ price: priceId, quantity: 1 }],
      // P1 audit fix (2026-05-02): UI promete PIX/boleto mas backend só
      // enviava 'card' implícito. Stripe BR já suporta os 3 métodos.
      payment_method_types: ['card', 'boleto'],
      subscription_data: {
        // Trial Pralvex e de 50 min DB-side antes do checkout. Quando user
        // chega aqui ele ja decidiu pagar — Stripe cobra imediato. Nao tem
        // trial duplo descoordenado (DB 30min vs Stripe 7 dias).
        metadata: { plan, auth_user_id: user.id },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${origin}/dashboard/planos?checkout=success&plan=${plan}`,
      cancel_url: `${origin}/dashboard/planos?checkout=cancelled`,
      locale: 'pt-BR',
    })

    if (!session.url) {
      return NextResponse.json({ error: 'no_checkout_url' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    // eslint-disable-next-line no-console
    console.error('[api/stripe/checkout] error:', msg)
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 })
  }
}
