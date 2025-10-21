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
import { ValidationError, InputSanitizer } from '../utils/input-validation.js';

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
/**
 * Hook Security Validator
 *
 * Provides security validation for hook registration and execution
 * to prevent injection attacks, unauthorized access, and resource abuse.
 */
class HookSecurityValidator {
  /**
   * Validate hook registration parameters
   */
  static validateRegistration(registration: HookRegistration): void {
    // Validate hook ID format
    if (!registration.id || typeof registration.id !== 'string') {
      throw new ValidationError('Hook ID is required and must be a string', 'id', registration.id);
    }

    const sanitizedId = InputSanitizer.sanitizeString(registration.id);
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedId)) {
      throw new ValidationError(
        'Hook ID must contain only alphanumeric characters, hyphens, and underscores',
        'id',
        registration.id,
      );
    }

    if (sanitizedId.length < 1 || sanitizedId.length > 50) {
      throw new ValidationError(
        'Hook ID must be between 1 and 50 characters',
        'id',
        registration.id,
      );
    }

    // Validate tool patterns
    if (!registration.tools || !Array.isArray(registration.tools)) {
      throw new ValidationError('Tools must be an array', 'tools', registration.tools);
    }

    if (registration.tools.length === 0) {
      throw new ValidationError('Tools array cannot be empty', 'tools', registration.tools);
    }

    if (registration.tools.length > 20) {
      throw new ValidationError('Tools array cannot exceed 20 items', 'tools', registration.tools);
    }

    // Validate each tool pattern
    registration.tools.forEach((pattern, index) => {
      if (typeof pattern !== 'string') {
        throw new ValidationError(
          `Tool pattern at index ${index} must be a string`,
          'tools',
          registration.tools,
        );
      }

      const sanitizedPattern = InputSanitizer.sanitizeString(pattern);
      if (!/^[a-zA-Z0-9_*-]+$/.test(sanitizedPattern)) {
        throw new ValidationError(
          `Invalid tool pattern at index ${index}: ${pattern}`,
          'tools',
          registration.tools,
        );
      }
    });

    // Validate timeout
    if (registration.timeout !== undefined) {
      if (
        typeof registration.timeout !== 'number' ||
        registration.timeout < 1000 ||
        registration.timeout > 300000
      ) {
        throw new ValidationError(
          'Timeout must be a number between 1000 and 300000ms',
          'timeout',
          registration.timeout,
        );
      }
    }

    // Validate priority
    if (registration.priority !== undefined) {
      if (
        typeof registration.priority !== 'number' ||
        registration.priority < 1 ||
        registration.priority > 1000
      ) {
        throw new ValidationError(
          'Priority must be a number between 1 and 1000',
          'priority',
          registration.priority,
        );
      }
    }

    // Validate hook type
    if (registration.type !== 'before' && registration.type !== 'after') {
      throw new ValidationError(
        'Hook type must be either "before" or "after"',
        'type',
        registration.type,
      );
    }
  }

  /**
   * Validate hook function for dangerous patterns
   */
  static validateHookFunction(hook: HookFunction): void {
    // Convert function to string to analyze its source
    const hookString = hook.toString();

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/i, // eval() usage
      /Function\s*\(/i, // Function constructor
      /setTimeout\s*\(/i, // setTimeout (potential for code execution)
      /setInterval\s*\(/i, // setInterval (potential for code execution)
      /require\s*\(/i, // require() (Node.js module loading)
      /import\s*\(/i, // dynamic import
      /process\./i, // process object access
      /global\./i, // global object access
      /window\./i, // window object access
      /document\./i, // document object access
      /fetch\s*\(/i, // fetch calls (potential for data exfiltration)
      /XMLHttpRequest/i, // XHR usage
      /WebSocket/i, // WebSocket usage
      /Worker/i, // Web Worker usage
      /fs\./i, // filesystem access
      /child_process/i, // child process access
      /exec\s*\(/i, // exec calls
      /spawn\s*\(/i, // spawn calls
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(hookString)) {
        throw new ValidationError(
          `Hook function contains potentially dangerous pattern: ${pattern}`,
          'hook',
          hookString,
        );
      }
    }

    // Check for extremely long functions (potential for obfuscated code)
    if (hookString.length > 50000) {
      throw new ValidationError(
        'Hook function is too long (max 50000 characters)',
        'hook',
        hookString,
      );
    }
  }

  /**
   * Validate authorization context
   */
  static validateAuthorization(
    context: Partial<HookContext>,
    requiredPermissions: string[] = [],
  ): void {
    if (!context) {
      throw new ValidationError('Context is required for authorization', 'context', context);
    }

    // Validate plugin context
    if (context.pluginContext) {
      if (typeof context.pluginContext !== 'object' || context.pluginContext === null) {
        throw new ValidationError(
          'Plugin context must be an object',
          'context.pluginContext',
          context.pluginContext,
        );
      }

      // Sanitize plugin context
      context.pluginContext = InputSanitizer.sanitizeObject(context.pluginContext) as any;
    }

    // Validate metadata
    if (context.metadata) {
      if (typeof context.metadata !== 'object' || context.metadata === null) {
        throw new ValidationError(
          'Metadata must be an object',
          'context.metadata',
          context.metadata,
        );
      }

      // Sanitize metadata
      context.metadata = InputSanitizer.sanitizeObject(context.metadata);
    }

    // Check required permissions (simplified - in real implementation would check against auth system)
    if (requiredPermissions.length > 0) {
      // This is a placeholder - in a real system, you'd check against the actual auth system
      const hasPermissions = requiredPermissions.every((permission) => {
        return context.pluginContext?.permissions?.includes(permission);
      });

      if (!hasPermissions) {
        throw new ValidationError(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
          'context',
          context,
        );
      }
    }
  }

  /**
   * Sanitize hook context to prevent information leakage
   */
  static sanitizeContext(context: Partial<HookContext>): Partial<HookContext> {
    const sanitized: Partial<HookContext> = {};

    // Copy safe fields
    if (context.toolName) {
      sanitized.toolName = InputSanitizer.sanitizeString(context.toolName);
    }

    if (context.phase) {
      sanitized.phase = context.phase; // enum is safe
    }

    if (context.timestamp) {
      sanitized.timestamp = context.timestamp; // Date object is safe
    }

    if (context.executionId) {
      sanitized.executionId = InputSanitizer.sanitizeString(context.executionId);
    }

    // Sanitize plugin context (remove sensitive information)
    if (context.pluginContext) {
      sanitized.pluginContext = this.sanitizePluginContext(context.pluginContext);
    }

    // Sanitize metadata (remove sensitive information)
    if (context.metadata) {
      sanitized.metadata = InputSanitizer.sanitizeObject(context.metadata);
    }

    return sanitized;
  }

  /**
   * Sanitize plugin context to remove sensitive information
   */
  private static sanitizePluginContext(pluginContext: any): any {
    if (!pluginContext || typeof pluginContext !== 'object') {
      return pluginContext;
    }

    const sanitized: any = {};

    // Allow only safe fields
    const safeFields = ['pluginId', 'pluginName', 'version', 'permissions'];
    for (const field of safeFields) {
      if (pluginContext[field] !== undefined) {
        sanitized[field] = InputSanitizer.sanitizeString(String(pluginContext[field]));
      }
    }

    return sanitized;
  }
}

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
    // Validate registration parameters
    HookSecurityValidator.validateRegistration(registration);

    // Validate hook function for dangerous patterns
    HookSecurityValidator.validateHookFunction(registration.hook);

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
    // Validate and sanitize context
    const sanitizedContext = HookSecurityValidator.sanitizeContext(context);

    // Validate authorization
    HookSecurityValidator.validateAuthorization(sanitizedContext, ['execute_hooks']);

    const hooks = this.getHooksForTool(toolName, 'before');
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const metrics: HookMetrics[] = [];

    let currentArgs = args;

    for (const hook of hooks.slice(0, opts.maxHooks)) {
      const hookResult = await this.executeHook(
        hook,
        toolName,
        currentArgs,
        sanitizedContext,
        'before',
        opts,
      );

      metrics.push(hookResult.metrics);

      if (hookResult.result !== undefined && hookResult.result !== null) {
        currentArgs = hookResult.result as T;
      }

      if (!hookResult.metrics.success && !opts.continueOnError) {
        throw new HookExecutionError(
          `Before hook '${hook.id}' failed for tool '${toolName}'`,
          hook.id,
          toolName,
          'before',
          hookResult.metrics.error,
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
    // Validate and sanitize context
    const sanitizedContext = HookSecurityValidator.sanitizeContext(context);
    
    // Validate authorization
    HookSecurityValidator.validateAuthorization(sanitizedContext, ['execute_hooks']);

    const hooks = this.getHooksForTool(toolName, 'after');
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const metrics: HookMetrics[] = [];

    let currentResult = result.result;

    for (const hook of hooks.slice(0, opts.maxHooks)) {
      const hookResult = await this.executeHook(
        hook,
        toolName,
        { args, result: currentResult },
        sanitizedContext,
        'after',
        opts,
      );

      metrics.push(hookResult.metrics);

      if (hookResult.result !== undefined && hookResult.result !== null) {
        currentResult = hookResult.result as R;
      }

      if (!hookResult.metrics.success && !opts.continueOnError) {
        throw new HookExecutionError(
          `After hook '${hook.id}' failed for tool '${toolName}'`,
          hook.id,
          toolName,
          'after',
          hookResult.metrics.error,
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
  ): Promise<{ metrics: HookMetrics; result?: any }> {
    const startTime = Date.now();
    const timeout = hook.timeout || options.timeout;

    try {
      // Execute with timeout
      const result = await this.withTimeout(
        this.safeHookExecution(
          hook.hook,
          {
            toolName,
            args: data,
            ...(phase === 'after' && { result: (data as any).result }),
            phase,
            timestamp: new Date(),
            executionId: this.generateExecutionId(),
            pluginContext: context.pluginContext,
            metadata: context.metadata || {},
          } as any,
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

      return { metrics, result };
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

      return { metrics, result: undefined };
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

    Array.from(this.hooks.values()).forEach(hook => {
      this.executionStats.hooksByType[hook.type]++;
    });
  }

  /**
   * Generate a unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
