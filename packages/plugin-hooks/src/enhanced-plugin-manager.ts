import type {
  EventBus,
  Plugin,
  PluginManager,
  PluginName,
  PluginHooksConfig,
  HookRegistry,
  HookContext,
} from './types.js';
import { DefaultPluginManager } from './plugin-manager.js';
import { EventDrivenHookManager, type EventDrivenHookConfig } from './event-driven-hooks.js';

/**
 * Enhanced plugin manager with event-driven capabilities
 */
export class EnhancedPluginManager implements PluginManager {
  private baseManager: DefaultPluginManager;
  private eventDrivenManager: EventDrivenHookManager;

  constructor(eventBus: EventBus, config: PluginHooksConfig & EventDrivenHookConfig = {}) {
    this.baseManager = new DefaultPluginManager(eventBus, config);
    this.eventDrivenManager = new EventDrivenHookManager(
      eventBus,
      this.baseManager,
      this.baseManager.getHookRegistry(),
      config,
    );
  }

  /**
   * Load a plugin with event-driven capabilities
   */
  async loadPlugin(plugin: Plugin): Promise<void> {
    // Load the plugin using the base manager
    await this.baseManager.loadPlugin(plugin);

    // Register event-driven hooks if the plugin provides them
    if (plugin.getHooks) {
      const hooks = plugin.getHooks();
      for (const hook of hooks) {
        await this.eventDrivenManager.registerEventDrivenHook(hook);
      }
    }

    // Publish plugin loaded event
    await this.publishPluginEvent('loaded', plugin.metadata.name, {
      version: plugin.metadata.version,
      description: plugin.metadata.description,
      hooks: plugin.metadata.hooks || [],
    });
  }

  /**
   * Unload a plugin with cleanup
   */
  async unloadPlugin(pluginName: PluginName): Promise<void> {
    const plugin = this.baseManager.getPlugin(pluginName);

    // Publish plugin unloading event
    await this.publishPluginEvent('unloading', pluginName, {
      version: plugin?.metadata.version,
    });

    // Unload using base manager
    await this.baseManager.unloadPlugin(pluginName);

    // Publish plugin unloaded event
    await this.publishPluginEvent('unloaded', pluginName);
  }

  /**
   * Execute a hook with event-driven features
   */
  async executeHook<T, R>(hookName: string, data: T, context?: Partial<HookContext>): Promise<R[]> {
    return this.eventDrivenManager.executeHook<T, R>(hookName, data, context);
  }

  /**
   * Trigger a hook execution via event
   */
  async triggerHook(
    hookName: string,
    data: unknown,
    triggeredBy: string,
    context?: Partial<HookContext>,
  ): Promise<void> {
    return this.eventDrivenManager.triggerHookViaEvent(hookName, data, triggeredBy, context);
  }

  /**
   * Get plugin from base manager
   */
  getPlugin(name: PluginName): Plugin | undefined {
    return this.baseManager.getPlugin(name);
  }

  /**
   * Get all plugins from base manager
   */
  getAllPlugins(): Plugin[] {
    return this.baseManager.getAllPlugins();
  }

  /**
   * Check if plugin is loaded
   */
  isLoaded(name: PluginName): boolean {
    return this.baseManager.isLoaded(name);
  }

  /**
   * Get hook registry from base manager
   */
  getHookRegistry(): HookRegistry {
    return this.baseManager.getHookRegistry();
  }

  /**
   * Get configuration from base manager
   */
  getConfig(): PluginHooksConfig {
    return this.baseManager.getConfig();
  }

  /**
   * Get event-driven configuration
   */
  getEventDrivenConfig(): EventDrivenHookConfig {
    return this.eventDrivenManager.getConfig();
  }

  /**
   * Get hook execution statistics
   */
  async getHookStats(
    hookName?: string,
    timeRange?: { start: number; end: number },
  ): Promise<{
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    errorCount: number;
  }> {
    return this.eventDrivenManager.getHookStats(hookName, timeRange);
  }

  /**
   * Get plugin statistics
   */
  getPluginStats(): {
    total: number;
    loaded: number;
    plugins: Array<{
      name: string;
      version: string;
      hooks: string[];
      loadedAt: Date;
    }>;
  } {
    const plugins = this.getAllPlugins().map((plugin) => ({
      name: plugin.metadata.name,
      version: plugin.metadata.version,
      hooks: plugin.metadata.hooks || [],
      loadedAt: new Date(), // This should be tracked properly
    }));

    return {
      total: plugins.length,
      loaded: plugins.length,
      plugins,
    };
  }

  /**
   * Reload a plugin
   */
  async reloadPlugin(pluginName: PluginName): Promise<void> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not loaded`);
    }

    await this.publishPluginEvent('reloading', pluginName, {
      version: plugin.metadata.version,
    });

    await this.unloadPlugin(pluginName);
    await this.loadPlugin(plugin);

    await this.publishPluginEvent('reloaded', pluginName, {
      version: plugin.metadata.version,
    });
  }

  /**
   * Enable/disable a plugin's hooks
   */
  async togglePluginHooks(pluginName: PluginName, enabled: boolean): Promise<void> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not loaded`);
    }

    const hookRegistry = this.getHookRegistry();
    const hooks = hookRegistry
      .getRegisteredHooks()
      .filter((hook) => hook.pluginName === pluginName);

    if (enabled) {
      // Re-register hooks
      for (const hook of hooks) {
        await this.eventDrivenManager.registerEventDrivenHook(hook);
      }
    } else {
      // Unregister hooks
      for (const hook of hooks) {
        hookRegistry.unregister(pluginName, hook.hookName);
      }
    }

    await this.publishPluginEvent(enabled ? 'hooks_enabled' : 'hooks_disabled', pluginName, {
      hookCount: hooks.length,
    });
  }

  /**
   * Publish plugin lifecycle events
   */
  private async publishPluginEvent(
    action:
      | 'loaded'
      | 'unloading'
      | 'unloaded'
      | 'reloading'
      | 'reloaded'
      | 'hooks_enabled'
      | 'hooks_disabled',
    pluginName: PluginName,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    // This would publish to the event bus
    // Implementation depends on the specific event bus being used
    console.log(`Plugin event: ${action} for ${pluginName}`, metadata);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    // Unload all plugins
    const plugins = this.getAllPlugins();
    for (const plugin of plugins) {
      try {
        await this.unloadPlugin(plugin.metadata.name);
      } catch (error) {
        console.error(`Error unloading plugin ${plugin.metadata.name}:`, error);
      }
    }

    // Cleanup event-driven manager
    await this.eventDrivenManager.destroy();
  }
}
