/**
 * @fileoverview Comprehensive input validation integration for MCP service
 * Standalone validation framework based on indexer-service validation
 */
// Import the comprehensive validation framework with explicit imports
import { validatePathArrayFull, validatePathSecurity, validateSinglePath, validateMcpOperation, } from './comprehensive.js';
// Re-export the comprehensive validation functions
export { validatePathArrayFull, validatePathSecurity, validateSinglePath, validateMcpOperation };
/**
 * MCP-specific validation wrapper
 */
export function validateMcpPath(input) {
    return validateSinglePath(input);
}
/**
 * MCP-specific array validation
 */
export function validateMcpPathArray(input) {
    return validatePathArrayFull(input);
}
//# sourceMappingURL=index.js.map