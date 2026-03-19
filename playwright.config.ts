import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for mobile testing
 * Focuses on mobile viewports and touch interactions
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: 'html',

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major mobile browsers and devices
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Mobile Chrome user agent
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
        // iOS Safari user agent
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      },
    },

    {
      name: 'iPhone 13 Pro',
      use: { ...devices['iPhone 13 Pro'] },
    },

    {
      name: 'iPhone 12',
      use: { ...devices['iPhone 12'] },
    },

    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Galaxy S9+',
      use: { ...devices['Galaxy S9+'] },
    },

    // Tablet testing
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro'] },
    },

    {
      name: 'iPad Mini',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
