import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { IndexerManager } from '@promethean/indexer-core';
import { validatePathArray } from '../validation/index.js';
import type { PathBody } from '../validation/types.js';

/**
 * Generic error messages for secure error handling
 */
const genericErrorMessages: Record<number, string> = {
  400: 'Invalid request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Conflict',
  429: 'Too many requests',
  500: 'Internal server error',
  503: 'Service unavailable',
};

/**
 * Secure error handler that prevents information disclosure
 */
function handleSecureError(reply: FastifyReply, error: Error, statusCode: number = 500): void {
  // Log the full error for debugging purposes
  reply.log.error({ err: error }, 'Indexer operation failed');

  const message = genericErrorMessages[statusCode] || genericErrorMessages[500];
  reply.code(statusCode).send({
    ok: false,
    error: message,
    ...(reply.request.id && { requestId: reply.request.id }),
  });
}

/**
 * Registers GET /indexer/status
 */
function registerStatusRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.get('/indexer/status', async (_req, reply) => {
    reply.send({ ok: true, status: manager.status() });
  });
}

/**
 * Registers POST /indexer/reset
 */
function registerResetRoute(app: FastifyInstance, manager: IndexerManager, rootPath: string): void {
  app.post('/indexer/reset', async (_req, reply) => {
    try {
      if (manager.isBusy()) {
        reply.code(409).send({ ok: false, error: 'Indexer busy' });
        return;
      }
      await manager.resetAndBootstrap(rootPath);
      reply.send({ ok: true });
    } catch (error: unknown) {
      handleSecureError(reply, error as Error);
    }
  });
}

/**
 * Registers POST /indexer/reindex
 */
function registerReindexRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post('/indexer/reindex', async (_req, reply) => {
    try {
      const result = await manager.scheduleReindexAll();
      reply.send(result);
    } catch (error: unknown) {
      handleSecureError(reply, error as Error);
    }
  });
}

/**
 * Registers POST /indexer/files/reindex
 */
function registerReindexFilesRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post(
    '/indexer/files/reindex',
    async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
      const globs = request.body?.path;
      const { valid, error } = validatePathArray(globs);
      if (!valid) {
        reply.code(400).send({ ok: false, error });
        return;
      }
      try {
        const result = await manager.scheduleReindexSubset(globs!);
        reply.send(result);
      } catch (error: unknown) {
        handleSecureError(reply, error as Error);
      }
    },
  );
}

/**
 * Registers POST /indexer/index
 */
function registerIndexRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post(
    '/indexer/index',
    async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
      const pathInput = request.body?.path;
      if (Array.isArray(pathInput)) {
        handleSecureError(reply, new Error('Invalid request'), 400);
        return;
      }

      const { valid, error } = validatePathArray(pathInput);
      if (!valid) {
        handleSecureError(reply, new Error(error), 400);
        return;
      }

      try {
        const result = await manager.scheduleIndexFile(pathInput as string);
        reply.send(result);
      } catch (error: unknown) {
        handleSecureError(reply, error as Error);
      }
    },
  );
}

/**
 * Registers POST /indexer/remove
 */
function registerRemoveRoute(app: FastifyInstance, manager: IndexerManager): void {
  app.post(
    '/indexer/remove',
    async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
      const pathInput = request.body?.path;
      if (Array.isArray(pathInput)) {
        handleSecureError(reply, new Error('Invalid request'), 400);
        return;
      }

      const { valid, error } = validatePathArray(pathInput);
      if (!valid) {
        handleSecureError(reply, new Error(error), 400);
        return;
      }

      try {
        const result = await manager.removeFile(pathInput as string);
        reply.send(result);
      } catch (error: unknown) {
        handleSecureError(reply, error as Error);
      }
    },
  );
}

/**
 * Registers all indexer routes
 */
export function registerIndexerRoutes(
  app: FastifyInstance,
  manager: IndexerManager,
  rootPath: string,
): void {
  registerStatusRoute(app, manager);
  registerResetRoute(app, manager, rootPath);
  registerReindexRoute(app, manager);
  registerReindexFilesRoute(app, manager);
  registerIndexRoute(app, manager);
  registerRemoveRoute(app, manager);
}
