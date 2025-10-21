#!/usr/bin/env node

/**
 * Test MCP server with minimal configuration to isolate hanging issue
 */

import { fastifyTransport } from './src/core/transports/fastify.ts';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

async function testMinimalMcpServer() {
  console.log('🧪 Testing minimal MCP server with dummy MCP server...\n');

  try {
    // Create a minimal MCP server
    const mcpServer = new McpServer({
      name: 'test-minimal-server',
      version: '1.0.0',
    });

    // Add a simple tool using the correct API
    mcpServer.registerTool(
      'test_tool',
      {
        name: 'test_tool',
        description: 'A simple test tool',
      },
      async (args) => {
        console.log('🔧 Test tool called with args:', args);
        return {
          content: [
            {
              type: 'text',
              text: 'Test tool executed successfully!',
            },
          ],
        };
      },
    );

    console.log('✅ Transport created successfully');

    // Start the server with the MCP server
    const server = await transport.start({
      mcpServers: [mcpServer],
    });
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
  console.error('This confirms the hanging issue exists even with minimal configuration.');
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
