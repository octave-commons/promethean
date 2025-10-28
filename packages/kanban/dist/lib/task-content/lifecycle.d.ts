/**
 * Task lifecycle management operations
 * Handles task archiving, deletion, and merging operations
 */
import type { TaskArchiveRequest, TaskDeleteRequest, TaskMergeRequest, TaskLifecycleOptions, TaskArchiveResult, TaskDeleteResult, TaskMergeResult } from './types.js';
import { TaskContentManager } from './index.js';
/**
 * Task Lifecycle Manager
 * Handles advanced task operations including archiving, deletion, and merging
 */
export declare class TaskLifecycleManager {
    private readonly contentManager;
    private readonly tasksDir;
    private readonly archiveDir?;
    constructor(contentManager: TaskContentManager, tasksDir: string, archiveDir?: string | undefined);
    /**
     * Archive a task by moving it to the archive directory and updating its status
     */
    archiveTask(request: TaskArchiveRequest): Promise<TaskArchiveResult>;
    /**
     * Delete a task permanently (with confirmation)
     */
    deleteTask(request: TaskDeleteRequest): Promise<TaskDeleteResult>;
    /**
     * Merge multiple tasks into a single target task
     */
    mergeTasks(request: TaskMergeRequest): Promise<TaskMergeResult>;
    /**
     * Bulk archive multiple tasks
     */
    bulkArchive(uuids: string[], reason?: string, options?: TaskLifecycleOptions): Promise<TaskArchiveResult[]>;
    /**
     * Bulk delete multiple tasks
     */
    bulkDelete(uuids: string[], confirm: boolean, force?: boolean, options?: TaskLifecycleOptions): Promise<TaskDeleteResult[]>;
}
//# sourceMappingURL=lifecycle.d.ts.map