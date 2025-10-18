#!/usr/bin/env node

/**
 * Test only the StreamableHTTPServerTransport to see if it hangs
 */

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'http';

async function testTransportOnly() {
  console.log('🧪 Testing StreamableHTTPServerTransport only...');

  // Create transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => 'test-session-' + Date.now(),
  });

  // Create raw HTTP server
  const httpServer = createServer(async (req, res) => {
    console.log('📥 Received request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    try {
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
          const startTime = Date.now();

          await transport.handleRequest(req, res, parsedBody);

          const endTime = Date.now();
          console.log(`✅ transport.handleRequest completed in ${endTime - startTime}ms`);
          console.log('📊 Response headers sent:', res.headersSent);
          console.log('📊 Response finished:', res.finished);
          console.log('📊 Response writable:', res.writable);
        } catch (error) {
          console.error('❌ Error handling request:', error);
          if (!res.headersSent) {
            res.writeHead(500).end(
              JSON.stringify({
                error: 'Handler failed',
                message: String(error),
              }),
            );
          }
        }
      });
    } catch (error) {
      console.error('❌ Error in request handler:', error);
      res.writeHead(500).end(
        JSON.stringify({
          error: 'Setup failed',
          message: String(error),
        }),
      );
    }
  });

  try {
    console.log('🚀 Starting HTTP server on port 3216...');
    httpServer.listen(3216, 'localhost', () => {
      console.log('✅ Server started');
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test request
    console.log('🌐 Testing transport directly...');

    const testRequest = async () => {
      try {
        const response = await fetch('http://localhost:3216/', {
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
          console.error('❌ Request timed out - transport is hanging!');
        }
      }
    };

    // Run test
    await testRequest();

    // Keep server running for manual testing
    console.log('🔄 Server running. Press Ctrl+C to stop...');
    console.log(
      '🔗 Test with: curl -X POST http://localhost:3216/ -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}\'',
    );

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

testTransportOnly().catch(console.error);
