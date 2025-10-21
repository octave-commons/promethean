/**
 * Core type definitions for the Promethean Documentation System
 * Provides comprehensive type safety for the fullstack application
 */
// ============================================================================
// Error Types
// ============================================================================
export class DocsSystemError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'DocsSystemError';
    }
}
export class ValidationError extends DocsSystemError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}
export class AuthenticationError extends DocsSystemError {
    constructor(message = 'Authentication failed') {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}
export class AuthorizationError extends DocsSystemError {
    constructor(message = 'Access denied') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}
export class NotFoundError extends DocsSystemError {
    constructor(resource) {
        super(`${resource} not found`, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}
export class ConflictError extends DocsSystemError {
    constructor(message) {
        super(message, 'CONFLICT', 409);
        this.name = 'ConflictError';
    }
}
export class RateLimitError extends DocsSystemError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 'RATE_LIMIT', 429);
        this.name = 'RateLimitError';
    }
}
export class OllamaError extends DocsSystemError {
    constructor(message, details) {
        super(message, 'OLLAMA_ERROR', 502, details);
        this.name = 'OllamaError';
    }
}
//# sourceMappingURL=index.js.map