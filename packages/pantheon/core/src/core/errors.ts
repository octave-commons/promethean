/**
 * Custom error hierarchy for Pantheon adapters
 * Provides structured error handling with proper error types and causes
 */

// Base adapter error
export class AdapterError extends Error {
  public override readonly cause?: Error;
  public readonly adapterType: string;
  public readonly retryable: boolean;

  constructor(message: string, adapterType: string, cause?: Error, retryable: boolean = false) {
    super(message);
    this.name = 'AdapterError';
    this.adapterType = adapterType;
    this.cause = cause;
    this.retryable = retryable;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      adapterType: this.adapterType,
      retryable: this.retryable,
      cause: this.cause?.message,
      stack: this.stack,
    };
  }
}

// LLM Adapter Errors
export class LLMAdapterError extends AdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, 'LLM', cause, retryable);
    this.name = 'LLMAdapterError';
  }
}

export class OpenAIAdapterError extends LLMAdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, cause, retryable);
    this.name = 'OpenAIAdapterError';
  }
}

export class ClaudeAdapterError extends LLMAdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, cause, retryable);
    this.name = 'ClaudeAdapterError';
  }
}

// Tool Adapter Errors
export class ToolAdapterError extends AdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, 'Tool', cause, retryable);
    this.name = 'ToolAdapterError';
  }
}

export class MCPAdapterError extends ToolAdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, cause, retryable);
    this.name = 'MCPAdapterError';
  }
}

// Context Adapter Errors
export class ContextAdapterError extends AdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, 'Context', cause, retryable);
    this.name = 'ContextAdapterError';
  }
}

export class PersistenceAdapterError extends ContextAdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, cause, retryable);
    this.name = 'PersistenceAdapterError';
  }
}

// Message Bus Adapter Errors
export class MessageBusAdapterError extends AdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, 'MessageBus', cause, retryable);
    this.name = 'MessageBusAdapterError';
  }
}

// Scheduler Adapter Errors
export class SchedulerAdapterError extends AdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, 'Scheduler', cause, retryable);
    this.name = 'SchedulerAdapterError';
  }
}

// Actor State Adapter Errors
export class ActorStateAdapterError extends AdapterError {
  constructor(message: string, cause?: Error, retryable: boolean = false) {
    super(message, 'ActorState', cause, retryable);
    this.name = 'ActorStateAdapterError';
  }
}

// Validation Errors
export class ValidationError extends AdapterError {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[], cause?: Error) {
    super(message, 'Validation', cause, false);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

// Configuration Errors
export class ConfigurationError extends AdapterError {
  constructor(message: string, adapterType: string, cause?: Error) {
    super(message, adapterType, cause, false);
    this.name = 'ConfigurationError';
  }
}

// Timeout Errors
export class TimeoutError extends AdapterError {
  public readonly timeout: number;

  constructor(message: string, timeout: number, adapterType: string, cause?: Error) {
    super(message, adapterType, cause, true);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

// Rate Limit Errors
export class RateLimitError extends AdapterError {
  public readonly retryAfter?: number;

  constructor(message: string, adapterType: string, retryAfter?: number, cause?: Error) {
    super(message, adapterType, cause, true);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Utility functions for error handling
export function isAdapterError(error: unknown): error is AdapterError {
  return error instanceof AdapterError;
}

export function isRetryableError(error: unknown): boolean {
  if (isAdapterError(error)) {
    return error.retryable;
  }
  return false;
}

export function createAdapterError(
  message: string,
  adapterType: string,
  cause?: Error,
): AdapterError {
  return new AdapterError(message, adapterType, cause);
}

export function wrapError(error: unknown, adapterType: string, context?: string): AdapterError {
  const message = error instanceof Error ? error.message : String(error);
  const fullMessage = context ? `${context}: ${message}` : message;
  const cause = error instanceof Error ? error : new Error(String(error));

  return new AdapterError(fullMessage, adapterType, cause);
}
