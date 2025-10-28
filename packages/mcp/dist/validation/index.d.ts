/**
 * @fileoverview Comprehensive input validation integration for MCP service
 * Standalone validation framework based on indexer-service validation
 */
import { validatePathArrayFull, validatePathSecurity, validateSinglePath, validateMcpOperation, type ValidationResult, type PathValidationResult } from './comprehensive.js';
export { validatePathArrayFull, validatePathSecurity, validateSinglePath, validateMcpOperation };
export type { ValidationResult, PathValidationResult };
/**
 * MCP-specific validation wrapper
 */
export declare function validateMcpPath(input: unknown): ValidationResult<string>;
/**
 * MCP-specific array validation
 */
export declare function validateMcpPathArray(input: unknown): ValidationResult<string[]>;
//# sourceMappingURL=index.d.ts.map