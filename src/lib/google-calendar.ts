/**
 * Google Calendar integration — OAuth + event creation for Rotina sync.
 *
 * Degrades gracefully: when GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are missing,
 * isGoogleCalendarConfigured() returns false and the API endpoints return 503.
 * The Rotina page keeps working with its local/Supabase state.
 *
 * Env vars:
 *  - GOOGLE_CLIENT_ID     (required)
 *  - GOOGLE_CLIENT_SECRET (required)
 *  - GOOGLE_REDIRECT_URI  (optional, defaults to production URL)
 */

import { SITE_URL } from '@/lib/site-url'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${SITE_URL}/api/google/callback`

export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
}

export function getGoogleAuthUrl(state: string): string | null {
  if (!isGoogleCalendarConfigured()) return null
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export interface GCalEvent {
  summary: string
  description?: string
  location?: string
  start: { dateTime: string; timeZone?: string }
  end: { dateTime: string; timeZone?: string }
}

export async function exchangeCodeForToken(
  code: string,
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number } | null> {
  if (!isGoogleCalendarConfigured()) return null
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })
    if (!res.ok) return null
    return (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number }
  } catch {
    return null
  }
}

export async function createCalendarEvent(
  accessToken: string,
  event: GCalEvent,
): Promise<boolean> {
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
    return res.ok
  } catch {
    return false
  }
}
