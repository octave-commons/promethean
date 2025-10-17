import Fastify, type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { createLogger, type Level } from '@promethean/utils';
import {
  createIndexerManager,
  setIndexerLogger,
  setIndexerStateStore,
  createLevelCacheStateStore,
} from '@promethean/indexer-core';

import { loadConfig, type ServiceConfig } from './config.js';
import type { IndexerManager } from '@promethean/indexer-core';
import { registerIndexerRoutes } from './routes/indexer.js';
import { registerSearchRoutes } from './routes/search.js';

const LEVELS = new Set<Level>(['debug', 'info', 'warn', 'error']);

export type BuildServerOptions = Partial<ServiceConfig>;

function normalizeLevel(raw: string): Level {
  const value = raw.toLowerCase() as Level;
  return LEVELS.has(value) ? value : 'info';
}

async function setupRateLimiting(app: FastifyInstance, config: ServiceConfig): Promise<void> {
  if (config.enableRateLimit) {
    try {
      await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
    } catch (error) {
      app.log.warn({ err: error }, 'Failed to register rate limit plugin');
    }
  }
}

function setupHealthRoute(app: FastifyInstance): void {
  app.get('/health', async (_req: any, reply: any) => {
    reply.send({ ok: true });
  });
}

function setupDocsRoute(app: FastifyInstance): void {
  app.get('/openapi.json', async (_req: any, reply: any) => {
    reply.send({
      openapi: '3.1.0',
      info: { title: 'Promethean Indexer Service', version: '0.1.0' },
      paths: {
        '/health': { get: { summary: 'Liveness' } },
        '/indexer/status': { get: { summary: 'Indexer status' } },
        '/indexer/reset': { post: { summary: 'Reset indexer' } },
        '/indexer/reindex': { post: { summary: 'Reindex all' } },
        '/indexer/files/reindex': { post: { summary: 'Reindex subset' } },
        '/indexer/index': { post: { summary: 'Index single file' } },
        '/indexer/remove': { post: { summary: 'Remove indexed file' } },
        '/search': { post: { summary: 'Semantic search' } },
      },
    });
  });
}

function setupBootstrap(manager: IndexerManager, app: FastifyInstance, rootPath: string): void {
  void manager.ensureBootstrap(rootPath).catch((error: any) => {
    app.log.error({ err: error }, 'Indexer bootstrap failed');
  });
}

export async function buildServer(
  options: BuildServerOptions = {},
): Promise<{ app: any; manager: any; config: ServiceConfig }> {
  const config = Object.keys(options).length > 0 ? { ...loadConfig(), ...options } : loadConfig();

  const level = normalizeLevel(config.logLevel);
  const logger = createLogger({ level, service: 'indexer-service' });

  setIndexerLogger(logger);
  setIndexerStateStore(createLevelCacheStateStore(config.cachePath));

  const manager = createIndexerManager();

  const app = Fastify({
    logger: { level },
    trustProxy: true,
  });

  await setupRateLimiting(app, config);
  setupHealthRoute(app);
  registerIndexerRoutes(app, manager, config.rootPath);
  registerSearchRoutes(app, config.rootPath);

  if (config.enableDocs) {
    setupDocsRoute(app);
  }

  setupBootstrap(manager, app, config.rootPath);

  return { app, manager, config };
}
