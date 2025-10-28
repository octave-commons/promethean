import test from 'ava';

import { createProxy } from '../proxy/proxy-factory.js';
import type { StdioServerSpec } from '../proxy/config.js';

test.serial(
  'serena-sdk-proxy › Serena server initializes successfully with SDK proxy',
  async (t) => {
    // Create Serena spec based on promethean.mcp.json configuration
    const serenaSpec: StdioServerSpec = {
      name: 'serena',
      command: 'uvx',
      args: ['--from', 'git+https://github.com/oraios/serena', 'serena', 'start-mcp-server'],
      env: {},
      cwd: '/home/err/devel/promethean',
      httpPath: '/serena',
      proxy: 'sdk', // Explicitly use SDK implementation
    };

    // Create SDK proxy for Serena
    const logger = () => {}; // Suppress logs for cleaner test output
    const proxy = createProxy(serenaSpec, {
      implementation: 'sdk',
      logger,
    });

    t.truthy(proxy, 'Proxy should be created successfully');
    t.is(proxy.spec.name, 'serena', 'Proxy should have correct spec name');

    // Start the proxy and measure initialization time
    const startTime = Date.now();
    await proxy.start();
    const initTime = Date.now() - startTime;

    t.true(initTime > 0, 'Initialization should take positive time');
    t.true(initTime < 30000, 'Initialization should complete within 30 seconds');

    // Verify server info is available (optional)
    if (proxy.getServerInfo) {
      const serverInfo = proxy.getServerInfo() as any;
      // Server info might not be available from all MCP servers
      if (serverInfo) {
        t.truthy(serverInfo.version, 'Server version should be available');
      }
    }

    // Verify capabilities are available
    if (proxy.getServerCapabilities) {
      const capabilities = proxy.getServerCapabilities();
      t.truthy(capabilities, 'Server capabilities should be available');
      // Capabilities can be an object or array depending on MCP server implementation
      t.true(
        typeof capabilities === 'object' && capabilities !== null,
        'Capabilities should be an object',
      );
    }

    // Stop the proxy cleanly
    await proxy.stop();
    t.pass('Proxy should stop successfully');
  },
);

test.serial('serena-sdk-proxy › Proxy factory selects SDK implementation for Serena', async (t) => {
  const serenaSpec: StdioServerSpec = {
    name: 'serena',
    command: 'uvx',
    args: ['--from', 'git+https://github.com/oraios/serena', 'serena', 'start-mcp-server'],
    env: {},
    cwd: '/home/err/devel/promethean',
    httpPath: '/serena',
  };

  // Test that proxy factory automatically selects SDK for Serena
  const logger = () => {};
  const proxy = createProxy(serenaSpec, { logger });

  t.truthy(proxy, 'Proxy should be created successfully');

  // The proxy should be an SDK-based instance (we can check this via the constructor name)
  t.true(proxy.constructor.name.includes('Sdk'), 'Proxy should be SDK-based instance');

  await proxy.stop();
});
