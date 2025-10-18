// SPDX-License-Identifier: GPL-3.0-only
// Event-Driven Plugin Hooks Implementation

import type { Plugin } from '@opencode-ai/plugin';
import { hookManager } from '../hooks/tool-execute-hooks.js';

/**
 * Event-Driven Plugin Hooks
 *
 * Provides a plugin that enables event-driven hook functionality
 * for intercepting and enhancing tool execution across all plugins.
 */
export const EventHooksPlugin: Plugin = async ({ client, project, $, directory, worktree }) => {
  // Initialize hook manager with plugin context
  const pluginContext = { client, project, $, directory, worktree };

  // Event handler functions
  const handleToolExecuteBefore = async (data: any, context: any) => {
    const { toolName, args, context: toolContext } = data;
    try {
      const hookResult = await hookManager.executeBeforeHooks(toolName, args, {
        ...toolContext,
        pluginContext: context,
      });
      return { modifiedArgs: hookResult.args, metrics: hookResult.metrics };
    } catch (error) {
      console.error('Before hook execution failed:', error);
      throw error;
    }
  };

  const handleToolExecuteAfter = async (data: any, context: any) => {
    const { toolName, args, result, context: toolContext } = data;
    try {
      const hookResult = await hookManager.executeAfterHooks(toolName, args, result, {
        ...toolContext,
        pluginContext: context,
      });
      return { modifiedResult: hookResult.result, metrics: hookResult.metrics };
    } catch (error) {
      console.error('After hook execution failed:', error);
      throw error;
    }
  };

  return {
    tool: {
      // Hook management tools
      'hooks.register': {
        description: 'Register a new hook for tool execution',
        parameters: {
          id: { type: 'string', description: 'Unique hook identifier' },
          type: { type: 'string', enum: ['before', 'after'], description: 'Hook type' },
          tools: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tool patterns to match',
          },
          priority: { type: 'number', description: 'Execution priority (lower = first)' },
          timeout: { type: 'number', description: 'Hook timeout in milliseconds' },
        },
        async execute(args: any) {
          // This would need to be implemented with a hook registry
          // For now, return a placeholder response
          return {
            success: true,
            message: `Hook registration for ${args.id} would be implemented here`,
            context: pluginContext,
          };
        },
      },

      'hooks.list': {
        description: 'List all registered hooks',
        parameters: {},
        async execute() {
          const hooks = hookManager.getHooks();
          return {
            hooks: hooks.map((h) => ({
              id: h.id,
              type: h.type,
              tools: h.tools,
              priority: h.priority,
              timeout: h.timeout,
            })),
            statistics: hookManager.getStatistics(),
          };
        },
      },

      'hooks.unregister': {
        description: 'Unregister a hook by ID',
        parameters: {
          id: { type: 'string', description: 'Hook identifier to remove' },
        },
        async execute(args: any) {
          const removed = hookManager.unregisterHook(args.id);
          return {
            success: removed,
            message: removed ? `Hook ${args.id} removed` : `Hook ${args.id} not found`,
          };
        },
      },

      'hooks.clear': {
        description: 'Clear all registered hooks',
        parameters: {},
        async execute() {
          hookManager.clearHooks();
          return {
            success: true,
            message: 'All hooks cleared',
          };
        },
      },

      'hooks.statistics': {
        description: 'Get hook execution statistics',
        parameters: {},
        async execute() {
          return hookManager.getStatistics();
        },
      },
    },

    // Event handlers for reactive processing
    event: async ({ event }) => {
      const { type, data } = event;

      try {
        switch (type) {
          case 'tool.execute.before':
            await handleToolExecuteBefore(data, pluginContext);
            break;
          case 'tool.execute.after':
            await handleToolExecuteAfter(data, pluginContext);
            break;
          case 'session.created':
            console.log(`Session created: ${data.sessionId}`);
            break;
          case 'session.completed':
            console.log(`Session completed: ${data.sessionId}`);
            break;
          case 'session.error':
            console.error(`Session error: ${data.sessionId}`, data.error);
            break;
          case 'task.created':
            console.log(`Task created: ${data.taskId}`);
            break;
          case 'task.completed':
            console.log(`Task completed: ${data.taskId}`);
            break;
          case 'task.failed':
            console.error(`Task failed: ${data.taskId}`, data.error);
            break;
          case 'system.startup':
            console.log('System startup detected');
            break;
          case 'system.shutdown':
            console.log('System shutdown detected');
            break;
          default:
            console.log(`Unhandled event type: ${type}`);
        }
      } catch (error) {
        console.error(`Event handler failed for ${type}:`, error);
      }
    },
  };
};
