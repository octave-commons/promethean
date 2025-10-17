#!/usr/bin/env node

/**
 * Test script to validate BuildFix integration with pipeline automation
 */

import { createOrchestratorFromPipelineConfig } from './dist/index.js';

async function testBuildFixIntegration() {
  console.log('🧪 Testing BuildFix Integration...\n');

  try {
    // Test with buildfix pipeline
    const orchestrator = createOrchestratorFromPipelineConfig(
      'buildfix',
      {
        pipelines: [
          {
            name: 'buildfix',
            steps: [
              {
                id: 'bf-build',
                shell: 'echo "Simulating build step..."',
                inputs: [],
                outputs: [],
              },
              {
                id: 'bf-errors',
                deps: ['bf-build'],
                shell:
                  'echo "Simulating error detection..." && echo \'[{"file":"test.ts","line":1,"error":"Type error"}]\' > .cache/test-errors.json',
                inputs: [],
                outputs: ['.cache/test-errors.json'],
              },
              {
                id: 'bf-fix',
                deps: ['bf-errors'],
                shell: 'echo "Simulating BuildFix integration..." && cat .cache/test-errors.json',
                inputs: ['.cache/test-errors.json'],
                outputs: [],
              },
            ],
          },
        ],
      },
      {
        buildFix: { enabled: true },
        resourceMonitor: { enabled: true },
        monitoring: { enabled: true },
        parallel: { enabled: false },
      },
    );

    console.log('📊 Checking health...');
    const health = await orchestrator.getHealthStatus();
    console.log('Health Status:', health);

    console.log('\n🚀 Starting test execution...');
    const result = await orchestrator.execute();

    console.log('\n📈 Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Steps: ${result.steps.length}`);

    if (result.buildFixResults) {
      console.log(`BuildFix Results: ${result.buildFixResults.length} items`);
      result.buildFixResults.forEach((r) => {
        console.log(`  - ${r.stepId}: ${r.errorsResolved} errors resolved`);
      });
    }

    if (result.metrics) {
      console.log(`Memory Usage: ${result.metrics.memoryUsage.toFixed(2)} MB`);
      console.log(`CPU Usage: ${result.metrics.cpuUsage.toFixed(2)}%`);
    }

    console.log('\n✅ BuildFix integration test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBuildFixIntegration();
