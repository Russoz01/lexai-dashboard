import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page has a single H1', async ({ page }) => {
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('all images have alt attributes', async ({ page }) => {
    const imgs = page.locator('img:not([alt])');
    const count = await imgs.count();
    expect(count).toBe(0);
  });

  test('skip link is in the DOM and points to #main-content', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"], .skip-link').first();
    await expect(skipLink).toBeAttached();
    const href = await skipLink.getAttribute('href');
    expect(href).toBe('#main-content');
    // The target element should exist
    const target = page.locator('#main-content');
    await expect(target).toBeAttached();
  });

  test('interactive elements have accessible names', async ({ page }) => {
    // Nav toggle should have aria-label
    const navToggle = page.locator('#nav-toggle');
    if (await navToggle.isVisible()) {
      const label = await navToggle.getAttribute('aria-label');
      const text = await navToggle.textContent();
      expect(label || text?.trim()).toBeTruthy();
    }

    // Theme toggle should have aria-label
    const themeBtn = page.locator('#theme-toggle');
    if (await themeBtn.isVisible()) {
      const label = await themeBtn.getAttribute('aria-label');
      expect(label).toBeTruthy();
    }
  });

  test('footer contains legal CNPJ info', async ({ page }) => {
    await page.evaluate(() =>
      document.querySelector('footer')?.scrollIntoView({ behavior: 'instant' })
    );
    const footer = page.locator('footer');
    const footerText = await footer.textContent();
    expect(footerText).toMatch(/CNPJ/i);
    expect(footerText).toMatch(/em processo de abertura/i);
  });
});
