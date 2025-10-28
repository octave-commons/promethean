/**
 * Git Tag Management for Kanban Healing Operations
 *
 * This module provides comprehensive git tag management capabilities for tracking
 * heal operations in the kanban system. It handles tag creation, retrieval,
 * and scar history management with proper git integration.
 */
import type { ScarRecord, GitCommit } from './scar-context-types.js';
/**
 * Git tag configuration options
 */
export interface GitTagManagerOptions {
    /** Prefix for heal operation tags */
    tagPrefix?: string;
    /** Directory to store scar history */
    scarHistoryDir?: string;
    /** Maximum number of scars to retain */
    maxScarsRetained?: number;
    /** Whether to create annotated tags */
    createAnnotatedTags?: boolean;
    /** Tag signing configuration */
    signTags?: boolean;
}
/**
 * Tag creation result
 */
export interface TagCreationResult {
    /** Whether tag creation was successful */
    success: boolean;
    /** The tag that was created */
    tag: string;
    /** The commit SHA the tag points to */
    commitSha: string;
    /** Any error message if creation failed */
    error?: string;
    /** Additional metadata about the tag */
    metadata: {
        created: Date;
        message: string;
        annotated: boolean;
    };
}
/**
 * Scar history storage result
 */
export interface ScarHistoryResult {
    /** Whether the operation was successful */
    success: boolean;
    /** Number of scars stored */
    scarCount: number;
    /** Path to the scar history file */
    filePath: string;
    /** Any error message if operation failed */
    error?: string;
}
/**
 * Git tag manager for kanban healing operations
 */
export declare class GitTagManager {
    private readonly repoRoot;
    private readonly options;
    private readonly scarHistoryPath;
    constructor(repoRoot: string, options?: GitTagManagerOptions);
    /**
     * Create a git tag for a healing operation
     */
    createHealTag(reason: string, startSha?: string, metadata?: Record<string, any>): Promise<TagCreationResult>;
    /**
     * Store a scar record in the history
     */
    storeScarRecord(scar: ScarRecord): Promise<ScarHistoryResult>;
    /**
     * Load scar history from storage
     */
    loadScarHistory(): Promise<ScarRecord[]>;
    /**
     * Get all heal tags from the repository
     */
    getHealTags(): Promise<string[]>;
    /**
     * Get commits between two tags (for scar range)
     */
    getCommitsBetweenTags(startTag: string, endTag?: string): Promise<GitCommit[]>;
    /**
     * Get detailed information about a tag
     */
    getTagInfo(tag: string): Promise<{
        commit: string;
        message: string;
        author: string;
        timestamp: Date;
    } | null>;
    /**
     * Delete a tag (for cleanup or rollback)
     */
    deleteTag(tag: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Push tags to remote repository
     */
    pushTags(tags?: string[]): Promise<{
        success: boolean;
        pushed: string[];
        error?: string;
    }>;
    /**
     * Clean up old scar records (retention management)
     */
    cleanupOldScars(): Promise<{
        removed: number;
        remaining: number;
    }>;
    /**
     * Validate that we're in a git repository
     */
    private validateGitRepository;
    /**
     * Get current HEAD commit SHA
     */
    private getCurrentHeadSha;
    /**
     * Create an annotated git tag
     */
    private createAnnotatedTag;
    /**
     * Create a lightweight git tag
     */
    private createLightweightTag;
    /**
     * Get files changed in a commit
     */
    private getCommitFiles;
    /**
     * Generate a tag message from reason and metadata
     */
    private generateTagMessage;
}
/**
 * Convenience function to create a git tag manager
 */
export declare function createGitTagManager(repoRoot: string, options?: GitTagManagerOptions): GitTagManager;
/**
 * Default options for git tag management
 */
export declare const DEFAULT_GIT_TAG_MANAGER_OPTIONS: Required<GitTagManagerOptions>;
//# sourceMappingURL=git-tag-manager.d.ts.map