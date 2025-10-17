import { createApp } from '../app.js';
import { config } from '../config.js';

// Health check test
export async function healthCheckTest() {
  const app = createApp(config);

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    console.log('✅ Health check test passed');
    console.log('Status:', response.statusCode);
    console.log('Response:', JSON.parse(response.payload));

    return true;
  } catch (error) {
    console.error('❌ Health check test failed:', error);
    return false;
  } finally {
    await app.close();
  }
}

// Basic server startup test
export async function serverStartTest() {
  console.log('🧪 Testing server startup...');

  try {
    const app = createApp(config);
    const port = config.port + 100; // Use different port for testing

    // Test server startup
    await app.listen({ port, host: '127.0.0.1' });
    console.log(`✅ Test server started on http://127.0.0.1:${port}`);

    // Test health endpoint
    const healthResponse = await app.inject({
      method: 'GET',
      url: '/health',
    });

    if (healthResponse.statusCode === 200) {
      console.log('✅ Health endpoint responding correctly');
    } else {
      console.error('❌ Health endpoint failed:', healthResponse.statusCode);
    }

    // Test root endpoint
    const rootResponse = await app.inject({
      method: 'GET',
      url: '/',
    });

    if (rootResponse.statusCode === 200) {
      console.log('✅ Root endpoint responding correctly');
      console.log('Service info:', JSON.parse(rootResponse.payload));
    } else {
      console.error('❌ Root endpoint failed:', rootResponse.statusCode);
    }

    await app.close();
    console.log('✅ Server startup test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Server startup test failed:', error);
    return false;
  }
}

// Configuration validation test
export async function configValidationTest() {
  console.log('🧪 Testing configuration validation...');

  try {
    const { config, OmniServiceConfigSchema } = await import('../config.js');

    console.log('✅ Config module loaded successfully');
    console.log('Configuration:', {
      port: config.port,
      host: config.host,
      nodeEnv: config.nodeEnv,
      adapters: {
        rest: config.adapters.rest,
        graphql: config.adapters.graphql,
        websocket: config.adapters.websocket,
        mcp: config.adapters.mcp,
      },
    });

    // Test schema validation
    const testResult = OmniServiceConfigSchema.safeParse(config);
    if (testResult.success) {
      console.log('✅ Configuration schema validation passed');
    } else {
      console.error('❌ Configuration schema validation failed:', testResult.error);
      return false;
    }

    console.log('✅ Configuration validation test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Configuration validation test failed:', error);
    return false;
  }
}

// Run all tests
export async function runTests() {
  console.log('🧪 Running Omni Service tests...\n');

  const tests = [
    { name: 'Configuration Validation', fn: configValidationTest },
    { name: 'Health Check', fn: healthCheckTest },
    { name: 'Server Startup', fn: serverStartTest },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${test.name} ERROR:`, error);
    }
  }

  console.log(`\n--- Test Results ---`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    return true;
  } else {
    console.log('\n💥 Some tests failed!');
    return false;
  }
}
