/**
 * Reconstitute MCP Server
 *
 * An MCP stdio server that provides tools for searching and reconstituting
 * OpenCode sessions using ChromaDB for semantic search and LevelDB for caching.
 */

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './lib/config.js';
import { setLogLevel, getLogLevel, debug, info, warn, error } from './lib/log.js';
import { closeDb, putSessionMeta, getSessionMeta, listSessionMetas, putSession, getSession as getLevelSession } from './lib/level.js';
import { getCached, setCached } from './lib/ttl.js';
import {
  getEmbeddingsWithRetry,
  getChatCompletion,
  listOllamaModels,
  checkOllamaHealth,
} from './lib/ollama.js';
import {
  addDocuments,
  queryDocuments,
  countDocuments,
  getAllDocuments,
  checkChromaHealth,
  resetCollection,
} from './lib/chroma.js';
import {
  listSessions,
  getSession,
  getAllSessionMessages,
  getSessionMessages,
  messagesToText,
  sessionToDocument,
  checkOpenCodeHealth,
} from './lib/opencode.js';
import {
  recordPath,
  isPathRecorded,
  getRecordedPaths,
  getRecentPaths,
  addPathTag,
  removePathTag,
  updatePathDescription,
  getPathStats,
  exportPathsToMarkdown,
} from './lib/paths.js';
import {
  openCodeMessagesToOllama,
  formatMessagesForChat,
  messagesToEmbeddingDocument,
} from './lib/convert.js';
import { getNote, putNote, listNotes, searchNotes, deleteNote, Note } from './lib/level.js';
import { z } from 'zod';

// Initialize MCP server
const server = new Server(
  {
    name: 'reconstitute',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ==================== Tool Definitions ====================

const INDEX_SESSIONS_ARGS = z.object({
  limit_sessions: z.number().optional().default(100),
  force: z.boolean().optional().default(false),
});

const SEARCH_SESSIONS_ARGS = z.object({
  query: z.string(),
  metadata_filter: z.record(z.string()).optional(),
  result_limit: z.number().optional().default(10),
  threshold: z.number().optional().default(0.7),
  context_window: z.number().optional().default(50),
  include_ollama_messages: z.boolean().optional().default(true),
});

const RECONSTITUTE_SESSION_ARGS = z.object({
  session_id: z.string(),
  from_index: z.number().optional().default(0),
  to_index: z.number().optional(),
  format: z.enum(['ollama', 'text', 'json']).optional().default('ollama'),
});

const TAKE_NOTE_ARGS = z.object({
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()).optional(),
});

const LIST_NOTES_ARGS = z.object({
  limit: z.number().optional().default(100),
});

const SEARCH_NOTES_ARGS = z.object({
  query: z.string(),
  limit: z.number().optional().default(20),
});

const RECORD_PATH_ARGS = z.object({
  path: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  context: z.string().optional(),
});

const LIST_RECORDED_PATHS_ARGS = z.object({
  limit: z.number().optional().default(100),
  recent: z.boolean().optional().default(false),
});

const DESCRIBE_FILE_ARGS = z.object({
  path: z.string(),
  text: z.string(),
});

const GET_SESSION_MESSAGES_ARGS = z.object({
  session_id: z.string(),
  limit: z.number().optional().default(100),
  offset: z.number().optional().default(0),
});

const HEALTH_CHECK_ARGS = z.object({
  service: z.enum(['opencode', 'chroma', 'ollama', 'all']).optional().default('all'),
});

// ==================== Tool Implementations ====================

/**
 * Index sessions into ChromaDB for semantic search.
 */
async function indexSessions(args: z.infer<typeof INDEX_SESSIONS_ARGS>) {
  const { limit_sessions, force } = args;

  info('Indexing sessions', { limit: limit_sessions, force });

  try {
    const config = loadConfig();
    const sessionMetas = await listSessionMetas();
    const existingCount = sessionMetas.length;

    if (existingCount >= limit_sessions && !force) {
      info('Sessions already indexed', { count: existingCount });
      return {
        content: [
          {
            type: 'text',
            text: `Already have ${existingCount} sessions indexed. Use force=true to re-index.`,
          },
        ],
      };
    }

    // Get sessions from OpenCode
    const sessions = await listSessions(limit_sessions);
    info(`Found ${sessions.length} sessions from OpenCode`);

    let indexedCount = 0;
    const documents: Array<{ id: string; document: string; metadata: Record<string, string | number> }> = [];

    for (const session of sessions) {
      try {
        const sessionDetail = await getSession(session.session_id);
        if (!sessionDetail) continue;

        const messages = await getAllSessionMessages(session.session_id);
        const text = sessionToDocument(sessionDetail);
        const embeddingText = messagesToEmbeddingDocument(session.session_id, messages);

        documents.push({
          id: session.session_id,
          document: embeddingText,
          metadata: {
            session_id: session.session_id,
            agent_type: session.agent_type ?? 'unknown',
            message_count: session.message_count,
            indexed_at: Date.now(),
            date_first: session.date_range?.first_message ?? '',
            date_last: session.date_range?.last_message ?? '',
          },
        });

        // Store in LevelDB for reconstitute
        await putSession('index', session.session_id, {
          session: sessionDetail,
          messages,
        });

        // Store metadata
        await putSessionMeta(session.session_id, {
          sessionId: session.session_id,
          messageCount: session.message_count,
          indexedAt: Date.now(),
          agentType: session.agent_type,
          dateRange: session.date_range
            ? { first: session.date_range.first_message, last: session.date_range.last_message }
            : undefined,
        });

        indexedCount++;
        debug('Session indexed', { sessionId: session.session_id });
      } catch (err) {
        error('Failed to index session', {
          sessionId: session.session_id,
          error: (err as Error).message,
        });
      }
    }

    // Get embeddings and add to ChromaDB
    if (documents.length > 0) {
      info(`Computing embeddings for ${documents.length} sessions`);

      // Force re-index by deleting existing collection
      if (force) {
        await resetCollection();
      }

      const texts = documents.map((d) => d.document);
      const embeddings = await getEmbeddingsWithRetry(texts);

      await addDocuments(
        documents.map((d, i) => ({
          id: d.id,
          document: d.document,
          embedding: embeddings[i],
          metadata: d.metadata,
        }))
      );

      info('Documents added to ChromaDB', { count: documents.length });
    }

    return {
      content: [
        {
          type: 'text',
          text: `Indexed ${indexedCount} sessions. ChromaDB now has ${await countDocuments()} documents.`,
        },
      ],
    };
  } catch (err) {
    error('Indexing failed', { error: (err as Error).message });
    throw err;
  }
}

/**
 * Search sessions using semantic similarity.
 */
async function searchSessions(args: z.infer<typeof SEARCH_SESSIONS_ARGS>) {
  const {
    query,
    metadata_filter,
    result_limit,
    threshold,
    context_window,
    include_ollama_messages,
  } = args;

  info('Searching sessions', { query: query.substring(0, 100), result_limit });

  try {
    // Get cached search results
    const cacheKey = `search:${query}:${result_limit}`;
    const cached = await getCached<{
      hits: Array<{
        id: string;
        score: number;
        document: string;
        metadata: Record<string, string | number>;
        ollama_messages: unknown[];
      }>;
    }>(cacheKey);

    if (cached) {
      debug('Returning cached search results');
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cached.hits, null, 2),
          },
        ],
      };
    }

    // Query ChromaDB
    const results = await queryDocuments(query, result_limit, metadata_filter);
    const hits: Array<{
      id: string;
      score: number;
      document: string;
      metadata: Record<string, string | number>;
      ollama_messages: unknown[];
    }> = [];

    if (results.ids && results.ids.length > 0) {
      for (let i = 0; i < results.ids.length; i++) {
        const sessionId = results.ids[i];
        const score = results.distances?.[i]?.[0] ?? 1 - (results.distances?.[i]?.[0] ?? 0);

        if (score < threshold) continue;

        // Get session messages for Ollama conversion
        let ollamaMessages: unknown[] = [];
        if (include_ollama_messages) {
          const sessionData = await getLevelSession('index', sessionId);
          if (sessionData && typeof sessionData === 'object' && 'messages' in sessionData) {
            const messages = (sessionData as { messages: unknown[] }).messages;
            ollamaMessages = openCodeMessagesToOllama(messages as import('./lib/opencode.js').OpenCodeMessage[]);
          }
        }

        const document = results.documents?.[i]?.[0] ?? '';
        const metadata = results.metadatas?.[i] ?? {};

        hits.push({
          id: sessionId,
          score,
          document: document.substring(0, 2000), // Truncate for display
          metadata: metadata as Record<string, string | number>,
          ollama_messages: ollamaMessages,
        });
      }
    }

    // Cache results
    await setCached(cacheKey, { hits });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(hits, null, 2),
        },
      ],
    };
  } catch (err) {
    error('Search failed', { error: (err as Error).message });
    throw err;
  }
}

/**
 * Reconstitute a session for Ollama.
 */
async function reconstituteSession(args: z.infer<typeof RECONSTITUTE_SESSION_ARGS>) {
  const { session_id, from_index, to_index, format } = args;

  info('Reconstituting session', { session_id, format });

  try {
    const sessionData = await getLevelSession('index', session_id);
    if (!sessionData) {
      return {
        content: [
          {
            type: 'text',
            text: `Session ${session_id} not found. Please index sessions first.`,
          },
        ],
      };
    }

    const data = sessionData as unknown as { session: import('./lib/opencode.js').OpenCodeSessionDetail; messages: import('./lib/opencode.js').OpenCodeMessage[] };
    let messages = data.messages;

    // Apply range filter
    if (from_index !== undefined || to_index !== undefined) {
      const start = from_index ?? 0;
      const end = to_index ?? messages.length;
      messages = messages.slice(start, end);
    }

    switch (format) {
      case 'ollama': {
        const ollamaMessages = openCodeMessagesToOllama(messages);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ollamaMessages, null, 2),
            },
          ],
        };
      }
      case 'text':
        return {
          content: [
            {
              type: 'text',
              text: messagesToText(messages),
            },
          ],
        };
      case 'json':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      default:
        return {
          content: [
            {
              type: 'text',
              text: 'Invalid format. Use ollama, text, or json.',
            },
          ],
        };
    }
  } catch (err) {
    error('Reconstitution failed', { error: (err as Error).message });
    throw err;
  }
}

/**
 * Take a note.
 */
async function takeNote(args: z.infer<typeof TAKE_NOTE_ARGS>) {
  const { title, body, tags } = args;

  info('Taking note', { title });

  await putNote(title, body, { tags });

  return {
    content: [
      {
        type: 'text',
        text: `Note "${title}" saved.`,
      },
    ],
  };
}

/**
 * List notes.
 */
async function listNotesTool(args: z.infer<typeof LIST_NOTES_ARGS>) {
  const { limit } = args;

  const notes = await listNotes();
  const limited = notes.slice(0, limit);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(limited, null, 2),
      },
    ],
  };
}

/**
 * Search notes.
 */
async function searchNotesTool(args: z.infer<typeof SEARCH_NOTES_ARGS>) {
  const { query, limit } = args;

  const results = await searchNotes(query);
  const limited = results.slice(0, limit);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(limited, null, 2),
      },
    ],
  };
}

/**
 * Record a path.
 */
async function recordPathTool(args: z.infer<typeof RECORD_PATH_ARGS>) {
  const { path, description, tags, context } = args;

  await recordPath(path, { description, tags, context });

  return {
    content: [
      {
        type: 'text',
        text: `Path "${path}" recorded.`,
      },
    ],
  };
}

/**
 * List recorded paths.
 */
async function listRecordedPaths(args: z.infer<typeof LIST_RECORDED_PATHS_ARGS>) {
  const { limit, recent } = args;

  const paths = recent ? await getRecentPaths(limit) : await getRecordedPaths();
  const limited = paths.slice(0, limit);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(limited, null, 2),
      },
    ],
  };
}

/**
 * Get file description.
 */
async function getFileDescription(args: z.infer<typeof DESCRIBE_FILE_ARGS>) {
  const { path, text } = args;

  const isRecorded = await isPathRecorded(path);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ path, text_length: text.length, is_recorded: isRecorded }, null, 2),
      },
    ],
  };
}

/**
 * Describe a file.
 */
async function describeFile(args: z.infer<typeof DESCRIBE_FILE_ARGS>) {
  const { path, text } = args;

  // Simple description based on content analysis
  const lines = text.split('\n').length;
  const chars = text.length;
  const isCode = text.includes('function') || text.includes('const ') || text.includes('import ');

  const description = `File: ${path}\nLines: ${lines}\nCharacters: ${chars}\nType: ${isCode ? 'code' : 'text'}`;

  return {
    content: [
      {
        type: 'text',
        text: description,
      },
    ],
  };
}

/**
 * Get session messages.
 */
async function getSessionMessagesTool(args: z.infer<typeof GET_SESSION_MESSAGES_ARGS>) {
  const { session_id, limit, offset } = args;

  const messages = await getSessionMessages(session_id, limit, offset);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(messages, null, 2),
      },
    ],
  };
}

/**
 * Health check.
 */
async function healthCheck(args: z.infer<typeof HEALTH_CHECK_ARGS>) {
  const { service } = args;

  const results: Record<string, boolean> = {};

  if (service === 'all' || service === 'opencode') {
    results.opencode = await checkOpenCodeHealth();
  }
  if (service === 'all' || service === 'chroma') {
    results.chroma = await checkChromaHealth();
  }
  if (service === 'all' || service === 'ollama') {
    results.ollama = await checkOllamaHealth();
  }

  const allHealthy = Object.values(results).every((v) => v);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ healthy: allHealthy, services: results }, null, 2),
      },
    ],
  };
}

// ==================== Request Handlers ====================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'index_sessions',
        description: 'Index OpenCode sessions into ChromaDB for semantic search',
        inputSchema: {
          type: 'object',
          properties: {
            limit_sessions: {
              type: 'number',
              description: 'Maximum number of sessions to index',
              default: 100,
            },
            force: {
              type: 'boolean',
              description: 'Force re-indexing even if sessions exist',
              default: false,
            },
          },
        },
      },
      {
        name: 'search_sessions',
        description: 'Search indexed sessions using semantic similarity',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            metadata_filter: {
              type: 'object',
              description: 'Filter by metadata (e.g., { agent_type: "build" })',
            },
            result_limit: {
              type: 'number',
              description: 'Maximum results to return',
              default: 10,
            },
            threshold: {
              type: 'number',
              description: 'Similarity threshold (0-1, lower is more similar)',
              default: 0.7,
            },
            context_window: {
              type: 'number',
              description: 'Number of messages to include in context',
              default: 50,
            },
            include_ollama_messages: {
              type: 'boolean',
              description: 'Include Ollama-format messages in results',
              default: true,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'reconstitute_session',
        description: 'Get a session in Ollama tool format for LLM context',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Session ID to reconstitute',
            },
            from_index: {
              type: 'number',
              description: 'Start message index',
            },
            to_index: {
              type: 'number',
              description: 'End message index',
            },
            format: {
              type: 'string',
              enum: ['ollama', 'text', 'json'],
              default: 'ollama',
            },
          },
          required: ['session_id'],
        },
      },
      {
        name: 'take_note',
        description: 'Save a note for later reference',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Note title',
            },
            body: {
              type: 'string',
              description: 'Note content',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for the note',
            },
          },
          required: ['title', 'body'],
        },
      },
      {
        name: 'list_notes',
        description: 'List all saved notes',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              default: 100,
            },
          },
        },
      },
      {
        name: 'search_notes',
        description: 'Search notes by content',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            limit: {
              type: 'number',
              default: 20,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'record_path',
        description: 'Record a file path for tracking',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to record',
            },
            description: {
              type: 'string',
              description: 'Description of the path',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for the path',
            },
            context: {
              type: 'string',
              description: 'Context about how this path was discovered',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'list_recorded_paths',
        description: 'List all recorded paths',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              default: 100,
            },
            recent: {
              type: 'boolean',
              description: 'Only show recent paths',
              default: false,
            },
          },
        },
      },
      {
        name: 'get_file_description',
        description: 'Get description of a file path',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path',
            },
            text: {
              type: 'string',
              description: 'File content or description',
            },
          },
          required: ['path', 'text'],
        },
      },
      {
        name: 'describe_file',
        description: 'Generate a description for a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path',
            },
            text: {
              type: 'string',
              description: 'File content',
            },
          },
          required: ['path', 'text'],
        },
      },
      {
        name: 'get_session_messages',
        description: 'Get messages for a specific session',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'Session ID',
            },
            limit: {
              type: 'number',
              default: 100,
            },
            offset: {
              type: 'number',
              default: 0,
            },
          },
          required: ['session_id'],
        },
      },
      {
        name: 'health_check',
        description: 'Check health of backend services',
        inputSchema: {
          type: 'object',
          properties: {
            service: {
              type: 'string',
              enum: ['opencode', 'chroma', 'ollama', 'all'],
              default: 'all',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: { method: string; params: { name: string; arguments?: Record<string, unknown> } }) => {
  const { name, arguments: args = {} } = request.params;

  debug('Tool called', { name, args: JSON.stringify(args).substring(0, 200) });

  try {
    let result;

    switch (name) {
      case 'index_sessions':
        result = await indexSessions(INDEX_SESSIONS_ARGS.parse(args));
        break;
      case 'search_sessions':
        result = await searchSessions(SEARCH_SESSIONS_ARGS.parse(args));
        break;
      case 'reconstitute_session':
        result = await reconstituteSession(RECONSTITUTE_SESSION_ARGS.parse(args));
        break;
      case 'take_note':
        result = await takeNote(TAKE_NOTE_ARGS.parse(args));
        break;
      case 'list_notes':
        result = await listNotesTool(LIST_NOTES_ARGS.parse(args));
        break;
      case 'search_notes':
        result = await searchNotesTool(SEARCH_NOTES_ARGS.parse(args));
        break;
      case 'record_path':
        result = await recordPathTool(RECORD_PATH_ARGS.parse(args));
        break;
      case 'list_recorded_paths':
        result = await listRecordedPaths(LIST_RECORDED_PATHS_ARGS.parse(args));
        break;
      case 'get_file_description':
        result = await getFileDescription(DESCRIBE_FILE_ARGS.parse(args));
        break;
      case 'describe_file':
        result = await describeFile(DESCRIBE_FILE_ARGS.parse(args));
        break;
      case 'get_session_messages':
        result = await getSessionMessagesTool(GET_SESSION_MESSAGES_ARGS.parse(args));
        break;
      case 'health_check':
        result = await healthCheck(HEALTH_CHECK_ARGS.parse(args));
        break;
      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
        };
    }

    return result;
  } catch (err) {
    error('Tool execution failed', { name, error: (err as Error).message });
    throw err;
  }
});

// ==================== Resource Handlers ====================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'reconstitute://paths',
        name: 'Recorded Paths',
        description: 'All recorded file paths',
        mimeType: 'application/json',
      },
      {
        uri: 'reconstitute://notes',
        name: 'All Notes',
        description: 'All saved notes',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request: { params: { uri: string } }) => {
  const { uri } = request.params;

  if (uri === 'reconstitute://paths') {
    const paths = await getRecordedPaths();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(paths, null, 2),
        },
      ],
    };
  }

  if (uri === 'reconstitute://notes') {
    const notes = await listNotes();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(notes, null, 2),
        },
      ],
    };
  }

  return {
    contents: [
      {
        uri,
        mimeType: 'text/plain',
        text: 'Resource not found',
      },
    ],
  };
});

// ==================== Server Lifecycle ====================

async function main() {
  try {
    // Load config to validate environment
    loadConfig();
    info('Reconstitute MCP Server starting', { logLevel: getLogLevel() });

    // Connect to server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    info('Reconstitute MCP Server ready');

    // Handle shutdown
    process.on('SIGINT', async () => {
      info('Shutting down...');
      await closeDb();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      info('Shutting down...');
      await closeDb();
      process.exit(0);
    });
  } catch (err) {
    error('Failed to start server', { error: (err as Error).message });
    await closeDb();
    process.exit(1);
  }
}

main();
