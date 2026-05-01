import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, trialEndingEmailHtml } from '@/lib/email'
import * as Sentry from '@sentry/nextjs'
import { timingSafeEqual } from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/trial-reminder — Vercel Cron job.
 *
 * Runs once daily (configured in vercel.json) and emails users whose trial
 * ends in exactly 3 days or exactly 1 day. "Exactly" is measured by UTC
 * calendar-day difference, NOT hour-precision — we only want one email
 * per reminder window.
 *
 * Idempotency: we track sent reminders in `trial_reminders_sent` JSONB
 * column on the usuarios row (e.g. `{ "d3": true, "d1": true }`). If the
 * column is missing it's treated as `{}` and populated on first send.
 *
 * Security: Vercel Cron sets an `Authorization: Bearer <CRON_SECRET>`
 * header. Any request without it is rejected — even internal calls.
 */

const CRON_SECRET = process.env.CRON_SECRET
const REMINDER_WINDOWS = [3, 1] as const // days before trial ends

export async function GET(req: NextRequest) {
  // Vercel Cron authentication via constant-time compare
  // (atacante remoto observando timing pode tentar recuperar CRON_SECRET char-by-char
  //  com !== string compare — timingSafeEqual elimina esse vetor)
  const authHeader = req.headers.get('authorization') || ''
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const expected = `Bearer ${CRON_SECRET}`
  const aBuf = Buffer.from(authHeader)
  const bBuf = Buffer.from(expected)
  if (aBuf.length !== bBuf.length || !timingSafeEqual(aBuf, bBuf)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = Date.now()

  try {
    const results: Record<string, number> = { d3: 0, d1: 0, errors: 0, skipped: 0 }

    for (const daysLeft of REMINDER_WINDOWS) {
      const windowKey = `d${daysLeft}` as 'd3' | 'd1'

      // Window is [daysLeft-0.5, daysLeft+0.5) days from now — a 24h slice
      // sized to catch cron runs even if the job slips by a few hours.
      const lower = new Date(now + (daysLeft - 0.5) * 86_400_000).toISOString()
      const upper = new Date(now + (daysLeft + 0.5) * 86_400_000).toISOString()

      const { data: users, error } = await admin
        .from('usuarios')
        .select('id, email, nome, trial_reminders_sent, trial_ended_at, subscription_status')
        .eq('subscription_status', 'trialing')
        .gte('trial_ended_at', lower)
        .lt('trial_ended_at', upper)

      if (error) {
        Sentry.captureException(error, { tags: { job: 'trial-reminder', window: windowKey } })
        results.errors++
        continue
      }

      for (const u of users ?? []) {
        const sent = (u.trial_reminders_sent as Record<string, boolean> | null) || {}
        if (sent[windowKey]) {
          results.skipped++
          continue
        }

        const nome = u.nome?.trim() || u.email?.split('@')[0] || 'Advogado(a)'
        const res = await sendEmail({
          to: u.email,
          subject: `Seu trial termina em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}`,
          html: trialEndingEmailHtml(nome, daysLeft),
        })

        if (res.ok) {
          results[windowKey]++
          await admin
            .from('usuarios')
            .update({ trial_reminders_sent: { ...sent, [windowKey]: true } })
            .eq('id', u.id)
        } else {
          results.errors++
          Sentry.captureMessage('trial_reminder_send_failed', {
            level: 'warning',
            tags: { window: windowKey },
            extra: { reason: res.reason, userId: u.id },
          })
        }
      }
    }

    return NextResponse.json({ ok: true, results, ranAt: new Date().toISOString() })
  } catch (err) {
    Sentry.captureException(err, { tags: { job: 'trial-reminder' } })
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
