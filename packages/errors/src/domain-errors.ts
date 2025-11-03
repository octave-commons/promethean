// SPDX-License-Identifier: GPL-3.0-only
// Domain Errors - Domain-specific error classes for Promethean

import type { ErrorOptions, PrometheanError } from './types.js';
import { createPrometheanError, errorMethods } from './base-error.js';

// Error constructor type for proper typing
type ErrorConstructor = (message: string, options?: ErrorOptions) => PrometheanError;

/**
 * Validation Error - Invalid input data
 */
export const ValidationError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'validation', code: 'VALIDATION_ERROR' },
    ValidationError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Authentication Error - Failed authentication
 */
export const AuthenticationError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'authentication', code: 'AUTH_ERROR' },
    AuthenticationError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Authorization Error - Insufficient permissions
 */
export const AuthorizationError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'authorization', code: 'AUTHZ_ERROR' },
    AuthorizationError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Network Error - Network-related failures
 */
export const NetworkError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'network', code: 'NETWORK_ERROR' },
    NetworkError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Database Error - Database operation failures
 */
export const DatabaseError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'database', code: 'DATABASE_ERROR' },
    DatabaseError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * External Service Error - Third-party service failures
 */
export const ExternalServiceError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'external', code: 'EXTERNAL_ERROR' },
    ExternalServiceError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Business Logic Error - Business rule violations
 */
export const BusinessError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'business', code: 'BUSINESS_ERROR' },
    BusinessError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * System Error - System-level failures
 */
export const SystemError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'system', code: 'SYSTEM_ERROR' },
    SystemError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Configuration Error - Configuration issues
 */
export const ConfigurationError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'configuration', code: 'CONFIG_ERROR' },
    ConfigurationError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Timeout Error - Operation timeouts
 */
export const TimeoutError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'timeout', code: 'TIMEOUT_ERROR' },
    TimeoutError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Rate Limit Error - Rate limiting exceeded
 */
export const RateLimitError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'rate-limit', code: 'RATE_LIMIT_ERROR' },
    RateLimitError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Not Found Error - Resource not found
 */
export const NotFoundError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'not-found', code: 'NOT_FOUND_ERROR' },
    NotFoundError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Conflict Error - Resource conflicts
 */
export const ConflictError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'conflict', code: 'CONFLICT_ERROR' },
    ConflictError,
  );
  return { ...baseError, ...errorMethods };
};

/**
 * Internal Error - Unexpected internal errors
 */
export const InternalError: ErrorConstructor = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  const baseError = createPrometheanError(
    message,
    { ...options, category: 'internal', code: 'INTERNAL_ERROR', severity: 'high' },
    InternalError,
  );
  return { ...baseError, ...errorMethods };
};
