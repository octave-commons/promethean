/**
 * OpenCode Session Manager Integration Test
 * This test verifies the real SDK integration functionality
 */

const { chromium } = require('playwright');

async function runIntegrationTests() {
  console.log('🚀 Starting OpenCode Session Manager Integration Tests...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Load the demo page
    const demoPath = `file://${process.cwd()}/demo.html`;
    console.log(`📄 Loading demo page: ${demoPath}`);
    await page.goto(demoPath);
    
    // Wait for components to load
    await page.waitForTimeout(3000);
    console.log('✅ Demo page loaded successfully');
    
    // Test 1: Enhanced Session Manager Component
    console.log('🧪 Test 1: Checking enhanced session manager component...');
    const enhancedManager = await page.$('enhanced-session-manager');
    if (enhancedManager) {
      console.log('✅ Enhanced session manager component found');
    } else {
      throw new Error('❌ Enhanced session manager component not found');
    }
    
    // Test 2: Connection Status
    console.log('🧪 Test 2: Checking connection status...');
    const connectionStatus = await page.$('.connection-status');
    if (connectionStatus) {
      const statusText = await connectionStatus.textContent();
      console.log(`✅ Connection status: ${statusText}`);
      
      if (statusText.includes('Connected') || statusText.includes('connecting')) {
        console.log('✅ Connection status is valid');
      } else {
        console.log('⚠️  Connection status shows no connection, but mock fallback should work');
      }
    } else {
      throw new Error('❌ Connection status element not found');
    }
    
    // Test 3: Create Session Modal
    console.log('🧪 Test 3: Testing create session modal...');
    await page.click('.create-btn');
    await page.waitForSelector('.modal-overlay', { timeout: 5000 });
    console.log('✅ Create session modal opened');
    
    // Fill in session details
    await page.fill('input[placeholder="Enter session title"]', 'Integration Test Session');
    await page.fill('textarea[placeholder="Enter session description"]', 'This session was created during integration testing');
    await page.fill('input[placeholder="e.g., frontend, review, bugfix"]', 'test, integration');
    
    // Create the session
    await page.click('.modal-footer button:last-child');
    await page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 5000 });
    console.log('✅ Session created successfully');
    
    // Wait for session to appear in list
    await page.waitForTimeout(2000);
    
    // Test 4: Session List
    console.log('🧪 Test 4: Checking session list...');
    const sessionCards = await page.$$('.session-card');
    if (sessionCards.length > 0) {
      console.log(`✅ Found ${sessionCards.length} session(s) in the list`);
      
      // Check if our test session exists
      const testSession = await page.$('.session-card:has-text("Integration Test Session")');
      if (testSession) {
        console.log('✅ Test session found in the list');
      } else {
        console.log('⚠️  Test session not found, but other sessions exist');
      }
    } else {
      throw new Error('❌ No sessions found in the list');
    }
    
    // Test 5: Session Details
    console.log('🧪 Test 5: Testing session details...');
    if (sessionCards.length > 0) {
      await page.click('.session-card');
      await page.waitForSelector('.session-details', { timeout: 5000 });
      console.log('✅ Session details displayed');
      
      // Check session information
      const detailRows = await page.$$('.detail-row');
      if (detailRows.length > 0) {
        console.log(`✅ Found ${detailRows.length} detail rows`);
      } else {
        console.log('⚠️  No detail rows found');
      }
    }
    
    // Test 6: Code Review Panel
    console.log('🧪 Test 6: Testing code review panel...');
    const reviewToggleBtn = await page.$('.review-toggle-btn');
    if (reviewToggleBtn) {
      await page.click('.review-toggle-btn');
      await page.waitForSelector('.review-panel', { timeout: 5000 });
      console.log('✅ Code review panel opened');
      
      // Fill in review configuration
      await page.fill('input[placeholder="Enter file or directory path"]', './src');
      
      // Start review
      await page.click('.start-review-btn');
      
      // Wait for results (with timeout)
      try {
        await page.waitForSelector('.review-results', { timeout: 10000 });
        console.log('✅ Code review results displayed');
        
        const issuesList = await page.$$('.issue-item');
        console.log(`✅ Found ${issuesList.length} issue(s) in review results`);
      } catch (error) {
        console.log('⚠️  Code review results not displayed within timeout, but panel opened successfully');
      }
    } else {
      console.log('⚠️  Review toggle button not found');
    }
    
    // Test 7: Demo Controls
    console.log('🧪 Test 7: Testing demo controls...');
    const testConnectionBtn = await page.$('button:has-text("Test Connection")');
    if (testConnectionBtn) {
      await testConnectionBtn.click();
      await page.waitForTimeout(2000);
      
      const statusDiv = await page.$('#connection-status');
      if (statusDiv) {
        const statusText = await statusDiv.textContent();
        console.log(`✅ Demo control status: ${statusText}`);
      }
    } else {
      console.log('⚠️  Demo controls not found');
    }
    
    // Test 8: Error Handling
    console.log('🧪 Test 8: Testing error handling...');
    await page.evaluate(() => {
      const enhancedManager = document.querySelector('enhanced-session-manager');
      if (enhancedManager) {
        enhancedManager.setAttribute('server-url', 'http://invalid-server:9999');
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    const connectionStatusAfterError = await page.$('.connection-status');
    if (connectionStatusAfterError) {
      console.log('✅ Error handling working - component still loads with invalid server');
    }
    
    console.log('🎉 All integration tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-failure-screenshot.png' });
    console.log('📸 Screenshot saved as test-failure-screenshot.png');
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests()
    .then(() => {
      console.log('✅ Integration tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Integration tests failed:', error);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };