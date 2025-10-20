/**
 * Metric schemas for the Performance Monitoring Framework
 * Based on OpenTelemetry standards with Promethean-specific extensions
 */

import type { MetricSchema } from './types.js';

// Core metric schemas for the Promethean Framework
export const METRIC_SCHEMAS: ReadonlyArray<MetricSchema> = [
  // Agent performance metrics
  {
    name: 'promethean_agent_execution_time',
    type: 'histogram',
    description: 'Time taken for agent execution in milliseconds',
    unit: 'ms',
    labels: ['agent_id', 'agent_type', 'status', 'error_type'],
    buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  },
  {
    name: 'promethean_agent_memory_usage',
    type: 'gauge',
    description: 'Memory usage by agent in bytes',
    unit: 'bytes',
    labels: ['agent_id', 'agent_type'],
  },
  {
    name: 'promethean_agent_cpu_usage',
    type: 'gauge',
    description: 'CPU usage percentage by agent',
    unit: 'percent',
    labels: ['agent_id', 'agent_type'],
  },
  {
    name: 'promethean_agent_requests_total',
    type: 'counter',
    description: 'Total number of agent requests',
    unit: 'requests',
    labels: ['agent_id', 'agent_type', 'status'],
  },
  {
    name: 'promethean_agent_errors_total',
    type: 'counter',
    description: 'Total number of agent errors',
    unit: 'errors',
    labels: ['agent_id', 'agent_type', 'error_type'],
  },

  // Pipeline performance metrics
  {
    name: 'promethean_pipeline_throughput',
    type: 'gauge',
    description: 'Pipeline throughput in items per second',
    unit: 'items/sec',
    labels: ['pipeline_id', 'stage_id', 'stage_name'],
  },
  {
    name: 'promethean_pipeline_latency',
    type: 'histogram',
    description: 'Pipeline stage latency in milliseconds',
    unit: 'ms',
    labels: ['pipeline_id', 'stage_id', 'stage_name'],
    buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  },
  {
    name: 'promethean_pipeline_queue_depth',
    type: 'gauge',
    description: 'Number of items in pipeline queue',
    unit: 'items',
    labels: ['pipeline_id', 'stage_id', 'stage_name'],
  },
  {
    name: 'promethean_pipeline_error_rate',
    type: 'gauge',
    description: 'Pipeline error rate percentage',
    unit: 'percent',
    labels: ['pipeline_id', 'stage_id', 'stage_name'],
  },

  // System resource metrics
  {
    name: 'promethean_system_cpu_usage',
    type: 'gauge',
    description: 'System CPU usage percentage',
    unit: 'percent',
    labels: ['hostname', 'core'],
  },
  {
    name: 'promethean_system_memory_usage',
    type: 'gauge',
    description: 'System memory usage in bytes',
    unit: 'bytes',
    labels: ['hostname', 'type'], // type: used, available, cached
  },
  {
    name: 'promethean_system_disk_usage',
    type: 'gauge',
    description: 'Disk usage in bytes',
    unit: 'bytes',
    labels: ['hostname', 'mount_point', 'type'], // type: used, available, total
  },
  {
    name: 'promethean_system_network_io',
    type: 'counter',
    description: 'Network I/O in bytes',
    unit: 'bytes',
    labels: ['hostname', 'direction', 'interface'], // direction: in, out
  },

  // HTTP/request metrics
  {
    name: 'promethean_http_requests_total',
    type: 'counter',
    description: 'Total HTTP requests',
    unit: 'requests',
    labels: ['method', 'route', 'status_code', 'service'],
  },
  {
    name: 'promethean_http_request_duration',
    type: 'histogram',
    description: 'HTTP request duration in milliseconds',
    unit: 'ms',
    labels: ['method', 'route', 'status_code', 'service'],
    buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  },
  {
    name: 'promethean_http_request_size',
    type: 'histogram',
    description: 'HTTP request size in bytes',
    unit: 'bytes',
    labels: ['method', 'route', 'service'],
    buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
  },
  {
    name: 'promethean_http_response_size',
    type: 'histogram',
    description: 'HTTP response size in bytes',
    unit: 'bytes',
    labels: ['method', 'route', 'status_code', 'service'],
    buckets: [100, 1000, 10000, 100000, 1000000, 10000000],
  },

  // Database metrics
  {
    name: 'promethean_db_connections_active',
    type: 'gauge',
    description: 'Active database connections',
    unit: 'connections',
    labels: ['database', 'host'],
  },
  {
    name: 'promethean_db_query_duration',
    type: 'histogram',
    description: 'Database query duration in milliseconds',
    unit: 'ms',
    labels: ['database', 'operation', 'table'],
    buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500],
  },
  {
    name: 'promethean_db_queries_total',
    type: 'counter',
    description: 'Total database queries',
    unit: 'queries',
    labels: ['database', 'operation', 'table', 'status'],
  },

  // Cache metrics
  {
    name: 'promethean_cache_hits_total',
    type: 'counter',
    description: 'Total cache hits',
    unit: 'hits',
    labels: ['cache_name', 'cache_type'],
  },
  {
    name: 'promethean_cache_misses_total',
    type: 'counter',
    description: 'Total cache misses',
    unit: 'misses',
    labels: ['cache_name', 'cache_type'],
  },
  {
    name: 'promethean_cache_size',
    type: 'gauge',
    description: 'Cache size in bytes',
    unit: 'bytes',
    labels: ['cache_name', 'cache_type'],
  },

  // Business metrics
  {
    name: 'promethean_business_operations_total',
    type: 'counter',
    description: 'Total business operations',
    unit: 'operations',
    labels: ['operation_type', 'status', 'user_type'],
  },
  {
    name: 'promethean_business_operation_duration',
    type: 'histogram',
    description: 'Business operation duration in milliseconds',
    unit: 'ms',
    labels: ['operation_type', 'status', 'user_type'],
    buckets: [100, 500, 1000, 2500, 5000, 10000, 30000, 60000],
  },
  {
    name: 'promethean_business_revenue',
    type: 'counter',
    description: 'Business revenue in smallest currency unit',
    unit: 'currency',
    labels: ['product', 'region', 'customer_type'],
  },
] as const;

// Metric schema registry for lookup
export const METRIC_SCHEMA_REGISTRY = new Map(
  METRIC_SCHEMAS.map((schema) => [schema.name, schema]),
);

// Default label sets for common use cases
export const DEFAULT_LABELS = {
  AGENT: ['agent_id', 'agent_type', 'status'],
  PIPELINE: ['pipeline_id', 'stage_id', 'stage_name'],
  HTTP: ['method', 'route', 'status_code', 'service'],
  SYSTEM: ['hostname'],
  DATABASE: ['database', 'operation'],
} as const;

// Helper functions for metric validation
export const validateMetricName = (name: string): boolean => {
  // OpenTelemetry metric name validation
  return /^[a-z_][a-z0-9_]*$/.test(name);
};

export const validateLabels = (
  labels: ReadonlyArray<string>,
  requiredLabels: ReadonlyArray<string>,
): boolean => {
  return requiredLabels.every((label) => labels.includes(label));
};

export const getMetricSchema = (name: string): MetricSchema | undefined => {
  return METRIC_SCHEMA_REGISTRY.get(name);
};

export const isMetricSchemaValid = (schema: MetricSchema): boolean => {
  if (!validateMetricName(schema.name)) {
    return false;
  }

  if (!['counter', 'gauge', 'histogram', 'summary'].includes(schema.type)) {
    return false;
  }

  if (schema.type === 'histogram' && (!schema.buckets || schema.buckets.length === 0)) {
    return false;
  }

  return true;
};
