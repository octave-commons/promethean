#!/usr/bin/env node

/**
 * Direct test of MCP server without any custom transport
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'http';

async function testDirectMcp() {
  console.log('🧪 Testing direct MCP server with SDK transport...\n');

  try {
    // Create a minimal MCP server
    const mcpServer = new McpServer({
      name: 'test-direct-server',
      version: '1.0.0',
    });

    // Add a simple tool
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

    console.log('✅ MCP server created successfully');

    // Create transport
    const transport = new StreamableHTTPServerTransport('/mcp', {
      headersFactory: () => ({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }),
    });

    console.log('✅ Transport created successfully');

    // Create HTTP server
    const httpServer = createServer(async (req, res) => {
      console.log('📥 Request received:', req.method, req.url);

      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/healthz') {
        console.log('🏥 Health check hit');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
          }),
        );
        return;
      }

      if (req.url === '/mcp' && req.method === 'POST') {
        console.log('🔌 MCP request - delegating to transport');
        try {
          await transport.handleRequest(req, res);
          console.log('✅ Transport handled request');
        } catch (error) {
          console.error('❌ Transport error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        return;
      }

      // 404 for other routes
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    // Start server
    const port = 3002;
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Direct HTTP server listening on port ${port}`);
    });

    // Wait a moment for server to start
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Test health endpoint
    console.log('\n🔍 Testing /healthz endpoint...');
    const healthResponse = await fetch(`http://localhost:${port}/healthz`);
    console.log(`✅ Health check responded! Status: ${healthResponse.status}`);
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);

    // Test MCP endpoint
    console.log('\n🔍 Testing /mcp endpoint...');
    const mcpResponse = await fetch(`http://localhost:${port}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    // Cleanup
    httpServer.close();
    console.log('\n✅ All tests passed! The issue is NOT in the core MCP server or transport.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);

    if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Server is not responding to requests at all.');
      console.log('   The issue is likely in the HTTP server setup or transport.');
    } else if (error.message.includes('EADDRINUSE')) {
      console.log('\n💡 Port conflict - server might already be running.');
    } else {
      console.log('\n💡 Unknown error type - needs further investigation.');
    }

    process.exit(1);
  }
}

// Set timeout for the entire test
const timeout = setTimeout(() => {
  console.error('\n❌ TEST TIMEOUT - Server is hanging!');
  console.error('This confirms the hanging issue exists even with direct SDK usage.');
  process.exit(1);
}, 10000); // 10 second timeout

testDirectMcp()
  .then(() => {
    clearTimeout(timeout);
    console.log('\n🎉 Direct MCP test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('\n💥 Direct MCP test failed:', error);
    process.exit(1);
  });
