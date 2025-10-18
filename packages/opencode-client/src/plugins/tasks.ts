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
      'tasks.loadPersisted': {
        ...loadPersistedTasksTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return loadPersistedTasksTool.execute(args, enhancedContext);
        },
      },
      'tasks.verifySession': {
        ...verifySessionExistsTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return verifySessionExistsTool.execute(args, enhancedContext);
        },
      },
      'tasks.cleanupOrphaned': {
        ...cleanupOrphanedTaskTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return cleanupOrphanedTaskTool.execute(args, enhancedContext);
        },
      },
      'tasks.updateStatus': {
        ...updateTaskStatusTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return updateTaskStatusTool.execute(args, enhancedContext);
        },
      },
      'tasks.monitor': {
        ...monitorTasksTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return monitorTasksTool.execute(args, enhancedContext);
        },
      },
      'tasks.create': {
        ...createTaskTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return createTaskTool.execute(args, enhancedContext);
        },
      },
      'tasks.getAll': {
        ...getAllTasksTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return getAllTasksTool.execute(args, enhancedContext);
        },
      },
      'tasks.parseTimestamp': {
        ...parseTimestampTool,
        async execute(args: any, context: any) {
          const enhancedContext = { ...context, client };
          return parseTimestampTool.execute(args, enhancedContext);
        },
      },
    },
  };
};
