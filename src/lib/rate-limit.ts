import type { SupabaseClient } from '@supabase/supabase-js'

const WINDOW_SECONDS = 60
const MAX_REQUESTS_PER_WINDOW = 20 // 20 requests per minute per user

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetIn: number // seconds until reset
}

/**
 * Sliding window rate limiter backed by Supabase `rate_limits` table.
 *
 * Schema expected:
 *   id, chave, requisicoes, janela_inicio, bloqueado_ate
 *
 * Fails open: if the limiter itself errors, the caller is NOT blocked — we
 * never want a transient Supabase hiccup to take the product offline. The
 * error is logged so it can be fixed.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  key: string // e.g. `user:${userId}:agent:${agent}` or `ip:${ip}`
): Promise<RateLimitResult> {
  try {
    const now = new Date()

    const { data: existing, error: selectErr } = await supabase
      .from('rate_limits')
      .select('requisicoes, janela_inicio, bloqueado_ate')
      .eq('chave', key)
      .maybeSingle()

    if (selectErr) {
      // eslint-disable-next-line no-console
      console.error('[rate-limit] select error:', selectErr.message)
      return { ok: true, remaining: MAX_REQUESTS_PER_WINDOW, resetIn: WINDOW_SECONDS }
    }

    if (existing) {
      const windowStartTime = new Date(existing.janela_inicio).getTime()
      const elapsed = now.getTime() - windowStartTime

      if (elapsed > WINDOW_SECONDS * 1000) {
        // Window expired — reset counter
        await supabase
          .from('rate_limits')
          .update({
            requisicoes: 1,
            janela_inicio: now.toISOString(),
            bloqueado_ate: null,
          })
          .eq('chave', key)
        return {
          ok: true,
          remaining: MAX_REQUESTS_PER_WINDOW - 1,
          resetIn: WINDOW_SECONDS,
        }
      }

      if (existing.requisicoes >= MAX_REQUESTS_PER_WINDOW) {
        const resetIn = Math.max(
          1,
          Math.ceil((windowStartTime + WINDOW_SECONDS * 1000 - now.getTime()) / 1000)
        )
        return { ok: false, remaining: 0, resetIn }
      }

      // Increment within active window
      await supabase
        .from('rate_limits')
        .update({ requisicoes: existing.requisicoes + 1 })
        .eq('chave', key)

      return {
        ok: true,
        remaining: MAX_REQUESTS_PER_WINDOW - existing.requisicoes - 1,
        resetIn: Math.max(
          1,
          Math.ceil((windowStartTime + WINDOW_SECONDS * 1000 - now.getTime()) / 1000)
        ),
      }
    }

    // First request for this key
    const { error: insertErr } = await supabase.from('rate_limits').insert({
      chave: key,
      requisicoes: 1,
      janela_inicio: now.toISOString(),
    })

    if (insertErr) {
      // eslint-disable-next-line no-console
      console.error('[rate-limit] insert error:', insertErr.message)
      return { ok: true, remaining: MAX_REQUESTS_PER_WINDOW, resetIn: WINDOW_SECONDS }
    }

    return {
      ok: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetIn: WINDOW_SECONDS,
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[rate-limit] unexpected error:', err instanceof Error ? err.message : err)
    // Fail open
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
