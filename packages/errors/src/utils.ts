// SPDX-License-Identifier: GPL-3.0-only
// Error Utilities - Utility functions for error handling

import type { PrometheanError, ErrorContext, ErrorCategory } from './types.js';

/**
 * Check if an error is a Promethean error
 */
export const isPrometheanError = (error: unknown): error is PrometheanError => {
  return typeof error === 'object' && error !== null && 'code' in error && 'category' in error;
};

/**
 * Convert any error to Promethean error
 */
export const toPrometheanError = async (
  error: unknown,
  context?: ErrorContext,
): Promise<PrometheanError> => {
  if (isPrometheanError(error)) {
    return context ? (error as any).withContext(context) : error;
  }

  if (error instanceof Error) {
    const { ValidationError } = await import('./domain-errors.js');
    return ValidationError(error.message, {
      context,
      details: { originalError: error.name, stack: error.stack },
    });
  }

  const { ValidationError } = await import('./domain-errors.js');
  return ValidationError(String(error), { context });
};

/**
 * Extract error context from various sources
 */
export const extractErrorContext = (source?: {
  headers?: Record<string, string>;
  user?: { id?: string };
  session?: { id?: string };
  request?: { id?: string };
}): ErrorContext => {
  const headerContext = source?.headers
    ? {
        correlationId: source.headers['x-correlation-id'] || source.headers['correlation-id'],
        requestId: source.headers['x-request-id'] || source.headers['request-id'],
        userId: source.headers['x-user-id'] || source.headers['user-id'],
        sessionId: source.headers['x-session-id'] || source.headers['session-id'],
        traceId: source.headers['x-trace-id'] || source.headers['trace-id'],
      }
    : {};

  const userContext = source?.user?.id ? { userId: source.user.id } : {};
  const sessionContext = source?.session?.id ? { sessionId: source.session.id } : {};
  const requestContext = source?.request?.id ? { requestId: source.request.id } : {};

  return {
    ...headerContext,
    ...userContext,
    ...sessionContext,
    ...requestContext,
  };
};

/**
 * Create error response from any error
 */
export const createErrorResponse = async (error: unknown, context?: ErrorContext) => {
  const prometheanError = await toPrometheanError(error, context);
  return (prometheanError as any).toJSON();
};

/**
 * Get HTTP status code from error category
 */
export const getHttpStatusFromError = (error: PrometheanError): number => {
  const statusMap: Record<ErrorCategory, number> = {
    validation: 400,
    authentication: 401,
    authorization: 403,
    'not-found': 404,
    conflict: 409,
    'rate-limit': 429,
    timeout: 408,
    external: 502,
    network: 502,
    database: 500,
    system: 500,
    configuration: 500,
    internal: 500,
    business: 422,
  };

  return statusMap[error.category] || 500;
};

/**
 * Check if error should be retried
 */
export const isRetryableError = (error: PrometheanError): boolean => {
  const retryableCategories: ErrorCategory[] = ['timeout', 'network', 'external', 'database'];
  return retryableCategories.includes(error.category);
};

/**
 * Get retry delay from error
 */
export const getRetryDelay = (error: PrometheanError, attempt: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const backoffMultiplier = 2;

  let delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);

  // Add jitter
  delay = delay * (0.5 + Math.random() * 0.5);

  return Math.min(delay, maxDelay);
};
