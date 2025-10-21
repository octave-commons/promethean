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
import bearerAuthPlugin from '@fastify/bearer-auth';
import { createServerConfig, getLogLevel } from './utils/config.js';
import {
  collectionRoutes as dualStoreRoutes,
  initializeDataProvider,
} from './routes/collections-dualstore.js';
import SSEService from './services/sse.js';
import { DualStoreManager } from '@promethean/persistence';

// Create SSE service instance
const sseService = new SSEService(5000);

/**
 * Create and configure Fastify server
 */
async function createServer() {
  const config = createServerConfig();

  // Initialize dual stores
  const sessionStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
  const agentTaskStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');
  const eventStore = await DualStoreManager.create('opencode_events', 'text', 'timestamp');

  // Initialize data provider with dual stores
  await initializeDataProvider(sessionStore, agentTaskStore, eventStore);

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

  // Register bearer auth plugin if enabled
  if (config.auth.enabled && config.auth.bearerToken) {
    const keys = new Set([config.auth.bearerToken]);
    await server.register(bearerAuthPlugin, { keys, addHook: true });
  }

  // Register health check route
  server.get(
    '/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              version: { type: 'string' },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      };
    },
  );

  // Register API info route
  server.get(
    '/',
    {
      schema: {
        description: 'API information',
        tags: ['info'],
        response: {
          200: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              version: { type: 'string' },
              endpoints: {
                type: 'object',
                properties: {
                  collections: { type: 'string' },
                  streaming: { type: 'string' },
                  health: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async () => {
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
    },
  );

  // Register collection routes under /api/v1 (using dual store integration)
  await server.register(dualStoreRoutes, { prefix: '/api/v1' });

  // Register SSE streaming routes
  await server.register(
    async function (fastify) {
      // SSE endpoint for session messages
      fastify.get(
        '/stream/session_messages',
        {
          schema: {
            description: 'Stream session messages via SSE',
            tags: ['streaming'],
            querystring: {
              type: 'object',
              properties: {
                session_id: { type: 'string' },
                created_after: { type: 'string' },
              },
            },
          },
        },
        async (request, reply) => {
          reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
          });

          const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sseService.addClient(clientId, reply);

          // Send initial connection event
          sseService.sendEvent(clientId, {
            type: 'connection',
            collection: 'session_messages',
            data: {
              client_id: clientId,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          });

          // Handle client disconnect
          request.raw.on('close', () => {
            sseService.removeClient(clientId);
          });

          return reply;
        },
      );

      // SSE endpoint for agent tasks
      fastify.get(
        '/stream/agent_tasks',
        {
          schema: {
            description: 'Stream agent tasks via SSE',
            tags: ['streaming'],
            querystring: {
              type: 'object',
              properties: {
                session_id: { type: 'string' },
                created_after: { type: 'string' },
              },
            },
          },
        },
        async (request, reply) => {
          reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
          });

          const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sseService.addClient(clientId, reply);

          // Send initial connection event
          sseService.sendEvent(clientId, {
            type: 'connection',
            collection: 'agent_tasks',
            data: {
              client_id: clientId,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          });

          // Handle client disconnect
          request.raw.on('close', () => {
            sseService.removeClient(clientId);
          });

          return reply;
        },
      );

      // SSE endpoint for opencode events
      fastify.get(
        '/stream/opencode_events',
        {
          schema: {
            description: 'Stream opencode events via SSE',
            tags: ['streaming'],
            querystring: {
              type: 'object',
              properties: {
                session_id: { type: 'string' },
                created_after: { type: 'string' },
              },
            },
          },
        },
        async (request, reply) => {
          reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
          });

          const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sseService.addClient(clientId, reply);

          // Send initial connection event
          sseService.sendEvent(clientId, {
            type: 'connection',
            collection: 'opencode_events',
            data: {
              client_id: clientId,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          });

          // Handle client disconnect
          request.raw.on('close', () => {
            sseService.removeClient(clientId);
          });

          // Handle client disconnect
          request.raw.on('close', () => {
            sseService.removeClient(clientId);
          });

          return reply;
        },
      );
    },
    { prefix: '/api/v1' },
  );

  // Add global error handler
  server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);

    reply.status(500).send({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  });

  return server;
}

/**
 * Start the server
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

    // Start SSE service
    sseService.start();

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      server.log.info(`Received ${signal}, shutting down gracefully...`);

      // Stop SSE service
      sseService.stop();

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
