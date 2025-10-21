// SPDX-License-Identifier: GPL-3.0-only
// OpenCode Interface Plugin
// Provides OpenCode functionality as tools within the OpenCode ecosystem

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';
import { initializeStores } from '../../initializeStores.js';
import { createOpencodeClient } from '@opencode-ai/sdk';

// Import existing actions
import { list as listSessions } from '../../actions/sessions/list.js';
import { get as getSession } from '../../actions/sessions/get.js';
import { create as createSession } from '../../actions/sessions/create.js';
import { close as closeSession } from '../../actions/sessions/close.js';
import { spawn as spawnSession } from '../../actions/sessions/spawn.js';
import { search as searchSessions } from '../../actions/sessions/search.js';
import { list as listEvents } from '../../actions/events/list.js';
import { subscribe as subscribeToEvents } from '../../actions/events/subscribe.js';
import { getSessionMessages } from '../../actions/messages/index.js';
import { IndexerService } from '../../services/indexer.js';

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
              return result;
            }

            // Parse and format as readable text
            const parsed = JSON.parse(result);
            const sessions = parsed.sessions || [];

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

            if (parsed.summary) {
              output += `\nSummary:\n`;
              output += `  Active: ${parsed.summary.active}\n`;
              output += `  Waiting for Input: ${parsed.summary.waiting_for_input}\n`;
              output += `  Idle: ${parsed.summary.idle}\n`;
              output += `  Agent Tasks: ${parsed.summary.agentTasks}\n`;
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

            return result;
          } catch (error) {
            throw new Error(
              `Failed to get session: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      'create-session': tool({
        description: 'Create a new OpenCode session',
        args: {
          title: tool.schema.string().optional().describe('Optional title for the session'),
        },
        async execute(args) {
          try {
            const result = await createSession({
              title: args.title,
              client: opencodeClient,
            });

            return result;
          } catch (error) {
            throw new Error(
              `Failed to create session: ${error instanceof Error ? error.message : String(error)}`,
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

            return result;
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

            return result;
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

            return result;
          } catch (error) {
            throw new Error(
              `Failed to list events: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      'subscribe-events': tool({
        description: 'Subscribe to live events from OpenCode sessions',
        args: {
          eventType: tool.schema
            .string()
            .optional()
            .describe('Specific event type to subscribe to'),
          sessionId: tool.schema.string().optional().describe('Filter by session ID'),
        },
        async execute(args) {
          try {
            const result = await subscribeToEvents({
              eventType: args.eventType,
              sessionId: args.sessionId,
              client: opencodeClient,
            });

            return result;
          } catch (error) {
            throw new Error(
              `Failed to subscribe to events: ${error instanceof Error ? error.message : String(error)}`,
            );
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
            throw new Error(
              `Failed to send prompt: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      // Indexer Management Tools
      'start-indexer': tool({
        description: 'Start the OpenCode indexer service',
        args: {
          verbose: tool.schema.boolean().default(false).describe('Enable verbose logging'),
          background: tool.schema.boolean().default(false).describe('Run as background daemon'),
        },
        async execute(args) {
          try {
            const indexer = new IndexerService();

            if (args.background) {
              // For background mode, we'd need to use PM2 or similar
              // For now, return instructions
              return 'Background mode requires PM2. Use: pm2 start dist/cli.js --name "opencode-indexer" -- indexer start';
            }

            await indexer.start();

            return 'Indexer service started successfully. Use Ctrl+C to stop.';
          } catch (error) {
            throw new Error(
              `Failed to start indexer: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      'stop-indexer': tool({
        description: 'Stop the OpenCode indexer service',
        args: {
          force: tool.schema.boolean().default(false).describe('Force stop the indexer'),
        },
        async execute() {
          try {
            const indexer = new IndexerService();
            await indexer.stop();

            return 'Indexer service stopped successfully.';
          } catch (error) {
            throw new Error(
              `Failed to stop indexer: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      'indexer-status': tool({
        description: 'Get the status of the OpenCode indexer service',
        args: {},
        async execute() {
          try {
            // Since IndexerService doesn't have a getStatus method, we'll check if it's running
            // by attempting to read the state file
            const fs = await import('fs/promises');
            const path = await import('path');

            try {
              const stateFile = path.join(process.cwd(), '.indexer-state.json');
              const stateData = await fs.readFile(stateFile, 'utf-8');
              const state = JSON.parse(stateData);

              const status = {
                status: 'stopped',
                lastIndexedSessionId: state.lastIndexedSessionId,
                lastIndexedMessageId: state.lastIndexedMessageId,
                savedAt: state.savedAt ? new Date(state.savedAt).toISOString() : 'unknown',
                note: 'Indexer state file exists but service may not be running',
              };

              return JSON.stringify(status, null, 2);
            } catch (fileError) {
              const status = {
                status: 'not_initialized',
                message: 'No indexer state file found - indexer has not been run',
              };

              return JSON.stringify(status, null, 2);
            }
          } catch (error) {
            throw new Error(
              `Failed to get indexer status: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),
    },

    // Plugin lifecycle hooks
    async event(input) {
      // Handle plugin-level events if needed
      console.log(`[OpenCode Interface Plugin] Event received: ${input.event.type}`);
    },

    // Tool execution hooks for logging and monitoring
    'tool.execute.before': async (input) => {
      console.log(`[OpenCode Interface Plugin] Executing tool: ${input.tool}`);
    },

    'tool.execute.after': async (input) => {
      console.log(`[OpenCode Interface Plugin] Tool completed: ${input.tool}`);
    },
  };
};

export default OpencodeInterfacePlugin;
