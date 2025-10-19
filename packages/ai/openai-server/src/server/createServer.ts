import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
// Security plugins will be loaded dynamically to avoid import issues
import Fastify from 'fastify';
import type { FastifyInstance, FastifyReply, FastifyServerOptions } from 'fastify';

import { createDefaultChatCompletionHandler } from '../openai/defaultHandler.js';
import type {
  ChatCompletionHandler,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from '../openai/types.js';
import { createTaskQueue } from '../queue/taskQueue.js';
import type { TaskQueue } from '../queue/taskQueue.js';
import type { DeepReadonly } from '../types/deepReadonly.js';

import { AuthMiddleware } from '../auth/authMiddleware.js';

import { SecurityHeadersService } from '../security/securityHeaders.js';
import { ContentSanitizer } from '../security/contentSanitizer.js';
import { getValidatedSecurityConfig } from '../security/config.js';

import { registerChatCompletionRoute } from './chatCompletionRoute.js';
import { registerQueueRoutes } from './queueRoutes.js';
import type { FastifyApp, FastifyHealthApp, FastifyStaticApp } from './fastifyTypes.js';

export type OpenAIServerOptions = {
  readonly concurrency?: number;
  readonly recentLimit?: number;
  readonly handler?: ChatCompletionHandler;
  readonly fastify?: FastifyServerOptions;
  readonly security?: {
    readonly enabled?: boolean;
    readonly requireAuth?: boolean;
    readonly allowedRoles?: readonly string[];
    readonly allowedPermissions?: readonly string[];
  };
};

export type OpenAIServer = DeepReadonly<{
  app: FastifyInstance;
  queue: TaskQueue<ChatCompletionRequest, ChatCompletionResponse>;
}>;

type PackageDirectories = {
  readonly distDir: string;
  readonly staticDir: string;
  readonly frontendDir: string;
};

const resolvePackageDirectories = (): PackageDirectories => {
  const currentDir = dirname(fileURLToPath(new URL('.', import.meta.url)));
  const distDir = resolve(currentDir, '..');
  const staticDir = resolve(distDir, '../static');
  const frontendDir = resolve(distDir, 'frontend');
  return { distDir, staticDir, frontendDir };
};

const registerDocumentation = (app: FastifyApp): void => {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Promethean OpenAI Compatible API',
        description: 'Implements a queue-backed subset of the OpenAI chat completions API.',
        version: '0.0.0',
      },
      servers: [{ url: '/' }],
      components: {},
    },
  });

  app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  app.after(() => {
    app.get('/openapi.json', async () => app.swagger());
  });
};

type StaticReply = Readonly<Pick<FastifyReply, 'type' | 'sendFile'>>;
type HealthQueue = {
  readonly snapshot: TaskQueue<ChatCompletionRequest, ChatCompletionResponse>['snapshot'];
};

const registerStaticAssets = (app: FastifyStaticApp, directories: PackageDirectories): void => {
  app.register(fastifyStatic, {
    root: directories.staticDir,
    prefix: '/static/',
  });

  const frontendRoot = existsSync(directories.frontendDir)
    ? directories.frontendDir
    : directories.staticDir;

  app.register(fastifyStatic, {
    root: frontendRoot,
    prefix: '/frontend/',
    decorateReply: false,
  });

  app.get('/', async (_request, reply: StaticReply) => {
    void reply.type('text/html');
    return reply.sendFile('index.html');
  });
};

const registerHealthRoute = (app: FastifyHealthApp, queue: HealthQueue): void => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            required: ['status', 'queue'],
            properties: {
              status: { type: 'string' },
              queue: {
                type: 'object',
                required: ['pending', 'processing'],
                properties: {
                  pending: { type: 'integer', minimum: 0 },
                  processing: { type: 'integer', minimum: 0 },
                },
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
    async () => {
      const snapshot = queue.snapshot();
      return {
        status: 'ok',
        queue: {
          pending: snapshot.pending.length,
          processing: snapshot.processing.length,
        },
      };
    },
  );
};

const buildQueue = (
  handler: ChatCompletionHandler,
  options: Pick<OpenAIServerOptions, 'concurrency' | 'recentLimit'>,
): TaskQueue<ChatCompletionRequest, ChatCompletionResponse> =>
  createTaskQueue<ChatCompletionRequest, ChatCompletionResponse>(
    async (task) =>
      handler({
        metadata: { id: task.id, enqueuedAt: task.enqueuedAt },
        request: task.input,
      }),
    {
      ...(typeof options.concurrency === 'number' ? { concurrency: options.concurrency } : {}),
      ...(typeof options.recentLimit === 'number' ? { recentLimit: options.recentLimit } : {}),
    },
  );

export const createOpenAICompliantServer = (options: OpenAIServerOptions = {}): OpenAIServer => {
  const handler = options.handler ?? createDefaultChatCompletionHandler();
  const queue = buildQueue(handler, options);
  const app = Fastify({ logger: false, ...(options.fastify ?? {}) });
  const directories = resolvePackageDirectories();

  // Initialize security if enabled
  const securityEnabled = options.security?.enabled !== false;
  let authMiddleware: AuthMiddleware | undefined;

  let securityHeadersService: SecurityHeadersService | undefined;

  if (securityEnabled) {
    try {
      const securityConfig = getValidatedSecurityConfig();

      // Initialize security services
      authMiddleware = new AuthMiddleware(securityConfig.auth);

      securityHeadersService = new SecurityHeadersService(securityConfig.headers);

      // Register security middleware
      app.register(require('@fastify/cors'), {
        origin: securityConfig.cors.origin,
        credentials: securityConfig.cors.credentials,
      });

      app.register(require('@fastify/helmet'), {
        contentSecurityPolicy: securityConfig.headers.contentSecurityPolicy,
      });

      app.register(require('@fastify/rate-limit'), {
        global: securityConfig.rateLimit.global,
        skipSuccessfulRequests: securityConfig.rateLimit.skipSuccessfulRequests,
        skipFailedRequests: securityConfig.rateLimit.skipFailedRequests,
      });

      // Add custom security middleware
      app.addHook('preHandler', securityHeadersService.createSecurityHeadersMiddleware());
      app.addHook('preHandler', ContentSanitizer.createSanitizationMiddleware());

      // Add authentication middleware for protected routes
      if (options.security?.requireAuth !== false) {
        app.addHook(
          'preHandler',
          authMiddleware.createAuthMiddleware({
            required: true,
            permissions: options.security?.allowedPermissions,
            roles: options.security?.allowedRoles,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to initialize security:', error);
      // Continue without security if configuration is invalid
    }
  }

  registerStaticAssets(app, directories);
  registerDocumentation(app);
  app.after(() => {
    registerQueueRoutes(app, queue);
    registerChatCompletionRoute(app, queue);
    registerHealthRoute(app, queue);
  });

  return {
    app,
    queue,
  } as OpenAIServer;
};
