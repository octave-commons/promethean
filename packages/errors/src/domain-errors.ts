// SPDX-License-Identifier: GPL-3.0-only
// Domain Errors - Domain-specific error classes for Promethean

import type { ErrorOptions, PrometheanError } from './types.js';
import { createPrometheanError, errorMethods } from './base-error.js';

/**
 * Validation Error - Invalid input data
 */
export const ValidationError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'validation', code: 'VALIDATION_ERROR' },
    ValidationError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Authentication Error - Failed authentication
 */
export const AuthenticationError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'authentication', code: 'AUTH_ERROR' },
    AuthenticationError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Authorization Error - Insufficient permissions
 */
export const AuthorizationError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'authorization', code: 'AUTHZ_ERROR' },
    AuthorizationError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Network Error - Network-related failures
 */
export const NetworkError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'network', code: 'NETWORK_ERROR' },
    NetworkError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Database Error - Database operation failures
 */
export const DatabaseError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'database', code: 'DATABASE_ERROR' },
    DatabaseError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * External Service Error - Third-party service failures
 */
export const ExternalServiceError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'external', code: 'EXTERNAL_ERROR' },
    ExternalServiceError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Business Logic Error - Business rule violations
 */
export const BusinessError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'business', code: 'BUSINESS_ERROR' },
    BusinessError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * System Error - System-level failures
 */
export const SystemError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'system', code: 'SYSTEM_ERROR' },
    SystemError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Configuration Error - Configuration issues
 */
export const ConfigurationError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'configuration', code: 'CONFIG_ERROR' },
    ConfigurationError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Timeout Error - Operation timeouts
 */
export const TimeoutError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'timeout', code: 'TIMEOUT_ERROR' },
    TimeoutError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Rate Limit Error - Rate limiting exceeded
 */
export const RateLimitError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'rate-limit', code: 'RATE_LIMIT_ERROR' },
    RateLimitError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Not Found Error - Resource not found
 */
export const NotFoundError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'not-found', code: 'NOT_FOUND_ERROR' },
    NotFoundError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Conflict Error - Resource conflicts
 */
export const ConflictError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'conflict', code: 'CONFLICT_ERROR' },
    ConflictError as any,
  );
  return Object.assign(error, errorMethods);
};

/**
 * Internal Error - Unexpected internal errors
 */
export const InternalError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  const error = createPrometheanError(
    message,
    { ...options, category: 'internal', code: 'INTERNAL_ERROR', severity: 'high' },
    InternalError as any,
  );
  return Object.assign(error, errorMethods);
};
