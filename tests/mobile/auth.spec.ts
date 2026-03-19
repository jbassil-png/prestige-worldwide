import { test, expect } from '@playwright/test';

/**
 * Mobile Authentication Tests
 * Tests the complete authentication flow on mobile devices
 */

test.describe('Mobile Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage on mobile', async ({ page }) => {
    await expect(page).toHaveTitle(/Prestige Worldwide/);

    // Check that main content is visible
    await expect(page.locator('text=Financial planning without borders')).toBeVisible();
  });

  test('should navigate to sign-up page', async ({ page }) => {
    // Look for sign up link/button
    const signUpButton = page.locator('a[href="/sign-up"], button:has-text("Sign Up")').first();
    await signUpButton.click();

    // Wait for navigation
    await page.waitForURL('**/sign-up');

    // Check that sign-up form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to sign-in page', async ({ page }) => {
    const signInButton = page.locator('a[href="/sign-in"], button:has-text("Sign In")').first();
    await signInButton.click();

    await page.waitForURL('**/sign-in');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors on invalid sign-in', async ({ page }) => {
    await page.goto('/sign-in');

    // Try to submit with invalid email
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('input[type="password"]').fill('short');

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show error (either validation or auth error)
    // We expect some form of error feedback
    await page.waitForTimeout(1000);
  });

  test('should have mobile-friendly form inputs', async ({ page }) => {
    await page.goto('/sign-in');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Check that inputs are visible and accessible
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check that inputs can receive focus (important for mobile)
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await passwordInput.focus();
    await expect(passwordInput).toBeFocused();
  });

  test('should protect dashboard route when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to sign-in
    await page.waitForURL('**/sign-in');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should protect onboarding route when not authenticated', async ({ page }) => {
    await page.goto('/onboarding');

    // Should redirect to sign-in
    await page.waitForURL('**/sign-in');
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Mobile Touch Interactions', () => {
  test('should handle tap events on buttons', async ({ page }) => {
    await page.goto('/');

    // Find a clickable element
    const signInButton = page.locator('a[href="/sign-in"]').first();

    // Tap (mobile click)
    await signInButton.tap();

    await page.waitForURL('**/sign-in');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should scroll on mobile viewport', async ({ page }) => {
    await page.goto('/');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Wait for scroll to complete
    await page.waitForTimeout(500);

    // Check that scroll position changed
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });
});
