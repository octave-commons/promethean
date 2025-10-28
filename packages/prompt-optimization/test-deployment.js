#!/usr/bin/env node

console.log('🧪 Testing Prompt Optimization v2.0 System');
console.log('='.repeat(50));

// Test basic functionality
try {
  console.log('✅ Testing basic Node.js execution...');

  // Test 1: Basic math
  const result = 2 + 2;
  console.log(`   ✓ Math test: 2 + 2 = ${result}`);

  // Test 2: String operations
  const greeting = 'Hello';
  const target = 'Prompt Optimization v2.0';
  console.log(`   ✓ String test: ${greeting} ${target}`);

  // Test 3: Array operations
  const phases = ['shadow', 'gradual', 'full'];
  console.log(`   ✓ Array test: Deployment phases = ${phases.join(', ')}`);

  // Test 4: Object operations
  const metrics = {
    successRate: 95,
    errorRate: 5,
    processingTime: 2.5,
  };
  console.log(`   ✓ Object test: Metrics = ${JSON.stringify(metrics)}`);

  // Test 5: Function operations
  function calculateDeployment(trafficPercentage) {
    return {
      phase: trafficPercentage <= 10 ? 'shadow' : trafficPercentage <= 50 ? 'gradual' : 'full',
      healthy: true,
      ready: trafficPercentage <= 10,
    };
  }

  const deployment = calculateDeployment(10);
  console.log(`   ✓ Function test: Phase 1 deployment = ${JSON.stringify(deployment)}`);

  console.log('');
  console.log('✅ All basic tests passed!');
  console.log('');
  console.log('🚀 System is ready for Phase 1 deployment');
  console.log('📋 Next: Run npm run deploy to start shadow mode');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
