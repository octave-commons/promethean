import { hookManager, registerBeforeHook } from './dist/hooks/tool-execute-hooks.js';

// Clear any existing hooks
hookManager.clearHooks();

console.log('=== Detailed Hook Debug ===');

// Register a debug hook that logs everything
registerBeforeHook('debug-before', async (context) => {
  console.log('=== HOOK EXECUTION START ===');
  console.log('Full context object:', context);
  console.log('context.args:', context.args);
  console.log('context.args type:', typeof context.args);
  console.log('context.args keys:', Object.keys(context.args || {}));
  console.log('context.args === undefined:', context.args === undefined);
  console.log('context.args === null:', context.args === null);
  console.log('JSON.stringify(context.args):', JSON.stringify(context.args));
  console.log('=== HOOK EXECUTION END ===');
  return { ...context.args, modified: true };
});

// Execute the hook with the exact same parameters as the test
console.log('Executing hook with test parameters...');
const result = await hookManager.executeBeforeHooks(
  'test-tool',
  { test: 'value' },
  { 
    pluginContext: { 
      permissions: ['execute_hooks']
    } 
  },
);

console.log('Final result:', JSON.stringify(result, null, 2));