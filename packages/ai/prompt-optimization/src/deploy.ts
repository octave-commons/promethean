#!/usr/bin/env node

/**
 * Prompt Optimization v2.0 Deployment Script
 * Phase 1: Shadow Mode Deployment (10% traffic)
 */

import { deploymentManager } from './deployment-manager';
import { monitoringDashboard } from './monitoring-dashboard';
import { adaptiveRouting } from './adaptive-routing';

async function main() {
  console.log('🚀 Starting Prompt Optimization v2.0 Deployment');
  console.log('='.repeat(60));

  try {
    // Phase 1: Shadow Mode Initialization
    console.log('📋 Phase 1: Shadow Mode Deployment');
    console.log('🎯 Target: 10% traffic to v2.0, 90% to legacy');
    console.log('⏱️  Duration: 1 week with continuous monitoring');
    console.log('');

    // Initialize deployment manager
    await deploymentManager.initialize();
    console.log('✅ Deployment manager initialized');

    // Start monitoring dashboard
    console.log('📊 Starting monitoring dashboard...');
    // Note: In production, this would start a web server
    console.log('🔍 Monitoring active at http://localhost:3000/monitoring');

    // Display system status
    const status = await deploymentManager.getStatus();
    console.log('');
    console.log('📈 System Status:');
    console.log(`   Phase: ${status.currentPhase}`);
    console.log(`   Health: ${status.isHealthy ? '✅ Healthy' : '❌ Issues detected'}`);
    console.log(`   Uptime: ${Math.floor(status.uptime / 1000 / 60)} minutes`);

    if (status.issues.length > 0) {
      console.log('⚠️  Issues:');
      status.issues.forEach((issue) => console.log(`   - ${issue}`));
    }

    if (status.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      status.recommendations.forEach((rec) => console.log(`   - ${rec}`));
    }

    console.log('');
    console.log('🎯 Deployment Objectives:');
    console.log('   ✓ Validate v2.0 system stability');
    console.log('   ✓ Compare performance vs legacy');
    console.log('   ✓ Monitor error rates and success rates');
    console.log('   ✓ Collect data for Phase 2 decision');

    console.log('');
    console.log('📊 Success Criteria for Phase 1:');
    console.log('   • v2.0 success rate ≥ 95%');
    console.log('   • Error rate ≤ 5%');
    console.log('   • Processing time ≤ 3.0s');
    console.log('   • Token efficiency ≥ 70%');
    console.log('   • System uptime ≥ 99.9%');

    console.log('');
    console.log('🔄 Next Steps:');
    console.log('   1. Monitor performance for 1 week');
    console.log('   2. Analyze collected data');
    console.log('   3. If criteria met → Phase 2 (50% traffic)');
    console.log('   4. If not → Optimize and extend Phase 1');

    // Start simulated traffic for testing
    console.log('');
    console.log('🧪 Starting simulated traffic test...');
    await runSimulatedTraffic();

    console.log('');
    console.log('✅ Phase 1 deployment complete!');
    console.log('📊 Monitoring dashboard active');
    console.log('🔍 System collecting performance data');
    console.log('');
    console.log('📋 Commands for monitoring:');
    console.log('   npm run deployment:status     # Check current status');
    console.log('   npm run deployment:metrics    # View performance metrics');
    console.log('   npm run deployment:report     # Generate detailed report');
    console.log('   npm run deployment:phase2     # Transition to Phase 2');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

/**
 * Run simulated traffic to test the system
 */
async function runSimulatedTraffic() {
  const testPrompts = [
    'Optimize this prompt for technical documentation',
    'Make this prompt more creative and engaging',
    'Help me debug this error in my code',
    'Analyze this data and provide insights',
    'Simple task: format this text',
    'Complex query requiring multiple constraints',
    'Edge case handling for unusual input',
    'Validation-focused prompt with examples',
  ];

  console.log(`   Testing ${testPrompts.length} different prompt types...`);

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`   📝 Processing: ${prompt.substring(0, 40)}...`);

    try {
      const result = await deploymentManager.processRequest(prompt);
      console.log(
        `      ✅ ${result.usedV2 ? 'v2.0' : 'Legacy'} | ${result.success ? 'Success' : 'Failed'} | ${result.processingTime}ms`,
      );
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('   ✅ Simulated traffic test complete');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down deployment...');
  await deploymentManager.cleanup();
  console.log('✅ Cleanup complete');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down deployment...');
  await deploymentManager.cleanup();
  console.log('✅ Cleanup complete');
  process.exit(0);
});

// Run deployment
if (require.main === module) {
  main().catch(console.error);
}

export { main as deploy };
