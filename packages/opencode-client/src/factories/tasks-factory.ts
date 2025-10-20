// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for task tools

import { tool } from '@opencode-ai/plugin/tool';
import {
  cleanupOrphanedTask,
  updateTaskStatus,
  createTask,
  getAllTasks,
  type TaskContext,
} from '../actions/tasks/index.js';

// Factory for cleanupOrphanedTask tool
export function createCleanupOrphanedTaskTool(
  stores: TaskContext,
  client: any,
): ReturnType<typeof tool> {
  return tool({
    description: 'Clean up an orphaned task from memory',
    args: {
      sessionId: tool.schema.string().describe('Session ID of the orphaned task to clean up'),
    },
    async execute(args, context) {
      const { sessionId } = args;

      await cleanupOrphanedTask(stores as TaskContext, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        cleaned: true,
      });
    },
  });
}

// Factory for updateTaskStatus tool
export function createUpdateTaskStatusTool(
  stores: TaskContext,
  client: any,
): ReturnType<typeof tool> {
  return tool({
    description: 'Update the status of an agent task',
    args: {
      sessionId: tool.schema.string().describe('Session ID of the task to update'),
      status: tool.schema
        .enum(['idle', 'running', 'completed', 'failed'])
        .describe('New status for the task'),
      completionMessage: tool.schema
        .string()
        .optional()
        .describe('Completion message (required for completed/failed status)'),
    },
    async execute(args, context: Context) {
      const { sessionId, status, completionMessage } = args;

      await updateTaskStatus(stores as TaskContext, sessionId, status, completionMessage);

      return JSON.stringify({
        success: true,
        sessionId,
        status,
        completionMessage,
        updated: true,
      });
    },
  });
}

// Factory for createTask tool
export function createCreateTaskTool(stores: TaskContext): ReturnType<typeof tool> {
  return tool({
    description: 'Create a new agent task',
    args: {
      sessionId: tool.schema.string().describe('Session ID for the task'),
      task: tool.schema.string().describe('Task description'),
    },
    async execute(args, context: Context) {
      const { sessionId, task } = args;

      const agentTask = await createTask(stores as TaskContext, sessionId, task);

      return JSON.stringify({
        success: true,
        sessionId,
        task,
        status: agentTask.status,
        startTime: agentTask.startTime,
        created: true,
      });
    },
  });
}

// Factory for getAllTasks tool
export function createGetAllTasksTool(stores: TaskContext): ReturnType<typeof tool> {
  return tool({
    description: 'Get all tasks from memory and storage',
    args: {},
    async execute(_args, context: Context) {
      const allTasks = await getAllTasks(stores as TaskContext);
      const tasksArray = Array.from(allTasks.entries()).map(([sessionId, task]) => ({
        sessionId,
        task: task.task,
        status: task.status,
        startTime: task.startTime,
        lastActivity: task.lastActivity,
        completionMessage: task.completionMessage,
      }));

      return JSON.stringify({
        success: true,
        totalTasks: tasksArray.length,
        tasks: tasksArray,
      });
    },
  });
}

// Export all factory functions
export const tasksToolFactories = {
  createCleanupOrphanedTaskTool,
  createUpdateTaskStatusTool,
  createCreateTaskTool,
  createGetAllTasksTool,
};
