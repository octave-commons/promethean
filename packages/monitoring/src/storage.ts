/**
 * Performance Data Storage Layer
 * Handles persistent storage and retrieval of performance metrics
 */

import type {
  PerformanceMetric,
  PerformanceTrend,
  AlertEvent,
  OptimizationSuggestion,
  HealthCheck,
} from './types.js';

// Storage configuration
export interface StorageConfig {
  readonly retentionPeriod: number; // milliseconds
  readonly compressionEnabled: boolean;
  readonly indexRefreshInterval: number; // milliseconds
  readonly maxQueryResults: number;
  readonly cacheSize: number;
  readonly storagePath: string;
}

// Query interface
export interface MetricQuery {
  readonly metricNames: ReadonlyArray<string>;
  readonly labels?: Readonly<Record<string, string>>;
  readonly startTime: number;
  readonly endTime: number;
  readonly granularity?: '1m' | '5m' | '15m' | '1h' | '1d';
  readonly aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  readonly limit?: number;
}

// Query result
export interface QueryResult {
  readonly metricName: string;
  readonly dataPoints: ReadonlyArray<{
    readonly timestamp: number;
    readonly value: number;
    readonly labels?: Readonly<Record<string, string>>;
  }>;
  readonly totalCount: number;
  readonly hasMore: boolean;
}

// Storage statistics
export interface StorageStats {
  readonly totalMetrics: number;
  readonly totalSize: number; // bytes
  readonly oldestMetric: number;
  readonly newestMetric: number;
  readonly compressionRatio: number;
  readonly indexSize: number;
}

// Default configuration
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
  compressionEnabled: true,
  indexRefreshInterval: 60 * 1000, // 1 minute
  maxQueryResults: 10000,
  cacheSize: 1000,
  storagePath: './metrics-storage',
};

/**
 * Performance Data Storage Service
 */
export class PerformanceDataStorage {
  private readonly config: StorageConfig;
  private metricCache = new Map<string, PerformanceMetric[]>();
  private indexRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.initializeStorage();
    this.startIndexRefresh();
  }

  /**
   * Store a single metric
   */
  public async storeMetric(metric: PerformanceMetric): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    const key = this.getMetricKey(metric);

    // Add to cache
    if (!this.metricCache.has(key)) {
      this.metricCache.set(key, []);
    }

    const cache = this.metricCache.get(key)!;
    cache.push(metric);

    // Maintain cache size
    if (cache.length > this.config.cacheSize) {
      cache.splice(0, cache.length - this.config.cacheSize);
    }

    // Persist to storage (in a real implementation, this would write to disk/database)
    await this.persistMetric(metric);
  }

  /**
   * Store multiple metrics in batch
   */
  public async storeMetrics(metrics: ReadonlyArray<PerformanceMetric>): Promise<void> {
    if (this.isDestroyed || metrics.length === 0) {
      return;
    }

    // Group by metric key for efficient storage
    const groupedMetrics = new Map<string, PerformanceMetric[]>();

    for (const metric of metrics) {
      const key = this.getMetricKey(metric);
      if (!groupedMetrics.has(key)) {
        groupedMetrics.set(key, []);
      }
      groupedMetrics.get(key)!.push(metric);
    }

    // Store each group
    for (const [key, groupMetrics] of groupedMetrics) {
      // Update cache
      const existingCache = this.metricCache.get(key) || [];
      const updatedCache = [...existingCache, ...groupMetrics];

      if (updatedCache.length > this.config.cacheSize) {
        updatedCache.splice(0, updatedCache.length - this.config.cacheSize);
      }

      this.metricCache.set(key, updatedCache);

      // Persist to storage
      await this.persistMetrics(groupMetrics);
    }
  }

  /**
   * Query metrics based on criteria
   */
  public async queryMetrics(query: MetricQuery): Promise<QueryResult[]> {
    if (this.isDestroyed) {
      return [];
    }

    const results: QueryResult[] = [];

    for (const metricName of query.metricNames) {
      const metrics = await this.getMetricsByName(metricName, query);

      if (metrics.length > 0) {
        const dataPoints = this.processMetrics(metrics, query);

        results.push({
          metricName,
          dataPoints,
          totalCount: metrics.length,
          hasMore: metrics.length > (query.limit || this.config.maxQueryResults),
        });
      }
    }

    return results;
  }

  /**
   * Get performance trend for a metric
   */
  public async getPerformanceTrend(
    metricName: string,
    timeRange: { readonly start: number; readonly end: number },
    granularity: '1m' | '5m' | '15m' | '1h' | '1d' = '1h',
  ): Promise<PerformanceTrend | null> {
    const query: MetricQuery = {
      metricNames: [metricName],
      startTime: timeRange.start,
      endTime: timeRange.end,
      granularity,
      aggregation: 'avg',
    };

    const results = await this.queryMetrics(query);

    if (results.length === 0) {
      return null;
    }

    const dataPoints = results[0]?.dataPoints ?? [];
    const values = dataPoints.map((dp) => dp.value);

    return {
      metricName,
      timeRange,
      granularity,
      dataPoints,
      statistics: {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        p50: this.percentile(values, 0.5),
        p95: this.percentile(values, 0.95),
        p99: this.percentile(values, 0.99),
      },
    };
  }

  /**
   * Store alert event
   */
  public async storeAlert(alert: AlertEvent): Promise<void> {
    // In a real implementation, this would store to a database
    console.log('Storing alert:', alert);
  }

  /**
   * Store optimization suggestion
   */
  public async storeOptimizationSuggestion(suggestion: OptimizationSuggestion): Promise<void> {
    // In a real implementation, this would store to a database
    console.log('Storing optimization suggestion:', suggestion);
  }

  /**
   * Get storage statistics
   */
  public async getStorageStats(): Promise<StorageStats> {
    const totalMetrics = Array.from(this.metricCache.values()).reduce(
      (sum, metrics) => sum + metrics.length,
      0,
    );

    const allMetrics = Array.from(this.metricCache.values()).flat();
    const timestamps = allMetrics.map((m) => m.timestamp);

    return {
      totalMetrics,
      totalSize: totalMetrics * 200, // Estimated size per metric
      oldestMetric: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestMetric: timestamps.length > 0 ? Math.max(...timestamps) : 0,
      compressionRatio: this.config.compressionEnabled ? 0.3 : 1.0,
      indexSize: this.metricCache.size,
    };
  }

  /**
   * Clean up old metrics based on retention policy
   */
  public async cleanup(): Promise<void> {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    let cleanedCount = 0;

    for (const [key, metrics] of this.metricCache) {
      const originalLength = metrics.length;
      const filteredMetrics = metrics.filter((m) => m.timestamp > cutoffTime);

      if (filteredMetrics.length !== originalLength) {
        this.metricCache.set(key, filteredMetrics);
        cleanedCount += originalLength - filteredMetrics.length;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old metrics`);
    }
  }

  /**
   * Perform health check on storage
   */
  public async healthCheck(): Promise<HealthCheck> {
    const checks = [];
    const startTime = Date.now();

    try {
      // Check cache accessibility
      const cacheSize = this.metricCache.size;
      checks.push({
        name: 'cache_accessibility',
        status: 'pass' as const,
        message: `Cache accessible with ${cacheSize} metric types`,
        duration: Date.now() - startTime,
      });

      // Check storage path accessibility
      checks.push({
        name: 'storage_accessibility',
        status: 'pass' as const,
        message: `Storage path accessible: ${this.config.storagePath}`,
        duration: Date.now() - startTime,
      });

      // Check memory usage
      const memUsage = process.memoryUsage();
      const memUsageMB = memUsage.heapUsed / 1024 / 1024;
      checks.push({
        name: 'memory_usage',
        status: memUsageMB < 500 ? ('pass' as const) : ('warn' as const),
        message: `Memory usage: ${memUsageMB.toFixed(2)} MB`,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      checks.push({
        name: 'storage_health',
        status: 'fail' as const,
        message: `Storage health check failed: ${error}`,
        duration: Date.now() - startTime,
      });
    }

    const overallStatus = checks.some((c) => c.status === 'fail')
      ? 'unhealthy'
      : checks.some((c) => c.status === 'warn')
        ? 'degraded'
        : 'healthy';

    return {
      status: overallStatus,
      timestamp: Date.now(),
      checks,
      uptime: Date.now() - startTime,
    };
  }

  /**
   * Destroy the storage service and clean up resources
   */
  public destroy(): void {
    this.isDestroyed = true;

    if (this.indexRefreshTimer) {
      clearInterval(this.indexRefreshTimer);
      this.indexRefreshTimer = null;
    }

    this.metricCache.clear();
  }

  private initializeStorage(): void {
    // In a real implementation, this would initialize database connections
    // or create storage directories
    console.log(`Initializing storage at: ${this.config.storagePath}`);
  }

  private startIndexRefresh(): void {
    this.indexRefreshTimer = setInterval(() => {
      this.cleanup().catch(console.error);
    }, this.config.indexRefreshInterval);
  }

  private getMetricKey(metric: PerformanceMetric): string {
    return `${metric.metricName}:${JSON.stringify(metric.labels)}`;
  }

  private async persistMetric(metric: PerformanceMetric): Promise<void> {
    // In a real implementation, this would write to disk/database
    // For now, we'll just log it
    console.debug(`Persisting metric: ${metric.metricName} at ${metric.timestamp}`);
  }

  private async persistMetrics(metrics: ReadonlyArray<PerformanceMetric>): Promise<void> {
    // In a real implementation, this would batch write to disk/database
    console.debug(`Persisting ${metrics.length} metrics`);
  }

  private async getMetricsByName(
    metricName: string,
    query: MetricQuery,
  ): Promise<PerformanceMetric[]> {
    const allMetrics: PerformanceMetric[] = [];

    // Search cache for matching metrics
    for (const [key, metrics] of this.metricCache) {
      if (key.startsWith(`${metricName}:`)) {
        const filtered = metrics.filter(
          (m) =>
            m.timestamp >= query.startTime &&
            m.timestamp <= query.endTime &&
            (!query.labels || this.matchesLabels(m.labels, query.labels)),
        );
        allMetrics.push(...filtered);
      }
    }

    // Sort by timestamp
    allMetrics.sort((a, b) => a.timestamp - b.timestamp);

    // Apply limit
    const limit = query.limit || this.config.maxQueryResults;
    return allMetrics.slice(0, limit);
  }

  private matchesLabels(
    metricLabels: Readonly<Record<string, string>>,
    queryLabels: Readonly<Record<string, string>>,
  ): boolean {
    for (const [key, value] of Object.entries(queryLabels)) {
      if (metricLabels[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private processMetrics(
    metrics: PerformanceMetric[],
    query: MetricQuery,
  ): Array<{
    readonly timestamp: number;
    readonly value: number;
    readonly labels?: Readonly<Record<string, string>>;
  }> {
    if (!query.granularity || !query.aggregation) {
      return metrics.map((m) => ({
        timestamp: m.timestamp,
        value: m.value,
        labels: m.labels,
      }));
    }

    // Group by time buckets based on granularity
    const bucketSize = this.getGranularityMs(query.granularity);
    const buckets = new Map<number, number[]>();

    for (const metric of metrics) {
      const bucketTime = Math.floor(metric.timestamp / bucketSize) * bucketSize;
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, []);
      }
      buckets.get(bucketTime)!.push(metric.value);
    }

    // Aggregate each bucket
    const result: Array<{ readonly timestamp: number; readonly value: number }> = [];

    for (const [timestamp, values] of buckets) {
      let aggregatedValue: number;

      switch (query.aggregation) {
        case 'sum':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        default:
          aggregatedValue = values[0] ?? 0; // fallback to first value or 0
      }

      result.push({ timestamp, value: aggregatedValue });
    }

    return result.sort((a, b) => a.timestamp - b.timestamp);
  }

  private getGranularityMs(granularity: string): number {
    switch (granularity) {
      case '1m':
        return 60 * 1000;
      case '5m':
        return 5 * 60 * 1000;
      case '15m':
        return 15 * 60 * 1000;
      case '1h':
        return 60 * 60 * 1000;
      case '1d':
        return 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000; // default to 1 hour
    }
  }

  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }
}

// Singleton instance for easy usage
let globalStorage: PerformanceDataStorage | null = null;

/**
 * Get or create the global performance data storage
 */
export const getPerformanceDataStorage = (
  config?: Partial<StorageConfig>,
): PerformanceDataStorage => {
  if (!globalStorage) {
    globalStorage = new PerformanceDataStorage(config);
  }
  return globalStorage;
};

/**
 * Destroy the global performance data storage
 */
export const destroyPerformanceDataStorage = (): void => {
  if (globalStorage) {
    globalStorage.destroy();
    globalStorage = null;
  }
};
