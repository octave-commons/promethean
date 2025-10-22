// SPDX-License-Identifier: GPL-3.0-only
// OpenCode Interface Plugin
// Provides OpenCode functionality as tools within the OpenCode ecosystem

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';

import { createOpencodeClient } from '@opencode-ai/sdk';
import { initializeStores } from '../../initializeStores.js';

// Import existing actions
import { list as listSessions } from '../../actions/sessions/list.js';
import { get as getSession } from '../../actions/sessions/get.js';
import { close as closeSession } from '../../actions/sessions/close.js';
import { spawn as spawnSession } from '../../actions/sessions/spawn.js';
import { search as searchSessions } from '../../actions/sessions/search.js';
import { list as listEvents } from '../../actions/events/list.js';
import { getSessionMessages } from '../../actions/messages/index.js';

/**
 * OpenCode Interface Plugin - Provides OpenCode functionality as tools
 */
export const OpencodeInterfacePlugin: Plugin = async (_pluginContext) => {
  // Initialize stores on plugin load
  await initializeStores();

  // Create OpenCode client for operations that need it
  const opencodeClient = createOpencodeClient({
    baseUrl: 'http://localhost:4096',
  });

  return {
    tool: {
      // Session Management Tools
      'list-sessions': tool({
        description: 'List all active OpenCode sessions with pagination and filtering',
        args: {
          limit: tool.schema.number().default(20).describe('Number of sessions to return'),
          offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
          format: tool.schema.enum(['table', 'json']).default('table').describe('Output format'),
        },
        async execute(args) {
          try {
            const result = await listSessions({
              limit: args.limit,
              offset: args.offset,
            });

            if (args.format === 'json') {
              return JSON.stringify(result, null, 2);
            }

            // Handle error case
            if ('error' in result) {
              return `Error listing sessions: ${result.error}`;
            }

            // Format as readable text
            const sessions = result.sessions || [];

            let output = `Active Sessions (${sessions.length}):\n`;
            output += '='.repeat(80) + '\n';

            sessions.forEach((session: any) => {
              output += `ID: ${session.id}\n`;
              output += `Title: ${session.title || 'Untitled'}\n`;
              output += `Status: ${session.activityStatus || 'unknown'}\n`;
              output += `Messages: ${session.messageCount || 0}\n`;
              output += `Agent Task: ${session.isAgentTask ? 'Yes' : 'No'}\n`;
              output += `Created: ${session.time?.created || 'Unknown'}\n`;
              output += `Last Activity: ${session.lastActivityTime || 'Unknown'}\n`;
              output += '-'.repeat(40) + '\n';
            });

            if (result.summary) {
              output += `\nSummary:\n`;
              output += `  Active: ${result.summary.active}\n`;
              output += `  Waiting for Input: ${result.summary.waiting_for_input}\n`;
              output += `  Idle: ${result.summary.idle}\n`;
              output += `  Agent Tasks: ${result.summary.agentTasks}\n`;
            }

            return output;
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
            const result = await getSession({
              sessionId: args.sessionId,
              limit: args.limit,
              offset: args.offset,
            });

            return JSON.stringify(result, null, 2);
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
            const result = await closeSession({
              sessionId: args.sessionId,
            });

            return JSON.stringify(result, null, 2);
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
            const result = await spawnSession({
              title: args.title,
              message: args.message,
              client: opencodeClient,
            });

            return result;
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

            return JSON.stringify(result, null, 2);
          } catch (error) {
            throw new Error(
              `Failed to search sessions: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      // Event Management Tools
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

            // TODO: Format output nicely as markdown
            return JSON.stringify(result);
          } catch (error) {
            return `Failed to list events: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      // Message Management Tools
      'list-messages': tool({
        description: 'List messages for a specific session',
        args: {
          sessionId: tool.schema.string().describe('Session ID'),
          limit: tool.schema.number().default(10).describe('Number of messages to return'),
          format: tool.schema.enum(['table', 'json']).default('table').describe('Output format'),
        },
        async execute(args) {
          try {
            const messages = await getSessionMessages(opencodeClient, args.sessionId);
            const limitedMessages = messages.slice(-args.limit);

            if (args.format === 'json') {
              return JSON.stringify(limitedMessages, null, 2);
            }

            let output = `Messages for session ${args.sessionId} (${limitedMessages.length} recent):\n`;
            output += '='.repeat(80) + '\n';

            limitedMessages.forEach((message: any, index: number) => {
              const textParts = message.parts?.filter((part: any) => part.type === 'text') || [];
              const text = textParts.map((part: any) => part.text).join(' ') || '[No text content]';
              const timestamp = message.info?.time?.created || new Date().toISOString();

              output += `\nMessage ${index + 1}:\n`;
              output += `  ID: ${message.info?.id || 'unknown'}\n`;
              output += `  Role: ${message.info?.role || 'unknown'}\n`;
              output += `  Time: ${new Date(timestamp).toLocaleString()}\n`;
              output += `  Content: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}\n`;
              output += '-'.repeat(40) + '\n';
            });

            return output;
          } catch (error) {
            throw new Error(
              `Failed to list messages: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      'get-message': tool({
        description: 'Get a specific message from a session',
        args: {
          sessionId: tool.schema.string().describe('Session ID'),
          messageId: tool.schema.string().describe('Message ID'),
        },
        async execute(args) {
          try {
            const result = await opencodeClient.session.message({
              path: { id: args.sessionId, messageID: args.messageId },
            });

            return JSON.stringify(result.data, null, 2);
          } catch (error) {
            throw new Error(
              `Failed to get message: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      'send-prompt': tool({
        description: 'Send a prompt/message to a session',
        args: {
          sessionId: tool.schema.string().describe('Session ID'),
          content: tool.schema.string().describe('Message content'),
        },
        async execute(args) {
          try {
            const result = await opencodeClient.session.prompt({
              path: { id: args.sessionId },
              body: {
                parts: [
                  {
                    type: 'text' as const,
                    text: args.content,
                  },
                ],
              },
            });

            return JSON.stringify(result.data, null, 2);
          } catch (error) {
            return `Failed to send prompt: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),
    },

    // Plugin lifecycle hooks
    // async event(input) {
    //   // Handle plugin-level events if needed
    //   // console.log(`[OpenCode Interface Plugin] Event received: ${input.event.type}`);
    // },

    // // Tool execution hooks for logging and monitoring
    // 'tool.execute.before': async (input) => {
    //   // console.log(`[OpenCode Interface Plugin] Executing tool: ${input.tool}`);
    // },

    // 'tool.execute.after': async (input) => {
    //   // console.log(`[OpenCode Interface Plugin] Tool completed: ${input.tool}`);
    // },
  };
};

export default OpencodeInterfacePlugin;
