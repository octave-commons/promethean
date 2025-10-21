// SPDX-License-Identifier: GPL-3.0-only
// Tasks plugin - wraps all tasks factory tools with client injection

import type { Plugin } from '@opencode-ai/plugin';
import { tasksToolFactories } from '../factories/index.js';

export const TasksPlugin: Plugin = async ({ client }) => {
  // Inject client into all tasks tools
  const loadPersistedTasksTool = tasksToolFactories.createLoadPersistedTasksTool();
  const verifySessionExistsTool = tasksToolFactories.createVerifySessionExistsTool();
  const cleanupOrphanedTaskTool = tasksToolFactories.createCleanupOrphanedTaskTool();
  const updateTaskStatusTool = tasksToolFactories.createUpdateTaskStatusTool();
  const monitorTasksTool = tasksToolFactories.createMonitorTasksTool();
  const createTaskTool = tasksToolFactories.createCreateTaskTool();
  const getAllTasksTool = tasksToolFactories.createGetAllTasksTool();
  const parseTimestampTool = tasksToolFactories.createParseTimestampTool();

  return {
    tool: {
      'tasks_loadPersisted': {
        ...loadPersistedTasksTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return loadPersistedTasksTool.execute(args, enhancedContext);
        },
      },
      'tasks_verifySession': {
        ...verifySessionExistsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return verifySessionExistsTool.execute(args, enhancedContext);
        },
      },
      'tasks_cleanupOrphaned': {
        ...cleanupOrphanedTaskTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return cleanupOrphanedTaskTool.execute(args, enhancedContext);
        },
      },
      'tasks_updateStatus': {
        ...updateTaskStatusTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return updateTaskStatusTool.execute(args, enhancedContext);
        },
      },
      'tasks_monitor': {
        ...monitorTasksTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return monitorTasksTool.execute(args, enhancedContext);
        },
      },
      'tasks_create': {
        ...createTaskTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return createTaskTool.execute(args, enhancedContext);
        },
      },
      'tasks_getAll': {
        ...getAllTasksTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getAllTasksTool.execute(args, enhancedContext);
        },
      },
      'tasks_parseTimestamp': {
        ...parseTimestampTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return parseTimestampTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
