/**
 * Validation middleware for indexer-service
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PathValidationResult } from './types.js';

export function createValidationMiddleware(validator: (data: unknown) => PathValidationResult) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = validator(request.body);
    if (!result.valid) {
      reply.code(400).send({
        ok: false,
        error: result.securityIssues?.join(', ') || 'Invalid request',
      });
      return;
    }
  };
}
