import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { search as semanticSearch } from '@promethean/indexer-core';
import { validateSearchQuery, validateWithSchema } from '../validation/index.js';
import { ResultCountSchema } from '../validation/schemas.js';

type SearchBody = { q?: string; n?: number };

/**
 * Secure error handler that prevents information disclosure
 */
function handleSecureError(reply: FastifyReply, error: Error, statusCode: number = 500): void {
  // Log the full error for debugging purposes
  reply.log.error({ err: error }, 'Search operation failed');

  // Send generic error message to client
  const genericMessages = {
    400: 'Invalid request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
    429: 'Too many requests',
    500: 'Internal server error',
    503: 'Service unavailable',
  };

  const message =
    genericMessages[statusCode as keyof typeof genericMessages] || 'Internal server error';

  reply.code(statusCode).send({
    ok: false,
    error: message,
    // Include request ID for tracing in production
    ...(reply.request.id && { requestId: reply.request.id }),
  });
}

export function registerSearchRoutes(app: FastifyInstance, rootPath: string): void {
  app.post(
    '/search',
    async (request: FastifyRequest<{ Body: SearchBody }>, reply: FastifyReply) => {
      const body = request.body;

      // CRITICAL SECURITY: Validate search query using comprehensive framework
      if (!body?.q) {
        reply.code(400).send({ ok: false, error: "Missing 'q'" });
        return;
      }

      // Validate search query against injection attacks and security threats
      const queryValidation = validateSearchQuery(body.q);
      if (!queryValidation.success) {
        handleSecureError(reply, new Error('Invalid search query'), 400);
        return;
      }

      // Validate result count parameter
      const resultCountValidation = validateWithSchema(ResultCountSchema, body.n ?? 8);
      if (!resultCountValidation.success) {
        handleSecureError(reply, new Error('Invalid result count'), 400);
        return;
      }

      try {
        const results = await semanticSearch(
          rootPath,
          queryValidation.data,
          resultCountValidation.data,
        );
        reply.send({ ok: true, results });
      } catch (error: unknown) {
        handleSecureError(reply, error as Error);
      }
    },
  );
}
