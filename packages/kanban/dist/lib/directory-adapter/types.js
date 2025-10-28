/**
 * DirectoryAdapter Types
 * Provides secure, standardized file operations for task management
 */
/**
 * Error types
 */
export class DirectoryAdapterError extends Error {
    code;
    operation;
    path;
    cause;
    constructor(message, code, operation, path, cause) {
        super(message);
        this.code = code;
        this.operation = operation;
        this.path = path;
        this.cause = cause;
        this.name = 'DirectoryAdapterError';
    }
}
export class SecurityValidationError extends DirectoryAdapterError {
    securityIssues;
    constructor(message, securityIssues, path, operation) {
        super(message, 'SECURITY_VALIDATION_ERROR', operation, path);
        this.securityIssues = securityIssues;
        this.name = 'SecurityValidationError';
    }
}
export class FileNotFoundError extends DirectoryAdapterError {
    constructor(path, operation) {
        super(`File not found: ${path}`, 'FILE_NOT_FOUND', operation, path);
        this.name = 'FileNotFoundError';
    }
}
export class FilePermissionError extends DirectoryAdapterError {
    constructor(path, operation) {
        super(`Permission denied: ${path}`, 'FILE_PERMISSION_ERROR', operation, path);
        this.name = 'FilePermissionError';
    }
}
export class FileCorruptionError extends DirectoryAdapterError {
    constructor(path, reason, operation) {
        super(`File corruption detected: ${path} - ${reason}`, 'FILE_CORRUPTION_ERROR', operation, path);
        this.name = 'FileCorruptionError';
    }
}
//# sourceMappingURL=types.js.map