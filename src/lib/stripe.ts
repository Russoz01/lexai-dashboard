import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[stripe] STRIPE_SECRET_KEY not set — Stripe operations will fail at runtime')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any,
  typescript: true,
})

// Map Stripe price IDs to internal plan slugs.
// Set these in your environment after creating prices in Stripe.
export const PRICE_TO_PLAN: Record<string, 'solo' | 'escritorio' | 'firma' | 'enterprise'> = {
  [process.env.STRIPE_PRICE_SOLO       || 'price_solo_placeholder']:       'solo',
  [process.env.STRIPE_PRICE_ESCRITORIO || 'price_escritorio_placeholder']: 'escritorio',
  [process.env.STRIPE_PRICE_FIRMA      || 'price_firma_placeholder']:      'firma',
  [process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder']: 'enterprise',
  // Legacy slugs — keep for backward compat with existing DB rows
  [process.env.STRIPE_PRICE_STARTER   || 'price_starter_placeholder']:    'escritorio',
  [process.env.STRIPE_PRICE_PRO       || 'price_pro_placeholder']:        'firma',
}

export function planFromPriceId(priceId: string): 'solo' | 'escritorio' | 'firma' | 'enterprise' | 'free' {
  return PRICE_TO_PLAN[priceId] || 'free'
}
