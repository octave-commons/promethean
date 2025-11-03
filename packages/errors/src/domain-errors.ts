// SPDX-License-Identifier: GPL-3.0-only
// Domain Errors - Domain-specific error classes for Promethean

import type { ErrorOptions, PrometheanError } from './types.js';
import { errorMethods } from './base-error.js';

/**
 * Create a domain error with proper typing
 */
const createDomainError = (
  message: string,
  options: ErrorOptions,
  name: string,
  category: string,
  code: string,
  severity: string = 'medium',
): PrometheanError => {
  const timestamp = new Date().toISOString();
  const requestId = options.context?.requestId;

  const error = {
    name,
    message,
    code,
    category,
    severity,
    context: options.context,
    details: options.details,
    timestamp,
    requestId,
    stack: new Error().stack,
  } as PrometheanError;

  // Set cause if provided
  if (options.cause) {
    (error as unknown as { cause?: Error }).cause = options.cause;
  }

  // Maintains proper stack trace for where our error was thrown (only available on V8)
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error as Error, createDomainError);
  }

  return { ...error, ...errorMethods };
};

/**
 * Validation Error - Invalid input data
 */
export const ValidationError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'ValidationError', 'validation', 'VALIDATION_ERROR');
};

/**
 * Authentication Error - Failed authentication
 */
export const AuthenticationError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  return createDomainError(message, options, 'AuthenticationError', 'authentication', 'AUTH_ERROR');
};

/**
 * Authorization Error - Insufficient permissions
 */
export const AuthorizationError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  return createDomainError(message, options, 'AuthorizationError', 'authorization', 'AUTHZ_ERROR');
};

/**
 * Network Error - Network-related failures
 */
export const NetworkError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'NetworkError', 'network', 'NETWORK_ERROR');
};

/**
 * Database Error - Database operation failures
 */
export const DatabaseError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'DatabaseError', 'database', 'DATABASE_ERROR');
};

/**
 * External Service Error - Third-party service failures
 */
export const ExternalServiceError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  return createDomainError(message, options, 'ExternalServiceError', 'external', 'EXTERNAL_ERROR');
};

/**
 * Business Logic Error - Business rule violations
 */
export const BusinessError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'BusinessError', 'business', 'BUSINESS_ERROR');
};

/**
 * System Error - System-level failures
 */
export const SystemError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'SystemError', 'system', 'SYSTEM_ERROR');
};

/**
 * Configuration Error - Configuration issues
 */
export const ConfigurationError = (
  message: string,
  options: ErrorOptions = {},
): PrometheanError => {
  return createDomainError(message, options, 'ConfigurationError', 'configuration', 'CONFIG_ERROR');
};

/**
 * Timeout Error - Operation timeouts
 */
export const TimeoutError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'TimeoutError', 'timeout', 'TIMEOUT_ERROR');
};

/**
 * Rate Limit Error - Rate limiting exceeded
 */
export const RateLimitError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'RateLimitError', 'rate-limit', 'RATE_LIMIT_ERROR');
};

/**
 * Not Found Error - Resource not found
 */
export const NotFoundError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'NotFoundError', 'not-found', 'NOT_FOUND_ERROR');
};

/**
 * Conflict Error - Resource conflicts
 */
export const ConflictError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'ConflictError', 'conflict', 'CONFLICT_ERROR');
};

/**
 * Internal Error - Unexpected internal errors
 */
export const InternalError = (message: string, options: ErrorOptions = {}): PrometheanError => {
  return createDomainError(message, options, 'InternalError', 'internal', 'INTERNAL_ERROR', 'high');
};
