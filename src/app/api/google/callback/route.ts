import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForToken, isGoogleCalendarConfigured } from '@/lib/google-calendar'
import { encryptToken, isCryptoConfigured } from '@/lib/crypto-tokens'
import { safeLog } from '@/lib/safe-log'

/**
 * GET /api/google/callback?code=...&state=...
 *
 * Google OAuth callback. Validates the CSRF state cookie, exchanges the code
 * for tokens, and persists them in the oauth_tokens table scoped to the user.
 */
export async function GET(req: NextRequest) {
  const base = new URL(req.url)
  const dashboardUrl = new URL('/dashboard/rotina', base.origin)

  try {
    if (!isGoogleCalendarConfigured()) {
      dashboardUrl.searchParams.set('google', 'not_configured')
      return NextResponse.redirect(dashboardUrl)
    }

    const code = req.nextUrl.searchParams.get('code')
    const stateParam = req.nextUrl.searchParams.get('state')
    const error = req.nextUrl.searchParams.get('error')

    if (error || !code) {
      dashboardUrl.searchParams.set('google', 'error')
      return NextResponse.redirect(dashboardUrl)
    }

    // ── CSRF state validation ───────────────────────────────────────────────
    // P2 audit fix (2026-05-02): timingSafeEqual em vez de !== pra evitar
    // timing attacks na recuperação parcial do state nonce. Padrão consistente
    // com cron/trial-reminder/route.ts.
    const stateCookie = req.cookies.get('google_oauth_state')?.value
    if (!stateParam || !stateCookie) {
      dashboardUrl.searchParams.set('google', 'csrf_error')
      return NextResponse.redirect(dashboardUrl)
    }
    const aBuf = Buffer.from(stateParam)
    const bBuf = Buffer.from(stateCookie)
    if (aBuf.length !== bBuf.length || !timingSafeEqual(aBuf, bBuf)) {
      dashboardUrl.searchParams.set('google', 'csrf_error')
      return NextResponse.redirect(dashboardUrl)
    }

    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      dashboardUrl.searchParams.set('google', 'error')
      return NextResponse.redirect(dashboardUrl)
    }

    // ── Exchange code ───────────────────────────────────────────────────────
    const token = await exchangeCodeForToken(code)
    if (!token?.access_token) {
      dashboardUrl.searchParams.set('google', 'error')
      return NextResponse.redirect(dashboardUrl)
    }

    // ── Resolve usuario_id ─────────────────────────────────────────────────
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (usuario?.id) {
      const expiresAt = token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000).toISOString()
        : null

      // SEC-04 audit fix (2026-05-02): AES-256-GCM encryption antes de
      // persistir. Antes, tokens em texto plano = sequestro de calendar
      // de TODOS users se DB vazar. LGPD Art. 46 (medida técnica).
      // Graceful degrade: se OAUTH_ENCRYPTION_KEY não setado em env,
      // log warn + persiste plain (backward-compat até key ser configurada).
      const cryptoOn = isCryptoConfigured()
      if (!cryptoOn) {
        // eslint-disable-next-line no-console
        safeLog.warn('[google/callback] OAUTH_ENCRYPTION_KEY ausente — tokens armazenados em texto plano (LGPD Art. 46 risk)')
      }
      const accessToken = cryptoOn ? encryptToken(token.access_token) : token.access_token
      const refreshToken = token.refresh_token
        ? (cryptoOn ? encryptToken(token.refresh_token) : token.refresh_token)
        : null

      await supabase.from('oauth_tokens').upsert(
        {
          usuario_id: usuario.id,
          provider: 'google_calendar',
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        },
        { onConflict: 'usuario_id,provider' },
      )
    }

    // Clear the CSRF cookie
    const response = NextResponse.redirect(dashboardUrl)
    response.cookies.set('google_oauth_state', '', { maxAge: 0, path: '/' })
    dashboardUrl.searchParams.set('google', 'connected')

    return NextResponse.redirect(
      new URL(`/dashboard/rotina?google=connected`, base.origin),
      { headers: response.headers },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    // eslint-disable-next-line no-console
    safeLog.error('[API /google/callback]', message)
    dashboardUrl.searchParams.set('google', 'error')
    return NextResponse.redirect(dashboardUrl)
  }
}
