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
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.checks?.env?.ok).toBe(true)
    expect(body.checks?.supabase?.ok).toBe(true)
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
