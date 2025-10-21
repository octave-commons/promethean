// SPDX-License-Identifier: GPL-3.0-only
// Input Validation and Sanitization for OpenCode Unified

import { BasicPromptInjectionDetector, PromptInjectionDetectorResult } from '@promethean/security';

/**
 * Validation error types
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Security validation result
 */
export interface SecurityValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  warnings: string[];
  errors: ValidationError[];
  securityScore: number;
  promptInjection?: PromptInjectionDetectorResult;
}

/**
 * Input validation configuration
 */
export interface ValidationConfig {
  enablePromptInjectionDetection: boolean;
  maxPromptLength: number;
  maxMessageCount: number;
  allowedModelNames: string[];
  enableInputSanitization: boolean;
  strictMode: boolean;
}

/**
 * Default validation configuration
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  enablePromptInjectionDetection: true,
  maxPromptLength: 10000,
  maxMessageCount: 50,
  allowedModelNames: [], // Empty means allow all
  enableInputSanitization: true,
  strictMode: false,
};

/**
 * Comprehensive input validator for OpenCode operations
 */
export class InputValidator {
  private promptInjectionDetector: BasicPromptInjectionDetector;
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
    this.promptInjectionDetector = new BasicPromptInjectionDetector();
  }

  /**
   * Validate and sanitize a job submission
   */
  async validateJobSubmission(jobData: any): Promise<SecurityValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let securityScore = 1.0;

    // Validate required fields
    if (!jobData.modelName) {
      errors.push(new ValidationError('Model name is required', 'modelName', 'REQUIRED_FIELD'));
    }

    if (!jobData.jobType) {
      errors.push(new ValidationError('Job type is required', 'jobType', 'REQUIRED_FIELD'));
    }

    if (!jobData.agentId) {
      errors.push(new ValidationError('Agent ID is required', 'agentId', 'REQUIRED_FIELD'));
    }

    if (!jobData.sessionId) {
      errors.push(new ValidationError('Session ID is required', 'sessionId', 'REQUIRED_FIELD'));
    }

    // Validate job type
    const validJobTypes = ['generate', 'chat', 'embedding'];
    if (jobData.jobType && !validJobTypes.includes(jobData.jobType)) {
      errors.push(
        new ValidationError(
          `Invalid job type: ${jobData.jobType}. Must be one of: ${validJobTypes.join(', ')}`,
          'jobType',
          'INVALID_VALUE',
        ),
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (jobData.priority && !validPriorities.includes(jobData.priority)) {
      errors.push(
        new ValidationError(
          `Invalid priority: ${jobData.priority}. Must be one of: ${validPriorities.join(', ')}`,
          'priority',
          'INVALID_VALUE',
        ),
      );
    }

    // Validate model name if restrictions exist
    if (jobData.modelName && this.config.allowedModelNames.length > 0) {
      if (!this.config.allowedModelNames.includes(jobData.modelName)) {
        errors.push(
          new ValidationError(
            `Model ${jobData.modelName} is not allowed`,
            'modelName',
            'FORBIDDEN_MODEL',
          ),
        );
      }
    }

    // Validate prompt content
    let sanitizedPrompt = jobData.prompt;
    let promptInjectionResult: PromptInjectionDetectorResult | undefined;

    if (jobData.prompt) {
      const promptValidation = await this.validatePrompt(jobData.prompt);
      errors.push(...promptValidation.errors);
      warnings.push(...promptValidation.warnings);
      securityScore = Math.min(securityScore, promptValidation.securityScore);
      sanitizedPrompt = promptValidation.sanitizedValue || jobData.prompt;
      promptInjectionResult = promptValidation.promptInjection;
    }

    // Validate messages
    if (jobData.messages) {
      const messagesValidation = await this.validateMessages(jobData.messages);
      errors.push(...messagesValidation.errors);
      warnings.push(...messagesValidation.warnings);
      securityScore = Math.min(securityScore, messagesValidation.securityScore);
    }

    // Validate input
    if (jobData.input) {
      const inputValidation = await this.validateInput(jobData.input);
      errors.push(...inputValidation.errors);
      warnings.push(...inputValidation.warnings);
      securityScore = Math.min(securityScore, inputValidation.securityScore);
    }

    // Validate options
    if (jobData.options) {
      const optionsValidation = this.validateOptions(jobData.options);
      errors.push(...optionsValidation.errors);
      warnings.push(...optionsValidation.warnings);
    }

    const isValid = errors.length === 0;

    const result: SecurityValidationResult = {
      isValid,
      sanitizedValue: sanitizedPrompt,
      warnings,
      errors,
      securityScore,
    };

    if (promptInjectionResult) {
      result.promptInjection = promptInjectionResult;
    }

    return result;
  }

  /**
   * Validate and sanitize prompt content
   */
  async validatePrompt(prompt: string): Promise<SecurityValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let securityScore = 1.0;
    let sanitizedValue = prompt;

    // Length validation
    if (prompt.length > this.config.maxPromptLength) {
      errors.push(
        new ValidationError(
          `Prompt too long: ${prompt.length} characters (max: ${this.config.maxPromptLength})`,
          'prompt',
          'TOO_LONG',
        ),
      );
      securityScore -= 0.3;
    }

    // Empty prompt validation
    if (prompt.trim().length === 0) {
      errors.push(new ValidationError('Prompt cannot be empty', 'prompt', 'EMPTY_VALUE'));
      securityScore -= 0.2;
    }

    // Prompt injection detection
    let promptInjectionResult: PromptInjectionDetectorResult | undefined;
    if (this.config.enablePromptInjectionDetection) {
      promptInjectionResult = await this.promptInjectionDetector.detect(prompt);

      if (promptInjectionResult.detected) {
        warnings.push('Suspicious content detected in prompt');
        securityScore -= 0.4;

        if (promptInjectionResult.blocked) {
          errors.push(
            new ValidationError(
              'Prompt blocked due to security concerns',
              'prompt',
              'SECURITY_BLOCK',
            ),
          );
          securityScore -= 0.6;
        }
      }
    }

    // Input sanitization
    if (this.config.enableInputSanitization) {
      sanitizedValue = this.sanitizeInput(prompt);

      if (sanitizedValue !== prompt) {
        warnings.push('Prompt content was sanitized for security');
        securityScore -= 0.1;
      }
    }

    // Additional security checks
    if (this.containsSuspiciousPatterns(prompt)) {
      warnings.push('Prompt contains potentially suspicious patterns');
      securityScore -= 0.2;
    }

    const result: SecurityValidationResult = {
      isValid: errors.length === 0,
      sanitizedValue,
      warnings,
      errors,
      securityScore: Math.max(0, securityScore),
    };

    if (promptInjectionResult) {
      result.promptInjection = promptInjectionResult;
    }

    return result;
  }

  /**
   * Validate message array
   */
  async validateMessages(messages: any[]): Promise<SecurityValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let securityScore = 1.0;

    if (!Array.isArray(messages)) {
      errors.push(new ValidationError('Messages must be an array', 'messages', 'INVALID_TYPE'));
      return { isValid: false, warnings, errors, securityScore: 0 };
    }

    if (messages.length > this.config.maxMessageCount) {
      errors.push(
        new ValidationError(
          `Too many messages: ${messages.length} (max: ${this.config.maxMessageCount})`,
          'messages',
          'TOO_MANY',
        ),
      );
      securityScore -= 0.3;
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      if (!message.role || !message.content) {
        errors.push(
          new ValidationError(
            `Message ${i} missing required role or content`,
            `messages[${i}]`,
            'MISSING_FIELDS',
          ),
        );
        continue;
      }

      const validRoles = ['user', 'assistant', 'system'];
      if (!validRoles.includes(message.role)) {
        errors.push(
          new ValidationError(
            `Invalid role in message ${i}: ${message.role}`,
            `messages[${i}].role`,
            'INVALID_VALUE',
          ),
        );
      }

      // Validate message content
      const contentValidation = await this.validatePrompt(message.content);
      if (!contentValidation.isValid) {
        errors.push(
          ...contentValidation.errors.map(
            (err) => new ValidationError(err.message, `messages[${i}].content`, err.code),
          ),
        );
      }
      warnings.push(...contentValidation.warnings);
      securityScore = Math.min(securityScore, contentValidation.securityScore);
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      securityScore,
    };
  }

  /**
   * Validate input field
   */
  async validateInput(input: string | string[]): Promise<SecurityValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    let securityScore = 1.0;

    if (typeof input === 'string') {
      if (input.length > this.config.maxPromptLength) {
        errors.push(
          new ValidationError(
            `Input too long: ${input.length} characters (max: ${this.config.maxPromptLength})`,
            'input',
            'TOO_LONG',
          ),
        );
        securityScore -= 0.3;
      }

      if (this.config.enableInputSanitization) {
        const sanitized = this.sanitizeInput(input);
        if (sanitized !== input) {
          warnings.push('Input content was sanitized for security');
          securityScore -= 0.1;
        }
      }
    } else if (Array.isArray(input)) {
      if (input.length > this.config.maxMessageCount) {
        errors.push(
          new ValidationError(
            `Too many input items: ${input.length} (max: ${this.config.maxMessageCount})`,
            'input',
            'TOO_MANY',
          ),
        );
        securityScore -= 0.3;
      }

      for (let i = 0; i < input.length; i++) {
        if (typeof input[i] !== 'string') {
          errors.push(
            new ValidationError(`Input item ${i} must be a string`, `input[${i}]`, 'INVALID_TYPE'),
          );
          continue;
        }

        const item = input[i];
        if (item && item.length > this.config.maxPromptLength) {
          errors.push(
            new ValidationError(
              `Input item ${i} too long: ${item.length} characters (max: ${this.config.maxPromptLength})`,
              `input[${i}]`,
              'TOO_LONG',
            ),
          );
          securityScore -= 0.2;
        }
      }
    } else {
      errors.push(new ValidationError('Input must be string or array', 'input', 'INVALID_TYPE'));
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      securityScore,
    };
  }

  /**
   * Validate job options
   */
  validateOptions(options: any): SecurityValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!options || typeof options !== 'object') {
      return { isValid: true, warnings, errors, securityScore: 1.0 };
    }

    // Validate temperature
    if (options.temperature !== undefined) {
      if (
        typeof options.temperature !== 'number' ||
        options.temperature < 0 ||
        options.temperature > 2
      ) {
        errors.push(
          new ValidationError(
            'Temperature must be a number between 0 and 2',
            'options.temperature',
            'INVALID_RANGE',
          ),
        );
      }
    }

    // Validate top_p
    if (options.top_p !== undefined) {
      if (typeof options.top_p !== 'number' || options.top_p < 0 || options.top_p > 1) {
        errors.push(
          new ValidationError(
            'Top_p must be a number between 0 and 1',
            'options.top_p',
            'INVALID_RANGE',
          ),
        );
      }
    }

    // Validate num_ctx
    if (options.num_ctx !== undefined) {
      if (typeof options.num_ctx !== 'number' || options.num_ctx < 1 || options.num_ctx > 32768) {
        errors.push(
          new ValidationError(
            'Num_ctx must be a number between 1 and 32768',
            'options.num_ctx',
            'INVALID_RANGE',
          ),
        );
      }
    }

    // Validate num_predict
    if (options.num_predict !== undefined) {
      if (
        typeof options.num_predict !== 'number' ||
        options.num_predict < 1 ||
        options.num_predict > 32768
      ) {
        errors.push(
          new ValidationError(
            'Num_predict must be a number between 1 and 32768',
            'options.num_predict',
            'INVALID_RANGE',
          ),
        );
      }
    }

    // Validate stop array
    if (options.stop !== undefined) {
      if (!Array.isArray(options.stop)) {
        errors.push(new ValidationError('Stop must be an array', 'options.stop', 'INVALID_TYPE'));
      } else if (options.stop.length > 10) {
        warnings.push('Stop array has more than 10 items, which may affect performance');
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      securityScore: 1.0,
    };
  }

  /**
   * Sanitize input content
   */
  private sanitizeInput(input: string): string {
    return (
      input
        // Remove potentially dangerous HTML tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        // Remove potential JavaScript event handlers
        .replace(/on\w+\s*=/gi, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Trim
        .trim()
    );
  }

  /**
   * Check for suspicious patterns
   */
  private containsSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /<script/i,
      /<iframe/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Validate agent ID format
   */
  validateAgentId(agentId: string): SecurityValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!agentId || typeof agentId !== 'string') {
      errors.push(
        new ValidationError(
          'Agent ID is required and must be a string',
          'agentId',
          'REQUIRED_FIELD',
        ),
      );
      return { isValid: false, warnings, errors, securityScore: 0 };
    }

    // Check for valid UUID format or similar identifier
    const validIdPattern = /^[a-zA-Z0-9_-]{8,64}$/;
    if (!validIdPattern.test(agentId)) {
      errors.push(
        new ValidationError(
          'Agent ID must be 8-64 characters of letters, numbers, underscores, or hyphens',
          'agentId',
          'INVALID_FORMAT',
        ),
      );
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      securityScore: 1.0,
    };
  }

  /**
   * Validate session ID format
   */
  validateSessionId(sessionId: string): SecurityValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    if (!sessionId || typeof sessionId !== 'string') {
      errors.push(
        new ValidationError(
          'Session ID is required and must be a string',
          'sessionId',
          'REQUIRED_FIELD',
        ),
      );
      return { isValid: false, warnings, errors, securityScore: 0 };
    }

    // Check for valid UUID format or similar identifier
    const validIdPattern = /^[a-zA-Z0-9_-]{8,64}$/;
    if (!validIdPattern.test(sessionId)) {
      errors.push(
        new ValidationError(
          'Session ID must be 8-64 characters of letters, numbers, underscores, or hyphens',
          'sessionId',
          'INVALID_FORMAT',
        ),
      );
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      securityScore: 1.0,
    };
  }
}

/**
 * Convenience function for quick validation
 */
export async function validateJobSubmission(
  jobData: any,
  config?: Partial<ValidationConfig>,
): Promise<SecurityValidationResult> {
  const validator = new InputValidator(config);
  return await validator.validateJobSubmission(jobData);
}

/**
 * Convenience function for quick prompt validation
 */
export async function validatePrompt(
  prompt: string,
  config?: Partial<ValidationConfig>,
): Promise<SecurityValidationResult> {
  const validator = new InputValidator(config);
  return await validator.validatePrompt(prompt);
}
