import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, isGoogleCalendarConfigured } from '@/lib/google-calendar'

/**
 * GET /api/google/callback?code=...&state=...
 *
 * Google OAuth callback. For this stub we exchange the code for a token to
 * verify the wiring works, then redirect back to /dashboard/rotina with a
 * success/error flag — token persistence will be added later together with
 * a dedicated oauth_tokens table.
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
    const error = req.nextUrl.searchParams.get('error')

    if (error || !code) {
      dashboardUrl.searchParams.set('google', 'error')
      return NextResponse.redirect(dashboardUrl)
    }

    const token = await exchangeCodeForToken(code)
    if (!token?.access_token) {
      dashboardUrl.searchParams.set('google', 'error')
      return NextResponse.redirect(dashboardUrl)
    }

    // TODO: persist token in an oauth_tokens table scoped to the user.
    // For now the stub just confirms the exchange worked.

    dashboardUrl.searchParams.set('google', 'connected')
    return NextResponse.redirect(dashboardUrl)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    // eslint-disable-next-line no-console
    console.error('[API /google/callback]', message)
    dashboardUrl.searchParams.set('google', 'error')
    return NextResponse.redirect(dashboardUrl)
  }
}
