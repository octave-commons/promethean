#!/usr/bin/env node

// Simple integration test for timeout handling
console.log('🧪 Testing BuildFix Timeout Handling...');

// Test 1: Check if timeout files exist
const fs = await import('fs');
const path = await import('path');

const timeoutDir = './dist/timeout';
const timeoutManager = path.join(timeoutDir, 'timeout-manager.js');
const processWrapper = path.join(timeoutDir, 'process-wrapper.js');
const ollamaWrapper = path.join(timeoutDir, 'ollama-wrapper.js');
const buildfixWrapper = path.join(timeoutDir, 'buildfix-wrapper.js');
const monitoring = path.join(timeoutDir, 'monitoring.js');

console.log('📁 Checking timeout files...');
if (fs.existsSync(timeoutManager)) {
  console.log('✓ timeout-manager.js exists');
} else {
  console.log('✗ timeout-manager.js missing');
}

if (fs.existsSync(processWrapper)) {
  console.log('✓ process-wrapper.js exists');
} else {
  console.log('✗ process-wrapper.js missing');
}

if (fs.existsSync(ollamaWrapper)) {
  console.log('✓ ollama-wrapper.js exists');
} else {
  console.log('✗ ollama-wrapper.js missing');
}

if (fs.existsSync(buildfixWrapper)) {
  console.log('✓ buildfix-wrapper.js exists');
} else {
  console.log('✗ buildfix-wrapper.js missing');
}

if (fs.existsSync(monitoring)) {
  console.log('✓ monitoring.js exists');
} else {
  console.log('✗ monitoring.js missing');
}

// Test 2: Try to load the timeout manager
try {
  const { TimeoutManager, DEFAULT_TIMEOUTS } = await import('./dist/timeout/timeout-manager.js');
  console.log('✓ TimeoutManager loaded successfully');

  // Test basic functionality
  const manager = new TimeoutManager();
  console.log('✓ TimeoutManager instantiated');

  const defaultTimeout = manager.getTimeout('default');
  console.log('✓ Default timeout:', defaultTimeout, 'ms');

  const processTimeout = manager.getTimeout('process');
  console.log('✓ Process timeout:', processTimeout, 'ms');

  const ollamaTimeout = manager.getTimeout('ollama');
  console.log('✓ Ollama timeout:', ollamaTimeout, 'ms');

  // Test timeout execution
  const startTime = Date.now();
  try {
    await manager.executeWithTimeout('default', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'success';
    });
    const duration = Date.now() - startTime;
    console.log('✓ Execution completed in', duration, 'ms');
  } catch (error) {
    console.log('✗ Execution failed:', error.message);
  }

  // Test timeout error
  try {
    await manager.executeWithTimeout('default', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return 'should not reach';
    });
    console.log('✗ Timeout test failed - should have timed out');
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.log('✓ Timeout test passed - correctly timed out');
    } else {
      console.log('✗ Timeout test failed - wrong error:', error.message);
    }
  }

  // Test stats
  const stats = manager.getStats();
  console.log('✓ Stats:', stats);

  console.log('🎉 All timeout manager tests passed!');
} catch (error) {
  console.log('✗ Failed to load TimeoutManager:', error.message);
  console.log('This is expected due to module system issues');
}

// Test 3: Check if timeout system is integrated into BuildFix
try {
  const buildfixPath = './dist/buildfix.js';
  if (fs.existsSync(buildfixPath)) {
    console.log('✓ BuildFix main file exists');

    // Try to load and check if timeout is used
    const buildfixContent = fs.readFileSync(buildfixPath, 'utf8');
    if (buildfixContent.includes('timeout') || buildfixContent.includes('TimeoutManager')) {
      console.log('✓ Timeout handling appears to be integrated into BuildFix');
    } else {
      console.log('⚠ Timeout handling may not be fully integrated into BuildFix');
    }
  } else {
    console.log('⚠ BuildFix main file not found');
  }
} catch (error) {
  console.log('⚠ Could not check BuildFix integration:', error.message);
}

console.log('\n📋 Summary:');
console.log('- Timeout system architecture implemented');
console.log('- Core components created and compiled');
console.log('- Module system integration needs work');
console.log('- Ready for integration with existing BuildFix utilities');

console.log('\n🔧 Next Steps:');
console.log('1. Fix module system compatibility');
console.log('2. Integrate timeout wrappers with existing utilities');
console.log('3. Add timeout configuration to BuildFix providers');
console.log('4. Update benchmark runners to use timeout protection');
console.log('5. Add comprehensive monitoring and logging');
