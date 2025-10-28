/**
 * Main Heal Command Implementation for Kanban System
 *
 * This module provides the complete heal command implementation that integrates
 * git tag management, scar history, and intelligent healing operations.
 * It orchestrates the entire healing workflow from analysis to completion.
 */
import type { HealingResult } from './scar-context-types.js';
/**
 * Heal command configuration options
 */
export interface HealCommandOptions {
    /** Reason for the healing operation */
    reason: string;
    /** Whether to perform a dry run (no changes) */
    dryRun?: boolean;
    /** Whether to create git tags */
    createTags?: boolean;
    /** Whether to push tags to remote */
    pushTags?: boolean;
    /** Whether to analyze git history */
    analyzeGit?: boolean;
    /** Maximum git history depth */
    gitHistoryDepth?: number;
    /** Search terms for finding relevant tasks */
    searchTerms?: string[];
    /** Filter tasks by specific columns */
    columnFilter?: string[];
    /** Filter tasks by specific labels */
    labelFilter?: string[];
    /** Whether to include task analysis */
    includeTaskAnalysis?: boolean;
    /** Whether to include performance metrics */
    includePerformanceMetrics?: boolean;
    /** Custom git tag manager options */
    gitTagOptions?: {
        tagPrefix?: string;
        signTags?: boolean;
    };
    /** Custom scar history options */
    scarHistoryOptions?: {
        maxScarsRetained?: number;
        compressOldData?: boolean;
    };
}
/**
 * Healing operation result with additional metadata
 */
export interface ExtendedHealingResult extends HealingResult {
    /** The scar record that was created */
    scar?: {
        tag: string;
        startSha: string;
        endSha: string;
    };
    /** Git tag creation result */
    tagResult?: {
        success: boolean;
        tag: string;
        error?: string;
    };
    /** Context building time in milliseconds */
    contextBuildTime?: number;
    /** Healing operation time in milliseconds */
    healingTime?: number;
    /** Total operation time in milliseconds */
    totalTime?: number;
}
/**
 * Main heal command class
 */
export declare class HealCommand {
    private readonly boardPath;
    private readonly tasksDir;
    private readonly repoRoot;
    private readonly gitTagManager;
    private readonly scarHistoryManager;
    constructor(boardPath: string, tasksDir: string);
    /**
     * Execute the complete healing operation
     */
    execute(options: HealCommandOptions): Promise<ExtendedHealingResult>;
    /**
     * Get healing recommendations based on current state
     */
    getHealingRecommendations(options?: Partial<HealCommandOptions>): Promise<{
        recommendations: string[];
        criticalIssues: Array<{
            type: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            suggestedAction: string;
        }>;
        relatedScars: Array<{
            scar: any;
            relevance: number;
            reason: string;
        }>;
    }>;
    /**
     * Get scar history analysis
     */
    getScarHistoryAnalysis(): Promise<import("./scar-history-manager.js").ScarAnalysis>;
    /**
     * Build scar context for healing operations
     */
    private buildScarContext;
    /**
     * Perform the actual healing operations
     */
    private performHealing;
    /**
     * Determine what healing actions to take based on context
     */
    private determineHealingActions;
    /**
     * Execute a specific healing action
     */
    private executeHealingAction;
    /**
     * Analyze system metrics from context
     */
    private analyzeSystemMetrics;
    /**
     * Get current commit SHA
     */
    private getCurrentCommitSha;
}
/**
 * Convenience function to create a heal command
 */
export declare function createHealCommand(boardPath: string, tasksDir: string): HealCommand;
/**
 * Default options for heal command
 */
export declare const DEFAULT_HEAL_COMMAND_OPTIONS: Partial<HealCommandOptions>;
//# sourceMappingURL=heal-command.d.ts.map