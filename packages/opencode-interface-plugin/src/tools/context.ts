// SPDX-License-Identifier: GPL-3.0-only
// Context/search tool builders shared across Session Orchestrator variants

import { tool } from '@opencode-ai/plugin/tool';

import { compileContext } from '../compileContext.js';
import { searchAcrossStores } from '../services/unified-store.js';
import { formatSearchResults } from '../shared/formatters.js';
import { messageToMarkdown } from '../services/indexer-formatters.js';
import { validate } from '../utils/validation.js';

export function createContextTools(): Record<string, ReturnType<typeof tool>> {
  return {
    'compile-context': tool({
      description:
        'Compile and search the complete context store (sessions, events, messages) with unified access',
      args: {
        query: tool.schema.string().optional().describe('Search query to filter context'),
        includeSessions: tool.schema
          .boolean()
          .default(true)
          .describe('Include sessions in context'),
        includeEvents: tool.schema.boolean().default(true).describe('Include events in context'),
        includeMessages: tool.schema
          .boolean()
          .default(true)
          .describe('Include messages in context'),
        sessionId: tool.schema.string().optional().describe('Filter by specific session ID'),
        limit: tool.schema.number().default(50).describe('Maximum results per type'),
      },
      async execute(args) {
        try {
          const query = validate.searchQuery(args.query);
          const limit = validate.limit(args.limit, 50);
          const sessionId = validate.optionalString(args.sessionId, 'sessionId');

          const context = await compileContext({
            texts: query ? [query] : [],
            limit,
          });

          let output = `# Compiled Context\n\n`;
          output += `**Query:** ${query || 'No query'}\n`;
          output += `**Session Filter:** ${sessionId || 'All sessions'}\n\n`;

          if (Array.isArray(context)) {
            output += `## Messages (${context.length})\n\n`;
            context.slice(0, limit).forEach((message: any) => {
              try {
                output += messageToMarkdown(message);
              } catch (error) {
                output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
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
    }),

    'search-context': tool({
      description: 'Unified search across all OpenCode data (sessions, events, messages)',
      args: {
        query: tool.schema.string().describe('Search query'),
        sessionId: tool.schema.string().optional().describe('Filter by session ID'),
        limit: tool.schema.number().default(20).describe('Maximum results per category'),
      },
      async execute(args) {
        try {
          const query = validate.string(args.query, 'query');
          const limit = validate.limit(args.limit, 20);
          const sessionId = validate.optionalString(args.sessionId, 'sessionId');

          const searchResults = await searchAcrossStores(query, {
            limit,
            sessionId,
            includeSessions: true,
            includeMessages: true,
            includeEvents: true,
          });

          return formatSearchResults({
            sessions: searchResults.sessions.map((entry) => ({
              id: entry.metadata?.sessionId || entry.id,
              title: entry.metadata?.title || 'Untitled Session',
              ...entry.metadata,
            })),
            events: searchResults.events.map((entry) => ({
              id: entry.id,
              eventType: entry.metadata?.eventType || 'unknown',
              timestamp: entry.timestamp,
              text: entry.text,
              ...entry.metadata,
            })),
            messages: searchResults.messages.map((entry) => ({
              id: entry.metadata?.messageId || entry.id,
              sessionId: entry.metadata?.sessionId,
              role: entry.metadata?.role,
              text: entry.text,
              timestamp: entry.timestamp,
              ...entry.metadata,
            })),
            query,
            summary: {
              totalSessions: searchResults.sessions.length,
              totalEvents: searchResults.events.length,
              totalMessages: searchResults.messages.length,
            },
          });
        } catch (error) {
          throw new Error(
            `Failed to search context: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),
  };
}
