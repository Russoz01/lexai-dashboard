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
export const PRICE_TO_PLAN: Record<string, 'starter' | 'pro' | 'enterprise'> = {
  [process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder']: 'starter',
  [process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder']: 'pro',
  [process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder']: 'enterprise',
}

// Plan limits — server-side enforced
export const PLAN_LIMITS = {
  free:       { docsPerMonth: 5,    agents: ['resumidor', 'pesquisador', 'professor'] },
  starter:    { docsPerMonth: 50,   agents: ['resumidor', 'pesquisador', 'professor'] },
  pro:        { docsPerMonth: 200,  agents: ['resumidor', 'pesquisador', 'professor', 'redator', 'negociador', 'rotina'] },
  enterprise: { docsPerMonth: Infinity, agents: ['resumidor', 'pesquisador', 'professor', 'redator', 'negociador', 'rotina', 'calculador', 'legislacao', 'financeiro', 'prazos'] },
}

export function planFromPriceId(priceId: string): 'starter' | 'pro' | 'enterprise' | 'free' {
  return PRICE_TO_PLAN[priceId] || 'free'
}
