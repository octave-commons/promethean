// SPDX-License-Identifier: GPL-3.0-only
// Promethean Errors - Structured error handling system

// Export all types
export type {
  PrometheanError,
  ErrorContext,
  ErrorOptions,
  ErrorSeverity,
  ErrorCategory,
  ErrorResponse,
} from './types.js';

// Export base error functionality
export { createPrometheanError, errorMethods } from './base-error.js';

// Export all domain errors
export {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  DatabaseError,
  ExternalServiceError,
  BusinessError,
  SystemError,
  ConfigurationError,
  TimeoutError,
  RateLimitError,
  NotFoundError,
  ConflictError,
  InternalError,
} from './domain-errors.js';

// Export utilities
export {
  isPrometheanError,
  toPrometheanError,
  extractErrorContext,
  getErrorCategory,
  getHttpStatus,
  isRetryableError,
  getRetryDelay,
  createErrorResponse,
  formatErrorForLogging,
} from './utils.js';
