import type { Plugin, PluginContext, HookRegistration, HookResult, HookContext } from '../types.js';

interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export class MetricsPlugin implements Plugin {
  metadata = {
    name: 'metrics',
    version: '1.0.0',
    description: 'Collects and aggregates system metrics',
    hooks: ['user.action', 'task.completed', 'error.occurred', 'performance.measured'],
  };

  private metrics: Map<string, MetricData[]> = new Map();
  private aggregationInterval?: ReturnType<typeof setInterval>;

  async initialize(context: PluginContext): Promise<void> {
    console.log('Metrics plugin initialized');

    // Start aggregation interval
    this.aggregationInterval = setInterval(() => {
      this.aggregateMetrics();
    }, 60000); // Every minute

    // Register hooks
    context.registerHook<any, void>({
      pluginName: this.metadata.name,
      hookName: 'user.action',
      handler: this.handleUserAction.bind(this),
      priority: 5,
    });
  }

  async destroy(): Promise<void> {
    console.log('Metrics plugin destroyed');

    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }

    // Log final metrics summary
    this.logMetricsSummary();
    this.metrics.clear();
  }

  getHooks(): HookRegistration[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'task.completed',
        handler: this.handleTaskCompleted.bind(this),
        priority: 10,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'error.occurred',
        handler: this.handleError.bind(this),
        priority: 15,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'performance.measured',
        handler: this.handlePerformance.bind(this),
        priority: 8,
      },
    ];
  }

  private handleUserAction(
    data: { userId: string; action: string; timestamp: number },
    context: HookContext,
  ): HookResult<void> {
    this.recordMetric('user_actions', 1, 'count', {
      action: data.action,
      userId: data.userId,
    });

    return { success: true };
  }

  private handleTaskCompleted(
    data: { taskId: string; duration: number; complexity: number },
    context: HookContext,
  ): HookResult<void> {
    this.recordMetric('tasks_completed', 1, 'count', {
      complexity: data.complexity.toString(),
    });

    this.recordMetric('task_duration', data.duration, 'milliseconds', {
      complexity: data.complexity.toString(),
    });

    return { success: true };
  }

  private handleError(
    data: { error: Error; context?: string },
    context: HookContext,
  ): HookResult<void> {
    this.recordMetric('errors', 1, 'count', {
      context: data.context || 'unknown',
      type: data.error.constructor.name,
    });

    return { success: true };
  }

  private handlePerformance(
    data: { operation: string; duration: number; memory?: number },
    context: HookContext,
  ): HookResult<void> {
    this.recordMetric(`performance_${data.operation}`, data.duration, 'milliseconds', {
      operation: data.operation,
    });

    if (data.memory !== undefined) {
      this.recordMetric(`memory_${data.operation}`, data.memory, 'bytes', {
        operation: data.operation,
      });
    }

    return { success: true };
  }

  private recordMetric(
    name: string,
    value: number,
    unit: string,
    tags?: Record<string, string>,
  ): void {
    const metric: MetricData = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricList = this.metrics.get(name)!;
    metricList.push(metric);

    // Keep only last 1000 metrics per name
    if (metricList.length > 1000) {
      metricList.splice(0, metricList.length - 1000);
    }
  }

  private aggregateMetrics(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    for (const [name, metricList] of this.metrics.entries()) {
      const recentMetrics = metricList.filter((m) => m.timestamp >= oneMinuteAgo);

      if (recentMetrics.length === 0) continue;

      // Calculate aggregates
      const values = recentMetrics.map((m) => m.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      // Store aggregated metrics
      this.recordMetric(`${name}_sum_1m`, sum, this.getUnit(name));
      this.recordMetric(`${name}_avg_1m`, avg, this.getUnit(name));
      this.recordMetric(`${name}_min_1m`, min, this.getUnit(name));
      this.recordMetric(`${name}_max_1m`, max, this.getUnit(name));
    }
  }

  private getUnit(metricName: string): string {
    const baseName = metricName.replace(/_(sum|avg|min|max)_1m$/, '');
    const metrics = this.metrics.get(baseName);
    return metrics?.[0]?.unit || 'count';
  }

  private logMetricsSummary(): void {
    console.log('\n=== Metrics Summary ===');

    for (const [name, metricList] of this.metrics.entries()) {
      if (metricList.length === 0) continue;

      const values = metricList.map((m) => m.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      console.log(`${name}:`);
      console.log(`  Count: ${values.length}`);
      console.log(`  Sum: ${sum.toFixed(2)}`);
      console.log(`  Average: ${avg.toFixed(2)}`);
      console.log(`  Min: ${min.toFixed(2)}`);
      console.log(`  Max: ${max.toFixed(2)}`);
      console.log(`  Unit: ${this.getUnit(name)}`);
    }

    console.log('==================\n');
  }

  // Public API for querying metrics
  getMetrics(name?: string, since?: number): MetricData[] {
    if (name) {
      const metrics = this.metrics.get(name) || [];
      return since ? metrics.filter((m) => m.timestamp >= since) : metrics;
    }

    // Return all metrics if no name specified
    const allMetrics: MetricData[] = [];
    for (const metricList of this.metrics.values()) {
      allMetrics.push(...metricList);
    }

    return since ? allMetrics.filter((m) => m.timestamp >= since) : allMetrics;
  }

  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  getAggregates(
    name: string,
    period: '1m' | '5m' | '15m' | '1h' = '1m',
  ): {
    sum: number;
    avg: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const periodMs = {
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '1h': 3600000,
    }[period];

    const since = Date.now() - periodMs;
    const metrics = this.metrics.get(name)?.filter((m) => m.timestamp >= since) || [];

    if (metrics.length === 0) return null;

    const values = metrics.map((m) => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { sum, avg, min, max, count: values.length };
  }
}
