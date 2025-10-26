import type { Plugin, PluginContext, HookRegistration, HookResult, HookContext } from '../types.js';
import { PluginParityManager, type PluginParityConfig } from '../plugin-parity-manager.js';
import { EnhancedPluginManager } from '../enhanced-plugin-manager.js';

// Simple event bus implementation for demonstration
class SimpleEventBus {
  async publish<T>(
    topic: string,
    payload: T,
    _opts?: Record<string, unknown>,
  ): Promise<{ id: string; ts: number; topic: string; payload: T }> {
    console.log(`Event published: ${topic}`, payload);
    return { id: 'mock-id', ts: Date.now(), topic, payload };
  }

  async subscribe(
    _topic: string,
    _group: string,
    _handler: (event: any, _ctx: Record<string, unknown>) => Promise<void>,
    _opts?: Record<string, unknown>,
  ): Promise<() => Promise<void>> {
    console.log(`Subscription created: ${_topic} for group ${_group}`);
    return async () => console.log(`Subscription removed: ${_topic}`);
  }

  async ack(_topic: string, _group: string, _id: string): Promise<void> {
    // Mock implementation
  }

  async nack(_topic: string, _group: string, _id: string, _reason?: string): Promise<void> {
    // Mock implementation
  }

  async getCursor(_topic: string, _group: string): Promise<unknown> {
    return null;
  }

  async setCursor(_topic: string, _group: string, _cursor: unknown): Promise<void> {
    // Mock implementation
  }
}

/**
 * Example plugin demonstrating cross-platform parity capabilities
 */
export class CrossPlatformLoggerPlugin implements Plugin {
  metadata = {
    name: 'cross-platform-logger',
    version: '1.0.0',
    description: 'Cross-platform logging plugin with parity support',
    dependencies: [],
    hooks: ['log.info', 'log.warn', 'log.error', 'platform.detected'],
  };

  private context?: PluginContext;
  private currentPlatform?: string;
  private logs: Array<{ timestamp: number; level: string; message: string; platform: string }> = [];

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.currentPlatform = this.detectPlatform();

    console.log(`Cross-platform logger plugin initialized for ${this.currentPlatform}`);

    // Publish platform detection event
    await this.context.eventBus.publish('platform.detected', {
      platform: this.currentPlatform,
      capabilities: this.getPlatformCapabilities(),
    });
  }

  async destroy(): Promise<void> {
    console.log(`Cross-platform logger plugin destroyed. Logged ${this.logs.length} entries.`);
    this.logs = [];
  }

  getHooks(): HookRegistration[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'log.info',
        handler: this.handleInfoLog.bind(this) as any,
        priority: 10,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'log.warn',
        handler: this.handleWarnLog.bind(this) as any,
        priority: 10,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'log.error',
        handler: this.handleErrorLog.bind(this) as any,
        priority: 20, // Higher priority for errors
      },
    ];
  }

  private detectPlatform(): string {
    if (typeof process !== 'undefined' && process.versions?.node) {
      return 'node';
    }
    if (typeof navigator !== 'undefined') {
      return 'browser';
    }
    // Check for Deno and Bun safely
    if (typeof globalThis !== 'undefined') {
      const g = globalThis as any;
      if (g.Deno) {
        return 'deno';
      }
      if (g.Bun) {
        return 'bun';
      }
    }
    return 'unknown';
  }

  private getPlatformCapabilities(): string[] {
    const capabilities: string[] = [];

    if (typeof process !== 'undefined') {
      capabilities.push('process', 'filesystem', 'network');
    }
    if (typeof navigator !== 'undefined') {
      capabilities.push('dom', 'fetch', 'storage');
    }
    if (typeof window !== 'undefined' && window.Worker) {
      capabilities.push('webworkers');
    }

    return capabilities;
  }

  private handleInfoLog(
    data: { message: string; metadata?: any },
    _context: HookContext,
  ): HookResult<void> {
    this.addLog('info', data.message, data.metadata);
    console.log(`[${this.currentPlatform}] INFO: ${data.message}`);
    return { success: true };
  }

  private handleWarnLog(
    data: { message: string; metadata?: any },
    _context: HookContext,
  ): HookResult<void> {
    this.addLog('warn', data.message, data.metadata);
    console.warn(`[${this.currentPlatform}] WARN: ${data.message}`);
    return { success: true };
  }

  private handleErrorLog(
    data: { message: string; error?: Error; metadata?: any },
    _context: HookContext,
  ): HookResult<void> {
    this.addLog('error', data.message, { ...data.metadata, error: data.error?.stack });
    console.error(`[${this.currentPlatform}] ERROR: ${data.message}`);
    return { success: true };
  }

  private addLog(level: string, message: string, _metadata?: any): void {
    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      platform: this.currentPlatform!,
    };
    this.logs.push(logEntry);

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  getLogs(
    level?: string,
  ): Array<{ timestamp: number; level: string; message: string; platform: string }> {
    return level ? this.logs.filter((log) => log.level === level) : [...this.logs];
  }

  getCurrentPlatform(): string | undefined {
    return this.currentPlatform;
  }
}

/**
 * Example demonstrating plugin parity setup and usage
 */
export async function demonstratePluginParity(): Promise<void> {
  console.log('=== Plugin Parity Demonstration ===\n');

  // Create event bus and plugin manager
  const eventBus = new SimpleEventBus();
  const pluginManager = new EnhancedPluginManager(eventBus, {
    enableHookLogging: true,
  });

  // Create plugin parity manager
  const parityConfig: PluginParityConfig = {
    enableCrossPlatform: true,
    enableSandboxing: true,
    enableVersionChecks: true,
    enableMigration: true,
    targetPlatforms: [
      { name: 'node', version: '18.0.0', capabilities: ['filesystem', 'network', 'process'] },
      { name: 'browser', version: '1.0.0', capabilities: ['dom', 'fetch', 'storage'] },
      { name: 'deno', version: '1.0.0', capabilities: ['filesystem', 'network', 'typescript'] },
    ],
  };

  const parityManager = new PluginParityManager(pluginManager, eventBus, parityConfig);

  try {
    // Create and load the cross-platform logger plugin
    const loggerPlugin = new CrossPlatformLoggerPlugin();
    await pluginManager.loadPlugin(loggerPlugin);

    console.log('1. Plugin loaded successfully');
    console.log(`   Current platform: ${loggerPlugin.getCurrentPlatform()}`);

    // Test logging functionality
    await pluginManager.executeHook('log.info', {
      message: 'System started',
      metadata: { component: 'system' },
    });

    await pluginManager.executeHook('log.warn', {
      message: 'High memory usage detected',
      metadata: { memory: '85%' },
    });

    await pluginManager.executeHook('log.error', {
      message: 'Database connection failed',
      error: new Error('Connection timeout'),
      metadata: { database: 'postgres' },
    });

    console.log('\n2. Logging hooks executed');
    const logs = loggerPlugin.getLogs();
    console.log(`   Total logs: ${logs.length}`);
    logs.forEach((log) => {
      console.log(`   [${log.level.toUpperCase()}] ${log.message} (${log.platform})`);
    });

    // Check compatibility across platforms
    console.log('\n3. Checking platform compatibility...');
    const compatibilityResults = await parityManager.checkCompatibility(loggerPlugin);

    compatibilityResults.forEach((result) => {
      console.log(`   Platform: ${result.platform}`);
      console.log(`   Compatible: ${result.compatible}`);
      if (result.issues.length > 0) {
        console.log(`   Issues: ${result.issues.join(', ')}`);
      }
      if (result.warnings.length > 0) {
        console.log(`   Warnings: ${result.warnings.join(', ')}`);
      }
    });

    // Setup sandbox for the plugin
    console.log('\n4. Setting up plugin sandbox...');
    await parityManager.setupPluginSandbox('cross-platform-logger', {
      enabled: true,
      memoryLimit: 50 * 1024 * 1024, // 50MB
      executionTimeout: 5000, // 5 seconds
      allowNetworkAccess: true,
      allowFileSystemAccess: false,
    });

    // Execute in sandbox
    await parityManager.executeInSandbox('cross-platform-logger', 'log.info', {
      message: 'Sandboxed log entry',
    });

    console.log('   Sandbox execution completed');

    // Demonstrate plugin migration (simulation)
    console.log('\n5. Demonstrating plugin migration...');
    const migrationResult = await parityManager.migratePlugin('cross-platform-logger', 'browser');

    console.log(`   Migration success: ${migrationResult.success}`);
    console.log(`   From: ${migrationResult.fromPlatform}`);
    console.log(`   To: ${migrationResult.toPlatform}`);
    if (migrationResult.warnings && migrationResult.warnings.length > 0) {
      console.log(`   Warnings: ${migrationResult.warnings.join(', ')}`);
    }

    // Get parity statistics
    console.log('\n6. Plugin Parity Statistics:');
    const supportedPlatforms = parityManager.getSupportedPlatforms();
    console.log(`   Supported platforms: ${supportedPlatforms.map((p) => p.name).join(', ')}`);

    const pluginStats = pluginManager.getPluginStats();
    console.log(`   Loaded plugins: ${pluginStats.loaded}`);
    console.log(
      `   Total hooks: ${pluginStats.plugins.reduce((sum, p) => sum + p.hooks.length, 0)}`,
    );
  } catch (error) {
    console.error('Error during plugin parity demonstration:', error);
  } finally {
    // Cleanup
    await parityManager.destroy();
    await pluginManager.destroy();
    console.log('\n=== Plugin Parity Demonstration Complete ===');
  }
}

/**
 * Example of creating a platform-specific plugin adapter
 */
export class PlatformAdapterPlugin implements Plugin {
  metadata = {
    name: 'platform-adapter',
    version: '1.0.0',
    description: 'Platform adapter plugin for cross-platform compatibility',
    dependencies: [],
    hooks: ['platform.adapt', 'api.call'],
  };

  private targetPlatform?: string;

  async initialize(_context: PluginContext): Promise<void> {
    this.targetPlatform = this.detectTargetPlatform();
    console.log(`Platform adapter initialized for ${this.targetPlatform}`);
  }

  async destroy(): Promise<void> {
    console.log('Platform adapter destroyed');
  }

  getHooks(): HookRegistration[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'platform.adapt',
        handler: this.handlePlatformAdaptation.bind(this) as any,
        priority: 50,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'api.call',
        handler: this.handleApiCall.bind(this) as any,
        priority: 10,
      },
    ];
  }

  private detectTargetPlatform(): string {
    // In a real implementation, this would detect the target platform
    return 'node'; // Default to Node.js for this example
  }

  private handlePlatformAdaptation(
    data: { api: string; params: any; originalPlatform: string },
    _context: HookContext,
  ): HookResult<{ adaptedApi: string; adaptedParams: any; targetPlatform: string }> {
    const { api, params } = data;

    // Adapt API calls based on target platform
    let adaptedApi = api;
    let adaptedParams = { ...params };

    switch (this.targetPlatform) {
      case 'browser':
        adaptedApi = this.adaptForBrowser(api);
        adaptedParams = this.adaptParamsForBrowser(params);
        break;
      case 'node':
        adaptedApi = this.adaptForNode(api);
        adaptedParams = this.adaptParamsForNode(params);
        break;
      case 'deno':
        adaptedApi = this.adaptForDeno(api);
        adaptedParams = this.adaptParamsForDeno(params);
        break;
    }

    return {
      success: true,
      data: {
        adaptedApi,
        adaptedParams,
        targetPlatform: this.targetPlatform!,
      },
    };
  }

  private handleApiCall(
    data: { method: string; url: string; data?: any },
    _context: HookContext,
  ): HookResult<any> {
    // Platform-specific API call handling
    console.log(`Making ${data.method} call to ${data.url} on ${this.targetPlatform}`);

    // This would implement actual platform-specific API calls
    return {
      success: true,
      data: { status: 'success', platform: this.targetPlatform },
    };
  }

  private adaptForBrowser(api: string): string {
    // Browser-specific adaptations
    if (api.startsWith('fs.')) {
      return `localStorage.${api.substring(3)}`;
    }
    if (api.startsWith('http.')) {
      return `fetch.${api.substring(5)}`;
    }
    return api;
  }

  private adaptForNode(api: string): string {
    // Node.js-specific adaptations
    if (api.startsWith('localStorage.')) {
      return `fs.${api.substring(12)}`;
    }
    if (api.startsWith('fetch.')) {
      return `http.${api.substring(6)}`;
    }
    return api;
  }

  private adaptForDeno(api: string): string {
    // Deno-specific adaptations
    if (api.startsWith('fs.')) {
      return `Deno.${api.substring(3)}`;
    }
    return api;
  }

  private adaptParamsForBrowser(params: any): any {
    // Browser-specific parameter adaptations
    return { ...params, platform: 'browser' };
  }

  private adaptParamsForNode(params: any): any {
    // Node.js-specific parameter adaptations
    return { ...params, platform: 'node' };
  }

  private adaptParamsForDeno(params: any): any {
    // Deno-specific parameter adaptations
    return { ...params, platform: 'deno' };
  }
}

// Export for use in demonstrations
export { CrossPlatformLoggerPlugin as default };
