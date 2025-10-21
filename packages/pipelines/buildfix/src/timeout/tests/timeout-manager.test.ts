import test from 'ava';
import { TimeoutManager, TimeoutError, DEFAULT_TIMEOUTS } from '../timeout-manager.js';

test('TimeoutManager - default configuration', (t) => {
  const manager = new TimeoutManager();

  t.is(manager.getTimeout('default'), DEFAULT_TIMEOUTS.default);
  t.is(manager.getTimeout('process'), DEFAULT_TIMEOUTS.process);
  t.is(manager.getTimeout('ollama'), DEFAULT_TIMEOUTS.ollama);
});

test('TimeoutManager - custom configuration', (t) => {
  const customConfig = {
    ...DEFAULT_TIMEOUTS,
    default: 10000,
    process: 20000,
    ollama: 30000,
  };

  const manager = new TimeoutManager(customConfig);

  t.is(manager.getTimeout('default'), 10000);
  t.is(manager.getTimeout('process'), 20000);
  t.is(manager.getTimeout('ollama'), 30000);
  t.is(manager.getTimeout('tsc'), DEFAULT_TIMEOUTS.tsc); // Should use default
});

test('TimeoutManager - update configuration', (t) => {
  const manager = new TimeoutManager();

  manager.updateConfig({ process: 45000, ollama: 60000 });

  t.is(manager.getTimeout('process'), 45000);
  t.is(manager.getTimeout('ollama'), 60000);
  t.is(manager.getTimeout('default'), DEFAULT_TIMEOUTS.default); // Should remain unchanged
});

test('TimeoutManager - successful execution within timeout', async (t) => {
  const manager = new TimeoutManager({ ...DEFAULT_TIMEOUTS, default: 1000 });

  const result = await manager.executeWithTimeout('default', async () => {
    return 'success';
  });

  t.is(result, 'success');
});

test('TimeoutManager - timeout error', async (t) => {
  const manager = new TimeoutManager({ ...DEFAULT_TIMEOUTS, default: 100 });

  await t.throwsAsync(
    manager.executeWithTimeout('default', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return 'should not reach';
    }),
    {
      instanceOf: TimeoutError,
      message: /Operation default timed out after 100ms/,
    },
  );
});

test('TimeoutManager - timeout event emission', async (t) => {
  const manager = new TimeoutManager({ ...DEFAULT_TIMEOUTS, default: 100 });
  let timeoutEventFired = false;

  manager.on('timeout', () => {
    timeoutEventFired = true;
  });

  try {
    await manager.executeWithTimeout('default', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return 'should not reach';
    });
  } catch (error) {
    // Expected to timeout
  }

  t.true(timeoutEventFired);
});

test('TimeoutManager - multiple concurrent operations', async (t) => {
  const manager = new TimeoutManager({ ...DEFAULT_TIMEOUTS, default: 200 });

  const operations = [
    manager.executeWithTimeout('default', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'op1';
    }),
    manager.executeWithTimeout('default', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return 'op2';
    }),
    manager.executeWithTimeout('default', async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return 'op3';
    }),
  ];

  const results = await Promise.all(operations);
  t.deepEqual(results, ['op1', 'op2', 'op3']);
});

test('TimeoutManager - stats tracking', async (t) => {
  const manager = new TimeoutManager({ ...DEFAULT_TIMEOUTS, default: 1000 });

  // Start a long-running operation
  const operation = manager.executeWithTimeout('default', async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return 'done';
  });

  // Check stats while operation is running
  const stats = manager.getStats();
  t.is(stats.activeTimeouts, 1);
  t.truthy(stats.longestRunning);

  await operation;

  // Check stats after completion
  const finalStats = manager.getStats();
  t.is(finalStats.activeTimeouts, 0);
  t.is(finalStats.longestRunning, null);
});

test('TimeoutManager - cleanup', async (t) => {
  const manager = new TimeoutManager({ ...DEFAULT_TIMEOUTS, default: 1000 });

  // Start an operation
  const operation = manager.executeWithTimeout('default', async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return 'done';
  });

  // Destroy manager (should clean up timeouts)
  manager.destroy();

  // Operation should still complete (timeout was cleared)
  const result = await operation;
  t.is(result, 'done');
});

test('TimeoutManager - metadata handling', async (t) => {
  const manager = new TimeoutManager({ ...DEFAULT_TIMEOUTS, default: 100 });
  let capturedMetadata: any = null;

  manager.on('timeout', (event: any) => {
    capturedMetadata = event.metadata;
  });

  const metadata = { testId: '123', operation: 'test' };

  try {
    await manager.executeWithTimeout(
      'default',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'should not reach';
      },
      metadata,
    );
  } catch (error) {
    // Expected to timeout
  }

  t.deepEqual(capturedMetadata, metadata);
});

test('globalTimeoutManager - convenience function', async (t) => {
  const { withTimeout } = await import('../timeout-manager.js');

  const result = await withTimeout('default', async () => {
    return 'global success';
  });

  t.is(result, 'global success');
});
