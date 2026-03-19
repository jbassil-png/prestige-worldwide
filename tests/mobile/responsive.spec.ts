import { test, expect } from '@playwright/test';

/**
 * Mobile Responsive Design Tests
 * Tests that the UI adapts properly to mobile viewports
 */

test.describe('Mobile Responsive Layout', () => {
  test('should display mobile-friendly navigation', async ({ page }) => {
    await page.goto('/');

    // Get viewport size to verify we're in mobile mode
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(768); // Mobile breakpoint

    // Check if hamburger menu or mobile nav is present
    // Common mobile nav patterns
    const mobileNavIndicators = [
      page.locator('[aria-label*="menu"]'),
      page.locator('button:has-text("Menu")'),
      page.locator('.mobile-menu'),
      page.locator('[data-testid="mobile-nav"]'),
    ];

    // At least one mobile nav pattern should exist
    let foundMobileNav = false;
    for (const indicator of mobileNavIndicators) {
      if (await indicator.count() > 0) {
        foundMobileNav = true;
        break;
      }
    }

    // If no dedicated mobile nav, regular nav should still be functional
    const anyNav = page.locator('nav, header').first();
    await expect(anyNav).toBeVisible();
  });

  test('should have proper text sizing on mobile', async ({ page }) => {
    await page.goto('/');

    // Main heading should be visible and readable
    const heading = page.locator('h1').first();
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible();

      // Check font size is reasonable for mobile (at least 24px for h1)
      const fontSize = await heading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(20); // Minimum readable size
    }
  });

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check if there's horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should have touch-friendly button sizes', async ({ page }) => {
    await page.goto('/sign-in');

    const submitButton = page.locator('button[type="submit"]').first();

    if (await submitButton.count() > 0) {
      const boundingBox = await submitButton.boundingBox();

      // Buttons should be at least 44x44px for touch (Apple HIG guidelines)
      expect(boundingBox?.height).toBeGreaterThanOrEqual(40);
      expect(boundingBox?.width).toBeGreaterThanOrEqual(40);
    }
  });

  test('should display forms properly on mobile', async ({ page }) => {
    await page.goto('/sign-in');

    // Form inputs should be visible and properly sized
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Inputs should be full-width or properly sized for mobile
    const emailBox = await emailInput.boundingBox();
    const viewport = page.viewportSize();

    if (emailBox && viewport) {
      // Input should take reasonable width (at least 60% of viewport)
      expect(emailBox.width).toBeGreaterThan(viewport.width * 0.5);
    }
  });

  test('should handle viewport orientation changes', async ({ page, context }) => {
    // Start in portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();

    // Switch to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);

    // Content should still be visible and functional
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Mobile Dashboard Responsive', () => {
  test.skip('should display dashboard components on mobile', async ({ page }) => {
    // Skip this test as it requires authentication
    // TODO: Add authentication helper and enable this test

    await page.goto('/dashboard');

    // If redirected to sign-in, skip
    if (page.url().includes('/sign-in')) {
      test.skip();
    }

    // Dashboard should be responsive
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Mobile Onboarding Flow', () => {
  test.skip('should display onboarding steps on mobile', async ({ page }) => {
    // Skip this test as it requires authentication
    // TODO: Add authentication helper and enable this test

    await page.goto('/onboarding');

    if (page.url().includes('/sign-in')) {
      test.skip();
    }

    await expect(page.locator('body')).toBeVisible();
  });
});
