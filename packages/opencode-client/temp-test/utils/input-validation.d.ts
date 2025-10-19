import type { SubmitJobOptions } from '../types/index.js';
/**
 * Validation error class
 */
export declare class ValidationError extends Error {
    field?: string;
    value?: unknown;
    constructor(message: string, field?: string, value?: unknown);
}
/**
 * Input sanitizer for preventing injection attacks
 */
export declare class InputSanitizer {
    /**
     * Sanitize string input to prevent injection attacks
     */
    static sanitizeString(input: string): string;
    /**
     * Sanitize array of strings
     */
    static sanitizeStringArray(input: string[]): string[];
    /**
     * Sanitize object keys and string values
     */
    static sanitizeObject(input: Record<string, unknown>): Record<string, unknown>;
}
/**
 * Validator for job-related inputs
 */
export declare class JobValidator {
    /**
     * Validate job submission options
     */
    static validateSubmitJobOptions(options: SubmitJobOptions): SubmitJobOptions;
    /**
     * Validate model name
     */
    private static validateModelName;
    /**
     * Validate job type
     */
    private static validateJobType;
    /**
     * Validate priority
     */
    private static validatePriority;
    /**
     * Validate messages array
     */
    private static validateMessages;
    /**
     * Validate input for embedding jobs
     */
    private static validateInput;
    /**
     * Validate job options
     */
    private static validateJobOptions;
    /**
     * Validate agent ID
     */
    private static validateAgentId;
    /**
     * Validate session ID
     */
    private static validateSessionId;
}
/**
 * Rate limiting utility
 */
export declare class RateLimiter {
    private requests;
    private readonly windowMs;
    private readonly maxRequests;
    constructor(windowMs?: number, maxRequests?: number);
    /**
     * Check if request is allowed
     */
    isAllowed(identifier: string): boolean;
    /**
     * Get remaining requests for identifier
     */
    getRemaining(identifier: string): number;
    /**
     * Clean up expired entries
     */
    cleanup(): void;
}
export declare const defaultRateLimiter: RateLimiter;
