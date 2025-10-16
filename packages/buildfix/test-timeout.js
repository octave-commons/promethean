#!/usr/bin/env node

// Simple test for timeout manager
import { TimeoutManager, DEFAULT_TIMEOUTS } from './dist/timeout/timeout-manager.js';

console.log('Testing TimeoutManager...');

// Test 1: Default configuration
const manager = new TimeoutManager();
console.log('✓ Default timeout:', manager.getTimeout('default'));
console.log('✓ Process timeout:', manager.getTimeout('process'));
console.log('✓ Ollama timeout:', manager.getTimeout('ollama'));

// Test 2: Custom configuration
const customManager = new TimeoutManager({
  ...DEFAULT_TIMEOUTS,
  default: 5000,
  process: 10000,
});
console.log('✓ Custom default timeout:', customManager.getTimeout('default'));
console.log('✓ Custom process timeout:', customManager.getTimeout('process'));

// Test 3: Update configuration
manager.updateConfig({ ollama: 60000 });
console.log('✓ Updated ollama timeout:', manager.getTimeout('ollama'));

// Test 4: Successful execution
manager
  .executeWithTimeout('default', async () => {
    console.log('✓ Execution within timeout successful');
    return 'success';
  })
  .then((result) => {
    console.log('✓ Result:', result);
  })
  .catch((error) => {
    console.error('✗ Error:', error.message);
  });

// Test 5: Timeout error
manager
  .executeWithTimeout(
    'default',
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return 'should not reach';
    },
    { test: 'timeout' },
  )
  .then((result) => {
    console.log('✗ Should have timed out');
  })
  .catch((error) => {
    console.log('✓ Timeout error caught:', error.message);
  });

// Test 6: Stats
const stats = manager.getStats();
console.log('✓ Stats:', stats);

console.log('All tests completed!');
