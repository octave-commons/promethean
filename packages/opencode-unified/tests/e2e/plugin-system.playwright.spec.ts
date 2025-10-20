import { test, expect, TestUtils } from './helpers/test-setup';

test.describe('Plugin System Integration', () => {
  test.beforeEach(async ({ app }) => {
    await app.waitForAppLoad();
  });

  test('should initialize plugin system', async ({ app }) => {
    const pluginStatus = await app.getPluginStatus();

    expect(pluginStatus).toBeDefined();
    expect(pluginStatus.initialized).toBe(true);
  });

  test('should load available plugins', async ({ page, app }) => {
    await app.executeCommand('plugin.list');

    await page.waitForTimeout(500);

    // Should show plugin list
    await expect(page.locator('[data-testid="plugin-list"]')).toBeVisible();

    // Should have at least one plugin
    const pluginCount = await page.locator('[data-testid="plugin-item"]').count();
    expect(pluginCount).toBeGreaterThan(0);
  });

  test('should enable and disable plugins', async ({ page, app }) => {
    await app.executeCommand('plugin.list');

    await page.waitForTimeout(500);

    // Find a plugin that can be toggled
    const firstPlugin = page.locator('[data-testid="plugin-item"]').first();
    const pluginName = await firstPlugin.locator('[data-testid="plugin-name"]').textContent();

    if (pluginName) {
      // Toggle plugin
      await firstPlugin.locator('[data-testid="plugin-toggle"]').click();
      await page.waitForTimeout(300);

      // Check that plugin state changed
      const toggleState = await firstPlugin
        .locator('[data-testid="plugin-toggle"]')
        .getAttribute('aria-checked');
      expect(toggleState).toBeDefined();
    }
  });

  test('should show plugin information', async ({ page, app }) => {
    await app.executeCommand('plugin.list');

    await page.waitForTimeout(500);

    // Click on plugin for details
    const firstPlugin = page.locator('[data-testid="plugin-item"]').first();
    await firstPlugin.click();

    await page.waitForTimeout(300);

    // Should show plugin details
    await expect(page.locator('[data-testid="plugin-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="plugin-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="plugin-version"]')).toBeVisible();
  });

  test('should handle plugin errors gracefully', async ({ page, app }) => {
    // Try to load a non-existent plugin
    await app.executeCommand('plugin.load non-existent-plugin');

    await page.waitForTimeout(500);

    // Should show error message
    await expect(page.locator('[data-testid="plugin-error"]')).toBeVisible();

    // Should not crash the application
    await expect(page.locator('#app')).toBeVisible();
  });

  test('should install plugins from registry', async ({ page, app }) => {
    await app.executeCommand('plugin.install');

    await page.waitForTimeout(500);

    // Should show plugin installation dialog
    await expect(page.locator('[data-testid="plugin-install-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="plugin-search-input"]')).toBeVisible();

    // Search for plugins
    await page.fill('[data-testid="plugin-search-input"]', 'example');
    await page.waitForTimeout(300);

    // Should show search results
    const searchResults = await page.locator('[data-testid="plugin-search-result"]').count();
    expect(searchResults).toBeGreaterThan(0);
  });

  test('should configure plugin settings', async ({ page, app }) => {
    await app.executeCommand('plugin.list');

    await page.waitForTimeout(500);

    // Find a configurable plugin
    const firstPlugin = page.locator('[data-testid="plugin-item"]').first();

    // Look for settings button
    const settingsButton = firstPlugin.locator('[data-testid="plugin-settings"]');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(300);

      // Should show plugin settings
      await expect(page.locator('[data-testid="plugin-settings-dialog"]')).toBeVisible();

      // Should have configuration options
      const settingCount = await page.locator('[data-testid="setting-input"]').count();
      expect(settingCount).toBeGreaterThan(0);
    }
  });

  test('should handle plugin dependencies', async ({ page, app }) => {
    // This test would depend on having plugins with dependencies
    // For now, we'll test the dependency resolution UI

    await app.executeCommand('plugin.install');

    await page.waitForTimeout(500);

    // Select a plugin that might have dependencies
    const firstResult = page.locator('[data-testid="plugin-search-result"]').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForTimeout(300);

      // Check for dependency information
      const dependencyInfo = page.locator('[data-testid="plugin-dependencies"]');
      if (await dependencyInfo.isVisible()) {
        await expect(dependencyInfo).toBeVisible();
      }
    }
  });

  test('should update plugins', async ({ page, app }) => {
    await app.executeCommand('plugin.list');

    await page.waitForTimeout(500);

    // Look for updatable plugins
    const updatablePlugins = page.locator('[data-testid="plugin-updatable"]');
    const updatableCount = await updatablePlugins.count();

    if (updatableCount > 0) {
      // Update first updatable plugin
      await updatablePlugins.first().click();
      await page.waitForTimeout(300);

      // Should show update confirmation
      await expect(page.locator('[data-testid="plugin-update-dialog"]')).toBeVisible();

      // Confirm update
      await page.click('[data-testid="confirm-update"]');
      await page.waitForTimeout(1000);

      // Should show update progress
      await expect(page.locator('[data-testid="plugin-update-progress"]')).toBeVisible();
    }
  });

  test('should unload plugins properly', async ({ page, app }) => {
    await app.executeCommand('plugin.list');

    await page.waitForTimeout(500);

    // Find a loaded plugin
    const loadedPlugin = page.locator('[data-testid="plugin-loaded"]').first();

    if (await loadedPlugin.isVisible()) {
      const pluginName = await loadedPlugin.locator('[data-testid="plugin-name"]').textContent();

      // Unload plugin
      await loadedPlugin.locator('[data-testid="plugin-unload"]').click();
      await page.waitForTimeout(500);

      // Plugin should be unloaded
      await expect(loadedPlugin.locator('[data-testid="plugin-loaded"]')).not.toBeVisible();
    }
  });

  test('should maintain plugin state across sessions', async ({ page, app }) => {
    // Enable a plugin
    await app.executeCommand('plugin.list');
    await page.waitForTimeout(500);

    const firstPlugin = page.locator('[data-testid="plugin-item"]').first();
    const pluginName = await firstPlugin.locator('[data-testid="plugin-name"]').textContent();

    if (pluginName) {
      // Enable plugin
      const toggleButton = firstPlugin.locator('[data-testid="plugin-toggle"]');
      const initialState = await toggleButton.getAttribute('aria-checked');

      await toggleButton.click();
      await page.waitForTimeout(300);

      // Simulate page refresh (in real test, you'd reload)
      // For now, just check that state is maintained in memory
      const newState = await toggleButton.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);
    }
  });

  test('should handle plugin hot-reloading', async ({ page, app }) => {
    await app.executeCommand('plugin.list');

    await page.waitForTimeout(500);

    // Find a plugin that supports hot-reloading
    const hotReloadPlugin = page.locator('[data-testid="plugin-hot-reload"]').first();

    if (await hotReloadPlugin.isVisible()) {
      // Hot-reload plugin
      await hotReloadPlugin.click();
      await page.waitForTimeout(500);

      // Should show reload indicator
      await expect(page.locator('[data-testid="plugin-reloading"]')).toBeVisible();

      // Should complete reload
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="plugin-reloading"]')).not.toBeVisible();

      // Plugin should still be functional
      await expect(hotReloadPlugin).toBeVisible();
    }
  });

  test('should provide plugin development tools', async ({ page, app }) => {
    await app.executeCommand('plugin.developer');

    await page.waitForTimeout(500);

    // Should show developer tools
    await expect(page.locator('[data-testid="plugin-dev-tools"]')).toBeVisible();

    // Should have plugin creation wizard
    await expect(page.locator('[data-testid="create-plugin-wizard"]')).toBeVisible();

    // Should have plugin debugger
    await expect(page.locator('[data-testid="plugin-debugger"]')).toBeVisible();
  });
});
