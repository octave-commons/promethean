import type { HookManager, HookRegistration, HookContext, BeforeHook, AfterHook, ToolExecutionResult, HookExecutionOptions, HookMetrics, HookStatistics, HookFunction } from '../types/plugin-hooks.js';
export declare class ToolExecuteHookManager implements HookManager {
    private hooks;
    private executionStats;
    private metricsHistory;
    /**
     * Register a new hook
     */
    registerHook(registration: HookRegistration): void;
    /**
     * Unregister a hook by ID
     */
    unregisterHook(hookId: string): boolean;
    /**
     * Get all registered hooks
     */
    getHooks(): HookRegistration[];
    /**
     * Get hooks for a specific tool and phase
     */
    getHooksForTool(toolName: string, phase: 'before' | 'after'): HookRegistration[];
    /**
     * Execute before hooks for a tool
     */
    executeBeforeHooks<T>(toolName: string, args: T, context: Partial<HookContext>, options?: HookExecutionOptions): Promise<{
        args: T;
        metrics: HookMetrics[];
    }>;
    /**
     * Execute after hooks for a tool
     */
    executeAfterHooks<T, R>(toolName: string, args: T, result: ToolExecutionResult & {
        result?: R;
    }, context: Partial<HookContext>, options?: HookExecutionOptions): Promise<{
        result: R;
        metrics: HookMetrics[];
    }>;
    /**
     * Clear all hooks
     */
    clearHooks(): void;
    /**
     * Get execution statistics
     */
    getStatistics(): HookStatistics;
    /**
     * Get metrics history
     */
    getMetricsHistory(): HookMetrics[];
    /**
     * Check if a tool name matches the hook's tool patterns
     */
    private matchesTool;
    /**
     * Execute a single hook with timeout and error handling
     */
    private executeHook;
    /**
     * Safely execute a hook function
     */
    private safeHookExecution;
    /**
     * Execute a function with timeout
     */
    private withTimeout;
    /**
     * Record hook execution metrics
     */
    private recordMetrics;
    /**
     * Update execution statistics
     */
    private updateExecutionStats;
    /**
     * Update hook statistics
     */
    private updateStatistics;
    /**
     * Generate a unique execution ID
     */
    private generateExecutionId;
}
/**
 * Global hook manager instance
 */
export declare const hookManager: ToolExecuteHookManager;
/**
 * Helper function to create a hook registration
 */
export declare function createHookRegistration(id: string, hook: HookFunction, options?: Partial<Omit<HookRegistration, 'id' | 'hook'>>): HookRegistration;
/**
 * Helper function to register a before hook
 */
export declare function registerBeforeHook(id: string, hook: BeforeHook, options?: Partial<Omit<HookRegistration, 'id' | 'hook' | 'type'>>): void;
/**
 * Helper function to register an after hook
 */
export declare function registerAfterHook(id: string, hook: AfterHook, options?: Partial<Omit<HookRegistration, 'id' | 'hook' | 'type'>>): void;
