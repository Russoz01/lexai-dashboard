// Sentry SDK for the Edge Runtime (middleware.ts + edge API routes).
// Lightweight config — no tracing integrations the edge runtime can't run.

import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent, scrubSentryBreadcrumb } from './src/lib/sentry-scrub'

const DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    if (!DSN) return null
    // PII scrub completo (extra, contexts, breadcrumbs, user, request body)
    return scrubSentryEvent(event, hint)
  },
  beforeBreadcrumb(breadcrumb) {
    return scrubSentryBreadcrumb(breadcrumb)
  },
})
