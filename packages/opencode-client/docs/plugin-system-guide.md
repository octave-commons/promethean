# Plugin System Guide

## Overview

The OpenCode Client Plugin System provides a modular, extensible architecture for adding custom functionality to the OpenCode ecosystem. It enables developers to create plugins that can seamlessly integrate with sessions, events, messages, and the indexer service.

## Architecture

### Plugin System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Plugin Host   │───▶│  Plugin Manager  │───▶│  Plugin Registry│
│                 │    │                  │    │                 │
│ • Lifecycle     │    │ • Loading        │    │ • Discovery     │
│ • Events        │    │ • Unloading      │    │ • Metadata      │
│ • Hooks         │    │ • Dependencies   │    │ • Versioning    │
│ • Context       │    │ • Configuration  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Plugin Instances│◀───────────┘
                        │                  │
                        │ • Agent Mgmt     │
                        │ • Cache          │
                        │ • Events         │
                        │ • Custom         │
                        └──────────────────┘
```

### Core Features

1. **Dynamic Loading**: Load and unload plugins at runtime
2. **Dependency Management**: Handle plugin dependencies automatically
3. **Event System**: Plugin-to-plugin communication via events
4. **Configuration Management**: Centralized plugin configuration
5. **Lifecycle Hooks**: Integration points for plugin operations
6. **Tool Registration**: Expose plugin functionality as tools

## Built-in Plugins

### 1. Agent Management Plugin

Provides comprehensive agent session management capabilities.

```typescript
import { AgentManagementPlugin } from '@promethean-os/opencode-client';

const agentPlugin = new AgentManagementPlugin();

// Available tools:
// - agent.createSession
// - agent.startSession
// - agent.stopSession
// - agent.sendMessage
// - agent.listSessions
// - agent.getSession
// - agent.getStats
// - agent.cleanup
```

### 2. Cache Plugin

Handles intelligent caching for improved performance.

```typescript
import { CachePlugin } from '@promethean-os/opencode-client';

const cachePlugin = new CachePlugin();

// Available tools:
// - cache.get
// - cache.set
// - cache.delete
// - cache.clear
// - cache.stats
// - cache.configure
```

### 3. Events Plugin

Provides advanced event processing and filtering.

```typescript
import { EventsPlugin } from '@promethean-os/opencode-client';

const eventsPlugin = new EventsPlugin();

// Available tools:
// - events.list
// - events.search
// - events.filter
// - events.aggregate
// - events.subscribe
```

### 4. Sessions Plugin

Core session management functionality.

```typescript
import { SessionsPlugin } from '@promethean-os/opencode-client';

const sessionsPlugin = new SessionsPlugin();

// Available tools:
// - sessions.create
// - sessions.list
// - sessions.get
// - sessions.update
// - sessions.close
// - sessions.spawn
```

## Plugin Development

### Creating a Custom Plugin

```typescript
import { Plugin, PluginContext, Tool } from '@promethean-os/opencode-client';

export class CustomAnalyticsPlugin implements Plugin {
  name = 'custom-analytics';
  version = '1.0.0';
  description = 'Custom analytics and reporting plugin';

  private metrics: Map<string, number> = new Map();

  async initialize(context: PluginContext): Promise<void> {
    console.log('Initializing Custom Analytics Plugin');

    // Subscribe to relevant events
    context.events.on('session.created', this.onSessionCreated.bind(this));
    context.events.on('message.sent', this.onMessageSent.bind(this));
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Custom Analytics Plugin');
    this.metrics.clear();
  }

  getTools(): Record<string, Tool> {
    return {
      'analytics.getMetrics': {
        description: 'Get analytics metrics',
        parameters: {
          type: 'object',
          properties: {
            metric: { type: 'string', description: 'Specific metric to retrieve' },
          },
        },
        execute: async (params: any) => {
          if (params.metric) {
            return this.metrics.get(params.metric) || 0;
          }
          return Object.fromEntries(this.metrics);
        },
      },

      'analytics.trackEvent': {
        description: 'Track a custom analytics event',
        parameters: {
          type: 'object',
          properties: {
            event: { type: 'string', description: 'Event name' },
            value: { type: 'number', description: 'Event value' },
          },
          required: ['event'],
        },
        execute: async (params: any) => {
          const current = this.metrics.get(params.event) || 0;
          this.metrics.set(params.event, current + (params.value || 1));
          return { success: true, event: params.event, value: this.metrics.get(params.event) };
        },
      },
    };
  }

  private onSessionCreated(event: any): void {
    this.metrics.set('sessions.created', (this.metrics.get('sessions.created') || 0) + 1);
  }

  private onMessageSent(event: any): void {
    this.metrics.set('messages.sent', (this.metrics.get('messages.sent') || 0) + 1);
  }
}
```

### Plugin Configuration

```typescript
// plugin.config.ts
export interface AnalyticsPluginConfig {
  trackingEnabled: boolean;
  retentionPeriod: number; // days
  exportFormat: 'json' | 'csv';
  autoExport: boolean;
  exportInterval: number; // hours
}

export const defaultConfig: AnalyticsPluginConfig = {
  trackingEnabled: true,
  retentionPeriod: 30,
  exportFormat: 'json',
  autoExport: false,
  exportInterval: 24,
};
```

### Plugin with Dependencies

```typescript
export class AdvancedAnalyticsPlugin implements Plugin {
  name = 'advanced-analytics';
  version = '1.0.0';
  description = 'Advanced analytics with ML capabilities';

  dependencies = ['custom-analytics', 'cache'];

  async initialize(context: PluginContext): Promise<void> {
    // Get dependency plugins
    const analyticsPlugin = context.getPlugin('custom-analytics');
    const cachePlugin = context.getPlugin('cache');

    // Use dependency services
    this.analyticsService = analyticsPlugin.getService();
    this.cacheService = cachePlugin.getService();
  }

  private analyticsService: any;
  private cacheService: any;

  getTools(): Record<string, Tool> {
    return {
      'analytics.predict': {
        description: 'Predict future trends based on historical data',
        parameters: {
          type: 'object',
          properties: {
            metric: { type: 'string', description: 'Metric to predict' },
            horizon: { type: 'number', description: 'Prediction horizon (days)' },
          },
          required: ['metric'],
        },
        execute: async (params: any) => {
          // Check cache first
          const cacheKey = `prediction:${params.metric}:${params.horizon}`;
          const cached = await this.cacheService.get(cacheKey);

          if (cached) {
            return cached;
          }

          // Get historical data
          const historical = await this.analyticsService.getMetrics(params.metric);

          // Perform prediction (simplified)
          const prediction = this.performSimplePrediction(historical, params.horizon);

          // Cache result
          await this.cacheService.set(cacheKey, prediction, 3600); // 1 hour

          return prediction;
        },
      },
    };
  }

  private performSimplePrediction(data: number[], horizon: number): any {
    // Simple linear regression for demonstration
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict future values
    const predictions = [];
    for (let i = 0; i < horizon; i++) {
      predictions.push(slope * (n + i) + intercept);
    }

    return {
      predictions,
      confidence: 0.8, // Simplified confidence score
      method: 'linear_regression',
    };
  }
}
```

## Plugin Management

### Loading Plugins

```typescript
import { PluginManager } from '@promethean-os/opencode-client';

const pluginManager = new PluginManager();

// Load built-in plugins
await pluginManager.loadPlugin(new AgentManagementPlugin());
await pluginManager.loadPlugin(new CachePlugin());
await pluginManager.loadPlugin(new EventsPlugin());
await pluginManager.loadPlugin(new SessionsPlugin());

// Load custom plugins
await pluginManager.loadPlugin(new CustomAnalyticsPlugin());
await pluginManager.loadPlugin(new AdvancedAnalyticsPlugin());

// Get all available tools
const allTools = pluginManager.getAllTools();
console.log('Available tools:', Object.keys(allTools));
```

### Plugin Configuration

```typescript
// Configure individual plugins
await pluginManager.configurePlugin('custom-analytics', {
  trackingEnabled: true,
  retentionPeriod: 60,
  exportFormat: 'json',
  autoExport: true,
  exportInterval: 12,
});

// Configure multiple plugins
await pluginManager.configurePlugins({
  'custom-analytics': { trackingEnabled: true },
  cache: { maxSize: 1000, ttl: 3600 },
  events: { bufferSize: 5000 },
});
```

### Plugin Lifecycle Management

```typescript
// Unload a plugin
await pluginManager.unloadPlugin('custom-analytics');

// Reload a plugin (useful for development)
await pluginManager.reloadPlugin('custom-analytics');

// Get plugin status
const status = pluginManager.getPluginStatus();
console.log('Plugin status:', status);

// Get specific plugin info
const pluginInfo = pluginManager.getPlugin('custom-analytics');
console.log('Plugin info:', {
  name: pluginInfo.name,
  version: pluginInfo.version,
  status: pluginInfo.status,
  tools: Object.keys(pluginInfo.getTools()),
});
```

## Tool Execution

### Direct Tool Execution

```typescript
// Execute a tool directly
const result = await pluginManager.executeTool('analytics.getMetrics', {
  metric: 'sessions.created',
});

console.log('Sessions created:', result);
```

### Tool with Context

```typescript
// Execute tool with additional context
const contextResult = await pluginManager.executeTool(
  'agent.createSession',
  {
    task: 'Analyze user behavior patterns',
    message: 'Focus on authentication and session management',
    options: {
      title: 'User Behavior Analysis',
      priority: 'high',
    },
  },
  {
    userId: 'user-123',
    requestId: 'req-456',
    timeout: 30000,
  },
);
```

### Batch Tool Execution

```typescript
// Execute multiple tools in parallel
const batchResults = await pluginManager.executeTools([
  {
    tool: 'analytics.getMetrics',
    parameters: { metric: 'sessions.created' },
  },
  {
    tool: 'analytics.getMetrics',
    parameters: { metric: 'messages.sent' },
  },
  {
    tool: 'agent.listSessions',
    parameters: { limit: 10 },
  },
]);

console.log('Batch results:', batchResults);
```

## Event System

### Plugin Events

```typescript
export class EventDrivenPlugin implements Plugin {
  name = 'event-driven';
  version = '1.0.0';

  async initialize(context: PluginContext): Promise<void> {
    // Subscribe to system events
    context.events.on('session.created', this.handleSessionCreated.bind(this));
    context.events.on('session.closed', this.handleSessionClosed.bind(this));

    // Subscribe to plugin events
    context.events.on('tool.executed', this.handleToolExecuted.bind(this));

    // Emit custom events
    context.events.emit('plugin.initialized', {
      plugin: this.name,
      timestamp: Date.now(),
    });
  }

  private handleSessionCreated(event: any): void {
    console.log(`New session created: ${event.sessionId}`);

    // Emit custom analytics event
    this.context?.events.emit('analytics.session_created', {
      sessionId: event.sessionId,
      timestamp: event.timestamp,
    });
  }

  private handleSessionClosed(event: any): void {
    console.log(`Session closed: ${event.sessionId}`);

    // Calculate session duration
    const duration = Date.now() - event.createdAt;

    this.context?.events.emit('analytics.session_duration', {
      sessionId: event.sessionId,
      duration,
      timestamp: Date.now(),
    });
  }

  private handleToolExecuted(event: any): void {
    console.log(`Tool executed: ${event.tool} in ${event.duration}ms`);

    // Track tool usage
    this.context?.events.emit('analytics.tool_usage', {
      tool: event.tool,
      duration: event.duration,
      success: event.success,
      timestamp: Date.now(),
    });
  }

  private context?: PluginContext;
}
```

### Cross-Plugin Communication

```typescript
// Plugin A emits events
export class DataProducerPlugin implements Plugin {
  name = 'data-producer';

  async initialize(context: PluginContext): Promise<void> {
    // Produce data periodically
    setInterval(() => {
      const data = this.generateData();

      // Emit data event for other plugins
      context.events.emit('data.produced', {
        source: 'data-producer',
        data,
        timestamp: Date.now(),
      });
    }, 5000);
  }

  private generateData(): any {
    return {
      value: Math.random(),
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      timestamp: Date.now(),
    };
  }
}

// Plugin B consumes events
export class DataConsumerPlugin implements Plugin {
  name = 'data-consumer';
  private consumedData: any[] = [];

  async initialize(context: PluginContext): Promise<void> {
    // Subscribe to data events
    context.events.on('data.produced', this.handleDataProduced.bind(this));
  }

  private handleDataProduced(event: any): void {
    console.log('Consuming data:', event.data);
    this.consumedData.push(event.data);

    // Keep only last 100 items
    if (this.consumedData.length > 100) {
      this.consumedData.shift();
    }
  }

  getTools(): Record<string, Tool> {
    return {
      'consumer.getStats': {
        description: 'Get consumption statistics',
        parameters: {},
        execute: async () => ({
          totalConsumed: this.consumedData.length,
          latestValue: this.consumedData[this.consumedData.length - 1],
          averageValue:
            this.consumedData.reduce((sum, item) => sum + item.value, 0) / this.consumedData.length,
        }),
      },
    };
  }
}
```

## Advanced Features

### Plugin Hot Reloading

```typescript
// Enable hot reloading for development
const pluginManager = new PluginManager({
  hotReload: true,
  watchPaths: ['./plugins'],
  reloadDelay: 1000,
});

// Watch for file changes and reload plugins
pluginManager.on('plugin.reloaded', (pluginName: string) => {
  console.log(`Plugin ${pluginName} reloaded`);
});

// Manual reload
await pluginManager.reloadPlugin('custom-analytics');
```

### Plugin Sandboxing

```typescript
// Create sandboxed plugin environment
const sandboxedPlugin = new SandboxedPlugin({
  name: 'untrusted-plugin',
  code: pluginCode,
  permissions: {
    fileSystem: false,
    network: ['api.example.com'],
    events: ['session.created', 'message.sent'],
  },
  resources: {
    memory: '100MB',
    cpu: '50%',
  },
});

await pluginManager.loadPlugin(sandboxedPlugin);
```

### Plugin Metrics and Monitoring

```typescript
// Enable plugin monitoring
const pluginManager = new PluginManager({
  monitoring: {
    enabled: true,
    metricsInterval: 60000, // 1 minute
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 1000, // 1 second
      memoryUsage: 0.8, // 80%
    },
  },
});

// Get plugin metrics
const metrics = pluginManager.getPluginMetrics();
console.log('Plugin metrics:', metrics);

// Get health status
const health = await pluginManager.healthCheck();
console.log('Plugin health:', health);
```

## Best Practices

### 1. Plugin Design

```typescript
// ✅ Good: Single responsibility, clear interface
export class FocusedPlugin implements Plugin {
  name = 'focused-analytics';

  getTools(): Record<string, Tool> {
    return {
      'focused.singleOperation': {
        description: 'Does one thing well',
        execute: async () => ({ result: 'success' }),
      },
    };
  }
}

// ❌ Poor: Multiple responsibilities, unclear purpose
export class MonolithPlugin implements Plugin {
  name = 'monolith';

  getTools(): Record<string, Tool> {
    return {
      'monolith.analytics': {
        /* ... */
      },
      'monolith.cache': {
        /* ... */
      },
      'monolith.auth': {
        /* ... */
      },
      'monolith.database': {
        /* ... */
      },
    };
  }
}
```

### 2. Error Handling

```typescript
export class RobustPlugin implements Plugin {
  name = 'robust-plugin';

  getTools(): Record<string, Tool> {
    return {
      'robust.operation': {
        description: 'Operation with proper error handling',
        execute: async (params: any) => {
          try {
            const result = await this.performOperation(params);
            return { success: true, data: result };
          } catch (error) {
            console.error('Operation failed:', error);
            return {
              success: false,
              error: error.message,
              code: 'OPERATION_FAILED',
            };
          }
        },
      },
    };
  }

  private async performOperation(params: any): Promise<any> {
    // Implementation with validation
    if (!params.required) {
      throw new Error('Required parameter missing');
    }

    // Perform operation
    return { processed: true };
  }
}
```

### 3. Resource Management

```typescript
export class EfficientPlugin implements Plugin {
  name = 'efficient-plugin';
  private cache = new Map();
  private timers: NodeJS.Timeout[] = [];

  async initialize(context: PluginContext): Promise<void> {
    // Set up cleanup timer
    const cleanupTimer = setInterval(() => {
      this.cleanupCache();
    }, 60000);

    this.timers.push(cleanupTimer);
  }

  async shutdown(): Promise<void> {
    // Clean up resources
    this.timers.forEach((timer) => clearInterval(timer));
    this.cache.clear();
  }

  private cleanupCache(): void {
    // Remove old entries
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > 300000) {
        // 5 minutes
        this.cache.delete(key);
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Plugin Loading Failures**: Check dependencies and configuration
2. **Tool Execution Errors**: Validate parameters and error handling
3. **Memory Leaks**: Ensure proper cleanup in shutdown methods
4. **Event Storms**: Implement event throttling and debouncing

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG = 'plugin-system';

// Get detailed plugin information
const debugInfo = pluginManager.getDebugInfo();
console.log('Plugin debug info:', JSON.stringify(debugInfo, null, 2));
```

This guide provides comprehensive coverage of the Plugin System. For additional information, see the [API Reference](./api-reference.md) and [Development Guide](./development-guide.md).
