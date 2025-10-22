import { test, expect, TestUtils } from './helpers/test-setup';

test.describe('Application Load and Initialization', () => {
  test('should load the application successfully', async ({ page, app }) => {
    await app.waitForAppLoad();

    // Check that the main app container is present
    await expect(page.locator('#app')).toBeVisible();

    // Check that loading message is gone
    await expect(page.locator('.loading')).not.toBeVisible();

    // Take screenshot for visual verification
    await TestUtils.takeScreenshot(page, 'app-loaded');
  });

  test('should initialize all UI components', async ({ page, app }) => {
    await app.waitForAppLoad();

    // Check for essential UI components
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.editor')).toBeVisible();
    await expect(page.locator('.status-bar')).toBeVisible();

    // Check for mode indicator
    await expect(page.locator('[data-testid="mode-indicator"]')).toBeVisible();
  });

  test('should have proper layout structure', async ({ page, app }) => {
    await app.waitForAppLoad();

    const layoutInfo = await app.getLayoutInfo();

    expect(layoutInfo.layout.headerVisible).toBe(true);
    expect(layoutInfo.layout.statusBarVisible).toBe(true);
    expect(layoutInfo.dimensions.editorWidth).toBeGreaterThan(0);
    expect(layoutInfo.dimensions.statusBarHeight).toBeGreaterThan(0);
  });

  test('should handle window resize gracefully', async ({ page, app }) => {
    await app.waitForAppLoad();

    // Resize window
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);

    // Check that layout adapts
    const layoutInfo = await app.getLayoutInfo();
    expect(layoutInfo.dimensions.editorWidth).toBeGreaterThan(0);

    // Resize back
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
  });

  test('should load without JavaScript errors', async ({ page, app }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await app.waitForAppLoad();

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('should have proper accessibility attributes', async ({ page, app }) => {
    await app.waitForAppLoad();

    // Check for proper ARIA labels
    await expect(page.locator('[role="application"]')).toBeVisible();

    // Check for keyboard navigation support
    const tabbableElements = await page.locator('[tabindex]').count();
    expect(tabbableElements).toBeGreaterThan(0);

    // Run basic accessibility check
    const mainElement = await page.locator('[role="application"]').isVisible();
    expect(mainElement).toBe(true);
  });
});
