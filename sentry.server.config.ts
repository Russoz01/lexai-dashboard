// Sentry SDK running in the Node.js server (API routes, Server Components,
// Route Handlers). Captures unhandled exceptions from the backend + any
// explicit Sentry.captureException() calls we make inside api-response
// serverError() and the global error boundary.

import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent, scrubSentryBreadcrumb } from './src/lib/sentry-scrub'

const DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Errors: 100%. Traces: 10% (enough to spot slow endpoints without burning quota).
  tracesSampleRate: 0.1,

  // Exclude health check + static metadata routes from performance traces.
  // They run constantly and would drown out real request traces.
  tracesSampler: (samplingContext) => {
    const name = samplingContext.transactionContext?.name || ''
    if (name.includes('/api/health')) return 0
    if (name.includes('/sitemap.xml') || name.includes('/robots.txt')) return 0
    return 0.1
  },

  ignoreErrors: [
    // User cancelled a streaming Anthropic call — not actionable
    'AbortError',
    'The operation was aborted',
  ],

  beforeSend(event, hint) {
    if (!DSN) return null
    // PII scrub completo (extra, contexts, breadcrumbs, user, request body)
    return scrubSentryEvent(event, hint)
  },

  beforeBreadcrumb(breadcrumb) {
    return scrubSentryBreadcrumb(breadcrumb)
  },
})
