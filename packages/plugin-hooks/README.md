# @promethean/plugin-hooks

A sophisticated event-driven plugin hooks architecture for the Promethean framework, providing a robust foundation for extensible and maintainable plugin systems.

## 🌟 Features

- **Event-Driven Architecture**: Built on top of a powerful event bus system for decoupled communication
- **Priority-Based Hook Execution**: Control the order of hook execution with configurable priorities
- **Plugin Lifecycle Management**: Complete plugin lifecycle from initialization to destruction
- **Cross-Platform Compatibility**: Works seamlessly across Node.js, Browser, Deno, and Bun environments
- **Comprehensive Security**: Built-in sandboxing, policy enforcement, and audit logging
- **Plugin Discovery**: Automatic plugin discovery and loading from filesystem
- **Development SDK**: Rich SDK with utilities for logging, configuration, storage, and HTTP
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Zero-Downtime Reloading**: Hot reload plugins without stopping the application

## 📦 Installation

```bash
pnpm add @promethean/plugin-hooks
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { HookRegistry, PluginManager, EventBus } from '@promethean/plugin-hooks';
import { LoggerPlugin } from '@promethean/plugin-hooks/examples/logger-plugin';

// Create an event bus (implementation depends on your event system)
const eventBus: EventBus = createEventBus();

// Create a hook registry
const hookRegistry = new HookRegistry();

// Create a plugin manager
const pluginManager = new PluginManager(eventBus, hookRegistry);

// Load a plugin
await pluginManager.loadPlugin(new LoggerPlugin());

// Execute hooks
const results = await pluginManager.executeHook('system.startup', 'Application starting');
```

### Enhanced Usage with Event-Driven Features

```typescript
import { EnhancedPluginManager } from '@promethean/plugin-hooks';
import { EventBus } from '@promethean/event';

const eventBus = new EventBus();
const pluginManager = new EnhancedPluginManager(eventBus, {
  autoLoad: true,
  hookTimeout: 5000,
  maxConcurrentHooks: 10,
  enableHookLogging: true,
});

// Load plugins with event-driven capabilities
await pluginManager.loadPlugin(new LoggerPlugin());

// Hooks can now be triggered by events
await eventBus.publish('system.startup', { message: 'Application starting' });
```

## 🏗️ Architecture

### Core Components

1. **HookRegistry**: Central registry for all hook registrations
2. **PluginManager**: Basic plugin lifecycle management
3. **EnhancedPluginManager**: Advanced plugin manager with event-driven features
4. **EventDrivenHookManager**: Manages event-driven hook execution
5. **SecurityManager**: Comprehensive security and sandboxing
6. **PluginLoader**: Plugin discovery and loading utilities
7. **PluginSDK**: Development utilities for plugin authors

### Plugin Lifecycle

```
Plugin Discovery → Validation → Initialization → Hook Registration → Active → Hook Execution → Destruction
```

### Event Flow

```
Event Published → Event Bus → Hook Manager → Hook Registry → Execute Hooks → Collect Results
```

## 📝 Plugin Development

### Creating a Basic Plugin

```typescript
import { Plugin, PluginContext, HookRegistration, HookResult } from '@promethean/plugin-hooks';

export class MyPlugin implements Plugin {
  metadata = {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My awesome plugin',
    hooks: ['system.startup', 'user.action'],
  };

  async initialize(context: PluginContext): Promise<void> {
    console.log('My plugin initialized');

    // Register hooks dynamically
    context.registerHook({
      pluginName: this.metadata.name,
      hookName: 'system.startup',
      handler: this.handleStartup.bind(this),
      priority: 10,
    });
  }

  async destroy(): Promise<void> {
    console.log('My plugin destroyed');
  }

  getHooks(): HookRegistration[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'user.action',
        handler: this.handleUserAction.bind(this),
        priority: 5,
      },
    ];
  }

  private handleStartup(data: string, context: HookContext): HookResult<void> {
    console.log(`Handling startup: ${data}`);
    return { success: true };
  }

  private handleUserAction(data: any, context: HookContext): HookResult<void> {
    console.log(`User action: ${JSON.stringify(data)}`);
    return { success: true };
  }
}
```

### Using the Plugin SDK

```typescript
import { PluginSDK } from '@promethean/plugin-hooks/sdk';
import { z } from 'zod';

export class AdvancedPlugin implements Plugin {
  metadata = {
    name: 'advanced-plugin',
    version: '1.0.0',
    description: 'Advanced plugin with SDK',
  };

  private sdk: PluginSDK;

  async initialize(context: PluginContext): Promise<void> {
    this.sdk = new PluginSDK(context);

    // Create hooks with validation
    const startupHook = this.sdk.createHook(
      'system.startup',
      (data: { message: string }) => {
        this.sdk.logger.info(`Startup: ${data.message}`);
        return { status: 'ok' };
      },
      {
        priority: 10,
        schema: {
          input: z.object({
            message: z.string(),
          }),
          output: z.object({
            status: z.string(),
          }),
        },
      },
    );

    context.registerHook(startupHook);
  }

  // ... rest of plugin implementation
}
```

## 🔒 Security Features

### Security Manager

```typescript
import { SecurityManager, SecurityPolicy } from '@promethean/plugin-hooks/security';

const securityManager = new SecurityManager({
  defaultPolicy: {
    allowNetworkAccess: false,
    allowFileSystemAccess: false,
    allowedModules: [],
    maxExecutionTime: 5000,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  },
  globalSettings: {
    maxViolationsPerPlugin: 5,
    autoBlockOnViolation: true,
    requireCodeSigning: false,
  },
  monitoring: {
    enableRealTimeMonitoring: true,
    violationAlertThreshold: 3,
  },
});

// Secure plugin loading
await securityManager.validatePlugin(plugin);
await securityManager.createSandbox(plugin);
```

### Plugin Sandboxing

```typescript
import { PluginSandbox, SecurityPolicy } from '@promethean/plugin-hooks/security';

const policy: SecurityPolicy = {
  allowNetworkAccess: true,
  allowedDomains: ['api.example.com'],
  allowFileSystemAccess: true,
  allowedPaths: ['/tmp/plugin-data'],
  maxExecutionTime: 10000,
  maxMemoryUsage: 100 * 1024 * 1024,
};

const sandbox = new PluginSandbox(policy);
const result = await sandbox.executePlugin(plugin, context);
```

## 🔧 Configuration

### Plugin Manager Configuration

```typescript
const config = {
  autoLoad: true, // Auto-load plugins from directory
  hookTimeout: 5000, // Hook execution timeout
  maxConcurrentHooks: 10, // Maximum concurrent hook executions
  enableHookLogging: true, // Enable hook execution logging
  pluginDirectory: './plugins', // Directory to scan for plugins
  enableHotReload: true, // Enable hot reload functionality
  security: {
    enabled: true,
    sandboxing: true,
    auditLogging: true,
  },
};
```

### Event-Driven Configuration

```typescript
const eventDrivenConfig = {
  enableEventDrivenHooks: true,
  eventTopics: {
    'system.startup': 'system.startup',
    'system.shutdown': 'system.shutdown',
    'user.action': 'user.action',
  },
  eventProcessing: {
    batchSize: 100,
    processingInterval: 1000,
    retryAttempts: 3,
    deadLetterQueue: true,
  },
};
```

## 🌐 Cross-Platform Support

### Platform-Specific Loading

```typescript
import { PluginLoader, PlatformAdapter } from '@promethean/plugin-hooks';

// Node.js
const nodeAdapter = new NodePlatformAdapter();
const loader = new PluginLoader(nodeAdapter);

// Browser
const browserAdapter = new BrowserPlatformAdapter();
const browserLoader = new PluginLoader(browserAdapter);

// Deno
const denoAdapter = new DenoPlatformAdapter();
const denoLoader = new PluginLoader(denoAdapter);

// Bun
const bunAdapter = new BunPlatformAdapter();
const bunLoader = new PluginLoader(bunAdapter);
```

### Plugin Parity Manager

```typescript
import { PluginParityManager } from '@promethean/plugin-hooks';

const parityManager = new PluginParityManager();

// Check plugin compatibility across platforms
const compatibility = await parityManager.checkCompatibility(plugin, ['node', 'browser', 'deno']);

// Get platform-specific adaptations
const adaptations = await parityManager.getAdaptations(plugin, 'browser');
```

## 📊 Monitoring and Metrics

### Hook Execution Metrics

```typescript
import { HookRegistry } from '@promethean/plugin-hooks';

const registry = new HookRegistry();

// Get execution metrics
const metrics = registry.getMetrics();
console.log(`Total hooks executed: ${metrics.totalExecutions}`);
console.log(`Average execution time: ${metrics.averageExecutionTime}ms`);
console.log(`Success rate: ${metrics.successRate}%`);

// Get metrics by hook name
const hookMetrics = registry.getHookMetrics('system.startup');
console.log(`Hook executions: ${hookMetrics.executions}`);
console.log(`Hook failures: ${hookMetrics.failures}`);
```

### Plugin Health Monitoring

```typescript
import { EnhancedPluginManager } from '@promethean/plugin-hooks';

const manager = new EnhancedPluginManager(eventBus);

// Get plugin health status
const health = await manager.getPluginHealth();
console.log(`Active plugins: ${health.activePlugins}`);
console.log(`Failed plugins: ${health.failedPlugins}`);
console.log(`Total hooks: ${health.totalHooks}`);
```

## 🧪 Testing

### Unit Testing Plugins

```typescript
import { test } from 'ava';
import { MockEventBus, MockHookRegistry } from '@promethean/plugin-hooks/test-utils';
import { MyPlugin } from './my-plugin';

test('MyPlugin initializes correctly', async (t) => {
  const eventBus = new MockEventBus();
  const registry = new MockHookRegistry();
  const plugin = new MyPlugin();

  await plugin.initialize({ eventBus, hookRegistry: registry });

  t.is(plugin.metadata.name, 'my-plugin');
  t.true(registry.hasHook('system.startup'));
});

test('MyPlugin handles startup hook', async (t) => {
  const eventBus = new MockEventBus();
  const registry = new MockHookRegistry();
  const plugin = new MyPlugin();

  await plugin.initialize({ eventBus, hookRegistry: registry });

  const results = await registry.execute('system.startup', 'test data');
  t.is(results.length, 1);
  t.true(results[0].success);
});
```

### Integration Testing

```typescript
import { test } from 'ava';
import { EnhancedPluginManager, EventBus } from '@promethean/plugin-hooks';
import { LoggerPlugin } from '@promethean/plugin-hooks/examples/logger-plugin';

test('Plugin manager loads and executes hooks', async (t) => {
  const eventBus = new EventBus();
  const manager = new EnhancedPluginManager(eventBus);

  await manager.loadPlugin(new LoggerPlugin());

  const results = await manager.executeHook('system.startup', 'test startup');
  t.is(results.length, 1);
  t.true(results[0].success);
});
```

## 📚 Examples

### Event-Driven Logger Plugin

```typescript
import { Plugin, PluginContext, HookRegistration, HookResult } from '@promethean/plugin-hooks';

export class EventDrivenLoggerPlugin implements Plugin {
  metadata = {
    name: 'event-driven-logger',
    version: '1.0.0',
    description: 'Event-driven logging plugin',
    hooks: ['system.startup', 'system.shutdown', 'error.occurred'],
  };

  private logs: Array<{ timestamp: number; level: string; message: string }> = [];

  async initialize(context: PluginContext): Promise<void> {
    // Subscribe to events
    await context.eventBus.subscribe(
      'system.startup',
      'logger',
      this.handleStartupEvent.bind(this),
    );
    await context.eventBus.subscribe(
      'system.shutdown',
      'logger',
      this.handleShutdownEvent.bind(this),
    );
    await context.eventBus.subscribe('error.occurred', 'logger', this.handleErrorEvent.bind(this));
  }

  private async handleStartupEvent(event: any, ctx: any): Promise<void> {
    this.logs.push({
      timestamp: Date.now(),
      level: 'info',
      message: `System startup: ${event.payload}`,
    });
  }

  private async handleShutdownEvent(event: any, ctx: any): Promise<void> {
    this.logs.push({
      timestamp: Date.now(),
      level: 'info',
      message: `System shutdown: ${event.payload}`,
    });
  }

  private async handleErrorEvent(event: any, ctx: any): Promise<void> {
    this.logs.push({
      timestamp: Date.now(),
      level: 'error',
      message: `Error occurred: ${event.payload.message}`,
    });
  }

  getLogs(): Array<{ timestamp: number; level: string; message: string }> {
    return this.logs;
  }
}
```

### Metrics Plugin

```typescript
import { Plugin, PluginContext, HookRegistration, HookResult } from '@promethean/plugin-hooks';

export class MetricsPlugin implements Plugin {
  metadata = {
    name: 'metrics',
    version: '1.0.0',
    description: 'Metrics collection plugin',
    hooks: ['request.start', 'request.end', 'error.occurred'],
  };

  private metrics: Map<string, number> = new Map();

  async initialize(context: PluginContext): Promise<void> {
    this.metrics.set('requestCount', 0);
    this.metrics.set('errorCount', 0);
    this.metrics.set('totalResponseTime', 0);
  }

  getHooks(): HookRegistration[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'request.start',
        handler: this.handleRequestStart.bind(this),
        priority: 1,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'request.end',
        handler: this.handleRequestEnd.bind(this),
        priority: 1,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'error.occurred',
        handler: this.handleError.bind(this),
        priority: 10,
      },
    ];
  }

  private handleRequestStart(
    data: { requestId: string; timestamp: number },
    context: HookContext,
  ): HookResult<void> {
    this.metrics.set('requestCount', (this.metrics.get('requestCount') || 0) + 1);
    return { success: true };
  }

  private handleRequestEnd(
    data: { requestId: string; duration: number },
    context: HookContext,
  ): HookResult<void> {
    this.metrics.set(
      'totalResponseTime',
      (this.metrics.get('totalResponseTime') || 0) + data.duration,
    );
    return { success: true };
  }

  private handleError(data: { error: Error }, context: HookContext): HookResult<void> {
    this.metrics.set('errorCount', (this.metrics.get('errorCount') || 0) + 1);
    return { success: true };
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

## 🔍 Best Practices

### Plugin Development

1. **Keep Plugins Focused**: Each plugin should have a single, well-defined responsibility
2. **Use Proper Error Handling**: Always handle errors gracefully and return appropriate HookResult objects
3. **Implement Cleanup**: Always implement the `destroy()` method to clean up resources
4. **Use the SDK**: Leverage the PluginSDK for common utilities and validation
5. **Test Thoroughly**: Write comprehensive tests for your plugins

### Security Considerations

1. **Use Sandboxing**: Always run plugins in sandboxes when dealing with untrusted code
2. **Validate Input**: Validate all input data using schemas
3. **Limit Resources**: Set appropriate limits on execution time and memory usage
4. **Audit Logging**: Enable audit logging for security-sensitive operations
5. **Regular Updates**: Keep security policies and dependencies up to date

### Performance Optimization

1. **Use Appropriate Priorities**: Set hook priorities based on execution order requirements
2. **Avoid Blocking Operations**: Use async/await for I/O operations
3. **Monitor Performance**: Regularly check hook execution metrics
4. **Use Batching**: Batch operations when possible to reduce overhead
5. **Cache Results**: Cache expensive operations when appropriate

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](../../CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/promethean/plugin-hooks.git
cd plugin-hooks

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build

# Run linting
pnpm lint
```

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](../../LICENSE.txt) file for details.

## 🙏 Acknowledgments

- Built on top of the amazing [Promethean framework](https://github.com/promethean/promethean)
- Inspired by modern plugin architectures in systems like WordPress, VS Code, and Kubernetes
- Powered by [Zod](https://zod.dev) for schema validation

## 📞 Support

For support, please:

1. Check the [documentation](../../docs/)
2. Search existing [issues](../../issues)
3. Create a new issue if needed

---

**Promethean Plugin Hooks** - Stealing fire from the gods to grant man the gift of extensible architectures.
