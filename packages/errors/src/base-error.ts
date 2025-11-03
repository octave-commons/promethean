// SPDX-License-Identifier: GPL-3.0-only
// Base Error - Base Promethean error implementation

import type {
  PrometheanError,
  ErrorContext,
  ErrorCategory,
  ErrorSeverity,
  ErrorOptions,
  ErrorResponse,
} from './types.js';

/**
 * Create a Promethean error instance
 */
export const createPrometheanError = (
  message: string,
  options: ErrorOptions = {},
  errorType: new (message: string, options?: ErrorOptions) => PrometheanError,
): PrometheanError => {
  const timestamp = new Date().toISOString();
  const code = options.code || generateDefaultCode(errorType.name);
  const category = options.category || 'internal';
  const severity = options.severity || 'medium';
  const requestId = options.context?.requestId;

  const error = {
    name: errorType.name,
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
    Error.captureStackTrace(error as Error, errorType);
  }

  return error;
};

/**
 * Generate default error code from class name
 */
const generateDefaultCode = (className: string): string => {
  const normalizedName = className.replace('Error', '');
  return normalizedName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
};

/**
 * Base error methods that can be applied to any Promethean error
 */
export const errorMethods = {
  /**
   * Convert to standardized error response
   */
  toJSON(this: PrometheanError): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        category: this.category,
        severity: this.severity,
        context: this.context,
        details: this.details,
        stack: this.stack,
        timestamp: this.timestamp,
        requestId: this.requestId,
      },
    };
  },

  /**
   * Create error with context
   */
  withContext(this: PrometheanError, context: ErrorContext): PrometheanError {
    return createPrometheanError(
      this.message,
      {
        code: this.code,
        category: this.category,
        severity: this.severity,
        context: { ...this.context, ...context },
        details: this.details,
      },
      this.constructor as new (message: string, options?: ErrorOptions) => PrometheanError,
    );
  },

  /**
   * Create error with additional details
   */
  withDetails(this: PrometheanError, details: unknown): PrometheanError {
    return createPrometheanError(
      this.message,
      {
        code: this.code,
        category: this.category,
        severity: this.severity,
        context: this.context,
        details,
      },
      this.constructor as new (message: string, options?: ErrorOptions) => PrometheanError,
    );
  },

  /**
   * Create error with different severity
   */
  withSeverity(this: PrometheanError, severity: ErrorSeverity): PrometheanError {
    return createPrometheanError(
      this.message,
      {
        code: this.code,
        category: this.category,
        severity,
        context: this.context,
        details: this.details,
      },
      this.constructor as new (message: string, options?: ErrorOptions) => PrometheanError,
    );
  },

  /**
   * Check if error matches category
   */
  isCategory(this: PrometheanError, category: ErrorCategory): boolean {
    return this.category === category;
  },

  /**
   * Check if error matches severity or higher
   */
  isSeverityAtLeast(this: PrometheanError, minimumSeverity: ErrorSeverity): boolean {
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const currentLevel = severityLevels[this.severity];
    const minimumLevel = severityLevels[minimumSeverity];

    return currentLevel >= minimumLevel;
  },
};
