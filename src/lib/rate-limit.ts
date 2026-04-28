import type { SupabaseClient } from '@supabase/supabase-js'

const WINDOW_SECONDS = 60
const MAX_REQUESTS_PER_WINDOW = 20 // 20 requests per minute per user

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetIn: number // seconds until reset
}

/**
 * Sliding window rate limiter backed por SECURITY DEFINER RPC atômica.
 *
 * Antes (read-modify-write): 5 reqs paralelos liam requisicoes=10 e todos
 * escreviam 11 — janela inteira passava com 1 contagem. Bypass simples.
 *
 * Agora: RPC `increment_rate_limit_atomic` faz UPDATE...RETURNING dentro
 * de uma transação serializada via PK lock. Replay safe + race safe.
 *
 * Fail-open mantido: se RPC errar (Supabase down), libera — nunca bloquear
 * por transient infra. Erro é logado pra ser fixado.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string // e.g. `user:${userId}:agent:${agent}` or `ip:${ip}`
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabase
      .rpc('increment_rate_limit_atomic', {
        p_chave: key,
        p_window_secs: WINDOW_SECONDS,
        p_max: MAX_REQUESTS_PER_WINDOW,
      })

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('[rate-limit] RPC error:', error.message)
      }
      // Fail open
      return { ok: true, remaining: MAX_REQUESTS_PER_WINDOW, resetIn: WINDOW_SECONDS }
    }

    // RPC returns SETOF — Supabase JS retorna array
    const row = Array.isArray(data) ? data[0] : data
    if (!row) {
      return { ok: true, remaining: MAX_REQUESTS_PER_WINDOW, resetIn: WINDOW_SECONDS }
    }

    return {
      ok: Boolean(row.ok),
      remaining: Number(row.remaining ?? 0),
      resetIn: Number(row.reset_in ?? WINDOW_SECONDS),
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[rate-limit] unexpected error:', err instanceof Error ? err.message : err)
    }
    return { ok: true, remaining: MAX_REQUESTS_PER_WINDOW, resetIn: WINDOW_SECONDS }
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    {
      error: `Muitas requisicoes. Tente novamente em ${result.resetIn} segundos.`,
      resetIn: result.resetIn,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.resetIn),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetIn),
      },
    }
  )
}
