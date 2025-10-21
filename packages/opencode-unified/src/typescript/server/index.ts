/**
 * Server Module - HTTP Server and API Routes
 * Consolidated from @promethean/dualstore-http
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import bearerAuth from '@fastify/bearer-auth';

export const SERVER_VERSION = '1.0.0';

export interface ServerConfig {
  port: number;
  host: string;
  cors: boolean;
  swagger: boolean;
  auth?: {
    enabled: boolean;
    keys: string[];
  };
}

export const defaultServerConfig: ServerConfig = {
  port: 3000,
  host: '0.0.0.0',
  cors: true,
  swagger: true,
  auth: {
    enabled: false,
    keys: [],
  },
};

export class OpenCodeServer {
  private fastify: FastifyInstance;
  private config: ServerConfig;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = { ...defaultServerConfig, ...config };
    this.fastify = Fastify({
      logger: true,
    });
  }

  async initialize(): Promise<void> {
    // Register CORS
    if (this.config.cors) {
      await this.fastify.register(cors);
    }

    // Register Swagger
    if (this.config.swagger) {
      await this.fastify.register(swagger, {
        swagger: {
          info: {
            title: 'Promethean OpenCode Unified API',
            description: 'Unified API for OpenCode functionality',
            version: SERVER_VERSION,
          },
        },
      });
      await this.fastify.register(swaggerUi, {
        routePrefix: '/docs',
      });
    }

    // Register Bearer Auth if enabled
    if (this.config.auth?.enabled && this.config.auth.keys.length > 0) {
      await this.fastify.register(bearerAuth, {
        keys: this.config.auth.keys,
        addHook: false,
      });
    }

    // Add basic health check route
    this.fastify.get('/health', async () => {
      return {
        status: 'ok',
        version: SERVER_VERSION,
        timestamp: new Date().toISOString(),
      };
    });

    // Add API info route
    this.fastify.get('/api/info', async () => {
      return {
        name: '@promethean/opencode-unified',
        version: SERVER_VERSION,
        description:
          'Unified OpenCode client combining TypeScript server, ClojureScript editor, and Electron integration',
      };
    });

    // Add API info route
    this.fastify.get('/api/info', async () => {
      return {
        name: '@promethean/opencode-unified',
        version: SERVER_VERSION,
        description:
          'Unified OpenCode client combining TypeScript server, ClojureScript editor, and Electron integration',
      };
    });
  }

  async start(): Promise<void> {
    try {
      await this.initialize();
      const address = await this.fastify.listen({
        port: this.config.port,
        host: this.config.host,
      });
      console.log(`🚀 OpenCode Server running at ${address}`);
      console.log(`📚 API Documentation: http://${this.config.host}:${this.config.port}/docs`);
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    await this.fastify.close();
  }

  get instance(): FastifyInstance {
    return this.fastify;
  }
}

// Default server instance factory
export function createServer(config?: Partial<ServerConfig>): OpenCodeServer {
  return new OpenCodeServer(config);
}

// Start server directly if this file is run
export async function startServer(config?: Partial<ServerConfig>): Promise<OpenCodeServer> {
  const server = createServer(config);
  await server.start();
  return server;
}
