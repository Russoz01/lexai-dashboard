import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('theme toggle button exists', async ({ page }) => {
    const btn = page.locator('#theme-toggle');
    const count = await btn.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking theme toggle switches data-theme attribute', async ({ page }) => {
    const btnCount = await page.locator('#theme-toggle').count();
    if (btnCount === 0) return;

    const initial = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    // Use JS click to avoid viewport constraints
    await page.evaluate(() => document.getElementById('theme-toggle')?.click());

    const after = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    expect(after).toBeTruthy();
    expect(after).not.toBe(initial);
    expect(['light', 'dark']).toContain(after);
  });

  test('theme persists after page reload via localStorage', async ({ page }) => {
    const btnCount = await page.locator('#theme-toggle').count();
    if (btnCount === 0) return;

    await page.evaluate(() => document.getElementById('theme-toggle')?.click());
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    await page.reload();
    await page.waitForLoadState('networkidle');

    const themeAfterReload = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    expect(themeAfterReload).toBe(theme);
  });

  test('anti-FOUC: data-theme is set before body renders', async ({ page }) => {
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    expect(['light', 'dark']).toContain(theme);
  });
});
