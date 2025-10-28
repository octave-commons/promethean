import { loadKanbanConfig } from '../board/config.js';
import type { Board, Task } from './types.js';
import type { EventLogManager } from '../board/event-log/index.js';
/**
 * WIP limit validation result
 */
export interface WIPValidationResult {
    readonly valid: boolean;
    readonly current: number;
    readonly limit: number | null;
    readonly projected: number;
    readonly utilization: number;
    readonly violation?: {
        readonly reason: string;
        readonly severity: 'warning' | 'error' | 'critical';
        readonly suggestions: CapacitySuggestion[];
    };
}
/**
 * Capacity balancing suggestion
 */
export interface CapacitySuggestion {
    readonly action: 'move_tasks' | 'reorder_priority' | 'adjust_limit' | 'split_work';
    readonly description: string;
    readonly impact: {
        readonly fromColumn: string;
        readonly toColumn?: string;
        readonly taskCount: number;
        readonly capacityChange: number;
    };
    readonly tasks?: Task[];
    readonly priority: 'high' | 'medium' | 'low';
}
/**
 * Real-time capacity monitoring data
 */
export interface CapacityMonitor {
    readonly timestamp: string;
    readonly columns: ColumnCapacity[];
    readonly totalViolations: number;
    readonly utilization: {
        readonly average: number;
        readonly max: number;
        readonly min: number;
    };
}
/**
 * Column capacity information
 */
export interface ColumnCapacity {
    readonly name: string;
    readonly current: number;
    readonly limit: number | null;
    readonly utilization: number;
    readonly status: 'healthy' | 'warning' | 'violation' | 'critical';
    readonly tasks: Task[];
}
/**
 * WIP limit violation record for audit trail
 */
export interface WIPViolation {
    readonly id: string;
    readonly timestamp: string;
    readonly taskId: string;
    readonly taskTitle: string;
    readonly fromStatus: string;
    readonly toStatus: string;
    readonly column: string;
    readonly current: number;
    readonly limit: number;
    readonly utilization: number;
    readonly severity: 'warning' | 'error' | 'critical';
    readonly blocked: boolean;
    readonly overrideReason?: string;
    readonly overrideBy?: string;
    readonly suggestions: CapacitySuggestion[];
}
/**
 * WIP Limit Enforcement Engine
 *
 * Provides comprehensive WIP limit validation, real-time monitoring,
 * capacity balancing suggestions, and audit trail functionality.
 */
export declare class WIPLimitEnforcement {
    private readonly config;
    private readonly eventLogManager?;
    private readonly violationHistory;
    private readonly capacityCache;
    private lastCacheUpdate;
    private readonly CACHE_TTL;
    constructor(dependencies?: {
        config?: Awaited<ReturnType<typeof loadKanbanConfig>>['config'];
        eventLogManager?: EventLogManager;
    });
    /**
     * Validate WIP limits for a specific column
     */
    validateWIPLimits(columnName: string, proposedChange?: number, board?: Board): Promise<WIPValidationResult>;
    /**
     * Intercept and validate status transitions
     */
    interceptStatusTransition(taskId: string, fromStatus: string, toStatus: string, board?: Board, options?: {
        force?: boolean;
        overrideReason?: string;
        overrideBy?: string;
    }): Promise<{
        blocked: boolean;
        reason?: string;
        suggestions?: CapacitySuggestion[];
        violation?: WIPViolation;
    }>;
    /**
     * Generate capacity balancing suggestions for an over-capacity column
     */
    generateCapacitySuggestions(overCapacityColumn: string, board?: Board): Promise<CapacitySuggestion[]>;
    /**
     * Get real-time capacity monitoring data
     */
    getCapacityMonitor(board?: Board): Promise<CapacityMonitor>;
    /**
     * Get violation history for compliance reporting
     */
    getViolationHistory(options?: {
        limit?: number;
        column?: string;
        severity?: 'warning' | 'error' | 'critical';
        since?: string;
    }): WIPViolation[];
    /**
     * Generate compliance report
     */
    generateComplianceReport(timeframe?: '24h' | '7d' | '30d'): Promise<{
        timeframe: string;
        totalViolations: number;
        violationsByColumn: Record<string, number>;
        violationsBySeverity: Record<string, number>;
        overrideRate: number;
        topViolatedColumns: Array<{
            column: string;
            violations: number;
        }>;
        recommendations: string[];
    }>;
    private loadBoard;
    private getColumnTaskCount;
    private getColumnLimit;
    private calculateViolationSeverity;
    private getTaskTitle;
    private getPriorityNumeric;
    private calculateSuggestionPriority;
    private generateViolationId;
    private recordViolation;
    private getRecentViolations;
    private generateComplianceRecommendations;
}
/**
 * Create a WIP Limit Enforcement engine instance
 */
export declare function createWIPLimitEnforcement(dependencies?: {
    config?: Awaited<ReturnType<typeof loadKanbanConfig>>['config'];
    eventLogManager?: EventLogManager;
}): Promise<WIPLimitEnforcement>;
//# sourceMappingURL=wip-enforcement.d.ts.map