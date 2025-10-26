// SPDX-License-Identifier: GPL-3.0-only
// Tasks plugin - wraps all tasks factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { tasksToolFactories } from '../factories/index.js';

export const TasksPlugin: Plugin = async ({ client }) => {
  // Get stores from context (will be injected during plugin initialization)
  const stores = {} as any; // This will be populated by the plugin system

  // Inject client and stores into all tasks tools
  const cleanupOrphanedTaskTool = tasksToolFactories.createCleanupOrphanedTaskTool(stores, client);
  const updateTaskStatusTool = tasksToolFactories.createUpdateTaskStatusTool(stores, client);
  const createTaskTool = tasksToolFactories.createCreateTaskTool(stores);
  const getAllTasksTool = tasksToolFactories.createGetAllTasksTool(stores);

  return {
    tool: {
      tasks_cleanupOrphaned: {
        ...cleanupOrphanedTaskTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return cleanupOrphanedTaskTool.execute(args, enhancedContext);
        },
      },
      tasks_updateStatus: {
        ...updateTaskStatusTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return updateTaskStatusTool.execute(args, enhancedContext);
        },
      },
      tasks_create: {
        ...createTaskTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return createTaskTool.execute(args, enhancedContext);
        },
      },
      tasks_getAll: {
        ...getAllTasksTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getAllTasksTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
