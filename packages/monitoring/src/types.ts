/**
 * Core types for the Performance Monitoring and Optimization Framework
 */

// Metric types following OpenTelemetry standards
export interface MetricSchema {
  readonly name: string;
  readonly type: 'counter' | 'gauge' | 'histogram' | 'summary';
  readonly description: string;
  readonly unit?: string;
  readonly labels: ReadonlyArray<string>;
  readonly buckets?: ReadonlyArray<number>; // For histograms
}

// Performance metric events
export interface PerformanceMetric {
  readonly timestamp: number;
  readonly metricName: string;
  readonly value: number;
  readonly labels: Readonly<Record<string, string>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// Agent performance metrics
export interface AgentPerformanceMetrics {
  readonly agentId: string;
  readonly agentType: string;
  readonly executionTime: number; // milliseconds
  readonly memoryUsage: number; // bytes
  readonly cpuUsage: number; // percentage
  readonly status: 'success' | 'error' | 'timeout';
  readonly errorType?: string;
  readonly timestamp: number;
}

// Pipeline performance metrics
export interface PipelinePerformanceMetrics {
  readonly pipelineId: string;
  readonly stageId: string;
  readonly stageName: string;
  readonly throughput: number; // items per second
  readonly latency: number; // milliseconds
  readonly queueDepth: number;
  readonly errorRate: number; // percentage
  readonly timestamp: number;
}

// System resource metrics
export interface SystemResourceMetrics {
  readonly hostname: string;
  readonly cpuUsage: number; // percentage
  readonly memoryUsage: number; // bytes
  readonly diskUsage: number; // bytes
  readonly networkIO: {
    readonly bytesIn: number;
    readonly bytesOut: number;
  };
  readonly timestamp: number;
}

// Alert definitions
export interface AlertRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly metricName: string;
  readonly condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  readonly threshold: number;
  readonly duration: number; // milliseconds
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly labels: Readonly<Record<string, string>>;
  readonly enabled: boolean;
}

// Alert events
export interface AlertEvent {
  readonly id: string;
  readonly ruleId: string;
  readonly metricName: string;
  readonly currentValue: number;
  readonly threshold: number;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly message: string;
  readonly timestamp: number;
  readonly resolved: boolean;
  readonly resolvedAt?: number;
}

// Optimization suggestions
export interface OptimizationSuggestion {
  readonly id: string;
  readonly type: 'performance' | 'resource' | 'architecture' | 'configuration';
  readonly title: string;
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly effort: 'low' | 'medium' | 'high';
  readonly metrics: ReadonlyArray<{
    readonly name: string;
    readonly currentValue: number;
    readonly suggestedValue: number;
    readonly improvement: number; // percentage
  }>;
  readonly timestamp: number;
  readonly status: 'pending' | 'implemented' | 'rejected';
}

// Performance trend data
export interface PerformanceTrend {
  readonly metricName: string;
  readonly timeRange: {
    readonly start: number;
    readonly end: number;
  };
  readonly granularity: '1m' | '5m' | '15m' | '1h' | '1d';
  readonly dataPoints: ReadonlyArray<{
    readonly timestamp: number;
    readonly value: number;
    readonly labels?: Readonly<Record<string, string>>;
  }>;
  readonly statistics: {
    readonly min: number;
    readonly max: number;
    readonly avg: number;
    readonly p50: number;
    readonly p95: number;
    readonly p99: number;
  };
}

// Monitoring configuration
export interface MonitoringConfig {
  readonly enabled: boolean;
  readonly ingestionEndpoint: string;
  readonly batchSize: number;
  readonly flushInterval: number; // milliseconds
  readonly retryAttempts: number;
  readonly timeout: number; // milliseconds
  readonly compression: boolean;
  readonly authentication?: {
    readonly type: 'bearer' | 'basic';
    readonly token?: string;
    readonly username?: string;
    readonly password?: string;
  };
}

// Health check response
export interface HealthCheck {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly timestamp: number;
  readonly checks: ReadonlyArray<{
    readonly name: string;
    readonly status: 'pass' | 'fail' | 'warn';
    readonly message?: string;
    readonly duration: number; // milliseconds
  }>;
  readonly uptime: number; // milliseconds
}
