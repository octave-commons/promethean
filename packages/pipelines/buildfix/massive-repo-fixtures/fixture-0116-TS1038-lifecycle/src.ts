/**
 * Task lifecycle management operations
 * Handles task archiving, deletion, and merging operations
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Task } from "../types.js";
import type {
  TaskArchiveRequest,
  TaskDeleteRequest,
  TaskMergeRequest,
  TaskLifecycleOptions,
  TaskArchiveResult,
  TaskDeleteResult,
  TaskMergeResult
} from "./types.js";
import { TaskContentManager } from "./index.js";

/**
 * Task Lifecycle Manager
 * Handles advanced task operations including archiving, deletion, and merging
 */
export class TaskLifecycleManager {
  constructor(
    private readonly contentManager: TaskContentManager,
    private readonly tasksDir: string,
    private readonly archiveDir?: string
  ) {}

  /**
   * Archive a task by moving it to the archive directory and updating its status
   */
  async archiveTask(request: TaskArchiveRequest): Promise<TaskArchiveResult> {
    const { uuid, reason = "Archived for cleanup", preserveContent = true, options = {} } = request;
    const archiveLocation = this.archiveDir || path.join(this.tasksDir, "..", "archive");

    try {
      // Read the current task
      const task = await this.contentManager["cache"].readTask(uuid);
      if (!task) {
        return {
          success: false,
          taskUuid: uuid,
          error: `Task ${uuid} not found`,
          metadata: {
            archivedAt: new Date(),
            archivedBy: process.env.AGENT_NAME || "unknown",
            originalStatus: "unknown"
          }
        };
      }

      // Create backup if requested
      if (options.createBackup) {
        await this.contentManager["cache"].backupTask(uuid);
      }

      // Dry run mode - just return what would happen
      if (options.dryRun) {
        return {
          success: true,
          taskUuid: uuid,
          archiveLocation: path.join(archiveLocation, `${task.slug || uuid}.md`),
          reason,
          metadata: {
            archivedAt: new Date(),
            archivedBy: process.env.AGENT_NAME || "unknown",
            originalStatus: task.status || "todo"
          }
        };
      }

      // Ensure archive directory exists
      await fs.mkdir(archiveLocation, { recursive: true });

      // Update task status to archived
      const archivedTask: Task = {
        ...task,
        status: "archived",
        content: preserveContent ? task.content : "",
        // Add archiving metadata to content
        ...(options.updateTimestamp ? {
          content: task.content + `\n\n---\n**Archived**: ${reason} (${new Date().toISOString()})\n---`
        } : {})
      };

      // Move or copy task file to archive
      const archiveFileName = `${task.slug || uuid}-${Date.now()}.md`;
      const archiveFilePath = path.join(archiveLocation, archiveFileName);

      if (task.sourcePath) {
        await fs.copyFile(task.sourcePath, archiveFilePath);

        // If not preserving sources, delete original
        if (!preserveContent) {
          await fs.unlink(task.sourcePath);
        }
      }

      // Write updated task metadata
      await this.contentManager["cache"].writeTask(archivedTask);

      return {
        success: true,
        taskUuid: uuid,
        archiveLocation: archiveFilePath,
        reason,
        metadata: {
          archivedAt: new Date(),
          archivedBy: process.env.AGENT_NAME || "unknown",
          originalStatus: task.status || "todo"
        }
      };

    } catch (error) {
      return {
        success: false,
        taskUuid: uuid,
        error: error instanceof Error ? error.message : "Unknown error during archiving",
        metadata: {
          archivedAt: new Date(),
          archivedBy: process.env.AGENT_NAME || "unknown",
          originalStatus: "unknown"
        }
      };
    }
  }

  /**
   * Delete a task permanently (with confirmation)
   */
  async deleteTask(request: TaskDeleteRequest): Promise<TaskDeleteResult> {
    const { uuid, confirm, force = false, options = {} } = request;

    if (!confirm && !force) {
      return {
        success: false,
        taskUuid: uuid,
        deleted: false,
        error: "Task deletion requires confirmation. Set confirm=true to proceed.",
        metadata: {
          deletedAt: new Date(),
          deletedBy: process.env.AGENT_NAME || "unknown"
        }
      };
    }

    try {
      // Read the current task
      const task = await this.contentManager["cache"].readTask(uuid);
      if (!task) {
        return {
          success: false,
          taskUuid: uuid,
          deleted: false,
          error: `Task ${uuid} not found`,
          metadata: {
            deletedAt: new Date(),
            deletedBy: process.env.AGENT_NAME || "unknown"
          }
        };
      }

      // Create backup before deletion
      let backupLocation: string | undefined;
      if (options.createBackup) {
        backupLocation = await this.contentManager["cache"].backupTask(uuid);
      }

      // Dry run mode
      if (options.dryRun) {
        return {
          success: true,
          taskUuid: uuid,
          deleted: false,
          metadata: {
            deletedAt: new Date(),
            deletedBy: process.env.AGENT_NAME || "unknown",
            backupLocation
          }
        };
      }

      // Delete the task file
      if (task.sourcePath) {
        await fs.unlink(task.sourcePath);
      }

      return {
        success: true,
        taskUuid: uuid,
        deleted: true,
        metadata: {
          deletedAt: new Date(),
          deletedBy: process.env.AGENT_NAME || "unknown",
          backupLocation
        }
      };

    } catch (error) {
      return {
        success: false,
        taskUuid: uuid,
        deleted: false,
        error: error instanceof Error ? error.message : "Unknown error during deletion",
        metadata: {
          deletedAt: new Date(),
          deletedBy: process.env.AGENT_NAME || "unknown"
        }
      };
    }
  }

  /**
   * Merge multiple tasks into a single target task
   */
  async mergeTasks(request: TaskMergeRequest): Promise<TaskMergeResult> {
    const { sourceUuids, targetUuid, mergeStrategy = "append", preserveSources = true, options = {} } = request;

    try {
      // Read all source tasks and target task
      const sourceTasks: Task[] = [];
      for (const uuid of sourceUuids) {
        const task = await this.contentManager["cache"].readTask(uuid);
        if (!task) {
          return {
            success: false,
            mergedTasks: [],
            targetTask: targetUuid,
            mergeSummary: {
              totalSections: 0,
              totalWordCount: 0,
              conflicts: [`Source task ${uuid} not found`]
            },
            metadata: {
              mergedAt: new Date(),
              mergedBy: process.env.AGENT_NAME || "unknown",
              mergeStrategy
            },
            error: `Source task ${uuid} not found`
          };
        }
        sourceTasks.push(task);
      }

      const targetTask = await this.contentManager["cache"].readTask(targetUuid);
      if (!targetTask) {
        return {
          success: false,
          mergedTasks: [],
          targetTask: targetUuid,
          mergeSummary: {
            totalSections: 0,
            totalWordCount: 0,
            conflicts: ["Target task not found"]
          },
          metadata: {
            mergedAt: new Date(),
            mergedBy: process.env.AGENT_NAME || "unknown",
            mergeStrategy
          },
          error: `Target task ${targetUuid} not found`
        };
      }

      // Dry run mode
      if (options.dryRun) {
        const totalWordCount = sourceTasks.reduce((sum, task) => sum + (task.content?.split(/\s+/).length || 0), 0) +
                              (targetTask.content?.split(/\s+/).length || 0);

        return {
          success: true,
          mergedTasks: sourceUuids,
          targetTask: targetUuid,
          mergeSummary: {
            totalSections: 0, // Would need actual parsing to get accurate count
            totalWordCount,
            conflicts: []
          },
          metadata: {
            mergedAt: new Date(),
            mergedBy: process.env.AGENT_NAME || "unknown",
            mergeStrategy
          }
        };
      }

      // Create backup before merging
      if (options.createBackup) {
        await this.contentManager["cache"].backupTask(targetUuid);
      }

      // Perform the merge based on strategy
      let mergedContent = targetTask.content || "";
      const conflicts: string[] = [];
      let totalSections = 0;
      let totalWordCount = targetTask.content?.split(/\s+/).length || 0;

      for (const sourceTask of sourceTasks) {
        if (!sourceTask.content) continue;

        const sourceWordCount = sourceTask.content.split(/\s+/).length;
        totalWordCount += sourceWordCount;

        switch (mergeStrategy) {
          case "append":
            mergedContent += `\n\n## Merged from: ${sourceTask.title || sourceTask.uuid}\n\n${sourceTask.content}`;
            break;

          case "combine":
            // Simple combination - could be made more sophisticated
            mergedContent += `\n\n${sourceTask.content}`;
            break;

          case "replace":
            mergedContent = sourceTask.content;
            break;
        }
      }

      // Update the target task with merged content
      const updatedTargetTask: Task = {
        ...targetTask,
        content: mergedContent,
        // Add merge metadata
        ...(options.updateTimestamp ? {
          content: mergedContent + `\n\n---\n**Merged**: ${sourceUuids.length} tasks merged using ${mergeStrategy} strategy (${new Date().toISOString()})\n---`
        } : {})
      };

      await this.contentManager["cache"].writeTask(updatedTargetTask);

      // Handle source tasks based on preserveSources setting
      if (!preserveSources) {
        for (const sourceTask of sourceTasks) {
          if (sourceTask.sourcePath) {
            await fs.unlink(sourceTask.sourcePath);
          }
        }
      }

      return {
        success: true,
        mergedTasks: sourceUuids,
        targetTask: targetUuid,
        mergeSummary: {
          totalSections, // Could be enhanced with actual section counting
          totalWordCount,
          conflicts
        },
        metadata: {
          mergedAt: new Date(),
          mergedBy: process.env.AGENT_NAME || "unknown",
          mergeStrategy
        }
      };

    } catch (error) {
      return {
        success: false,
        mergedTasks: [],
        targetTask: targetUuid,
        mergeSummary: {
          totalSections: 0,
          totalWordCount: 0,
          conflicts: []
        },
        metadata: {
          mergedAt: new Date(),
          mergedBy: process.env.AGENT_NAME || "unknown",
          mergeStrategy
        },
        error: error instanceof Error ? error.message : "Unknown error during merge"
      };
    }
  }

  /**
   * Bulk archive multiple tasks
   */
  async bulkArchive(uuids: string[], reason?: string, options?: TaskLifecycleOptions): Promise<TaskArchiveResult[]> {
    const results: TaskArchiveResult[] = [];

    for (const uuid of uuids) {
      const result = await this.archiveTask({
        uuid,
        reason: reason || "Bulk archive operation",
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
    const results: TaskDeleteResult[] = [];

    for (const uuid of uuids) {
      const result = await this.deleteTask({
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