/**
 * @license
 * Copyright (C) 2025 Promethean Technologies. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createServerConfig, getLogLevel } from './utils/config.js';
import { DualStoreManager } from '@promethean/persistence';

// Real dual store integration
let sessionMessagesStore: DualStoreManager<'text', 'timestamp'> | null = null;
let agentTasksStore: DualStoreManager<'text', 'timestamp'> | null = null;
let opencodeEventsStore: DualStoreManager<'text', 'timestamp'> | null = null;

// Initialize stores on startup
async function initializeStores() {
  try {
    console.log('🔄 Initializing dual store managers...');
    console.log('AGENT_NAME:', process.env.AGENT_NAME || 'duck');

    sessionMessagesStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
    console.log('Session messages store created:', !!sessionMessagesStore);
    console.log('Session messages collection name:', sessionMessagesStore.name);

    agentTasksStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');
    opencodeEventsStore = await DualStoreManager.create('opencode_events', 'text', 'timestamp');
    console.log('Session messages store created:', !!sessionMessagesStore);
    console.log('Session messages collection name:', sessionMessagesStore?.name);

    agentTasksStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');
    console.log('Agent tasks store created:', !!agentTasksStore);

    opencodeEventsStore = await DualStoreManager.create('opencode_events', 'text', 'timestamp');
    console.log('Opencode events store created:', !!opencodeEventsStore);

    console.log('✅ Dual store managers initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize dual store managers:', error);
    // Continue with null stores - endpoints will return empty data
  }
}

/**
 * Extract task type from content or raw event
 */
function extractTaskType(entry: any): string | null {
  // Try to extract from raw event first
  if (entry.rawEvent) {
    try {
      const rawEvent = JSON.parse(entry.rawEvent);
      console.log('DEBUG: rawEvent.type =', rawEvent.type);
      if (rawEvent.type) {
        const result = rawEvent.type.replace(/\./g, '_');
        console.log('DEBUG: returning event type =', result);
        return result;
      }
    } catch (e) {
      console.error('Error parsing rawEvent:', e);
      // Fall back to content parsing
    }
  }

  console.log('DEBUG: no rawEvent.type found, entry.rawEvent =', entry.rawEvent);

  // Try to extract from content
  if (entry.content) {
    const match = entry.content.match(/TASK:\s*([^:\n]+)/i);
    return match?.[1]?.trim() || null;
  }

  return null;
}

/**
 * Extract agent ID from content or raw event
 */
function extractAgentId(entry: any): string | null {
  // Try to extract from raw event first
  if (entry.rawEvent) {
    try {
      const rawEvent = JSON.parse(entry.rawEvent);
      if (rawEvent.properties?.info?.agentId) {
        return rawEvent.properties.info.agentId;
      }
      if (rawEvent.properties?.sessionID) {
        return rawEvent.properties.sessionID;
      }
    } catch (e) {
      // Fall back to content parsing
    }
  }

  // Try to extract from content
  if (entry.content) {
    const match = entry.content.match(/agent[:\s]+([a-zA-Z0-9_-]+)/i);
    return match?.[1]?.trim() || null;
  }

  return null;
}

/**
 * Extract source from event entry
 */
function extractSource(entry: any): string {
  // Try to extract from raw event
  if (entry.rawEvent) {
    try {
      const rawEvent = JSON.parse(entry.rawEvent);
      if (rawEvent.properties?.info?.version) {
        return 'opencode';
      }
      if (rawEvent.properties?.part?.name) {
        return rawEvent.properties.part.name;
      }
    } catch (e) {
      // Fall back
    }
  }

  return entry.source || entry.agentId || 'opencode';
}

/**
 * Extract severity from event entry
 */
function extractSeverity(entry: any): string {
  if ((entry as any).severity) return (entry as any).severity;

  const content = (entry as any).content || '';
  if (content.toLowerCase().includes('error') || content.toLowerCase().includes('failed')) {
    return 'error';
  }
  if (content.toLowerCase().includes('warning') || content.toLowerCase().includes('warn')) {
    return 'warning';
  }
  if (content.toLowerCase().includes('critical') || content.toLowerCase().includes('security')) {
    return 'critical';
  }

  return 'info';
}

// Helper function to format dual store entries for API response
function formatDualStoreEntry(entry: any) {
  const formatted: any = {
    id: entry.id,
    created_at: new Date(entry.timestamp).toISOString(),
    updated_at: new Date(entry.timestamp).toISOString(),
    ...(entry.metadata || {}),
  };

  // Map text field to content for UI compatibility
  if (entry.text) {
    formatted.content = entry.text;
  }

  // Preserve original fields for UI mapping
  if (entry.eventType) formatted.eventType = entry.eventType;
  if (entry.sessionId) formatted.sessionId = entry.sessionId;
  if (entry.userId) formatted.userId = entry.userId;
  if (entry.rawEvent) formatted.rawEvent = entry.rawEvent;

  return formatted;
}

/**
 * Create and configure Fastify server
 */
async function createServer() {
  const config = createServerConfig();

  const server = Fastify({
    logger: {
      level: getLogLevel(),
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register CORS plugin
  await server.register(cors, {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });

  // Initialize stores
  await initializeStores();

  // Health check
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      stores: {
        sessionMessages: !!sessionMessagesStore,
        agentTasks: !!agentTasksStore,
        opencodeEvents: !!opencodeEventsStore,
      },
    };
  });

  // API info
  server.get('/', async () => {
    return {
      name: '@promethean/dualstore-http',
      description: 'HTTP API for Promethean dualstore collections',
      version: process.env.npm_package_version || '1.0.0',
      endpoints: {
        collections: '/api/v1',
        streaming: '/api/v1/stream',
        health: '/health',
      },
    };
  });

  // Session messages
  server.get('/api/v1/session_messages', async () => {
    if (!sessionMessagesStore) {
      return {
        success: true,
        data: [],
        pagination: { total: 0, limit: 50, offset: 0, has_more: false },
      };
    }

    try {
      console.log('Fetching messages from collection:', sessionMessagesStore.name);
      const messages = await sessionMessagesStore.getMostRecent(50);
      console.log('Raw messages count:', messages.length);
      const formattedMessages = messages.map(formatDualStoreEntry);

      return {
        success: true,
        data: formattedMessages,
        pagination: {
          total: formattedMessages.length,
          limit: 50,
          offset: 0,
          has_more: false,
        },
      };
    } catch (error) {
      console.error('Error fetching session messages:', error);
      return {
        success: false,
        error: 'Failed to fetch session messages',
        data: [],
        pagination: { total: 0, limit: 50, offset: 0, has_more: false },
      };
    }
  });

  server.get('/api/v1/session_messages/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!sessionMessagesStore) {
      return reply.status(503).send({
        success: false,
        error: 'Session messages store not available',
      });
    }

    try {
      const message = await sessionMessagesStore.get(id);

      if (!message) {
        return reply.status(404).send({
          success: false,
          error: 'Session message not found',
        });
      }

      return { success: true, data: formatDualStoreEntry(message) };
    } catch (error) {
      console.error('Error fetching session message:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch session message',
      });
    }
  });

  // Agent tasks
  server.get('/api/v1/agent_tasks', async () => {
    if (!agentTasksStore) {
      return {
        success: true,
        data: [],
        pagination: { total: 0, limit: 50, offset: 0, has_more: false },
      };
    }

    try {
      const tasks = await agentTasksStore.getMostRecent(50);
      const formattedTasks = tasks.map((task) => {
        const formatted = formatDualStoreEntry(task);
        return {
          ...formatted,
          task_type: extractTaskType(task) || 'unknown',
          agent_id: extractAgentId(task) || 'unknown',
          progress: (task as any).progress || 0,
          input_data: (task as any).input_data || null,
          output_data: (task as any).output_data || null,
        };
      });

      return {
        success: true,
        data: formattedTasks,
        pagination: {
          total: formattedTasks.length,
          limit: 50,
          offset: 0,
          has_more: false,
        },
      };
    } catch (error) {
      console.error('Error fetching agent tasks:', error);
      return {
        success: false,
        error: 'Failed to fetch agent tasks',
        data: [],
        pagination: { total: 0, limit: 50, offset: 0, has_more: false },
      };
    }
  });

  server.get('/api/v1/agent_tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!agentTasksStore) {
      return reply.status(503).send({
        success: false,
        error: 'Agent tasks store not available',
      });
    }

    try {
      const task = await agentTasksStore.get(id);

      if (!task) {
        return reply.status(404).send({
          success: false,
          error: 'Agent task not found',
        });
      }

      return { success: true, data: formatDualStoreEntry(task) };
    } catch (error) {
      console.error('Error fetching agent task:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch agent task',
      });
    }
  });

  // Opencode events
  server.get('/api/v1/opencode_events', async () => {
    if (!opencodeEventsStore) {
      return {
        success: true,
        data: [],
        pagination: { total: 0, limit: 50, offset: 0, has_more: false },
      };
    }

    try {
      const events = await opencodeEventsStore.getMostRecent(50);
      const formattedEvents = events.map((event) => {
        const formatted = formatDualStoreEntry(event);
        return {
          ...formatted,
          event_type: (formatted as any).eventType?.replace(/\./g, '_') || 'unknown',
          source: extractSource(formatted),
          severity: extractSeverity(formatted),
          event_data: (formatted as any).rawEvent || {},
        };
      });

      return {
        success: true,
        data: formattedEvents,
        pagination: {
          total: formattedEvents.length,
          limit: 50,
          offset: 0,
          has_more: false,
        },
      };
    } catch (error) {
      console.error('Error fetching opencode events:', error);
      return {
        success: false,
        error: 'Failed to fetch opencode events',
        data: [],
        pagination: { total: 0, limit: 50, offset: 0, has_more: false },
      };
    }
  });

  server.get('/api/v1/opencode_events/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!opencodeEventsStore) {
      return reply.status(503).send({
        success: false,
        error: 'Opencode events store not available',
      });
    }

    try {
      const event = await opencodeEventsStore.get(id);

      if (!event) {
        return reply.status(404).send({
          success: false,
          error: 'Opencode event not found',
        });
      }

      return { success: true, data: formatDualStoreEntry(event) };
    } catch (error) {
      console.error('Error fetching opencode event:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch opencode event',
      });
    }
  });

  // SSE endpoints (simplified - just heartbeat for now)
  server.get('/api/v1/stream/session_messages', async (_request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send initial connection event
    reply.raw.write(
      `data: ${JSON.stringify({
        type: 'connection',
        collection: 'session_messages',
        data: { message: 'Connected to session_messages stream' },
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    // Keep connection alive
    const interval = setInterval(() => {
      reply.raw.write(
        `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    }, 30000);

    reply.raw.on('close', () => {
      clearInterval(interval);
    });

    return reply;
  });

  server.get('/api/v1/stream/agent_tasks', async (_request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send initial connection event
    reply.raw.write(
      `data: ${JSON.stringify({
        type: 'connection',
        collection: 'agent_tasks',
        data: { message: 'Connected to agent_tasks stream' },
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    // Keep connection alive
    const interval = setInterval(() => {
      reply.raw.write(
        `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    }, 30000);

    reply.raw.on('close', () => {
      clearInterval(interval);
    });

    return reply;
  });

  server.get('/api/v1/stream/opencode_events', async (_request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send initial connection event
    reply.raw.write(
      `data: ${JSON.stringify({
        type: 'connection',
        collection: 'opencode_events',
        data: { message: 'Connected to opencode_events stream' },
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    // Keep connection alive
    const interval = setInterval(() => {
      reply.raw.write(
        `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    }, 30000);

    reply.raw.on('close', () => {
      clearInterval(interval);
    });

    return reply;
  });

  return server;
}

/**
 * Start server
 */
async function start() {
  try {
    const server = await createServer();
    const config = createServerConfig();

    await server.listen({
      port: config.port,
      host: config.host,
    });

    server.log.info(`🚀 Server listening on http://${config.host}:${config.port}`);
    server.log.info(`📚 API documentation available at http://${config.host}:${config.port}/docs`);
    server.log.info(`🔍 Health check available at http://${config.host}:${config.port}/health`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      server.log.info(`Received ${signal}, shutting down gracefully...`);
      await server.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { createServer, start };
