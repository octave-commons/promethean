#!/usr/bin/env node

/**
 * Test minimal Fastify server startup to isolate hanging issue
 */

import Fastify from 'fastify';

async function testMinimalFastifyStart() {
  console.log('🧪 Testing minimal Fastify server startup...\n');

  try {
    // Create minimal Fastify instance
    const app = Fastify({
      logger: false,
    });

    // Add a simple route
    app.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    console.log('✅ Fastify instance created');
    console.log('🌐 Attempting to listen on port 3211...');

    // This is where the hanging occurs
    const address = await app.listen({
      port: 3211,
      host: '0.0.0.0',
    });

    console.log(`✅ Server listening on ${address}`);

    // Test the endpoint
    console.log('\n🔍 Testing endpoint...');
    const response = await fetch('http://localhost:3211/health');
    console.log(`✅ Response status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', data);

    // Cleanup
    await app.close();
    console.log('\n✅ Minimal Fastify test passed!');
  } catch (error) {
    console.error('❌ Minimal Fastify test failed:', error.message);
    console.error('Stack:', error.stack);

    if (error.message.includes('timeout') || error.message.includes('EADDRINUSE')) {
      console.log('\n💡 Port or network issue detected');
    } else {
      console.log('\n💡 Fastify startup issue - possibly plugins or configuration');
    }

    process.exit(1);
  }
}

// Set timeout to detect hanging
const timeout = setTimeout(() => {
  console.error('\n❌ TEST TIMEOUT - Fastify listen() is hanging!');
  console.error('This confirms the issue is in Fastify.listen(), not MCP logic.');
  process.exit(1);
}, 5000); // 5 second timeout

testMinimalFastifyStart()
  .then(() => {
    clearTimeout(timeout);
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error('\n💥 Minimal Fastify test failed:', error);
    process.exit(1);
  });
