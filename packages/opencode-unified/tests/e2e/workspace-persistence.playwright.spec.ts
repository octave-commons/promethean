import { test, expect } from './helpers/test-setup';

test.describe('Workspace Persistence Integration', () => {
  test.beforeEach(async ({ app }) => {
    await app.waitForAppLoad();
  });

  test('should save workspace state', async ({ page, app }) => {
    // Create some buffers
    await app.createBuffer('workspace-test-1.txt', 'Content 1');
    await app.createBuffer('workspace-test-2.txt', 'Content 2');

    // Save workspace
    await app.executeCommand('workspace.save');

    await page.waitForTimeout(500);

    // Should show save confirmation
    await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible();
  });

  test('should load workspace state', async ({ page, app }) => {
    // First save a workspace
    await app.createBuffer('load-test.txt', 'Content to load');
    await app.executeCommand('workspace.save');
    await page.waitForTimeout(500);

    // Clear current state (simulate fresh start)
    await app.executeCommand('workspace.new');
    await page.waitForTimeout(300);

    // Load workspace
    await app.executeCommand('workspace.load');

    await page.waitForTimeout(500);

    // Should show load dialog
    await expect(page.locator('[data-testid="workspace-load-dialog"]')).toBeVisible();

    // Select and load the workspace
    await page.click('[data-testid="workspace-item"]');
    await page.click('[data-testid="load-workspace-button"]');

    await page.waitForTimeout(500);

    // Should restore buffers
    const currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('load-test.txt');

    const content = await app.getEditorContent();
    expect(content).toContain('Content to load');
  });

  test('should auto-save workspace', async ({ page, app }) => {
    // Enable auto-save
    await app.executeCommand('workspace.auto-save.enable');

    await page.waitForTimeout(300);

    // Create a buffer
    await app.createBuffer('auto-save-test.txt', 'Auto-save content');

    // Wait for auto-save to trigger
    await page.waitForTimeout(2000);

    // Should show auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible();
  });

  test('should handle workspace export/import', async ({ page, app }) => {
    // Create workspace with content
    await app.createBuffer('export-test.txt', 'Export content');
    await app.executeCommand('workspace.save');
    await page.waitForTimeout(500);

    // Export workspace
    await app.executeCommand('workspace.export');

    await page.waitForTimeout(500);

    // Should show export dialog
    await expect(page.locator('[data-testid="export-dialog"]')).toBeVisible();

    // Choose export format and export
    await page.selectOption('[data-testid="export-format"]', 'json');
    await page.click('[data-testid="export-button"]');

    await page.waitForTimeout(500);

    // Should show export success
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
  });

  test('should maintain workspace history', async ({ page, app }) => {
    // Create multiple workspace states
    await app.createBuffer('history-1.txt', 'History content 1');
    await app.executeCommand('workspace.save');
    await page.waitForTimeout(500);

    await app.createBuffer('history-2.txt', 'History content 2');
    await app.executeCommand('workspace.save');
    await page.waitForTimeout(500);

    // Check workspace history
    await app.executeCommand('workspace.history');

    await page.waitForTimeout(500);

    // Should show history dialog
    await expect(page.locator('[data-testid="workspace-history"]')).toBeVisible();

    // Should have multiple history entries
    const historyEntries = await page.locator('[data-testid="history-entry"]').count();
    expect(historyEntries).toBeGreaterThan(1);
  });

  test('should handle workspace snapshots', async ({ page, app }) => {
    // Create content
    await app.createBuffer('snapshot-test.txt', 'Snapshot content');

    // Create snapshot
    await app.executeCommand('workspace.snapshot.create');

    await page.waitForTimeout(500);

    // Should show snapshot dialog
    await expect(page.locator('[data-testid="snapshot-dialog"]')).toBeVisible();

    // Enter snapshot name
    await page.fill('[data-testid="snapshot-name"]', 'test-snapshot');
    await page.click('[data-testid="create-snapshot-button"]');

    await page.waitForTimeout(500);

    // Should show snapshot success
    await expect(page.locator('[data-testid="snapshot-success"]')).toBeVisible();

    // List snapshots
    await app.executeCommand('workspace.snapshot.list');

    await page.waitForTimeout(500);

    // Should show our snapshot
    await expect(page.locator('[data-testid="snapshot-item-test-snapshot"]')).toBeVisible();
  });

  test('should handle workspace settings persistence', async ({ page, app }) => {
    // Open workspace settings
    await app.executeCommand('workspace.settings');

    await page.waitForTimeout(500);

    // Should show settings dialog
    await expect(page.locator('[data-testid="workspace-settings"]')).toBeVisible();

    // Change some settings
    await page.check('[data-testid="auto-save-enabled"]');
    await page.fill('[data-testid="auto-save-interval"]', '30');

    // Save settings
    await page.click('[data-testid="save-settings-button"]');

    await page.waitForTimeout(500);

    // Reopen settings to verify persistence
    await app.executeCommand('workspace.settings');
    await page.waitForTimeout(500);

    // Settings should be preserved
    await expect(page.locator('[data-testid="auto-save-enabled"]')).toBeChecked();
    await expect(page.locator('[data-testid="auto-save-interval"]')).toHaveValue('30');
  });

  test('should handle workspace backup and recovery', async ({ page, app }) => {
    // Create workspace
    await app.createBuffer('backup-test.txt', 'Backup content');
    await app.executeCommand('workspace.save');
    await page.waitForTimeout(500);

    // Create backup
    await app.executeCommand('workspace.backup.create');

    await page.waitForTimeout(500);

    // Should show backup dialog
    await expect(page.locator('[data-testid="backup-dialog"]')).toBeVisible();

    // Create backup
    await page.click('[data-testid="create-backup-button"]');

    await page.waitForTimeout(500);

    // Should show backup success
    await expect(page.locator('[data-testid="backup-success"]')).toBeVisible();

    // Simulate workspace corruption and recovery
    await app.executeCommand('workspace.backup.restore');

    await page.waitForTimeout(500);

    // Should show restore dialog
    await expect(page.locator('[data-testid="restore-dialog"]')).toBeVisible();

    // Restore from backup
    await page.click('[data-testid="backup-item"]');
    await page.click('[data-testid="restore-button"]');

    await page.waitForTimeout(500);

    // Should restore content
    const currentBuffer = await app.getCurrentBuffer();
    expect(currentBuffer).toContain('backup-test.txt');

    const content = await app.getEditorContent();
    expect(content).toContain('Backup content');
  });

  test('should handle workspace synchronization', async ({ page, app }) => {
    // Enable sync
    await app.executeCommand('workspace.sync.enable');

    await page.waitForTimeout(500);

    // Should show sync configuration
    await expect(page.locator('[data-testid="sync-config"]')).toBeVisible();

    // Configure sync (mock)
    await page.selectOption('[data-testid="sync-provider"]', 'local');
    await page.click('[data-testid="enable-sync-button"]');

    await page.waitForTimeout(500);

    // Should show sync status
    await expect(page.locator('[data-testid="sync-status"]')).toBeVisible();

    // Create content to sync
    await app.createBuffer('sync-test.txt', 'Sync content');

    // Trigger sync
    await app.executeCommand('workspace.sync.now');

    await page.waitForTimeout(1000);

    // Should show sync indicator
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
  });

  test('should handle workspace cleanup', async ({ page, app }) => {
    // Create multiple workspaces/snapshots
    for (let i = 1; i <= 3; i++) {
      await app.createBuffer(`cleanup-test-${i}.txt`, `Content ${i}`);
      await app.executeCommand('workspace.save');
      await app.executeCommand('workspace.snapshot.create');
      await page.fill('[data-testid="snapshot-name"]', `snapshot-${i}`);
      await page.click('[data-testid="create-snapshot-button"]');
      await page.waitForTimeout(300);
    }

    // Run cleanup
    await app.executeCommand('workspace.cleanup');

    await page.waitForTimeout(500);

    // Should show cleanup dialog
    await expect(page.locator('[data-testid="cleanup-dialog"]')).toBeVisible();

    // Select cleanup options
    await page.check('[data-testid="cleanup-old-snapshots"]');
    await page.check('[data-testid="cleanup-temp-files"]');

    // Run cleanup
    await page.click('[data-testid="run-cleanup-button"]');

    await page.waitForTimeout(1000);

    // Should show cleanup results
    await expect(page.locator('[data-testid="cleanup-results"]')).toBeVisible();
  });

  test('should handle workspace migration', async ({ page, app }) => {
    // Create workspace in old format (simulate)
    await app.createBuffer('migration-test.txt', 'Migration content');

    // Trigger migration
    await app.executeCommand('workspace.migrate');

    await page.waitForTimeout(500);

    // Should show migration dialog
    await expect(page.locator('[data-testid="migration-dialog"]')).toBeVisible();

    // Start migration
    await page.click('[data-testid="start-migration-button"]');

    await page.waitForTimeout(1000);

    // Should show migration progress
    await expect(page.locator('[data-testid="migration-progress"]')).toBeVisible();

    // Should complete migration
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="migration-complete"]')).toBeVisible();

    // Content should be preserved
    const content = await app.getEditorContent();
    expect(content).toContain('Migration content');
  });
});
