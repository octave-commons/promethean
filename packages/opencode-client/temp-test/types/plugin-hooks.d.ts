import type { Plugin } from '@opencode-ai/plugin';
/**
 * Hook execution context containing tool metadata and execution state
 */
export interface HookContext {
    /** The tool name being executed */
    toolName: string;
    /** Original arguments passed to the tool */
    args: any;
    /** Current execution phase */
    phase: 'before' | 'after';
    /** Timestamp when hook execution started */
    timestamp: Date;
    /** Unique identifier for this execution */
    executionId: string;
    /** Plugin context passed to hooks */
    pluginContext: any;
    /** Additional metadata about the execution */
    metadata: Record<string, any>;
}
/**
 * Result of a tool execution (for after hooks)
 */
export interface ToolExecutionResult {
    /** Success or failure status */
    success: boolean;
    /** Return value from the tool */
    result?: any;
    /** Error if execution failed */
    error?: Error;
    /** Execution time in milliseconds */
    executionTime: number;
    /** Additional execution metadata */
    metadata: Record<string, any>;
}
/**
 * Hook function signature for before hooks
 */
export type BeforeHook<T = any> = (context: HookContext & {
    args: T;
}) => Promise<T | void> | T | void;
/**
 * Hook function signature for after hooks
 */
export type AfterHook<T = any, R = any> = (context: HookContext & {
    args: T;
    result: ToolExecutionResult & {
        result?: R;
    };
}) => Promise<R | void> | R | void;
/**
 * Generic hook function type
 */
export type HookFunction = BeforeHook | AfterHook;
/**
 * Hook registration configuration
 */
export interface HookRegistration {
    /** Unique identifier for this hook */
    id: string;
    /** Hook function to execute */
    hook: HookFunction;
    /** Priority level (lower numbers execute first) */
    priority: number;
    /** Hook type (before or after) */
    type: 'before' | 'after';
    /** Tool names this hook applies to (wildcard supported) */
    tools: string[];
    /** Optional metadata for the hook */
    metadata?: Record<string, any>;
    /** Timeout in milliseconds for this hook */
    timeout?: number;
}
/**
 * Hook execution options
 */
export interface HookExecutionOptions {
    /** Global timeout for all hooks */
    timeout?: number;
    /** Whether to continue on hook errors */
    continueOnError?: boolean;
    /** Whether to collect performance metrics */
    collectMetrics?: boolean;
    /** Maximum number of hooks to execute */
    maxHooks?: number;
}
/**
 * Hook execution metrics
 */
export interface HookMetrics {
    /** Hook identifier */
    hookId: string;
    /** Execution time in milliseconds */
    executionTime: number;
    /** Success status */
    success: boolean;
    /** Error if failed */
    error?: Error;
    /** Timestamp of execution */
    timestamp: Date;
}
/**
 * Hook manager interface
 */
export interface HookManager {
    /** Register a new hook */
    registerHook(registration: HookRegistration): void;
    /** Unregister a hook by ID */
    unregisterHook(hookId: string): boolean;
    /** Get all registered hooks */
    getHooks(): HookRegistration[];
    /** Get hooks for a specific tool and phase */
    getHooksForTool(toolName: string, phase: 'before' | 'after'): HookRegistration[];
    /** Execute before hooks for a tool */
    executeBeforeHooks<T>(toolName: string, args: T, context: Partial<HookContext>, options?: HookExecutionOptions): Promise<{
        args: T;
        metrics: HookMetrics[];
    }>;
    /** Execute after hooks for a tool */
    executeAfterHooks<T, R>(toolName: string, args: T, result: ToolExecutionResult & {
        result?: R;
    }, context: Partial<HookContext>, options?: HookExecutionOptions): Promise<{
        result: R;
        metrics: HookMetrics[];
    }>;
    /** Clear all hooks */
    clearHooks(): void;
    /** Get execution statistics */
    getStatistics(): HookStatistics;
}
/**
 * Hook execution statistics
 */
export interface HookStatistics {
    /** Total number of registered hooks */
    totalHooks: number;
    /** Number of hooks by type */
    hooksByType: Record<'before' | 'after', number>;
    /** Number of executions by tool */
    executionsByTool: Record<string, number>;
    /** Average execution time */
    averageExecutionTime: number;
    /** Success rate */
    successRate: number;
    /** Total executions */
    totalExecutions: number;
}
/**
 * Enhanced plugin interface with hook support
 */
export interface HookablePlugin extends Plugin {
    /** Hook manager instance */
    hookManager?: HookManager;
    /** Event handlers for plugin lifecycle */
    event?: {
        [eventType: string]: (event: any) => Promise<void> | void;
    };
}
/**
 * Hook execution error
 */
export declare class HookExecutionError extends Error {
    hookId: string;
    toolName: string;
    phase: 'before' | 'after';
    originalError?: Error;
    constructor(message: string, hookId: string, toolName: string, phase: 'before' | 'after', originalError?: Error);
}
/**
 * Hook timeout error
 */
export declare class HookTimeoutError extends HookExecutionError {
    constructor(hookId: string, toolName: string, phase: 'before' | 'after', timeout: number);
}
