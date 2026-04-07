import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getGoogleAuthUrl, isGoogleCalendarConfigured } from '@/lib/google-calendar'

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

    // Simple state: user id + random nonce. Not persisted yet (stub) — a
    // future implementation should store this server-side to validate the
    // callback and defeat CSRF.
    const nonce = randomBytes(12).toString('hex')
    const state = `${user.id}.${nonce}`

    const url = getGoogleAuthUrl(state)
    if (!url) {
      return NextResponse.json(
        { error: 'Google Calendar nao configurado pelo admin.' },
        { status: 503 },
      )
    }

    return NextResponse.json({ url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    // eslint-disable-next-line no-console
    console.error('[API /google/auth]', message)
    return NextResponse.json({ error: 'Erro ao iniciar autenticacao Google.' }, { status: 500 })
  }
}
