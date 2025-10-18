// SPDX-License-Identifier: GPL-3.0-only
// Hook System Tests

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { hookManager, registerBeforeHook, registerAfterHook } from '../hooks/tool-execute-hooks';

describe('Hook System', () => {
  beforeEach(() => {
    hookManager.clearHooks();
  });

  afterEach(() => {
    hookManager.clearHooks();
  });

  it('should register and execute before hooks', async () => {
    let called = false;
    let receivedArgs: any = null;

    registerBeforeHook('test-before', async (context) => {
      called = true;
      receivedArgs = context.args;
      return { ...context.args, modified: true };
    });

    const result = await hookManager.executeBeforeHooks(
      'test-tool',
      { test: 'value' },
      { pluginContext: {} },
    );

    assert.strictEqual(called, true);
    assert.deepStrictEqual(receivedArgs!, { test: 'value' });
    assert.deepStrictEqual(result.args, { test: 'value', modified: true });
    assert.strictEqual(result.metrics.length, 1);
    assert.strictEqual(result.metrics[0]!.success, true);
  });

  it('should register and execute after hooks', async () => {
    let called = false;
    let receivedResult: any = null;

    registerAfterHook('test-after', async (context) => {
      called = true;
      receivedResult = context.result;
      return { ...context.result, modified: true };
    });

    const result = await hookManager.executeAfterHooks(
      'test-tool',
      { test: 'value' },
      { success: true, result: { success: true }, metadata: {}, executionTime: 100 },
      { pluginContext: {} },
    );

    assert.strictEqual(called, true);
    assert.deepStrictEqual(receivedResult, { success: true });
    assert.deepStrictEqual(result.result, { success: true, modified: true });
    assert.strictEqual(result.metrics.length, 1);
    assert.strictEqual(result.metrics[0]!.success, true);
  });

  it('should handle hook execution errors', async () => {
    registerBeforeHook('failing-hook', async () => {
      throw new Error('Hook failed');
    });

    const result = await hookManager.executeBeforeHooks(
      'test-tool',
      { test: 'value' },
      { pluginContext: {} },
      { continueOnError: true },
    );

    assert.strictEqual(result.metrics.length, 1);
    assert.strictEqual(result.metrics[0]!.success, false);
    assert.strictEqual(result.metrics[0]!.error?.message, 'Hook failed');
  });

  it('should respect tool pattern matching', async () => {
    let called = false;

    registerBeforeHook(
      'pattern-hook',
      async () => {
        called = true;
      },
      { tools: ['test-*'] },
    );

    // Should match
    await hookManager.executeBeforeHooks('test-tool', {}, { pluginContext: {} });
    assert.strictEqual(called, true);

    called = false;
    // Should not match
    await hookManager.executeBeforeHooks('other-tool', {}, { pluginContext: {} });
    assert.strictEqual(called, false);
  });

  it('should maintain execution statistics', async () => {
    registerBeforeHook('stat-hook', async () => ({}));

    await hookManager.executeBeforeHooks('test-tool', {}, { pluginContext: {} });

    const stats = hookManager.getStatistics();
    assert.strictEqual(stats.totalHooks, 1);
    assert.strictEqual(stats.hooksByType.before, 1);
    assert.strictEqual(stats.totalExecutions, 1);
    assert.strictEqual(stats.executionsByTool['test-tool'], 1);
  });
});
