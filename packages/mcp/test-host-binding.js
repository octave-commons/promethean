#!/usr/bin/env node

/**
 * Test Fastify with different host bindings to isolate the hanging issue
 */

import Fastify from 'fastify';

async function testHostBinding() {
  console.log('🧪 Testing Fastify with different host bindings...\n');

  const testCases = [
    { host: '127.0.0.1', port: 3212, name: 'localhost (127.0.0.1)' },
    { host: '0.0.0.0', port: 3213, name: 'all interfaces (0.0.0.0)' },
  ];

  for (const testCase of testCases) {
    console.log(`🌐 Testing ${testCase.name} on port ${testCase.port}...`);

    try {
      const app = Fastify({ logger: false });

      app.get('/health', async () => ({
        status: 'ok',
        host: testCase.host,
        port: testCase.port,
        timestamp: new Date().toISOString(),
      }));

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Listen timeout')), 3000);
      });

      const listenPromise = app.listen({
        port: testCase.port,
        host: testCase.host,
      });

      await Promise.race([listenPromise, timeoutPromise]);
      console.log(`✅ ${testCase.name}: SUCCESS`);

      // Test connection
      const response = await fetch(`http://localhost:${testCase.port}/health`);
      console.log(`   Connection test: ${response.status}`);

      await app.close();
    } catch (error) {
      console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
    }

    console.log(''); // spacing
  }
}

testHostBinding().catch(console.error);
