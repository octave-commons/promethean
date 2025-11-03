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
 * Base Promethean Error class
 */
export const BaseError = class extends Error implements PrometheanError {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly context?: ErrorContext;
  readonly details?: unknown;
  readonly timestamp: string;
  readonly requestId?: string;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);

    this.name = this.constructor.name;
    this.code = options.code || this.generateDefaultCode();
    this.category = options.category || 'internal';
    this.severity = options.severity || 'medium';
    this.context = options.context;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    this.requestId = options.context?.requestId;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the cause if provided
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Generate default error code from class name
   */
  private generateDefaultCode(): string {
    const className = this.constructor.name.replace('Error', '');
    return className.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
  }

  /**
   * Convert to standardized error response
   */
  toJSON(): ErrorResponse {
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
  }

  /**
   * Create error with context
   */
  withContext(context: ErrorContext): PrometheanError {
    return new (this.constructor as new (
      message: string,
      options?: ErrorOptions,
    ) => PrometheanError)(this.message, {
      code: this.code,
      category: this.category,
      severity: this.severity,
      context: { ...this.context, ...context },
      details: this.details,
    });
  }

  /**
   * Create error with additional details
   */
  withDetails(details: unknown): PrometheanError {
    return new (this.constructor as new (
      message: string,
      options?: ErrorOptions,
    ) => PrometheanError)(this.message, {
      code: this.code,
      category: this.category,
      severity: this.severity,
      context: this.context,
      details,
    });
  }

  /**
   * Create error with different severity
   */
  withSeverity(severity: ErrorSeverity): PrometheanError {
    return new (this.constructor as new (
      message: string,
      options?: ErrorOptions,
    ) => PrometheanError)(this.message, {
      code: this.code,
      category: this.category,
      severity,
      context: this.context,
      details: this.details,
    });
  }

  /**
   * Check if error matches category
   */
  isCategory(category: ErrorCategory): boolean {
    return this.category === category;
  }

  /**
   * Check if error matches severity or higher
   */
  isSeverityAtLeast(minimumSeverity: ErrorSeverity): boolean {
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const currentLevel = severityLevels[this.severity];
    const minimumLevel = severityLevels[minimumSeverity];

    return currentLevel >= minimumLevel;
  }
};
