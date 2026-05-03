import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import * as Sentry from '@sentry/nextjs'
import { timingSafeEqual } from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/purge-memory — Vercel Cron job (weekly).
 *
 * Audit elite v4 (2026-05-03) #12: LGPD Art. 16 retention compliance.
 *
 * Roda weekly (vercel.json: "0 6 * * 0" = domingo 06:00 UTC = 03:00 BRT)
 * e chama RPC purge_old_agent_memory(180) que deleta:
 *   - linhas com expires_at no passado (TTL aplicacional)
 *   - linhas com created_at > 180 dias atras (default LGPD retention)
 *
 * Idempotente: rodar varias vezes na mesma janela so retorna 0 deleted
 * apos primeira purge. Sem efeitos colaterais.
 *
 * Security: Vercel Cron seta Authorization Bearer CRON_SECRET. Sem isso,
 * rejeita 401. timingSafeEqual evita timing attack char-by-char.
 */

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
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

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('purge_old_agent_memory', {
      retention_days: 180,
    })

    if (error) {
      Sentry.captureException(new Error(`[cron purge-memory] RPC error: ${error.message}`))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const deleted = typeof data === 'number' ? data : 0

    // Log explicito pra Vercel logs (Sentry breadcrumb tambem)
    Sentry.addBreadcrumb({
      category: 'cron',
      message: `purge-memory: ${deleted} rows deleted`,
      level: 'info',
    })

    return NextResponse.json({ ok: true, deleted, retention_days: 180 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    Sentry.captureException(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
