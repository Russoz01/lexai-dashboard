import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAuthUrl, isGoogleCalendarConfigured } from '@/lib/google-calendar'
import { safeLog } from '@/lib/safe-log'

/**
 * GET /api/google/auth
 *
 * Returns a Google OAuth consent URL tied to the current user's id as state.
 * Returns 503 if GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set on the server.
 */
export async function GET() {
  try {
    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        { error: 'Google Calendar nao configurado pelo admin.' },
        { status: 503 },
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    // State = random nonce stored in a httpOnly cookie for CSRF validation.
    const state = randomBytes(16).toString('hex')

    const url = getGoogleAuthUrl(state)
    if (!url) {
      return NextResponse.json(
        { error: 'Google Calendar nao configurado pelo admin.' },
        { status: 503 },
      )
    }

    const res = NextResponse.json({ url })
    res.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 min
      path: '/',
    })
    return res
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    // eslint-disable-next-line no-console
    safeLog.error('[API /google/auth]', message)
    return NextResponse.json({ error: 'Erro ao iniciar autenticacao Google.' }, { status: 500 })
  }
}
