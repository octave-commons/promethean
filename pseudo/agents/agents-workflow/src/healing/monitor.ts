/**
 * Monitoring Integration for Workflow Healing
 *
 * Integrates with the monitoring system to collect metrics, detect anomalies,
 * and trigger healing actions based on performance data.
 */

import type { AgentPerformanceMetrics, AlertEvent } from './types.js';
import type { AgentWorkflowGraph } from '../workflow/types.js';
import type { WorkflowIssue, HealingConfig } from './types.js';

export interface WorkflowMonitor {
  startMonitoring(workflow: AgentWorkflowGraph): Promise<void>;
  stopMonitoring(workflowId: string): Promise<void>;
  getMetrics(workflowId: string): Promise<AgentPerformanceMetrics[]>;
  detectAnomalies(workflowId: string): Promise<WorkflowIssue[]>;
  setupAlerts(workflowId: string, config: AlertConfig): Promise<void>;
}

export interface AlertConfig {
  metrics: string[];
  thresholds: Record<string, number>;
  conditions: AlertCondition[];
  channels: string[];
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // milliseconds
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class DefaultWorkflowMonitor implements WorkflowMonitor {
  private config: HealingConfig;
  private monitoringIntervals = new Map<string, NodeJS.Timeout>();
  private metricsHistory = new Map<string, AgentPerformanceMetrics[]>();
  private alertRules = new Map<string, AlertConfig[]>();

  constructor(config: HealingConfig) {
    this.config = config;
  }

  async startMonitoring(workflow: AgentWorkflowGraph): Promise<void> {
    const workflowId = workflow.id;

    if (this.monitoringIntervals.has(workflowId)) {
      throw new Error(`Monitoring already active for workflow ${workflowId}`);
    }

    // Initialize metrics history
    this.metricsHistory.set(workflowId, []);

    // Start periodic metrics collection
    const interval = setInterval(async () => {
      await this.collectMetrics(workflowId);
      await this.checkAlerts(workflowId);
    }, this.config.detectionInterval);

    this.monitoringIntervals.set(workflowId, interval);

    // Send initial health check
    await this.sendHealthCheck(workflowId);
  }

  async stopMonitoring(workflowId: string): Promise<void> {
    const interval = this.monitoringIntervals.get(workflowId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(workflowId);
    }

    // Clean up metrics history
    this.metricsHistory.delete(workflowId);
    this.alertRules.delete(workflowId);
  }

  async getMetrics(workflowId: string): Promise<AgentPerformanceMetrics[]> {
    const history = this.metricsHistory.get(workflowId);
    return history || [];
  }

  async detectAnomalies(workflowId: string): Promise<WorkflowIssue[]> {
    const history = this.metricsHistory.get(workflowId);
    if (!history || history.length < 10) {
      return [];
    }

    const issues: WorkflowIssue[] = [];
    const recentMetrics = history.slice(-10);

    // Detect performance degradation
    const performanceIssue = this.detectPerformanceDegradation(workflowId, recentMetrics);
    if (performanceIssue) issues.push(performanceIssue);

    // Detect resource exhaustion
    const resourceIssue = this.detectResourceExhaustion(workflowId, recentMetrics);
    if (resourceIssue) issues.push(resourceIssue);

    // Detect increasing error rates
    const errorIssue = this.detectIncreasingErrors(workflowId, recentMetrics);
    if (errorIssue) issues.push(errorIssue);

    // Detect memory leaks
    const memoryIssue = this.detectMemoryLeak(workflowId, recentMetrics);
    if (memoryIssue) issues.push(memoryIssue);

    return issues;
  }

  async setupAlerts(workflowId: string, config: AlertConfig): Promise<void> {
    const existingRules = this.alertRules.get(workflowId) || [];
    existingRules.push(config);
    this.alertRules.set(workflowId, existingRules);
  }

  // Private methods
  private async collectMetrics(workflowId: string): Promise<void> {
    const history = this.metricsHistory.get(workflowId);
    if (!history) return;

    // Simulate metrics collection
    const metrics: AgentPerformanceMetrics = {
      agentId: workflowId,
      agentType: 'workflow',
      executionTime: 1000 + Math.random() * 2000,
      memoryUsage: 100000000 + Math.random() * 200000000, // 100-300MB
      cpuUsage: 20 + Math.random() * 60, // 20-80%
      status: Math.random() > 0.05 ? 'success' : 'error',
      errorType: Math.random() > 0.95 ? 'timeout' : undefined,
      timestamp: Date.now(),
    };

    history.push(metrics);

    // Keep only recent metrics (last 100)
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  private async checkAlerts(workflowId: string): Promise<void> {
    const history = this.metricsHistory.get(workflowId);
    const rules = this.alertRules.get(workflowId);

    if (!history || !rules || history.length === 0) return;

    const latestMetrics = history[history.length - 1];
    if (!latestMetrics) return;

    for (const rule of rules) {
      for (const condition of rule.conditions) {
        if (this.evaluateCondition(latestMetrics, condition)) {
          await this.triggerAlert(workflowId, condition, latestMetrics);
        }
      }
    }
  }

  private evaluateCondition(metrics: AgentPerformanceMetrics, condition: AlertCondition): boolean {
    let value: number;

    switch (condition.metric) {
      case 'executionTime':
        value = metrics.executionTime;
        break;
      case 'memoryUsage':
        value = metrics.memoryUsage;
        break;
      case 'cpuUsage':
        value = metrics.cpuUsage;
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'gt':
        return value > condition.threshold;
      case 'lt':
        return value < condition.threshold;
      case 'eq':
        return value === condition.threshold;
      case 'gte':
        return value >= condition.threshold;
      case 'lte':
        return value <= condition.threshold;
      default:
        return false;
    }
  }

  private async triggerAlert(
    workflowId: string,
    condition: AlertCondition,
    metrics: AgentPerformanceMetrics,
  ): Promise<void> {
    const alert: AlertEvent = {
      id: `alert_${workflowId}_${Date.now()}`,
      ruleId: condition.metric,
      metricName: condition.metric,
      currentValue: this.getMetricValue(metrics, condition.metric),
      threshold: condition.threshold,
      severity: condition.severity,
      message: `Alert: ${condition.metric} ${condition.operator} ${condition.threshold} (current: ${this.getMetricValue(metrics, condition.metric)})`,
      timestamp: Date.now(),
      resolved: false,
    };

    // In a real implementation, this would send to the monitoring system
    console.log('Alert triggered:', alert);
  }

  private getMetricValue(metrics: AgentPerformanceMetrics, metric: string): number {
    switch (metric) {
      case 'executionTime':
        return metrics.executionTime;
      case 'memoryUsage':
        return metrics.memoryUsage;
      case 'cpuUsage':
        return metrics.cpuUsage;
      default:
        return 0;
    }
  }

  private async sendHealthCheck(workflowId: string): Promise<void> {
    // In a real implementation, this would send a health check to the monitoring system
    console.log(`Health check sent for workflow ${workflowId}`);
  }

  // Anomaly detection methods
  private detectPerformanceDegradation(
    workflowId: string,
    metrics: AgentPerformanceMetrics[],
  ): WorkflowIssue | null {
    if (metrics.length < 5) return null;

    const recent = metrics.slice(-5);
    const avgExecutionTime = recent.reduce((sum, m) => sum + m.executionTime, 0) / recent.length;
    const older = metrics.slice(-10, -5);
    const olderAvg = older.reduce((sum, m) => sum + m.executionTime, 0) / older.length;

    if (avgExecutionTime > olderAvg * 1.5) {
      return {
        id: `perf_degradation_${workflowId}_${Date.now()}`,
        workflowId,
        type: 'performance_degradation',
        severity: 'medium',
        title: 'Performance degradation detected',
        description: `Average execution time increased by ${((avgExecutionTime / olderAvg - 1) * 100).toFixed(1)}%`,
        detectedAt: new Date(),
        detectionMethod: 'anomaly_detection',
        confidence: 0.8,
        affectedNodes: [],
        affectedAgents: [workflowId],
        impactAssessment: {
          businessImpact: 'medium',
          userImpact: 'medium',
          systemImpact: 'medium',
          estimatedDowntime: 0,
          affectedUsers: 5,
        },
        context: {
          workflowState: {},
          environmentVariables: {},
          systemMetrics: { executionTime: avgExecutionTime },
          recentEvents: [],
          dependencies: [],
          configuration: {},
        },
        metadata: {
          oldAverage: olderAvg,
          newAverage: avgExecutionTime,
          increase: avgExecutionTime - olderAvg,
        },
        status: 'detected',
        healingAttempts: [],
      };
    }

    return null;
  }

  private detectResourceExhaustion(
    workflowId: string,
    metrics: AgentPerformanceMetrics[],
  ): WorkflowIssue | null {
    const latest = metrics[metrics.length - 1];
    if (!latest) return null;

    if (latest.memoryUsage > 500000000 || latest.cpuUsage > 90) {
      // 500MB or 90% CPU
      return {
        id: `resource_exhaustion_${workflowId}_${Date.now()}`,
        workflowId,
        type: 'resource_exhaustion',
        severity: 'high',
        title: 'Resource exhaustion detected',
        description: `High resource usage: Memory: ${(latest.memoryUsage / 1000000).toFixed(1)}MB, CPU: ${latest.cpuUsage.toFixed(1)}%`,
        detectedAt: new Date(),
        detectionMethod: 'metric_threshold',
        confidence: 0.9,
        affectedNodes: [],
        affectedAgents: [workflowId],
        impactAssessment: {
          businessImpact: 'high',
          userImpact: 'high',
          systemImpact: 'high',
          estimatedDowntime: 10,
          affectedUsers: 20,
        },
        context: {
          workflowState: {},
          environmentVariables: {},
          systemMetrics: latest,
          recentEvents: [],
          dependencies: [],
          configuration: {},
        },
        metadata: {
          memoryUsage: latest.memoryUsage,
          cpuUsage: latest.cpuUsage,
        },
        status: 'detected',
        healingAttempts: [],
      };
    }

    return null;
  }

  private detectIncreasingErrors(
    workflowId: string,
    metrics: AgentPerformanceMetrics[],
  ): WorkflowIssue | null {
    if (metrics.length < 10) return null;

    const recent = metrics.slice(-5);
    const errorRate = recent.filter((m) => m.status === 'error').length / recent.length;
    const older = metrics.slice(-10, -5);
    const olderErrorRate = older.filter((m) => m.status === 'error').length / older.length;

    if (errorRate > olderErrorRate + 0.2 && errorRate > 0.1) {
      // 20% increase and >10% error rate
      return {
        id: `increasing_errors_${workflowId}_${Date.now()}`,
        workflowId,
        type: 'performance_degradation',
        severity: 'high',
        title: 'Increasing error rate detected',
        description: `Error rate increased from ${(olderErrorRate * 100).toFixed(1)}% to ${(errorRate * 100).toFixed(1)}%`,
        detectedAt: new Date(),
        detectionMethod: 'anomaly_detection',
        confidence: 0.85,
        affectedNodes: [],
        affectedAgents: [workflowId],
        impactAssessment: {
          businessImpact: 'high',
          userImpact: 'high',
          systemImpact: 'medium',
          estimatedDowntime: 15,
          affectedUsers: 15,
        },
        context: {
          workflowState: {},
          environmentVariables: {},
          systemMetrics: {
            executionTime: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            status: 'error',
            timestamp: Date.now(),
          } as any,
          recentEvents: [],
          dependencies: [],
          configuration: {},
        },
        metadata: {
          oldErrorRate: olderErrorRate,
          newErrorRate: errorRate,
          increase: errorRate - olderErrorRate,
        },
        status: 'detected',
        healingAttempts: [],
      };
    }

    return null;
  }

  private detectMemoryLeak(
    workflowId: string,
    metrics: AgentPerformanceMetrics[],
  ): WorkflowIssue | null {
    if (metrics.length < 20) return null;

    // Check for steady memory growth over time
    const memoryTrend = this.calculateTrend(metrics.map((m) => m.memoryUsage));

    if (memoryTrend > 1000000) {
      // Growing by more than 1MB per sample
      return {
        id: `memory_leak_${workflowId}_${Date.now()}`,
        workflowId,
        type: 'memory_leak',
        severity: 'medium',
        title: 'Potential memory leak detected',
        description: `Memory usage showing steady upward trend of ${(memoryTrend / 1000000).toFixed(2)}MB per interval`,
        detectedAt: new Date(),
        detectionMethod: 'anomaly_detection',
        confidence: 0.7,
        affectedNodes: [],
        affectedAgents: [workflowId],
        impactAssessment: {
          businessImpact: 'medium',
          userImpact: 'low',
          systemImpact: 'high',
          estimatedDowntime: 30,
          affectedUsers: 5,
        },
        context: {
          workflowState: {},
          environmentVariables: {},
          systemMetrics: {
            executionTime: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            status: 'success',
            timestamp: Date.now(),
          } as any,
          recentEvents: [],
          dependencies: [],
          configuration: {},
        },
        metadata: {
          memoryTrend,
          samples: metrics.length,
        },
        status: 'detected',
        healingAttempts: [],
      };
    }

    return null;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of 0, 1, 2, ..., n-1
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of 0, 1, 2, ..., n-1

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }
}
