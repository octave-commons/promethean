# Monitoring Configuration for Omni Service

This directory contains configuration files for monitoring and observability setups for the Omni Service.

## 📊 Monitoring Stack

### Core Components
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and alerting
- **Node Exporter**: Node.js process metrics
- **Custom Metrics**: Application-specific metrics
- **Alerting**: Automated alerting for critical issues

## 🚀 Quick Start

### Using Docker Compose
```bash
# Start monitoring stack
docker-compose -f docker-compose.yml up -d

# Access Grafana
open http://localhost:3001

# Access Prometheus
open http://localhost:9090

# Stop monitoring stack
docker-compose down
```

### Manual Setup
```bash
# Start Prometheus
prometheus --config.file=prometheus.yml

# Start Grafana
grafana --config=/etc/grafana/grafana.ini
```

## 📁 Configuration Files

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules/*.yml"

scrape_configs:
  - job_name: 'omni-service'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
    scrape_interval: 5s
    scrape_timeout: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 10s

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 10s

  - job_name: 'mongodb-exporter'
    static_configs:
      - targets: ['localhost:9211']
    scrape_interval: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - 'localhost:9093'
```

### Grafana Configuration

```ini
[server]
protocol = http
http_addr = 0.0.0.0
http_port = 3001
root_url = http://localhost:3001/

[database]
path = /var/lib/grafana
type = sqlite3
host = localhost
name = grafana
user = grafana
password = admin

[security]
admin_user = admin
admin_password = admin

[users]
admin: admin

[auth.anonymous]
enabled = false

[auth.session]
provider = database

[log]
mode = console
level = info

[paths]
data = /var/lib/grafana
logs = /var/log/grafana
plugins = /var/lib/grafana/plugins

[api]
enable_swagger = true
```

## 📈 Custom Metrics

### Application Metrics

```javascript
import { register, Counter, Histogram, Gauge, Registry } from 'prom-client';

// Create metrics registry
const registry = new Registry();

// HTTP request counter
const httpRequestsTotal = new Counter({
  name: 'omni_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'adapter'],
  registers: [registry],
});

// Request duration histogram
const httpRequestDuration = new Histogram({
  name: 'omni_service_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'adapter'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

// Active connections gauge
const activeConnections = new Gauge({
  name: 'omni_service_active_connections',
  help: 'Number of active connections',
  labelNames: ['type'], // websocket, database, cache
  registers: [registry],
});

// Adapter-specific metrics
const adapterMetrics = {
  rest: {
    requests: new Counter({
      name: 'omni_service_rest_requests_total',
      help: 'Total REST API requests',
      labelNames: ['method', 'endpoint', 'status_code'],
      registers: [registry],
    }),
    duration: new Histogram({
      name: 'omni_service_rest_duration_seconds',
      help: 'REST API response time',
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [registry],
    }),
  },
  
  graphql: {
    queries: new Counter({
      name: 'omni_service_graphql_queries_total',
      help: 'Total GraphQL queries',
      labelNames: ['operation_name', 'status'],
      registers: [registry],
    }),
    duration: new Histogram({
      name: 'omni_service_graphql_duration_seconds',
      help: 'GraphQL query response time',
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [registry],
    }),
  },
  
  websocket: {
    connections: new Gauge({
      name: 'omni_service_websocket_connections',
      help: 'Number of WebSocket connections',
      registers: [registry],
    }),
    messages: new Counter({
      name: 'omni_service_websocket_messages_total',
      help: 'Total WebSocket messages',
      labelNames: ['type', 'direction'],
      registers: [registry],
    }),
  },
  
  mcp: {
    calls: new Counter({
      name: 'omni_service_mcp_calls_total',
      help: 'Total MCP calls',
      labelNames: ['method', 'status'],
      registers: [registry],
    }),
    duration: new Histogram({
      name: 'omni_service_mcp_duration_seconds',
      help: 'MCP call duration',
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [registry],
    }),
  },
};

export {
  registry,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  adapterMetrics,
};
```

### Health Check Metrics

```javascript
// Health check metrics collection
export const collectHealthMetrics = () => {
  const now = Date.now();
  
  // System metrics
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage();
  
  // Application metrics
  const healthCheck = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: now,
    system: {
      cpu: cpuUsage,
      memory: memoryUsage,
    },
    adapters: {
      rest: getAdapterHealth('rest'),
      graphql: getAdapterHealth('graphql'),
      websocket: getAdapterHealth('websocket'),
      mcp: getAdapterHealth('mcp'),
    },
  };
  
  // Update gauges
  cpuUsageGauge.set({ source: 'user' }, cpuUsage.user / 100);
  cpuUsageGauge.set({ source: 'system' }, cpuUsage.system / 100);
  memoryGauge.set({ type: 'used' }, memoryUsage.heapUsed);
  memoryGauge.set({ type: 'total' }, memoryUsage.heapTotal);
  memoryGauge.set({ type: 'rss' }, memoryUsage.rss);
  memoryGauge.set({ type: 'external' }, memoryUsage.external);
  
  uptimeGauge.set(healthCheck.uptime);
  healthStatusGauge.set(healthCheck.status === 'healthy' ? 1 : 0);
  
  return healthCheck;
};

function getAdapterHealth(adapter) {
  // Mock adapter health check
  return {
    status: 'healthy',
    responseTime: Math.random() * 100,
    lastCheck: new Date().toISOString(),
  };
}
```

### Database Metrics

```javascript
// MongoDB metrics
export const collectDatabaseMetrics = async () => {
  try {
    const stats = await db.stats();
    
    // Update database metrics
    dbConnectionsGauge.set(stats.connections);
    dbCollectionsGauge.set(stats.collections);
    dbDocumentsGauge.set(stats.objects);
    dbIndexSizeGauge.set(stats.indexSize);
    
    // Slow queries metric
    const slowQueriesCount = await db.collection('slow_queries').countDocuments();
    slowQueriesCounter.inc(slowQueriesCount);
    
    return {
      connections: stats.connections,
      collections: stats.collections,
      documents: stats.objects,
      indexSize: stats.indexSize,
      slowQueries: slowQueriesCount,
    };
  } catch (error) {
    console.error('Error collecting database metrics:', error);
    databaseErrorCounter.inc();
    return null;
  }
};

// Redis metrics
export const collectCacheMetrics = async () => {
  try {
    const info = await redis.info();
    
    // Update cache metrics
    redisConnectedClientsGauge.set(info.connected_clients);
    redisUsedMemoryGauge.set(info.used_memory);
    redisKeyspaceHitsGauge.set(info.keyspace_hits);
    redisKeyspaceMissesGauge.set(info.keyspace_misses);
    
    const hitRate = info.keyspace_hits / (info.keyspace_hits + info.keyspace_misses);
    redisHitRateGauge.set(hitRate);
    
    return {
      connectedClients: info.connected_clients,
      usedMemory: info.used_memory,
      keyspaceHits: info.keyspace_hits,
      keyspaceMisses: info.keyspace_misses,
      hitRate,
    };
  } catch (error) {
    console.error('Error collecting cache metrics:', error);
    cacheErrorCounter.inc();
    return null;
  }
};
```

## 🚨 Alerting Rules

### Production Alerts

```yaml
groups:
  - name: OmniServiceCritical
    rules:
      - alert: OmniServiceDown
      - alert: HighErrorRate
      - alert: HighLatency
      - alert: LowDiskSpace
      - alert: LowMemory
      - alert: DatabaseConnectionPool
      - alert: CacheEvictionRate

  - name: OmniServicePerformance
    rules:
      - alert: ResponseTimeP99
      - alert: ThroughputLow
      - alert: DatabaseSlowQueries
      - alert: WebSocketConnections

alerts:
  - alert: OmniServiceDown
    expr: up{job="omni-service"} == 0
    for: 1m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "Omni Service is down"
      description: "The Omni Service is not responding to health checks"
      runbook_url: "https://docs.omni-service.com/troubleshooting/service-down"

  - alert: HighErrorRate
    expr: rate(http_requests_total{adapter="rest",status_code=~"5.."}[5m]) > 0.05
    for: 2m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High error rate in REST adapter"
      description: "REST adapter error rate exceeds 5% over 5 minutes"
      runbook_url: "https://docs.omni-service.com/troubleshooting/high-error-rate"

  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{adapter="rest"}[5m])) > 1
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High latency in REST adapter"
      description: "95th percentile latency exceeds 1 second"
      runbook_url: "https://docs.omni-service.com/troubleshooting/high-latency"

  - alert: LowDiskSpace
    expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} ) < 0.1
    for: 5m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "Low disk space"
      description: "Disk space is less than 10%"
      runbook_url: "https://docs.omni-service.com/troubleshooting/low-disk-space"

  - alert: LowMemory
    expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) < 0.1
    for: 5m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "Low memory available"
      description: "Available memory is less than 10%"
      runbook_url: "https://docs.omni-service.com/troubleshooting/low-memory"

  - alert: DatabaseConnectionPool
    expr: (mongodb_connections_current / mongodb_connections_available) > 0.8
    for: 10m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High database connection pool utilization"
      description: "Database connection pool utilization exceeds 80%"
      runbook_url: "https://docs.omni-service.com/troubleshooting/database-connection-pool"

  - alert: CacheEvictionRate
    expr: rate(redis_keyspace_evicted_keys_total[5m]) > 100
    for: 10m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High cache eviction rate"
      description: "Cache eviction rate exceeds 100 keys per minute"
      runbook_url: "https://docs.omni-service.com/troubleshooting/cache-eviction-rate"
```

## 📊 Custom Dashboards

### Main Dashboard

```json
{
  "dashboard": {
    "title": "Omni Service Overview",
    "tags": ["omni-service", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "id": "overview",
        "type": "stat",
        "gridPos": { "h": 6, "w": 4 },
        "title": "Overview",
        "targets": [
          {
            "expr": "up{job=\"omni-service\"}",
            "legendFormat": "Service Status",
            "mapping": {
              "0": "Down",
              "1": "Up"
            }
          },
          {
            "expr": "nodejs_version_info{job=\"omni-service\"}",
            "legendFormat": "Node Version"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "mappings": {
              "Service Status": { "name": "Service Status", "color": "red" },
              "Node Version": { "name": "Node Version" }
            }
          }
        }
      },
      {
        "id": "request-metrics",
        "type": "graph",
        "gridPos": { "h": 6, "w": 8 },
        "title": "Request Metrics",
        "targets": [
          {
            "expr": "rate(omni_service_http_requests_total[1m])",
            "legendFormat": "{{method}} {{route}}",
            "yAxisID": "rate"
          },
          {
            "expr": "rate(omni_service_http_requests_total[1m])",
            "legendFormat": "Total",
            "yAxisID": "rate"
          }
        ],
        "yAxes": [
          {
            "id": "rate",
            "title": "Requests/sec",
            "max": 200,
            "decimals": 0
          }
        ]
      },
      {
        "id": "response-time",
        "type": "graph",
        "gridPos": { "h": 6, "w": 12 },
        "title": "Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(omni_service_http_request_duration_seconds_bucket[1m]))",
            "legendFormat": "P50 {{adapter}}",
            "yAxisID": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(omni_service_http_request_duration_seconds_bucket[1m]))",
            "legendFormat": "P95 {{adapter}}",
            "yAxisID": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(omni_service_http_request_duration_seconds_bucket[1m]))",
            "legendFormat": "P99 {{adapter}}",
            "yAxisID": "p99"
          }
        ],
        "yAxes": [
          {
            "id": "p50",
            "title": "Response Time (s)",
            "max": 1,
            "decimals": 3
          },
          {
            "id": "p95",
            "title": "Response Time (s)",
            "max": 1,
            "decimals": 3
          },
          {
            "id": "p99",
            "title": "Response Time (s)",
            "max": 1,
            "decimals": 3
          }
        ]
      },
      {
        "id": "errors",
        "type": "graph",
        "gridPos": { "h": 6, "w": 8 },
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(omni_service_http_requests_total{status_code=~\"4..\"}[1m])",
            "legendFormat": "4xx Errors",
            "yAxisID": "errors"
          },
          {
            "expr": "rate(omni_service_http_requests_total{adapter=\"rest\"}[1m]) - rate(omni_service_http_requests_total{adapter=\"rest\",status_code!~\"[1m])) / rate(omni_service_http_requests_total{adapter=\"rest\"}[1m])",
            "legendFormat": "REST Error Rate",
            "yAxisID": "errors"
          }
        ],
        "yAxes": [
          {
            "id": "errors",
            "title": "Error Rate (%)",
            "max": 0.1,
            "decimals": 2
          }
        ]
      },
      {
        "id": "resources",
        "type": "graph",
        "gridPos": { "h": 6, "w": 8 },
        "title": "Resource Usage",
        "targets": [
          {
            "expr": "nodejs_memory_heap_used_bytes{job=\"omni-service\"}",
            "legendFormat": "Heap Memory",
            "yAxisID": "resources"
          },
          {
            "expr": "nodejs_memory_rss_bytes{job=\"omni-service\"}",
            "legendFormat": "RSS Memory",
            "yAxisID": "resources"
          },
          {
            "expr": "nodejs_cpu_usage_percent{job=\"omni-service\"}",
            "legendFormat": "CPU Usage",
            "yAxisID": "resources"
          }
        ],
        "yAxes": [
          {
            "id": "resources",
            "title": "Resource Usage",
            "labelFormat": "{{legend}}",
            "max": 100,
            "decimals": 2
          }
        ]
      }
    ]
  }
}
```

## 🔧 Monitoring Scripts

### Health Check Script

```javascript
// scripts/health-check.js
const { collectHealthMetrics } = require('../src/monitoring/health-metrics');
const { registry } = require('../src/monitoring/metrics');

async function healthCheck() {
  try {
    const healthMetrics = collectHealthMetrics();
    
    // Check if all systems are healthy
    const isHealthy = healthMetrics.status === 'healthy' &&
                     healthMetrics.adapters.every(adapter => adapter.status === 'healthy');
    
    if (!isHealthy) {
      console.error('❌ Health check failed:', healthMetrics);
      process.exit(1);
    }
    
    console.log('✅ Health check passed:', healthMetrics);
    
    // Expose metrics
    const metrics = await register.metrics();
    console.log('📊 Metrics:', metrics);
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    process.exit(1);
  }
}

healthCheck();
```

### Metrics Collection Script

```javascript
// scripts/collect-metrics.js
const { collectDatabaseMetrics, collectCacheMetrics } = require('../src/monitoring/db-metrics');

async function collectAllMetrics() {
  try {
    const dbMetrics = await collectDatabaseMetrics();
    const cacheMetrics = await collectCacheMetrics();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      database: dbMetrics,
      cache: cacheMetrics,
    };
    
    console.log('📊 Collected metrics:', JSON.stringify(metrics, null, 2));
    
    return metrics;
    
  } catch (error) {
    console.error('❌ Metrics collection error:', error);
    process.exit(1);
  }
}

collectAllMetrics();
```

---

**Comprehensive monitoring and observability setup is crucial for ensuring the Omni Service remains healthy and performant in production environments.**