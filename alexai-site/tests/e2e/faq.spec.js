import { test, expect } from '@playwright/test';

test.describe('FAQ accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Scroll to FAQ section
    await page.evaluate(() => {
      const faq = document.querySelector('#faq, .faq-section, section[id*="faq"]');
      if (faq) faq.scrollIntoView({ behavior: 'instant' });
    });
  });

  test('first FAQ item expands on click', async ({ page }) => {
    const firstBtn = page.locator('.faq-question, .faq-q').first();
    await expect(firstBtn).toBeVisible();
    await firstBtn.click();
    // After click, aria-expanded should be true
    await expect(firstBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('FAQ button has aria-controls pointing to answer panel', async ({ page }) => {
    const firstBtn = page.locator('.faq-question[aria-controls]').first();
    const controls = await firstBtn.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    // The referenced element should exist
    const panel = page.locator(`#${controls}`);
    await expect(panel).toBeAttached();
  });

  test('only one FAQ item is open at a time', async ({ page }) => {
    const buttons = page.locator('.faq-question, .faq-q');
    const count = await buttons.count();
    if (count < 2) return;

    await buttons.nth(0).click();
    await buttons.nth(1).click();

    // First item should now be collapsed
    const firstExpanded = await buttons.nth(0).getAttribute('aria-expanded');
    const secondExpanded = await buttons.nth(1).getAttribute('aria-expanded');
    expect(secondExpanded).toBe('true');
    expect(firstExpanded).not.toBe('true');
  });

  test('all FAQ buttons have type="button"', async ({ page }) => {
    const buttons = page.locator('.faq-question, .faq-q');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveAttribute('type', 'button');
    }
  });
});
