const { chromium } = require('playwright');

async function testSessionManager() {
  console.log('🎭 Starting Playwright test for OpenCode Session Manager');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Check if kanban UI is running
    console.log('📡 Testing connection to kanban UI on port 4173...');
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'kanban-ui.png' });
    console.log('✅ Kanban UI loaded successfully');

    // Test 2: Check for session manager elements
    console.log('🔍 Looking for session manager elements...');

    // Look for any session-related elements
    const sessionElements = await page
      .locator('[class*="session"], [id*="session"]')
      .count();
    console.log(`📊 Found ${sessionElements} session-related elements`);

    // Test 3: Test basic interactions
    console.log('🖱️ Testing basic interactions...');

    // Look for buttons or interactive elements
    const buttons = await page.locator('button, [role="button"]').count();
    console.log(`🔘 Found ${buttons} buttons`);

    // Test 4: Check console for errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('❌ Browser console error:', msg.text());
      }
    });

    // Test 5: Try to find or create session manager functionality
    console.log('🎯 Testing session management functionality...');

    // Look for any create/add functionality
    const createButtons = await page.locator('text=/create|add|new/i').count();
    console.log(`➕ Found ${createButtons} create/add buttons`);

    // Wait a bit to see if anything loads dynamically
    await page.waitForTimeout(3000);

    // Final screenshot
    await page.screenshot({ path: 'final-state.png' });
    console.log('📸 Final screenshot taken');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await browser.close();
  }
}

// Check if we can access Playwright
try {
  require('playwright');
  testSessionManager().catch(console.error);
} catch (error) {
  console.log('❌ Playwright not available, installing...');
  console.log(
    '📦 Note: Due to memory constraints, we cannot install Playwright right now'
  );
  console.log('🔧 To run this test manually:');
  console.log('   1. Install Playwright: pnpm add -D @playwright/test');
  console.log('   2. Run: node test-session-manager.js');
}
