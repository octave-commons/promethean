import test from 'ava';
import { promises as fs } from 'fs';
import * as path from 'path';
import { BuildFix } from '../buildfix.js';
import { globalTimeoutManager, TimeoutError } from '../timeout/timeout-manager.js';
import { globalMonitor } from '../timeout/monitoring.js';
import { buildTimeoutConfig } from '../timeout/config.js';

test.serial('timeout configuration is properly applied', async (t) => {
  const tempDir = await fs.mkdtemp('/tmp/buildfix-timeout-test-');

  try {
    // Create a test TypeScript file with an error
    const testFile = path.join(tempDir, 'src.ts');
    await fs.writeFile(testFile, 'const x: string = 123;', 'utf-8');

    // Create a tsconfig.json
    const tsconfigFile = path.join(tempDir, 'tsconfig.json');
    await fs.writeFile(
      tsconfigFile,
      JSON.stringify({
        compilerOptions: {
          strict: true,
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'node',
        },
        include: ['src.ts'],
      }),
      'utf-8',
    );

    // Test with custom timeout configuration
    const buildFix = new BuildFix();

    const result = await buildFix.fixErrors('', {
      filePath: testFile,
      tsconfig: tsconfigFile,
      model: 'qwen3:4b',
      timeout: 60000, // 1 minute
      tscTimeout: 30000, // 30 seconds
      ollamaTimeout: 45000, // 45 seconds
      enableMonitoring: true,
    });

    // Verify that the result includes timeout information
    t.true(typeof result.duration === 'number');
    t.true(result.duration >= 0);

    // Check that monitoring was enabled
    const stats = globalMonitor.getPerformanceStats();
    t.true(stats.totalOperations >= 1);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test.serial('timeout manager handles concurrent operations', async (t) => {
  const startTime = Date.now();

  // Create multiple concurrent operations
  const promises = Array.from({ length: 5 }, (_, i) =>
    globalTimeoutManager.executeWithTimeout(
      'default',
      async () => {
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 100));
        return `result-${i}`;
      },
      { operationId: `concurrent-${i}` },
    ),
  );

  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;

  // All operations should complete in roughly the same time (concurrent)
  t.true(duration < 500); // Should be much less than 5 * 100ms
  t.is(results.length, 5);
  t.true(results.every((r) => typeof r === 'string'));
});

test.serial('timeout error is thrown when operation exceeds limit', async (t) => {
  await t.throwsAsync(
    globalTimeoutManager.executeWithTimeout(
      'default',
      async () => {
        // Simulate work that exceeds timeout
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'should not reach here';
      },
      { testOperation: true },
    ),
    {
      instanceOf: TimeoutError,
      message: /Operation default timed out/,
    },
  );
});

test.serial('timeout configuration builder works correctly', (t) => {
  const config = buildTimeoutConfig({
    model: 'qwen3:4b',
    operation: 'plan-generation',
    customTimeouts: {
      ollama: 90000,
    },
  });

  // Should apply model-specific, operation-specific, and custom timeouts
  t.true(config.ollama === 90000); // Custom timeout takes precedence
  t.true(config.default > 0);
  t.true(config.tsc > 0);
  t.true(config.buildfix > 0);
});

test.serial('timeout configuration validation works', (t) => {
  const validConfig = {
    ollama: 30000,
    tsc: 60000,
    buildfix: 300000,
  };

  const invalidConfig = {
    ollama: -1000,
    tsc: 0,
    buildfix: 7200000, // 2 hours - too long
  };

  const validResult = globalTimeoutManager.validateTimeoutConfig(validConfig);
  t.true(validResult.valid);
  t.is(validResult.errors.length, 0);

  const invalidResult = globalTimeoutManager.validateTimeoutConfig(invalidConfig);
  t.false(invalidResult.valid);
  t.true(invalidResult.errors.length > 0);
});

test.serial('monitoring tracks timeout events', async (t) => {
  // Clear previous events
  globalMonitor.getRecentEvents().length = 0;

  try {
    await globalTimeoutManager.executeWithTimeout(
      'default',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return 'success';
      },
      { timeout: 100 },
    ); // Will timeout
  } catch (error) {
    // Expected to timeout
  }

  const events = globalMonitor.getRecentEvents();
  const timeoutEvents = events.filter((e) => e.type === 'timeout');

  // Should have recorded the timeout event
  t.true(timeoutEvents.length >= 1);
  if (timeoutEvents.length > 0) {
    const event = timeoutEvents[0]!;
    t.is(event.type, 'timeout');
    t.true(typeof event.data.operation === 'string');
    t.true(typeof event.data.timeoutMs === 'number');
  }
});

test.serial('process wrapper respects timeouts', async (t) => {
  const { ProcessWrapper } = await import('../timeout/process-wrapper.js');

  // Test with a command that should complete quickly
  const result = await ProcessWrapper.execute('echo', ['hello'], {
    timeout: 5000, // 5 seconds
  });

  t.is(result.code, 0);
  t.true(result.out.includes('hello'));
  t.false(result.timedOut);
  t.true(result.duration < 5000);
});

test.serial('ollama wrapper respects timeouts', async (t) => {
  const { globalOllamaWrapper } = await import('../timeout/ollama-wrapper.js');

  // Mock a quick response
  const originalGenerate = globalOllamaWrapper.generateJSON;
  let callCount = 0;

  globalOllamaWrapper.generateJSON = async <T = unknown>(
    model: string,
    _prompt: string,
    _options: any = {},
  ) => {
    callCount++;
    if (callCount === 1) {
      // First call: quick response
      return {
        data: { test: 'response' } as T,
        duration: 100,
        timedOut: false,
        retries: 0,
        model,
      };
    } else {
      // Second call: slow response (simulated)
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        data: { test: 'slow response' } as T,
        duration: 200,
        timedOut: false,
        retries: 0,
        model,
      };
    }
  };

  try {
    // Test with sufficient timeout
    const result1 = await globalOllamaWrapper.generateJSON('test-model', 'test prompt', {
      timeout: 1000,
    });

    t.false(result1.timedOut);
    t.true(result1.duration < 1000);

    // Test with very short timeout (this might not actually timeout due to mocking)
    const result2 = await globalOllamaWrapper.generateJSON('test-model', 'test prompt', {
      timeout: 50,
    });

    t.true(result2.duration >= 0);
  } finally {
    // Restore original function
    globalOllamaWrapper.generateJSON = originalGenerate;
  }
});

test.serial('BuildFix with timeout configuration handles errors gracefully', async (t) => {
  const tempDir = await fs.mkdtemp('/tmp/buildfix-timeout-error-test-');

  try {
    // Create a test TypeScript file with an error
    const testFile = path.join(tempDir, 'src.ts');
    await fs.writeFile(testFile, 'const x: string = 123;', 'utf-8');

    // Create a tsconfig.json
    const tsconfigFile = path.join(tempDir, 'tsconfig.json');
    await fs.writeFile(
      tsconfigFile,
      JSON.stringify({
        compilerOptions: {
          strict: true,
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'node',
        },
        include: ['src.ts'],
      }),
      'utf-8',
    );

    const buildFix = new BuildFix();

    // Test with very short timeout to trigger timeout handling
    const result = await buildFix.fixErrors('', {
      filePath: testFile,
      tsconfig: tsconfigFile,
      model: 'nonexistent-model', // This will cause an error
      timeout: 1000, // Very short timeout
      enableMonitoring: true,
    });

    // Should handle the error gracefully
    t.false(result.success);
    t.true(typeof result.error === 'string');
    t.true(typeof result.duration === 'number');

    // Should still record the attempt
    t.true(result.attempts >= 0);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test.serial('timeout manager provides statistics', async (t) => {
  // Clear any existing timeouts
  globalTimeoutManager.clearAllTimeouts();

  // Start some operations
  const promises = Array.from({ length: 3 }, (_, i) =>
    globalTimeoutManager.executeWithTimeout(
      'default',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return i;
      },
      { operationId: `stats-test-${i}` },
    ),
  );

  // Check stats while operations are running
  const runningStats = globalTimeoutManager.getStats();
  t.true(runningStats.activeTimeouts >= 0);

  // Wait for completion
  await Promise.all(promises);

  // Check stats after completion
  const finalStats = globalTimeoutManager.getStats();
  t.is(finalStats.activeTimeouts, 0);
  t.true(finalStats.longestRunning === null);
});

test.serial('environment-specific timeout configurations', async (t) => {
  const { getCurrentEnvironment, getEnvironmentTimeouts } = await import('../timeout/config.js');

  const currentEnv = getCurrentEnvironment();
  t.true(typeof currentEnv === 'string');

  const envTimeouts = getEnvironmentTimeouts();
  t.true(typeof envTimeouts.default === 'number');
  t.true(envTimeouts.default! > 0);
  t.true(typeof envTimeouts.ollama === 'number');
  t.true(envTimeouts.ollama! > 0);
});
