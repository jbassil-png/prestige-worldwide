import { test, expect } from '@playwright/test';

/**
 * Mobile Performance Tests
 * Tests page load times, resource sizes, and mobile-specific performance metrics
 */

test.describe('Mobile Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds on mobile
    expect(loadTime).toBeLessThan(5000);

    console.log(`Homepage loaded in ${loadTime}ms`);
  });

  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    // This will redirect to sign-in if not authenticated
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);

    console.log(`Dashboard/Sign-in loaded in ${loadTime}ms`);
  });

  test('should not load excessive resources', async ({ page }) => {
    const resources: any[] = [];

    // Track all network requests
    page.on('response', response => {
      resources.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type'],
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Log total number of resources
    console.log(`Total resources loaded: ${resources.length}`);

    // Should not load hundreds of resources on mobile
    expect(resources.length).toBeLessThan(150);

    // Count failed requests
    const failedRequests = resources.filter(r => r.status >= 400);
    console.log(`Failed requests: ${failedRequests.length}`);

    // Should have minimal failed requests
    expect(failedRequests.length).toBeLessThan(5);
  });

  test('should have reasonable page weight', async ({ page }) => {
    let totalSize = 0;
    const resourceSizes: { url: string; size: number }[] = [];

    page.on('response', async response => {
      try {
        const buffer = await response.body();
        const size = buffer.length;
        totalSize += size;

        // Track large resources
        if (size > 100000) { // > 100KB
          resourceSizes.push({
            url: response.url(),
            size: Math.round(size / 1024), // KB
          });
        }
      } catch (e) {
        // Some responses might not have a body
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const totalSizeMB = totalSize / (1024 * 1024);
    console.log(`Total page weight: ${totalSizeMB.toFixed(2)} MB`);

    // Page should be under 5MB on mobile (reasonable for modern mobile connections)
    expect(totalSizeMB).toBeLessThan(5);

    // Log large resources
    if (resourceSizes.length > 0) {
      console.log('Large resources (> 100KB):');
      resourceSizes.forEach(r => {
        console.log(`  ${r.size}KB - ${r.url.substring(0, 100)}`);
      });
    }
  });

  test('should be interactive quickly', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');

    // Try to interact with a button
    const signInButton = page.locator('a[href="/sign-in"]').first();

    // Should be clickable quickly
    await expect(signInButton).toBeVisible({ timeout: 3000 });
    await expect(signInButton).toBeEnabled({ timeout: 1000 });
  });
});

test.describe('Mobile Image Optimization', () => {
  test('should load optimized images', async ({ page }) => {
    const images: { url: string; size: number }[] = [];

    page.on('response', async response => {
      const contentType = response.headers()['content-type'];

      // Check if it's an image
      if (contentType?.startsWith('image/')) {
        try {
          const buffer = await response.body();
          images.push({
            url: response.url(),
            size: Math.round(buffer.length / 1024), // KB
          });
        } catch (e) {
          // Skip if can't get body
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Total images loaded: ${images.length}`);

    // Check for overly large images on mobile
    const largeImages = images.filter(img => img.size > 500); // > 500KB

    if (largeImages.length > 0) {
      console.log('Large images detected (> 500KB):');
      largeImages.forEach(img => {
        console.log(`  ${img.size}KB - ${img.url.substring(0, 100)}`);
      });
    }

    // Warn if there are very large images
    const veryLargeImages = images.filter(img => img.size > 1000); // > 1MB
    expect(veryLargeImages.length).toBe(0); // Should not have images > 1MB on mobile
  });
});

test.describe('Mobile Accessibility', () => {
  test('should have proper tap target sizes', async ({ page }) => {
    await page.goto('/');

    // Find all interactive elements
    const buttons = await page.locator('button, a').all();

    let smallTargets = 0;

    for (const button of buttons) {
      const box = await button.boundingBox();

      if (box) {
        // Apple HIG recommends 44x44pt minimum for touch targets
        if (box.width < 40 || box.height < 40) {
          smallTargets++;
        }
      }
    }

    // Most buttons should meet minimum touch target size
    console.log(`Interactive elements with small touch targets: ${smallTargets}/${buttons.length}`);

    // Allow some small targets (e.g., inline links), but most should be properly sized
    if (buttons.length > 0) {
      const percentageSmall = (smallTargets / buttons.length) * 100;
      expect(percentageSmall).toBeLessThan(30); // Less than 30% should be small
    }
  });

  test('should support mobile screen readers', async ({ page }) => {
    await page.goto('/');

    // Check for proper semantic HTML
    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');

    // Should have semantic structure
    const hasMain = await main.count() > 0;
    const hasNav = await nav.count() > 0;

    expect(hasMain || hasNav).toBe(true); // At least one semantic element
  });

  test('should have proper focus management on mobile', async ({ page }) => {
    await page.goto('/sign-in');

    const emailInput = page.locator('input[type="email"]');

    // Should be able to focus inputs
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    // Tab to next input
    await page.keyboard.press('Tab');

    // Should move focus to password or submit button
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    const passwordFocused = await passwordInput.evaluate(el => el === document.activeElement);
    const submitFocused = await submitButton.evaluate(el => el === document.activeElement);

    expect(passwordFocused || submitFocused).toBe(true);
  });
});
