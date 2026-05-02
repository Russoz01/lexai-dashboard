// Sentry SDK runs in the browser — captures React errors, unhandled promise
// rejections, and (optionally) performance traces from real users.
//
// Sampling is tuned for a paid product: keep ALL errors, sample 10% of traces
// to stay under the free-tier quota. Bump tracesSampleRate when you start
// caring about perf drilldowns.

import * as Sentry from '@sentry/nextjs'

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: DSN,
  // Per-environment isolation so dev noise doesn't pollute prod
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Keep errors. Sample 10% of performance spans.
  tracesSampleRate: 0.1,
  // Record sessions only when an error happens — keeps replay quota safe
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,    // LGPD — never leak client data
      maskAllInputs: true,  // P1 audit fix: form inputs (CPF, email, senha) nunca em replay
      blockAllMedia: true,
    }),
  ],

  // Filter noise that isn't ours
  ignoreErrors: [
    // Browser extensions throwing in our pages
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network flakes — Sentry shouldn't alert for user's bad wifi
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    // User navigated away mid-request
    'AbortError',
    'The user aborted a request',
    // Safari private mode
    'QuotaExceededError',
    // react-dom hydration mismatch is already logged by Next
    'Minified React error #418',
    'Minified React error #423',
  ],
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
  ],

  // Drop events before sending if they match sensitive contexts
  beforeSend(event) {
    // Never ship error reports when DSN isn't configured locally
    if (!DSN) return null
    return event
  },
})
