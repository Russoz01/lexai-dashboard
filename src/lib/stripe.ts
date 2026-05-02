import Stripe from 'stripe'
import { safeLog } from '@/lib/safe-log'

// SECURITY NOTE: STRIPE_SECRET_KEY tem fallback 'sk_test_placeholder' pra
// nao quebrar build local/Vercel collect-page-data (que roda NODE_ENV=production
// sem env vars). Hard-fail e feito nas ROTAS que usam stripe (via guard que
// retorna 503 se STRIPE_SECRET_KEY ausente). Ver isStripeConfigured() abaixo.
if (!process.env.STRIPE_SECRET_KEY) {
  safeLog.warn('[stripe] STRIPE_SECRET_KEY not set — Stripe operations will fail at runtime')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as any,
  typescript: true,
})

/** Guard pra usar no inicio de rotas /api/stripe/* — retorna false se chave nao setada. */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')
}

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
