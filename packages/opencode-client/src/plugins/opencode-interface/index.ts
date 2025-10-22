// SPDX-License-Identifier: GPL-3.0-only
// OpenCode Interface Plugin
// Provides unified context search and OpenCode functionality as tools within the OpenCode ecosystem

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';

import { createOpencodeClient } from '@opencode-ai/sdk';
import { initializeStores } from '../../initializeStores.js';
import { compileContext } from '../../compileContext.js';

// Import existing actions
import { list as listSessions } from '../../actions/sessions/list.js';
import { get as getSession } from '../../actions/sessions/get.js';
import { close as closeSession } from '../../actions/sessions/close.js';
import { spawn as spawnSession } from '../../actions/sessions/spawn.js';
import { search as searchSessions } from '../../actions/sessions/search.js';
import { list as listEvents } from '../../actions/events/list.js';
import { getSessionMessages } from '../../actions/messages/index.js';

// Import markdown formatters
import {
  sessionToMarkdown,
  messageToMarkdown,
  eventToMarkdown,
} from '../../services/indexer-formatters.js';

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
 * Format messages list as markdown
 */
function formatMessagesList(messages: any[], sessionId: string): string {
  let output = `# Messages for Session ${sessionId} (${messages.length})\n\n`;

  messages.forEach((message: any) => {
    try {
      output += messageToMarkdown(message);
    } catch (e) {
      output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
    }
  });

  return output;
}

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
      // Unified Context Search Tools
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
            const context = await compileContext({
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
            // Search sessions
            const sessionResults = await searchSessions({
              query: args.query,
              k: args.limit,
              sessionId: args.sessionId,
            });

            // Search events
            const eventResults = await listEvents({
              query: args.query,
              k: args.limit,
              sessionId: args.sessionId,
            });

            // Get messages for sessions and search within them
            let messageResults: any[] = [];
            const sessionArray = Array.isArray(sessionResults)
              ? sessionResults
              : sessionResults && typeof sessionResults === 'object' && 'results' in sessionResults
                ? sessionResults.results
                : [];

            if (sessionArray.length > 0) {
              for (const session of sessionArray.slice(0, 5)) {
                // Limit to avoid too many API calls
                try {
                  const messages = await getSessionMessages(opencodeClient, session.id);
                  const matchingMessages = messages
                    .filter((msg) => {
                      const textParts =
                        msg.parts?.filter((part: any) => part.type === 'text') || [];
                      const text = textParts
                        .map((part: any) => part.text)
                        .join(' ')
                        .toLowerCase();
                      return text.includes(args.query.toLowerCase());
                    })
                    .slice(0, args.limit);

                  messageResults.push(...matchingMessages);
                } catch (error) {
                  // Continue if message fetch fails
                  console.warn(`Failed to fetch messages for session ${session.id}:`, error);
                }
              }
            }

            const results = {
              sessions: sessionArray,
              events: eventResults || [],
              messages: messageResults,
              query: args.query,
              summary: {
                totalSessions: sessionArray.length,
                totalEvents: Array.isArray(eventResults) ? eventResults.length : 0,
                totalMessages: messageResults.length,
              },
            };

            return formatSearchResults(results);
          } catch (error) {
            throw new Error(
              `Failed to search context: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        },
      }),

      // Session Management Tools
      'list-sessions': tool({
        description: 'List all active OpenCode sessions with pagination and filtering',
        args: {
          limit: tool.schema.number().default(20).describe('Number of sessions to return'),
          offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
        },
        async execute(args) {
          try {
            const result = await listSessions({
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
                    output += messageToMarkdown(message);
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
            const result = await spawnSession({
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
              } catch (parseError) {
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

            return formatEventsList(result || []);
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
        },
        async execute(args) {
          try {
            const messages = await getSessionMessages(opencodeClient, args.sessionId);
            const limitedMessages = messages.slice(-args.limit);

            return formatMessagesList(limitedMessages, args.sessionId);
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

            let output = `# Message Details\n\n`;
            output += `**Session ID:** ${args.sessionId}\n`;
            output += `**Message ID:** ${args.messageId}\n\n`;

            if (result.data) {
              try {
                output += messageToMarkdown(result.data);
              } catch (e) {
                output += `**Message Data:**\n`;
                output += `\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n`;
              }
            } else {
              output += `No message data found.\n`;
            }

            return output;
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

            let output = `# Message Sent\n\n`;
            output += `**Session ID:** ${args.sessionId}\n`;
            output += `**Content:** ${args.content}\n\n`;

            if (result.data) {
              output += `**Response:**\n`;
              output += `\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n`;
            } else {
              output += `Message sent successfully.\n`;
            }

            return output;
          } catch (error) {
            return `Failed to send prompt: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),
    },
  };
};

export default OpencodeInterfacePlugin;
