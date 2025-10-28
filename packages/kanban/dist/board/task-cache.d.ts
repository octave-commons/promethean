import type { IndexedTask } from "./types.js";
/**
 * TaskCache interface for efficient task storage and retrieval
 * Abstracts over lmdb-cache to provide task-specific operations
 */
export interface TaskCache {
    getTask(uuid: string): Promise<IndexedTask | undefined>;
    hasTask(uuid: string): Promise<boolean>;
    setTask(task: IndexedTask): Promise<void>;
    removeTask(uuid: string): Promise<void>;
    getTasksByStatus(status: string): AsyncIterable<IndexedTask>;
    getTasksByPriority(priority: string): AsyncIterable<IndexedTask>;
    getTasksByLabel(label: string): AsyncIterable<IndexedTask>;
    searchTasks(query: string): AsyncIterable<IndexedTask>;
    indexTasks(tasks: Iterable<IndexedTask>): Promise<number>;
    getTaskCount(): Promise<number>;
    getLastIndexed(): Promise<Date | undefined>;
    rebuildIndex(): Promise<void>;
    sweepExpired(): Promise<number>;
    close(): Promise<void>;
}
/**
 * Cache configuration options
 */
export type TaskCacheOptions = Readonly<{
    /** Cache directory path */
    path: string;
    /** Default TTL for cached tasks (ms) */
    defaultTtlMs?: number;
    /** Cache namespace */
    namespace?: string;
}>;
/**
 * LMDB-cache based TaskCache implementation
 */
export declare class LmdbTaskCache implements TaskCache {
    private readonly tasksCache;
    private readonly indexesCache;
    private readonly metaCache;
    private constructor();
    /**
     * Initialize the cache with proper lmdb-cache instances
     */
    static create(options: TaskCacheOptions): Promise<LmdbTaskCache>;
    getTask(uuid: string): Promise<IndexedTask | undefined>;
    hasTask(uuid: string): Promise<boolean>;
    setTask(task: IndexedTask): Promise<void>;
    removeTask(uuid: string): Promise<void>;
    getTasksByStatus(status: string): AsyncIterable<IndexedTask>;
    getTasksByPriority(priority: string): AsyncIterable<IndexedTask>;
    getTasksByLabel(label: string): AsyncIterable<IndexedTask>;
    searchTasks(query: string): AsyncIterable<IndexedTask>;
    indexTasks(tasks: Iterable<IndexedTask>): Promise<number>;
    getTaskCount(): Promise<number>;
    getLastIndexed(): Promise<Date | undefined>;
    rebuildIndex(): Promise<void>;
    sweepExpired(): Promise<number>;
    close(): Promise<void>;
    /**
     * Update indexes when a task is added/modified
     */
    private updateTaskIndexes;
    /**
     * Remove task from all indexes
     */
    private removeFromTaskIndexes;
    /**
     * Add UUID to an index set
     */
    private addToIndex;
    /**
     * Remove UUID from an index set
     */
    private removeFromIndex;
    /**
     * Update search index for a task
     */
    private updateSearchIndex;
    /**
     * Remove task from search index
     */
    private removeFromSearchIndex;
    /**
     * Clear all indexes (used for rebuild)
     */
    private clearAllIndexes;
}
/**
 * Factory function to create a TaskCache instance
 */
export declare const createTaskCache: (options: TaskCacheOptions) => Promise<TaskCache>;
//# sourceMappingURL=task-cache.d.ts.map