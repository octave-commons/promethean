import Fastify, { type FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { createLogger, type Level } from '@promethean/utils';
import {
  createIndexerManager,
  setIndexerLogger,
  setIndexerStateStore,
  createLevelCacheStateStore,
} from '@promethean/indexer-core';

import { loadConfig, type ServiceConfig } from './config.js';

import { registerIndexerRoutes } from './routes/indexer.js';
import { registerSearchRoutes } from './routes/search.js';

const LEVELS = new Set<Level>(['debug', 'info', 'warn', 'error']);

export type BuildServerOptions = Partial<ServiceConfig>;

function normalizeLevel(raw: string): Level {
  const value = raw.toLowerCase() as Level;
  return LEVELS.has(value) ? value : 'info';
}

function setupRateLimiting(app: FastifyInstance, config: ServiceConfig): void {
  if (config.enableRateLimit) {
    try {
      app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
    } catch (error) {
      app.log.warn({ err: error }, 'Failed to register rate limit plugin');
    }
  }
}

export async function buildServer(options: BuildServerOptions = {}): Promise<FastifyInstance> {
  const config = await loadConfig(options);
  const logger = createLogger('indexer-service', normalizeLevel(config.logLevel));

  setIndexerLogger(logger);
  const stateStore = createLevelCacheStateStore(config.cachePath);
  setIndexerStateStore(stateStore);

  const indexerManager = createIndexerManager();

  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  setupRateLimiting(app, config);

  app.get('/health', async (_req, reply) => {
    reply.send({ ok: true });
  });

  registerIndexerRoutes(app, indexerManager, config.rootPath);
  registerSearchRoutes(app, config.rootPath);

  return app;
}
