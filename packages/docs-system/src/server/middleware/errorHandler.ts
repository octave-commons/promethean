/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHelper, Logger } from '../../shared/index.js';
import { DocsSystemError } from '../../types/index.js';

const logger = Logger.getInstance();

export function errorHandler(
  error: Error | DocsSystemError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Log the error
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Determine if this is a custom error or a generic error
  const docsError: DocsSystemError = isDocsSystemError(error)
    ? error
    : new DocsSystemError(
        process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
        'INTERNAL_SERVER_ERROR',
        500,
        process.env.NODE_ENV === 'production' ? undefined : { stack: error.stack },
      );

  // Send error response
  const response = ResponseHelper.error(docsError);
  res.status(getStatusCode(docsError.code)).json(response);
}

function isDocsSystemError(error: any): error is DocsSystemError {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
}

function getStatusCode(errorCode: string): number {
  const statusCodes: Record<string, number> = {
    // Authentication & Authorization
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INVALID_TOKEN: 401,
    TOKEN_EXPIRED: 401,

    // Validation
    VALIDATION_ERROR: 400,
    INVALID_INPUT: 400,
    MISSING_REQUIRED_FIELD: 400,

    // Not Found
    NOT_FOUND: 404,
    USER_NOT_FOUND: 404,
    DOCUMENT_NOT_FOUND: 404,
    QUERY_NOT_FOUND: 404,
    JOB_NOT_FOUND: 404,

    // Conflict
    CONFLICT: 409,
    EMAIL_ALREADY_EXISTS: 409,
    USERNAME_ALREADY_EXISTS: 409,
    DUPLICATE_DOCUMENT: 409,

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 429,
    TOO_MANY_REQUESTS: 429,

    // Service Unavailable
    SERVICE_UNAVAILABLE: 503,
    DATABASE_ERROR: 503,
    OLLAMA_UNAVAILABLE: 503,

    // Server Errors
    INTERNAL_SERVER_ERROR: 500,
    UNKNOWN_ERROR: 500,
  };

  return statusCodes[errorCode] || 500;
}

// Async error wrapper for route handlers
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>,
) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
