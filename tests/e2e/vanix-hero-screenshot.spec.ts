import { test } from '@playwright/test'

/**
 * Captura 3 screenshots do hero Vanix pra mostrar parallax + stagger.
 * Roda contra prod: PLAYWRIGHT_BASE_URL=https://pralvex.com.br
 */

test('vanix hero screenshots', async ({ page }) => {
  // Force motion (default desktop, sem prefers-reduced-motion)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1440, height: 900 })

  // Bypass Vercel CDN cache com query string única
  const nocache = `?_v=${Date.now()}`
  await page.goto(`/vanix-hero-demo${nocache}`, { waitUntil: 'networkidle' })

  // Wait stagger entrance complete (~1.5s)
  await page.waitForTimeout(1800)

  // 1. Hero estático no topo (entrance completa)
  await page.screenshot({
    path: 'screenshots/vanix-hero-1-top.png',
    fullPage: false,
  })

  // 2. Mid-scroll — mostra parallax (headline desliza, glow desce)
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }))
  await page.waitForTimeout(400)
  await page.screenshot({
    path: 'screenshots/vanix-hero-2-mid-scroll.png',
    fullPage: false,
  })

  // 3. Hero quase saindo (opacity fade quase 0)
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }))
  await page.waitForTimeout(400)
  await page.screenshot({
    path: 'screenshots/vanix-hero-3-scrolled.png',
    fullPage: false,
  })
})
