#!/usr/bin/env node

/**
 * Test the real MCP server startup process to identify where it hangs
 */

import { main } from './src/index.ts';

async function testRealStartup() {
  console.log('🧪 Testing real MCP server startup...\n');

  try {
    // Set a timeout to detect hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Server startup timed out after 10 seconds'));
      }, 10000);
    });

    // Try to start the real server
    const startupPromise = main();

    // Race between startup and timeout
    await Promise.race([startupPromise, timeoutPromise]);

    console.log('✅ Real server started successfully!');

    // If we get here, try to test endpoints
    console.log('\n🔍 Testing endpoints after real startup...');

    // Wait a moment for server to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3211/healthz', {
      method: 'GET',
      headers: { 'User-Agent': 'test-real-startup' },
    });

    console.log(`✅ Health check: ${healthResponse.status}`);
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);
  } catch (error) {
    console.error('❌ Real startup test failed:', error.message);

    if (error.message.includes('timed out')) {
      console.log('\n💡 Server startup is hanging during initialization.');
      console.log('   The issue is in the startup process, not the transport.');
      console.log('   Likely causes:');
      console.log('   - Configuration loading');
      console.log('   - Tool registry building');
      console.log('   - Proxy setup');
      console.log('   - File system operations');
    } else {
      console.error('Stack:', error.stack);
    }

    process.exit(1);
  }
}

console.log('Note: This test will timeout after 10 seconds if startup hangs');
testRealStartup();
