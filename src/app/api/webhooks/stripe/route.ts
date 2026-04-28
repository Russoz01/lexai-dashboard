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
        // auth_user_id é setado em subscription_data.metadata em checkout/route.ts:75.
        // Filtrar por auth_user_id é IDOR-safe (UUID v4 do Supabase Auth, não
        // gravável pelo cliente). Fallback p/ stripe_customer_id mantém
        // compat com subs criadas antes deste fix.
        const authUserId = (sub.metadata?.auth_user_id as string | undefined) || null
        const filterCol = authUserId ? 'auth_user_id' : 'stripe_customer_id'
        const filterVal = authUserId ?? customerId

        const { error } = await supabase
          .from('usuarios')
          .update({
            plano,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          })
          .eq(filterCol, filterVal)

        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const authUserId = (sub.metadata?.auth_user_id as string | undefined) || null
        const filterCol = authUserId ? 'auth_user_id' : 'stripe_customer_id'
        const filterVal = authUserId ?? customerId
        const { error } = await supabase
          .from('usuarios')
          .update({ plano: 'free', subscription_status: 'canceled', stripe_subscription_id: null })
          .eq(filterCol, filterVal)
        if (error) throw error
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        // auth_user_id agora é setado em metadata + client_reference_id em
        // checkout/route.ts. Linkagem por EMAIL foi removida (vetor de
        // sequestro de billing). Se metadata ausente em sessão legada, log
        // e ignora — checkout/route.ts já fez upsert do customer_id antes.
        const authUserId =
          (session.metadata?.auth_user_id as string | undefined) ||
          (session.client_reference_id as string | undefined) ||
          null
        if (customerId && authUserId) {
          const { error } = await supabase
            .from('usuarios')
            .update({ stripe_customer_id: customerId })
            .eq('auth_user_id', authUserId)
          if (error) throw error
        } else {
          // eslint-disable-next-line no-console
          console.warn('[stripe webhook] checkout.session.completed without auth_user_id metadata — skipping link')
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
