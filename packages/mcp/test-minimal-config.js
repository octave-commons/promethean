#!/usr/bin/env node

/**
 * Test MCP server with minimal configuration to bypass security middleware
 */

import { main } from './dist/index.js';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Create minimal config that disables security
const minimalConfig = {
  transport: 'http',
  endpoints: [
    {
      path: '/mcp',
      tools: ['mcp_help'], // Only include help tool for minimal testing
      includeHelp: false,
    },
  ],
  security: {
    enabled: false, // Disable security middleware
  },
  logging: {
    level: 'debug',
  },
};

const configPath = join(process.cwd(), 'test-minimal-config.json');

async function testMinimalConfig() {
  console.log('🧪 Testing MCP server with minimal configuration...');

  try {
    // Write minimal config
    writeFileSync(configPath, JSON.stringify(minimalConfig, null, 2));
    console.log('✅ Created minimal config');

    // Set environment to use our config
    process.env.MCP_CONFIG = configPath;

    // Override the main function to intercept and modify behavior
    console.log('🚀 Starting MCP server with minimal config...');

    // Start the server (this will hang if the issue persists)
    main();

    // Wait a bit for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test request
    console.log('🌐 Testing HTTP request...');

    try {
      const response = await fetch('http://localhost:3210/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'test-client',
              version: '1.0.0',
            },
          },
        }),
        signal: AbortSignal.timeout(3000),
      });

      console.log(`✅ Response status: ${response.status}`);
      const text = await response.text();
      console.log(`✅ Response body: ${text}`);
    } catch (error) {
      console.error('❌ Request failed:', error.message);
      if (error.name === 'AbortError') {
        console.error('❌ Request timed out - server is hanging even without security middleware');
      }
    }

    // Keep server running for manual testing
    console.log('🔄 Server running. Press Ctrl+C to stop...');
    console.log(
      '🔗 Test with: curl -X POST http://localhost:3210/mcp -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}\'',
    );

    // Wait for interrupt
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    try {
      unlinkSync(configPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Cleaning up...');
  try {
    unlinkSync(configPath);
  } catch {
    // Ignore cleanup errors
  }
  process.exit(0);
});

testMinimalConfig().catch(console.error);
