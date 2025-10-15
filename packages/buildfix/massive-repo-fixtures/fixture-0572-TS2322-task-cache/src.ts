import type { IndexedTask } from "./types.js";
import { openLevelCache, type Cache } from "@promethean/level-cache";

/**
 * TaskCache interface for efficient task storage and retrieval
 * Abstracts over level-cache to provide task-specific operations
 */
export interface TaskCache {
  // Direct access operations
  getTask(uuid: string): Promise<IndexedTask | undefined>;
  hasTask(uuid: string): Promise<boolean>;
  setTask(task: IndexedTask): Promise<void>;
  removeTask(uuid: string): Promise<void>;

  // Query operations (streaming for large result sets)
  getTasksByStatus(status: string): AsyncIterable<IndexedTask>;
  getTasksByPriority(priority: string): AsyncIterable<IndexedTask>;
  getTasksByLabel(label: string): AsyncIterable<IndexedTask>;
  searchTasks(query: string): AsyncIterable<IndexedTask>;

  // Batch operations
  indexTasks(tasks: Iterable<IndexedTask>): Promise<number>;

  // Cache management
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
  defaultTtlMs?: string;
  /** Cache namespace */
  namespace?: string;
}>;

/**
 * Internal cache key generators
 */
const CacheKeys = {
  taskById: (uuid: string) => `task/by-id/${uuid}`,
  tasksByStatus: (status: string) => `index/by-status/${status}`,
  tasksByPriority: (priority: string) => `index/by-priority/${priority}`,
  tasksByLabel: (label: string) => `index/by-label/${label}`,
  searchIndex: (term: string) => `index/search/${term}`,
  meta: (key: string) => `meta/${key}`,
} as const;

/**
 * Level-cache based TaskCache implementation
 */
export class LevelTaskCache implements TaskCache {
  private readonly tasksCache: Cache<IndexedTask>;
  private readonly indexesCache: Cache<string[]>;
  private readonly metaCache: Cache<{ value: any; timestamp?: string }>;

  private constructor(
    tasksCache: Cache<IndexedTask>,
    indexesCache: Cache<string[]>,
    metaCache: Cache<{ value: any; timestamp?: string }>,
  ) {
    this.tasksCache = tasksCache;
    this.indexesCache = indexesCache;
    this.metaCache = metaCache;
  }

  /**
   * Initialize the cache with proper level-cache instances
   */
  static async create(options: TaskCacheOptions): Promise<LevelTaskCache> {
    // Create single cache with multiple namespaces to avoid connection conflicts
    const baseCache = await openLevelCache<any>({
      path: options.path,
      namespace: options.namespace || 'kanban',
      defaultTtlMs: options.defaultTtlMs,
    });

    // Create namespaced instances from the same base cache
    const tasksCache = baseCache.withNamespace('tasks');
    const indexesCache = baseCache.withNamespace('indexes');
    const metaCache = baseCache.withNamespace('meta');

    return new LevelTaskCache(tasksCache, indexesCache, metaCache);
  }

  async getTask(uuid: string): Promise<IndexedTask | undefined> {
    if (!uuid) return undefined;
    return this.tasksCache.get(CacheKeys.taskById(uuid));
  }

  async hasTask(uuid: string): Promise<boolean> {
    if (!uuid) return false;
    return this.tasksCache.has(CacheKeys.taskById(uuid));
  }

  async setTask(task: IndexedTask): Promise<void> {
    if (!task.uuid) return;
    const key = CacheKeys.taskById(task.uuid);

    // Store the task
    await this.tasksCache.set(key, task);

    // Update indexes
    await this.updateTaskIndexes(task);

    // Update metadata
    await this.metaCache.set(CacheKeys.meta('last-indexed'), {
      value: new Date().toISOString(),
      timestamp: Date.now()
    });
  }

  async removeTask(uuid: string): Promise<void> {
    const task = await this.getTask(uuid);
    if (!task) return;

    // Remove from primary storage
    await this.tasksCache.del(CacheKeys.taskById(uuid));

    // Remove from indexes
    await this.removeFromTaskIndexes(task);
  }

  async *getTasksByStatus(status: string): AsyncIterable<IndexedTask> {
    const taskIds = await this.indexesCache.get(CacheKeys.tasksByStatus(status)) || [];

    for (const uuid of taskIds) {
      const task = await this.getTask(uuid);
      if (task) {
        yield task;
      }
    }
  }

  async *getTasksByPriority(priority: string): AsyncIterable<IndexedTask> {
    const taskIds = await this.indexesCache.get(CacheKeys.tasksByPriority(priority)) || [];

    for (const uuid of taskIds) {
      const task = await this.getTask(uuid);
      if (task) {
        yield task;
      }
    }
  }

  async *getTasksByLabel(label: string): AsyncIterable<IndexedTask> {
    const taskIds = await this.indexesCache.get(CacheKeys.tasksByLabel(label)) || [];

    for (const uuid of taskIds) {
      const task = await this.getTask(uuid);
      if (task) {
        yield task;
      }
    }
  }

  async *searchTasks(query: string): AsyncIterable<IndexedTask> {
    const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    if (terms.length === 0) return;

    // Get task IDs for each search term
    const taskIdSets = await Promise.all(
      terms.map(term => this.indexesCache.get(CacheKeys.searchIndex(term)) || [])
    );

    // Find intersection (tasks that match all terms)
    const commonTaskIds = taskIdSets.reduce((intersection, taskIds) => {
      if (!intersection || intersection.length === 0) return taskIds || [];
      return intersection.filter(uuid => taskIds && taskIds.includes(uuid));
    }, taskIdSets[0] || []);

    // Yield matching tasks
    if (commonTaskIds) {
      for (const uuid of commonTaskIds) {
        const task = await this.getTask(uuid);
        if (task) {
          yield task;
        }
      }
    }
  }

  async indexTasks(tasks: Iterable<IndexedTask>): Promise<number> {
    let indexedCount = 0;

    for (const task of tasks) {
      await this.setTask(task);
      indexedCount++;
    }

    // Update task count metadata
    await this.metaCache.set(CacheKeys.meta('task-count'), {
      value: indexedCount,
      timestamp: Date.now()
    });

    return indexedCount;
  }

  async getTaskCount(): Promise<number> {
    // Count tasks directly from the task cache for accuracy
    let count = 0;
    for await (const [_key, _task] of this.tasksCache.entries()) {
      count++;
    }

    // Update the cached count for future queries
    await this.metaCache.set(CacheKeys.meta('task-count'), {
      value: count,
      timestamp: Date.now()
    });

    return count;
  }

  async getLastIndexed(): Promise<Date | undefined> {
    const meta = await this.metaCache.get(CacheKeys.meta('last-indexed'));
    return meta?.value ? new Date(meta.value) : undefined;
  }

  async rebuildIndex(): Promise<void> {
    // Clear all indexes
    await this.clearAllIndexes();

    // Rebuild indexes from tasks
    const tasks: IndexedTask[] = [];
    for await (const [, task] of this.tasksCache.entries()) {
      tasks.push(task);
    }

    // Re-index all tasks
    await this.indexTasks(tasks);
  }

  async sweepExpired(): Promise<number> {
    // Sweep expired entries from all caches
    const tasksRemoved = await this.tasksCache.sweepExpired();
    const indexesRemoved = await this.indexesCache.sweepExpired();
    const metaRemoved = await this.metaCache.sweepExpired();

    return tasksRemoved + indexesRemoved + metaRemoved;
  }

  async close(): Promise<void> {
    // With namespaced caches sharing the same underlying database,
    // we only need to close one of them
    await this.tasksCache.close();
  }

  /**
   * Update indexes when a task is added/modified
   */
  private async updateTaskIndexes(task: IndexedTask): Promise<void> {
    const uuid = task.uuid;
    if (!uuid) return;

    // Status index
    if (task.status) {
      await this.addToIndex(CacheKeys.tasksByStatus(task.status), uuid);
    }

    // Priority index
    if (task.priority) {
      await this.addToIndex(CacheKeys.tasksByPriority(String(task.priority)), uuid);
    }

    // Label indexes
    if (task.labels) {
      for (const label of task.labels) {
        await this.addToIndex(CacheKeys.tasksByLabel(label), uuid);
      }
    }

    // Search index (index title and content)
    await this.updateSearchIndex(task);
  }

  /**
   * Remove task from all indexes
   */
  private async removeFromTaskIndexes(task: IndexedTask): Promise<void> {
    const uuid = task.uuid;
    if (!uuid) return;

    // Remove from status index
    if (task.status) {
      await this.removeFromIndex(CacheKeys.tasksByStatus(task.status), uuid);
    }

    // Remove from priority index
    if (task.priority) {
      await this.removeFromIndex(CacheKeys.tasksByPriority(String(task.priority)), uuid);
    }

    // Remove from label indexes
    if (task.labels) {
      for (const label of task.labels) {
        await this.removeFromIndex(CacheKeys.tasksByLabel(label), uuid);
      }
    }

    // Remove from search index
    await this.removeFromSearchIndex(task);
  }

  /**
   * Add UUID to an index set
   */
  private async addToIndex(indexKey: string, uuid: string): Promise<void> {
    if (!indexKey || !uuid) return;
    const current = await this.indexesCache.get(indexKey) || [];
    if (!current.includes(uuid)) {
      await this.indexesCache.set(indexKey, [...current, uuid]);
    }
  }

  /**
   * Remove UUID from an index set
   */
  private async removeFromIndex(indexKey: string, uuid: string): Promise<void> {
    if (!indexKey || !uuid) return;
    const current = await this.indexesCache.get(indexKey) || [];
    const filtered = current.filter(id => id !== uuid);
    await this.indexesCache.set(indexKey, filtered);
  }

  /**
   * Update search index for a task
   */
  private async updateSearchIndex(task: IndexedTask): Promise<void> {
    const searchableText = [
      task.title || '',
      task.content || '',
      ...(task.labels || [])
    ].join(' ').toLowerCase();

    // Extract terms (simple word tokenization)
    const terms = searchableText.split(/\s+/)
      .map(term => term.replace(/[^\w]/g, ''))
      .filter(term => term.length > 2)
      .filter((term, index, array) => array.indexOf(term) === index); // unique

    // Add task ID to each term's index
    for (const term of terms) {
      if (task.uuid) {
        await this.addToIndex(CacheKeys.searchIndex(term), task.uuid);
      }
    }
  }

  /**
   * Remove task from search index
   */
  private async removeFromSearchIndex(task: IndexedTask): Promise<void> {
    const searchableText = [
      task.title || '',
      task.content || '',
      ...(task.labels || [])
    ].join(' ').toLowerCase();

    const terms = searchableText.split(/\s+/)
      .map(term => term.replace(/[^\w]/g, ''))
      .filter(term => term.length > 2)
      .filter((term, index, array) => array.indexOf(term) === index);

    for (const term of terms) {
      if (task.uuid) {
        await this.removeFromIndex(CacheKeys.searchIndex(term), task.uuid);
      }
    }
  }

  /**
   * Clear all indexes (used for rebuild)
   */
  private async clearAllIndexes(): Promise<void> {
    const indexes: string[] = [];

    // Collect all index keys
    for await (const [key] of this.indexesCache.entries()) {
      if (key.startsWith('index/')) {
        indexes.push(key);
      }
    }

    // Delete all indexes
    if (indexes.length > 0) {
      await this.indexesCache.batch(
        indexes.map(key => ({ type: 'del', key }))
      );
    }
  }
}

/**
 * Factory function to create a TaskCache instance
 */
export const createTaskCache = async (options: TaskCacheOptions): Promise<TaskCache> => {
  return await LevelTaskCache.create(options);
};