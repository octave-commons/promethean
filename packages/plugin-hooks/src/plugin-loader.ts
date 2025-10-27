/**
 * Plugin discovery and loading utilities
 */

import type { Plugin } from './types.js';
import type { EventBus } from '@promethean-os/event';

/**
 * Plugin discovery options
 */
export type PluginDiscoveryOptions = {
  directories?: string[];
  patterns?: string[];
  exclude?: string[];
  recursive?: boolean;
};

/**
 * Plugin loader configuration
 */
export type PluginLoaderConfig = {
  autoLoad?: boolean;
  discovery?: PluginDiscoveryOptions;
  timeout?: number;
  retryAttempts?: number;
  enableHotReload?: boolean;
};

/**
 * Default plugin loader implementation
 */
export class DefaultPluginLoader {
  private loadedPlugins = new Map<string, Plugin>();
  private pluginPaths = new Map<string, string>();
  private config: PluginLoaderConfig;

  constructor(_eventBus: EventBus, config: PluginLoaderConfig = {}) {
    this.config = {
      autoLoad: true,
      timeout: 30000,
      retryAttempts: 3,
      enableHotReload: false,
      discovery: {
        directories: ['./plugins', './node_modules'],
        patterns: ['*.plugin.js', '*.plugin.mjs'],
        exclude: ['node_modules', '.git'],
        recursive: true,
      },
      ...config,
    };
  }

  /**
   * Discover plugins from filesystem
   */
  async discoverPlugins(): Promise<string[]> {
    const { discovery } = this.config;
    if (!discovery) {
      return [];
    }

    const pluginPaths: string[] = [];

    for (const directory of discovery.directories || []) {
      try {
        const paths = await this.scanDirectory(directory, discovery);
        pluginPaths.push(...paths);
      } catch (error) {
        console.warn(`Failed to scan directory ${directory}:`, error);
      }
    }

    return [...new Set(pluginPaths)]; // Remove duplicates
  }

  /**
   * Scan directory for plugin files
   */
  private async scanDirectory(
    directory: string,
    options: PluginDiscoveryOptions,
  ): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');

    try {
      const stat = await fs.stat(directory);
      if (!stat.isDirectory()) {
        return [];
      }
    } catch {
      return [];
    }

    const pluginPaths: string[] = [];
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isFile()) {
        if (this.matchesPattern(entry.name, options.patterns)) {
          if (!this.isExcluded(entry.name, options.exclude)) {
            pluginPaths.push(fullPath);
          }
        }
      } else if (entry.isDirectory() && options.recursive) {
        const subPaths = await this.scanDirectory(fullPath, options);
        pluginPaths.push(...subPaths);
      }
    }

    return pluginPaths;
  }

  /**
   * Check if filename matches any pattern
   */
  private matchesPattern(filename: string, patterns?: string[]): boolean {
    if (!patterns) {
      return false;
    }

    return patterns.some((pattern) => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
      return regex.test(filename);
    });
  }

  /**
   * Check if file should be excluded
   */
  private isExcluded(filename: string, exclude?: string[]): boolean {
    if (!exclude) {
      return false;
    }

    return exclude.some((exclusion) => {
      const regex = new RegExp(exclusion.replace(/\*/g, '.*').replace(/\?/g, '.'));
      return regex.test(filename) || filename.includes(exclusion);
    });
  }

  /**
   * Load a plugin from file path
   */
  async loadPlugin(pluginPath: string): Promise<Plugin> {
    try {
      // Clear require cache to enable hot reload
      if (this.config.enableHotReload && this.pluginPaths.has(pluginPath)) {
        delete require.cache[require.resolve(pluginPath)];
      }

      const module = await import(pluginPath);
      const plugin = module.default || module;

      if (!this.validatePlugin(plugin)) {
        throw new Error(`Invalid plugin structure in ${pluginPath}`);
      }

      this.pluginPaths.set(pluginPath, pluginPath);
      this.loadedPlugins.set(plugin.metadata.name, plugin);

      console.log(`Loaded plugin: ${plugin.metadata.name} v${plugin.metadata.version}`);
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
      throw error;
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: any): plugin is Plugin {
    if (!plugin || typeof plugin !== 'object') {
      return false;
    }

    const { metadata } = plugin;
    if (!metadata || typeof metadata !== 'object') {
      return false;
    }

    const requiredFields = ['name', 'version', 'description'];
    return requiredFields.every((field) => field in metadata);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    const plugin = this.loadedPlugins.get(pluginName);
    if (!plugin) {
      return;
    }

    try {
      // Call plugin destroy if available
      if (plugin.destroy) {
        await plugin.destroy();
      }

      // Remove from registry
      this.loadedPlugins.delete(pluginName);

      console.log(`Unloaded plugin: ${pluginName}`);
    } catch (error) {
      console.error(`Error unloading plugin ${pluginName}:`, error);
      throw error;
    }
  }

  /**
   * Get loaded plugin
   */
  getPlugin(name: string): Plugin | undefined {
    return this.loadedPlugins.get(name);
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Check if plugin is loaded
   */
  isLoaded(name: string): boolean {
    return this.loadedPlugins.has(name);
  }

  /**
   * Auto-discover and load plugins
   */
  async autoLoad(): Promise<void> {
    if (!this.config.autoLoad) {
      return;
    }

    const pluginPaths = await this.discoverPlugins();

    for (const pluginPath of pluginPaths) {
      try {
        await this.loadPlugin(pluginPath);
      } catch (error) {
        console.error(`Failed to auto-load plugin ${pluginPath}:`, error);
      }
    }
  }

  /**
   * Reload a plugin
   */
  async reloadPlugin(pluginName: string): Promise<void> {
    if (this.isLoaded(pluginName)) {
      await this.unloadPlugin(pluginName);
    }

    // Find plugin path and reload
    for (const [path, name] of this.pluginPaths.entries()) {
      if (name === pluginName) {
        await this.loadPlugin(path);
        break;
      }
    }
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    total: number;
    loaded: number;
    plugins: Array<{ name: string; version: string; loadedAt: Date }>;
  } {
    const plugins = Array.from(this.loadedPlugins.entries()).map(([name, plugin]) => ({
      name,
      version: plugin.metadata.version,
      loadedAt: new Date(), // This should be tracked properly
    }));

    return {
      total: this.pluginPaths.size,
      loaded: this.loadedPlugins.size,
      plugins,
    };
  }
}
