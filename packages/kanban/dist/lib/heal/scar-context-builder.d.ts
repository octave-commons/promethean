/**
 * Scar Context Builder for Kanban Healing Operations
 *
 * This module provides comprehensive context building capabilities for scar (healing) operations
 * in the kanban system. It gathers board state, task metadata, system information,
 * and historical data to provide structured context for intelligent healing operations.
 */
import type { EventLogManager } from '../../board/event-log/index.js';
import type { ScarContext, GitCommit } from './scar-context-types.js';
import type { Task } from '../types.js';
import type { ContextEnhancementOptions } from './context-enhancement.js';
/**
 * Configuration options for scar context building
 */
export interface ScarContextBuilderOptions {
    /** Maximum number of previous scars to include in context */
    maxPreviousScars?: number;
    /** Maximum number of search results to include */
    maxSearchResults?: number;
    /** Maximum git history depth to analyze */
    maxGitHistory?: number;
    /** Whether to include detailed task analysis */
    includeTaskAnalysis?: boolean;
    /** Whether to include system performance metrics */
    includePerformanceMetrics?: boolean;
    /** Custom search terms for finding relevant tasks */
    searchTerms?: string[];
    /** Filter tasks by specific columns */
    columnFilter?: string[];
    /** Filter tasks by specific labels */
    labelFilter?: string[];
    /** LLM context enhancement options */
    contextEnhancement?: ContextEnhancementOptions;
}
/**
 * System performance metrics for healing context
 */
export interface SystemMetrics {
    /** Total number of tasks on the board */
    totalTasks: number;
    /** Number of tasks by status */
    tasksByStatus: Record<string, number>;
    /** WIP limit violations */
    wipViolations: Array<{
        column: string;
        current: number;
        limit: number;
        violation: number;
    }>;
    /** Tasks with missing or incomplete content */
    incompleteTasks: Array<{
        taskId: string;
        title: string;
        issues: string[];
    }>;
    /** Duplicate task detection results */
    duplicateTasks: Array<{
        title: string;
        count: number;
        taskIds: string[];
    }>;
    /** Board health score (0-100) */
    boardHealthScore: number;
    /** System performance indicators */
    performanceIndicators: {
        averageTaskAge: number;
        staleTaskCount: number;
        bottleneckColumns: string[];
        flowEfficiency: number;
    };
}
/**
 * Git analysis results for healing context
 */
export interface GitAnalysis {
    /** Current git HEAD commit */
    headCommit: GitCommit | null;
    /** Recent commits relevant to kanban operations */
    recentCommits: GitCommit[];
    /** Git repository status */
    repoStatus: {
        isClean: boolean;
        modified: string[];
        untracked: string[];
        branch: string;
    };
    /** Tags found in repository */
    tags: string[];
}
/**
 * Task analysis results for healing context
 */
export interface TaskAnalysis {
    /** Tasks requiring immediate attention */
    criticalTasks: Task[];
    /** Tasks that are stuck or blocked */
    stuckTasks: Array<{
        task: Task;
        stuckReason: string;
        daysInStatus: number;
    }>;
    /** Quality issues detected */
    qualityIssues: Array<{
        taskId: string;
        title: string;
        issues: string[];
        severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
    /** Estimate accuracy analysis */
    estimateAccuracy: {
        tasksWithEstimates: number;
        tasksWithoutEstimates: number;
        averageComplexity: number;
        estimateCoverage: number;
    };
}
/**
 * Main Scar Context Builder class
 *
 * Provides comprehensive context building for kanban healing operations by analyzing
 * board state, tasks, git history, and system metrics.
 */
export declare class ScarContextBuilder {
    private readonly boardPath;
    private readonly tasksDir;
    constructor(boardPath: string, tasksDir: string, _eventLogManager?: EventLogManager);
    /**
     * Build comprehensive scar context for healing operations
     */
    buildContext(reason: string, options?: ScarContextBuilderOptions): Promise<ScarContext>;
    /**
     * Analyze system metrics for board health and performance
     */
    private analyzeSystemMetrics;
    /**
     * Analyze tasks for quality issues and critical items
     */
    private analyzeTasks;
    /**
     * Analyze git history for relevant commits
     */
    private analyzeGitHistory;
    /**
     * Search for relevant tasks based on search terms
     */
    private searchRelevantTasks;
    /**
     * Create a search snippet showing why a task matched
     */
    private createSearchSnippet;
    /**
     * Load previous scar records for historical context
     */
    private loadPreviousScars;
    /**
     * Generate a tag for the current healing operation
     */
    private generateTag;
    /**
     * Generate a narrative for the healing operation
     */
    private generateNarrative;
    /**
     * Helper to get maximum severity
     */
    private maxSeverity;
    /**
     * Add an LLM operation to the context (for tracking AI-assisted healing)
     */
    addLLMOperation(context: ScarContext, operation: string, input: any, output: any, tokensUsed?: number): Promise<void>;
    /**
     * Update context with healing progress
     */
    updateProgress(context: ScarContext, operation: string, details: Record<string, any>, severity?: 'info' | 'warning' | 'error'): Promise<void>;
    /**
     * Finalize context and prepare for healing operations
     */
    finalizeContext(context: ScarContext): Promise<ScarContext>;
}
/**
 * Convenience function to create a scar context builder
 */
export declare function createScarContextBuilder(boardPath: string, tasksDir: string, eventLogManager?: EventLogManager): ScarContextBuilder;
/**
 * Default options for scar context building
 */
export declare const DEFAULT_SCAR_CONTEXT_OPTIONS: ScarContextBuilderOptions;
//# sourceMappingURL=scar-context-builder.d.ts.map