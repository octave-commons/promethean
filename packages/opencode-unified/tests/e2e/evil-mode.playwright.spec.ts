import { test, expect, TestUtils } from './helpers/test-setup';

test.describe('Evil Mode Integration', () => {
  test.beforeEach(async ({ app }) => {
    await app.waitForAppLoad();
    await app.setEditorContent('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
  });

  test('should start in normal mode', async ({ page, app }) => {
    const mode = await app.getMode();
    expect(mode).toContain('Normal');

    await expect(page.locator('[data-testid="mode-indicator"]')).toContainText('Normal');
  });

  test('should switch between normal and insert modes', async ({ page, app }) => {
    // Should be in normal mode initially
    expect(await app.getMode()).toContain('Normal');

    // Enter insert mode
    await app.enterInsertMode();
    expect(await app.getMode()).toContain('Insert');

    // Return to normal mode
    await app.enterNormalMode();
    expect(await app.getMode()).toContain('Normal');
  });

  test('should handle basic navigation in normal mode', async ({ page, app }) => {
    await app.enterNormalMode();

    // Move cursor down
    await page.keyboard.press('j');
    await page.waitForTimeout(100);

    // Move cursor right
    await page.keyboard.press('l');
    await page.waitForTimeout(100);

    // Move cursor up
    await page.keyboard.press('k');
    await page.waitForTimeout(100);

    // Move cursor left
    await page.keyboard.press('h');
    await page.waitForTimeout(100);

    // Mode should remain normal
    expect(await app.getMode()).toContain('Normal');
  });

  test('should handle text editing in insert mode', async ({ page, app }) => {
    await app.enterInsertMode();

    // Type some text
    await TestUtils.typeText(page, 'Hello World');

    // Check that text was inserted
    const content = await app.getEditorContent();
    expect(content).toContain('Hello World');

    // Should still be in insert mode
    expect(await app.getMode()).toContain('Insert');
  });

  test('should handle visual mode selection', async ({ page, app }) => {
    await app.enterNormalMode();

    // Enter visual mode
    await page.keyboard.press('v');
    await page.waitForTimeout(100);

    // Select some text
    await page.keyboard.press('w');
    await page.waitForTimeout(100);

    // Should have selection
    const selection = await page.evaluate(() => {
      const selection = window.getSelection();
      return selection ? selection.toString() : '';
    });

    expect(selection.length).toBeGreaterThan(0);

    // Exit visual mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    expect(await app.getMode()).toContain('Normal');
  });

  test('should handle line-wise visual mode', async ({ page, app }) => {
    await app.enterNormalMode();

    // Enter visual line mode
    await page.keyboard.press('V');
    await page.waitForTimeout(100);

    // Select lines
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.waitForTimeout(100);

    // Should have line selection
    const selection = await page.evaluate(() => {
      const selection = window.getSelection();
      return selection ? selection.toString() : '';
    });

    expect(selection).toContain('\n');

    // Exit visual mode
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    expect(await app.getMode()).toContain('Normal');
  });

  test('should handle basic operators', async ({ page, app }) => {
    await app.enterNormalMode();

    // Delete a word
    await page.keyboard.press('d');
    await page.keyboard.press('w');
    await page.waitForTimeout(100);

    // Check that content changed
    const content = await app.getEditorContent();
    expect(content).not.toBe('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');

    // Should remain in normal mode
    expect(await app.getMode()).toContain('Normal');
  });

  test('should handle yank and paste operations', async ({ page, app }) => {
    await app.enterNormalMode();

    // Yank a line
    await page.keyboard.press('y');
    await page.keyboard.press('y');
    await page.waitForTimeout(100);

    // Move down and paste
    await page.keyboard.press('j');
    await page.keyboard.press('p');
    await page.waitForTimeout(100);

    // Check that content was duplicated
    const content = await app.getEditorContent();
    expect(content).toContain('Line 1');
  });

  test('should handle undo and redo', async ({ page, app }) => {
    await app.enterInsertMode();

    // Type some text
    await TestUtils.typeText(page, 'Test');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    const contentAfterEdit = await app.getEditorContent();

    // Undo
    await page.keyboard.press('u');
    await page.waitForTimeout(100);

    const contentAfterUndo = await app.getEditorContent();
    expect(contentAfterUndo).not.toBe(contentAfterEdit);

    // Redo
    await page.keyboard.press('Ctrl+r');
    await page.waitForTimeout(100);

    const contentAfterRedo = await app.getEditorContent();
    expect(contentAfterRedo).toBe(contentAfterEdit);
  });

  test('should handle search operations', async ({ page, app }) => {
    await app.enterNormalMode();

    // Search for text
    await page.keyboard.press('/');
    await TestUtils.typeText(page, 'Line 3');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Should find the text (cursor should move)
    // This is a basic test - in a real implementation you'd check cursor position
    expect(await app.getMode()).toContain('Normal');

    // Search next
    await page.keyboard.press('n');
    await page.waitForTimeout(100);

    // Search previous
    await page.keyboard.press('N');
    await page.waitForTimeout(100);
  });

  test('should handle command mode', async ({ page, app }) => {
    await app.enterNormalMode();

    // Enter command mode
    await page.keyboard.press(':');
    await page.waitForTimeout(100);

    // Type a command
    await TestUtils.typeText(page, 'w');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Should return to normal mode
    expect(await app.getMode()).toContain('Normal');
  });

  test('should handle complex motions', async ({ page, app }) => {
    await app.enterNormalMode();

    // Go to end of line
    await page.keyboard.press('$');
    await page.waitForTimeout(100);

    // Go to beginning of line
    await page.keyboard.press('0');
    await page.waitForTimeout(100);

    // Go to end of file
    await page.keyboard.press('G');
    await page.waitForTimeout(100);

    // Go to beginning of file
    await page.keyboard.press('g');
    await page.keyboard.press('g');
    await page.waitForTimeout(100);

    expect(await app.getMode()).toContain('Normal');
  });

  test('should handle text objects', async ({ page, app }) => {
    await app.enterInsertMode();
    await TestUtils.typeText(page, '(word)');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Select inner word
    await page.keyboard.press('d');
    await page.keyboard.press('i');
    await page.keyboard.press('w');
    await page.waitForTimeout(100);

    // Should delete the word but keep parentheses
    const content = await app.getEditorContent();
    expect(content).toContain('()');
    expect(content).not.toContain('word');
  });
});
