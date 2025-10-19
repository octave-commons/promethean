// SPDX-License-Identifier: GPL-3.0-only
// Input Validation and Sanitization Utilities

import type { SubmitJobOptions, JobType, JobPriority, MessageRole } from '../types/index.js';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Input sanitizer for preventing injection attacks
 */
export class InputSanitizer {
  /**
   * Sanitize string input to prevent injection attacks
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      throw new ValidationError('Input must be a string');
    }

    return (
      input
        .trim()
        // Remove potential command injection characters
        .replace(/[;&|`$(){}[\]'"]/g, '')
        // Limit length to prevent DoS
        .slice(0, 10000)
    );
  }

  /**
   * Sanitize array of strings
   */
  static sanitizeStringArray(input: string[]): string[] {
    if (!Array.isArray(input)) {
      throw new ValidationError('Input must be an array');
    }

    return input
      .filter((item) => typeof item === 'string')
      .map((item) => this.sanitizeString(item))
      .slice(0, 100); // Limit array size
  }

  /**
   * Sanitize object keys and string values
   */
  static sanitizeObject(input: Record<string, unknown>): Record<string, unknown> {
    if (typeof input !== 'object' || input === null) {
      throw new ValidationError('Input must be an object');
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      // Sanitize key
      const sanitizedKey = this.sanitizeString(key);

      // Sanitize value based on type
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[sanitizedKey] = this.sanitizeStringArray(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeObject(value as Record<string, unknown>);
      } else if (typeof value === 'number' && isFinite(value)) {
        sanitized[sanitizedKey] = Math.max(-1000000, Math.min(1000000, value)); // Clamp numbers
      } else if (typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      }
      // Skip null, undefined, and other types
    }

    return sanitized;
  }
}

/**
 * Validator for job-related inputs
 */
export class JobValidator {
  /**
   * Validate job submission options
   */
  static validateSubmitJobOptions(options: SubmitJobOptions): SubmitJobOptions {
    const sanitized: SubmitJobOptions = {
      modelName: this.validateModelName(options.modelName),
      jobType: this.validateJobType(options.jobType),
      priority: this.validatePriority(options.priority),
    };

    // Validate optional fields
    if (options.jobName) {
      sanitized.jobName = InputSanitizer.sanitizeString(options.jobName);
    }

    if (options.prompt) {
      sanitized.prompt = InputSanitizer.sanitizeString(options.prompt);
    }

    if (options.messages) {
      sanitized.messages = this.validateMessages(options.messages);
    }

    if (options.input) {
      sanitized.input = this.validateInput(options.input);
    }

    if (options.options) {
      sanitized.options = this.validateJobOptions(options.options);
    }

    if (options.agentId) {
      sanitized.agentId = this.validateAgentId(options.agentId);
    }

    if (options.sessionId) {
      sanitized.sessionId = this.validateSessionId(options.sessionId);
    }

    return sanitized;
  }

  /**
   * Validate model name
   */
  private static validateModelName(modelName: string): string {
    const sanitized = InputSanitizer.sanitizeString(modelName);

    // Model name should be alphanumeric with hyphens, underscores, and dots
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(sanitized)) {
      throw new ValidationError('Invalid model name format', 'modelName', modelName);
    }

    // Length constraints
    if (sanitized.length < 1 || sanitized.length > 100) {
      throw new ValidationError(
        'Model name must be between 1 and 100 characters',
        'modelName',
        modelName,
      );
    }

    return sanitized;
  }

  /**
   * Validate job type
   */
  private static validateJobType(jobType: JobType): JobType {
    const validTypes: JobType[] = ['generate', 'chat', 'embedding'];

    if (!validTypes.includes(jobType)) {
      throw new ValidationError(`Invalid job type: ${jobType}`, 'jobType', jobType);
    }

    return jobType;
  }

  /**
   * Validate priority
   */
  private static validatePriority(priority: JobPriority): JobPriority {
    const validPriorities: JobPriority[] = ['low', 'medium', 'high', 'urgent'];

    if (!validPriorities.includes(priority)) {
      throw new ValidationError(`Invalid priority: ${priority}`, 'priority', priority);
    }

    return priority;
  }

  /**
   * Validate messages array
   */
  private static validateMessages(
    messages: Array<{ role: string; content: string }>,
  ): Array<{ role: MessageRole; content: string }> {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError('Messages must be a non-empty array', 'messages', messages);
    }

    if (messages.length > 100) {
      throw new ValidationError('Messages array cannot exceed 100 items', 'messages', messages);
    }

    const validRoles: MessageRole[] = ['system', 'user', 'assistant'];

    return messages.map((message, index) => {
      if (typeof message !== 'object' || message === null) {
        throw new ValidationError(
          `Message at index ${index} must be an object`,
          'messages',
          messages,
        );
      }

      if (!validRoles.includes(message.role as MessageRole)) {
        throw new ValidationError(
          `Invalid role at message index ${index}: ${message.role}`,
          'messages',
          messages,
        );
      }

      if (typeof message.content !== 'string' || message.content.trim() === '') {
        throw new ValidationError(
          `Message content at index ${index} must be a non-empty string`,
          'messages',
          messages,
        );
      }

      return {
        role: message.role as MessageRole,
        content: InputSanitizer.sanitizeString(message.content),
      };
    });
  }

  /**
   * Validate input for embedding jobs
   */
  private static validateInput(input: string | string[]): string | string[] {
    if (typeof input === 'string') {
      const sanitized = InputSanitizer.sanitizeString(input);
      if (sanitized.length === 0) {
        throw new ValidationError('Input string cannot be empty', 'input', input);
      }
      return sanitized;
    }

    if (Array.isArray(input)) {
      if (input.length === 0) {
        throw new ValidationError('Input array cannot be empty', 'input', input);
      }

      if (input.length > 100) {
        throw new ValidationError('Input array cannot exceed 100 items', 'input', input);
      }

      return InputSanitizer.sanitizeStringArray(input);
    }

    throw new ValidationError('Input must be a string or array of strings', 'input', input);
  }

  /**
   * Validate job options
   */
  private static validateJobOptions(
    options: SubmitJobOptions['options'],
  ): SubmitJobOptions['options'] {
    if (!options || typeof options !== 'object') {
      return undefined;
    }

    const sanitized: Record<string, unknown> = {};

    // Validate numeric options
    if (options.temperature !== undefined) {
      if (
        typeof options.temperature !== 'number' ||
        options.temperature < 0 ||
        options.temperature > 2
      ) {
        throw new ValidationError(
          'Temperature must be a number between 0 and 2',
          'options.temperature',
          options.temperature,
        );
      }
      sanitized.temperature = Math.round(options.temperature * 100) / 100; // Round to 2 decimal places
    }

    if (options.top_p !== undefined) {
      if (typeof options.top_p !== 'number' || options.top_p < 0 || options.top_p > 1) {
        throw new ValidationError(
          'Top_p must be a number between 0 and 1',
          'options.top_p',
          options.top_p,
        );
      }
      sanitized.top_p = Math.round(options.top_p * 100) / 100;
    }

    if (options.num_ctx !== undefined) {
      if (typeof options.num_ctx !== 'number' || options.num_ctx < 1 || options.num_ctx > 32768) {
        throw new ValidationError(
          'Num_ctx must be a number between 1 and 32768',
          'options.num_ctx',
          options.num_ctx,
        );
      }
      sanitized.num_ctx = Math.floor(options.num_ctx);
    }

    if (options.num_predict !== undefined) {
      if (
        typeof options.num_predict !== 'number' ||
        options.num_predict < 1 ||
        options.num_predict > 32768
      ) {
        throw new ValidationError(
          'Num_predict must be a number between 1 and 32768',
          'options.num_predict',
          options.num_predict,
        );
      }
      sanitized.num_predict = Math.floor(options.num_predict);
    }

    // Validate stop array
    if (options.stop !== undefined) {
      if (!Array.isArray(options.stop) || options.stop.length > 10) {
        throw new ValidationError(
          'Stop must be an array with at most 10 items',
          'options.stop',
          options.stop,
        );
      }

      sanitized.stop = InputSanitizer.sanitizeStringArray(options.stop);
    }

    // Validate format
    if (options.format !== undefined) {
      if (options.format !== 'json' && typeof options.format !== 'object') {
        throw new ValidationError(
          'Format must be "json" or a schema object',
          'options.format',
          options.format,
        );
      }
      sanitized.format = options.format;
    }

    return sanitized as SubmitJobOptions['options'];
  }

  /**
   * Validate agent ID
   */
  private static validateAgentId(agentId: string): string {
    const sanitized = InputSanitizer.sanitizeString(agentId);

    // Agent ID should be a valid UUID or alphanumeric string
    if (
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$|^[a-zA-Z0-9_-]+$/.test(
        sanitized,
      )
    ) {
      throw new ValidationError('Invalid agent ID format', 'agentId', agentId);
    }

    return sanitized;
  }

  /**
   * Validate session ID
   */
  private static validateSessionId(sessionId: string): string {
    const sanitized = InputSanitizer.sanitizeString(sessionId);

    // Session ID should be a valid UUID or alphanumeric string
    if (
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$|^[a-zA-Z0-9_-]+$/.test(
        sanitized,
      )
    ) {
      throw new ValidationError('Invalid session ID format', 'sessionId', sessionId);
    }

    return sanitized;
  }
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const key = this.requests.get(identifier);

    if (!key || now > key.resetTime) {
      // Reset window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (key.count >= this.maxRequests) {
      return false;
    }

    key.count++;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const key = this.requests.get(identifier);

    if (!key || now > key.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - key.count);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    Array.from(this.requests.entries()).forEach(([identifier, key]) => {
      if (now > key.resetTime) {
        this.requests.delete(identifier);
      }
    });
  }
}

// Export default rate limiter instance
export const defaultRateLimiter = new RateLimiter();
