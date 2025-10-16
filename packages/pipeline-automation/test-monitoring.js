#!/usr/bin/env node

/**
 * Test automated pipeline monitoring system
 */

import { createOrchestratorFromPipelineConfig } from './dist/index.js';

async function testPipelineMonitoring() {
  console.log('🧪 Testing Automated Pipeline Monitoring...\n');

  try {
    // Test with a pipeline that triggers various monitoring events
    const orchestrator = createOrchestratorFromPipelineConfig(
      'monitoring-test',
      {
        pipelines: [
          {
            name: 'monitoring-test',
            steps: [
              {
                id: 'monitor-step-1',
                shell: 'echo "Step 1 with monitoring" && sleep 1',
                inputs: [],
                outputs: [],
              },
              {
                id: 'monitor-step-2',
                deps: ['monitor-step-1'],
                shell: 'echo "Step 2 with monitoring" && sleep 1',
                inputs: [],
                outputs: [],
              },
              {
                id: 'monitor-step-3',
                deps: ['monitor-step-2'],
                shell: 'echo "Step 3 with monitoring" && sleep 1',
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
            memory: 50, // MB - low threshold to trigger warnings
            cpu: 10, // % - low threshold to trigger warnings
            disk: 100, // MB
          },
          alerting: {
            enabled: true,
            providers: ['console'],
            rateLimit: {
              windowMs: 60000,
              maxAlerts: 10,
            },
          },
        },
        monitoring: {
          enabled: true,
          metrics: {
            collectDetailed: true,
            historySize: 100,
          },
        },
        parallel: { enabled: false },
        timeouts: {
          default: 10000,
          step: 5000,
          warning: 2000,
        },
      },
    );

    // Set up monitoring event listeners
    const monitoringEvents = [];

    orchestrator.on('pipeline_start', (data) => {
      monitoringEvents.push({ type: 'pipeline_start', timestamp: new Date(), data });
      console.log('📡 Monitoring: Pipeline started');
    });

    orchestrator.on('step_start', (data) => {
      monitoringEvents.push({ type: 'step_start', timestamp: new Date(), data });
      console.log(`📡 Monitoring: Step ${data.step} started`);
    });

    orchestrator.on('step_success', (data) => {
      monitoringEvents.push({ type: 'step_success', timestamp: new Date(), data });
      console.log(`📡 Monitoring: Step ${data.step} completed successfully`);
    });

    orchestrator.on('resource_warning', (data) => {
      monitoringEvents.push({ type: 'resource_warning', timestamp: new Date(), data });
      console.log(`⚠️  Monitoring: Resource warning - ${data.type}: ${data.value}`);
    });

    orchestrator.on('alert', (data) => {
      monitoringEvents.push({ type: 'alert', timestamp: new Date(), data });
      console.log(`🚨 Monitoring: Alert - ${data.type}: ${data.message}`);
    });

    console.log('📊 Checking health...');
    const health = await orchestrator.getHealthStatus();
    console.log('Health Status:', health);

    console.log('\n🚀 Starting monitoring test...');
    const startTime = Date.now();
    const result = await orchestrator.execute();
    const duration = Date.now() - startTime;

    console.log('\n📈 Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Steps: ${result.steps.length}`);
    console.log(`Monitoring Events Captured: ${monitoringEvents.length}`);

    // Analyze monitoring events
    const eventTypes = monitoringEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Event Summary:');
    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // Check resource monitoring data
    if (result.metrics) {
      console.log(`\n📊 Resource Metrics:`);
      console.log(`  Memory Usage: ${result.metrics.memoryUsage.toFixed(2)} MB`);
      console.log(`  CPU Usage: ${result.metrics.cpuUsage.toFixed(2)}%`);
      console.log(`  Disk Usage: ${result.metrics.diskUsage.toFixed(2)} MB`);
    }

    // Check for monitoring system health
    const monitoringHealth = await orchestrator.getHealthStatus();
    console.log('\n📊 Final Monitoring Health:');
    console.log(`  Resource Monitor: ${monitoringHealth.resourceMonitor ? '✅' : '❌'}`);
    console.log(`  Alert System: ${monitoringHealth.alertProviders ? '✅' : '❌'}`);
    console.log(`  Automation: ${monitoringHealth.automation ? '✅' : '❌'}`);

    console.log('\n✅ Automated Pipeline Monitoring test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPipelineMonitoring();
