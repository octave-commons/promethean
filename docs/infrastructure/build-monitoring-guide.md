# Build Monitoring Guide

## Overview

The build monitoring system provides real-time insights into build performance, error rates, and system health across the Promethean Framework monorepo.

## 🚀 Quick Start

### Installation

```bash
# Install the build monitoring package
pnpm add @promethean/build-monitoring

# Setup monitoring configuration
pnpm --filter @promethean/build-monitoring setup-alerts
```

### Basic Usage

```typescript
import { BuildMonitor } from '@promethean/build-monitoring';

// Initialize monitor with default configuration
const monitor = new BuildMonitor();

// Start monitoring
await monitor.start();

// Check system health
const health = await monitor.healthCheck();
console.log('System Health:', health);
```

## 📊 Monitoring Features

### 1. Real-time Build Metrics

- **Build Duration**: Track how long builds take
- **Success Rate**: Monitor build success/failure rates
- **Error Analysis**: Categorize and analyze build errors
- **Resource Usage**: Monitor CPU and memory consumption

### 2. Health Checks

```typescript
import { HealthChecker } from '@promethean/build-monitoring';

const healthChecker = new HealthChecker({
  enabled: true,
  interval: 60000, // 1 minute
  checks: [
    {
      name: 'disk-space',
      type: 'disk',
      target: '/',
      threshold: 0.9, // 90% usage
    },
    {
      name: 'memory-usage',
      type: 'memory',
      threshold: 0.8, // 80% usage
    },
  ],
});
```

### 3. Alert System

```typescript
import { AlertManager } from '@promethean/build-monitoring';

const alertManager = new AlertManager({
  enabled: true,
  channels: [
    {
      type: 'email',
      config: {
        recipients: ['dev-team@promethean.ai'],
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        },
      },
    },
    {
      type: 'slack',
      config: {
        webhook: process.env.SLACK_WEBHOOK,
        channel: '#build-alerts',
      },
    },
  ],
  rules: [
    {
      name: 'build-failure',
      condition: 'status === "failure"',
      level: 'error',
      enabled: true,
    },
    {
      name: 'high-error-rate',
      condition: 'errorRate > 0.1',
      level: 'warning',
      enabled: true,
    },
  ],
});
```

## 🔧 Configuration

### Environment Variables

```bash
# Build Monitoring
BUILD_MONITORING_ENABLED=true
BUILD_MONITORING_INTERVAL=30000
BUILD_MONITORING_MAX_BUILD_TIME=300000

# Alert System
ALERT_EMAIL_ENABLED=true
ALERT_SLACK_ENABLED=true
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...

# Database (for metrics storage)
METRICS_DB_URL=mongodb://localhost:27017/build-metrics
METRICS_RETENTION_DAYS=30
```

### Configuration Files

#### `build-monitoring.config.json`

```json
{
  "monitoring": {
    "enabled": true,
    "checkInterval": 30000,
    "maxBuildTime": 300000,
    "alertThresholds": {
      "errorRate": 0.1,
      "buildTime": 300000,
      "memoryUsage": 0.8,
      "cpuUsage": 0.9
    },
    "projects": ["@promethean/core", "@promethean/builder", "@promethean/cli"]
  },
  "alerts": {
    "enabled": true,
    "channels": [
      {
        "type": "email",
        "enabled": true,
        "config": {
          "recipients": ["dev-team@promethean.ai"]
        }
      }
    ],
    "rules": [
      {
        "name": "build-failure",
        "condition": "status === 'failure'",
        "level": "error",
        "enabled": true
      }
    ]
  },
  "health": {
    "enabled": true,
    "interval": 60000,
    "checks": [
      {
        "name": "disk-space",
        "type": "disk",
        "target": "/",
        "threshold": 0.9
      }
    ]
  }
}
```

## 📈 Metrics Collection

### Build Metrics

```typescript
interface BuildMetric {
  timestamp: string;
  buildId: string;
  project: string;
  status: 'pending' | 'running' | 'success' | 'failure' | 'cancelled';
  duration?: number;
  errorCount: number;
  warningCount: number;
  memoryUsage?: number;
  cpuUsage?: number;
  cacheHitRate?: number;
}
```

### System Metrics

```typescript
interface SystemMetric {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO?: {
    bytesIn: number;
    bytesOut: number;
  };
  processCount: number;
}
```

### Alert Metrics

```typescript
interface Alert {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  project?: string;
  buildId?: string;
  resolved: boolean;
  resolvedAt?: string;
}
```

## 🚨 Alert Management

### Creating Custom Alerts

```typescript
import { AlertManager } from '@promethean/build-monitoring';

const alertManager = new AlertManager();

// Create custom alert
await alertManager.createAlert({
  level: 'warning',
  title: 'High Memory Usage',
  message: 'Memory usage exceeded 80% threshold',
  project: '@promethean/core',
  metadata: {
    memoryUsage: 0.85,
    threshold: 0.8,
  },
});
```

### Alert Rules

```typescript
// Custom alert rule
const customRule = {
  name: 'slow-build',
  condition: (metric: BuildMetric) => {
    return metric.duration && metric.duration > 300000; // 5 minutes
  },
  level: 'warning' as const,
  enabled: true,
};

alertManager.addRule(customRule);
```

## 🔍 Monitoring Dashboard

### Web Interface

The build monitoring system includes a web dashboard for visualizing metrics:

```typescript
import { createDashboard } from '@promethean/build-monitoring';

const dashboard = createDashboard({
  port: 3000,
  metricsEndpoint: '/api/metrics',
  healthEndpoint: '/api/health',
  alertsEndpoint: '/api/alerts',
});

await dashboard.start();
console.log('Dashboard available at http://localhost:3000');
```

### CLI Interface

```bash
# View current metrics
pnpm --filter @promethean/build-monitoring metrics

# Check system health
pnpm --filter @promethean/build-monitoring health-check

# View recent alerts
pnpm --filter @promethean/build-monitoring alerts

# Generate performance report
pnpm --filter @promethean/build-monitoring report --format markdown
```

## 📊 Performance Analysis

### Build Performance Trends

```typescript
import { MetricsCollector } from '@promethean/build-monitoring';

const collector = new MetricsCollector();

// Get build performance trends
const trends = await collector.getTrends({
  metric: 'duration',
  timeframe: '7d',
  project: '@promethean/core',
});

console.log('Build Duration Trends:', trends);
```

### Error Analysis

```typescript
// Analyze error patterns
const errorAnalysis = await collector.analyzeErrors({
  timeframe: '24h',
  groupBy: 'errorType',
});

console.log('Error Analysis:', errorAnalysis);
```

## 🔧 Integration with CI/CD

### GitHub Actions Integration

```yaml
- name: Setup Build Monitoring
  run: |
    pnpm --filter @promethean/build-monitoring setup-alerts

- name: Monitor Build
  run: |
    pnpm --filter @promethean/build-monitoring monitor \
      --build-id ${{ github.run_id }} \
      --project ${{ github.repository }}

- name: Upload Metrics
  if: always()
  run: |
    pnpm --filter @promethean/build-monitoring upload-metrics \
      --build-id ${{ github.run_id }}
```

### Nx Integration

```json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"],
      "cache": true,
      "monitoring": {
        "enabled": true,
        "trackDuration": true,
        "trackResources": true
      }
    }
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **High Memory Usage**

   ```bash
   # Check memory usage
   pnpm --filter @promethean/build-monitoring health-check --component memory

   # Clear cache if needed
   pnpm --filter @promethean/build-monitoring clear-cache
   ```

2. **Missing Alerts**

   ```bash
   # Check alert configuration
   pnpm --filter @promethean/build-monitoring test-alerts

   # Verify webhook endpoints
   pnpm --filter @promethean/build-monitoring test-webhooks
   ```

3. **Performance Issues**

   ```bash
   # Analyze performance bottlenecks
   pnpm --filter @promethean/build-monitoring analyze-performance

   # Optimize configuration
   pnpm --filter @promethean/build-monitoring optimize-config
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=build-monitoring:* pnpm --filter @promethean/build-monitoring monitor

# Verbose output
pnpm --filter @promethean/build-monitoring monitor --verbose
```

## 📚 API Reference

### BuildMonitor Class

```typescript
class BuildMonitor {
  constructor(config?: BuildMonitorConfig);

  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  getMetrics(timeframe?: string): Promise<BuildMetric[]>;
  createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert>;
}
```

### MetricsCollector Class

```typescript
class MetricsCollector {
  constructor(config?: MetricsConfig);

  collect(metric: BuildMetric): Promise<void>;
  getTrends(options: TrendOptions): Promise<TrendData>;
  analyzeErrors(options: ErrorAnalysisOptions): Promise<ErrorAnalysis>;
  export(format: 'json' | 'csv'): Promise<string>;
}
```

### AlertManager Class

```typescript
class AlertManager {
  constructor(config?: AlertConfig);

  createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert>;
  resolveAlert(alertId: string): Promise<void>;
  getAlerts(filters?: AlertFilters): Promise<Alert[]>;
  addRule(rule: AlertRule): void;
  removeRule(ruleName: string): void;
}
```

## 🔄 Best Practices

### Monitoring Configuration

1. **Set Appropriate Thresholds**: Configure thresholds based on historical data
2. **Use Multiple Channels**: Configure multiple alert channels for redundancy
3. **Regular Review**: Periodically review and update alert rules
4. **Test Alerts**: Regularly test alert configurations

### Performance Optimization

1. **Efficient Metrics Collection**: Collect only necessary metrics
2. **Proper Caching**: Use caching to reduce database queries
3. **Batch Processing**: Process metrics in batches for better performance
4. **Resource Management**: Monitor and limit resource usage

### Alert Management

1. **Meaningful Alerts**: Create alerts that provide actionable information
2. **Alert Fatigue**: Avoid too many low-priority alerts
3. **Escalation Rules**: Configure proper alert escalation
4. **Documentation**: Document alert procedures and responses

---

**Last Updated**: 2025-10-15
**Maintainer**: Infrastructure Team
**Version**: 1.0.0
