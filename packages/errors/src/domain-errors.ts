// SPDX-License-Identifier: GPL-3.0-only
// Domain Errors - Domain-specific error classes for Promethean

import type { ErrorOptions } from './types.js';
import { createPrometheanError, errorMethods } from './base-error.js';

/**
 * Validation Error - Invalid input data
 */
export const ValidationError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'validation', code: 'VALIDATION_ERROR' },
    ValidationError,
  );

/**
 * Authentication Error - Failed authentication
 */
export const AuthenticationError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'authentication', code: 'AUTH_ERROR' },
    AuthenticationError,
  );

/**
 * Authorization Error - Insufficient permissions
 */
export const AuthorizationError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'authorization', code: 'AUTHZ_ERROR' },
    AuthorizationError,
  );

/**
 * Network Error - Network-related failures
 */
export const NetworkError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'network', code: 'NETWORK_ERROR' },
    NetworkError,
  );

/**
 * Database Error - Database operation failures
 */
export const DatabaseError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'database', code: 'DATABASE_ERROR' },
    DatabaseError,
  );

/**
 * External Service Error - Third-party service failures
 */
export const ExternalServiceError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'external', code: 'EXTERNAL_ERROR' },
    ExternalServiceError,
  );

/**
 * Business Logic Error - Business rule violations
 */
export const BusinessError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'business', code: 'BUSINESS_ERROR' },
    BusinessError,
  );

/**
 * System Error - System-level failures
 */
export const SystemError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'system', code: 'SYSTEM_ERROR' },
    SystemError,
  );

/**
 * Configuration Error - Configuration issues
 */
export const ConfigurationError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'configuration', code: 'CONFIG_ERROR' },
    ConfigurationError,
  );

/**
 * Timeout Error - Operation timeouts
 */
export const TimeoutError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'timeout', code: 'TIMEOUT_ERROR' },
    TimeoutError,
  );

/**
 * Rate Limit Error - Rate limiting exceeded
 */
export const RateLimitError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'rate-limit', code: 'RATE_LIMIT_ERROR' },
    RateLimitError,
  );

/**
 * Not Found Error - Resource not found
 */
export const NotFoundError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'not-found', code: 'NOT_FOUND_ERROR' },
    NotFoundError,
  );

/**
 * Conflict Error - Resource conflicts
 */
export const ConflictError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'conflict', code: 'CONFLICT_ERROR' },
    ConflictError,
  );

/**
 * Internal Error - Unexpected internal errors
 */
export const InternalError = (message: string, options: ErrorOptions = {}) =>
  createPrometheanError(
    message,
    { ...options, category: 'internal', code: 'INTERNAL_ERROR', severity: 'high' },
    InternalError,
  );

// Apply methods to all error types
const applyMethods = (errorConstructor: any) => {
  errorConstructor.prototype.toJSON = errorMethods.toJSON;
  errorConstructor.prototype.withContext = errorMethods.withContext;
  errorConstructor.prototype.withDetails = errorMethods.withDetails;
  errorConstructor.prototype.withSeverity = errorMethods.withSeverity;
  errorConstructor.prototype.isCategory = errorMethods.isCategory;
  errorConstructor.prototype.isSeverityAtLeast = errorMethods.isSeverityAtLeast;
};

// Apply methods to all error constructors
[
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
].forEach(applyMethods);
