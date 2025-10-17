#!/usr/bin/env node

/**
 * Test timeout and resource management integration
 */

import { createOrchestratorFromPipelineConfig } from './dist/index.js';

async function testTimeoutAndResourceManagement() {
  console.log('🧪 Testing Timeout & Resource Management...\n');

  try {
    // Test with a pipeline that has resource-intensive steps
    const orchestrator = createOrchestratorFromPipelineConfig(
      'resource-test',
      {
        pipelines: [
          {
            name: 'resource-test',
            steps: [
              {
                id: 'resource-heavy',
                shell:
                  'echo "Simulating resource-intensive work..." && sleep 2 && echo "Work completed"',
                timeout: 5000, // 5 second timeout
                inputs: [],
                outputs: [],
              },
              {
                id: 'timeout-test',
                deps: ['resource-heavy'],
                shell:
                  'echo "This should timeout..." && sleep 10 && echo "This should not be reached"',
                timeout: 3000, // 3 second timeout - should trigger
                inputs: [],
                outputs: [],
              },
              {
                id: 'cleanup',
                deps: ['timeout-test'],
                shell: 'echo "Cleanup step"',
                inputs: [],
                outputs: [],
              },
            ],
          },
        ],
      },
      {
        buildFix: { enabled: true },
        resourceMonitor: {
          enabled: true,
          thresholds: {
            memory: 100, // MB
            cpu: 80, // %
            disk: 1000, // MB
          },
        },
        monitoring: { enabled: true },
        parallel: { enabled: false },
        timeouts: {
          default: 30000,
          step: 5000,
          warning: 2000,
        },
      },
    );

    console.log('📊 Checking health...');
    const health = await orchestrator.getHealthStatus();
    console.log('Health Status:', health);

    console.log('\n🚀 Starting timeout/resource test...');
    const startTime = Date.now();
    const result = await orchestrator.execute();
    const duration = Date.now() - startTime;

    console.log('\n📈 Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Steps: ${result.steps.length}`);

    // Check timeout behavior
    const timeoutStep = result.steps.find((s) => s.id === 'timeout-test');
    if (timeoutStep && !timeoutStep.success) {
      console.log('✅ Timeout mechanism working correctly');
      console.log(`   Step timed out: ${timeoutStep.error}`);
    }

    // Check resource monitoring
    if (result.metrics) {
      console.log(`Memory Usage: ${result.metrics.memoryUsage.toFixed(2)} MB`);
      console.log(`CPU Usage: ${result.metrics.cpuUsage.toFixed(2)}%`);
      console.log(`Disk Usage: ${result.metrics.diskUsage.toFixed(2)} MB`);
    }

    // Check for resource warnings
    const resourceWarnings = result.steps.filter(
      (s) => s.warnings && s.warnings.some((w) => w.includes('memory') || w.includes('cpu')),
    );

    if (resourceWarnings.length > 0) {
      console.log(`⚠️  Resource warnings detected: ${resourceWarnings.length}`);
      resourceWarnings.forEach((step) => {
        console.log(`   ${step.id}: ${step.warnings?.join(', ')}`);
      });
    }

    console.log('\n✅ Timeout & Resource Management test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testTimeoutAndResourceManagement();
