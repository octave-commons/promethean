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

  return {
    // Hook into tool execution before tools run
    'tool.execute.before': async (input, output) => {
      const { tool } = input;
      const { args } = output;

      try {
        const hookResult = await hookManager.executeBeforeHooks(tool, args, {
          pluginContext,
          metadata: { originalTool: tool },
        });

        // Return modified arguments if hooks changed them
        if (JSON.stringify(hookResult.args) !== JSON.stringify(args)) {
          return { args: hookResult.args };
        }
      } catch (error) {
        console.error('Before hook execution failed:', error);
        throw error;
      }
    },

    // Hook into tool execution after tools complete
    'tool.execute.after': async (input, output) => {
      const { tool } = input;
      const { args, result } = output;

      try {
        const hookResult = await hookManager.executeAfterHooks(
          tool,
          args,
          {
            success: true,
            result,
            metadata: {},
            executionTime: 0,
          },
          {
            pluginContext,
            metadata: { originalTool: tool },
          },
        );

        // Return modified result if hooks changed it
        if (JSON.stringify(hookResult.result) !== JSON.stringify(result)) {
          return { result: hookResult.result };
        }
      } catch (error) {
        console.error('After hook execution failed:', error);
        throw error;
      }
    },

    // Listen to session events
    event: async ({ event }) => {
      const { type, properties } = event;

      try {
        switch (type) {
          case 'session.idle':
            console.log('Session became idle:', properties);
            break;
          case 'session.start':
            console.log('Session started:', properties);
            break;
          case 'session.end':
            console.log('Session ended:', properties);
            break;
          case 'message.new':
            console.log('New message:', properties);
            break;
          case 'tool.start':
            console.log('Tool execution started:', properties);
            break;
          case 'tool.complete':
            console.log('Tool execution completed:', properties);
            break;
          case 'tool.error':
            console.log('Tool execution failed:', properties);
            break;
          default:
            console.log(`Unhandled event type: ${type}`);
        }
      } catch (error) {
        console.error(`Event handler failed for ${type}:`, error);
      }
    },

    // Provide hook management tools
    tool: {
      'hooks.register': {
        description: 'Register a new hook for tool execution',
        args: {
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
        async execute(args, context) {
          // For now, this is a placeholder - in a real implementation,
          // this would register hooks with the hookManager
          return {
            success: true,
            message: `Hook registration for ${args.id} noted`,
            context: pluginContext,
          };
        },
      },

      'hooks.list': {
        description: 'List all registered hooks',
        args: {},
        async execute(args, context) {
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
        args: {
          id: { type: 'string', description: 'Hook identifier to remove' },
        },
        async execute(args, context) {
          const removed = hookManager.unregisterHook(args.id);
          return {
            success: removed,
            message: removed ? `Hook ${args.id} removed` : `Hook ${args.id} not found`,
          };
        },
      },

      'hooks.clear': {
        description: 'Clear all registered hooks',
        args: {},
        async execute(args, context) {
          hookManager.clearHooks();
          return {
            success: true,
            message: 'All hooks cleared',
          };
        },
      },

      'hooks.statistics': {
        description: 'Get hook execution statistics',
        args: {},
        async execute(args, context) {
          return hookManager.getStatistics();
        },
      },
    },
  };
};
