// SPDX-License-Identifier: GPL-3.0-only
// Session lifecycle tool builders shared across Session Orchestrator variants

import { tool } from '@opencode-ai/plugin/tool';
import type { OpencodeClient } from '@opencode-ai/sdk';

import { list as listSessions } from '../actions/sessions/list.js';
import { get as getSession } from '../actions/sessions/get.js';
import { close as closeSession } from '../actions/sessions/close.js';
import { spawn as spawnSession } from '../actions/sessions/spawn.js';
import { search as searchSessions } from '../actions/sessions/search.js';
import { formatSessionsList } from '../shared/formatters.js';
import { sessionToMarkdown, messageToMarkdown } from '../services/indexer-formatters.js';
import { validate } from '../utils/validation.js';

export function createSessionTools(
  opencodeClient: OpencodeClient,
): Record<string, ReturnType<typeof tool>> {
  return {
    'list-sessions': tool({
      description: 'List all active OpenCode sessions with pagination and filtering',
      args: {
        limit: tool.schema.number().default(20).describe('Number of sessions to return'),
        offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
      },
      async execute(args) {
        try {
          const limit = validate.limit(args.limit, 20);
          const offset = validate.number(args.offset || 0, 'offset');

          const result = await listSessions({
            limit,
            offset,
          });

          return formatSessionsList(result);
        } catch (error) {
          throw new Error(
            `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),

    'get-session': tool({
      description: 'Get detailed information about a specific session',
      args: {
        sessionId: tool.schema.string().describe('Session ID to retrieve'),
        limit: tool.schema.number().optional().describe('Number of messages to include'),
        offset: tool.schema.number().optional().describe('Number of messages to skip'),
      },
      async execute(args) {
        try {
          const sessionId = validate.sessionId(args.sessionId);
          const limit = args.limit !== undefined ? validate.number(args.limit, 'limit') : undefined;
          const offset =
            args.offset !== undefined ? validate.number(args.offset, 'offset') : undefined;

          const result = await getSession({ sessionId, limit, offset });

          let output = `# Session Details\n\n`;

          if ('error' in result) {
            output += `Error: ${result.error}\n`;
          } else if (result.session && typeof result.session === 'object') {
            try {
              output += sessionToMarkdown(result.session as any);
            } catch (error) {
              output += `**Session Data:**\n`;
              output += `\`\`\`json\n${JSON.stringify(result.session, null, 2)}\n\`\`\`\n`;
            }

            if (result.messages && Array.isArray(result.messages)) {
              output += `\n## Messages (${result.messages.length})\n\n`;
              result.messages.forEach((message: any) => {
                try {
                  output += messageToMarkdown(message);
                } catch (error) {
                  output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
                }
              });
            }
          } else {
            output += `**Session Data:**\n`;
            output += `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n`;
          }

          return output;
        } catch (error) {
          throw new Error(
            `Failed to get session: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),

    'close-session': tool({
      description: 'Close an active session',
      args: {
        sessionId: tool.schema.string().describe('Session ID to close'),
      },
      async execute(args) {
        try {
          const result = await closeSession({ sessionId: args.sessionId });

          let output = `# Close Session Result\n\n`;
          output += `**Session ID:** ${args.sessionId}\n\n`;

          if ('error' in result) {
            output += `**Error:** ${result.error}\n`;
          } else {
            output += `**Status:** Successfully closed\n`;
            if (result.message) {
              output += `**Message:** ${result.message}\n`;
            }
          }

          return output;
        } catch (error) {
          throw new Error(
            `Failed to close session: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),

    'spawn-session': tool({
      description: 'Spawn a new session with an initial message',
      args: {
        title: tool.schema.string().optional().describe('Optional title for the session'),
        message: tool.schema.string().describe('Initial message/prompt for the session'),
      },
      async execute(args) {
        try {
          const result: any = await spawnSession({
            title: args.title,
            message: args.message,
            client: opencodeClient,
          });

          let output = `# New Session Created\n\n`;

          if (typeof result === 'string') {
            try {
              const parsed = JSON.parse(result);
              if (parsed.success && parsed.session) {
                output += `**Session ID:** ${parsed.session.id || 'Unknown'}\n`;
                output += `**Title:** ${parsed.session.title || args.title || 'Untitled'}\n`;
                output += `**Status:** Successfully created\n`;
                output += `**Created:** ${parsed.session.createdAt || 'Unknown'}\n`;
                output += `**Initial Message:** ${args.message}\n`;
              } else {
                output += result;
              }
            } catch {
              output += result;
            }
          } else if (result && typeof result === 'object' && 'error' in result) {
            output += `**Error:** ${result.error}\n`;
          } else if (result && typeof result === 'object' && 'id' in result) {
            output += `**Session ID:** ${result.id || 'Unknown'}\n`;
            output += `**Title:** ${args.title || 'Untitled'}\n`;
            output += `**Status:** Successfully created\n`;
            output += `**Initial Message:** ${args.message}\n`;
          } else {
            output += `**Status:** Session creation initiated\n`;
            output += `**Title:** ${args.title || 'Untitled'}\n`;
            output += `**Initial Message:** ${args.message}\n`;
          }

          return output;
        } catch (error) {
          throw new Error(
            `Failed to spawn session: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),

    'search-sessions': tool({
      description: 'Search for sessions by title, content, or metadata',
      args: {
        query: tool.schema.string().describe('Search query'),
        k: tool.schema.number().optional().describe('Maximum number of results'),
        sessionId: tool.schema.string().optional().describe('Filter by session ID'),
      },
      async execute(args) {
        try {
          const result = await searchSessions({
            query: args.query,
            k: args.k,
            sessionId: args.sessionId,
          });

          let output = `# Session Search Results\n\n`;
          output += `**Query:** ${args.query}\n\n`;

          if (Array.isArray(result)) {
            output += `**Results:** ${result.length} sessions found\n\n`;
            result.forEach((session: any) => {
              try {
                output += sessionToMarkdown(session);
              } catch (error) {
                output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
              }
            });
          } else if (result && typeof result === 'object' && 'results' in result) {
            output += `**Results:** ${result.results.length} sessions found\n\n`;
            result.results.forEach((session: any) => {
              try {
                output += sessionToMarkdown(session);
              } catch (error) {
                output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
              }
            });
          } else if (result && typeof result === 'object' && 'error' in result) {
            output += `**Error:** ${result.error}\n`;
          } else {
            output += `**No results found**\n`;
          }

          return output;
        } catch (error) {
          throw new Error(
            `Failed to search sessions: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),
  };
}
