// SPDX-License-Identifier: GPL-3.0-only
// Context Search Tools

import { tool } from '@opencode-ai/plugin/tool';

// Import from opencode-client (peer dependency)
import {
  compileContext as compileContextAction,
  searchAcrossStores,
} from '@promethean-os/opencode-client';

// Import markdown formatters
import { messageToMarkdown } from '@promethean-os/opencode-client';

/**
 * Format search results as markdown
 */
function formatSearchResults(results: {
  sessions: any[];
  events: any[];
  messages: any[];
  query: string;
  summary: {
    totalSessions: number;
    totalEvents: number;
    totalMessages: number;
  };
}): string {
  let output = `# Unified Search Results\n\n`;
  output += `**Query:** ${results.query}\n\n`;

  output += `## Summary\n`;
  output += `- **Sessions:** ${results.summary.totalSessions}\n`;
  output += `- **Events:** ${results.summary.totalEvents}\n`;
  output += `- **Messages:** ${results.summary.totalMessages}\n\n`;

  if (results.summary.totalSessions > 0) {
    output += `## Sessions (${results.summary.totalSessions})\n\n`;
    results.sessions.forEach((session: any) => {
      try {
        output += sessionToMarkdown(session);
      } catch (e) {
        output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
      }
    });
  }

  if (results.summary.totalEvents > 0) {
    output += `## Events (${results.summary.totalEvents})\n\n`;
    results.events.forEach((event: any) => {
      try {
        output += eventToMarkdown(event);
      } catch (e) {
        output += `**Event:** ${JSON.stringify(event).substring(0, 200)}...\n\n`;
      }
    });
  }

  if (results.summary.totalMessages > 0) {
    output += `## Messages (${results.summary.totalMessages})\n\n`;
    results.messages.forEach((message: any) => {
      try {
        output += messageToMarkdown(message);
      } catch (e) {
        output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
      }
    });
  }

  return output;
}

/**
 * Compile context tool
 */
export const compileContext = tool({
  description:
    'Compile and search the complete context store (sessions, events, messages) with unified access',
  args: {
    query: tool.schema.string().optional().describe('Search query to filter context'),
    includeSessions: tool.schema.boolean().default(true).describe('Include sessions in context'),
    includeEvents: tool.schema.boolean().default(true).describe('Include events in context'),
    includeMessages: tool.schema.boolean().default(true).describe('Include messages in context'),
    sessionId: tool.schema.string().optional().describe('Filter by specific session ID'),
    limit: tool.schema.number().default(50).describe('Maximum results per type'),
  },
  async execute(args: any) {
    try {
      const context = await compileContextAction({
        texts: args.query ? [args.query] : [],
        limit: args.limit,
      });

      // Format messages as markdown
      let output = `# Compiled Context\n\n`;
      output += `**Query:** ${args.query || 'No query'}\n`;
      output += `**Session Filter:** ${args.sessionId || 'All sessions'}\n\n`;

      if (Array.isArray(context)) {
        output += `## Messages (${context.length})\n\n`;
        context.slice(0, args.limit).forEach((msg: any) => {
          try {
            output += messageToMarkdown(msg);
          } catch (e) {
            output += `**Message:** ${JSON.stringify(msg).substring(0, 200)}...\n\n`;
          }
        });
      }

      return output;
    } catch (error) {
      throw new Error(
        `Failed to compile context: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

/**
 * Search context tool
 */
export const searchContext = tool({
  description: 'Unified search across all OpenCode data (sessions, events, messages)',
  args: {
    query: tool.schema.string().describe('Search query'),
    sessionId: tool.schema.string().optional().describe('Filter by session ID'),
    limit: tool.schema.number().default(20).describe('Maximum results per category'),
  },
  async execute(args: any) {
    try {
      // Use unified store search to eliminate N+1 patterns
      const searchResults = await searchAcrossStores(args.query, {
        limit: args.limit,
        sessionId: args.sessionId,
        includeSessions: true,
        includeMessages: true,
        includeEvents: true,
      });

      // Convert unified store results to expected format
      const results = {
        sessions: searchResults.sessions.map((entry) => ({
          id: entry.metadata?.sessionId || entry.id,
          title: entry.metadata?.title || 'Untitled Session',
          // Add other session properties as needed
          ...entry.metadata,
        })),
        events: searchResults.events.map((entry) => ({
          id: entry.id,
          eventType: entry.metadata?.eventType || 'unknown',
          timestamp: entry.timestamp,
          text: entry.text,
          // Add other event properties as needed
          ...entry.metadata,
        })),
        messages: searchResults.messages.map((entry) => ({
          id: entry.metadata?.messageId || entry.id,
          sessionId: entry.metadata?.sessionId,
          role: entry.metadata?.role,
          text: entry.text,
          timestamp: entry.timestamp,
          // Add other message properties as needed
          ...entry.metadata,
        })),
        query: args.query,
        summary: {
          totalSessions: searchResults.sessions.length,
          totalEvents: searchResults.events.length,
          totalMessages: searchResults.messages.length,
        },
      };

      return formatSearchResults(results);
    } catch (error) {
      throw new Error(
        `Failed to search context: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});
