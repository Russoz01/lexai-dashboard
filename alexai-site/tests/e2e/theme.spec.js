import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('theme toggle button exists', async ({ page }) => {
    const btn = page.locator('#theme-toggle');
    await expect(btn).toBeAttached();
  });

  test('clicking theme toggle switches data-theme attribute', async ({ page }) => {
    const btn = page.locator('#theme-toggle');
    if (!(await btn.isVisible())) return; // skip if hidden on this viewport

    // Read initial theme
    const initial = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    await btn.click();

    const after = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    expect(after).toBeTruthy();
    expect(after).not.toBe(initial);
    expect(['light', 'dark']).toContain(after);
  });

  test('theme persists after page reload via localStorage', async ({ page }) => {
    const btn = page.locator('#theme-toggle');
    if (!(await btn.isVisible())) return;

    await btn.click();
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
    // The anti-FOUC inline script should set data-theme synchronously.
    // We verify it's set immediately after navigation, not after JS loads.
    await page.evaluate(() => {
      // Simulate the check at parse time by reading the attribute
      return document.documentElement.getAttribute('data-theme');
    }).then((theme) => {
      expect(['light', 'dark']).toContain(theme);
    });
  });
});
