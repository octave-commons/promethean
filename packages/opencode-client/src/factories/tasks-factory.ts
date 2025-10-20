// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for task tools

import { tool } from '@opencode-ai/plugin/tool';
import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from '../AgentTask.js';
import {
  loadPersistedTasks,
  verifySessionExists,
  cleanupOrphanedTask,
  updateTaskStatus,
  monitorTasks,
  createTask,
  getAllTasks,
  parseTimestamp,
  type TaskContext,
} from '../actions/tasks/index.js';

// Factory for loadPersistedTasks tool
export function createLoadPersistedTasksTool(stores, client): ReturnType<typeof tool> {
  return tool({
    description: 'Load persisted agent tasks from storage',
    args: {
      verifySessions: tool.schema
        .boolean()
        .default(true)
        .describe('Whether to verify sessions still exist before loading tasks'),
    },
    async execute(args, context) {
      const { verifySessions } = args;
      const client = (context as Record<string, unknown>).client;

      if (!agentTaskStore || !agentTasks) {
        throw new Error('Required task context not available');
      }

      const taskContext: TaskContext = {
        agentTaskStore,
        agentTasks: agentTasks as Map<string, AgentTask>,
      };

      const result = await loadPersistedTasks(
        taskContext,
        verifySessions ? (client as any) : undefined,
      );

      return JSON.stringify({
        success: true,
        loadedCount: result.loadedCount,
        cleanedCount: result.cleanedCount,
        verifySessions,
      });
    },
  });
}

// Factory for verifySessionExists tool
export function createVerifySessionExistsTool(stores, client): ReturnType<typeof tool> {
  return tool({
    description: 'Verify if a session still exists',
    args: {
      sessionId: tool.schema.string().describe('Session ID to verify'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as Record<string, unknown>).client;

      if (!client) {
        throw new Error('Client not available in context');
      }

      const exists = await verifySessionExists(client as any, sessionId);

      return JSON.stringify({
        sessionId,
        exists,
        verified: true,
      });
    },
  });
}

// Factory for cleanupOrphanedTask tool
export function createCleanupOrphanedTaskTool(stores, client): ReturnType<typeof tool> {
  return tool({
    description: 'Clean up an orphaned task from memory',
    args: {
      sessionId: tool.schema.string().describe('Session ID of the orphaned task to clean up'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const agentTaskStore = (context as Record<string, unknown>)
        .agentTaskStore as DualStoreManager<'text', 'timestamp'>;
      const agentTasks = (context as Record<string, unknown>).agentTasks as Map<string, AgentTask>;

      if (!agentTaskStore || !agentTasks) {
        throw new Error('Required task context not available');
      }

      const taskContext: TaskContext = {
        agentTaskStore,
        agentTasks,
      };

      await cleanupOrphanedTask(taskContext, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        cleaned: true,
      });
    },
  });
}
type Context = {
  agent: string;
  sessionID: string;
  messageID: string;
};

type Stores = {
  agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  sessionStore: DualStoreManager;
};

// Factory for updateTaskStatus tool
export function createUpdateTaskStatusTool(stores, client): ReturnType<typeof tool> {
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

      await updateTaskStatus(taskContext, sessionId, status, completionMessage);

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

// Factory for monitorTasks tool
export function createMonitorTasksTool(stores: Stores): ReturnType<typeof tool> {
  return tool({
    description: 'Monitor all tasks for timeouts and update status accordingly',
    args: {
      timeoutMinutes: tool.schema.number().default(30).describe('Timeout threshold in minutes'),
    },
    async execute(args, context: Context) {
      const { timeoutMinutes } = args;

      // wrong
      monitorTasks(taskContext);

      return JSON.stringify({
        success: true,
        timeoutMinutes,
        monitored: true,
        message: `Task monitoring completed with ${timeoutMinutes} minute timeout threshold`,
      });
    },
  });
}

// Factory for createTask tool
export function createCreateTaskTool(stores: Stores): ReturnType<typeof tool> {
  return tool({
    description: 'Create a new agent task',
    args: {
      sessionId: tool.schema.string().describe('Session ID for the task'),
      task: tool.schema.string().describe('Task description'),
    },
    async execute(args, context: Context) {
      const { sessionId, task } = args;

      const taskContext = {
        agentTaskStore: stores.agentTaskStore,
      };

      const agentTask = await createTask(taskContext, sessionId, task);

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
export function createGetAllTasksTool(stores: Stores): ReturnType<typeof tool> {
  return tool({
    description: 'Get all tasks from memory and storage',
    args: {},
    async execute(_args, context: Context) {
      const agentTaskStore = (context as Record<string, unknown>)
        .agentTaskStore as DualStoreManager<'text', 'timestamp'>;

      const taskContext = {
        agentTaskStore,
      };

      const allTasks = await getAllTasks(taskContext);
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

// Factory for parseTimestamp tool
export function createParseTimestampTool(): ReturnType<typeof tool> {
  return tool({
    description: 'Parse a timestamp into a Unix timestamp number',
    args: {
      timestamp: tool.schema
        .union([tool.schema.string(), tool.schema.number()])
        .describe('Timestamp to parse (string ISO format or number)'),
    },
    async execute({ timestamp }) {
      const parsed = parseTimestamp(timestamp);

      return JSON.stringify({
        original: timestamp,
        parsed,
        parsedDate: new Date(parsed).toISOString(),
      });
    },
  });
}

// Export all factory functions
export const tasksToolFactories = {
  createLoadPersistedTasksTool,
  createVerifySessionExistsTool,
  createCleanupOrphanedTaskTool,
  createUpdateTaskStatusTool,
  createMonitorTasksTool,
  createCreateTaskTool,
  createGetAllTasksTool,
  createParseTimestampTool,
};
