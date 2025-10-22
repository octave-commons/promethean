/**
 * Plugin system interfaces
 */

import type { Plugin, HookContext } from './types.js';

export interface PluginLifecycle {
  readonly state:
    | 'loading'
    | 'loaded'
    | 'initializing'
    | 'active'
    | 'error'
    | 'unloading'
    | 'unloaded';
  readonly loadedAt?: number;
  readonly initializedAt?: number;
  readonly error?: Error;
  readonly metrics: PluginMetrics;
}

export interface PluginMetrics {
  readonly hooksExecuted: number;
  readonly hooksFailed: number;
  readonly averageExecutionTime: number;
  readonly lastExecutionTime?: number;
  readonly memoryUsage?: number;
}

export interface PluginRegistry {
  readonly plugins: Map<string, PluginEntry>;
  readonly hooks: Map<string, HookEntry[]>;
  readonly metrics: RegistryMetrics;
}

export interface PluginEntry {
  readonly plugin: Plugin;
  readonly lifecycle: PluginLifecycle;
  readonly dependencies: string[];
  readonly dependents: string[];
}

export interface HookEntry {
  readonly pluginName: string;
  readonly hookName: string;
  readonly priority: number;
  readonly handler: Function;
  readonly metrics: HookMetrics;
}

export interface HookMetrics {
  readonly executions: number;
  readonly failures: number;
  readonly averageTime: number;
  readonly lastExecution?: number;
}

export interface RegistryMetrics {
  readonly totalPlugins: number;
  readonly activePlugins: number;
  readonly totalHooks: number;
  readonly hooksExecuted: number;
  readonly hooksFailed: number;
}

export interface PluginValidationError extends Error {
  readonly pluginName: string;
  readonly validationType: 'metadata' | 'dependencies' | 'hooks' | 'runtime';
  readonly details?: unknown;
}

export interface HookExecutionContext extends HookContext {
  readonly executionId: string;
  readonly startTime: number;
  readonly timeout?: number;
  readonly retryCount: number;
}

export interface PluginManagerConfig {
  readonly autoLoad?: boolean;
  readonly hookTimeout?: number;
  readonly maxConcurrentHooks?: number;
  readonly enableHookLogging?: boolean;
  readonly enableMetrics?: boolean;
  readonly maxRetries?: number;
  readonly retryDelay?: number;
}
