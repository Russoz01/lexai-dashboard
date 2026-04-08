/**
 * Lightweight analytics wrapper. No-op if POSTHOG_KEY is not configured.
 * Use track() server-side or via fetch from client.
 */
import { logError } from './logger'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

interface TrackParams {
  event: string
  distinctId: string
  properties?: Record<string, unknown>
}

/**
 * Server-side event tracking via PostHog HTTP capture API.
 * Safe to call without configuration — silently no-ops.
 */
export async function track({ event, distinctId, properties }: TrackParams): Promise<void> {
  if (!POSTHOG_KEY) return
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $lib: 'lexai-server', source: 'server' },
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (err) {
    // Never throw from analytics, but do log so PostHog outages are visible.
    logError(err, { where: 'analytics.track', event })
  }
}

// Common event helpers — type-safe shortcuts
export const events = {
  signup: (userId: string, email: string) =>
    track({ event: 'user_signed_up', distinctId: userId, properties: { email } }),

  agentUsed: (userId: string, agent: string, plan: string) =>
    track({ event: 'agent_used', distinctId: userId, properties: { agent, plan } }),

  documentAnalyzed: (userId: string, charsAnalyzed: number) =>
    track({ event: 'document_analyzed', distinctId: userId, properties: { chars: charsAnalyzed } }),

  trialEnded: (userId: string, converted: boolean) =>
    track({ event: 'trial_ended', distinctId: userId, properties: { converted } }),

  paymentSuccess: (userId: string, plan: string, amount: number) =>
    track({ event: 'payment_succeeded', distinctId: userId, properties: { plan, amount } }),

  quotaExceeded: (userId: string, agent: string, plan: string) =>
    track({ event: 'quota_exceeded', distinctId: userId, properties: { agent, plan } }),

  shareCreated: (userId: string, type: string) =>
    track({ event: 'share_created', distinctId: userId, properties: { type } }),
}
