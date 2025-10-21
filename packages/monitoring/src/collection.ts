/**
 * Metrics Collection Service for the Performance Monitoring Framework
 * Handles collection, validation, batching, and transmission of metrics
 */

import type {
  PerformanceMetric,
  MonitoringConfig,
  AgentPerformanceMetrics,
  PipelinePerformanceMetrics,
  SystemResourceMetrics,
} from './types.js';
import { METRIC_SCHEMA_REGISTRY, validateMetricName } from './schemas.js';

// Collection service configuration
export interface CollectionServiceConfig extends MonitoringConfig {
  readonly maxBatchSize: number;
  readonly maxQueueSize: number;
  readonly retryDelay: number; // milliseconds
  readonly compressionThreshold: number; // bytes
}

// Default configuration
export const DEFAULT_COLLECTION_CONFIG: CollectionServiceConfig = {
  enabled: true,
  ingestionEndpoint: 'http://localhost:9090/metrics',
  batchSize: 100,
  flushInterval: 5000, // 5 seconds
  retryAttempts: 3,
  timeout: 10000, // 10 seconds
  compression: true,
  maxBatchSize: 1000,
  maxQueueSize: 10000,
  retryDelay: 1000, // 1 second
  compressionThreshold: 1024, // 1KB
};

// Metric queue item
interface QueuedMetric {
  readonly metric: PerformanceMetric;
  readonly timestamp: number;
  readonly retryCount: number;
}

// Collection service class
export class MetricsCollectionService {
  private readonly config: CollectionServiceConfig;
  private readonly metricQueue: QueuedMetric[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;
  private isDestroyed = false;

  constructor(config: Partial<CollectionServiceConfig> = {}) {
    this.config = { ...DEFAULT_COLLECTION_CONFIG, ...config };

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.config.enabled || this.isDestroyed) {
      return;
    }

    // Validate metric
    if (!this.validateMetric(metric)) {
      console.warn('Invalid metric rejected:', metric);
      return;
    }

    // Check queue size
    if (this.metricQueue.length >= this.config.maxQueueSize) {
      // Drop oldest metrics to prevent memory issues
      this.metricQueue.shift();
      console.warn('Metric queue full, dropping oldest metric');
    }

    // Add to queue
    this.metricQueue.push({
      metric,
      timestamp: Date.now(),
      retryCount: 0,
    });
  }

  /**
   * Record agent performance metrics
   */
  public recordAgentMetrics(metrics: AgentPerformanceMetrics): void {
    const baseMetric: Omit<PerformanceMetric, 'metricName' | 'value'> = {
      timestamp: metrics.timestamp,
      labels: {
        agent_id: metrics.agentId,
        agent_type: metrics.agentType,
        status: metrics.status,
        ...(metrics.errorType && { error_type: metrics.errorType }),
      },
    };

    // Execution time metric
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_agent_execution_time',
      value: metrics.executionTime,
    });

    // Memory usage metric
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_agent_memory_usage',
      value: metrics.memoryUsage,
    });

    // CPU usage metric
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_agent_cpu_usage',
      value: metrics.cpuUsage,
    });

    // Request counter
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_agent_requests_total',
      value: 1,
    });

    // Error counter (if applicable)
    if (metrics.status === 'error') {
      this.recordMetric({
        ...baseMetric,
        metricName: 'promethean_agent_errors_total',
        value: 1,
      });
    }
  }

  /**
   * Record pipeline performance metrics
   */
  public recordPipelineMetrics(metrics: PipelinePerformanceMetrics): void {
    const baseMetric: Omit<PerformanceMetric, 'metricName' | 'value'> = {
      timestamp: metrics.timestamp,
      labels: {
        pipeline_id: metrics.pipelineId,
        stage_id: metrics.stageId,
        stage_name: metrics.stageName,
      },
    };

    // Throughput metric
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_pipeline_throughput',
      value: metrics.throughput,
    });

    // Latency metric
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_pipeline_latency',
      value: metrics.latency,
    });

    // Queue depth metric
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_pipeline_queue_depth',
      value: metrics.queueDepth,
    });

    // Error rate metric
    this.recordMetric({
      ...baseMetric,
      metricName: 'promethean_pipeline_error_rate',
      value: metrics.errorRate,
    });
  }

  /**
   * Record system resource metrics
   */
  public recordSystemMetrics(metrics: SystemResourceMetrics): void {
    const baseLabels = {
      hostname: metrics.hostname,
    };

    // CPU metrics
    this.recordMetric({
      timestamp: metrics.timestamp,
      metricName: 'promethean_system_cpu_usage',
      value: metrics.cpuUsage,
      labels: baseLabels,
    });

    // Memory metrics
    this.recordMetric({
      timestamp: metrics.timestamp,
      metricName: 'promethean_system_memory_usage',
      value: metrics.memoryUsage,
      labels: { ...baseLabels, type: 'used' },
    });

    // Disk metrics
    this.recordMetric({
      timestamp: metrics.timestamp,
      metricName: 'promethean_system_disk_usage',
      value: metrics.diskUsage,
      labels: { ...baseLabels, type: 'used' },
    });

    // Network I/O metrics
    this.recordMetric({
      timestamp: metrics.timestamp,
      metricName: 'promethean_system_network_io',
      value: metrics.networkIO.bytesIn,
      labels: { ...baseLabels, direction: 'in' },
    });

    this.recordMetric({
      timestamp: metrics.timestamp,
      metricName: 'promethean_system_network_io',
      value: metrics.networkIO.bytesOut,
      labels: { ...baseLabels, direction: 'out' },
    });
  }

  /**
   * Manually trigger a flush of the metric queue
   */
  public async flush(): Promise<void> {
    if (this.isFlushing || this.isDestroyed) {
      return;
    }

    this.isFlushing = true;

    try {
      const batch = this.metricQueue.splice(0, this.config.batchSize);

      if (batch.length === 0) {
        return;
      }

      await this.sendBatch(batch);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Get current queue statistics
   */
  public getQueueStats(): {
    readonly queueSize: number;
    readonly isFlushing: boolean;
    readonly config: CollectionServiceConfig;
  } {
    return {
      queueSize: this.metricQueue.length,
      isFlushing: this.isFlushing,
      config: this.config,
    };
  }

  /**
   * Destroy the collection service and clean up resources
   */
  public destroy(): void {
    this.isDestroyed = true;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining metrics
    this.flush().catch(console.error);
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.config.flushInterval);
  }

  private validateMetric(metric: PerformanceMetric): boolean {
    // Validate metric name
    if (!validateMetricName(metric.metricName)) {
      return false;
    }

    // Check if metric schema exists
    const schema = METRIC_SCHEMA_REGISTRY.get(metric.metricName);
    if (!schema) {
      console.warn(`Unknown metric schema: ${metric.metricName}`);
      return false;
    }

    // Validate value
    if (typeof metric.value !== 'number' || !isFinite(metric.value)) {
      return false;
    }

    // Validate timestamp
    if (typeof metric.timestamp !== 'number' || metric.timestamp <= 0) {
      return false;
    }

    // Validate labels
    if (typeof metric.labels !== 'object' || metric.labels === null) {
      return false;
    }

    return true;
  }

  private async sendBatch(batch: QueuedMetric[]): Promise<void> {
    const payload = {
      metrics: batch.map((item) => item.metric),
      timestamp: Date.now(),
      source: 'promethean-monitoring',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication if configured
    if (this.config.authentication) {
      if (this.config.authentication.type === 'bearer' && this.config.authentication.token) {
        headers.Authorization = `Bearer ${this.config.authentication.token}`;
      } else if (this.config.authentication.type === 'basic') {
        const auth = btoa(
          `${this.config.authentication.username}:${this.config.authentication.password}`,
        );
        headers.Authorization = `Basic ${auth}`;
      }
    }

    // Apply compression if enabled and payload is large enough
    let body = JSON.stringify(payload);
    if (this.config.compression && body.length > this.config.compressionThreshold) {
      headers['Content-Encoding'] = 'gzip';
      // In a real implementation, you would compress the body here
      // body = await compress(body);
    }

    const response = await fetch(this.config.ingestionEndpoint, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

// Singleton instance for easy usage
let globalCollectionService: MetricsCollectionService | null = null;

/**
 * Get or create the global metrics collection service
 */
export const getMetricsCollectionService = (
  config?: Partial<CollectionServiceConfig>,
): MetricsCollectionService => {
  if (!globalCollectionService) {
    globalCollectionService = new MetricsCollectionService(config);
  }
  return globalCollectionService;
};

/**
 * Destroy the global metrics collection service
 */
export const destroyMetricsCollectionService = (): void => {
  if (globalCollectionService) {
    globalCollectionService.destroy();
    globalCollectionService = null;
  }
};
