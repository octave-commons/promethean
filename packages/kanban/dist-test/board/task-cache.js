import { openLevelCache } from "@promethean/level-cache";
/**
 * Internal cache key generators
 */
const CacheKeys = {
    taskById: (uuid) => `task/by-id/${uuid}`,
    tasksByStatus: (status) => `index/by-status/${status}`,
    tasksByPriority: (priority) => `index/by-priority/${priority}`,
    tasksByLabel: (label) => `index/by-label/${label}`,
    searchIndex: (term) => `index/search/${term}`,
    meta: (key) => `meta/${key}`,
};
/**
 * Level-cache based TaskCache implementation
 */
export class LevelTaskCache {
    constructor(tasksCache, indexesCache, metaCache) {
        this.tasksCache = tasksCache;
        this.indexesCache = indexesCache;
        this.metaCache = metaCache;
    }
    /**
     * Initialize the cache with proper level-cache instances
     */
    static async create(options) {
        // Create single cache with multiple namespaces to avoid connection conflicts
        const baseCache = await openLevelCache({
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
    async getTask(uuid) {
        if (!uuid)
            return undefined;
        return this.tasksCache.get(CacheKeys.taskById(uuid));
    }
    async hasTask(uuid) {
        if (!uuid)
            return false;
        return this.tasksCache.has(CacheKeys.taskById(uuid));
    }
    async setTask(task) {
        if (!task.uuid)
            return;
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
    async removeTask(uuid) {
        const task = await this.getTask(uuid);
        if (!task)
            return;
        // Remove from primary storage
        await this.tasksCache.del(CacheKeys.taskById(uuid));
        // Remove from indexes
        await this.removeFromTaskIndexes(task);
    }
    async *getTasksByStatus(status) {
        const taskIds = await this.indexesCache.get(CacheKeys.tasksByStatus(status)) || [];
        for (const uuid of taskIds) {
            const task = await this.getTask(uuid);
            if (task) {
                yield task;
            }
        }
    }
    async *getTasksByPriority(priority) {
        const taskIds = await this.indexesCache.get(CacheKeys.tasksByPriority(priority)) || [];
        for (const uuid of taskIds) {
            const task = await this.getTask(uuid);
            if (task) {
                yield task;
            }
        }
    }
    async *getTasksByLabel(label) {
        const taskIds = await this.indexesCache.get(CacheKeys.tasksByLabel(label)) || [];
        for (const uuid of taskIds) {
            const task = await this.getTask(uuid);
            if (task) {
                yield task;
            }
        }
    }
    async *searchTasks(query) {
        const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        if (terms.length === 0)
            return;
        // Get task IDs for each search term
        const taskIdSets = await Promise.all(terms.map(term => this.indexesCache.get(CacheKeys.searchIndex(term)) || []));
        // Find intersection (tasks that match all terms)
        const commonTaskIds = taskIdSets.reduce((intersection, taskIds) => {
            if (!intersection || intersection.length === 0)
                return taskIds || [];
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
    async indexTasks(tasks) {
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
    async getTaskCount() {
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
    async getLastIndexed() {
        const meta = await this.metaCache.get(CacheKeys.meta('last-indexed'));
        return meta?.value ? new Date(meta.value) : undefined;
    }
    async rebuildIndex() {
        // Clear all indexes
        await this.clearAllIndexes();
        // Rebuild indexes from tasks
        const tasks = [];
        for await (const [, task] of this.tasksCache.entries()) {
            tasks.push(task);
        }
        // Re-index all tasks
        await this.indexTasks(tasks);
    }
    async sweepExpired() {
        // Sweep expired entries from all caches
        const tasksRemoved = await this.tasksCache.sweepExpired();
        const indexesRemoved = await this.indexesCache.sweepExpired();
        const metaRemoved = await this.metaCache.sweepExpired();
        return tasksRemoved + indexesRemoved + metaRemoved;
    }
    async close() {
        // With namespaced caches sharing the same underlying database,
        // we only need to close one of them
        await this.tasksCache.close();
    }
    /**
     * Update indexes when a task is added/modified
     */
    async updateTaskIndexes(task) {
        const uuid = task.uuid;
        if (!uuid)
            return;
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
    async removeFromTaskIndexes(task) {
        const uuid = task.uuid;
        if (!uuid)
            return;
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
    async addToIndex(indexKey, uuid) {
        if (!indexKey || !uuid)
            return;
        const current = await this.indexesCache.get(indexKey) || [];
        if (!current.includes(uuid)) {
            await this.indexesCache.set(indexKey, [...current, uuid]);
        }
    }
    /**
     * Remove UUID from an index set
     */
    async removeFromIndex(indexKey, uuid) {
        if (!indexKey || !uuid)
            return;
        const current = await this.indexesCache.get(indexKey) || [];
        const filtered = current.filter(id => id !== uuid);
        await this.indexesCache.set(indexKey, filtered);
    }
    /**
     * Update search index for a task
     */
    async updateSearchIndex(task) {
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
    async removeFromSearchIndex(task) {
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
    async clearAllIndexes() {
        const indexes = [];
        // Collect all index keys
        for await (const [key] of this.indexesCache.entries()) {
            if (key.startsWith('index/')) {
                indexes.push(key);
            }
        }
        // Delete all indexes
        if (indexes.length > 0) {
            await this.indexesCache.batch(indexes.map(key => ({ type: 'del', key })));
        }
    }
}
/**
 * Factory function to create a TaskCache instance
 */
export const createTaskCache = async (options) => {
    return await LevelTaskCache.create(options);
};
