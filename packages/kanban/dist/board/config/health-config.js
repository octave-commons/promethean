import { z } from 'zod';
export const HealthThresholdSchema = z.object({
    wipViolation: z.number().min(0).max(100).default(80),
    dwellTime: z.object({
        warning: z.number().min(0).default(7),
        critical: z.number().min(0).default(14),
    }),
    flowEfficiency: z.object({
        warning: z.number().min(0).max(100).default(60),
        critical: z.number().min(0).max(100).default(40),
    }),
    throughput: z.object({
        warning: z.number().min(0).default(1),
        critical: z.number().min(0).default(0.5),
    }),
    anomalySensitivity: z.number().min(0).max(1).default(0.7),
});
export const AlertChannelSchema = z.object({
    type: z.enum(['console', 'file', 'webhook', 'mcp']),
    enabled: z.boolean().default(true),
    config: z.record(z.any()).optional(),
});
export const HealthRuleSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    enabled: z.boolean().default(true),
    severity: z.enum(['info', 'warning', 'error', 'critical']).default('warning'),
    condition: z.string(),
    action: z.string().optional(),
});
export const HealthMonitoringConfigSchema = z.object({
    enabled: z.boolean().default(true),
    thresholds: HealthThresholdSchema.default({
        wipViolation: 80,
        dwellTime: { warning: 7, critical: 14 },
        flowEfficiency: { warning: 60, critical: 40 },
        throughput: { warning: 1, critical: 0.5 },
        anomalySensitivity: 0.7,
    }),
    alertChannels: z.array(AlertChannelSchema).default([
        { type: 'console', enabled: true },
        { type: 'file', enabled: true, config: { path: 'logs/kanban-health.log' } },
    ]),
    rules: z.array(HealthRuleSchema).default([]),
    scheduling: z.object({
        metricsCollection: z.string().default('*/5 * * * *'),
        anomalyDetection: z.string().default('*/15 * * * *'),
        reportGeneration: z.object({
            daily: z.string().default('0 8 * * *'),
            weekly: z.string().default('0 8 * * 1'),
        }),
    }),
    retention: z.object({
        metrics: z.number().min(1).default(30),
        reports: z.number().min(1).default(90),
        logs: z.number().min(1).default(7),
    }),
});
export const EnvironmentConfigSchema = z.object({
    name: z.string(),
    overrides: z.record(z.any()).optional(),
    health: HealthMonitoringConfigSchema.optional(),
});
const defaultEnvironments = {
    development: {
        name: 'development',
        health: {
            enabled: true,
            thresholds: {
                wipViolation: 90,
                dwellTime: { warning: 14, critical: 21 },
                flowEfficiency: { warning: 50, critical: 30 },
                throughput: { warning: 0.5, critical: 0.25 },
                anomalySensitivity: 0.8,
            },
            alertChannels: [
                { type: 'console', enabled: true },
                { type: 'file', enabled: true, config: { path: 'logs/kanban-health-dev.log' } },
            ],
            rules: [],
            scheduling: {
                metricsCollection: '*/2 * * * *',
                anomalyDetection: '*/5 * * * *',
                reportGeneration: {
                    daily: '0 9 * * *',
                    weekly: '0 9 * * 1',
                },
            },
            retention: {
                metrics: 30,
                reports: 90,
                logs: 7,
            },
        },
    },
    production: {
        name: 'production',
        health: {
            enabled: true,
            thresholds: {
                wipViolation: 70,
                dwellTime: { warning: 5, critical: 10 },
                flowEfficiency: { warning: 70, critical: 50 },
                throughput: { warning: 2, critical: 1 },
                anomalySensitivity: 0.6,
            },
            alertChannels: [
                { type: 'console', enabled: false },
                { type: 'file', enabled: true, config: { path: 'logs/kanban-health.log' } },
                {
                    type: 'webhook',
                    enabled: false,
                    config: { url: process.env.HEALTH_WEBHOOK_URL },
                },
                { type: 'mcp', enabled: true, config: { bridge: 'promethean-mcp' } },
            ],
            rules: [],
            scheduling: {
                metricsCollection: '*/5 * * * *',
                anomalyDetection: '*/15 * * * *',
                reportGeneration: {
                    daily: '0 6 * * *',
                    weekly: '0 6 * * 1',
                },
            },
            retention: {
                metrics: 30,
                reports: 90,
                logs: 7,
            },
        },
    },
};
export const KanbanHealthConfigSchema = z.object({
    environments: z.record(EnvironmentConfigSchema).default(defaultEnvironments),
    version: z.string().default('1.0.0'),
    schema: z.string().default('health-config-v1'),
});
export const DEFAULT_HEALTH_CONFIG = {
    enabled: true,
    thresholds: {
        wipViolation: 80,
        dwellTime: { warning: 7, critical: 14 },
        flowEfficiency: { warning: 60, critical: 40 },
        throughput: { warning: 1, critical: 0.5 },
        anomalySensitivity: 0.7,
    },
    alertChannels: [
        { type: 'console', enabled: true },
        { type: 'file', enabled: true, config: { path: 'logs/kanban-health.log' } },
    ],
    rules: [
        {
            name: 'wip-limit-violation',
            description: 'Detect WIP limit violations',
            enabled: true,
            severity: 'warning',
            condition: 'column.wip > column.limit',
            action: 'log-warning',
        },
        {
            name: 'excessive-dwell-time',
            description: 'Detect tasks stuck too long',
            enabled: true,
            severity: 'error',
            condition: 'task.dwellTime > thresholds.dwellTime.critical',
            action: 'escalate-alert',
        },
    ],
    scheduling: {
        metricsCollection: '*/5 * * * *',
        anomalyDetection: '*/15 * * * *',
        reportGeneration: {
            daily: '0 8 * * *',
            weekly: '0 8 * * 1',
        },
    },
    retention: {
        metrics: 30,
        reports: 90,
        logs: 7,
    },
};
//# sourceMappingURL=health-config.js.map