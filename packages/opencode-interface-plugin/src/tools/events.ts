// SPDX-License-Identifier: GPL-3.0-only
// Event tooling shared across Session Orchestrator plugins

import { tool } from '@opencode-ai/plugin/tool';

import { list as listEvents } from '../actions/events/list.js';
import { formatEventsList } from '../shared/formatters.js';

export function createEventTools(): Record<string, ReturnType<typeof tool>> {
  return {
    'list-events': tool({
      description: 'List recent events from the event store',
      args: {
        query: tool.schema.string().optional().describe('Search query for events'),
        k: tool.schema.number().optional().describe('Maximum number of events to return'),
        eventType: tool.schema.string().optional().describe('Filter by event type'),
        sessionId: tool.schema.string().optional().describe('Filter by session ID'),
      },
      async execute(args) {
        try {
          const result = await listEvents({
            query: args.query,
            k: args.k,
            eventType: args.eventType,
            sessionId: args.sessionId,
          });

          return formatEventsList(result || []);
        } catch (error) {
          return `Failed to list events: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
  };
}
