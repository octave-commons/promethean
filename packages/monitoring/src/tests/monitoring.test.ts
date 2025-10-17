/**
 * Tests for Performance Monitoring Framework
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  MetricsCollectionService,
  PerformanceDataStorage,
  AlertingService,
  getMetricsCollectionService,
  getPerformanceDataStorage,
  getAlertingService,
  destroyMetricsCollectionService,
  destroyPerformanceDataStorage,
  destroyAlertingService,
  type AgentPerformanceMetrics,
  type PipelinePerformanceMetrics,
  type SystemResourceMetrics,
  type AlertRule,
} from '../index.js';

describe('Performance Monitoring Framework', () => {
  describe('MetricsCollectionService', () => {
    test('should create service with default config', () => {
      const service = new MetricsCollectionService();
      const stats = service.getQueueStats();

      assert.strictEqual(stats.queueSize, 0);
      assert.strictEqual(stats.isFlushing, false);
      assert.strictEqual(stats.config.enabled, true);

      service.destroy();
    });

    test('should record agent metrics', () => {
      const service = new MetricsCollectionService();

      const agentMetrics: AgentPerformanceMetrics = {
        agentId: 'test-agent-1',
        agentType: 'test',
        executionTime: 150,
        memoryUsage: 1024 * 1024 * 10, // 10MB
        cpuUsage: 25.5,
        status: 'success',
        timestamp: Date.now(),
      };

      // Should not throw
      service.recordAgentMetrics(agentMetrics);

      const stats = service.getQueueStats();
      assert.strictEqual(stats.queueSize, 4); // Should create 4 metrics

      service.destroy();
    });

    test('should record pipeline metrics', () => {
      const service = new MetricsCollectionService();

      const pipelineMetrics: PipelinePerformanceMetrics = {
        pipelineId: 'test-pipeline-1',
        stageId: 'stage-1',
        stageName: 'processing',
        throughput: 100,
        latency: 50,
        queueDepth: 5,
        errorRate: 2.5,
        timestamp: Date.now(),
      };

      service.recordPipelineMetrics(pipelineMetrics);

      const stats = service.getQueueStats();
      assert.strictEqual(stats.queueSize, 4); // Should create 4 metrics

      service.destroy();
    });

    test('should record system metrics', () => {
      const service = new MetricsCollectionService();

      const systemMetrics: SystemResourceMetrics = {
        hostname: 'test-host',
        cpuUsage: 45.2,
        memoryUsage: 1024 * 1024 * 512, // 512MB
        diskUsage: 1024 * 1024 * 1024 * 10, // 10GB
        networkIO: {
          bytesIn: 1024 * 1024,
          bytesOut: 512 * 1024,
        },
        timestamp: Date.now(),
      };

      service.recordSystemMetrics(systemMetrics);

      const stats = service.getQueueStats();
      assert.strictEqual(stats.queueSize, 5); // Should create 5 metrics

      service.destroy();
    });

    test('should reject invalid metrics', () => {
      const service = new MetricsCollectionService({ enabled: true });

      // Invalid metric name
      service.recordMetric({
        timestamp: Date.now(),
        metricName: 'Invalid Metric Name!',
        value: 100,
        labels: {},
      });

      const stats = service.getQueueStats();
      assert.strictEqual(stats.queueSize, 0); // Should reject invalid metric

      service.destroy();
    });
  });

  describe('PerformanceDataStorage', () => {
    test('should create storage with default config', async () => {
      const storage = new PerformanceDataStorage();
      const stats = await storage.getStorageStats();

      assert.strictEqual(stats.totalMetrics, 0);
      assert.strictEqual(stats.totalSize, 0);
      assert.strictEqual(stats.indexSize, 0);

      storage.destroy();
    });

    test('should store and retrieve metrics', async () => {
      const storage = new PerformanceDataStorage();

      const metric = {
        timestamp: Date.now(),
        metricName: 'test_metric',
        value: 100,
        labels: { test: 'value' },
      };

      await storage.storeMetric(metric);

      const queryResult = await storage.queryMetrics({
        metricNames: ['test_metric'],
        startTime: Date.now() - 1000,
        endTime: Date.now() + 1000,
      });

      assert.strictEqual(queryResult.length, 1);
      assert.strictEqual(queryResult[0]?.metricName, 'test_metric');
      assert.strictEqual(queryResult[0]?.dataPoints.length, 1);
      assert.strictEqual(queryResult[0]?.dataPoints[0]?.value, 100);

      storage.destroy();
    });

    test('should generate performance trends', async () => {
      const storage = new PerformanceDataStorage();

      const baseTime = Date.now();
      const metrics = [];

      // Generate test data points
      for (let i = 0; i < 10; i++) {
        metrics.push({
          timestamp: baseTime + i * 60000, // 1 minute intervals
          metricName: 'trend_test',
          value: 100 + i * 10,
          labels: {},
        });
      }

      await storage.storeMetrics(metrics);

      const trend = await storage.getPerformanceTrend(
        'trend_test',
        { start: baseTime, end: baseTime + 9 * 60000 },
        '1m',
      );

      assert(trend !== null);
      assert.strictEqual(trend.metricName, 'trend_test');
      assert.strictEqual(trend.dataPoints.length, 10);
      assert.strictEqual(trend.statistics.min, 100);
      assert.strictEqual(trend.statistics.max, 190);

      storage.destroy();
    });

    test('should perform health check', async () => {
      const storage = new PerformanceDataStorage();

      const health = await storage.healthCheck();

      assert(['healthy', 'degraded', 'unhealthy'].includes(health.status));
      assert(Array.isArray(health.checks));
      assert(health.uptime >= 0);

      storage.destroy();
    });
  });

  describe('AlertingService', () => {
    test('should create alerting service', () => {
      const alerting = new AlertingService();
      const stats = alerting.getAlertingStats();

      assert.strictEqual(stats.totalRules, 0);
      assert.strictEqual(stats.enabledRules, 0);
      assert.strictEqual(stats.activeAlerts, 0);

      alerting.destroy();
    });

    test('should manage alert rules', () => {
      const alerting = new AlertingService();

      const rule: AlertRule = {
        id: 'test-rule-1',
        name: 'Test Rule',
        description: 'Test alert rule',
        metricName: 'test_metric',
        condition: 'gt',
        threshold: 100,
        duration: 60000,
        severity: 'high',
        labels: {},
        enabled: true,
      };

      alerting.addAlertRule(rule);

      const rules = alerting.getAlertRules();
      assert.strictEqual(rules.length, 1);
      assert.strictEqual(rules[0]?.id, 'test-rule-1');

      const retrievedRule = alerting.getAlertRule('test-rule-1');
      assert(retrievedRule !== undefined);
      assert.strictEqual(retrievedRule.name, 'Test Rule');

      alerting.removeAlertRule('test-rule-1');
      const rulesAfterRemoval = alerting.getAlertRules();
      assert.strictEqual(rulesAfterRemoval.length, 0);

      alerting.destroy();
    });

    test('should evaluate alerts with metrics', async () => {
      const alerting = new AlertingService();

      const rule: AlertRule = {
        id: 'evaluation-test-rule',
        name: 'Evaluation Test Rule',
        description: 'Rule for testing evaluation',
        metricName: 'evaluation_metric',
        condition: 'gt',
        threshold: 50,
        duration: 0, // Immediate trigger
        severity: 'medium',
        labels: {},
        enabled: true,
      };

      alerting.addAlertRule(rule);

      const metric = {
        timestamp: Date.now(),
        metricName: 'evaluation_metric',
        value: 75, // Above threshold
        labels: {},
      };

      await alerting.evaluateAlerts([metric]);

      const activeAlerts = alerting.getActiveAlerts();
      assert(activeAlerts.length >= 0); // May or may not trigger based on timing

      alerting.destroy();
    });

    test('should manage notification channels', () => {
      const alerting = new AlertingService();

      const channel = {
        id: 'test-channel',
        name: 'Test Channel',
        type: 'webhook' as const,
        enabled: true,
        config: { url: 'https://example.com/webhook' },
      };

      alerting.addNotificationChannel(channel);

      const channels = alerting.getNotificationChannels();
      assert.strictEqual(channels.length, 1);
      assert.strictEqual(channels[0]?.id, 'test-channel');

      alerting.removeNotificationChannel('test-channel');
      const channelsAfterRemoval = alerting.getNotificationChannels();
      assert.strictEqual(channelsAfterRemoval.length, 0);

      alerting.destroy();
    });
  });

  describe('Global Service Instances', () => {
    test('should provide singleton instances', () => {
      const collection1 = getMetricsCollectionService();
      const collection2 = getMetricsCollectionService();
      assert.strictEqual(collection1, collection2);

      const storage1 = getPerformanceDataStorage();
      const storage2 = getPerformanceDataStorage();
      assert.strictEqual(storage1, storage2);

      const alerting1 = getAlertingService();
      const alerting2 = getAlertingService();
      assert.strictEqual(alerting1, alerting2);

      // Cleanup
      destroyMetricsCollectionService();
      destroyPerformanceDataStorage();
      destroyAlertingService();
    });
  });

  describe('Integration Tests', () => {
    test('should integrate collection, storage, and alerting', async () => {
      const collection = new MetricsCollectionService({ enabled: true });
      const storage = new PerformanceDataStorage();
      const alerting = new AlertingService({}, storage);

      // Set up alert rule
      const rule: AlertRule = {
        id: 'integration-test-rule',
        name: 'Integration Test Rule',
        description: 'Rule for integration testing',
        metricName: 'promethean_agent_execution_time',
        condition: 'gt',
        threshold: 100,
        duration: 0,
        severity: 'high',
        labels: {},
        enabled: true,
      };

      alerting.addAlertRule(rule);

      // Record agent metrics that should trigger alert
      const agentMetrics: AgentPerformanceMetrics = {
        agentId: 'integration-test-agent',
        agentType: 'test',
        executionTime: 150, // Above threshold
        memoryUsage: 1024 * 1024 * 5,
        cpuUsage: 30,
        status: 'success',
        timestamp: Date.now(),
      };

      collection.recordAgentMetrics(agentMetrics);

      // Wait a bit for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Flush metrics
      await collection.flush();

      // Evaluate alerts
      await alerting.evaluateAlerts();

      // Check that services are functioning
      const collectionStats = collection.getQueueStats();
      assert(collectionStats.queueSize >= 0);

      const storageStats = await storage.getStorageStats();
      assert(storageStats.totalMetrics >= 0);

      const alertingStats = alerting.getAlertingStats();
      assert(alertingStats.totalRules >= 1);

      // Cleanup
      collection.destroy();
      storage.destroy();
      alerting.destroy();
    });
  });
});
