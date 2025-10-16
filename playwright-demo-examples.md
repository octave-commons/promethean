# Playwright Web Automation Examples

## Available Playwright Tools in This Environment

Based on the configuration, this environment has:

- `@playwright/test` v1.55.1 - Standard Playwright testing framework
- `@playwright/mcp` v0.0.42 - MCP server for Playwright automation
- Playwright configuration in `packages/kanban/playwright.config.ts`

## Basic Playwright Setup

### 1. Installation (already done in this environment)

```bash
npm install @playwright/test
npx playwright install  # Install browser binaries
```

### 2. Configuration File

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## Practical Examples

### Example 1: Taking Screenshots

```typescript
// tests/screenshots.spec.ts
import { test } from '@playwright/test';

test('take screenshot of webpage', async ({ page }) => {
  // Navigate to a website
  await page.goto('https://example.com');

  // Take full page screenshot
  await page.screenshot({
    path: 'example-fullpage.png',
    fullPage: true,
  });

  // Take screenshot of specific element
  const element = page.locator('h1');
  await element.screenshot({ path: 'example-heading.png' });
});
```

### Example 2: Navigating Websites

```typescript
// tests/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('navigate and verify content', async ({ page }) => {
  // Navigate to URL
  await page.goto('https://github.com');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Verify URL
  expect(page.url()).toContain('github.com');

  // Verify title
  await expect(page).toHaveTitle(/GitHub/);

  // Navigate to specific section
  await page.goto('https://github.com/features');

  // Wait for specific element
  await page.waitForSelector('h1');
});
```

### Example 3: Filling Forms

```typescript
// tests/forms.spec.ts
import { test, expect } from '@playwright/test';

test('fill and submit form', async ({ page }) => {
  await page.goto('https://httpbin.org/forms/post');

  // Fill text inputs
  await page.fill('input[name="custname"]', 'John Doe');
  await page.fill('input[name="custtel"]', '555-123-4567');
  await page.fill('input[name="custemail"]', 'john@example.com');

  // Select dropdown
  await page.selectOption('select[name="size"]', 'medium');

  // Check radio button
  await page.check('input[value="small"]');

  // Check checkboxes
  await page.check('input[value="bacon"]');
  await page.check('input[value="cheese"]');

  // Fill textarea
  await page.fill('textarea', 'Special instructions: Deliver to front door');

  // Submit form
  await page.click('button[type="submit"]');

  // Verify submission
  await expect(page.locator('h1')).toContainText('POST');
});
```

### Example 4: Clicking Elements and Interactions

```typescript
// tests/interactions.spec.ts
import { test, expect } from '@playwright/test';

test('various click interactions', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/');

  // Simple click
  await page.click('a[href="/abtest"]');

  // Go back
  await page.goBack();

  // Double click
  await page.click('a[href="/add_remove_elements/"]');
  await page.click('button[onclick="addElement()"]');
  await page.dblclick('button[class="added-manually"]');

  // Right click
  await page.goBack();
  await page.click('a[href="/context_menu"]');
  await page.click('#hot-spot', { button: 'right' });

  // Hover
  await page.goBack();
  await page.click('a[href="/hovers"]');
  await page.hover('.figure:nth-child(3)');

  // Drag and drop
  await page.goBack();
  await page.click('a[href="/drag_and_drop"]');
  await page.dragAndDrop('#column-a', '#column-b');
});
```

### Example 5: Getting Page Content

```typescript
// tests/content.spec.ts
import { test, expect } from '@playwright/test';

test('extract page content', async ({ page }) => {
  await page.goto('https://example.com');

  // Get page title
  const title = await page.title();
  console.log('Page title:', title);

  // Get page URL
  const url = page.url();
  console.log('Current URL:', url);

  // Get text content
  const headingText = await page.locator('h1').textContent();
  console.log('Heading text:', headingText);

  // Get all text content
  const allText = await page.textContent('body');
  console.log('All text:', allText?.substring(0, 200) + '...');

  // Get specific attributes
  const href = await page.locator('a').getAttribute('href');
  console.log('First link href:', href);

  // Get inner HTML
  const html = await page.locator('div').innerHTML();
  console.log('Div HTML:', html);

  // Evaluate JavaScript in page context
  const result = await page.evaluate(() => {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  });
  console.log('Evaluated result:', result);
});
```

### Example 6: Waiting and Timeouts

```typescript
// tests/waiting.spec.ts
import { test, expect } from '@playwright/test';

test('various waiting strategies', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/1');

  // Click start button
  await page.click('#start');

  // Wait for element to be visible
  await page.waitForSelector('#finish', { state: 'visible' });

  // Wait for text to appear
  await page.waitForSelector('text=Hello World');

  // Wait for specific condition
  await page.waitForFunction(() => {
    return document.querySelector('#finish')?.textContent?.includes('Hello World');
  });

  // Wait for timeout
  await page.waitForTimeout(2000);

  // Wait for navigation
  await page.click('a[href="/dynamic_loading/2"]');
  await page.waitForURL('**/dynamic_loading/2');

  // Wait for load state
  await page.waitForLoadState('networkidle');
});
```

### Example 7: Handling Popups and Alerts

```typescript
// tests/popups.spec.ts
import { test, expect } from '@playwright/test';

test('handle popups and alerts', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  // Handle JavaScript alert
  page.on('dialog', async (dialog) => {
    console.log('Dialog message:', dialog.message());
    await dialog.accept(); // or dialog.dismiss()
  });

  await page.click('button[onclick="jsAlert()"]');

  // Handle confirmation dialog
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toBe('I am a JS Confirm');
    await dialog.accept();
  });

  await page.click('button[onclick="jsConfirm()"]');

  // Handle prompt dialog
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toBe('I am a JS prompt');
    await dialog.accept('Hello Playwright');
  });

  await page.click('button[onclick="jsPrompt()"]');

  // Handle new page/tab
  const [newPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.click('a[href="/windows/new"]'),
  ]);

  await newPage.waitForLoadState();
  console.log('New page title:', await newPage.title());
  await newPage.close();
});
```

### Example 8: File Uploads and Downloads

```typescript
// tests/files.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test('file upload and download', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');

  // Upload file
  const filePath = path.join(__dirname, 'test-file.txt');
  await page.setInputFiles('#file-upload', filePath);
  await page.click('#file-submit');

  // Verify upload
  await expect(page.locator('h3')).toHaveText('File Uploaded!');

  // Download file
  await page.goto('https://the-internet.herokuapp.com/download');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a[href="download/some-file.txt"]'),
  ]);

  // Save download
  const downloadPath = await download.path();
  console.log('Downloaded to:', downloadPath);

  // Get download as buffer
  const buffer = await download.createReadStream();
  console.log('File size:', (await download.failure()) || 'Success');
});
```

## Running the Examples

### Command Line Usage

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/screenshots.spec.ts

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run in headed mode (show browser)
npx playwright test --headed

# Run with debugging
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

### Using in This Environment

Since this is a Promethean Framework project, you can run tests using:

```bash
# From project root
pnpm --filter @promethean/kanban test

# Or if you're in the kanban package directory
pnpm test

# Install browsers if needed
npx playwright install
```

## Best Practices

1. **Use Locators**: Prefer `page.locator()` over `page.$()` for better performance
2. **Wait Strategically**: Use explicit waits over fixed timeouts
3. **Handle Asynchronous Operations**: Use `Promise.all()` for navigation and waiting
4. **Use Data Selectors**: Prefer test IDs over CSS selectors when possible
5. **Clean Up**: Always close pages and contexts in teardown
6. **Retry Logic**: Configure retries for flaky tests
7. **Screenshots**: Enable screenshots for debugging failed tests

## MCP Integration

When the Playwright MCP server is running, you can use it for:

- Automated web scraping
- Form filling automation
- Screenshot generation
- Content extraction
- End-to-end testing

The MCP tools would typically include:

- `playwright_navigate` - Navigate to URLs
- `playwright_screenshot` - Take screenshots
- `playwright_click` - Click elements
- `playwright_fill` - Fill form fields
- `playwright_getContent` - Extract page content
- `playwright_wait` - Wait for elements/conditions
