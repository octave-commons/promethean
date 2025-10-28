/**
 * @fileoverview Comprehensive input validation for MCP service
 */
export interface ValidationResult<T = any> {
    success: boolean;
    data?: T;
    error?: any;
}
export interface PathValidationResult {
    valid: boolean;
    sanitized?: string;
    securityIssues?: string[];
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * Comprehensive path security validation
 */
export declare function validatePathSecurity(rel: string): PathValidationResult;
/**
 * Validates a single path
 */
export declare function validateSinglePath(inputPath: unknown): ValidationResult<string>;
/**
 * Validates an array of paths
 */
export declare function validatePathArrayFull(inputPaths: unknown): ValidationResult<string[]>;
/**
 * Enhanced security validation for MCP operations
 * Combines MCP's existing symlink checks with comprehensive validation
 */
export declare function validateMcpOperation(rootPath: string, targetPath: string, _operation?: 'read' | 'write' | 'list' | 'tree'): Promise<{
    valid: boolean;
    error?: string;
    sanitizedPath?: string;
}>;
/**
 * Security validation for GitHub API operations
 */
export declare function validateGitHubOperation(args: unknown): ValidationResult;
/**
 * Security validation for PNPM operations
 */
export declare function validatePnpmOperation(args: unknown): ValidationResult;
/**
 * Security validation for NX operations
 */
export declare function validateNxOperation(args: unknown): ValidationResult;
/**
 * Security validation for TDD (test execution) operations
 */
export declare function validateTddOperation(args: unknown): ValidationResult;
/**
 * Security validation for search operations
 */
export declare function validateSearchOperation(args: unknown): ValidationResult;
/**
 * Universal validator for all MCP operations
 */
export declare function validateMcpTool(toolName: string, args: unknown): ValidationResult;
//# sourceMappingURL=comprehensive.d.ts.map