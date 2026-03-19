import { test, expect } from '@playwright/test';

/**
 * Mobile Viewport Tests
 * Tests various mobile viewport sizes and breakpoints
 */

const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12/13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  { name: 'Google Pixel 5', width: 393, height: 851 },
];

for (const viewport of mobileViewports) {
  test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height }
    });

    test('should load homepage correctly', async ({ page }) => {
      await page.goto('/');

      // Page should load without errors
      await expect(page).toHaveTitle(/Prestige Worldwide/);

      // Main content should be visible
      await expect(page.locator('body')).toBeVisible();

      // Should not have horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('should load sign-in page correctly', async ({ page }) => {
      await page.goto('/sign-in');

      // Form should be visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // No horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('should handle form interactions', async ({ page }) => {
      await page.goto('/sign-in');

      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      // Should be able to type in inputs
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');

      await passwordInput.fill('password123');
      await expect(passwordInput).toHaveValue('password123');
    });
  });
}

test.describe('Tablet Viewports', () => {
  const tabletViewports = [
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
  ];

  for (const viewport of tabletViewports) {
    test(`should render properly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      await expect(page).toHaveTitle(/Prestige Worldwide/);

      // Should not have horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});

test.describe('Landscape Mode', () => {
  test('should handle landscape orientation', async ({ page }) => {
    // Set landscape orientation (width > height)
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();

    // Should not have horizontal scroll even in landscape
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should display sign-in form in landscape', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/sign-in');

    // Form should still be usable in landscape
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
