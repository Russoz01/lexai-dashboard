// Atomic sliding-window rate limiter. Single RPC call to consume_rate_limit
// eliminates the classic check-then-insert race (N concurrent callers pass a
// max-N check and all insert). The RPC cleans up stale events, counts, and
// inserts in one round-trip.
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { logError } from './logger'

export interface RateLimitResult {
  ok: boolean
  remaining: number
  reset_in_seconds: number
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string,
  windowSeconds = 60,
  max = 20,
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc('consume_rate_limit', {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max: max,
  })

  if (error) {
    // Fail open: never block a real user on rate-limit infra flakiness.
    logError(error, { where: 'checkRateLimit', key })
    return { ok: true, remaining: max, reset_in_seconds: windowSeconds }
  }

  return data as RateLimitResult
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Muitas requisicoes. Aguarde alguns segundos.',
      reset_in: result.reset_in_seconds,
    },
    {
      status: 429,
      headers: { 'Retry-After': String(result.reset_in_seconds) },
    },
  )
}
