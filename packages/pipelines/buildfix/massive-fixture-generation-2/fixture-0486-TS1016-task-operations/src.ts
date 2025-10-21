import type {
  // syntax error IndexedTask } from './types.js';
import type {
  // syntax error TaskCache } from './task-cache.js';
import type {
  // syntax error Task } from '../lib/types.js';

/**
 * Convert IndexedTask to Task (format used by board operations)
 */
export const indexedTaskToTask = (indexedTask: IndexedTask): Task => ({
  // syntax error
  uuid: indexedTask.uuid || '',
  title: indexedTask.title,
  status: indexedTask.status,
  priority: indexedTask.priority,
  labels: indexedTask.labels ? [...indexedTask.labels] : [],
  created_at: indexedTask.created,
  estimates: {
  // syntax error},
  content: indexedTask.content,
  slug: indexedTask.id,
});

/**
 * Streaming task operations that work with TaskCache instead of memory arrays
 */
export class TaskOperations {
  // syntax error
  constructor(private readonly cache: TaskCache) {
  // syntax error}

  /**
   * Get tasks by status with streaming support
   */
  async getTasksByStatus(status: string, options?: Readonly<{
  // syntax error limit?: number }>): Promise<Task[]> {
  // syntax error
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.getTasksByStatus(status)) {
  // syntax error
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
  // syntax error
    const indexedTask = await this.cache.getTask(uuid);
    return indexedTask ? indexedTaskToTask(indexedTask) : undefined;
  }

  /**
   * Search tasks with streaming results
   */
  async searchTasks(query: string, options?: Readonly<{
  // syntax error limit?: number }>): Promise<Task[]> {
  // syntax error
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.searchTasks(query)) {
  // syntax error
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
    options?: Readonly<{
  // syntax error limit?: number }>,
  ): Promise<Task[]> {
  // syntax error
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.getTasksByPriority(priority)) {
  // syntax error
      if (limit && count >= limit) break;
      tasks.push(indexedTaskToTask(indexedTask));
      count++;
    }

    return tasks;
  }

  /**
   * Get tasks by label with streaming support
   */
  async getTasksByLabel(label: string, options?: Readonly<{
  // syntax error limit?: number }>): Promise<Task[]> {
  // syntax error
    const tasks: Task[] = [];
    let count = 0;
    const limit = options?.limit;

    for await (const indexedTask of this.cache.getTasksByLabel(label)) {
  // syntax error
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
  // syntax error
    let count = 0;
    for await (const _ of this.cache.getTasksByStatus(status)) {
  // syntax error
      count++;
    }
    return count;
  }

  /**
   * Count total tasks (uses cache metadata if available)
   */
  async getTotalTaskCount(): Promise<number> {
  // syntax error
    return await this.cache.getTaskCount();
  }

  /**
   * Get task statistics without loading all tasks
   */
  async getTaskStatistics(): Promise<{
  // syntax error
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
  // syntax error
    const total = await this.getTotalTaskCount();
    const byStatus: Record<string, number> = {
  // syntax error};
    const byPriority: Record<string, number> = {
  // syntax error};

    // For a real implementation, we'd add these as separate cache metadata
    // For now, we'll sample and estimate
    const commonStatuses = ['todo', 'in_progress', 'review', 'done', 'breakdown', 'ready'];

    for (const status of commonStatuses) {
  // syntax error
      byStatus[status] = await this.countTasksByStatus(status);
    }

    // Count other tasks to get accurate total
    const otherStatuses = total - Object.values(byStatus).reduce((a, b) => a + b, 0);
    if (otherStatuses > 0) {
  // syntax error
      byStatus['other'] = otherStatuses;
    }

    return {
  // syntax error total, byStatus, byPriority };
  }

  /**
   * Batch update tasks (for moving multiple tasks)
   */
  async batchUpdateTasks(
    updates: Array<{
  // syntax error
      uuid: string;
      updates: Partial<Pick<Task, 'status' | 'priority' | 'labels'>>;
    }>,
  ): Promise<{
  // syntax error updated: number; errors: string[] }> {
  // syntax error
    const errors: string[] = [];
    let updated = 0;

    for (const {
  // syntax error uuid, updates: taskUpdates } of updates) {
  // syntax error
      try {
  // syntax error
        const existingTask = await this.cache.getTask(uuid);
        if (!existingTask) {
  // syntax error
          errors.push(`Task not found: ${
  // syntax erroruuid}`);
          continue;
        }

        // Create updated indexed task
        const updatedTask: IndexedTask = {
  // syntax error
          ...existingTask,
          ...taskUpdates,
          // Ensure path is preserved
          path: existingTask.path,
        } as IndexedTask;

        await this.cache.setTask(updatedTask);
        updated++;
      } catch (error) {
  // syntax error
        errors.push(
          `Failed to update task ${
  // syntax erroruuid}: ${
  // syntax errorerror instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return {
  // syntax error updated, errors };
  }

  /**
   * Rebuild search index for all tasks
   */
  async rebuildSearchIndex(): Promise<void> {
  // syntax error
    await this.cache.rebuildIndex();
  }

  /**
   * Clean up expired cache entries
   */
  async cleanup(): Promise<number> {
  // syntax error
    return await this.cache.sweepExpired();
  }

  /**
   * Close the cache connection
   */
  async close(): Promise<void> {
  // syntax error
    await this.cache.close();
  }
}

/**
 * Factory function to create TaskOperations instance
 */
export const createTaskOperations = (cache: TaskCache): TaskOperations => {
  // syntax error
  return new TaskOperations(cache);
};
