import type { EventBus, Plugin, EventRecord } from './types.js';
import { EnhancedPluginManager } from './enhanced-plugin-manager.js';

/**
 * Platform definition for plugin parity
 */
export interface Platform {
  name: string;
  version: string;
  capabilities: string[];
  constraints?: Record<string, any>;
}

/**
 * Plugin parity configuration
 */
export interface PluginParityConfig {
  /** Enable cross-platform plugin compatibility */
  enableCrossPlatform?: boolean;
  /** Platforms to target for parity */
  targetPlatforms?: Platform[];
  /** Enable plugin sandboxing */
  enableSandboxing?: boolean;
  /** Enable plugin version compatibility checks */
  enableVersionChecks?: boolean;
  /** Enable plugin migration between platforms */
  enableMigration?: boolean;
  /** Event topics for plugin parity */
  parityEventTopic?: string;
}

/**
 * Plugin migration result
 */
export interface PluginMigrationResult {
  success: boolean;
  fromPlatform: string;
  toPlatform: string;
  pluginName: string;
  issues?: string[];
  warnings?: string[];
  migratedPlugin?: Plugin;
}

/**
 * Plugin compatibility check result
 */
export interface PluginCompatibilityResult {
  compatible: boolean;
  platform: string;
  pluginName: string;
  issues: string[];
  warnings: string[];
  requiredChanges?: string[];
}

/**
 * Plugin sandbox configuration
 */
export interface PluginSandboxConfig {
  enabled: boolean;
  allowedModules?: string[];
  deniedModules?: string[];
  memoryLimit?: number;
  executionTimeout?: number;
  allowNetworkAccess?: boolean;
  allowFileSystemAccess?: boolean;
}

/**
 * Event-driven plugin parity manager
 */
export class PluginParityManager {
  private config: Required<PluginParityConfig>;
  private platforms: Map<string, Platform> = new Map();
  private sandboxConfigs: Map<string, PluginSandboxConfig> = new Map();
  private compatibilityCache: Map<string, PluginCompatibilityResult> = new Map();

  constructor(
    private pluginManager: EnhancedPluginManager,
    private eventBus: EventBus,
    config: PluginParityConfig = {},
  ) {
    this.config = {
      enableCrossPlatform: true,
      targetPlatforms: [],
      enableSandboxing: false,
      enableVersionChecks: true,
      enableMigration: true,
      parityEventTopic: 'plugin.parity',
      ...config,
    };

    this.initializeDefaultPlatforms();
    this.setupEventSubscriptions();
  }

  /**
   * Initialize default platform definitions
   */
  private initializeDefaultPlatforms(): void {
    const defaultPlatforms: Platform[] = [
      {
        name: 'node',
        version: process.version,
        capabilities: ['filesystem', 'network', 'process', 'cluster'],
        constraints: {
          moduleSystem: 'esm',
          runtime: 'node',
        },
      },
      {
        name: 'browser',
        version: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        capabilities: ['dom', 'fetch', 'webworkers', 'storage'],
        constraints: {
          moduleSystem: 'esm',
          runtime: 'browser',
        },
      },
      {
        name: 'deno',
        version: '1.0.0', // Would be detected at runtime
        capabilities: ['filesystem', 'network', 'webworkers', 'typescript'],
        constraints: {
          moduleSystem: 'esm',
          runtime: 'deno',
        },
      },
      {
        name: 'bun',
        version: '1.0.0', // Would be detected at runtime
        capabilities: ['filesystem', 'network', 'process', 'typescript'],
        constraints: {
          moduleSystem: 'esm',
          runtime: 'bun',
        },
      },
    ];

    for (const platform of defaultPlatforms) {
      this.platforms.set(platform.name, platform);
    }

    // Add current platform as target if none specified
    if (this.config.targetPlatforms.length === 0) {
      this.config.targetPlatforms = [this.getCurrentPlatform()];
    }
  }

  /**
   * Get current platform
   */
  private getCurrentPlatform(): Platform {
    if (typeof process !== 'undefined' && process.versions?.node) {
      return this.platforms.get('node')!;
    }
    if (typeof navigator !== 'undefined') {
      return this.platforms.get('browser')!;
    }
    // Default to node for other environments
    return this.platforms.get('node')!;
  }

  /**
   * Setup event subscriptions for plugin parity
   */
  private setupEventSubscriptions(): void {
    // Subscribe to plugin parity events
    this.eventBus.subscribe(
      `${this.config.parityEventTopic}.check`,
      'plugin-parity-manager',
      async (event: EventRecord) => {
        await this.handleCompatibilityCheck(event);
      },
    );

    this.eventBus.subscribe(
      `${this.config.parityEventTopic}.migrate`,
      'plugin-parity-manager',
      async (event: EventRecord) => {
        await this.handleMigrationRequest(event);
      },
    );

    this.eventBus.subscribe(
      `${this.config.parityEventTopic}.sandbox`,
      'plugin-parity-manager',
      async (event: EventRecord) => {
        await this.handleSandboxRequest(event);
      },
    );
  }

  /**
   * Check plugin compatibility across platforms
   */
  async checkCompatibility(
    plugin: Plugin,
    targetPlatforms?: Platform[],
  ): Promise<PluginCompatibilityResult[]> {
    const platforms = targetPlatforms || this.config.targetPlatforms;
    const results: PluginCompatibilityResult[] = [];

    for (const platform of platforms) {
      const cacheKey = `${plugin.metadata.name}-${platform.name}`;
      let result = this.compatibilityCache.get(cacheKey);

      if (!result) {
        result = await this.performCompatibilityCheck(plugin, platform);
        this.compatibilityCache.set(cacheKey, result);
      }

      results.push(result);
    }

    // Publish compatibility check results
    await this.eventBus.publish(`${this.config.parityEventTopic}.compatibility.results`, {
      pluginName: plugin.metadata.name,
      results,
    });

    return results;
  }

  /**
   * Perform detailed compatibility check
   */
  private async performCompatibilityCheck(
    plugin: Plugin,
    platform: Platform,
  ): Promise<PluginCompatibilityResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const requiredChanges: string[] = [];

    // Check version compatibility
    if (this.config.enableVersionChecks) {
      const versionCheck = this.checkVersionCompatibility(plugin, platform);
      if (!versionCheck.compatible) {
        issues.push(...versionCheck.issues);
      }
      warnings.push(...versionCheck.warnings);
    }

    // Check capability compatibility
    const capabilityCheck = this.checkCapabilityCompatibility(plugin, platform);
    if (!capabilityCheck.compatible) {
      issues.push(...capabilityCheck.issues);
    }
    warnings.push(...capabilityCheck.warnings);

    // Check dependency compatibility
    const dependencyCheck = this.checkDependencyCompatibility(plugin, platform);
    if (!dependencyCheck.compatible) {
      issues.push(...dependencyCheck.issues);
    }
    warnings.push(...dependencyCheck.warnings);

    // Check hook compatibility
    const hookCheck = this.checkHookCompatibility(plugin, platform);
    if (!hookCheck.compatible) {
      issues.push(...hookCheck.issues);
    }
    warnings.push(...hookCheck.warnings);

    return {
      compatible: issues.length === 0,
      platform: platform.name,
      pluginName: plugin.metadata.name,
      issues,
      warnings,
      requiredChanges,
    };
  }

  /**
   * Check version compatibility
   */
  private checkVersionCompatibility(
    plugin: Plugin,
    platform: Platform,
  ): {
    compatible: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check if plugin specifies minimum platform version
    if (plugin.metadata.version) {
      // This would typically involve semantic version comparison
      // For now, just log that version check was performed
      console.log(`Checking version compatibility for ${plugin.metadata.name} on ${platform.name}`);
    }

    return { compatible: issues.length === 0, issues, warnings };
  }

  /**
   * Check capability compatibility
   */
  private checkCapabilityCompatibility(
    plugin: Plugin,
    platform: Platform,
  ): {
    compatible: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check if plugin requires capabilities not available on platform
    const pluginCapabilities = plugin.metadata.hooks || [];
    const missingCapabilities = pluginCapabilities.filter(
      (cap) => !platform.capabilities.includes(cap),
    );

    if (missingCapabilities.length > 0) {
      issues.push(
        `Platform ${platform.name} lacks required capabilities: ${missingCapabilities.join(', ')}`,
      );
    }

    return { compatible: issues.length === 0, issues, warnings };
  }

  /**
   * Check dependency compatibility
   */
  private checkDependencyCompatibility(
    plugin: Plugin,
    platform: Platform,
  ): {
    compatible: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check if plugin dependencies are available on platform
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        // This would typically check if dependency is available on target platform
        console.log(`Checking dependency ${dep} for platform ${platform.name}`);
      }
    }

    return { compatible: issues.length === 0, issues, warnings };
  }

  /**
   * Check hook compatibility
   */
  private checkHookCompatibility(
    plugin: Plugin,
    platform: Platform,
  ): {
    compatible: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check if plugin hooks are compatible with platform
    if (plugin.getHooks) {
      const hooks = plugin.getHooks();
      for (const hook of hooks) {
        // Check if hook name follows platform conventions
        if (!this.isValidHookName(hook.hookName, platform)) {
          warnings.push(`Hook name ${hook.hookName} may not follow ${platform.name} conventions`);
        }
      }
    }

    return { compatible: issues.length === 0, issues, warnings };
  }

  /**
   * Check if hook name is valid for platform
   */
  private isValidHookName(hookName: string, _platform: Platform): boolean {
    // Basic validation - could be enhanced per platform
    return /^[a-z][a-z0-9._]*$/.test(hookName);
  }

  /**
   * Migrate plugin to target platform
   */
  async migratePlugin(pluginName: string, targetPlatform: string): Promise<PluginMigrationResult> {
    const plugin = this.pluginManager.getPlugin(pluginName);
    if (!plugin) {
      return {
        success: false,
        fromPlatform: 'unknown',
        toPlatform: targetPlatform,
        pluginName,
        issues: ['Plugin not found'],
      };
    }

    const platform = this.platforms.get(targetPlatform);
    if (!platform) {
      return {
        success: false,
        fromPlatform: 'unknown',
        toPlatform: targetPlatform,
        pluginName,
        issues: ['Target platform not found'],
      };
    }

    const currentPlatform = this.getCurrentPlatform();

    // Check compatibility first
    const compatibility = await this.checkCompatibility(plugin, [platform]);
    const compatibilityResult = compatibility[0];

    if (!compatibilityResult?.compatible) {
      return {
        success: false,
        fromPlatform: currentPlatform.name,
        toPlatform: targetPlatform,
        pluginName,
        issues: compatibilityResult?.issues || [],
        warnings: compatibilityResult?.warnings || [],
      };
    }

    try {
      // Perform migration
      const migratedPlugin = await this.performPluginMigration(plugin, currentPlatform, platform);

      // Publish migration event
      await this.eventBus.publish(`${this.config.parityEventTopic}.migrated`, {
        pluginName,
        fromPlatform: currentPlatform.name,
        toPlatform: targetPlatform,
        success: true,
      });

      return {
        success: true,
        fromPlatform: currentPlatform.name,
        toPlatform: targetPlatform,
        pluginName,
        warnings: compatibilityResult?.warnings || [],
        migratedPlugin,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Publish migration failure event
      await this.eventBus.publish(`${this.config.parityEventTopic}.migration.failed`, {
        pluginName,
        fromPlatform: currentPlatform.name,
        toPlatform: targetPlatform,
        error: errorMessage,
      });

      return {
        success: false,
        fromPlatform: currentPlatform.name,
        toPlatform: targetPlatform,
        pluginName,
        issues: [errorMessage],
      };
    }
  }

  /**
   * Perform actual plugin migration
   */
  private async performPluginMigration(
    plugin: Plugin,
    fromPlatform: Platform,
    toPlatform: Platform,
  ): Promise<Plugin> {
    // Create a migrated version of the plugin
    const migratedPlugin: Plugin = {
      ...plugin,
      metadata: {
        ...plugin.metadata,
        // Add migration metadata
        description: `${plugin.metadata.description} (Migrated from ${fromPlatform.name} to ${toPlatform.name})`,
      },
    };

    // If plugin has custom initialization, adapt it for target platform
    if (plugin.initialize) {
      const originalInitialize = plugin.initialize;
      migratedPlugin.initialize = async (context: any) => {
        // Add platform-specific initialization
        await this.adaptPluginForPlatform(toPlatform);
        return originalInitialize(context);
      };
    }

    return migratedPlugin;
  }

  /**
   * Adapt plugin for target platform
   */
  private async adaptPluginForPlatform(platform: Platform): Promise<void> {
    // Add platform-specific adaptations
    console.log(`Adapting plugin for platform: ${platform.name}`);

    // This would include platform-specific setup
    switch (platform.name) {
      case 'browser':
        // Browser-specific adaptations
        break;
      case 'node':
        // Node.js-specific adaptations
        break;
      case 'deno':
        // Deno-specific adaptations
        break;
      case 'bun':
        // Bun-specific adaptations
        break;
    }
  }

  /**
   * Setup sandbox for plugin execution
   */
  async setupPluginSandbox(pluginName: string, sandboxConfig: PluginSandboxConfig): Promise<void> {
    this.sandboxConfigs.set(pluginName, sandboxConfig);

    // Publish sandbox setup event
    await this.eventBus.publish(`${this.config.parityEventTopic}.sandbox.created`, {
      pluginName,
      config: sandboxConfig,
    });
  }

  /**
   * Execute plugin in sandbox
   */
  async executeInSandbox<T, R>(pluginName: string, hookName: string, data: T): Promise<R[]> {
    const sandboxConfig = this.sandboxConfigs.get(pluginName);
    if (!sandboxConfig || !sandboxConfig.enabled) {
      // Execute normally if no sandbox
      return this.pluginManager.executeHook<T, R>(hookName, data);
    }

    // Execute in sandbox environment
    return this.executeWithSandbox<T, R>(pluginName, hookName, data, sandboxConfig);
  }

  /**
   * Execute hook with sandbox restrictions
   */
  private async executeWithSandbox<T, R>(
    pluginName: string,
    hookName: string,
    data: T,
    _sandboxConfig: PluginSandboxConfig,
  ): Promise<R[]> {
    // This would implement actual sandboxing
    // For now, just execute normally but log that sandboxing is active
    console.log(`Executing ${hookName} for ${pluginName} in sandbox mode`);

    const startTime = Date.now();

    try {
      const results = await this.pluginManager.executeHook<T, R>(hookName, data);
      const duration = Date.now() - startTime;

      // Publish sandbox execution event
      await this.eventBus.publish(`${this.config.parityEventTopic}.sandbox.executed`, {
        pluginName,
        hookName,
        duration,
        success: true,
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Publish sandbox execution failure event
      await this.eventBus.publish(`${this.config.parityEventTopic}.sandbox.failed`, {
        pluginName,
        hookName,
        duration,
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Handle compatibility check event
   */
  private async handleCompatibilityCheck(event: EventRecord): Promise<void> {
    const { pluginName, targetPlatforms } = event.payload as {
      pluginName: string;
      targetPlatforms?: string[];
    };

    const plugin = this.pluginManager.getPlugin(pluginName);
    if (!plugin) {
      console.error(`Plugin ${pluginName} not found for compatibility check`);
      return;
    }

    const platforms = targetPlatforms
      ? targetPlatforms
          .map((name) => this.platforms.get(name))
          .filter((p): p is Platform => p !== undefined)
      : this.config.targetPlatforms;

    await this.checkCompatibility(plugin, platforms);
  }

  /**
   * Handle migration request event
   */
  private async handleMigrationRequest(event: EventRecord): Promise<void> {
    const { pluginName, targetPlatform } = event.payload as {
      pluginName: string;
      targetPlatform: string;
    };

    await this.migratePlugin(pluginName, targetPlatform);
  }

  /**
   * Handle sandbox request event
   */
  private async handleSandboxRequest(event: EventRecord): Promise<void> {
    const { pluginName, config } = event.payload as {
      pluginName: string;
      config: PluginSandboxConfig;
    };

    await this.setupPluginSandbox(pluginName, config);
  }

  /**
   * Get all supported platforms
   */
  getSupportedPlatforms(): Platform[] {
    return Array.from(this.platforms.values());
  }

  /**
   * Get platform by name
   */
  getPlatform(name: string): Platform | undefined {
    return this.platforms.get(name);
  }

  /**
   * Add new platform
   */
  addPlatform(platform: Platform): void {
    this.platforms.set(platform.name, platform);
  }

  /**
   * Get plugin compatibility cache
   */
  getCompatibilityCache(): Map<string, PluginCompatibilityResult> {
    return new Map(this.compatibilityCache);
  }

  /**
   * Clear compatibility cache
   */
  clearCompatibilityCache(): void {
    this.compatibilityCache.clear();
  }

  /**
   * Get sandbox configuration for plugin
   */
  getSandboxConfig(pluginName: string): PluginSandboxConfig | undefined {
    return this.sandboxConfigs.get(pluginName);
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<PluginParityConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PluginParityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    this.platforms.clear();
    this.sandboxConfigs.clear();
    this.compatibilityCache.clear();
  }
}
