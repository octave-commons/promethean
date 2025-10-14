import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { test, expect } from '@playwright/test';

import { createKanbanUiServer } from '../lib/ui-server.js';
import { makeTask, withTempDir, writeTaskFile } from '../test-utils/helpers.js';

type ServerInstance = ReturnType<typeof createKanbanUiServer>;

type ServerControls = Readonly<
  Pick<ServerInstance, 'listen' | 'once' | 'off' | 'close' | 'address'>
>;

const listenOnRandomPort = async (
  server: ServerControls,
): Promise<Readonly<{ readonly baseUrl: string }>> =>
  new Promise((resolve, reject) => {
    const onError = (error: Readonly<Error>) => reject(error);
    server.once('error', onError);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', onError);
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Unable to determine server address'));
        return;
      }
      resolve({ baseUrl: `http://${address.address}:${address.port}` });
    });
  });

test.describe('Dark Mode UI', () => {
  let server: ServerInstance;
  let baseUrl: string;

  test.beforeAll(async () => {
    const dir = await withTempDir({ teardown: () => {} } as any);
    const tasksDir = path.join(dir, 'tasks');
    const boardFile = path.join(dir, 'board.md');
    await writeFile(boardFile, '', 'utf8');

    // Create some test tasks
    await writeTaskFile(
      tasksDir,
      makeTask({
        uuid: 'task-1',
        title: 'Test Task 1',
        status: 'Todo',
        slug: 'test-task-1',
        priority: 1,
      }),
    );

    await writeTaskFile(
      tasksDir,
      makeTask({
        uuid: 'task-2',
        title: 'Test Task 2',
        status: 'In Progress',
        slug: 'test-task-2',
        priority: 2,
      }),
    );

    server = createKanbanUiServer({ boardFile, tasksDir });
    const result = await listenOnRandomPort(server);
    baseUrl = result.baseUrl;
  });

  test.afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  test('dark mode toggle button is present and functional', async ({ page }) => {
    await page.goto(baseUrl);

    // Wait for the page to load
    await page.waitForSelector('.kanban-app');

    // Check if dark mode toggle button exists
    const toggleButton = page.locator('button[data-action="toggle-dark-mode"]');
    await expect(toggleButton).toHaveCount(1);

    // Check initial state (should be light mode by default)
    await expect(toggleButton).toHaveAttribute('data-theme', 'light');

    // Check if the button has the moon icon initially
    await expect(toggleButton).toContainText('🌙');
  });

  test('dark mode toggle switches theme correctly', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForSelector('.kanban-app');

    const toggleButton = page.locator('button[data-action="toggle-dark-mode"]');
    const root = page.locator('html');

    // Initial state should be light mode
    await expect(root).not.toHaveAttribute('data-theme', 'dark');
    await expect(toggleButton).toHaveAttribute('data-theme', 'light');

    // Click to toggle to dark mode
    await toggleButton.click();

    // Should now be dark mode
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(toggleButton).toHaveAttribute('data-theme', 'dark');
    await expect(toggleButton).toContainText('☀️');

    // Click to toggle back to light mode
    await toggleButton.click();

    // Should be back to light mode
    await expect(root).not.toHaveAttribute('data-theme', 'dark');
    await expect(toggleButton).toHaveAttribute('data-theme', 'light');
    await expect(toggleButton).toContainText('🌙');
  });

  test('dark mode persists across page reloads', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForSelector('.kanban-app');

    const toggleButton = page.locator('button[data-action="toggle-dark-mode"]');
    const root = page.locator('html');

    // Toggle to dark mode
    await toggleButton.click();
    await expect(root).toHaveAttribute('data-theme', 'dark');

    // Reload the page
    await page.reload();
    await page.waitForSelector('.kanban-app');

    // Should still be in dark mode after reload
    await expect(root).toHaveAttribute('data-theme', 'dark');

    // Toggle button should reflect dark mode state
    const reloadedToggleButton = page.locator('button[data-action="toggle-dark-mode"]');
    await expect(reloadedToggleButton).toHaveAttribute('data-theme', 'dark');
    await expect(reloadedToggleButton).toContainText('☀️');
  });

  test('dark mode applies correct CSS variables', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForSelector('.kanban-app');

    const toggleButton = page.locator('button[data-action="toggle-dark-mode"]');

    // Get computed styles in light mode
    const lightModeBackground = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Toggle to dark mode
    await toggleButton.click();

    // Get computed styles in dark mode
    const darkModeBackground = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Background should be different between light and dark modes
    expect(lightModeBackground).not.toBe(darkModeBackground);

    // Dark mode should have a darker background
    const lightRgb = lightModeBackground.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
    const darkRgb = darkModeBackground.match(/\d+/g)?.map(Number) ?? [0, 0, 0];

    const lightBrightness = (lightRgb[0]! * 299 + lightRgb[1]! * 587 + lightRgb[2]! * 114) / 1000;
    const darkBrightness = (darkRgb[0]! * 299 + darkRgb[1]! * 587 + darkRgb[2]! * 114) / 1000;

    expect(darkBrightness).toBeLessThan(lightBrightness);
  });

  test('dark mode toggle button has proper hover and active states', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForSelector('.kanban-app');

    const toggleButton = page.locator('button[data-action="toggle-dark-mode"]');

    // Check hover state
    await toggleButton.hover();
    const hoverTransform = await toggleButton.evaluate((el: any) => {
      return getComputedStyle(el).transform;
    });
    expect(hoverTransform).not.toBe('none');

    // Check active state
    await toggleButton.click();
    const activeTransform = await toggleButton.evaluate((el: any) => {
      return getComputedStyle(el).transform;
    });
    expect(activeTransform).not.toBe('none');
  });

  test('dark mode works with all UI components', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForSelector('.kanban-app');

    const toggleButton = page.locator('button[data-action="toggle-dark-mode"]');

    // Toggle to dark mode
    await toggleButton.click();

    // Check that all major UI components are visible and properly styled
    await expect(page.locator('.kanban-header')).toBeVisible();
    await expect(page.locator('.board-container')).toBeVisible();
    await expect(page.locator('.kanban-sidebar')).toBeVisible();
    await expect(page.locator('.task-card')).toHaveCount(2);
    await expect(page.locator('.panel')).toHaveCount(6);

    // Check text contrast in dark mode
    const textColor = await page.evaluate(() => {
      return getComputedStyle(document.body).color;
    });
    const textRgb = textColor.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
    const textBrightness = (textRgb[0]! * 299 + textRgb[1]! * 587 + textRgb[2]! * 114) / 1000;

    // Text should be light in dark mode (high brightness value)
    expect(textBrightness).toBeGreaterThan(200);
  });
});
