/**
 * Task Git Tracker
 *
 * Provides read-only git integration for tracking task changes with commit SHAs
 * to eliminate orphaned task problems and improve auditability.
 *
 * NOTE: This tracker is READ-ONLY - it never creates commits, only detects them.
 */
export interface TaskCommitEntry {
    sha: string;
    timestamp: string;
    message: string;
    author: string;
    type: 'create' | 'update' | 'status_change' | 'move';
}
export interface TaskGitTrackingOptions {
    repoRoot?: string;
    author?: string;
}
/**
 * Tracks task changes with read-only git commit detection for auditability
 */
export declare class TaskGitTracker {
    private readonly repoRoot;
    constructor(options?: TaskGitTrackingOptions);
    /**
     * Gets current git HEAD SHA
     */
    getCurrentCommitSha(): string;
    /**
     * Gets the last commit that modified a specific file
     */
    getLastCommitForFile(filePath: string): TaskCommitEntry | null;
    /**
     * Creates a standardized commit message for task operations
     */
    createTaskCommitMessage(taskUuid: string, operation: 'create' | 'update' | 'status_change' | 'move', details?: string): string;
    /**
     * Updates task frontmatter with commit tracking information (read-only)
     */
    updateTaskCommitTracking(frontmatter: Record<string, any>, taskFilePath: string, taskUuid: string, operation: 'create' | 'update' | 'status_change' | 'move', details?: string): Record<string, any>;
    /**
     * Validates that a task has proper commit tracking
     */
    validateTaskCommitTracking(frontmatter: Record<string, any>): {
        isValid: boolean;
        issues: string[];
    };
    /**
     * Gets default author from git config
     */
    /**
     * Checks if a task is "orphaned" (lacks proper commit tracking)
     */
    isTaskOrphaned(frontmatter: Record<string, any>): boolean;
    /**
     * Enhanced orphaned task detection that distinguishes between truly orphaned and untracked tasks
     */
    analyzeTaskStatus(frontmatter: Record<string, any>, taskFilePath?: string): {
        isTrulyOrphaned: boolean;
        isUntracked: boolean;
        isHealthy: boolean;
        issues: string[];
        recommendations: string[];
    };
    /**
     * Gets statistics about commit tracking across tasks
     */
    getCommitTrackingStats(tasks: Array<{
        frontmatter?: Record<string, any>;
    }>): {
        total: number;
        withCommitTracking: number;
        orphaned: number;
        orphanageRate: number;
    };
}
/**
 * Default task git tracker instance
 */
export declare const defaultTaskGitTracker: TaskGitTracker;
/**
 * Convenience function to update task commit tracking
 */
export declare function updateTaskCommitTracking(frontmatter: Record<string, any>, taskFilePath: string, taskUuid: string, operation: 'create' | 'update' | 'status_change' | 'move', details?: string): Record<string, any>;
/**
 * Convenience function to validate task commit tracking
 */
export declare function validateTaskCommitTracking(frontmatter: Record<string, any>): {
    isValid: boolean;
    issues: string[];
};
//# sourceMappingURL=task-git-tracker.d.ts.map