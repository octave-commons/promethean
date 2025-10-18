#!/usr/bin/env node

/**
 * Test Fastify directly without MCP SDK to isolate the hanging issue
 */

import Fastify from 'fastify';

async function testDirectFastify() {
  console.log('🧪 Testing Fastify directly without MCP SDK...');

  const app = Fastify({
    logger: false,
  });

  // Add a simple route that mimics the MCP handler structure
  app.post('/mcp', async (request, reply) => {
    console.log('📥 Received request:', {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
    });

    // This is the key line from the MCP handler - reply.hijack()
    reply.hijack();
    console.log('🔓 Hijacked reply');

    const rawReq = request.raw;
    const rawRes = reply.raw;

    try {
      // Simulate what the MCP transport does
      console.log('📝 Writing response...');

      rawRes.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });

      const response = {
        jsonrpc: '2.0',
        id: request.body?.id || null,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'test-server',
            version: '1.0.0',
          },
        },
      };

      rawRes.end(JSON.stringify(response));
      console.log('✅ Response sent');
    } catch (error) {
      console.error('❌ Error in handler:', error);
      if (!rawRes.headersSent) {
        rawRes.writeHead(500).end(
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

  // Add a simple health check
  app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  try {
    console.log('🚀 Starting Fastify server on port 3214...');
    await app.listen({ port: 3214, host: 'localhost' });
    console.log('✅ Server started');

    // Test the health endpoint first
    console.log('🏥 Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3214/health');
    console.log('✅ Health response:', await healthResponse.json());

    // Test the MCP endpoint
    console.log('🌐 Testing MCP endpoint...');
    const mcpResponse = await fetch('http://localhost:3214/mcp', {
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

    console.log(`✅ MCP Response status: ${mcpResponse.status}`);
    const text = await mcpResponse.text();
    console.log(`✅ MCP Response body: ${text}`);

    // Keep server running for manual testing
    console.log('🔄 Server running. Press Ctrl+C to stop...');
    console.log(
      '🔗 Test with: curl -X POST http://localhost:3214/mcp -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}\'',
    );

    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  process.exit(0);
});

testDirectFastify().catch(console.error);
