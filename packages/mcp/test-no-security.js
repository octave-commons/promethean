#!/usr/bin/env node

/**
 * Test MCP server without security middleware to isolate the hanging issue
 */

import { createMcpServer } from './dist/core/mcp-server.js';

async function testWithoutSecurity() {
  console.log('🧪 Testing MCP server without security middleware...');

  try {
    // Create server with minimal config, no security
    const server = createMcpServer({
      transport: {
        type: 'http',
        port: 3213,
        host: 'localhost',
        // Disable security middleware
        security: {
          enabled: false,
        },
      },
      logging: {
        level: 'debug',
      },
    });

    console.log('✅ Server created without security middleware');

    // Start server
    await server.start();
    console.log('✅ Server started on port 3213');

    // Test simple request
    console.log('🌐 Testing simple HTTP request...');

    const testRequest = async () => {
      try {
        const response = await fetch('http://localhost:3213/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        console.log(`✅ Response status: ${response.status}`);
        const text = await response.text();
        console.log(`✅ Response body: ${text}`);
      } catch (error) {
        console.error('❌ Request failed:', error.message);
        if (error.name === 'AbortError') {
          console.error('❌ Request timed out - server is hanging');
        }
      }
    };

    // Wait a moment for server to fully start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test request
    await testRequest();

    // Keep server alive for manual testing
    console.log('🔄 Server running. Press Ctrl+C to stop...');
    console.log(
      '🔗 Test with: curl -X POST http://localhost:3213/mcp -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}\'',
    );

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping server...');
      await server.stop();
      process.exit(0);
    });

    // Prevent process from exiting
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testWithoutSecurity().catch(console.error);
