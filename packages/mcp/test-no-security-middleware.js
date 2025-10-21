#!/usr/bin/env node

/**
 * Test MCP server without security middleware to isolate hanging issue
 */

import { fastifyTransport } from './src/core/transports/fastify.ts';

async function testMinimalMcpServer() {
  console.log('🧪 Testing minimal MCP server without security middleware...\n');

  try {
    // Create transport with minimal config - this should still hang if the issue is elsewhere
    const transport = fastifyTransport({
      port: 3211, // Different port to avoid conflicts
      host: '0.0.0.0',
    });

    console.log('✅ Transport created successfully');

    // Start the server
    const server = await transport.start();
    console.log('✅ Server started successfully');

    // Test health endpoint directly
    console.log('\n🔍 Testing /healthz endpoint...');

    const response = await fetch('http://localhost:3211/healthz', {
      method: 'GET',
      headers: {
        'User-Agent': 'test-minimal-server',
      },
    });

    console.log(`✅ Health check responded! Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', data);

    // Test MCP endpoint
    console.log('\n🔍 Testing /mcp endpoint...');

    const mcpResponse = await fetch('http://localhost:3211/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'test-minimal-server',
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
    });

    console.log(`✅ MCP endpoint responded! Status: ${mcpResponse.status}`);
    const mcpData = await mcpResponse.json();
    console.log('MCP Response:', mcpData);

    await transport.stop();
    console.log('\n✅ All tests passed! The issue is NOT in the core MCP server.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);

    // Try to understand what type of hang this is
    if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 This suggests the server is not responding to requests at all.');
      console.log('   The issue is likely in the Fastify setup or middleware.');
    } else if (error.message.includes('EADDRINUSE')) {
      console.log('\n💡 Port conflict - the server might already be running.');
    } else {
      console.log('\n💡 Unknown error type - needs further investigation.');
    }

    process.exit(1);
  }
}

// Set timeout for the entire test
const timeout = setTimeout(() => {
  console.error('\n❌ TEST TIMEOUT - Server is hanging!');
  console.error('This confirms the hanging issue exists even without security middleware.');
  process.exit(1);
}, 10000); // 10 second timeout

testMinimalMcpServer()
  .then(() => {
    clearTimeout(timeout);
    console.log('\n🎉 Minimal server test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('\n💥 Minimal server test failed:', error);
    process.exit(1);
  });
