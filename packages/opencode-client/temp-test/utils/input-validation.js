// SPDX-License-Identifier: GPL-3.0-only
// Input Validation and Sanitization Utilities
/**
 * Validation error class
 */
export class ValidationError extends Error {
    field;
    value;
    constructor(message, field, value) {
        super(message);
        this.field = field;
        this.value = value;
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
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            throw new ValidationError('Input must be a string');
        }
        return (input
            .trim()
            // Remove potential command injection characters
            .replace(/[;&|`$(){}[\]'"]/g, '')
            // Limit length to prevent DoS
            .slice(0, 10000));
    }
    /**
     * Sanitize array of strings
     */
    static sanitizeStringArray(input) {
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
    static sanitizeObject(input) {
        if (typeof input !== 'object' || input === null) {
            throw new ValidationError('Input must be an object');
        }
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            // Sanitize key
            const sanitizedKey = this.sanitizeString(key);
            // Sanitize value based on type
            if (typeof value === 'string') {
                sanitized[sanitizedKey] = this.sanitizeString(value);
            }
            else if (Array.isArray(value)) {
                sanitized[sanitizedKey] = this.sanitizeStringArray(value);
            }
            else if (typeof value === 'object' && value !== null) {
                sanitized[sanitizedKey] = this.sanitizeObject(value);
            }
            else if (typeof value === 'number' && isFinite(value)) {
                sanitized[sanitizedKey] = Math.max(-1000000, Math.min(1000000, value)); // Clamp numbers
            }
            else if (typeof value === 'boolean') {
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
    static validateSubmitJobOptions(options) {
        const sanitized = {
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
    static validateModelName(modelName) {
        const sanitized = InputSanitizer.sanitizeString(modelName);
        // Model name should be alphanumeric with hyphens, underscores, and dots
        if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(sanitized)) {
            throw new ValidationError('Invalid model name format', 'modelName', modelName);
        }
        // Length constraints
        if (sanitized.length < 1 || sanitized.length > 100) {
            throw new ValidationError('Model name must be between 1 and 100 characters', 'modelName', modelName);
        }
        return sanitized;
    }
    /**
     * Validate job type
     */
    static validateJobType(jobType) {
        const validTypes = ['generate', 'chat', 'embedding'];
        if (!validTypes.includes(jobType)) {
            throw new ValidationError(`Invalid job type: ${jobType}`, 'jobType', jobType);
        }
        return jobType;
    }
    /**
     * Validate priority
     */
    static validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            throw new ValidationError(`Invalid priority: ${priority}`, 'priority', priority);
        }
        return priority;
    }
    /**
     * Validate messages array
     */
    static validateMessages(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new ValidationError('Messages must be a non-empty array', 'messages', messages);
        }
        if (messages.length > 100) {
            throw new ValidationError('Messages array cannot exceed 100 items', 'messages', messages);
        }
        const validRoles = ['system', 'user', 'assistant'];
        return messages.map((message, index) => {
            if (typeof message !== 'object' || message === null) {
                throw new ValidationError(`Message at index ${index} must be an object`, 'messages', messages);
            }
            if (!validRoles.includes(message.role)) {
                throw new ValidationError(`Invalid role at message index ${index}: ${message.role}`, 'messages', messages);
            }
            if (typeof message.content !== 'string' || message.content.trim() === '') {
                throw new ValidationError(`Message content at index ${index} must be a non-empty string`, 'messages', messages);
            }
            return {
                role: message.role,
                content: InputSanitizer.sanitizeString(message.content),
            };
        });
    }
    /**
     * Validate input for embedding jobs
     */
    static validateInput(input) {
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
    static validateJobOptions(options) {
        if (!options || typeof options !== 'object') {
            return undefined;
        }
        const sanitized = {};
        // Validate numeric options
        if (options.temperature !== undefined) {
            if (typeof options.temperature !== 'number' ||
                options.temperature < 0 ||
                options.temperature > 2) {
                throw new ValidationError('Temperature must be a number between 0 and 2', 'options.temperature', options.temperature);
            }
            sanitized.temperature = Math.round(options.temperature * 100) / 100; // Round to 2 decimal places
        }
        if (options.top_p !== undefined) {
            if (typeof options.top_p !== 'number' || options.top_p < 0 || options.top_p > 1) {
                throw new ValidationError('Top_p must be a number between 0 and 1', 'options.top_p', options.top_p);
            }
            sanitized.top_p = Math.round(options.top_p * 100) / 100;
        }
        if (options.num_ctx !== undefined) {
            if (typeof options.num_ctx !== 'number' || options.num_ctx < 1 || options.num_ctx > 32768) {
                throw new ValidationError('Num_ctx must be a number between 1 and 32768', 'options.num_ctx', options.num_ctx);
            }
            sanitized.num_ctx = Math.floor(options.num_ctx);
        }
        if (options.num_predict !== undefined) {
            if (typeof options.num_predict !== 'number' ||
                options.num_predict < 1 ||
                options.num_predict > 32768) {
                throw new ValidationError('Num_predict must be a number between 1 and 32768', 'options.num_predict', options.num_predict);
            }
            sanitized.num_predict = Math.floor(options.num_predict);
        }
        // Validate stop array
        if (options.stop !== undefined) {
            if (!Array.isArray(options.stop) || options.stop.length > 10) {
                throw new ValidationError('Stop must be an array with at most 10 items', 'options.stop', options.stop);
            }
            sanitized.stop = InputSanitizer.sanitizeStringArray(options.stop);
        }
        // Validate format
        if (options.format !== undefined) {
            if (options.format !== 'json' && typeof options.format !== 'object') {
                throw new ValidationError('Format must be "json" or a schema object', 'options.format', options.format);
            }
            sanitized.format = options.format;
        }
        return sanitized;
    }
    /**
     * Validate agent ID
     */
    static validateAgentId(agentId) {
        const sanitized = InputSanitizer.sanitizeString(agentId);
        // Agent ID should be a valid UUID or alphanumeric string
        if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$|^[a-zA-Z0-9_-]+$/.test(sanitized)) {
            throw new ValidationError('Invalid agent ID format', 'agentId', agentId);
        }
        return sanitized;
    }
    /**
     * Validate session ID
     */
    static validateSessionId(sessionId) {
        const sanitized = InputSanitizer.sanitizeString(sessionId);
        // Session ID should be a valid UUID or alphanumeric string
        if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$|^[a-zA-Z0-9_-]+$/.test(sanitized)) {
            throw new ValidationError('Invalid session ID format', 'sessionId', sessionId);
        }
        return sanitized;
    }
}
/**
 * Rate limiting utility
 */
export class RateLimiter {
    requests = new Map();
    windowMs;
    maxRequests;
    constructor(windowMs = 60000, maxRequests = 100) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }
    /**
     * Check if request is allowed
     */
    isAllowed(identifier) {
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
    getRemaining(identifier) {
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
    cleanup() {
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
//# sourceMappingURL=input-validation.js.map