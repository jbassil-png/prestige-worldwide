# Mobile Testing Guide

Comprehensive mobile testing setup for Prestige Worldwide using Playwright.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Coverage](#test-coverage)
- [Running Tests](#running-tests)
- [Mobile Devices Tested](#mobile-devices-tested)
- [Writing Mobile Tests](#writing-mobile-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Prestige Worldwide uses **Playwright** for automated mobile testing with:

- ✅ Multiple mobile device emulation (iPhone, Pixel, Galaxy)
- ✅ Touch interaction testing
- ✅ Responsive design validation
- ✅ Mobile performance monitoring
- ✅ Accessibility checks for mobile
- ✅ Cross-viewport testing

---

## Quick Start

### 1. Install Playwright Browsers

```bash
npx playwright install
```

This will download Chromium, Firefox, and WebKit browsers optimized for mobile emulation.

### 2. Run Mobile Tests

```bash
# Run all mobile tests
npm run test:mobile

# Run on specific mobile browser
npm run test:mobile:chrome   # Android Chrome
npm run test:mobile:safari   # iOS Safari

# Run with visible browser (headed mode)
npm run test:mobile:headed

# Debug tests interactively
npm run test:mobile:debug
```

### 3. View Test Results

```bash
npm run test:report
```

Opens an HTML report with screenshots, traces, and detailed results.

---

## Test Coverage

### Authentication (`tests/mobile/auth.spec.ts`)

✅ Homepage loading on mobile devices
✅ Sign-up page navigation and form display
✅ Sign-in page navigation and form display
✅ Form validation and error handling
✅ Mobile-friendly input focus and interaction
✅ Protected route middleware (dashboard, onboarding)
✅ Touch events and tap interactions
✅ Mobile scrolling behavior

### Responsive Design (`tests/mobile/responsive.spec.ts`)

✅ Mobile navigation visibility
✅ Proper text sizing for mobile readability
✅ No horizontal scroll on mobile viewports
✅ Touch-friendly button sizes (44x44px minimum)
✅ Form input responsiveness
✅ Viewport orientation changes (portrait ↔ landscape)
✅ Dashboard component mobile layout
✅ Onboarding flow mobile display

### Viewport Testing (`tests/mobile/viewport.spec.ts`)

✅ iPhone SE (375x667)
✅ iPhone 12/13 (390x844)
✅ iPhone 14 Pro Max (430x932)
✅ Samsung Galaxy S20 (360x800)
✅ Google Pixel 5 (393x851)
✅ iPad Mini (768x1024)
✅ iPad Pro (1024x1366)
✅ Landscape orientation handling

### Performance (`tests/mobile/performance.spec.ts`)

✅ Page load time monitoring (< 5s target)
✅ Resource count optimization (< 150 resources)
✅ Total page weight tracking (< 5MB target)
✅ Failed request monitoring
✅ Time to interactive measurement
✅ Image optimization checks (< 1MB per image)
✅ Touch target size validation (Apple HIG 44x44pt)
✅ Mobile accessibility (semantic HTML, focus management)

---

## Running Tests

### All Mobile Tests

```bash
npm run test:mobile
```

Runs the complete mobile test suite across all configured devices.

### Specific Test Files

```bash
# Authentication tests only
npx playwright test tests/mobile/auth.spec.ts

# Responsive design tests only
npx playwright test tests/mobile/responsive.spec.ts

# Viewport tests only
npx playwright test tests/mobile/viewport.spec.ts

# Performance tests only
npx playwright test tests/mobile/performance.spec.ts
```

### Specific Devices

```bash
# Run on iPhone 13
npx playwright test --project='iPhone 13'

# Run on Pixel 5
npx playwright test --project='Pixel 5'

# Run on iPad Pro
npx playwright test --project='iPad Pro'
```

### Debug Mode

```bash
# Interactive debugging
npm run test:mobile:debug

# Or with specific test
npx playwright test tests/mobile/auth.spec.ts --debug
```

This opens Playwright Inspector for step-by-step debugging.

### UI Mode (Recommended for Development)

```bash
npm run test:ui
```

Opens Playwright's interactive UI for:
- Running tests selectively
- Watching test execution
- Time-travel debugging
- Viewing traces and screenshots

---

## Mobile Devices Tested

### Smartphones

| Device | Viewport | User Agent | Project Name |
|--------|----------|------------|--------------|
| **iPhone SE** | 375×667 | iOS Safari | Manual config |
| **iPhone 12** | 390×844 | iOS Safari | `iPhone 12` |
| **iPhone 13** | 390×844 | iOS Safari | `iPhone 13` |
| **iPhone 13 Pro** | 390×844 | iOS Safari | `iPhone 13 Pro` |
| **Pixel 5** | 393×851 | Chrome Mobile | `Pixel 5` |
| **Galaxy S9+** | 412×846 | Chrome Mobile | `Galaxy S9+` |

### Tablets

| Device | Viewport | User Agent | Project Name |
|--------|----------|------------|--------------|
| **iPad Mini** | 768×1024 | iPad Safari | `iPad Mini` |
| **iPad Pro** | 1024×1366 | iPad Safari | `iPad Pro` |

### Custom Projects

- **Mobile Chrome**: Pixel 5 with Android Chrome UA
- **Mobile Safari**: iPhone 13 with iOS Safari UA

---

## Writing Mobile Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mobile Feature', () => {
  test('should work on mobile', async ({ page }) => {
    await page.goto('/');

    // Your test logic
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Mobile-Specific Interactions

```typescript
// Tap (mobile click)
await page.locator('button').tap();

// Swipe/scroll
await page.evaluate(() => window.scrollBy(0, 500));

// Check viewport size
const viewport = page.viewportSize();
expect(viewport?.width).toBeLessThan(768); // Mobile breakpoint
```

### Testing Responsive Layouts

```typescript
// Check for horizontal scroll
const hasHorizontalScroll = await page.evaluate(() => {
  return document.documentElement.scrollWidth >
         document.documentElement.clientWidth;
});
expect(hasHorizontalScroll).toBe(false);

// Check touch target sizes
const button = page.locator('button[type="submit"]');
const box = await button.boundingBox();
expect(box?.height).toBeGreaterThanOrEqual(44); // Apple HIG
```

### Testing Multiple Viewports

```typescript
const viewports = [
  { name: 'iPhone', width: 390, height: 844 },
  { name: 'Pixel', width: 393, height: 851 },
];

for (const viewport of viewports) {
  test(`should work on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    // Test logic
  });
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Mobile Tests

on: [push, pull_request]

jobs:
  mobile-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run mobile tests
        run: npm run test:mobile

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Vercel Integration

Add to `.vercel/project.json`:

```json
{
  "buildCommand": "npm run build && npm run test:mobile",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./"
}
```

---

## Test Configuration

### Playwright Config (`playwright.config.ts`)

Key settings:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Environment Variables

```bash
# Test against production
PLAYWRIGHT_TEST_BASE_URL=https://prestige-worldwide-kappa.vercel.app npm run test:mobile

# CI mode (more retries, stricter checks)
CI=true npm run test:mobile
```

---

## Troubleshooting

### Browser Installation Issues

```bash
# Install with dependencies
npx playwright install --with-deps

# Install specific browser
npx playwright install chromium
```

### Tests Timing Out

Increase timeout in `playwright.config.ts`:

```typescript
use: {
  actionTimeout: 10000, // 10 seconds
  navigationTimeout: 30000, // 30 seconds
}
```

### Flaky Tests

1. Add explicit waits:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('button');
```

2. Increase retries in config:
```typescript
retries: 2
```

### Screenshots Not Showing

Screenshots are only taken on failure. To always capture:

```typescript
use: {
  screenshot: 'on', // Always take screenshots
}
```

### Debugging Failed Tests

```bash
# Run with UI mode
npm run test:ui

# Run specific failing test with debug
npx playwright test tests/mobile/auth.spec.ts:15 --debug

# Generate trace
npx playwright test --trace on
```

---

## Performance Metrics

### Current Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| Homepage load | < 5s | `performance.spec.ts` |
| Dashboard load | < 5s | `performance.spec.ts` |
| Total resources | < 150 | `performance.spec.ts` |
| Page weight | < 5MB | `performance.spec.ts` |
| Image size | < 1MB each | `performance.spec.ts` |
| Touch targets | ≥ 40×40px | `performance.spec.ts` |

### Monitoring Performance

```bash
# Run performance tests with console output
npx playwright test tests/mobile/performance.spec.ts --reporter=list
```

Check console for:
- Page load times
- Resource counts
- Large file warnings
- Failed request counts

---

## Next Steps

### Planned Enhancements

- [ ] Visual regression testing with Percy/Applitools
- [ ] Real device testing via BrowserStack/Sauce Labs
- [ ] Network condition simulation (3G, 4G, offline)
- [ ] Battery consumption testing
- [ ] Touch gesture testing (pinch, zoom, swipe)
- [ ] Integration with Lighthouse for mobile audits

### Adding New Tests

1. Create test file in `tests/mobile/`
2. Follow existing patterns
3. Run locally to verify
4. Add to CI pipeline
5. Document in this guide

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Mobile Testing Best Practices](https://playwright.dev/docs/test-mobile)
- [Device Descriptors](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json)
- [Apple HIG - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/touchscreen-gestures)
- [Material Design - Touch Targets](https://m3.material.io/foundations/interaction/gestures)

---

## Support

**Issues or Questions?**

- 📖 Check [Playwright docs](https://playwright.dev)
- 🐛 [Report test issues](https://github.com/yourusername/prestige-worldwide/issues)
- 💬 Ask in team chat or project discussions

---

**Last Updated:** March 2026
**Playwright Version:** 1.58+
**Test Coverage:** 50+ mobile test scenarios
