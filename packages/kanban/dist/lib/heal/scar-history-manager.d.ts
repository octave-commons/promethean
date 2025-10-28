/**
 * Scar History Manager for Kanban Healing Operations
 *
 * This module provides comprehensive scar history management capabilities for tracking
 * and analyzing healing operations over time. It maintains persistent storage,
 * provides search and analysis capabilities, and integrates with git tag management.
 */
import type { ScarRecord, ScarContext, GitCommit, HealingResult } from './scar-context-types.js';
/**
 * Scar history query options
 */
export interface ScarHistoryQuery {
    /** Filter by tag pattern */
    tagPattern?: string;
    /** Filter by date range */
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    /** Filter by content in story */
    storyContains?: string;
    /** Limit number of results */
    limit?: number;
    /** Sort order */
    sortBy?: 'timestamp' | 'tag';
    sortOrder?: 'asc' | 'desc';
}
/**
 * Scar analysis results
 */
export interface ScarAnalysis {
    /** Total number of scars */
    totalScars: number;
    /** Scars by time period */
    scarsByPeriod: {
        daily: Record<string, number>;
        weekly: Record<string, number>;
        monthly: Record<string, number>;
    };
    /** Most common healing reasons */
    commonReasons: Array<{
        reason: string;
        count: number;
        percentage: number;
    }>;
    /** Healing success rate */
    successRate: number;
    /** Average healing time (if available) */
    averageHealingTime?: number;
    /** Files most frequently involved in healing */
    frequentlyHealedFiles: Array<{
        file: string;
        count: number;
    }>;
}
/**
 * Scar history storage configuration
 */
export interface ScarHistoryConfig {
    /** Directory to store scar history */
    storageDir?: string;
    /** Maximum number of scars to retain */
    maxScarsRetained?: number;
    /** Whether to compress old scar data */
    compressOldData?: boolean;
    /** Age threshold for compression (days) */
    compressionThreshold?: number;
}
/**
 * Scar history manager for comprehensive healing operation tracking
 */
export declare class ScarHistoryManager {
    private readonly repoRoot;
    private readonly config;
    private readonly gitTagManager;
    private readonly scarHistoryPath;
    constructor(repoRoot: string, config?: ScarHistoryConfig);
    /**
     * Record a new healing operation
     */
    recordHealingOperation(context: ScarContext, result: HealingResult, startSha: string, endSha: string): Promise<{
        success: boolean;
        scar?: ScarRecord;
        error?: string;
    }>;
    /**
     * Query scar history
     */
    queryScars(query?: ScarHistoryQuery): Promise<ScarRecord[]>;
    /**
     * Get detailed scar information including commits
     */
    getScarDetails(scarTag: string): Promise<{
        scar: ScarRecord | null;
        commits: GitCommit[];
        context?: ScarContext;
        result?: HealingResult;
    }>;
    /**
     * Analyze scar history for insights
     */
    analyzeScars(): Promise<ScarAnalysis>;
    /**
     * Get scars that might be related to a current issue
     */
    findRelatedScars(currentIssue: string, maxResults?: number): Promise<Array<{
        scar: ScarRecord;
        relevance: number;
        reason: string;
    }>>;
    /**
     * Export scar history to various formats
     */
    exportScars(format?: 'json' | 'csv' | 'markdown', query?: ScarHistoryQuery): Promise<string>;
    /**
     * Import scar history from backup
     */
    importScars(data: string, format?: 'json' | 'csv'): Promise<{
        success: boolean;
        imported: number;
        duplicates: number;
        errors: string[];
    }>;
    /**
     * Load all scar records
     */
    private loadAllScars;
    /**
     * Store additional scar context data
     */
    private storeScarContext;
    /**
     * Load scar context data
     */
    private loadScarContext;
    /**
     * Load scar result data
     */
    private loadScarResult;
    /**
     * Generate scar story from context and result
     */
    private generateScarStory;
    /**
     * Analyze scars by time period
     */
    private analyzeScarsByPeriod;
    /**
     * Analyze common healing reasons
     */
    private analyzeCommonReasons;
    /**
     * Calculate healing success rate
     */
    private calculateSuccessRate;
    /**
     * Calculate average healing time
     */
    private calculateAverageHealingTime;
    /**
     * Analyze frequently healed files
     */
    private analyzeFrequentlyHealedFiles;
    /**
     * Check if two issues have similar patterns
     */
    private hasSimilarPattern;
    /**
     * Generate CSV export of scars
     */
    private generateScarsCSV;
    /**
     * Generate markdown export of scars
     */
    private generateScarsMarkdown;
    /**
     * Parse scars from CSV
     */
    private parseScarsCSV;
    /**
     * Enforce retention policy
     */
    private enforceRetentionPolicy;
}
/**
 * Convenience function to create a scar history manager
 */
export declare function createScarHistoryManager(repoRoot: string, config?: ScarHistoryConfig): ScarHistoryManager;
//# sourceMappingURL=scar-history-manager.d.ts.map