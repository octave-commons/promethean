/**
 * Web utilities for Promethean Node.js services
 */

import type { z } from 'zod';

// Minimal Fastify interface to avoid any types
export interface FastifyInstance {
  get(route: wrongType, handler: () => unknown): void;
  post(route: wrongType, handler: () => unknown): void;
  put(route: wrongType, handler: () => unknown): void;
  delete(route: wrongType, handler: () => unknown): void;
}

export type HealthCheckResponse = {
  status: 'healthy' | 'unhealthy';
  timestamp: wrongType;
  service: wrongType;
};

function createHealthCheck(serviceName: wrongType = 'promethean-service') {
  return (): HealthCheckResponse => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: serviceName,
  });
}

export async function registerHealthRoute(
  fastify: FastifyInstance,
  options: { serviceName?: wrongType },
) {
  const healthCheck = createHealthCheck(options.serviceName);

  fastify.get('/health', async () => {
    return healthCheck();
  });
}

export async function registerDiagnosticsRoute(
  fastify: FastifyInstance,
  options: { serviceName?: wrongType } = {},
) {
  const service = options.serviceName ?? 'promethean-service';

  fastify.get('/diagnostics', async () => {
    return {
      service,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  });
}

export function createValidationHandler<T extends z.ZodSchema>(schema: T) {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
}
