/**
 * Git Event Reconstructor
 *
 * Reconstructs kanban event log from git history by analyzing task file changes
 * and extracting status transitions over time.
 */
import type { TransitionEvent } from '../board/event-log/types.js';
import type { KanbanConfig } from '../board/config/shared.js';
export interface GitCommit {
    sha: string;
    timestamp: string;
    author: string;
    message: string;
    files: string[];
}
export interface TaskStatusAtCommit {
    commitSha: string;
    timestamp: string;
    status: string;
    filePath: string;
}
export interface ReconstructedEvent {
    taskId: string;
    fromStatus: string;
    toStatus: string;
    timestamp: string;
    commitSha: string;
    author: string;
    message: string;
}
export interface GitEventReconstructorOptions {
    repoRoot?: string;
    tasksDir: string;
    since?: string;
    taskUuidFilter?: string;
    dryRun?: boolean;
    verbose?: boolean;
}
/**
 * Reconstructs kanban events from git history
 */
export declare class GitEventReconstructor {
    private readonly repoRoot;
    private readonly tasksDir;
    private readonly options;
    constructor(options: GitEventReconstructorOptions);
    /**
     * Get all commits that modified task files
     */
    private getTaskCommits;
    /**
     * Extract task UUID from file path or content
     */
    private extractTaskUuid;
    /**
     * Extract status from task file content
     */
    private extractTaskStatus;
    /**
     * Get task file content at specific commit
     */
    private getTaskContentAtCommit;
    /**
     * Analyze status changes for a single task across commits
     */
    private analyzeTaskStatusHistory;
    /**
     * Reconstruct all events from git history
     */
    reconstructEvents(options?: {
        taskUuidFilter?: string;
        dryRun?: boolean;
        verbose?: boolean;
    }): TransitionEvent[];
    /**
     * Get statistics about reconstruction
     */
    getReconstructionStats(events: TransitionEvent[]): {
        totalEvents: number;
        uniqueTasks: number;
        dateRange: {
            earliest: string | null;
            latest: string | null;
        };
        transitionTypes: Record<string, number>;
    };
}
/**
 * Factory function to create event reconstructor
 */
export declare const makeGitEventReconstructor: (config: KanbanConfig, options?: Omit<GitEventReconstructorOptions, "tasksDir">) => GitEventReconstructor;
//# sourceMappingURL=git-event-reconstructor.d.ts.map