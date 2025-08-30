/**
 * Web utilities for Promethean Node.js services
 */

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { z } from 'zod';

export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    service: string;
}

export function createHealthCheck(serviceName: string = 'promethean-service') {
    return (): HealthCheckResponse => ({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: serviceName,
    });
}

export async function registerHealthRoute(
    fastify: FastifyInstance,
    options: FastifyPluginOptions & { serviceName?: string },
) {
    const healthCheck = createHealthCheck(options.serviceName);

    fastify.get('/health', async () => {
        return healthCheck();
    });
}

export function createValidationHandler<T extends z.ZodSchema>(schema: T) {
    return (data: unknown): z.infer<T> => {
        return schema.parse(data);
    };
}
