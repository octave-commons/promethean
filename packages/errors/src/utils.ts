// SPDX-License-Identifier: GPL-3.0-only
// Error Utilities - Utility functions for error handling

import type { PrometheanError, ErrorContext, ErrorCategory } from './types.js';
import { ValidationError } from './domain-errors.js';

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
    if (context && typeof error === 'object' && 'withContext' in error) {
      return (
        error as PrometheanError & { withContext: (ctx: ErrorContext) => PrometheanError }
      ).withContext(context);
    }
    return error;
  }

  if (error instanceof Error) {
    return ValidationError(error.message, {
      context,
      cause: error,
      details: { stack: error.stack },
    });
  }

  const errorMessage = typeof error === 'string' ? error : 'Unknown error occurred';
  return ValidationError(errorMessage, { context });
};

/**
 * Extract error context from error
 */
export const extractErrorContext = (error: unknown): ErrorContext => {
  if (isPrometheanError(error)) {
    return error.context || {};
  }

  if (error instanceof Error) {
    return { metadata: { originalMessage: error.message } };
  }

  return { metadata: { originalValue: String(error) } };
};

/**
 * Get error category from error
 */
export const getErrorCategory = (error: unknown): ErrorCategory => {
  if (isPrometheanError(error)) {
    return error.category;
  }

  if (error instanceof Error) {
    if (error.name.includes('ValidationError')) return 'validation';
    if (error.name.includes('AuthError')) return 'authentication';
    if (error.name.includes('NetworkError')) return 'network';
    if (error.name.includes('DatabaseError')) return 'database';
  }

  return 'internal';
};

/**
 * Map error category to HTTP status code
 */
export const getHttpStatus = (error: PrometheanError): number => {
  const statusMap: Record<ErrorCategory, number> = {
    validation: 400,
    authentication: 401,
    authorization: 403,
    'not-found': 404,
    conflict: 409,
    'rate-limit': 429,
    timeout: 408,
    network: 503,
    external: 502,
    database: 503,
    business: 422,
    configuration: 500,
    system: 500,
    internal: 500,
  };

  return statusMap[error.category] || 500;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: PrometheanError): boolean => {
  const retryableCategories: ErrorCategory[] = ['timeout', 'network', 'external', 'database'];
  return retryableCategories.includes(error.category);
};

/**
 * Get retry delay from error
 */
export const getRetryDelay = (_error: PrometheanError, attempt: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const backoffMultiplier = 2;

  const initialDelay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);

  // Add jitter
  const delay = initialDelay * (0.5 + Math.random() * 0.5);

  return Math.min(delay, maxDelay);
};

/**
 * Create error response from any error
 */
export const createErrorResponse = async (
  error: unknown,
  context?: ErrorContext,
): Promise<unknown> => {
  const prometheanError = await toPrometheanError(error, context);

  if (
    typeof prometheanError === 'object' &&
    prometheanError !== null &&
    'toJSON' in prometheanError
  ) {
    return (prometheanError as { toJSON: () => unknown }).toJSON();
  }

  return prometheanError;
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: unknown): string => {
  if (isPrometheanError(error)) {
    return `[${error.category}] ${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
};
