import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Production health check — uptime monitors (BetterStack/Pingdom) hit this.
 * Checks: app is alive, required env is present, Supabase responds.
 * Returns 200 when everything is healthy, 503 when a dependency is degraded.
 */
export async function GET() {
  const startedAt = Date.now()
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {}

  // 1. App is alive — implicit, we are responding
  checks.app = { ok: true }

  // 2. Required environment variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ANTHROPIC_API_KEY',
  ]
  const missingEnv = required.filter((k) => !process.env[k])
  checks.env = missingEnv.length
    ? { ok: false, error: `missing: ${missingEnv.join(', ')}` }
    : { ok: true }

  // 3. Supabase round-trip (non-fatal on short outages — just reports)
  try {
    const t0 = Date.now()
    const supabase = createClient()
    const { error } = await supabase.from('usuarios').select('id', { count: 'exact', head: true })
    checks.supabase = error
      ? { ok: false, error: error.message, latencyMs: Date.now() - t0 }
      : { ok: true, latencyMs: Date.now() - t0 }
  } catch (err) {
    checks.supabase = { ok: false, error: err instanceof Error ? err.message : 'unknown' }
  }

  // 4. Anthropic — env var only (real call burns tokens em uptime monitor)
  checks.anthropic = process.env.ANTHROPIC_API_KEY
    ? { ok: true }
    : { ok: false, error: 'ANTHROPIC_API_KEY missing' }

  // 5. Stripe — env var (real balance retrieve seria $$, env check basta)
  checks.stripe = process.env.STRIPE_SECRET_KEY
    ? { ok: true }
    : { ok: false, error: 'STRIPE_SECRET_KEY missing' }

  // 6. Webhook secret (sem isso webhook handler rejeita tudo)
  checks.stripe_webhook = process.env.STRIPE_WEBHOOK_SECRET
    ? { ok: true }
    : { ok: false, error: 'STRIPE_WEBHOOK_SECRET missing' }

  // 7. OAuth encryption key (SEC-04)
  checks.crypto = (process.env.OAUTH_ENCRYPTION_KEY?.length ?? 0) >= 16
    ? { ok: true }
    : { ok: false, error: 'OAUTH_ENCRYPTION_KEY missing or <16 chars' }

  // 8. Sentry (degraded if missing, não blocking)
  checks.sentry = (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)
    ? { ok: true }
    : { ok: false, error: 'SENTRY_DSN missing (errors not tracked)' }

  // Critical checks — se algum fail, status=503
  // Sentry é warning-level: marca degraded mas nao 503
  const criticalKeys = ['app', 'env', 'supabase', 'anthropic', 'stripe', 'stripe_webhook', 'crypto']
  const healthy = criticalKeys.every((k) => checks[k]?.ok)
  const status = healthy ? 200 : 503

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
      region: process.env.VERCEL_REGION || 'local',
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - startedAt,
      checks,
    },
    { status, headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
