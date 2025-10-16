import { test, expect } from '@playwright/test';

test.describe('Playwright Quick Demo', () => {
  test('basic navigation and screenshot', async ({ page }) => {
    // Navigate to example.com
    await page.goto('https://example.com');

    // Verify title
    await expect(page).toHaveTitle('Example Domain');

    // Take screenshot
    await page.screenshot({
      path: 'example-screenshot.png',
      fullPage: true,
    });

    // Get heading text
    const heading = await page.locator('h1').textContent();
    console.log('Page heading:', heading);

    // Get paragraph text
    const paragraph = await page.locator('p').textContent();
    console.log('Page paragraph:', paragraph);
  });

  test('form interaction simulation', async ({ page }) => {
    // Navigate to a test form
    await page.goto('https://httpbin.org/forms/post');

    // Fill form fields
    await page.fill('input[name="custname"]', 'Test User');
    await page.fill('input[name="custtel"]', '555-0123');
    await page.fill('input[name="custemail"]', 'test@example.com');

    // Select options
    await page.selectOption('select[name="size"]', 'medium');
    await page.check('input[value="small"]');

    // Fill textarea
    await page.fill('textarea', 'This is a test submission from Playwright');

    // Take screenshot before submission
    await page.screenshot({ path: 'form-filled.png' });

    // Submit form (commented out to avoid actual submission)
    // await page.click('button[type="submit"]');

    console.log('Form filled successfully');
  });

  test('content extraction', async ({ page }) => {
    await page.goto('https://github.com/explore');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get all repository links
    const repoLinks = await page.locator('a[href*="/"]').allTextContents();
    console.log('Found links:', repoLinks.slice(0, 5)); // Show first 5

    // Get page metrics
    const metrics = await page.evaluate(() => ({
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      links: document.querySelectorAll('a').length,
    }));

    console.log('Page metrics:', metrics);

    // Take screenshot of explore page
    await page.screenshot({ path: 'github-explore.png', fullPage: false });
  });
});
