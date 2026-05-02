import { test, expect } from '@playwright/test'

/**
 * Smoke tests — Wave C5 (2026-05-02)
 *
 * Foco: garantir que páginas críticas carregam, APIs respondem, e elementos
 * visuais essenciais aparecem. Sem auth flow (ficaria pra depois do demo).
 *
 * Roda contra:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test  (local)
 *   PLAYWRIGHT_BASE_URL=https://www.vanixcorp.com npx playwright test  (prod)
 */

test.describe('Smoke: páginas públicas', () => {
  test('landing page carrega e renderiza hero', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Pralvex/i)
    // Skip-link de acessibilidade existe
    await expect(page.locator('.skip-link')).toBeAttached()
  })

  test('login page carrega', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.ok()).toBeTruthy()
    // Form de login deve existir
    await expect(page.locator('input[type="email"], input[name*="email" i]').first()).toBeVisible()
  })

  test('dashboard sem auth redireciona para login', async ({ page }) => {
    await page.goto('/dashboard')
    // Espera redirect pra /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('página /sobre renderiza', async ({ page }) => {
    const response = await page.goto('/sobre')
    expect(response?.ok()).toBeTruthy()
  })

  test('página /termos renderiza', async ({ page }) => {
    const response = await page.goto('/termos')
    expect(response?.ok()).toBeTruthy()
  })

  test('página /privacidade renderiza', async ({ page }) => {
    const response = await page.goto('/privacidade')
    expect(response?.ok()).toBeTruthy()
  })
})

test.describe('Smoke: APIs públicas', () => {
  test('/api/health retorna ok com env e supabase', async ({ request }) => {
    const response = await request.get('/api/health')
    // Aceita 200 ou 503 — em local sem env opcional pode ser degraded
    expect([200, 503]).toContain(response.status())
    const body = await response.json()
    expect(body.checks?.app?.ok).toBe(true)
    expect(body.checks?.supabase?.ok).toBe(true)
  })

  test('/api/health expõe checks de Anthropic/Stripe/crypto/sentry (Wave R1)', async ({ request }) => {
    const response = await request.get('/api/health')
    const body = await response.json()
    expect(body.checks).toHaveProperty('anthropic')
    expect(body.checks).toHaveProperty('stripe')
    expect(body.checks).toHaveProperty('stripe_webhook')
    expect(body.checks).toHaveProperty('crypto')
    expect(body.checks).toHaveProperty('sentry')
  })

  test('/api/health inclui version e region', async ({ request }) => {
    const response = await request.get('/api/health')
    const body = await response.json()
    expect(typeof body.version).toBe('string')
    expect(typeof body.region).toBe('string')
    expect(typeof body.timestamp).toBe('string')
  })

  test('/api/chat sem auth retorna 401', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { mensagem: 'teste' },
    })
    expect(response.status()).toBe(401)
  })

  test('/api/resumir sem auth retorna 401', async ({ request }) => {
    const response = await request.post('/api/resumir', {
      data: { texto: 'teste com mais de 100 caracteres '.repeat(10) },
    })
    expect(response.status()).toBe(401)
  })

  test('/sitemap.xml renderiza', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.ok()).toBeTruthy()
  })

  test('/robots.txt renderiza', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.ok()).toBeTruthy()
  })
})

test.describe('Smoke: 404 e edge cases', () => {
  test('rota inexistente retorna 404', async ({ page }) => {
    const response = await page.goto('/rota-que-nao-existe-xyz', { waitUntil: 'commit' })
    expect(response?.status()).toBe(404)
  })

  test('JSON-LD structured data aparece no head', async ({ page }) => {
    await page.goto('/')
    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    expect(await jsonLdScripts.count()).toBeGreaterThan(0)
  })
})

test.describe('Smoke: security headers (Wave R1)', () => {
  test('CSP header presente + permite Supabase/Anthropic/Stripe', async ({ page }) => {
    const response = await page.goto('/')
    const csp = response?.headers()['content-security-policy']
    expect(csp, 'CSP missing').toBeTruthy()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain('https://*.supabase.co')
    expect(csp).toContain('https://api.anthropic.com')
    expect(csp).toContain('https://js.stripe.com')
  })

  test('headers de segurança configurados', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers() ?? {}
    expect(headers['x-frame-options']?.toUpperCase()).toBe('DENY')
    expect(headers['x-content-type-options']?.toLowerCase()).toBe('nosniff')
    expect(headers['referrer-policy']).toBeTruthy()
    expect(headers['strict-transport-security']).toContain('max-age=')
    expect(headers['permissions-policy']).toContain('camera=()')
  })
})

test.describe('Smoke: payload de erro genérico (não vaza schema)', () => {
  test('/api/chat 401 não vaza estrutura interna', async ({ request }) => {
    const response = await request.post('/api/chat', { data: { mensagem: 'x' } })
    expect(response.status()).toBe(401)
    const body = await response.json().catch(() => ({}))
    const json = JSON.stringify(body).toLowerCase()
    // 401 não deve vazar nomes de tabela, IDs internos, plan codes
    expect(json).not.toContain('plan_upgrade_required')
    expect(json).not.toContain('usuarios')
    expect(json).not.toContain('auth_user_id')
  })
})
