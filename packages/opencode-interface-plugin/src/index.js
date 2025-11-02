// SPDX-License-Identifier: GPL-3.0-only
// OpenCode Interface Plugin
// Provides unified context search and OpenCode functionality as tools within the OpenCode ecosystem
import { tool } from '@opencode-ai/plugin/tool';
import { validate } from './utils/validation.js';
import { initializeStores } from './initializeStores.js';
import { compileContext } from './compileContext.js';
import { searchAcrossStores } from './services/unified-store.js';
// Import existing actions
import { list as listSessions } from './actions/sessions/list.js';
import { get as getSession } from './actions/sessions/get.js';
import { close as closeSession } from './actions/sessions/close.js';
import { spawn as spawnSession } from './actions/sessions/spawn.js';
import { search as searchSessions } from './actions/sessions/search.js';
import { list as listEvents } from './actions/events/list.js';
import { getSessionMessages } from './actions/messages/index.js';
// Import markdown formatters
import { sessionToMarkdown, messageToMarkdown, eventToMarkdown, } from './services/indexer-formatters.js';
/**
 * Format search results as markdown
 */
function formatSearchResults(results) {
    let output = `# Unified Search Results\n\n`;
    output += `**Query:** ${results.query}\n\n`;
    output += `## Summary\n`;
    output += `- **Sessions:** ${results.summary.totalSessions}\n`;
    output += `- **Events:** ${results.summary.totalEvents}\n`;
    output += `- **Messages:** ${results.summary.totalMessages}\n\n`;
    if (results.summary.totalSessions > 0) {
        output += `## Sessions (${results.summary.totalSessions})\n\n`;
        results.sessions.forEach((session) => {
            try {
                output += sessionToMarkdown(session);
            }
            catch (e) {
                output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
            }
        });
    }
    if (results.summary.totalEvents > 0) {
        output += `## Events (${results.summary.totalEvents})\n\n`;
        results.events.forEach((event) => {
            try {
                output += eventToMarkdown(event);
            }
            catch (e) {
                output += `**Event:** ${JSON.stringify(event).substring(0, 200)}...\n\n`;
            }
        });
    }
    if (results.summary.totalMessages > 0) {
        output += `## Messages (${results.summary.totalMessages})\n\n`;
        results.messages.forEach((message) => {
            try {
                output += messageToMarkdown(message);
            }
            catch (e) {
                output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
            }
        });
    }
    return output;
}
/**
 * Format sessions list as markdown
 */
function formatSessionsList(result) {
    if ('error' in result) {
        return `Error listing sessions: ${result.error}`;
    }
    const sessions = result.sessions || [];
    let output = `# Active Sessions (${sessions.length})\n\n`;
    sessions.forEach((session) => {
        try {
            output += sessionToMarkdown(session);
        }
        catch (e) {
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
function formatEventsList(events) {
    let output = `# Events (${events.length})\n\n`;
    events.forEach((event) => {
        try {
            output += eventToMarkdown(event);
        }
        catch (e) {
            output += `**Event:** ${JSON.stringify(event).substring(0, 200)}...\n\n`;
        }
    });
    return output;
}
/**
 * Format messages list as markdown
 */
function formatMessagesList(messages, sessionId) {
    let output = `# Messages for Session ${sessionId} (${messages.length})\n\n`;
    messages.forEach((message) => {
        try {
            output += messageToMarkdown(message);
        }
        catch (e) {
            output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
        }
    });
    return output;
}
/**
 * OpenCode Interface Plugin - Provides OpenCode functionality as tools
 */
export const OpencodeInterfacePlugin = async (pluginContext) => {
    // Initialize stores on plugin load
    await initializeStores();
    // Use OpenCode client from plugin context
    const opencodeClient = pluginContext.client;
    return {
        tool: {
            // Unified Context Search Tools
            'compile-context': tool({
                description: 'Compile and search the complete context store (sessions, events, messages) with unified access',
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
                        // Validate inputs
                        const query = validate.searchQuery(args.query);
                        const limit = validate.limit(args.limit, 50);
                        const sessionId = validate.optionalString(args.sessionId, 'sessionId');
                        const contextResult = await compileContext({
                            texts: query ? [query] : [],
                            limit,
                        });
                        // Format messages as markdown
                        let output = `# Compiled Context\n\n`;
                        output += `**Query:** ${query || 'No query'}\n`;
                        output += `**Session Filter:** ${sessionId || 'All sessions'}\n\n`;
                        if (Array.isArray(contextResult)) {
                            output += `## Messages (${contextResult.length})\n\n`;
                            contextResult.slice(0, limit).forEach((msg) => {
                                try {
                                    output += messageToMarkdown(msg);
                                }
                                catch (e) {
                                    output += `**Message:** ${JSON.stringify(msg).substring(0, 200)}...\n\n`;
                                }
                            });
                        }
                        return output;
                    }
                    catch (error) {
                        throw new Error(`Failed to compile context: ${error instanceof Error ? error.message : String(error)}`);
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
                        // Validate inputs
                        const query = validate.string(args.query, 'query');
                        const limit = validate.limit(args.limit, 20);
                        const sessionId = validate.optionalString(args.sessionId, 'sessionId');
                        // Use unified store search to eliminate N+1 patterns
                        const searchResults = await searchAcrossStores(query, {
                            limit,
                            sessionId,
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
                    }
                    catch (error) {
                        throw new Error(`Failed to search context: ${error instanceof Error ? error.message : String(error)}`);
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
                        // Validate inputs
                        const limit = validate.limit(args.limit, 20);
                        const offset = validate.number(args.offset || 0, 'offset');
                        const result = await listSessions({
                            limit,
                            offset,
                        });
                        // Use session list formatter for now (will be replaced with serializer)
                        return formatSessionsList(result);
                    }
                    catch (error) {
                        throw new Error(`Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`);
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
                        // Validate inputs
                        const sessionId = validate.sessionId(args.sessionId);
                        const limit = args.limit !== undefined ? validate.number(args.limit, 'limit') : undefined;
                        const offset = args.offset !== undefined ? validate.number(args.offset, 'offset') : undefined;
                        const result = await getSession({
                            sessionId,
                            limit,
                            offset,
                        });
                        let output = `# Session Details\n\n`;
                        if ('error' in result) {
                            output += `Error: ${result.error}\n`;
                        }
                        else if (result.session && typeof result.session === 'object') {
                            try {
                                output += sessionToMarkdown(result.session);
                            }
                            catch (formatError) {
                                output += `**Session Data:**\n`;
                                output += `\`\`\`json\n${JSON.stringify(result.session, null, 2)}\n\`\`\`\n`;
                            }
                            if (result.messages && Array.isArray(result.messages)) {
                                output += `\n## Messages (${result.messages.length})\n\n`;
                                result.messages.forEach((message) => {
                                    try {
                                        output += messageToMarkdown(message);
                                    }
                                    catch (e) {
                                        output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
                                    }
                                });
                            }
                        }
                        else {
                            output += `**Session Data:**\n`;
                            output += `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n`;
                        }
                        return output;
                    }
                    catch (error) {
                        throw new Error(`Failed to get session: ${error instanceof Error ? error.message : String(error)}`);
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
                        }
                        else {
                            output += `**Status:** Successfully closed\n`;
                            if (result.message) {
                                output += `**Message:** ${result.message}\n`;
                            }
                        }
                        return output;
                    }
                    catch (error) {
                        throw new Error(`Failed to close session: ${error instanceof Error ? error.message : String(error)}`);
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
                                }
                                else {
                                    output += result;
                                }
                            }
                            catch (parseError) {
                                output += result;
                            }
                        }
                        else if (result && typeof result === 'object' && 'error' in result) {
                            output += `**Error:** ${result.error}\n`;
                        }
                        else if (result && typeof result === 'object' && 'id' in result) {
                            output += `**Session ID:** ${result.id || 'Unknown'}\n`;
                            output += `**Title:** ${args.title || 'Untitled'}\n`;
                            output += `**Status:** Successfully created\n`;
                            output += `**Initial Message:** ${args.message}\n`;
                        }
                        else {
                            output += `**Status:** Session creation initiated\n`;
                            output += `**Title:** ${args.title || 'Untitled'}\n`;
                            output += `**Initial Message:** ${args.message}\n`;
                        }
                        return output;
                    }
                    catch (error) {
                        throw new Error(`Failed to spawn session: ${error instanceof Error ? error.message : String(error)}`);
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
                            result.forEach((session) => {
                                try {
                                    output += sessionToMarkdown(session);
                                }
                                catch (e) {
                                    output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
                                }
                            });
                        }
                        else if (result && typeof result === 'object' && 'results' in result) {
                            output += `**Results:** ${result.results.length} sessions found\n\n`;
                            result.results.forEach((session) => {
                                try {
                                    output += sessionToMarkdown(session);
                                }
                                catch (e) {
                                    output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
                                }
                            });
                        }
                        else if (result && typeof result === 'object' && 'error' in result) {
                            output += `**Error:** ${result.error}\n`;
                        }
                        else {
                            output += `**No results found**\n`;
                        }
                        return output;
                    }
                    catch (error) {
                        throw new Error(`Failed to search sessions: ${error instanceof Error ? error.message : String(error)}`);
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
                    }
                    catch (error) {
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
                    }
                    catch (error) {
                        throw new Error(`Failed to list messages: ${error instanceof Error ? error.message : String(error)}`);
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
                            }
                            catch (e) {
                                output += `**Message Data:**\n`;
                                output += `\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n`;
                            }
                        }
                        else {
                            output += `No message data found.\n`;
                        }
                        return output;
                    }
                    catch (error) {
                        throw new Error(`Failed to get message: ${error instanceof Error ? error.message : String(error)}`);
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
                                        type: 'text',
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
                        }
                        else {
                            output += `Message sent successfully.\n`;
                        }
                        return output;
                    }
                    catch (error) {
                        return `Failed to send prompt: ${error instanceof Error ? error.message : String(error)}`;
                    }
                },
            }),
        },
    };
};
export default OpencodeInterfacePlugin;
//# sourceMappingURL=index.js.map