#!/usr/bin/env node

/**
 * Simple test to check if MCP server can start and respond at all
 */

import { createServer } from 'http';

const PORT = 3213;

console.log('🧪 Starting simple HTTP server for baseline test...');

const server = createServer((req, res) => {
  console.log(`📋 Request received: ${req.method} ${req.url}`);

  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    console.log('✅ Health endpoint responded');
    return;
  }

  // Default response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
  console.log('❓ Unknown endpoint, responded with 404');
});

server.listen(PORT, () => {
  console.log(`✅ Simple server listening on http://localhost:${PORT}`);
  console.log('🔄 Testing baseline...');

  // Test ourselves
  import('http').then((http) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/healthz',
        method: 'GET',
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          console.log('✅ Baseline test successful:', data);
          server.close();
          process.exit(0);
        });
      },
    );

    req.on('error', (err) => {
      console.log('❌ Baseline test failed:', err.message);
      server.close();
      process.exit(1);
    });

    req.end();
  });
});

server.on('error', (err) => {
  console.log('❌ Server failed to start:', err.message);
  process.exit(1);
});
