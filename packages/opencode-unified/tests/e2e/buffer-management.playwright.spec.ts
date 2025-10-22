import { test, expect, TestUtils } from './helpers/test-setup';

test.describe('Buffer Management Integration', () => {
  test.beforeEach(async ({ app }) => {
    await app.waitForAppLoad();
  });

  test('should create new buffer', async ({ page, app }) => {
    const initialBuffer = await app.getCurrentBuffer();

    await app.createBuffer('test.txt', 'Hello World');

    const currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('test.txt');
    expect(currentBuffer).not.toBe(initialBuffer);

    const content = await app.getEditorContent();
    expect(content).toContain('Hello World');
  });

  test('should switch between buffers', async ({ page, app }) => {
    // Create first buffer
    await app.createBuffer('first.txt', 'Content 1');

    // Create second buffer
    await app.createBuffer('second.txt', 'Content 2');

    // Switch back to first buffer
    await app.switchToBuffer('first.txt');

    const currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('first.txt');

    const content = await app.getEditorContent();
    expect(content).toContain('Content 1');
  });

  test('should maintain separate content for each buffer', async ({ page, app }) => {
    // Create buffers with different content
    await app.createBuffer('buffer1.txt', 'Content for buffer 1');
    await app.createBuffer('buffer2.txt', 'Content for buffer 2');

    // Switch to buffer1
    await app.switchToBuffer('buffer1.txt');
    let content = await app.getEditorContent();
    expect(content).toContain('Content for buffer 1');

    // Switch to buffer2
    await app.switchToBuffer('buffer2.txt');
    content = await app.getEditorContent();
    expect(content).toContain('Content for buffer 2');

    // Switch back to buffer1
    await app.switchToBuffer('buffer1.txt');
    content = await app.getEditorContent();
    expect(content).toContain('Content for buffer 1');
  });

  test('should show buffer tabs', async ({ page, app }) => {
    await app.createBuffer('test1.txt');
    await app.createBuffer('test2.txt');
    await app.createBuffer('test3.txt');

    // Should show all buffer tabs
    await expect(page.locator('.buffer-tab')).toHaveCount(3);

    // Should have active tab indicator
    await expect(page.locator('.buffer-tab.active')).toBeVisible();
  });

  test('should close buffer', async ({ page, app }) => {
    await app.createBuffer('to-close.txt', 'This will be closed');
    await app.createBuffer('keep.txt', 'This will stay');

    // Close the first buffer
    await app.executeCommand('buffer.close');

    // Should switch to remaining buffer
    const currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('keep.txt');

    // Should not show closed buffer in tabs
    await expect(page.locator('[data-testid="buffer-tab-to-close.txt"]')).not.toBeVisible();
  });

  test('should handle buffer modifications', async ({ page, app }) => {
    await app.createBuffer('modified.txt', 'Original content');

    // Modify the buffer
    await app.enterInsertMode();
    await TestUtils.typeText(page, ' - modified');
    await page.keyboard.press('Escape');

    const content = await app.getEditorContent();
    expect(content).toContain('Original content - modified');

    // Should show modified indicator
    await expect(page.locator('[data-testid="buffer-modified"]')).toBeVisible();
  });

  test('should save buffer content', async ({ page, app }) => {
    await app.createBuffer('save-test.txt', 'Content to save');

    // Modify content
    await app.enterInsertMode();
    await TestUtils.typeText(page, ' - saved');
    await page.keyboard.press('Escape');

    // Save buffer
    await app.executeCommand('buffer.save');

    await page.waitForTimeout(500);

    // Modified indicator should disappear
    await expect(page.locator('[data-testid="buffer-modified"]')).not.toBeVisible();
  });

  test('should handle buffer switching with unsaved changes', async ({ page, app }) => {
    await app.createBuffer('unsaved.txt', 'Unsaved content');

    // Modify but don't save
    await app.enterInsertMode();
    await TestUtils.typeText(page, ' - modified');
    await page.keyboard.press('Escape');

    // Try to switch to another buffer
    await app.createBuffer('other.txt', 'Other content');

    // Should prompt to save (depending on implementation)
    // For now, just verify it doesn't crash
    await expect(page.locator('#app')).toBeVisible();
  });

  test('should handle buffer search', async ({ page, app }) => {
    await app.createBuffer('search-test.txt', 'Line 1\nSearch term here\nLine 3');

    // Search within buffer
    await app.executeCommand('buffer.search');

    // Should show search dialog
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

    // Enter search term
    await page.fill('[data-testid="search-input"]', 'Search term');
    await page.press('[data-testid="search-input"]', 'Enter');

    await page.waitForTimeout(500);

    // Should highlight search results
    await expect(page.locator('[data-testid="search-highlight"]')).toBeVisible();
  });

  test('should handle buffer splitting', async ({ page, app }) => {
    await app.createBuffer('split-test.txt', 'Content for split test');

    // Split buffer
    await app.executeCommand('buffer.split');

    await page.waitForTimeout(500);

    // Should show multiple editor panes
    await expect(page.locator('.editor-pane')).toHaveCount(2);

    // Both panes should show the same buffer
    const pane1Content = await page
      .locator('.editor-pane')
      .first()
      .locator('.editor-content')
      .textContent();
    const pane2Content = await page
      .locator('.editor-pane')
      .nth(1)
      .locator('.editor-content')
      .textContent();

    expect(pane1Content).toBe(pane2Content);
  });

  test('should handle buffer navigation history', async ({ page, app }) => {
    await app.createBuffer('history1.txt', 'History test 1');
    await app.createBuffer('history2.txt', 'History test 2');
    await app.createBuffer('history3.txt', 'History test 3');

    // Navigate back through history
    await app.executeCommand('buffer.previous');
    await page.waitForTimeout(200);

    let currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('history2.txt');

    // Navigate forward through history
    await app.executeCommand('buffer.next');
    await page.waitForTimeout(200);

    currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('history3.txt');
  });

  test('should handle buffer renaming', async ({ page, app }) => {
    await app.createBuffer('old-name.txt', 'Content for rename test');

    // Rename buffer
    await app.executeCommand('buffer.rename');

    // Should show rename dialog
    await expect(page.locator('[data-testid="rename-input"]')).toBeVisible();

    // Enter new name
    await page.fill('[data-testid="rename-input"]', 'new-name.txt');
    await page.press('[data-testid="rename-input"]', 'Enter');

    await page.waitForTimeout(500);

    // Buffer should be renamed
    const currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('new-name.txt');

    // Content should be preserved
    const content = await app.getEditorContent();
    expect(content).toContain('Content for rename test');
  });

  test('should handle buffer duplication', async ({ page, app }) => {
    await app.createBuffer('original.txt', 'Original content');

    // Duplicate buffer
    await app.executeCommand('buffer.duplicate');

    await page.waitForTimeout(500);

    // Should have both buffers
    await expect(page.locator('.buffer-tab')).toHaveCount(2);

    // Content should be the same in both
    await app.switchToBuffer('original.txt');
    const originalContent = await app.getEditorContent();

    await app.switchToBuffer('original copy.txt'); // Assuming this is the naming convention
    const duplicatedContent = await app.getEditorContent();

    expect(originalContent).toBe(duplicatedContent);
  });
});
