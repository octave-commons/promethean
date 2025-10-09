import test from 'ava';
import { runTests } from '../src/tests/test-helpers.js';

test('omni-service: configuration and basic functionality', async (t) => {
  const allPassed = await runTests();
  t.true(allPassed, 'All omni-service tests should pass');
});

test('omni-service: package structure validation', async (t) => {
  // Test that we can import the main modules
  const { config } = await import('../src/config.js');
  const { createApp } = await import('../src/app.js');
  
  t.truthy(config, 'Config should be importable');
  t.truthy(createApp, 'createApp should be importable');
  
  // Test configuration structure
  t.is(typeof config.port, 'number', 'Config port should be a number');
  t.is(typeof config.host, 'string', 'Config host should be a string');
  t.truthy(config.adapters, 'Config should have adapters');
  t.truthy(config.adapters.rest, 'Config should have REST adapter');
  t.truthy(config.adapters.graphql, 'Config should have GraphQL adapter');
  t.truthy(config.adapters.websocket, 'Config should have WebSocket adapter');
  t.truthy(config.adapters.mcp, 'Config should have MCP adapter');
});

test('omni-service: app creation', async (t) => {
  const { createApp, config } = await import('../src/app.js');
  
  const app = createApp(config);
  t.truthy(app, 'App should be created successfully');
  
  // Test health endpoint
  const response = await app.inject({
    method: 'GET',
    url: '/health',
  });
  
  t.is(response.statusCode, 200, 'Health endpoint should return 200');
  
  const healthData = JSON.parse(response.payload);
  t.is(healthData.status, 'ok', 'Health response should have ok status');
  t.is(healthData.service, 'omni-service', 'Health response should identify service');
  
  await app.close();
});