import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Opencode Unified Editor integration testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.playwright.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list'],
  ],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
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
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'pnpm build:full && node src/typescript/server/web-ui/server.ts',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  outputDir: 'test-results',
});
