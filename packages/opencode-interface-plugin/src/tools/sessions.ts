// SPDX-License-Identifier: GPL-3.0-only
// Session Management Tools

import { tool } from '@opencode-ai/plugin/tool';
import type { Tool } from '@opencode-ai/plugin';

// Import from opencode-client (peer dependency)
import {
  list as listSessionsAction,
  get as getSessionAction,
  close as closeSessionAction,
  spawn as spawnSessionAction,
  search as searchSessionsAction,
} from '@promethean-os/opencode-client';

// Import markdown formatters
import { sessionToMarkdown } from '@promethean-os/opencode-client';

/**
 * Format sessions list as markdown
 */
function formatSessionsList(result: any): string {
  if ('error' in result) {
    return `Error listing sessions: ${result.error}`;
  }

  const sessions = result.sessions || [];
  let output = `# Active Sessions (${sessions.length})\n\n`;

  sessions.forEach((session: any) => {
    try {
      output += sessionToMarkdown(session);
    } catch (e) {
      output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
    }
  });

  if (result.summary) {
    output += `## Summary\n`;
    output += `- **Active:** ${result.summary.active}\n`;
    output += `- **Waiting for Input:** ${result.summary.waiting_for_input}\n`;
    output += `- **Idle:** ${result.summary.idle}\n`;
    output += `- **Agent Tasks:** ${result.summary.agentTasks}\n\n`;
  }

  output += `## Pagination\n`;
  output += `- **Page:** ${result.pagination.currentPage} / ${result.pagination.totalPages}\n`;
  output += `- **Total:** ${result.totalCount} sessions\n`;
  output += `- **Showing:** ${result.pagination.limit} per page\n`;

  return output;
}

/**
 * List sessions tool
 */
export const list = tool({
  description: 'List all active OpenCode sessions with pagination and filtering',
  args: {
    limit: tool.schema.number().default(20).describe('Number of sessions to return'),
    offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
  },
  async execute(args: any) {
    try {
      const result = await listSessionsAction({
        limit: args.limit,
        offset: args.offset,
      });

      return formatSessionsList(result);
    } catch (error) {
      throw new Error(
        `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

/**
 * Get session tool
 */
export const get = tool({
  description: 'Get detailed information about a specific session',
  args: {
    sessionId: tool.schema.string().describe('Session ID to retrieve'),
    limit: tool.schema.number().optional().describe('Number of messages to include'),
    offset: tool.schema.number().optional().describe('Number of messages to skip'),
  },
  async execute(args: any) {
    try {
      const result = await getSessionAction({
        sessionId: args.sessionId,
        limit: args.limit,
        offset: args.offset,
      });

      let output = `# Session Details\n\n`;

      if ('error' in result) {
        output += `Error: ${result.error}\n`;
      } else if (result.session && typeof result.session === 'object') {
        try {
          output += sessionToMarkdown(result.session as any);
        } catch (formatError) {
          output += `**Session Data:**\n`;
          output += `\`\`\`json\n${JSON.stringify(result.session, null, 2)}\n\`\`\`\n`;
        }

        if (result.messages && Array.isArray(result.messages)) {
          output += `\n## Messages (${result.messages.length})\n\n`;
          result.messages.forEach((message: any) => {
            try {
              output += sessionToMarkdown(message);
            } catch (e) {
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
});

/**
 * Close session tool
 */
export const close = tool({
  description: 'Close an active session',
  args: {
    sessionId: tool.schema.string().describe('Session ID to close'),
  },
  async execute(args: any) {
    try {
      const result = await closeSessionAction({
        sessionId: args.sessionId,
      });

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
});

/**
 * Spawn session tool
 */
export const spawn = tool({
  description: 'Spawn a new session with an initial message',
  args: {
    title: tool.schema.string().optional().describe('Optional title for the session'),
    message: tool.schema.string().describe('Initial message/prompt for the session'),
  },
  async execute(args: any) {
    try {
      const result = await spawnSessionAction({
        title: args.title,
        message: args.message,
        client: args.client, // Will be provided by plugin
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
        } catch (parseError) {
          output += result;
        }
      } else if (result && typeof result === 'object' && 'error' in result) {
        output += `**Error:** ${(result as any).error}\n`;
      } else if (result && typeof result === 'object' && 'id' in result) {
        output += `**Session ID:** ${(result as any).id || 'Unknown'}\n`;
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
});

/**
 * Search sessions tool
 */
export const search = tool({
  description: 'Search for sessions by title, content, or metadata',
  args: {
    query: tool.schema.string().describe('Search query'),
    k: tool.schema.number().optional().describe('Maximum number of results'),
    sessionId: tool.schema.string().optional().describe('Filter by session ID'),
  },
  async execute(args: any) {
    try {
      const result = await searchSessionsAction({
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
          } catch (e) {
            output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
          }
        });
      } else if (result && typeof result === 'object' && 'results' in result) {
        output += `**Results:** ${result.results.length} sessions found\n\n`;
        result.results.forEach((session: any) => {
          try {
            output += sessionToMarkdown(session);
          } catch (e) {
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
});
