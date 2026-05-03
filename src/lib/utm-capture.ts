'use client'

/* ════════════════════════════════════════════════════════════════════
 * UTM Capture · v1.0 (2026-05-03 · audit business P2-4)
 * ────────────────────────────────────────────────────────────────────
 * Captura utm_* da URL no first-load + persiste em cookie 30 dias.
 *
 * Por que cookie e nao sessionStorage:
 *   - Cookie sobrevive ao OAuth round-trip (Google volta sem query string).
 *   - Server-side reads via document.cookie no /auth/callback (no Next 14
 *     middleware ja faria isso, mas mantemos client-side por simplicidade).
 *   - 30 dias = janela tipica de attribution multi-touch (visit → trial → buy).
 *
 * Uso:
 *   import { captureUtm } from '@/lib/utm-capture'
 *   useEffect(() => { captureUtm() }, [])
 *
 *   // Mais tarde, no signup:
 *   const utms = readUtmCookie()  // {utm_source: 'google', ...} | null
 *
 * Os mesmos UTMs sao espelhados em sessionStorage 'pralvex-utm' pra
 * /login.signInGoogle propagar via redirectTo querystring.
 * ═══════════════════════════════════════════════════════════════════ */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const COOKIE_NAME = 'pralvex_utm'
const SESSION_KEY = 'pralvex-utm'
const TTL_DAYS = 30

export type UtmRecord = Partial<Record<typeof UTM_KEYS[number], string>>

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (const c of cookies) {
    const [k, ...v] = c.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  const exp = new Date()
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000)
  // SameSite=Lax pra preservar em redirects OAuth (Google) sem virar third-party.
  // Secure ligado em prod (HTTPS-only); em dev (NODE_ENV=development) deixamos off.
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp.toUTCString()}; path=/; SameSite=Lax${secure}`
}

/**
 * Captura UTMs da URL atual e persiste 30 dias. Idempotente — re-chamar
 * no mesmo URL com UTMs nao duplica nem corrompe; se chamar sem UTMs e
 * cookie ja existe, mantem o cookie (last-touch wins SOMENTE se nova URL
 * tiver UTMs novos).
 */
export function captureUtm(): UtmRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search)
    const fresh: UtmRecord = {}
    for (const k of UTM_KEYS) {
      const v = params.get(k)
      if (v && v.length > 0 && v.length < 200) fresh[k] = v
    }
    if (Object.keys(fresh).length === 0) {
      // Sem UTMs nesta URL — apenas retorna o que ja tinha em cookie (se existir).
      return readUtmCookie()
    }
    const json = JSON.stringify(fresh)
    setCookie(COOKIE_NAME, json, TTL_DAYS)
    try { sessionStorage.setItem(SESSION_KEY, json) } catch { /* noop */ }
    return fresh
  } catch {
    return null
  }
}

/**
 * Le UTMs persistidos em cookie. Retorna null se ausente, malformado, ou expirado.
 */
export function readUtmCookie(): UtmRecord | null {
  const raw = getCookie(COOKIE_NAME)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as UtmRecord
    if (typeof parsed !== 'object' || parsed === null) return null
    // Sanity: keep only known keys
    const out: UtmRecord = {}
    for (const k of UTM_KEYS) {
      const v = parsed[k]
      if (typeof v === 'string' && v.length < 200) out[k] = v
    }
    return Object.keys(out).length > 0 ? out : null
  } catch {
    return null
  }
}
