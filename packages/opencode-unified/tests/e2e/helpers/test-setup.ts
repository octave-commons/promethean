import { test as base, expect, Page, BrowserContext } from '@playwright/test';

// Extend Window interface to include our app globals
declare global {
  interface Window {
    opencodeApp?: {
      initialized: boolean;
      plugins: any;
    };
  }
}

// Define custom fixtures for our application
export interface OpencodeFixtures {
  page: Page;
  context: BrowserContext;
  app: {
    waitForAppLoad: () => Promise<void>;
    getEditorContent: () => Promise<string>;
    setEditorContent: (content: string) => Promise<void>;
    executeCommand: (command: string) => Promise<void>;
    openCommandPalette: () => Promise<void>;
    getMode: () => Promise<string>;
    enterNormalMode: () => Promise<void>;
    enterInsertMode: () => Promise<void>;
    getCurrentBuffer: () => Promise<string>;
    createBuffer: (name: string, content?: string) => Promise<void>;
    switchToBuffer: (name: string) => Promise<void>;
    getPluginStatus: () => Promise<any>;
    getLayoutInfo: () => Promise<any>;
  };
}

// Extend base test with our custom fixtures
export const test = base.extend<OpencodeFixtures>({
  page: async ({ page }, use) => {
    // Set up page-level configurations
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    // Wait for the application to load
    await page.waitForSelector('#app', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        return window.opencodeApp && window.opencodeApp.initialized;
      },
      { timeout: 10000 },
    );

    await use(page);
  },

  app: async ({ page }, use) => {
    const app = {
      // Wait for the application to fully load
      async waitForAppLoad() {
        await page.waitForSelector('#app', { state: 'visible', timeout: 15000 });
        await page.waitForFunction(
          () => {
            return !document.querySelector('.loading');
          },
          { timeout: 10000 },
        );

        // Wait for ClojureScript to initialize
        await page.waitForTimeout(2000);
      },

      // Get current editor content
      async getEditorContent() {
        return await page.evaluate(() => {
          const editor = document.querySelector('.editor-content');
          return editor ? editor.textContent || '' : '';
        });
      },

      // Set editor content
      async setEditorContent(content: string) {
        await page.evaluate((text) => {
          const editor = document.querySelector('.editor-content');
          if (editor) {
            editor.textContent = text;
            // Trigger change event
            editor.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, content);
      },

      // Execute a command via command palette
      async executeCommand(command: string) {
        await this.openCommandPalette();
        await page.fill('[data-testid="command-palette-input"]', command);
        await page.press('[data-testid="command-palette-input"]', 'Enter');
        await page.waitForSelector('[data-testid="command-palette"]', {
          state: 'hidden',
          timeout: 5000,
        });
      },

      // Open command palette (Cmd+Shift+P or Ctrl+Shift+P)
      async openCommandPalette() {
        const isMac = process.platform === 'darwin';
        const modifier = isMac ? 'Meta' : 'Control';

        await page.keyboard.press(`${modifier}+Shift+P`);
        await page.waitForSelector('[data-testid="command-palette"]', {
          state: 'visible',
          timeout: 5000,
        });
      },

      // Get current Evil mode
      async getMode() {
        return await page.evaluate(() => {
          const modeIndicator = document.querySelector('[data-testid="mode-indicator"]');
          return modeIndicator ? modeIndicator.textContent || 'unknown' : 'unknown';
        });
      },

      // Enter Evil normal mode
      async enterNormalMode() {
        await page.keyboard.press('Escape');
        await page.waitForFunction(
          () => {
            const modeIndicator = document.querySelector('[data-testid="mode-indicator"]');
            return modeIndicator && modeIndicator.textContent.includes('Normal');
          },
          { timeout: 3000 },
        );
      },

      // Enter Evil insert mode
      async enterInsertMode() {
        await this.enterNormalMode();
        await page.keyboard.press('i');
        await page.waitForFunction(
          () => {
            const modeIndicator = document.querySelector('[data-testid="mode-indicator"]');
            return modeIndicator && modeIndicator.textContent.includes('Insert');
          },
          { timeout: 3000 },
        );
      },

      // Get current buffer name
      async getCurrentBuffer() {
        return await page.evaluate(() => {
          const bufferTab = document.querySelector('.buffer-tab.active');
          return bufferTab ? bufferTab.textContent || '' : '';
        });
      },

      // Create a new buffer
      async createBuffer(name: string, content: string = '') {
        await this.executeCommand('buffer.new');
        await page.fill('[data-testid="buffer-name-input"]', name);
        await page.press('[data-testid="buffer-name-input"]', 'Enter');

        if (content) {
          await this.setEditorContent(content);
        }
      },

      // Switch to a specific buffer
      async switchToBuffer(name: string) {
        await page.click(`[data-testid="buffer-tab-${name}"]`);
        await page.waitForFunction(
          (bufferName) => {
            const activeTab = document.querySelector('.buffer-tab.active');
            return activeTab && activeTab.textContent === bufferName;
          },
          name,
          { timeout: 3000 },
        );
      },

      // Get plugin system status
      async getPluginStatus() {
        return await page.evaluate(() => {
          return window.opencodeApp ? window.opencodeApp.plugins : null;
        });
      },

      // Get layout information
      async getLayoutInfo() {
        return await page.evaluate(() => {
          const layout = {
            sidebarVisible: !!document.querySelector('.sidebar'),
            statusBarVisible: !!document.querySelector('.status-bar'),
            minimapVisible: !!document.querySelector('.minimap'),
            headerVisible: !!document.querySelector('.header'),
          };

          const dimensions = {
            sidebarWidth: 0,
            editorWidth: 0,
            statusBarHeight: 0,
          };

          const sidebar = document.querySelector('.sidebar');
          if (sidebar) {
            dimensions.sidebarWidth = sidebar.getBoundingClientRect().width;
          }

          const editor = document.querySelector('.editor');
          if (editor) {
            dimensions.editorWidth = editor.getBoundingClientRect().width;
          }

          const statusBar = document.querySelector('.status-bar');
          if (statusBar) {
            dimensions.statusBarHeight = statusBar.getBoundingClientRect().height;
          }

          return { layout, dimensions };
        });
      },
    };

    await use(app);
  },
});

export { expect };

// Common test utilities
export const TestUtils = {
  // Wait for a specific element to appear and be stable
  async waitForStableElement(page: Page, selector: string, timeout: number = 5000) {
    await page.waitForSelector(selector, { state: 'visible', timeout });

    // Wait for element to be stable (no position changes for 100ms)
    await page.waitForFunction(
      (sel) => {
        const element = document.querySelector(sel);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return new Promise((resolve) => {
          setTimeout(() => {
            const newRect = element.getBoundingClientRect();
            resolve(rect.top === newRect.top && rect.left === newRect.left);
          }, 100);
        });
      },
      selector,
      { timeout },
    );
  },

  // Take a screenshot with a descriptive name
  async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  },

  // Simulate realistic typing
  async typeText(page: Page, text: string, delay: number = 50) {
    await page.keyboard.type(text, { delay });
  },

  // Check if element has specific CSS class
  async hasClass(page: Page, selector: string, className: string) {
    return await page.evaluate(({ sel, cls }) => {
      const element = document.querySelector(sel);
      return element ? element.classList.contains(cls) : false;
    }, { sel: selector, cls: className });
  },
      selector,
      className,
    );
  },

  // Get computed styles
  async getComputedStyle(page: Page, selector: string) {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element ? window.getComputedStyle(element) : null;
    }, selector);
  },
};
