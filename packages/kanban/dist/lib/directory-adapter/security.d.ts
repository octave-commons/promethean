/**
 * Security validation for DirectoryAdapter
 * Provides comprehensive security checks for file operations
 */
import type { SecurityValidator, SecurityOptions, FileOperationContext, PathValidationResult } from './types.js';
/**
 * Default security configuration
 */
export declare const DEFAULT_SECURITY_OPTIONS: SecurityOptions;
/**
 * Comprehensive security validator implementation
 */
export declare class TaskSecurityValidator implements SecurityValidator {
    private readonly options;
    constructor(options?: SecurityOptions);
    /**
     * Validate file path for security violations
     */
    validatePath(filePath: string, context: FileOperationContext): Promise<PathValidationResult>;
    /**
     * Validate file content for security issues
     */
    validateFileContent(content: string, context: FileOperationContext): Promise<PathValidationResult>;
    /**
     * Validate the overall operation context
     */
    validateOperation(context: FileOperationContext): Promise<boolean>;
    /**
     * Check for path traversal attempts
     */
    private containsPathTraversal;
    /**
     * Check for suspicious file names
     */
    private isSuspiciousFileName;
    /**
     * Operation-specific path validation
     */
    private validateOperationSpecificPath;
    /**
     * Check for binary content in text
     */
    private containsBinaryContent;
    /**
     * Validate UTF-8 encoding
     */
    private isValidUTF8;
    /**
     * Validate markdown-specific security issues
     */
    private validateMarkdownSecurity;
    /**
     * Generate content hash for integrity checking
     */
    generateContentHash(content: string): string;
    /**
     * Sanitize file path
     */
    sanitizePath(filePath: string): string;
}
/**
 * Create security validator with options
 */
export declare const createSecurityValidator: (options?: Partial<SecurityOptions>) => SecurityValidator;
//# sourceMappingURL=security.d.ts.map