import { hookManager, registerBeforeHook } from './dist/hooks/tool-execute-hooks.js';

// Clear any existing hooks
hookManager.clearHooks();

console.log('=== Debug Hook Test ===');

// Register a debug hook that logs what it receives
registerBeforeHook('debug-before', async (context) => {
  console.log('Hook received context:', JSON.stringify(context, null, 2));
  console.log('Hook received context.args:', context.args);
  console.log('Type of context.args:', typeof context.args);
  return { ...context.args, modified: true };
});

// Execute the hook
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