import { MetricsCollector, BridgeMetrics } from './types.js';
import { EventEmitter } from 'events';

export interface MetricEvent {
  type: string;
  source: string;
  timestamp: Date;
  duration?: number;
  error?: string;
  taskId?: string;
}

export class DefaultMetricsCollector extends EventEmitter implements MetricsCollector {
  private metrics: BridgeMetrics = {
    eventsProcessed: 0,
    eventsFailed: 0,
    tasksSynced: 0,
    conflictsResolved: 0,
    lastSyncTime: new Date(),
    averageSyncTime: 0,
    queueSize: 0,
  };

  private eventHistory: MetricEvent[] = [];
  private syncTimes: number[] = [];
  private maxHistorySize: number = 1000;

  recordEventProcessed(type: string, source: string, duration: number): void {
    this.metrics.eventsProcessed++;

    const event: MetricEvent = {
      type,
      source,
      timestamp: new Date(),
      duration,
    };

    this.addToHistory(event);
    this.updateAverageSyncTime(duration);
    this.metrics.lastSyncTime = new Date();

    this.emit('metric:processed', event);
  }

  recordEventFailed(type: string, source: string, error: Error): void {
    this.metrics.eventsFailed++;

    const event: MetricEvent = {
      type,
      source,
      timestamp: new Date(),
      error: error.message,
    };

    this.addToHistory(event);
    this.emit('metric:failed', event);
  }

  recordTaskSynced(taskId: string): void {
    this.metrics.tasksSynced++;

    const event: MetricEvent = {
      type: 'task_synced',
      source: 'bridge',
      timestamp: new Date(),
      taskId,
    };

    this.addToHistory(event);
    this.emit('metric:task_synced', event);
  }

  recordConflictResolved(taskId: string): void {
    this.metrics.conflictsResolved++;

    const event: MetricEvent = {
      type: 'conflict_resolved',
      source: 'bridge',
      timestamp: new Date(),
      taskId,
    };

    this.addToHistory(event);
    this.emit('metric:conflict_resolved', event);
  }

  async getMetrics(): Promise<BridgeMetrics> {
    return { ...this.metrics };
  }

  async resetMetrics(): Promise<void> {
    this.metrics = {
      eventsProcessed: 0,
      eventsFailed: 0,
      tasksSynced: 0,
      conflictsResolved: 0,
      lastSyncTime: new Date(),
      averageSyncTime: 0,
      queueSize: 0,
    };

    this.eventHistory = [];
    this.syncTimes = [];

    this.emit('metrics:reset');
  }

  updateQueueSize(size: number): void {
    this.metrics.queueSize = size;
    this.emit('metric:queue_size', { size, timestamp: new Date() });
  }

  // Additional analytics methods
  getEventHistory(limit?: number): MetricEvent[] {
    return limit ? this.eventHistory.slice(-limit) : [...this.eventHistory];
  }

  getEventsByType(type: string): MetricEvent[] {
    return this.eventHistory.filter((event) => event.type === type);
  }

  getEventsBySource(source: string): MetricEvent[] {
    return this.eventHistory.filter((event) => event.source === source);
  }

  getErrorRate(): number {
    const totalEvents = this.metrics.eventsProcessed + this.metrics.eventsFailed;
    return totalEvents > 0 ? (this.metrics.eventsFailed / totalEvents) * 100 : 0;
  }

  getSuccessRate(): number {
    const totalEvents = this.metrics.eventsProcessed + this.metrics.eventsFailed;
    return totalEvents > 0 ? (this.metrics.eventsProcessed / totalEvents) * 100 : 100;
  }

  getAverageProcessingTime(): number {
    const processedEvents = this.eventHistory.filter((event) => event.duration !== undefined);
    if (processedEvents.length === 0) return 0;

    const totalTime = processedEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
    return totalTime / processedEvents.length;
  }

  getProcessingTimePercentiles(): { p50: number; p95: number; p99: number } {
    const processedEvents = this.eventHistory
      .filter((event) => event.duration !== undefined)
      .map((event) => event.duration!)
      .sort((a, b) => a - b);

    if (processedEvents.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const p50Index = Math.floor(processedEvents.length * 0.5);
    const p95Index = Math.floor(processedEvents.length * 0.95);
    const p99Index = Math.floor(processedEvents.length * 0.99);

    return {
      p50: processedEvents[p50Index],
      p95: processedEvents[p95Index],
      p99: processedEvents[p99Index],
    };
  }

  getRecentActivity(minutes: number = 60): MetricEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.eventHistory.filter((event) => event.timestamp >= cutoff);
  }

  getHourlyActivity(): { hour: number; events: number }[] {
    const hourlyActivity = new Map<number, number>();

    for (const event of this.eventHistory) {
      const hour = event.timestamp.getHours();
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
    }

    return Array.from(hourlyActivity.entries())
      .map(([hour, events]) => ({ hour, events }))
      .sort((a, b) => a.hour - b.hour);
  }

  private addToHistory(event: MetricEvent): void {
    this.eventHistory.push(event);

    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private updateAverageSyncTime(duration: number): void {
    this.syncTimes.push(duration);

    // Keep only recent sync times for rolling average
    if (this.syncTimes.length > 100) {
      this.syncTimes = this.syncTimes.slice(-100);
    }

    this.metrics.averageSyncTime =
      this.syncTimes.reduce((sum, time) => sum + time, 0) / this.syncTimes.length;
  }
}

export class InMemoryMetricsCollector implements MetricsCollector {
  private metrics: BridgeMetrics = {
    eventsProcessed: 0,
    eventsFailed: 0,
    tasksSynced: 0,
    conflictsResolved: 0,
    lastSyncTime: new Date(),
    averageSyncTime: 0,
    queueSize: 0,
  };

  recordEventProcessed(type: string, source: string, duration: number): void {
    this.metrics.eventsProcessed++;
    this.metrics.lastSyncTime = new Date();
    this.updateAverageSyncTime(duration);
  }

  recordEventFailed(type: string, source: string, error: Error): void {
    this.metrics.eventsFailed++;
  }

  recordTaskSynced(taskId: string): void {
    this.metrics.tasksSynced++;
  }

  recordConflictResolved(taskId: string): void {
    this.metrics.conflictsResolved++;
  }

  async getMetrics(): Promise<BridgeMetrics> {
    return { ...this.metrics };
  }

  async resetMetrics(): Promise<void> {
    this.metrics = {
      eventsProcessed: 0,
      eventsFailed: 0,
      tasksSynced: 0,
      conflictsResolved: 0,
      lastSyncTime: new Date(),
      averageSyncTime: 0,
      queueSize: 0,
    };
  }

  private updateAverageSyncTime(duration: number): void {
    // Simple rolling average
    this.metrics.averageSyncTime = (this.metrics.averageSyncTime + duration) / 2;
  }
}

export class MetricsCollectorFactory {
  static create(
    type: 'default' | 'memory' = 'default',
    options?: { maxHistorySize?: number },
  ): MetricsCollector {
    switch (type) {
      case 'default':
        const collector = new DefaultMetricsCollector();
        if (options?.maxHistorySize) {
          (collector as any).maxHistorySize = options.maxHistorySize;
        }
        return collector;

      case 'memory':
        return new InMemoryMetricsCollector();

      default:
        throw new Error(`Unknown metrics collector type: ${type}`);
    }
  }
}
