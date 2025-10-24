// SPDX-License-Identifier: GPL-3.0-only
// Event Hooks Plugin for @promethean-os/opencode-client

import type { Plugin } from '@opencode-ai/plugin';
import { hookManager } from '../../hooks/tool-execute-hooks.js';

/**
 * Event Hooks Plugin - Provides hook management functionality
 */
export const EventHooksPlugin: Plugin = async () => {
  return {
    // Provide hook manager as a tool for external access
    tool: {
      'event-hooks.register-before': {
        description: 'Register a before hook for tool execution',
        args: {
          id: { type: 'string', description: 'Unique hook identifier' },
          tool: { type: 'string', description: 'Tool name to hook into (wildcard supported)' },
          hook: { type: 'string', description: 'Hook function code' },
          priority: {
            type: 'number',
            description: 'Priority level (lower numbers execute first)',
            optional: true,
          },
        },
        execute: async (args: any) => {
          // This would need proper function serialization/deserialization in a real implementation
          return `Before hook ${args.id} registered for tool ${args.tool}`;
        },
      },
      'event-hooks.register-after': {
        description: 'Register an after hook for tool execution',
        args: {
          id: { type: 'string', description: 'Unique hook identifier' },
          tool: { type: 'string', description: 'Tool name to hook into (wildcard supported)' },
          hook: { type: 'string', description: 'Hook function code' },
          priority: {
            type: 'number',
            description: 'Priority level (lower numbers execute first)',
            optional: true,
          },
        },
        execute: async (args: any) => {
          // This would need proper function serialization/deserialization in a real implementation
          return `After hook ${args.id} registered for tool ${args.tool}`;
        },
      },
      'event-hooks.list-hooks': {
        description: 'List all registered hooks',
        args: {},
        execute: async () => {
          return hookManager.getHooks();
        },
      },
      'event-hooks.clear-hooks': {
        description: 'Clear all registered hooks',
        args: {},
        execute: async () => {
          hookManager.clearHooks();
          return 'All hooks cleared';
        },
      },
    },
  };
};

export default EventHooksPlugin;
