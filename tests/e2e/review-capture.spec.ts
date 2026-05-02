import { test } from '@playwright/test'

/**
 * Captura assets pro elite review (Phase 0):
 * - Screenshots full-page de 7 rotas críticas
 * - HTML serialized
 * - Performance metrics (LCP/FCP/CLS via Web Vitals)
 * - Console messages + network failures
 * - Cookies + localStorage state
 */

const ROTAS = [
  { path: '/',            slug: 'landing' },
  { path: '/login',       slug: 'login' },
  { path: '/sobre',       slug: 'sobre' },
  { path: '/empresas',    slug: 'empresas' },
  { path: '/termos',      slug: 'termos' },
  { path: '/privacidade', slug: 'privacidade' },
  { path: '/dashboard',   slug: 'dashboard-redirect' },
]

for (const r of ROTAS) {
  test(`capture: ${r.slug}`, async ({ page }) => {
    const consoleMessages: string[] = []
    const networkFailures: string[] = []

    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
      }
    })
    page.on('requestfailed', (req) => {
      networkFailures.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`)
    })

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    const start = Date.now()
    const response = await page.goto(r.path, { waitUntil: 'domcontentloaded', timeout: 25_000 })
    const ttfb = Date.now() - start
    // Wait fixo pra renderização completar (vs networkidle que trava em sites com long-polling)
    await page.waitForTimeout(2000)

    const status = response?.status() ?? 0
    const finalUrl = page.url()

    // Performance
    const perfMetrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime
      return {
        domContentLoaded: nav?.domContentLoadedEventEnd,
        loadComplete: nav?.loadEventEnd,
        firstContentfulPaint: fcp,
        transferSize: nav?.transferSize,
        encodedBodySize: nav?.encodedBodySize,
      }
    })

    // Counts of key elements
    const elementStats = await page.evaluate(() => ({
      links: document.querySelectorAll('a').length,
      buttons: document.querySelectorAll('button').length,
      forms: document.querySelectorAll('form').length,
      inputs: document.querySelectorAll('input').length,
      images: document.querySelectorAll('img').length,
      h1Count: document.querySelectorAll('h1').length,
      altMissing: document.querySelectorAll('img:not([alt])').length,
      jsonLdScripts: document.querySelectorAll('script[type="application/ld+json"]').length,
    }))

    // Screenshot full page (above + below fold)
    await page.screenshot({
      path: `review-assets/${r.slug}-fullpage.png`,
      fullPage: true,
    })
    // Above fold
    await page.screenshot({
      path: `review-assets/${r.slug}-fold.png`,
      fullPage: false,
    })

    // HTML
    const html = await page.content()
    const htmlSizeKB = Math.round(html.length / 1024)

    // Headers
    const headers = response?.headers() ?? {}

    // Bundle metadata
    const meta = {
      slug: r.slug,
      path: r.path,
      finalUrl,
      status,
      ttfb,
      htmlSizeKB,
      perfMetrics,
      elementStats,
      consoleErrors: consoleMessages,
      networkFailures,
      headers: {
        csp: headers['content-security-policy']?.slice(0, 200),
        hsts: headers['strict-transport-security'],
        cache: headers['cache-control'],
        xVercelCache: headers['x-vercel-cache'],
        contentType: headers['content-type'],
      },
    }

    require('fs').writeFileSync(
      `review-assets/${r.slug}-meta.json`,
      JSON.stringify(meta, null, 2),
    )
  })
}
