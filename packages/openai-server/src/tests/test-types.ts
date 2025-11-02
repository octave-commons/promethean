import type { FastifyInstance } from 'fastify';

export interface TestContext {
  server: FastifyInstance;
}
