import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, planFromPriceId } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * Stripe webhook handler.
 * Listens for subscription lifecycle events and updates the usuarios table.
 *
 * IMPORTANT: Configure this endpoint URL in Stripe Dashboard:
 *   https://yourdomain.com/api/webhooks/stripe
 * And set STRIPE_WEBHOOK_SECRET in your .env.
 */
export async function POST(req: NextRequest) {
  // Hard fail if webhook secret is not configured — never accept unverified events
  if (!webhookSecret || webhookSecret.length === 0) {
    // eslint-disable-next-line no-console
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not configured — rejecting all events')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    // eslint-disable-next-line no-console
    console.error('[stripe webhook] signature verification failed:', msg)
    return NextResponse.json({ error: `Invalid signature: ${msg}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const priceId = sub.items.data[0]?.price.id
        const plano = planFromPriceId(priceId || '')
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

        // Find user by stripe_customer_id (must have been set during checkout)
        const { error } = await supabase
          .from('usuarios')
          .update({
            plano,
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const { error } = await supabase
          .from('usuarios')
          .update({ plano: 'free', subscription_status: 'canceled', stripe_subscription_id: null })
          .eq('stripe_customer_id', customerId)
        if (error) throw error
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        const userEmail = session.customer_email || session.customer_details?.email
        if (customerId && userEmail) {
          // Link the customer id to the usuarios row matched by email
          const { error } = await supabase
            .from('usuarios')
            .update({ stripe_customer_id: customerId })
            .eq('email', userEmail)
          if (error) throw error
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (customerId) {
          await supabase
            .from('usuarios')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      default:
        // Ignore unhandled events
        break
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    // eslint-disable-next-line no-console
    console.error('[stripe webhook] handler error:', msg)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
