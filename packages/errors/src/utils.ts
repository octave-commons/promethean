// SPDX-License-Identifier: GPL-3.0-only
// Error Utilities - Utility functions for error handling

import type { PrometheanError, ErrorContext, ErrorCategory, ErrorSeverity } from './types.js';

/**
 * Check if an error is a Promethean error
 */
export const isPrometheanError = (error: unknown): error is PrometheanError => {
  return typeof error === 'object' && error !== null && 'code' in error && 'category' in error;
};

/**
 * Convert any error to Promethean error
 */
export const toPrometheanError = (error: unknown, context?: ErrorContext): PrometheanError => {
  if (isPrometheanError(error)) {
    return context ? error.withContext(context) : error;
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
  const context: ErrorContext = {};

  if (source?.headers) {
    context.correlationId = source.headers['x-correlation-id'] || source.headers['correlation-id'];
    context.requestId = source.headers['x-request-id'] || source.headers['request-id'];
    context.userId = source.headers['x-user-id'] || source.headers['user-id'];
    context.sessionId = source.headers['x-session-id'] || source.headers['session-id'];
    context.traceId = source.headers['x-trace-id'] || source.headers['trace-id'];
  }

  if (source?.user?.id) {
    context.userId = context.userId || source.user.id;
  }

  if (source?.session?.id) {
    context.sessionId = context.sessionId || source.session.id;
  }

  if (source?.request?.id) {
    context.requestId = context.requestId || source.request.id;
  }

  return context;
};

/**
 * Create error response from any error
 */
export const createErrorResponse = (error: unknown, context?: ErrorContext) => {
  const prometheanError = toPrometheanError(error, context);
  return prometheanError.toJSON();
};

/**
 * Get HTTP status code from error category
 */
export const getHttpStatusFromError = (error: PrometheanError): number => {
  switch (error.category) {
    case 'validation':
      return 400;
    case 'authentication':
      return 401;
    case 'authorization':
      return 403;
    case 'not-found':
      return 404;
    case 'conflict':
      return 409;
    case 'rate-limit':
      return 429;
    case 'timeout':
      return 408;
    case 'external':
    case 'network':
      return 502;
    case 'database':
    case 'system':
    case 'configuration':
    case 'internal':
      return 500;
    case 'business':
      return 422;
    default:
      return 500;
  }
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
