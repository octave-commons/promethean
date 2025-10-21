import { chromium } from '@playwright/test';

async function runPlaywrightDemo() {
  console.log('🚀 Starting Playwright Demo...');

  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Set to true for headless mode
    slowMo: 1000, // Slow down actions for visibility
  });

  try {
    // Create new page
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('📸 Demo 1: Taking Screenshots');

    // Navigate to example.com
    await page.goto('https://example.com');
    console.log('✅ Navigated to example.com');

    // Take full page screenshot
    await page.screenshot({
      path: 'demo-fullpage.png',
      fullPage: true,
    });
    console.log('📸 Full page screenshot saved');

    // Take element screenshot
    const heading = page.locator('h1');
    await heading.screenshot({ path: 'demo-heading.png' });
    console.log('📸 Element screenshot saved');

    console.log('🌐 Demo 2: Navigation and Content');

    // Navigate to GitHub
    await page.goto('https://github.com');
    console.log('✅ Navigated to GitHub');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get page title
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Get search box and fill it
    const searchBox = page.locator('[name="q"]');
    await searchBox.fill('playwright');
    console.log('🔍 Filled search box with "playwright"');

    // Take screenshot of search
    await page.screenshot({ path: 'demo-search-filled.png' });

    console.log('📝 Demo 3: Form Interaction');

    // Navigate to a test form
    await page.goto('https://httpbin.org/forms/post');

    // Fill form fields
    await page.fill('input[name="custname"]', 'Playwright Demo User');
    await page.fill('input[name="custtel"]', '555-123-4567');
    await page.fill('input[name="custemail"]', 'demo@playwright.com');

    // Select dropdown
    await page.selectOption('select[name="size"]', 'large');

    // Check radio button
    await page.check('input[value="large"]');

    // Check checkboxes
    await page.check('input[value="bacon"]');
    await page.check('input[value="cheese"]');

    // Fill textarea
    await page.fill('textarea', 'Demo submission from Playwright automation script');

    console.log('✅ Form filled successfully');

    // Take screenshot of filled form
    await page.screenshot({ path: 'demo-form-filled.png' });

    console.log('🔗 Demo 4: Clicking Elements');

    // Go back to GitHub
    await page.goto('https://github.com');

    // Click on Sign in button
    await page.click('a[href="/login"]');
    console.log('✅ Clicked Sign In button');

    // Wait for login page to load
    await page.waitForSelector('input[name="login"]');

    // Take screenshot of login page
    await page.screenshot({ path: 'demo-login-page.png' });

    console.log('📊 Demo 5: Content Extraction');

    // Extract page information
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        userAgent: navigator.userAgent,
        forms: document.querySelectorAll('form').length,
        inputs: document.querySelectorAll('input').length,
        links: document.querySelectorAll('a').length,
      };
    });

    console.log('📊 Page Information:', pageInfo);

    // Get all form field labels
    const labels = await page.locator('label').allTextContents();
    console.log('📝 Form labels:', labels);

    console.log('🎉 Demo completed successfully!');
  } catch (error) {
    console.error('❌ Error during demo:', error);
  } finally {
    // Close browser
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

// Run the demo
runPlaywrightDemo().catch(console.error);
