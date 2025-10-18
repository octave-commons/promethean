// SPDX-License-Identifier: GPL-3.0-only
// Tool Execution Hook Manager Implementation

import type {
  HookManager,
  HookRegistration,
  HookContext,
  BeforeHook,
  AfterHook,
  ToolExecutionResult,
  HookExecutionOptions,
  HookMetrics,
  HookStatistics,
  HookFunction,
} from '../types/plugin-hooks.js';
import { HookExecutionError, HookTimeoutError } from '../types/plugin-hooks.js';

/**
 * Default hook execution options
 */
const DEFAULT_OPTIONS: Required<HookExecutionOptions> = {
  timeout: 30000, // 30 seconds
  continueOnError: true,
  collectMetrics: true,
  maxHooks: 100,
};

/**
 * Tool Execution Hook Manager
 *
 * Provides a comprehensive hook system for intercepting and enhancing
 * tool execution with before/after hooks, priority ordering, and error handling.
 */
export class ToolExecuteHookManager implements HookManager {
  private hooks = new Map<string, HookRegistration>();
  private executionStats: HookStatistics = {
    totalHooks: 0,
    hooksByType: { before: 0, after: 0 },
    executionsByTool: {},
    averageExecutionTime: 0,
    successRate: 1,
    totalExecutions: 0,
  };
  private metricsHistory: HookMetrics[] = [];

  /**
   * Register a new hook
   */
  registerHook(registration: HookRegistration): void {
    if (this.hooks.has(registration.id)) {
      throw new Error(`Hook with ID '${registration.id}' is already registered`);
    }

    this.hooks.set(registration.id, registration);
    this.updateStatistics();
  }

  /**
   * Unregister a hook by ID
   */
  unregisterHook(hookId: string): boolean {
    const removed = this.hooks.delete(hookId);
    if (removed) {
      this.updateStatistics();
    }
    return removed;
  }

  /**
   * Get all registered hooks
   */
  getHooks(): HookRegistration[] {
    return Array.from(this.hooks.values());
  }

  /**
   * Get hooks for a specific tool and phase
   */
  getHooksForTool(toolName: string, phase: 'before' | 'after'): HookRegistration[] {
    return Array.from(this.hooks.values())
      .filter((hook) => hook.type === phase && this.matchesTool(toolName, hook.tools))
      .sort((a, b) => a.priority - b.priority); // Priority ordering
  }

  /**
   * Execute before hooks for a tool
   */
  async executeBeforeHooks<T>(
    toolName: string,
    args: T,
    context: Partial<HookContext>,
    options: HookExecutionOptions = {},
  ): Promise<{ args: T; metrics: HookMetrics[] }> {
    const hooks = this.getHooksForTool(toolName, 'before');
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const metrics: HookMetrics[] = [];

    let currentArgs = args;

    for (const hook of hooks.slice(0, opts.maxHooks)) {
      const hookMetrics = await this.executeHook(
        hook,
        toolName,
        currentArgs,
        context,
        'before',
        opts,
      );

      metrics.push(hookMetrics);

      if (hookMetrics.success && hookMetrics.executionTime > 0) {
        // Hook may have modified the arguments
        const result = await this.safeHookExecution(
          hook.hook,
          {
            toolName,
            args: currentArgs,
            phase: 'before',
            timestamp: new Date(),
            executionId: this.generateExecutionId(),
            pluginContext: context.pluginContext,
            metadata: context.metadata || {},
          },
          opts.timeout,
        );

        if (result !== undefined && result !== null) {
          currentArgs = result as T;
        }
      } else if (!opts.continueOnError) {
        throw new HookExecutionError(
          `Before hook '${hook.id}' failed for tool '${toolName}'`,
          hook.id,
          toolName,
          'before',
          hookMetrics.error,
        );
      }
    }

    return { args: currentArgs, metrics };
  }

  /**
   * Execute after hooks for a tool
   */
  async executeAfterHooks<T, R>(
    toolName: string,
    args: T,
    result: ToolExecutionResult & { result?: R },
    context: Partial<HookContext>,
    options: HookExecutionOptions = {},
  ): Promise<{ result: R; metrics: HookMetrics[] }> {
    const hooks = this.getHooksForTool(toolName, 'after');
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const metrics: HookMetrics[] = [];

    let currentResult = result.result;

    for (const hook of hooks.slice(0, opts.maxHooks)) {
      const hookMetrics = await this.executeHook(
        hook,
        toolName,
        { args, result: { ...result, result: currentResult } },
        context,
        'after',
        opts,
      );

      metrics.push(hookMetrics);

      if (hookMetrics.success && hookMetrics.executionTime > 0) {
        // Hook may have modified the result
        const hookResult = await this.safeHookExecution(
          hook.hook,
          {
            toolName,
            args,
            phase: 'after',
            timestamp: new Date(),
            executionId: this.generateExecutionId(),
            pluginContext: context.pluginContext,
            metadata: context.metadata || {},
          },
          opts.timeout,
        );

        if (hookResult !== undefined && hookResult !== null) {
          currentResult = hookResult as R;
        }
      } else if (!opts.continueOnError) {
        throw new HookExecutionError(
          `After hook '${hook.id}' failed for tool '${toolName}'`,
          hook.id,
          toolName,
          'after',
          hookMetrics.error,
        );
      }
    }

    return { result: currentResult as R, metrics };
  }

  /**
   * Clear all hooks
   */
  clearHooks(): void {
    this.hooks.clear();
    this.metricsHistory = [];
    this.executionStats = {
      totalHooks: 0,
      hooksByType: { before: 0, after: 0 },
      executionsByTool: {},
      averageExecutionTime: 0,
      successRate: 1,
      totalExecutions: 0,
    };
  }

  /**
   * Get execution statistics
   */
  getStatistics(): HookStatistics {
    return { ...this.executionStats };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): HookMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Check if a tool name matches the hook's tool patterns
   */
  private matchesTool(toolName: string, patterns: string[]): boolean {
    return patterns.some((pattern) => {
      if (pattern === '*') return true;
      if (pattern.endsWith('*')) {
        return toolName.startsWith(pattern.slice(0, -1));
      }
      if (pattern.startsWith('*')) {
        return toolName.endsWith(pattern.slice(1));
      }
      return pattern === toolName;
    });
  }

  /**
   * Execute a single hook with timeout and error handling
   */
  private async executeHook<T>(
    hook: HookRegistration,
    toolName: string,
    data: T,
    context: Partial<HookContext>,
    phase: 'before' | 'after',
    options: Required<HookExecutionOptions>,
  ): Promise<HookMetrics> {
    const startTime = Date.now();
    const timeout = hook.timeout || options.timeout;

    try {
      // Execute with timeout
      await this.withTimeout(
        this.safeHookExecution(
          hook.hook,
          {
            toolName,
            args: (data as any).args || data,
            phase,
            timestamp: new Date(),
            executionId: this.generateExecutionId(),
            pluginContext: context.pluginContext,
            metadata: context.metadata || {},
          },
          timeout,
        ),
        timeout,
      );

      const executionTime = Date.now() - startTime;
      const metrics: HookMetrics = {
        hookId: hook.id,
        executionTime,
        success: true,
        timestamp: new Date(),
      };

      if (options.collectMetrics) {
        this.recordMetrics(metrics);
        this.updateExecutionStats(toolName, executionTime, true);
      }

      return metrics;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const metrics: HookMetrics = {
        hookId: hook.id,
        executionTime,
        success: false,
        error: error as Error,
        timestamp: new Date(),
      };

      if (options.collectMetrics) {
        this.recordMetrics(metrics);
        this.updateExecutionStats(toolName, executionTime, false);
      }

      return metrics;
    }
  }

  /**
   * Safely execute a hook function
   */
  private async safeHookExecution(
    hook: HookFunction,
    context: HookContext,
    timeout: number,
  ): Promise<any> {
    try {
      const result = await this.withTimeout(Promise.resolve(hook(context as any)), timeout);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        throw new HookTimeoutError('unknown', context.toolName, context.phase, timeout);
      }
      throw error;
    }
  }

  /**
   * Execute a function with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Record hook execution metrics
   */
  private recordMetrics(metrics: HookMetrics): void {
    this.metricsHistory.push(metrics);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }
  }

  /**
   * Update execution statistics
   */
  private updateExecutionStats(toolName: string, executionTime: number, success: boolean): void {
    this.executionStats.totalExecutions++;
    this.executionStats.executionsByTool[toolName] =
      (this.executionStats.executionsByTool[toolName] || 0) + 1;

    // Update average execution time
    const totalTime =
      this.executionStats.averageExecutionTime * (this.executionStats.totalExecutions - 1) +
      executionTime;
    this.executionStats.averageExecutionTime = totalTime / this.executionStats.totalExecutions;

    // Update success rate
    const successfulExecutions =
      this.executionStats.successRate * (this.executionStats.totalExecutions - 1) +
      (success ? 1 : 0);
    this.executionStats.successRate = successfulExecutions / this.executionStats.totalExecutions;
  }

  /**
   * Update hook statistics
   */
  private updateStatistics(): void {
    this.executionStats.totalHooks = this.hooks.size;
    this.executionStats.hooksByType = { before: 0, after: 0 };

    for (const hook of this.hooks.values()) {
      this.executionStats.hooksByType[hook.type]++;
    }
  }

  /**
   * Generate a unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global hook manager instance
 */
export const hookManager = new ToolExecuteHookManager();

/**
 * Helper function to create a hook registration
 */
export function createHookRegistration(
  id: string,
  hook: HookFunction,
  options: Partial<Omit<HookRegistration, 'id' | 'hook'>> = {},
): HookRegistration {
  return {
    id,
    hook,
    priority: 100,
    type: 'before',
    tools: ['*'],
    timeout: 30000,
    ...options,
  };
}

/**
 * Helper function to register a before hook
 */
export function registerBeforeHook(
  id: string,
  hook: BeforeHook,
  options: Partial<Omit<HookRegistration, 'id' | 'hook' | 'type'>> = {},
): void {
  hookManager.registerHook(createHookRegistration(id, hook, { ...options, type: 'before' }));
}

/**
 * Helper function to register an after hook
 */
export function registerAfterHook(
  id: string,
  hook: AfterHook,
  options: Partial<Omit<HookRegistration, 'id' | 'hook' | 'type'>> = {},
): void {
  hookManager.registerHook(createHookRegistration(id, hook, { ...options, type: 'after' }));
}
