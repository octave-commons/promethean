import { z } from 'zod';

export const BuildStatusSchema = z.enum(['pending', 'running', 'success', 'failure', 'cancelled']);
export type BuildStatus = z.infer<typeof BuildStatusSchema>;

export const AlertLevelSchema = z.enum(['info', 'warning', 'error', 'critical']);
export type AlertLevel = z.infer<typeof AlertLevelSchema>;

export const BuildMetricSchema = z.object({
  timestamp: z.string(),
  buildId: z.string(),
  project: z.string(),
  status: BuildStatusSchema,
  duration: z.number().optional(),
  errorCount: z.number().default(0),
  warningCount: z.number().default(0),
  memoryUsage: z.number().optional(),
  cpuUsage: z.number().optional(),
  cacheHitRate: z.number().optional(),
});

export type BuildMetric = z.infer<typeof BuildMetricSchema>;

export const AlertSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: AlertLevelSchema,
  title: z.string(),
  message: z.string(),
  project: z.string().optional(),
  buildId: z.string().optional(),
  resolved: z.boolean().default(false),
  resolvedAt: z.string().optional(),
});

export type Alert = z.infer<typeof AlertSchema>;

export const BuildMonitorConfigSchema = z.object({
  enabled: z.boolean().default(true),
  checkInterval: z.number().default(30000), // 30 seconds
  maxBuildTime: z.number().default(300000), // 5 minutes
  alertThresholds: z.object({
    errorRate: z.number().default(0.1), // 10%
    buildTime: z.number().default(300000), // 5 minutes
    memoryUsage: z.number().default(0.8), // 80%
    cpuUsage: z.number().default(0.9), // 90%
  }),
  projects: z.array(z.string()).default([]),
});

export type BuildMonitorConfig = z.infer<typeof BuildMonitorConfigSchema>;

export const HealthCheckConfigSchema = z.object({
  enabled: z.boolean().default(true),
  interval: z.number().default(60000), // 1 minute
  checks: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['http', 'process', 'disk', 'memory']),
      target: z.string(),
      threshold: z.number().optional(),
      timeout: z.number().default(5000),
    }),
  ),
});

export type HealthCheckConfig = z.infer<typeof HealthCheckConfigSchema>;

export const AlertConfigSchema = z.object({
  enabled: z.boolean().default(true),
  channels: z.array(
    z.object({
      type: z.enum(['email', 'slack', 'webhook']),
      config: z.record(z.any()),
      enabled: z.boolean().default(true),
    }),
  ),
  rules: z.array(
    z.object({
      name: z.string(),
      condition: z.string(),
      level: AlertLevelSchema,
      enabled: z.boolean().default(true),
    }),
  ),
});

export type AlertConfig = z.infer<typeof AlertConfigSchema>;

export const MetricsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  retention: z.number().default(86400000), // 24 hours
  aggregation: z.object({
    interval: z.number().default(300000), // 5 minutes
    metrics: z.array(z.string()).default(['duration', 'errorCount', 'memoryUsage']),
  }),
});

export type MetricsConfig = z.infer<typeof MetricsConfigSchema>;
