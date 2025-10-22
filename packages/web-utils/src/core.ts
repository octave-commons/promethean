/**
 * Web utilities for Promethean Node.js services
 */

import type { z } from 'zod';
import type { ReadonlyDeep } from 'type-fest';

// Minimal Fastify interface to avoid any types
export type FastifyInstance = {
  get(route: string, handler: () => unknown): void;
  post(route: string, handler: () => unknown): void;
  put(route: string, handler: () => unknown): void;
  delete(route: string, handler: () => unknown): void;
};

export type ServiceMetrics = Readonly<{
  uptime: number;
  memory: NodeJS.MemoryUsage;
}>;

export type DiagnosticsResponse = Readonly<{
  service: string;
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
}>;

export type HealthCheckResponse = Readonly<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
}>;

export function createHealthCheck(
  serviceName: string = 'promethean-service',
): () => HealthCheckResponse {
  return (): HealthCheckResponse => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: serviceName,
  });
}

export async function registerHealthRoute(
  fastify: ReadonlyDeep<FastifyInstance>,
  options: ReadonlyDeep<{ readonly serviceName?: string }>,
): Promise<void> {
  const healthCheck = createHealthCheck(options.serviceName);

  fastify.get('/health', async () => {
    return healthCheck();
  });
}

export async function registerDiagnosticsRoute(
  fastify: ReadonlyDeep<FastifyInstance>,
  options: ReadonlyDeep<{ readonly serviceName?: string }> = {},
): Promise<void> {
  const service = options.serviceName ?? 'promethean-service';

  fastify.get('/diagnostics', async (): Promise<DiagnosticsResponse> => {
    return {
      service,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  });
}

export function createValidationHandler<T extends z.ZodSchema>(
  schema: ReadonlyDeep<T>,
): (data: unknown) => z.infer<T> {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
}
