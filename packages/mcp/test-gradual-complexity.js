#!/usr/bin/env node

/**
 * Test Promethean Fastify setup with gradual complexity to isolate hanging
 */

import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { createSecurityMiddleware } from './src/security/index.js';

async function testGradualComplexity() {
  console.log('🧪 Testing Promethean Fastify setup with gradual complexity...\n');

  const testCases = [
    {
      name: 'Basic Fastify',
      setup: async () => {
        const app = Fastify({ logger: false });
        app.get('/health', () => ({ status: 'ok' }));
        return app;
      },
    },
    {
      name: 'Fastify + CORS',
      setup: async () => {
        const app = Fastify({ logger: false });
        await app.register(fastifyCors);
        app.get('/health', () => ({ status: 'ok' }));
        return app;
      },
    },
    {
      name: 'Fastify + Security Middleware',
      setup: async () => {
        const app = Fastify({ logger: false });
        const securityMiddleware = createSecurityMiddleware();
        await app.register(securityMiddleware.plugin);
        app.get('/health', () => ({ status: 'ok' }));
        return app;
      },
    },
    {
      name: 'Fastify + Static Files',
      setup: async () => {
        const app = Fastify({ logger: false });
        // Don't register static files since directory doesn't exist
        // await app.register(fastifyStatic, { root: '/tmp', prefix: '/static/' });
        app.get('/health', () => ({ status: 'ok' }));
        return app;
      },
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const port = 3220 + i;

    console.log(`🌐 Testing ${testCase.name} on port ${port}...`);

    try {
      const app = await testCase.setup();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Listen timeout')), 5000);
      });

      const listenPromise = app.listen({ port, host: '0.0.0.0' });

      await Promise.race([listenPromise, timeoutPromise]);
      console.log(`✅ ${testCase.name}: SUCCESS`);

      // Test connection
      const response = await fetch(`http://localhost:${port}/health`);
      console.log(`   Connection test: ${response.status}`);

      await app.close();
    } catch (error) {
      console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
      console.log(`   This is the hanging point!`);
      break;
    }

    console.log(''); // spacing
  }
}

testGradualComplexity().catch(console.error);
