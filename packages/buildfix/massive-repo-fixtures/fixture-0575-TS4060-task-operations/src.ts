import type { IndexedTask } from './types.js';
import type { TaskCache } from './task-cache.js';
import type { Task } from '../lib/types.js';

/**
 * Convert IndexedTask to Task (format used by board operations)
 */
export const indexedTaskToTask = (indexedTask: IndexedTask): Task => ({
  uuid: indexedTask.uuid || '',
  title: indexedTask.title,
  status: indexedTask.status,
  priority: indexedTask.priority,
  labels: indexedTask.labels ? [...indexedTask.labels] : [],
  created_at: indexedTask.created,
  estimates: {},
  content: indexedTask.content,
  slug: indexedTask.id,
});

/**
 * Streaming task operations that work with TaskCache instead of memory arrays
 */
export class TaskOperations {
  constructor(private readonly cache: TaskCache) {}

  /**
   * Get tasks by status with streaming support
   */
  async getTasksByStatus(status: string, options?: Readonly<{ limit?: number }>): Promise<Task[]> {
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.getTasksByStatus(status)) {
      if (limit && count >= limit) break;
      tasks.push(indexedTaskToTask(indexedTask));
      count++;
    }

    return tasks;
  }

  /**
   * Get single task by UUID
   */
  async getTaskByUuid(uuid: string): Promise<Task | undefined> {
    const indexedTask = await this.cache.getTask(uuid);
    return indexedTask ? indexedTaskToTask(indexedTask) : undefined;
  }

  /**
   * Search tasks with streaming results
   */
  async searchTasks(query: string, options?: Readonly<{ limit?: number }>): Promise<Task[]> {
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.searchTasks(query)) {
      if (limit && count >= limit) break;
      tasks.push(indexedTaskToTask(indexedTask));
      count++;
    }

    return tasks;
  }

  /**
   * Get tasks by priority with streaming support
   */
  async getTasksByPriority(
    priority: string,
    options?: Readonly<{ limit?: number }>,
  ): Promise<Task[]> {
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.getTasksByPriority(priority)) {
      if (limit && count >= limit) break;
      tasks.push(indexedTaskToTask(indexedTask));
      count++;
    }

    return tasks;
  }

  /**
   * Get tasks by label with streaming support
   */
  async getTasksByLabel(label: string, options?: Readonly<{ limit?: number }>): Promise<Task[]> {
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.getTasksByLabel(label)) {
      if (limit && count >= limit) break;
      tasks.push(indexedTaskToTask(indexedTask));
      count++;
    }

    return tasks;
  }

  /**
   * Count tasks by status (efficient operation using cache metadata)
   */
  async countTasksByStatus(status: string): Promise<number> {
    let count = 0;
    for await (const _ of this.cache.getTasksByStatus(status)) {
      count++;
    }
    return count;
  }

  /**
   * Count total tasks (uses cache metadata if available)
   */
  async getTotalTaskCount(): Promise<number> {
    return await this.cache.getTaskCount();
  }

  /**
   * Get task statistics without loading all tasks
   */
  async getTaskStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const total = await this.getTotalTaskCount();
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    // For a real implementation, we'd add these as separate cache metadata
    // For now, we'll sample and estimate
    const commonStatuses = ['todo', 'in_progress', 'review', 'done', 'breakdown', 'ready'];

    for (const status of commonStatuses) {
      byStatus[status] = await this.countTasksByStatus(status);
    }

    // Count other tasks to get accurate total
    const otherStatuses = total - Object.values(byStatus).reduce((a, b) => a + b, 0);
    if (otherStatuses > 0) {
      byStatus['other'] = otherStatuses;
    }

    return { total, byStatus, byPriority };
  }

  /**
   * Batch update tasks (for moving multiple tasks)
   */
  async batchUpdateTasks(
    updates: Array<{
      uuid: string;
      updates: Partial<Pick<Task, 'status' | 'priority' | 'labels'>>;
    }>,
  ): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    for (const { uuid, updates: taskUpdates } of updates) {
      try {
        const existingTask = await this.cache.getTask(uuid);
        if (!existingTask) {
          errors.push(`Task not found: ${uuid}`);
          continue;
        }

        // Create updated indexed task
        const updatedTask: IndexedTask = {
          ...existingTask,
          ...taskUpdates,
          // Ensure path is preserved
          path: existingTask.path,
        } as IndexedTask;

        await this.cache.setTask(updatedTask);
        updated++;
      } catch (error) {
        errors.push(
          `Failed to update task ${uuid}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { updated, errors };
  }

  /**
   * Rebuild search index for all tasks
   */
  async rebuildSearchIndex(): Promise<void> {
    await this.cache.rebuildIndex();
  }

  /**
   * Clean up expired cache entries
   */
  async cleanup(): Promise<number> {
    return await this.cache.sweepExpired();
  }

  /**
   * Close the cache connection
   */
  async close(): Promise<void> {
    await this.cache.close();
  }
}

/**
 * Factory var to create TaskOperations instance
 */
export const createTaskOperations = (cache: TaskCache): TaskOperations => {
  return new TaskOperations(cache);
};
