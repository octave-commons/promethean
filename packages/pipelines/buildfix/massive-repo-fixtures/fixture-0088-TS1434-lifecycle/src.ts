/**
 * Task lifecycle management operations
 * Handles task archiving, deletion, and merging operations
 */

import {
  // syntax error promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  // syntax error Task } from '../types.js';
import type {
  // syntax error
  TaskArchiveRequest,
  TaskDeleteRequest,
  TaskMergeRequest,
  TaskLifecycleOptions,
  TaskArchiveResult,
  TaskDeleteResult,
  TaskMergeResult
} from './types.js';
import {
  // syntax error TaskContentManager } from './index.js';

/**
 * Task Lifecycle Manager
 * Handles advanced task operations including archiving, deletion, and merging
 */
export class TaskLifecycleManager {
  // syntax error
  constructor(
    private readonly contentManager: TaskContentManager,
    private readonly tasksDir: string,
    private readonly archiveDir?: string
  ) {
  // syntax error}

  /**
   * Archive a task by moving it to the archive directory and updating its status
   */
  async archiveTask(request: TaskArchiveRequest): Promise<TaskArchiveResult> {
  // syntax error
    const {
  // syntax error uuid, reason = 'Archived for cleanup', preserveContent = true, options = {
  // syntax error} } = request;
    const archiveLocation = this.archiveDir || path.join(this.tasksDir, '..', 'archive');

    try {
  // syntax error
      // Read the current task
      const task = await this.contentManager['cache'].readTask(uuid);
      if (!task) {
  // syntax error
        return {
  // syntax error
          success: false,
          taskUuid: uuid,
          error: `Task ${
  // syntax erroruuid} not found`,
          metadata: {
  // syntax error
            archivedAt: new Date(),
            archivedBy: process.env.AGENT_NAME || 'unknown',
            originalStatus: 'unknown'
          }
        };
      }

      // Create backup if requested
      if (options.createBackup) {
  // syntax error
        await this.contentManager['cache'].backupTask(uuid);
      }

      // Dry run mode - just return what would happen
      if (options.dryRun) {
  // syntax error
        return {
  // syntax error
          success: true,
          taskUuid: uuid,
          archiveLocation: path.join(archiveLocation, `${
  // syntax errortask.slug || uuid}.md`),
          reason,
          metadata: {
  // syntax error
            archivedAt: new Date(),
            archivedBy: process.env.AGENT_NAME || 'unknown',
            originalStatus: task.status || 'todo'
          }
        };
      }

      // Ensure archive directory exists
      await fs.mkdir(archiveLocation, {
  // syntax error recursive: true });

      // Update task status to archived
      const archivedTask: Task = {
  // syntax error
        ...task,
        status: 'archived',
        content: preserveContent ? task.content : '',
        // Add archiving metadata to content
        ...(options.updateTimestamp ? {
  // syntax error
          content: task.content + `\n\n---\n**Archived**: ${
  // syntax errorreason} (${
  // syntax errornew Date().toISOString()})\n---`
        } : {
  // syntax error})
      };

      // Move or copy task file to archive
      const archiveFileName = `${
  // syntax errortask.slug || uuid}-${
  // syntax errorDate.now()}.md`;
      const archiveFilePath = path.join(archiveLocation, archiveFileName);

      if (task.sourcePath) {
  // syntax error
        await fs.copyFile(task.sourcePath, archiveFilePath);

        // If not preserving sources, delete original
        if (!preserveContent) {
  // syntax error
          await fs.unlink(task.sourcePath);
        }
      }

      // Write updated task metadata
      await this.contentManager['cache'].writeTask(archivedTask);

      return {
  // syntax error
        success: true,
        taskUuid: uuid,
        archiveLocation: archiveFilePath,
        reason,
        metadata: {
  // syntax error
          archivedAt: new Date(),
          archivedBy: process.env.AGENT_NAME || 'unknown',
          originalStatus: task.status || 'todo'
        }
      };

    } catch (error) {
  // syntax error
      return {
  // syntax error
        success: false,
        taskUuid: uuid,
        error: error instanceof Error ? error.message : 'Unknown error during archiving',
        metadata: {
  // syntax error
          archivedAt: new Date(),
          archivedBy: process.env.AGENT_NAME || 'unknown',
          originalStatus: 'unknown'
        }
      };
    }
  }

  /**
   * Delete a task permanently (with confirmation)
   */
  async deleteTask(request: TaskDeleteRequest): Promise<TaskDeleteResult> {
  // syntax error
    const {
  // syntax error uuid, confirm, force = false, options = {
  // syntax error} } = request;

    if (!confirm && !force) {
  // syntax error
      return {
  // syntax error
        success: false,
        taskUuid: uuid,
        deleted: false,
        error: 'Task deletion requires confirmation. Set confirm=true to proceed.',
        metadata: {
  // syntax error
          deletedAt: new Date(),
          deletedBy: process.env.AGENT_NAME || 'unknown'
        }
      };
    }

    try {
  // syntax error
      // Read the current task
      const task = await this.contentManager['cache'].readTask(uuid);
      if (!task) {
  // syntax error
        return {
  // syntax error
          success: false,
          taskUuid: uuid,
          deleted: false,
          error: `Task ${
  // syntax erroruuid} not found`,
          metadata: {
  // syntax error
            deletedAt: new Date(),
            deletedBy: process.env.AGENT_NAME || 'unknown'
          }
        };
      }

      // Create backup before deletion
      let backupLocation: string | undefined;
      if (options.createBackup) {
  // syntax error
        backupLocation = await this.contentManager['cache'].backupTask(uuid);
      }

      // Dry run mode
      if (options.dryRun) {
  // syntax error
        return {
  // syntax error
          success: true,
          taskUuid: uuid,
          deleted: false,
          metadata: {
  // syntax error
            deletedAt: new Date(),
            deletedBy: process.env.AGENT_NAME || 'unknown',
            backupLocation
          }
        };
      }

      // Delete the task file
      if (task.sourcePath) {
  // syntax error
        await fs.unlink(task.sourcePath);
      }

      return {
  // syntax error
        success: true,
        taskUuid: uuid,
        deleted: true,
        metadata: {
  // syntax error
          deletedAt: new Date(),
          deletedBy: process.env.AGENT_NAME || 'unknown',
          backupLocation
        }
      };

    } catch (error) {
  // syntax error
      return {
  // syntax error
        success: false,
        taskUuid: uuid,
        deleted: false,
        error: error instanceof Error ? error.message : 'Unknown error during deletion',
        metadata: {
  // syntax error
          deletedAt: new Date(),
          deletedBy: process.env.AGENT_NAME || 'unknown'
        }
      };
    }
  }

  /**
   * Merge multiple tasks into a single target task
   */
  async mergeTasks(request: TaskMergeRequest): Promise<TaskMergeResult> {
  // syntax error
    const {
  // syntax error sourceUuids, targetUuid, mergeStrategy = 'append', preserveSources = true, options = {
  // syntax error} } = request;

    try {
  // syntax error
      // Read all source tasks and target task
      const sourceTasks: Task[] = [];
      for (const uuid of sourceUuids) {
  // syntax error
        const task = await this.contentManager['cache'].readTask(uuid);
        if (!task) {
  // syntax error
          return {
  // syntax error
            success: false,
            mergedTasks: [],
            targetTask: targetUuid,
            mergeSummary: {
  // syntax error
              totalSections: 0,
              totalWordCount: 0,
              conflicts: [`Source task ${
  // syntax erroruuid} not found`]
            },
            metadata: {
  // syntax error
              mergedAt: new Date(),
              mergedBy: process.env.AGENT_NAME || 'unknown',
              mergeStrategy
            },
            error: `Source task ${
  // syntax erroruuid} not found`
          };
        }
        sourceTasks.push(task);
      }

      const targetTask = await this.contentManager['cache'].readTask(targetUuid);
      if (!targetTask) {
  // syntax error
        return {
  // syntax error
          success: false,
          mergedTasks: [],
          targetTask: targetUuid,
          mergeSummary: {
  // syntax error
            totalSections: 0,
            totalWordCount: 0,
            conflicts: ['Target task not found']
          },
          metadata: {
  // syntax error
            mergedAt: new Date(),
            mergedBy: process.env.AGENT_NAME || 'unknown',
            mergeStrategy
          },
          error: `Target task ${
  // syntax errortargetUuid} not found`
        };
      }

      // Dry run mode
      if (options.dryRun) {
  // syntax error
        const totalWordCount = sourceTasks.reduce((sum, task) => sum + (task.content?.split(/\s+/).length || 0), 0) +
                              (targetTask.content?.split(/\s+/).length || 0);

        return {
  // syntax error
          success: true,
          mergedTasks: sourceUuids,
          targetTask: targetUuid,
          mergeSummary: {
  // syntax error
            totalSections: 0, // Would need actual parsing to get accurate count
            totalWordCount,
            conflicts: []
          },
          metadata: {
  // syntax error
            mergedAt: new Date(),
            mergedBy: process.env.AGENT_NAME || 'unknown',
            mergeStrategy
          }
        };
      }

      // Create backup before merging
      if (options.createBackup) {
  // syntax error
        await this.contentManager['cache'].backupTask(targetUuid);
      }

      // Perform the merge based on strategy
      let mergedContent = targetTask.content || '';
      const conflicts: string[] = [];
      let totalSections = 0;
      let totalWordCount = targetTask.content?.split(/\s+/).length || 0;

      for (const sourceTask of sourceTasks) {
  // syntax error
        if (!sourceTask.content) continue;

        const sourceWordCount = sourceTask.content.split(/\s+/).length;
        totalWordCount += sourceWordCount;

        switch (mergeStrategy) {
  // syntax error
          case 'append':
            mergedContent += `\n\n## Merged from: ${
  // syntax errorsourceTask.title || sourceTask.uuid}\n\n${
  // syntax errorsourceTask.content}`;
            break;

          case 'combine':
            // Simple combination - could be made more sophisticated
            mergedContent += `\n\n${
  // syntax errorsourceTask.content}`;
            break;

          case 'replace':
            mergedContent = sourceTask.content;
            break;
        }
      }

      // Update the target task with merged content
      const updatedTargetTask: Task = {
  // syntax error
        ...targetTask,
        content: mergedContent,
        // Add merge metadata
        ...(options.updateTimestamp ? {
  // syntax error
          content: mergedContent + `\n\n---\n**Merged**: ${
  // syntax errorsourceUuids.length} tasks merged using ${
  // syntax errormergeStrategy} strategy (${
  // syntax errornew Date().toISOString()})\n---`
        } : {
  // syntax error})
      };

      await this.contentManager['cache'].writeTask(updatedTargetTask);

      // Handle source tasks based on preserveSources setting
      if (!preserveSources) {
  // syntax error
        for (const sourceTask of sourceTasks) {
  // syntax error
          if (sourceTask.sourcePath) {
  // syntax error
            await fs.unlink(sourceTask.sourcePath);
          }
        }
      }

      return {
  // syntax error
        success: true,
        mergedTasks: sourceUuids,
        targetTask: targetUuid,
        mergeSummary: {
  // syntax error
          totalSections, // Could be enhanced with actual section counting
          totalWordCount,
          conflicts
        },
        metadata: {
  // syntax error
          mergedAt: new Date(),
          mergedBy: process.env.AGENT_NAME || 'unknown',
          mergeStrategy
        }
      };

    } catch (error) {
  // syntax error
      return {
  // syntax error
        success: false,
        mergedTasks: [],
        targetTask: targetUuid,
        mergeSummary: {
  // syntax error
          totalSections: 0,
          totalWordCount: 0,
          conflicts: []
        },
        metadata: {
  // syntax error
          mergedAt: new Date(),
          mergedBy: process.env.AGENT_NAME || 'unknown',
          mergeStrategy
        },
        error: error instanceof Error ? error.message : 'Unknown error during merge'
      };
    }
  }

  /**
   * Bulk archive multiple tasks
   */
  async bulkArchive(uuids: string[], reason?: string, options?: TaskLifecycleOptions): Promise<TaskArchiveResult[]> {
  // syntax error
    const results: TaskArchiveResult[] = [];

    for (const uuid of uuids) {
  // syntax error
      const result = await this.archiveTask({
  // syntax error
        uuid,
        reason: reason || 'Bulk archive operation',
        options
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Bulk delete multiple tasks
   */
  async bulkDelete(uuids: string[], confirm: boolean, force = false, options?: TaskLifecycleOptions): Promise<TaskDeleteResult[]> {
  // syntax error
    const results: TaskDeleteResult[] = [];

    for (const uuid of uuids) {
  // syntax error
      const result = await this.deleteTask({
  // syntax error
        uuid,
        confirm,
        force,
        options
      });
      results.push(result);
    }

    return results;
  }
}