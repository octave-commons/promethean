import { test, expect } from '@playwright/test';

test.describe('Dual Store UI - Agent Tasks Issue Diagnosis', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the UI
    await page.goto(
      'file:///home/err/devel/promethean/packages/dualstore-http/src/web-ui/index.html',
    );

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for Alpine.js to initialize
    await page.waitForTimeout(1000);
  });

  test('API connectivity and data verification', async ({ page }) => {
    console.log('🔍 Testing API connectivity...');

    // Test API directly from the browser context
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3002/api/v1/agent_tasks?limit=5');
        const data = await response.json();

        return {
          status: response.status,
          success: data.success,
          dataLength: data.data?.length || 0,
          total: data.pagination?.total || 0,
          sampleItem: data.data?.[0] || null,
          hasRequiredFields: data.data?.[0]
            ? {
                id: !!data.data[0].id,
                created_at: !!data.data[0].created_at,
                session_id: !!data.data[0].session_id,
                task_type: !!data.data[0].task_type,
                status: !!data.data[0].status,
              }
            : null,
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    });

    console.log('API Test Results:', JSON.stringify(apiTest, null, 2));

    expect(apiTest.status).toBe(200);
    expect(apiTest.success).toBe(true);
    expect(apiTest.dataLength).toBeGreaterThan(0);
    expect(apiTest.total).toBeGreaterThan(0);
    expect(apiTest.hasRequiredFields).toBeTruthy();
  });

  test('UI loading and tab functionality', async ({ page }) => {
    console.log('🖥️ Testing UI loading and tabs...');

    // Wait for initial load
    await page.waitForSelector('[x-cloak]', { state: 'hidden' });
    await page.waitForTimeout(2000);

    // Check if all tabs are present
    const messagesTab = page.locator('button:has-text("Session Messages")');
    const tasksTab = page.locator('button:has-text("Agent Tasks")');
    const eventsTab = page.locator('button:has-text("OpenCode Events")');

    await expect(messagesTab).toBeVisible();
    await expect(tasksTab).toBeVisible();
    await expect(eventsTab).toBeVisible();

    // Check tab counts (these should show numbers)
    const tasksTabCount = await tasksTab.locator('span').textContent();
    console.log('Tasks tab count:', tasksTabCount);
    expect(tasksTabCount).not.toBe('0');
    expect(tasksTabCount).toMatch(/\d+/);

    // Click on tasks tab
    await tasksTab.click();
    await page.waitForTimeout(500);

    // Check if tasks content area is visible
    const tasksContent = page.locator('[x-show="activeTab === \'tasks\' && !loading"]');
    await expect(tasksContent).toBeVisible();
  });

  test('Task rendering investigation', async ({ page }) => {
    console.log('🔍 Investigating task rendering...');

    // Wait for data to load
    await page.waitForSelector('[x-cloak]', { state: 'hidden' });
    await page.waitForTimeout(3000);

    // Switch to tasks tab
    await page.click('button:has-text("Agent Tasks")');
    await page.waitForTimeout(500);

    // Check for task items using multiple selectors
    const taskSelectors = [
      '[x-show="activeTab === \'tasks\' && !loading"] .border.border-gray-200',
      '[x-show="activeTab === \'tasks\' && !loading"] [x-for]',
      '.space-y-4 > div',
      '[x-template]:has([x-for="task in filteredTasks"])',
    ];

    let foundTasks = 0;
    for (const selector of taskSelectors) {
      try {
        const count = await page.locator(selector).count();
        console.log(`Selector "${selector}" found ${count} elements`);
        foundTasks = Math.max(foundTasks, count);
      } catch (error) {
        console.log(`Selector "${selector}" failed:`, error);
      }
    }

    console.log('Total task elements found:', foundTasks);

    // Check for empty state
    const emptyStateVisible = await page.locator('div:has-text("No data found")').isVisible();
    console.log('Empty state visible:', emptyStateVisible);

    // Check loading state
    const loadingVisible = await page.locator('div:has-text("Loading data")').isVisible();
    console.log('Loading state visible:', loadingVisible);

    // Take screenshot
    await page.screenshot({
      path: 'dualstore-tasks-rendering.png',
      fullPage: false,
    });

    // Log the current DOM structure for debugging
    const domStructure = await page.evaluate(() => {
      const tasksContent = document.querySelector('[x-show="activeTab === \'tasks\' && !loading"]');
      if (!tasksContent) return { error: 'Tasks content not found' };

      return {
        innerHTML: tasksContent.innerHTML.substring(0, 1000), // First 1000 chars
        childElementCount: tasksContent.childElementCount,
        children: Array.from(tasksContent.children).map((child) => ({
          tagName: child.tagName,
          className: child.className,
          xShow: child.getAttribute('x-show'),
          xFor: child.getAttribute('x-for'),
          xTemplate: child.getAttribute('x-template'),
          textContent: child.textContent?.substring(0, 100),
        })),
      };
    });

    console.log('DOM Structure:', JSON.stringify(domStructure, null, 2));
  });

  test('Data flow debugging', async ({ page }) => {
    console.log('🔍 Debugging data flow...');

    // Monitor network requests
    const requests: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/agent_tasks')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now(),
        });
      }
    });

    const responses: any[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/v1/agent_tasks')) {
        response.text().then((body) => {
          responses.push({
            url: response.url(),
            status: response.status(),
            bodyLength: body.length,
            timestamp: Date.now(),
          });
        });
      }
    });

    // Navigate and wait
    await page.goto(
      'file:///home/err/devel/promethean/packages/dualstore-http/src/web-ui/index.html',
    );
    await page.waitForSelector('[x-cloak]', { state: 'hidden' });
    await page.waitForTimeout(3000);

    console.log('Network Requests:', JSON.stringify(requests, null, 2));
    console.log('Network Responses:', JSON.stringify(responses, null, 2));

    // Check stats display
    const agentTasksStat = await page
      .locator('p:has-text("Agent Tasks") + p.text-2xl')
      .textContent();
    console.log('Agent Tasks stat display:', agentTasksStat);

    // Check tab count
    const tasksTabCount = await page.locator('button:has-text("Agent Tasks") span').textContent();
    console.log('Tasks tab count:', tasksTabCount);

    expect(requests.length).toBeGreaterThan(0);
    expect(responses.length).toBeGreaterThan(0);
    expect(responses[0].status).toBe(200);
  });

  test('JavaScript error monitoring', async ({ page }) => {
    console.log('🔍 Monitoring JavaScript errors...');

    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    await page.goto(
      'file:///home/err/devel/promethean/packages/dualstore-http/src/web-ui/index.html',
    );
    await page.waitForSelector('[x-cloak]', { state: 'hidden' });
    await page.waitForTimeout(3000);

    // Switch to tasks tab
    await page.click('button:has-text("Agent Tasks")');
    await page.waitForTimeout(1000);

    if (jsErrors.length > 0) {
      console.log('JavaScript Errors:', jsErrors);
    }
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }
    if (consoleWarnings.length > 0) {
      console.log('Console Warnings:', consoleWarnings);
    }

    // Take screenshot after tab switch
    await page.screenshot({
      path: 'dualstore-after-tab-switch.png',
      fullPage: false,
    });

    // If there are JS errors, this might explain the rendering issue
    if (jsErrors.length > 0) {
      console.log('Found JavaScript errors that may explain the issue');
    }
  });

  test('Manual data injection test', async ({ page }) => {
    console.log('🔍 Testing with manual data injection...');

    await page.goto(
      'file:///home/err/devel/promethean/packages/dualstore-http/src/web-ui/index.html',
    );
    await page.waitForSelector('[x-cloak]', { state: 'hidden' });
    await page.waitForTimeout(2000);

    // Manually inject test data to see if rendering works
    const injectionResult = await page.evaluate(() => {
      try {
        // Create test data
        const testData = [
          {
            id: 'test-task-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            session_id: 'test-session-1',
            agent_id: 'test-agent-1',
            task_type: 'test-task',
            status: 'running',
            progress: 50,
            input_data: { test: 'data' },
            output_data: {},
          },
          {
            id: 'test-task-2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            session_id: 'test-session-2',
            agent_id: 'test-agent-2',
            task_type: 'another-test',
            status: 'completed',
            progress: 100,
            input_data: {},
            output_data: { result: 'success' },
          },
        ];

        // Try to find and update the component data
        const element = document.querySelector('[x-data="dualStoreExplorer()"]');
        if (!element) return { error: 'Component element not found' };

        // Try different ways to access the data
        let componentData = null;

        // Check if Alpine is available
        if ((window as any).Alpine) {
          // Try to get the Alpine instance for this element
          const alpineInstance = (window as any).Alpine.$data(element);
          if (alpineInstance) {
            componentData = alpineInstance;
          }
        }

        if (!componentData) {
          return { error: 'Could not access component data' };
        }

        // Update the data
        componentData.data.tasks = testData;

        return {
          success: true,
          originalLength: componentData.data.tasks.length,
          newLength: testData.length,
          firstTask: testData[0],
        };
      } catch (error) {
        return { error: (error as Error).message };
      }
    });

    console.log('Data Injection Result:', JSON.stringify(injectionResult, null, 2));

    // Switch to tasks tab
    await page.click('button:has-text("Agent Tasks")');
    await page.waitForTimeout(1000);

    // Check if manual data renders
    const taskItemsAfterInjection = await page
      .locator('[x-show="activeTab === \'tasks\' && !loading"] .border.border-gray-200')
      .count();
    console.log('Task items after injection:', taskItemsAfterInjection);

    await page.screenshot({
      path: 'dualstore-after-injection.png',
      fullPage: false,
    });
  });
});
