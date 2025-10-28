import type { IndexedTask } from './types.js';
import type { KanbanConfig, ReadonlySetLike } from './config/shared.js';
import type { TaskCache, TaskCacheOptions } from './task-cache.js';
export type IndexTasksOptions = Readonly<{
    readonly tasksDir: string;
    readonly exts: ReadonlySetLike<string>;
    readonly repoRoot: string;
}>;
export declare const indexTasks: ({ tasksDir, exts, repoRoot, }: IndexTasksOptions) => Promise<ReadonlyArray<IndexedTask>>;
export declare const serializeTasks: (tasks: ReadonlyArray<IndexedTask>) => ReadonlyArray<string>;
export declare const refreshTaskIndex: (config: Readonly<KanbanConfig>) => Promise<ReadonlyArray<IndexedTask>>;
export declare const writeIndexFile: (indexFilePath: string, lines: ReadonlyArray<string>) => Promise<void>;
/**
 * Create task cache options from kanban config
 */
export declare const createTaskCacheOptions: (config: KanbanConfig, overrides?: Partial<TaskCacheOptions>) => TaskCacheOptions;
/**
 * Index tasks into cache with streaming support
 */
export declare const indexTasksToCache: (options: Readonly<{
    readonly tasksDir: string;
    readonly exts: ReadonlySetLike<string>;
    readonly repoRoot: string;
    readonly cache: TaskCache;
}>) => Promise<{
    indexed: number;
    cache: TaskCache;
}>;
/**
 * Migrate existing JSONL index to TaskCache
 */
export declare const migrateJsonlToCache: (config: KanbanConfig, cache: TaskCache) => Promise<{
    migrated: number;
    errors: string[];
}>;
export declare const runIndexer: (options?: Readonly<{
    readonly argv?: ReadonlyArray<string>;
    readonly env?: NodeJS.ProcessEnv;
}>) => Promise<ReadonlyArray<IndexedTask>>;
//# sourceMappingURL=indexer.d.ts.map