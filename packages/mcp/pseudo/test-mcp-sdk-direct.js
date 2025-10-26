#!/usr/bin/env node

/**
 * Test MCP SDK StreamableHTTPServerTransport directly
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'http';

async function testMcpSdkDirect() {
  console.log('🧪 Testing MCP SDK StreamableHTTPServerTransport directly...');

  // Create MCP server
  const server = new McpServer({
    name: 'test-server',
    version: '1.0.0',
  });

  // Add a simple tool
  server.setRequestHandler('tools/list', async () => ({
    tools: [
      {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    ],
  }));

  // Create raw HTTP server
  const httpServer = createServer(async (req, res) => {
    console.log('📥 Received request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    // Create transport for each request
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => 'test-session-' + Date.now(),
    });

    try {
      // Connect server to transport
      await server.connect(transport);
      console.log('✅ Server connected to transport');

      // Parse body
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const parsedBody = JSON.parse(body || '{}');
          console.log('📝 Parsed body:', parsedBody);

          // Handle the request - this is where it might hang
          console.log('🔄 Calling transport.handleRequest...');
          await transport.handleRequest(req, res, parsedBody);
          console.log('✅ transport.handleRequest completed');
        } catch (error) {
          console.error('❌ Error handling request:', error);
          if (!res.headersSent) {
            res.writeHead(500).end(
              JSON.stringify({
                jsonrpc: '2.0',
                error: {
                  code: -32603,
                  message: 'Internal error',
                  data: String(error),
                },
                id: null,
              }),
            );
          }
        }
      });
    } catch (error) {
      console.error('❌ Error setting up transport:', error);
      res.writeHead(500).end(
        JSON.stringify({
          error: 'Setup failed',
          message: String(error),
        }),
      );
    }
  });

  try {
    console.log('🚀 Starting HTTP server on port 3215...');
    httpServer.listen(3215, 'localhost', () => {
      console.log('✅ Server started');
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test request
    console.log('🌐 Testing MCP SDK directly...');

    const response = await fetch('http://localhost:3215/', {
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
      signal: AbortSignal.timeout(5000),
    });

    console.log(`✅ Response status: ${response.status}`);
    const text = await response.text();
    console.log(`✅ Response body: ${text}`);

    // Keep server running
    console.log('🔄 Server running. Press Ctrl+C to stop...');
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Test failed:', error);
    httpServer.close();
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  process.exit(0);
});

testMcpSdkDirect().catch(console.error);
