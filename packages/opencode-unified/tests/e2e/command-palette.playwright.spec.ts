import { test, expect, TestUtils } from './helpers/test-setup';

test.describe('Command Palette Integration', () => {
  test.beforeEach(async ({ app }) => {
    await app.waitForAppLoad();
  });

  test('should open command palette with keyboard shortcut', async ({ page, app }) => {
    await app.openCommandPalette();

    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="command-palette-input"]')).toBeFocused();
  });

  test('should close command palette with Escape', async ({ page, app }) => {
    await app.openCommandPalette();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="command-palette"]')).not.toBeVisible();
  });

  test('should filter commands as user types', async ({ page, app }) => {
    await app.openCommandPalette();

    // Type to filter
    await TestUtils.typeText(page, 'buffer');
    await page.waitForTimeout(200);

    // Should show filtered results
    const itemCount = await page.locator('[data-testid="command-palette-item"]').count();
    expect(itemCount).toBeGreaterThan(0);

    // Check that results contain the filter term
    const firstResult = await page
      .locator('[data-testid="command-palette-item"]')
      .first()
      .textContent();
    expect(firstResult?.toLowerCase()).toContain('buffer');
  });

  test('should navigate command list with keyboard', async ({ page, app }) => {
    await app.openCommandPalette();

    // Wait for commands to load
    await page.waitForTimeout(500);

    // Navigate down
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // Check that first item is selected
    const firstItem = page.locator('[data-testid="command-palette-item"]').first();
    await expect(firstItem).toHaveClass(/selected/);

    // Navigate up
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // Navigate back down
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
  });

  test('should execute buffer.new command', async ({ page, app }) => {
    const initialBuffer = await app.getCurrentBuffer();

    await app.executeCommand('buffer.new');

    // Should show buffer name dialog
    await expect(page.locator('[data-testid="buffer-name-input"]')).toBeVisible();

    // Enter buffer name
    await page.fill('[data-testid="buffer-name-input"]', 'test-buffer.txt');
    await page.press('[data-testid="buffer-name-input"]', 'Enter');

    // Should create new buffer
    await page.waitForTimeout(500);
    const currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('test-buffer.txt');
    expect(currentBuffer).not.toBe(initialBuffer);
  });

  test('should execute workspace.save command', async ({ page, app }) => {
    // Set some content first
    await app.setEditorContent('Test content for saving');

    // Execute save command
    await app.executeCommand('workspace.save');

    // Command should execute without errors
    await page.waitForTimeout(500);

    // Should show some indication of save (status message, etc.)
    // This depends on the actual implementation
  });

  test('should execute theme.toggle command', async ({ page, app }) => {
    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Toggle theme
    await app.executeCommand('theme.toggle');

    await page.waitForTimeout(500);

    // Theme should change
    const newTheme = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    expect(newTheme).not.toBe(initialTheme);
  });

  test('should show recently used commands', async ({ page, app }) => {
    // Execute a command first
    await app.executeCommand('workspace.save');
    await page.waitForTimeout(500);

    // Open command palette again
    await app.openCommandPalette();

    // Should show recently used commands
    await expect(page.locator('[data-testid="recent-command"]')).toBeVisible();
  });

  test('should handle command execution errors gracefully', async ({ page, app }) => {
    await app.openCommandPalette();

    // Try to execute a non-existent command
    await TestUtils.typeText(page, 'non.existent.command');
    await page.keyboard.press('Enter');

    // Should show error message
    await expect(page.locator('[data-testid="command-error"]')).toBeVisible();

    // Should not crash the application
    await expect(page.locator('#app')).toBeVisible();
  });

  test('should maintain focus management', async ({ page, app }) => {
    // Focus on editor first
    await page.click('.editor');
    await expect(page.locator('.editor')).toBeFocused();

    // Open command palette
    await app.openCommandPalette();

    // Focus should move to command palette
    await expect(page.locator('[data-testid="command-palette-input"]')).toBeFocused();

    // Close command palette
    await page.keyboard.press('Escape');

    // Focus should return to editor
    await expect(page.locator('.editor')).toBeFocused();
  });

  test('should handle keyboard shortcuts in command palette', async ({ page, app }) => {
    await app.openCommandPalette();

    // Type some text
    await TestUtils.typeText(page, 'buffer');

    // Clear with Ctrl+A
    await page.keyboard.press('Control+a');
    await TestUtils.typeText(page, 'theme');

    // Should filter to theme commands
    await page.waitForTimeout(200);
    const firstResult = await page
      .locator('[data-testid="command-palette-item"]')
      .first()
      .textContent();
    expect(firstResult?.toLowerCase()).toContain('theme');
  });

  test('should show command descriptions', async ({ page, app }) => {
    await app.openCommandPalette();

    // Wait for commands to load
    await page.waitForTimeout(500);

    // Hover over a command
    const firstCommand = page.locator('[data-testid="command-palette-item"]').first();
    await firstCommand.hover();

    // Should show description
    await expect(page.locator('[data-testid="command-description"]')).toBeVisible();
  });

  test('should handle command categories', async ({ page, app }) => {
    await app.openCommandPalette();

    // Should show category headers
    await expect(page.locator('[data-testid="command-category"]')).toBeVisible();

    // Categories should be grouped
    const categories = await page.locator('[data-testid="command-category"]').count();
    expect(categories).toBeGreaterThan(0);
  });
});
