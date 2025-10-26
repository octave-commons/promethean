// SPDX-License-Identifier: GPL-3.0-only
// Event Management Tools

import { tool } from '@opencode-ai/plugin/tool';

// Import from opencode-client (peer dependency)
import { list as listEventsAction } from '@promethean-os/opencode-client';

// Import markdown formatters
import { eventToMarkdown } from '@promethean-os/opencode-client';

/**
 * Format events list as markdown
 */
function formatEventsList(events: any[]): string {
  let output = `# Events (${events.length})\n\n`;

  events.forEach((event: any) => {
    try {
      output += eventToMarkdown(event);
    } catch (e) {
      output += `**Event:** ${JSON.stringify(event).substring(0, 200)}...\n\n`;
    }
  });

  return output;
}

/**
 * List events tool
 */
export const list = tool({
  description: 'List recent events from the event store',
  args: {
    query: tool.schema.string().optional().describe('Search query for events'),
    k: tool.schema.number().optional().describe('Maximum number of events to return'),
    eventType: tool.schema.string().optional().describe('Filter by event type'),
    sessionId: tool.schema.string().optional().describe('Filter by session ID'),
  },
  async execute(args: any) {
    try {
      const result = await listEventsAction({
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
});
