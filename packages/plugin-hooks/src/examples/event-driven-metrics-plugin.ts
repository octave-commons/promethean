import type { Plugin, PluginContext, HookRegistration, HookResult, HookContext } from '../types.js';

interface MetricPoint {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

interface MetricSummary {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
}

/**
 * Event-driven metrics plugin that collects and analyzes hook execution metrics
 */
export class EventDrivenMetricsPlugin implements Plugin {
  metadata = {
    name: 'event-driven-metrics',
    version: '1.0.0',
    description: 'Event-driven metrics collection plugin for hook execution analysis',
    hooks: [
      'hooks.started',
      'hooks.completed',
      'hooks.failed',
      'hooks.executed',
      'hooks.execution_failed',
      'performance.measure',
    ],
  };

  private metrics: Map<string, MetricPoint[]> = new Map();
  private context?: PluginContext;
  private maxDataPoints = 10000;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    console.log('Event-driven metrics plugin initialized');

    await this.setupEventSubscriptions();
  }

  async destroy(): Promise<void> {
    console.log(
      `Event-driven metrics plugin destroyed. Collected metrics for ${this.metrics.size} keys.`,
    );

    // Log final metrics summary
    this.logMetricsSummary();
    this.metrics.clear();
  }

  getHooks(): HookRegistration[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'performance.measure',
        handler: this.handlePerformanceMeasure.bind(this) as any,
        priority: 5,
      },
    ];
  }

  private async setupEventSubscriptions(): Promise<void> {
    if (!this.context) return;

    const hookEvents = [
      'hooks.started',
      'hooks.completed',
      'hooks.failed',
      'hooks.executed',
      'hooks.execution_failed',
    ];

    for (const eventTopic of hookEvents) {
      await this.context.eventBus.subscribe(eventTopic, 'event-driven-metrics', async (event) => {
        await this.handleHookEvent(eventTopic, event);
      });
    }
  }

  private async handleHookEvent(eventTopic: string, event: any): Promise<void> {
    const payload = event.payload;
    const hookName = payload.hookName;
    const pluginName = payload.pluginName;

    // Record execution duration metrics
    if (payload.duration !== undefined) {
      const metricKey = `hook.duration.${hookName}`;
      this.recordMetric(metricKey, payload.duration, {
        plugin: pluginName,
        event: eventTopic,
      });
    }

    // Record execution count metrics
    const countKey = `hook.count.${hookName}`;
    this.recordMetric(countKey, 1, {
      plugin: pluginName,
      event: eventTopic,
      status: eventTopic.includes('failed') ? 'failed' : 'success',
    });

    // Record error metrics
    if (eventTopic.includes('failed') || payload.error) {
      const errorKey = 'hook.errors.total';
      this.recordMetric(errorKey, 1, {
        hook: hookName,
        plugin: pluginName,
        errorType: payload.error?.name || 'unknown',
      });
    }
  }

  private handlePerformanceMeasure(
    data: { name: string; duration: number; startTime: number },
    _context: HookContext,
  ): HookResult<void> {
    const metricKey = `performance.measure.${data.name}`;
    this.recordMetric(metricKey, data.duration, {
      source: 'performance-api',
      startTime: data.startTime.toString(),
    });

    return { success: true };
  }

  private recordMetric(key: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const points = this.metrics.get(key)!;
    points.push({
      timestamp: Date.now(),
      value,
      tags,
    });

    // Maintain data point limit
    if (points.length > this.maxDataPoints) {
      points.splice(0, points.length - this.maxDataPoints);
    }
  }

  private logMetricsSummary(): void {
    console.log('\n=== Event-Driven Metrics Summary ===');

    for (const [key, points] of this.metrics.entries()) {
      const summary = this.calculateSummary(points);
      console.log(`${key}:`);
      console.log(`  Count: ${summary.count}`);
      console.log(`  Avg: ${summary.avg.toFixed(2)}`);
      console.log(`  Min: ${summary.min}`);
      console.log(`  Max: ${summary.max}`);
      console.log(`  Sum: ${summary.sum}`);
    }

    console.log('===================================\n');
  }

  // Public API for querying metrics
  getMetric(
    key: string,
    options?: {
      since?: number;
      until?: number;
      tags?: Record<string, string>;
    },
  ): MetricPoint[] {
    const points = this.metrics.get(key) || [];
    let filtered = [...points];

    if (options?.since) {
      filtered = filtered.filter((p) => p.timestamp >= options.since!);
    }

    if (options?.until) {
      filtered = filtered.filter((p) => p.timestamp <= options.until!);
    }

    if (options?.tags) {
      filtered = filtered.filter((p) => {
        if (!p.tags) return false;
        return Object.entries(options.tags!).every(([k, v]) => p.tags![k] === v);
      });
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  getMetricSummary(
    key: string,
    options?: {
      since?: number;
      until?: number;
      tags?: Record<string, string>;
    },
  ): MetricSummary | null {
    const points = this.getMetric(key, options);
    if (points.length === 0) return null;

    return this.calculateSummary(points);
  }

  private calculateSummary(points: MetricPoint[]): MetricSummary {
    const values = points.map((p) => p.value);
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }

  getAllMetricKeys(): string[] {
    return Array.from(this.metrics.keys());
  }

  getTopMetrics(
    by: 'count' | 'sum' | 'avg' = 'count',
    limit = 10,
  ): Array<{ key: string; value: number }> {
    const metrics = Array.from(this.metrics.entries()).map(([key, points]) => {
      const summary = this.calculateSummary(points);
      return {
        key,
        value: summary[by],
      };
    });

    return metrics.sort((a, b) => b.value - a.value).slice(0, limit);
  }

  clearMetrics(key?: string): void {
    if (key) {
      this.metrics.delete(key);
      console.log(`Metrics cleared for key: ${key}`);
    } else {
      this.metrics.clear();
      console.log('All metrics cleared');
    }
  }

  // Export metrics for external analysis
  exportMetrics(): Record<string, MetricPoint[]> {
    const exported: Record<string, MetricPoint[]> = {};
    for (const [key, points] of this.metrics.entries()) {
      exported[key] = [...points];
    }
    return exported;
  }

  // Import metrics from external source
  importMetrics(metrics: Record<string, MetricPoint[]>): void {
    for (const [key, points] of Object.entries(metrics)) {
      if (!this.metrics.has(key)) {
        this.metrics.set(key, []);
      }
      this.metrics.get(key)!.push(...points);
    }
    console.log(`Imported metrics for ${Object.keys(metrics).length} keys`);
  }
}
