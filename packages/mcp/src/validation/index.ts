/**
 * @fileoverview Comprehensive input validation integration for MCP service
 * Standalone validation framework based on indexer-service validation
 */

// Import the comprehensive validation framework with explicit imports
import {
  validatePathArrayFull,
  validatePathSecurity,
  validateSinglePath,
  validateMcpOperation,
  type ValidationResult,
  type PathValidationResult,
} from './comprehensive.js';

// Re-export the comprehensive validation functions
export { validatePathArrayFull, validatePathSecurity, validateSinglePath, validateMcpOperation };

// Export types for convenience
export type { ValidationResult, PathValidationResult };

/**
 * MCP-specific validation wrapper
 */
export function validateMcpPath(input: unknown): ValidationResult<string> {
  return validateSinglePath(input);
}

/**
 * MCP-specific array validation
 */
export function validateMcpPathArray(input: unknown): ValidationResult<string[]> {
  return validatePathArrayFull(input);
}
