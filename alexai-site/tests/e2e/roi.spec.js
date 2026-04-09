import { test, expect } from '@playwright/test';

test.describe('ROI Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Scroll to ROI calculator
    await page.evaluate(() => {
      const roi = document.querySelector('#roi, .roi-calc, section[id*="roi"]');
      if (roi) roi.scrollIntoView({ behavior: 'instant' });
    });
    // Give JS time to initialize
    await page.waitForTimeout(300);
  });

  test('ROI calculator inputs are present', async ({ page }) => {
    await expect(page.locator('#roi-leads')).toBeAttached();
    await expect(page.locator('#roi-ticket')).toBeAttached();
    await expect(page.locator('#roi-conv')).toBeAttached();
  });

  test('ROI result elements render initial values', async ({ page }) => {
    const loss = page.locator('#roi-loss');
    const gain = page.locator('#roi-gain');
    await expect(loss).toBeVisible();
    await expect(gain).toBeVisible();
    // Values should contain R$ (Brazilian currency)
    const lossText = await loss.textContent();
    expect(lossText).toMatch(/R\$/);
  });

  test('dynamic CTA updates when ROI is calculated', async ({ page }) => {
    const ctaText = page.locator('.roi-cta-dynamic .roi-cta-text');
    await expect(ctaText).toBeAttached();

    // Set a scenario with high lead volume → should trigger "Recuperar" text
    await page.fill('#roi-leads', '100');
    await page.dispatchEvent('#roi-leads', 'input');
    await page.waitForTimeout(100);

    const text = await ctaText.textContent();
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(10);
  });

  test('ROI payback period renders after interaction', async ({ page }) => {
    const payback = page.locator('#roi-payback');
    await expect(payback).toBeVisible();

    await page.fill('#roi-leads', '50');
    await page.dispatchEvent('#roi-leads', 'input');

    const text = await payback.textContent();
    expect(text).toBeTruthy();
    // Should say "dias", "> 1 ano", or "ajuste os valores"
    expect(text).toMatch(/dias|ano|ajuste/i);
  });
});
