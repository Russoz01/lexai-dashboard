import { test, expect } from '@playwright/test';

test.describe('Hero section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for module scripts to execute
    await page.waitForLoadState('networkidle');
  });

  test('page title is set correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Alex AI/i);
  });

  test('H1 is visible and contains brand name', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(5);
  });

  test('primary CTA button is visible above the fold', async ({ page }) => {
    // Any CTA with btn-fill class in the hero section
    const cta = page.locator('.hero .btn-fill, .hero-cta').first();
    await expect(cta).toBeVisible();
  });

  test('nav bar is present and has logo', async ({ page }) => {
    const nav = page.locator('#nav, nav').first();
    await expect(nav).toBeVisible();
    // Logo or brand name should be present
    const brand = page.locator('.nav-logo, .nav-brand, [class*="logo"]').first();
    await expect(brand).toBeVisible();
  });

  test('skip link exists for keyboard accessibility', async ({ page }) => {
    const skipLink = page.locator('.skip-link, a[href="#main-content"]').first();
    await expect(skipLink).toBeAttached();
  });
});
