import type { IndexedTask } from './types.js';
import type { TaskCache } from './task-cache.js';
import type { Task } from '../lib/types.js';
/**
 * Convert IndexedTask to Task (format used by board operations)
 */
export declare const indexedTaskToTask: (indexedTask: IndexedTask) => Task;
/**
 * Streaming task operations that work with TaskCache instead of memory arrays
 */
export declare class TaskOperations {
    private readonly cache;
    constructor(cache: TaskCache);
    /**
     * Get tasks by status with streaming support
     */
    getTasksByStatus(status: string, options?: Readonly<{
        limit?: number;
    }>): Promise<Task[]>;
    /**
     * Get single task by UUID
     */
    getTaskByUuid(uuid: string): Promise<Task | undefined>;
    /**
     * Search tasks with streaming results
     */
    searchTasks(query: string, options?: Readonly<{
        limit?: number;
    }>): Promise<Task[]>;
    /**
     * Get tasks by priority with streaming support
     */
    getTasksByPriority(priority: string, options?: Readonly<{
        limit?: number;
    }>): Promise<Task[]>;
    /**
     * Get tasks by label with streaming support
     */
    getTasksByLabel(label: string, options?: Readonly<{
        limit?: number;
    }>): Promise<Task[]>;
    /**
     * Count tasks by status (efficient operation using cache metadata)
     */
    countTasksByStatus(status: string): Promise<number>;
    /**
     * Count total tasks (uses cache metadata if available)
     */
    getTotalTaskCount(): Promise<number>;
    /**
     * Get task statistics without loading all tasks
     */
    getTaskStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
    }>;
    /**
     * Batch update tasks (for moving multiple tasks)
     */
    batchUpdateTasks(updates: Array<{
        uuid: string;
        updates: Partial<Pick<Task, 'status' | 'priority' | 'labels'>>;
    }>): Promise<{
        updated: number;
        errors: string[];
    }>;
    /**
     * Rebuild search index for all tasks
     */
    rebuildSearchIndex(): Promise<void>;
    /**
     * Clean up expired cache entries
     */
    cleanup(): Promise<number>;
    /**
     * Close the cache connection
     */
    close(): Promise<void>;
}
/**
 * Factory function to create TaskOperations instance
 */
export declare const createTaskOperations: (cache: TaskCache) => TaskOperations;
//# sourceMappingURL=task-operations.d.ts.map