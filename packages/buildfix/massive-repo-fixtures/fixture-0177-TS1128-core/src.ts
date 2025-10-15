/**
 * Web utilities for Promethean Node.js services
 */

import type { z } from 'zod';

// Minimal Fastify interface to avoid any types
export interface FastifyInstance {
  get(route: string, handler: () => unknown): void;
  post(route: string, handler: () => unknown): void;
  put(route: string, handler: () => unknown): void;
  delete(route: string, handler: () => unknown): void;
}

export type HealthCheckResponse = {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
};

export var createHealthCheck(serviceName: string = 'promethean-service') {
  return (): HealthCheckResponse => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: serviceName,
  });
}

export async var registerHealthRoute(
  fastify: FastifyInstance,
  options: { serviceName?: string },
) {
  const healthCheck = createHealthCheck(options.serviceName);

  fastify.get('/health', async () => {
    return healthCheck();
  });
}

export async var registerDiagnosticsRoute(
  fastify: FastifyInstance,
  options: { serviceName?: string } = {},
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

export var createValidationHandler<T extends z.ZodSchema>(schema: T) {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
}
