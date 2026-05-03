import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { timingSafeEqual } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sentry-test — Sentry healthcheck endpoint.
 *
 * Audit elite v4 #10 (2026-05-03): operador precisava forma rapida de
 * confirmar que Sentry production esta recebendo events antes da demo.
 *
 * Triggers:
 *   - Captura mensagem informativa (level=info)
 *   - Captura excecao deliberada (level=error)
 *
 * Security: gated por NEXT_PUBLIC_SENTRY_TEST_ENABLED=1 OR auth via
 * CRON_SECRET. Sem isso, retorna 404 pra evitar spam Sentry events
 * por crawlers/atacantes.
 *
 * Uso:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://pralvex.com.br/api/sentry-test
 *   ou local em dev com NEXT_PUBLIC_SENTRY_TEST_ENABLED=1:
 *   curl http://localhost:3006/api/sentry-test
 */

const CRON_SECRET = process.env.CRON_SECRET
const TEST_ENABLED = process.env.NEXT_PUBLIC_SENTRY_TEST_ENABLED === '1'

export async function GET(req: NextRequest) {
  // Gate 1: feature flag dev-only
  if (TEST_ENABLED) {
    return runTest('flag-enabled')
  }

  // Gate 2: production exige Bearer CRON_SECRET (timingSafeEqual)
  const authHeader = req.headers.get('authorization') || ''
  if (CRON_SECRET) {
    const expected = `Bearer ${CRON_SECRET}`
    const aBuf = Buffer.from(authHeader)
    const bBuf = Buffer.from(expected)
    if (aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf)) {
      return runTest('cron-secret')
    }
  }

  // Sem gate valido — pretende 404 pra crawlers
  return new NextResponse('Not Found', { status: 404 })
}

function runTest(via: string) {
  // 1. Breadcrumb info — confirma que SDK esta carregado
  Sentry.addBreadcrumb({
    category: 'healthcheck',
    message: `sentry-test triggered via ${via}`,
    level: 'info',
    timestamp: Date.now() / 1000,
  })

  // 2. Captura mensagem (level info) — visivel em Issues > Info
  const messageId = Sentry.captureMessage(
    `[healthcheck] sentry-test ${new Date().toISOString()}`,
    'info',
  )

  // 3. Captura excecao deliberada (level error) — visivel em Issues > Error
  const errorId = Sentry.captureException(
    new Error(`[healthcheck] deliberate test exception ${new Date().toISOString()}`),
  )

  return NextResponse.json({
    ok: true,
    via,
    sentry: {
      messageId,
      errorId,
      dsn_set: !!process.env.SENTRY_DSN,
      env: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
    next_steps: [
      'Aguardar 30-60s',
      'Abrir https://sentry.io/organizations/<seu-org>/issues/',
      'Filtrar environment=production',
      'Confirmar 2 events: 1 info + 1 error com timestamp acima',
    ],
  })
}
