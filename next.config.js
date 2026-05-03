const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3006', process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || ''].filter(Boolean),
    },
    // Required so instrumentation.ts loads the server/edge Sentry configs
    instrumentationHook: true,
  },
  async headers() {
    // CSP updated: + Sentry CDN/ingest, + Marketing pixels (Meta/GA4/LinkedIn)
    // pra Agent D MarketingPixels.tsx funcionar sem CSP block.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://browser.sentry-cdn.com https://js.sentry-cdn.com https://static.cloudflareinsights.com https://www.clarity.ms https://*.clarity.ms https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://snap.licdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.stripe.com https://app.posthog.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://www.clarity.ms https://*.clarity.ms https://cloudflareinsights.com https://www.facebook.com https://*.facebook.com https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://px.ads.linkedin.com https://snap.licdn.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://www.facebook.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

// Sentry build-time wrapper. Uploads source maps during vercel build so
// stack traces in the dashboard point to real code, and hides .map files
// from end users. The org/project match the DSN's Sentry account.
const sentryWebpackPluginOptions = {
  org: 'lex-ai-ux',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
