// SPDX-License-Identifier: GPL-3.0-only
// CLI Tools Plugin for OpenCode
// Exposes the same tools as the opencode-client CLI

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';
import { initializeStores, sessionStore, messageStore } from '../../index.js';
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
import { createOpencodeClient } from '@opencode-ai/sdk';

/**
 * CLI Tools Plugin - Exposes opencode-client CLI functionality as OpenCode tools
 */
export const CliToolsPlugin: Plugin = async ({ client, $ }) => {
  // Initialize stores on plugin load
  await initializeStores();

  return {
    tool: {
      // Session Management Tools
      'sessions-list': tool({
        description: 'List all active OpenCode sessions with pagination and filtering',
        args: {
          limit: tool.schema.number().default(20).describe('Number of sessions to return'),
          offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
          format: tool.schema.enum(['table', 'json']).default('table').describe('Output format'),
        },
        async execute(args, context) {
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
            throw new Error(`Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'sessions-get': tool({
        description: 'Get detailed information about a specific session',
        args: {
          sessionId: tool.schema.string().describe('Session ID to retrieve'),
          includeMessages: tool.schema.boolean().default(false).describe('Include session messages'),
        },
        async execute(args, context) {
          try {
            const result = await getSession({
              sessionId: args.sessionId,
              includeMessages: args.includeMessages,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to get session: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'sessions-create': tool({
        description: 'Create a new OpenCode session',
        args: {
          directory: tool.schema.string().describe('Working directory for the session'),
          title: tool.schema.string().optional().describe('Optional title for the session'),
          agentTask: tool.schema.boolean().default(false).describe('Create as agent task'),
        },
        async execute(args, context) {
          try {
            const result = await createSession({
              directory: args.directory,
              title: args.title,
              agentTask: args.agentTask,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to create session: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'sessions-close': tool({
        description: 'Close an active session',
        args: {
          sessionId: tool.schema.string().describe('Session ID to close'),
        },
        async execute(args, context) {
          try {
            const result = await closeSession({
              sessionId: args.sessionId,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to close session: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'sessions-spawn': tool({
        description: 'Spawn a new session with an agent',
        args: {
          directory: tool.schema.string().describe('Working directory for the session'),
          agent: tool.schema.string().describe('Agent name or type to spawn'),
          prompt: tool.schema.string().describe('Initial prompt for the agent'),
          title: tool.schema.string().optional().describe('Optional title for the session'),
        },
        async execute(args, context) {
          try {
            const result = await spawnSession({
              directory: args.directory,
              agent: args.agent,
              prompt: args.prompt,
              title: args.title,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to spawn session: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'sessions-search': tool({
        description: 'Search for sessions by title, content, or metadata',
        args: {
          query: tool.schema.string().describe('Search query'),
          limit: tool.schema.number().default(20).describe('Maximum number of results'),
          offset: tool.schema.number().default(0).describe('Number of results to skip'),
        },
        async execute(args, context) {
          try {
            const result = await searchSessions({
              query: args.query,
              limit: args.limit,
              offset: args.offset,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to search sessions: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      // Event Management Tools
      'events-list': tool({
        description: 'List recent events (Note: Only live subscription is supported)',
        args: {
          limit: tool.schema.number().default(50).describe('Number of events to return'),
          type: tool.schema.string().optional().describe('Filter by event type'),
        },
        async execute(args, context) {
          try {
            const result = await listEvents({
              limit: args.limit,
              type: args.type,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to list events: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'events-subscribe': tool({
        description: 'Subscribe to live events from OpenCode sessions',
        args: {
          eventTypes: tool.schema.array(tool.schema.string()).optional().describe('Specific event types to subscribe to'),
          timeout: tool.schema.number().default(30000).describe('Subscription timeout in milliseconds'),
        },
        async execute(args, context) {
          try {
            const result = await subscribeToEvents({
              eventTypes: args.eventTypes,
              timeout: args.timeout,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to subscribe to events: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      // Message Management Tools
      'messages-list': tool({
        description: 'List messages for a specific session',
        args: {
          sessionId: tool.schema.string().describe('Session ID'),
          limit: tool.schema.number().default(10).describe('Number of messages to return'),
          format: tool.schema.enum(['table', 'json']).default('table').describe('Output format'),
        },
        async execute(args, context) {
          try {
            const result = await listMessages({
              sessionId: args.sessionId,
              limit: args.limit,
              format: args.format,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to list messages: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'messages-get': tool({
        description: 'Get a specific message from a session',
        args: {
          sessionId: tool.schema.string().describe('Session ID'),
          messageId: tool.schema.string().describe('Message ID'),
        },
        async execute(args, context) {
          try {
            const result = await getMessage({
              sessionId: args.sessionId,
              messageId: args.messageId,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to get message: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'messages-send': tool({
        description: 'Send a message to a session',
        args: {
          sessionId: tool.schema.string().describe('Session ID'),
          content: tool.schema.string().describe('Message content'),
          role: tool.schema.enum(['user', 'assistant', 'system']).default('user').describe('Message role'),
        },
        async execute(args, context) {
          try {
            const result = await sendMessage({
              sessionId: args.sessionId,
              content: args.content,
              role: args.role,
            });
            
            return result;
          } catch (error) {
            throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      // Indexer Management Tools
      'indexer-start': tool({
        description: 'Start the OpenCode indexer service',
        args: {
          verbose: tool.schema.boolean().default(false).describe('Enable verbose logging'),
          background: tool.schema.boolean().default(false).describe('Run as background daemon'),
        },
        async execute(args, context) {
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
            throw new Error(`Failed to start indexer: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'indexer-stop': tool({
        description: 'Stop the OpenCode indexer service',
        args: {
          force: tool.schema.boolean().default(false).describe('Force stop the indexer'),
        },
        async execute(args, context) {
          try {
            const indexer = new IndexerService();
            await indexer.stop();
            
            return 'Indexer service stopped successfully.';
          } catch (error) {
            throw new Error(`Failed to stop indexer: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      'indexer-status': tool({
        description: 'Get the status of the OpenCode indexer service',
        args: {},
        async execute(args, context) {
          try {
            const indexer = new IndexerService();
            const status = await indexer.getStatus();
            
            return JSON.stringify(status, null, 2);
          } catch (error) {
            throw new Error(`Failed to get indexer status: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),
    },

    // Plugin lifecycle hooks
    async event(input) {
      // Handle plugin-level events if needed
      console.log(`[CLI Tools Plugin] Event received: ${input.event.type}`);
    },

    // Tool execution hooks for logging and monitoring
    'tool.execute.before': async (input, output) {
      console.log(`[CLI Tools Plugin] Executing tool: ${input.tool}`);
    },

    'tool.execute.after': async (input, output) => {
      console.log(`[CLI Tools Plugin] Tool completed: ${input.tool}`);
    },
  };
};

export default CliToolsPlugin;