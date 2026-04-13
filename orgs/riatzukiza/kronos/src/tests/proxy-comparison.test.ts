import test from 'ava';
import { describe } from 'node:test';
import assert from 'node:assert';
import { StdioHttpProxy } from '../proxy/stdio-proxy.js';
import { SdkStdioProxy } from '../proxy/sdk-stdio-proxy.js';
import { createProxy, selectProxyImplementation } from '../proxy/proxy-factory.js';
import type { StdioServerSpec } from '../proxy/config.js';

describe('Proxy Implementation Comparison', () => {
  const mockSpec: StdioServerSpec = {
    name: 'test-server',
    command: 'echo',
    args: ['hello'],
    env: {},
    cwd: process.cwd(),
    httpPath: '/test',
  };

  const mockLogger = (msg: string, ...rest: unknown[]) => {
    console.log(`[test] ${msg}`, ...rest);
  };

  describe('Proxy Factory', () => {
    test('should create manual proxy by default', () => {
      const proxy = createProxy(mockSpec, { implementation: 'manual', logger: mockLogger });
      assert(proxy instanceof StdioHttpProxy);
    });

    test('should create SDK proxy when requested', () => {
      const proxy = createProxy(mockSpec, { implementation: 'sdk', logger: mockLogger });
      assert(proxy instanceof SdkStdioProxy);
    });

    test('should select SDK implementation for Serena', () => {
      const serenaSpec: StdioServerSpec = { ...mockSpec, name: 'serena' };
      const implementation = selectProxyImplementation(serenaSpec, 'manual');
      assert.strictEqual(implementation, 'sdk');
    });

    test('should select manual implementation for other servers', () => {
      const otherSpec: StdioServerSpec = { ...mockSpec, name: 'other-server' };
      const implementation = selectProxyImplementation(otherSpec, 'manual');
      assert.strictEqual(implementation, 'manual');
    });

    test('should be case insensitive for server names', () => {
      const serenaSpecUpper: StdioServerSpec = { ...mockSpec, name: 'SERENA' };
      const implementation = selectProxyImplementation(serenaSpecUpper, 'manual');
      assert.strictEqual(implementation, 'sdk');
    });
  });

  describe('Interface Compatibility', () => {
    test('both implementations should have same interface', () => {
      const manualProxy = createProxy(mockSpec, { implementation: 'manual', logger: mockLogger });
      const sdkProxy = createProxy(mockSpec, { implementation: 'sdk', logger: mockLogger });

      // Check that both have required methods
      assert.strictEqual(typeof manualProxy.start, 'function');
      assert.strictEqual(typeof manualProxy.handle, 'function');
      assert.strictEqual(typeof manualProxy.stop, 'function');
      assert.strictEqual(typeof manualProxy.sessionId, 'string');

      assert.strictEqual(typeof sdkProxy.start, 'function');
      assert.strictEqual(typeof sdkProxy.handle, 'function');
      assert.strictEqual(typeof sdkProxy.stop, 'function');
      assert.strictEqual(typeof sdkProxy.sessionId, 'string');

      // Check that both have spec property
      assert.strictEqual(manualProxy.spec, mockSpec);
      assert.strictEqual(sdkProxy.spec, mockSpec);
    });
  });

  describe('Initialization Behavior', () => {
    test('manual proxy should start without waiting for initialization', async () => {
      const proxy = createProxy(mockSpec, { implementation: 'manual', logger: mockLogger });

      // Manual proxy should start immediately (though may fail later)
      const startTime = Date.now();
      try {
        await proxy.start();
      } catch (error) {
        // Expected to fail since echo is not a real MCP server
      }
      const endTime = Date.now();

      // Should start quickly (under 100ms) since it doesn't wait for proper initialization
      assert.ok(endTime - startTime < 100, 'Manual proxy should start quickly');

      await proxy.stop();
    });

    test('SDK proxy should wait for proper initialization', async () => {
      const proxy = createProxy(mockSpec, { implementation: 'sdk', logger: mockLogger });

      // SDK proxy should attempt proper initialization and fail gracefully
      const startTime = Date.now();
      try {
        await proxy.start();
        assert.fail('SDK proxy should fail when server is not a proper MCP server');
      } catch (error) {
        // Expected to fail since echo is not a real MCP server
        assert.ok(error instanceof Error);
      }
      const endTime = Date.now();

      // Should take longer as it attempts proper MCP initialization
      assert.ok(endTime - startTime > 100, 'SDK proxy should attempt initialization');

      await proxy.stop();
    });
  });

  describe('Error Handling', () => {
    test('both implementations should handle missing commands gracefully', async () => {
      const invalidSpec: StdioServerSpec = {
        ...mockSpec,
        command: 'non-existent-command-12345',
      };

      const manualProxy = createProxy(invalidSpec, {
        implementation: 'manual',
        logger: mockLogger,
      });
      const sdkProxy = createProxy(invalidSpec, { implementation: 'sdk', logger: mockLogger });

      // Both should fail gracefully
      await assert.rejects(async () => {
        await manualProxy.start();
      }, /Failed to start MCP server/);

      await assert.rejects(async () => {
        await sdkProxy.start();
      }, /Failed to start MCP server/);
    });
  });

  describe('Resource Management', () => {
    test('both implementations should clean up resources on stop', async () => {
      const manualProxy = createProxy(mockSpec, { implementation: 'manual', logger: mockLogger });
      const sdkProxy = createProxy(mockSpec, { implementation: 'sdk', logger: mockLogger });

      // Start proxies (they may fail but should allocate some resources)
      try {
        await manualProxy.start();
      } catch (error) {
        // Expected
      }

      try {
        await sdkProxy.start();
      } catch (error) {
        // Expected
      }

      // Stop should not throw
      await assert.doesNotReject(async () => {
        await manualProxy.stop();
      });

      await assert.doesNotReject(async () => {
        await sdkProxy.stop();
      });
    });
  });
});
