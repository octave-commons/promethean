import type {
  Plugin,
  PluginManager,
  PluginContext,
  PluginName,
  HookRegistry,
  EventBus,
  HookRegistration,
  HookContext,
  PluginHooksConfig,
} from './types.js';
import { DefaultHookRegistry } from './hook-registry.js';

export class DefaultPluginManager implements PluginManager {
  private plugins = new Map<PluginName, Plugin>();
  private hookRegistry: HookRegistry;
  private eventBus: EventBus;
  private config: PluginHooksConfig;

  constructor(eventBus: EventBus, config: PluginHooksConfig = {}) {
    this.eventBus = eventBus;
    this.hookRegistry = new DefaultHookRegistry();
    this.config = {
      autoLoad: true,
      hookTimeout: 30000,
      maxConcurrentHooks: 10,
      enableHookLogging: false,
      ...config,
    };
  }

  async loadPlugin(plugin: Plugin): Promise<void> {
    const { metadata } = plugin;

    // Check if plugin is already loaded
    if (this.plugins.has(metadata.name)) {
      throw new Error(`Plugin ${metadata.name} is already loaded`);
    }

    // Check dependencies
    if (metadata.dependencies) {
      for (const dep of metadata.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${metadata.name} requires ${dep} which is not loaded`);
        }
      }
    }

    // Create plugin context
    const context: PluginContext = {
      eventBus: this.eventBus,
      hookRegistry: this.hookRegistry,
      registerHook: this.registerHook.bind(this),
      unregisterHook: this.unregisterHook.bind(this),
    };

    // Initialize plugin
    if (plugin.initialize) {
      await plugin.initialize(context);
    }

    // Register plugin hooks
    if (plugin.getHooks) {
      const hooks = plugin.getHooks();
      for (const hook of hooks) {
        this.hookRegistry.register(hook);
      }
    }

    // Store plugin
    this.plugins.set(metadata.name, plugin);

    if (this.config.enableHookLogging) {
      console.log(`Plugin ${metadata.name} v${metadata.version} loaded successfully`);
    }
  }

  async unloadPlugin(pluginName: PluginName): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not loaded`);
    }

    // Unregister all hooks for this plugin
    const hooks = this.hookRegistry.getRegisteredHooks();
    for (const hook of hooks) {
      if (hook.pluginName === pluginName) {
        this.hookRegistry.unregister(pluginName, hook.hookName);
      }
    }

    // Call plugin destroy
    if (plugin.destroy) {
      await plugin.destroy();
    }

    // Remove from registry
    this.plugins.delete(pluginName);

    if (this.config.enableHookLogging) {
      console.log(`Plugin ${pluginName} unloaded successfully`);
    }
  }

  getPlugin(name: PluginName): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  isLoaded(name: PluginName): boolean {
    return this.plugins.has(name);
  }

  async executeHook<T, R>(hookName: string, data: T, context?: Partial<HookContext>): Promise<R[]> {
    if (this.config.enableHookLogging) {
      console.log(`Executing hook: ${hookName}`);
    }

    const startTime = Date.now();

    try {
      const results = await Promise.race([
        this.hookRegistry.execute<T, R>(hookName, data, context),
        this.createTimeoutPromise(this.config.hookTimeout!),
      ]);

      const duration = Date.now() - startTime;
      if (this.config.enableHookLogging) {
        console.log(`Hook ${hookName} completed in ${duration}ms with ${results.length} results`);
      }

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (this.config.enableHookLogging) {
        console.error(`Hook ${hookName} failed after ${duration}ms:`, error);
      }
      throw error;
    }
  }

  private registerHook<T, R>(registration: HookRegistration<T, R>): void {
    this.hookRegistry.register(registration);
  }

  private unregisterHook(pluginName: PluginName, hookName: string): void {
    this.hookRegistry.unregister(pluginName, hookName);
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Hook execution timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  getHookRegistry(): HookRegistry {
    return this.hookRegistry;
  }

  getConfig(): PluginHooksConfig {
    return { ...this.config };
  }
}
