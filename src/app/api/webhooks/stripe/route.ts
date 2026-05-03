import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, planFromPriceId } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeLog } from '@/lib/safe-log'
import { audit } from '@/lib/audit'
import { sendMetaEvent } from '@/lib/meta-capi'

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
    safeLog.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not configured — rejecting all events')
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
    safeLog.error('[stripe webhook] signature verification failed:', msg)
    return NextResponse.json({ error: `Invalid signature: ${msg}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Idempotency check — Stripe retenta eventos em network failures.
  // Tabela stripe_events tem PK em event_id; INSERT ON CONFLICT DO NOTHING
  // garante que cada evento é processado uma única vez. Sem isso, eventos
  // out-of-order (subscription.deleted depois de updated, ou created
  // duplicado) corrompiam o plano em prod.
  const { error: idempErr, data: insertData } = await supabase
    .from('stripe_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      api_version: event.api_version ?? null,
      payload: event.data.object as object,
    })
    .select('event_id')
    .maybeSingle()

  if (idempErr) {
    // PG unique violation = duplicate event already processed (23505)
    const code = (idempErr as { code?: string }).code
    if (code === '23505') {
      safeLog.debug('[stripe webhook] duplicate event ignored:', event.id, event.type)
      return NextResponse.json({ received: true, duplicate: true })
    }
    // Outro erro de DB — log e segue (fail-open evita travar webhook crítico)
    safeLog.error('[stripe webhook] idempotency insert failed:', idempErr.message)
  }

  // Sanity log — só em dev
  if (process.env.NODE_ENV !== 'production') {
    safeLog.debug('[stripe webhook] processing', event.type, insertData?.event_id || event.id)
  }

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

        const { data: updated, error } = await supabase
          .from('usuarios')
          .update({
            plano,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            subscription_status: sub.status,
            current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          })
          .eq(filterCol, filterVal)
          .select('id')
          .maybeSingle()

        if (error) throw error
        // LGPD Art. 37 audit — plano mudou, registra pra rastreio
        if (updated?.id) {
          audit({
            usuarioId: updated.id,
            action: 'user.plan_change',
            entityType: 'subscription',
            entityId: sub.id,
            metadata: { plano, status: sub.status, event: event.type },
          }).catch(() => {})
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const authUserId = (sub.metadata?.auth_user_id as string | undefined) || null
        const filterCol = authUserId ? 'auth_user_id' : 'stripe_customer_id'
        const filterVal = authUserId ?? customerId
        const { data: updated, error } = await supabase
          .from('usuarios')
          .update({ plano: 'free', subscription_status: 'canceled', stripe_subscription_id: null })
          .eq(filterCol, filterVal)
          .select('id')
          .maybeSingle()
        if (error) throw error
        if (updated?.id) {
          audit({
            usuarioId: updated.id,
            action: 'user.plan_change',
            entityType: 'subscription',
            entityId: sub.id,
            metadata: { plano: 'free', reason: 'subscription_deleted' },
          }).catch(() => {})
        }
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

          // Audit business P0-2 (2026-05-03): Meta Conversions API server-side
          // pra Purchase. Email hashed SHA256 (LGPD irreversivel). Dedup com
          // pixel client-side via event_id determinístico (session.id).
          const plan = (session.metadata?.plan as string | undefined) || 'unknown'
          const valueBRL = session.amount_total ? session.amount_total / 100 : 0
          const customerEmail = session.customer_details?.email || undefined
          sendMetaEvent({
            eventName: 'Purchase',
            eventId: `purchase:${session.id}`,
            email: customerEmail,
            externalId: authUserId,
            value: valueBRL,
            currency: (session.currency || 'brl').toUpperCase(),
            sourceUrl: session.success_url || undefined,
          }).catch(() => { /* silent */ })

          // Audit business P1-3 (2026-05-03): referral conversion. Se usuario
          // foi indicado, marca referral 'completed' + cria cupom Stripe 30
          // dias trial pro indicador (best-effort, nao bloqueia webhook).
          handleReferralConversion(supabase, authUserId).catch((err) => {
            safeLog.warn('[stripe webhook] referral handler failed', err instanceof Error ? err.message : 'unknown')
          })
        } else {
          safeLog.warn('[stripe webhook] checkout.session.completed without auth_user_id metadata — skipping link')
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

      // P0 audit fix (2026-05-02): refund flow não tratado antes — chargeback
      // processado pelo Stripe, mas Pralvex mantinha acesso. PCI-DSS req.
      // tracking + compliance fiscal BR não baixava receita reconhecida.
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id
        if (customerId) {
          // Revoga acesso (volta pra free) e marca refunded pra audit fiscal
          const { error } = await supabase
            .from('usuarios')
            .update({
              plano: 'free',
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('stripe_customer_id', customerId)
          if (error) throw error
          // Log fiscal — operador pode auditar refunds para baixar receita
          safeLog.warn('[stripe webhook] charge.refunded', {
            chargeId: charge.id,
            amount: charge.amount_refunded,
            currency: charge.currency,
            customerId,
          })
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
    safeLog.error('[stripe webhook] handler error:', msg)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

/**
 * Audit business P1-3 (2026-05-03): converte indicacao quando indicado paga.
 *
 * Fluxo:
 *   1. Le usuarios.referred_by do indicado (pode ser null = sem indicacao).
 *   2. Marca referrals row como completed + reward_applied=true.
 *   3. Cria cupom Stripe 30 dias trial extension pro indicador (best-effort).
 *
 * Tudo idempotente — re-execucao no mesmo session.id nao duplica reward.
 */
type AdminClient = ReturnType<typeof createAdminClient>
async function handleReferralConversion(supabase: AdminClient, indicadoAuthUserId: string): Promise<void> {
  // 1. Busca indicado + referred_by
  const { data: indicado } = await supabase
    .from('usuarios')
    .select('id, referred_by')
    .eq('auth_user_id', indicadoAuthUserId)
    .maybeSingle()

  if (!indicado || !indicado.referred_by) return

  // 2. Marca referrals row como completed (idempotente — reward_applied evita duplicar)
  const { data: referralRow } = await supabase
    .from('referrals')
    .select('id, reward_applied')
    .eq('referrer_id', indicado.referred_by)
    .eq('referred_id', indicado.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (!referralRow || referralRow.reward_applied) return

  await supabase
    .from('referrals')
    .update({
      status: 'completed',
      reward_applied: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', referralRow.id)

  // 3. Cupom Stripe pro indicador (30 dias trial extension)
  // best-effort — falha aqui nao bloqueia status update acima
  try {
    const { data: indicador } = await supabase
      .from('usuarios')
      .select('stripe_customer_id, email')
      .eq('id', indicado.referred_by)
      .maybeSingle()

    if (indicador?.stripe_customer_id) {
      // Cupom 100% off por 1 mes (proxy de "30 dias trial extension" — Stripe
      // SDK desta versao nao tem trial_extension direto via API, entao
      // damos um mes de mensalidade gratis via percent_off=100 once).
      const coupon = await stripe.coupons.create({
        duration: 'once',
        percent_off: 100,
        max_redemptions: 1,
        name: `Bonus indicacao 30 dias`,
        metadata: { reason: 'referral_reward', referrer_user_id: indicado.referred_by },
      })
      await stripe.promotionCodes.create({
        promotion: { type: 'coupon', coupon: coupon.id },
        max_redemptions: 1,
        customer: indicador.stripe_customer_id,
        metadata: { reason: 'referral_reward' },
      } as Stripe.PromotionCodeCreateParams)
    }
  } catch (err) {
    safeLog.warn('[referral] coupon creation failed', err instanceof Error ? err.message : 'unknown')
  }
}
