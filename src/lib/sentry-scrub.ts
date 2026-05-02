/* ════════════════════════════════════════════════════════════════════
 * sentry-scrub · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * PII scrub pra Sentry events + breadcrumbs ANTES de irem pro servidor
 * Sentry. Reutiliza scrubSensitive() do safe-log lib.
 *
 * Audit Wave R1 fix SEC-05 follow-up: events Sentry vão pra servidor
 * 3rd party com retenção (~30-90d) — dados PII em event.extra,
 * event.contexts, event.breadcrumbs.data ficam em log de error tracker
 * por meses. LGPD Art. 46 + Provimento 205/2021 OAB exigem scrub.
 *
 * Cobertura:
 * - event.extra (qualquer payload livre)
 * - event.contexts (custom contexts)
 * - event.breadcrumbs (cada breadcrumb.data e breadcrumb.message truncado)
 * - event.user (mantém só id; dropa email, ip_address, username)
 * - event.exception.values[].value (truncado a 500 chars)
 * - event.message (truncado a 500 chars)
 *
 * NÃO mexe em: event.tags, event.fingerprint, event.environment,
 * event.release — esses são metadata, sem PII.
 * ═══════════════════════════════════════════════════════════════════ */

import { scrubSensitive } from './safe-log'
import type { ErrorEvent as Event, EventHint, Breadcrumb } from '@sentry/core'

const MAX_STRING_LEN = 500

function truncate(s: string | undefined): string | undefined {
  if (typeof s !== 'string') return s
  return s.length > MAX_STRING_LEN ? s.slice(0, MAX_STRING_LEN) + '...[truncated]' : s
}

/**
 * Scrubs a Sentry event in-place + returns it (or null to drop).
 * Use no `beforeSend` callback de cada sentry config.
 */
export function scrubSentryEvent(event: Event, _hint?: EventHint): Event | null {
  // 1. event.extra — payload livre que devs jogam
  if (event.extra) {
    event.extra = scrubSensitive(event.extra) as Record<string, unknown>
  }

  // 2. event.contexts — custom contexts (não touca os auto-injected como os, runtime)
  if (event.contexts) {
    const safeContextKeys = new Set(['os', 'runtime', 'device', 'browser', 'app', 'culture', 'trace'])
    for (const key of Object.keys(event.contexts)) {
      if (!safeContextKeys.has(key)) {
        event.contexts[key] = scrubSensitive(event.contexts[key]) as Record<string, unknown>
      }
    }
  }

  // 3. event.breadcrumbs — each breadcrumb.data scrubbed + message truncated
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((bc): Breadcrumb => ({
      ...bc,
      message: truncate(bc.message),
      data: bc.data ? (scrubSensitive(bc.data) as Record<string, unknown>) : bc.data,
    }))
  }

  // 4. event.user — preserva só id; dropa email, ip_address, username
  if (event.user) {
    const { id, segment } = event.user as { id?: string | number; segment?: string }
    event.user = id !== undefined ? { id, segment } : undefined
  }

  // 5. event.exception.values[].value — message body pode vazar PII (ex: error
  //    "user@example.com not found"). Truncate.
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map(v => ({
      ...v,
      value: truncate(v.value),
    }))
  }

  // 6. event.message — truncate
  if (typeof event.message === 'string') {
    event.message = truncate(event.message)
  }

  // 7. event.request — strip body (pode ter form data com cpf/email)
  if (event.request) {
    delete event.request.cookies
    if (event.request.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
      delete event.request.headers['x-api-key']
    }
    // request.data pode ter form fields PII — strip total
    if (event.request.data) {
      event.request.data = '[REDACTED]'
    }
    if (event.request.query_string && typeof event.request.query_string === 'string') {
      // Query strings podem ter ?email=foo@bar.com
      event.request.query_string = '[REDACTED]'
    }
  }

  return event
}

/**
 * Scrubs a breadcrumb antes de ele ser adicionado à queue.
 * Use no `beforeBreadcrumb` callback de cada sentry config.
 *
 * Pode retornar null pra droppar a breadcrumb inteira (ex: console.log de
 * dev que não devia ir pra Sentry).
 */
export function scrubSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  // Drop console breadcrumbs em prod — safeLog já filtra antes, mas
  // outros consoles de libs (ex: lib externa que faz console.log) podem
  // vazar payload. Em dev mantém pra debug.
  if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
    // Mantém só level >=warn (filtra logs verbosos)
    if (breadcrumb.level !== 'warning' && breadcrumb.level !== 'error' && breadcrumb.level !== 'fatal') {
      return null
    }
  }

  return {
    ...breadcrumb,
    message: truncate(breadcrumb.message),
    data: breadcrumb.data ? (scrubSensitive(breadcrumb.data) as Record<string, unknown>) : breadcrumb.data,
  }
}
