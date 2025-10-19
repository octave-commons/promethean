// SPDX-License-Identifier: GPL-3.0-only
// Hook System Tests

import test from 'ava';
import { hookManager, registerBeforeHook, registerAfterHook } from '../hooks/tool-execute-hooks.js';
import type { HookContext } from '../types/plugin-hooks.js';

test.beforeEach(() => {
  hookManager.clearHooks();
});

test.afterEach(() => {
  hookManager.clearHooks();
});

test('should register and execute before hooks', async (t) => {
  let called = false;
  let receivedArgs: any = null;

  registerBeforeHook('test-before', async (context: HookContext) => {
    called = true;
    receivedArgs = context.args;
    return { ...context.args, modified: true };
  });

  const result = await hookManager.executeBeforeHooks(
    'test-tool',
    { test: 'value' },
    { 
      pluginContext: { 
        permissions: ['execute_hooks']
      } 
    },
  );

  t.is(called, true);
  t.deepEqual(receivedArgs!, { test: 'value' });
  t.deepEqual(result.args, { test: 'value', modified: true });
  t.is(result.metrics.length, 1);
  t.is(result.metrics[0]!.success, true);
});

test('should register and execute after hooks', async (t) => {
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
    { 
      pluginContext: { 
        permissions: ['execute_hooks']
      } 
    },
  );

  t.is(called, true);
  t.deepEqual(receivedResult, { success: true });
  t.deepEqual(result.result, { success: true, modified: true });
  t.is(result.metrics.length, 1);
  t.is(result.metrics[0]!.success, true);
});

test('should handle hook execution errors', async (t) => {
  registerBeforeHook('failing-hook', async () => {
    throw new Error('Hook failed');
  });

  const result = await hookManager.executeBeforeHooks(
    'test-tool',
    { test: 'value' },
    { 
      pluginContext: { 
        permissions: ['execute_hooks']
      } 
    },
    { continueOnError: true },
  );

  t.is(result.metrics.length, 1);
  t.is(result.metrics[0]!.success, false);
  t.is(result.metrics[0]!.error?.message, 'Hook failed');
});

test('should respect tool pattern matching', async (t) => {
  let called = false;

  registerBeforeHook(
    'pattern-hook',
    async () => {
      called = true;
    },
    { tools: ['test-*'] },
  );

  // Should match
  await hookManager.executeBeforeHooks('test-tool', {}, { 
    pluginContext: { 
      permissions: ['execute_hooks']
    } 
  });
  t.is(called, true);

  called = false;
  // Should not match
  await hookManager.executeBeforeHooks('other-tool', {}, { 
    pluginContext: { 
      permissions: ['execute_hooks']
    } 
  });
  t.is(called, false);
});

test('should maintain execution statistics', async (t) => {
  registerBeforeHook('stat-hook', async () => ({}));

  await hookManager.executeBeforeHooks('test-tool', {}, { 
    pluginContext: { 
      permissions: ['execute_hooks']
    } 
  });

  const stats = hookManager.getStatistics();
  t.is(stats.totalHooks, 1);
  t.is(stats.hooksByType.before, 1);
  t.is(stats.totalExecutions, 1);
  t.is(stats.executionsByTool['test-tool'], 1);
});