/**
 * @fileoverview Validation utilities and security validators
 */

import path from 'node:path';
import type { z } from 'zod';
import { SafePathSchema, SafePathArraySchema, SearchQuerySchema } from './schemas.js';
import type { ValidationResult, ValidationErrorDetails, PathValidationResult } from './types.js';
import type { FastifyRequest } from 'fastify';

// ============================================================================
// Security Validation Constants
// ============================================================================

const DANGEROUS_CHARS = ['<', '>', '|', '&', ';', '`', '$', '"', "'", '\r', '\n'];
const WINDOWS_RESERVED_NAMES = [
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
];

const GLOB_ATTACK_PATTERNS = [
  /\*\*.*\.\./, // ** followed by ..
  /\.\.\/\*\*/, // ../**
  /\{\.\./, // {.. in brace expansion
  /\.\.\}/, // ..} in brace expansion
  /\{.*\.\..*\}/, // {..} anywhere in braces
  /\*\*\/\.\./, // **/../
  /\.\.\/\*\*\/.*/, // ../**/
  /\{.*,.*\.\..*,.*\}/, // {..} in comma-separated braces
  /^\.\./, // Starts with ..
  /\/\.\./, // Contains /..
  /\.\.$/, // Ends with ..
  /\{\s*\.\./, // { .. with spaces
  /\.\.\s*\}/, // .. } with spaces
];

const UNIX_DANGEROUS_PATHS = ['/dev/', '/proc/', '/sys/', '/etc/', '/root/', '/var/log/'];

// ============================================================================
// Basic Validation Functions
// ============================================================================

/**
 * Validates a value against a Zod schema
 */
export function validateWithSchema<T>(schema: z.ZodSchema<T>, value: unknown): ValidationResult<T> {
  const result = schema.safeParse(value);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Type guard to check if validation succeeded
 */
export function isValid<T>(result: ValidationResult<T>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Extracts error message from validation result
 */
export function getValidationErrors(result: ValidationResult<unknown>): string[] {
  if (!result.success) {
    return result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
  }
  return [];
}

// ============================================================================
// Path Security Validation
// ============================================================================

/**
 * Validates basic path properties
 */
function validateBasicPathProperties(rel: string): boolean {
  if (typeof rel !== 'string') {
    return false;
  }

  if (rel.length === 0 || rel.length > 256) {
    return false;
  }

  if (rel.includes('\0')) {
    return false;
  }

  const trimmed = rel.trim();
  if (trimmed !== rel) {
    return false;
  }

  return true;
}

/**
 * Detects path traversal attempts with URI decoding & Unicode normalization
 * Returns an object indicating the type of threat detected
 */
function detectPathTraversal(trimmed: string): {
  isTraversal: boolean;
  isAbsolutePath: boolean;
  hasUnicodeAttack: boolean;
} {
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    // If decoding fails, continue with original
  }

  let hasUnicodeAttack = false;
  let hasTraversal = false;

  // Check for %2e%2e patterns in both encoded and decoded forms
  if (/%2e%2e/i.test(trimmed) || /%2e%2e/i.test(decoded)) {
    hasTraversal = true;
  }

  // Apply Unicode normalization to catch homograph attacks
  const normalized = decoded.normalize('NFKC');

  // Check for unicode homograph characters in both original and normalized forms
  const unicodeHomographs = [
    '‥', // Unicode two-dot leader (U+2025)
    '﹒', // Unicode small full stop (U+FE52)
    '．', // Unicode fullwidth full stop (U+FF0E)
    '．．', // Double fullwidth full stop
    '‥．', // Mixed unicode dots
    '．‥', // Mixed unicode dots
  ];

  // Check original string for unicode homographs
  for (const homograph of unicodeHomographs) {
    if (decoded.includes(homograph)) {
      hasUnicodeAttack = true;
      hasTraversal = true;
      break;
    }
  }

  // Check normalized string for dangerous patterns that may result from homograph normalization
  if (/\.\.\./.test(normalized)) {
    hasUnicodeAttack = true;
    hasTraversal = true;
  }

  const pathComponents = normalized.split(/[\\/]/);
  if (pathComponents.includes('..') || pathComponents.includes('.')) {
    hasTraversal = true;
  }

  const isAbsolutePath = path.isAbsolute(normalized);

  return {
    isTraversal: hasTraversal,
    isAbsolutePath,
    hasUnicodeAttack,
  };
}

/**
 * Checks for dangerous characters
 */
function containsDangerousCharacters(trimmed: string): boolean {
  return DANGEROUS_CHARS.some((char) => trimmed.includes(char));
}

/**
 * Validates Windows-specific path security
 */
function validateWindowsPathSecurity(trimmed: string): boolean {
  // Block drive letters
  if (/^[a-zA-Z]:/.test(trimmed)) {
    return false;
  }

  // Block UNC paths
  if (trimmed.startsWith('\\\\')) {
    return false;
  }

  // Block backslash paths
  if (trimmed.includes('\\')) {
    return false;
  }

  // Block reserved device names (even without extension)
  const baseName = path.basename(trimmed).toUpperCase().split('.')[0]; // Remove extension if present
  if (WINDOWS_RESERVED_NAMES.includes(baseName)) {
    return false;
  }

  // Block Windows device names with any extension or path
  const windowsDevicePattern = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*|\/.*)?$/i;
  if (windowsDevicePattern.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Validates Unix-specific path security
 */
function validateUnixPathSecurity(trimmed: string): boolean {
  // Block tilde expansion attempts to access home directory
  // This includes both ~/ and ~user/ patterns
  if (/^~[^\/]*\//.test(trimmed)) {
    return false;
  }

  if (process.platform !== 'win32') {
    // Block dangerous system paths
    if (UNIX_DANGEROUS_PATHS.some((dangerous) => trimmed.startsWith(dangerous))) {
      return false;
    }
  }
  return true;
}

/**
 * Validates path normalization
 */
function validatePathNormalization(trimmed: string): boolean {
  try {
    const normalized = path.normalize(trimmed);
    if (path.isAbsolute(normalized) || normalized.includes('..')) {
      return false;
    }

    // Additional check: resolve against a fake root
    const fakeRoot = '/fake/root';
    const resolved = path.resolve(fakeRoot, normalized);
    if (!resolved.startsWith(fakeRoot)) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

/**
 * Detects glob pattern attacks
 */
function containsGlobAttackPatterns(trimmed: string): boolean {
  return GLOB_ATTACK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Validates glob-specific security constraints
 */
function validateGlobSecurity(trimmed: string): boolean {
  // Check for brace expansion attacks
  if (trimmed.includes('{')) {
    // Look for dangerous brace expansions
    const braceMatch = trimmed.match(/\{([^}]+)\}/);
    if (braceMatch && braceMatch[1]) {
      const braceContent = braceMatch[1];
      // Check for traversal patterns in braces
      if (
        braceContent.includes('..') ||
        braceContent.includes('../') ||
        braceContent.includes('..\\')
      ) {
        return false;
      }
      // Check for excessive brace expansion (DoS protection)
      const options = braceContent.split(',').length;
      if (options > 100) {
        return false;
      }
    }
  }

  // Check for nested double asterisks that could escape
  const doubleAsteriskMatches = trimmed.match(/\*\*/g);
  if (doubleAsteriskMatches && doubleAsteriskMatches.length > 10) {
    return false;
  }

  // Check for patterns that could match outside repository
  if (trimmed.startsWith('**/') && trimmed.includes('..')) {
    return false;
  }

  return true;
}

/**
 * Comprehensive path security validation
 */
export function validatePathSecurity(rel: string): PathValidationResult {
  const securityIssues: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  const trimmed = rel.trim();

  // CRITICAL: Path traversal detection must run FIRST to catch Unicode bypasses
  const traversalResult = detectPathTraversal(trimmed);
  if (traversalResult.isTraversal) {
    securityIssues.push('Path traversal attempt detected');
    // Only mark as critical if it's actual traversal, not just absolute path
    if (traversalResult.hasUnicodeAttack || !traversalResult.isAbsolutePath) {
      riskLevel = 'critical';
    } else {
      // Absolute paths without traversal are 'high'
      riskLevel = 'high';
    }
  } else if (traversalResult.isAbsolutePath) {
    // Standalone absolute path (no traversal) is 'high'
    securityIssues.push('Absolute path access detected');
    riskLevel = 'high';
  }

  // Basic validation (after traversal detection to catch encoded attacks)
  if (!validateBasicPathProperties(rel)) {
    securityIssues.push('Invalid basic path properties');
    if (riskLevel !== 'critical') riskLevel = 'critical';
  }

  // Dangerous characters
  if (containsDangerousCharacters(trimmed)) {
    securityIssues.push('Dangerous characters detected');
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  // Windows-specific validation
  if (!validateWindowsPathSecurity(trimmed)) {
    securityIssues.push('Windows path security violation');
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  // Unix-specific validation - but system paths should be 'high', not 'critical'
  if (!validateUnixPathSecurity(trimmed)) {
    securityIssues.push('Unix path security violation');
    // Only elevate to critical if it's a tilde expansion (home directory access)
    if (trimmed.startsWith('~') && riskLevel !== 'critical') {
      riskLevel = 'critical';
    } else if (riskLevel !== 'critical') {
      riskLevel = 'high';
    }
  }

  // Path normalization - preserve higher risk levels from earlier checks
  if (!validatePathNormalization(trimmed)) {
    securityIssues.push('Path normalization failed');
    // Only set to 'medium' if no higher risk level was already established
    if (riskLevel === 'low') {
      riskLevel = 'medium';
    }
    // If risk level is already 'high' or 'critical', preserve it
  }

  // Glob pattern attacks
  if (containsGlobAttackPatterns(trimmed)) {
    securityIssues.push('Glob pattern attack detected');
    if (riskLevel !== 'critical') riskLevel = 'medium';
  }

  // Glob-specific security validation
  if (!validateGlobSecurity(trimmed)) {
    securityIssues.push('Glob security validation failed');
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  // Glob-specific security validation
  if (!validateGlobSecurity(trimmed)) {
    securityIssues.push('Glob security validation failed');
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  const valid = securityIssues.length === 0;
  return {
    valid,
    sanitized: valid ? trimmed : undefined,
    securityIssues: valid ? undefined : securityIssues,
    riskLevel,
  };
}

/**
 * Validates a single path using both Zod schema and security validation
 */
export function validateSinglePath(inputPath: unknown): ValidationResult<string> {
  // First validate with Zod schema
  const schemaResult = validateWithSchema(SafePathSchema, inputPath);
  if (!schemaResult.success) {
    return schemaResult;
  }

  // Then perform security validation
  const securityResult = validatePathSecurity(schemaResult.data);
  if (!securityResult.valid) {
    return {
      success: false,
      error: new Error(
        `Security validation failed: ${securityResult.securityIssues?.join(', ')}`,
      ) as z.ZodError,
    };
  }

  return { success: true, data: securityResult.sanitized || schemaResult.data };
}

/**
 * Path validation result type for legacy compatibility
 */
interface LegacyPathValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an array of paths (legacy compatibility)
 */
export function validatePathArray(
  globs: string | string[] | undefined,
): LegacyPathValidationResult {
  if (!globs) {
    return { valid: false, error: "Missing 'path'" };
  }

  if (typeof globs === 'string') {
    const securityResult = validatePathSecurity(globs);
    if (!securityResult.valid) {
      return { valid: false, error: 'Invalid path' };
    }
  } else if (Array.isArray(globs)) {
    for (const glob of globs) {
      const securityResult = validatePathSecurity(glob);
      if (!securityResult.valid) {
        return { valid: false, error: 'Invalid path' };
      }
    }
  } else {
    return { valid: false, error: 'Invalid path format' };
  }

  return { valid: true };
}

/**
 * Validates an array of paths
 */
export function validatePathArrayFull(inputPaths: unknown): ValidationResult<string[]> {
  const schemaResult = validateWithSchema(SafePathArraySchema, inputPaths);
  if (!schemaResult.success) {
    return schemaResult;
  }

  const validPaths: string[] = [];
  const securityIssues: string[] = [];

  for (const pathItem of schemaResult.data) {
    const securityResult = validatePathSecurity(pathItem);
    if (securityResult.valid) {
      validPaths.push(securityResult.sanitized || pathItem);
    } else {
      securityIssues.push(`${pathItem}: ${securityResult.securityIssues?.join(', ')}`);
    }
  }

  if (securityIssues.length > 0) {
    return {
      success: false,
      error: new Error(
        `Path security validation failed: ${securityIssues.join('; ')}`,
      ) as z.ZodError,
    };
  }

  return { success: true, data: validPaths };
}

// ============================================================================
// Request Validation
// ============================================================================

/**
 * Validates search query with security checks
 */
export function validateSearchQuery(query: unknown): ValidationResult<string> {
  const schemaResult = validateWithSchema(SearchQuerySchema, query);
  if (!schemaResult.success) {
    return schemaResult;
  }

  // Additional security checks for search queries
  const searchQuery = schemaResult.data.toLowerCase();

  // Check for potential injection patterns
  const injectionPatterns = [/javascript:/i, /data:/i, /vbscript:/i, /<script/i, /on\w+\s*=/i];

  for (const pattern of injectionPatterns) {
    if (pattern.test(searchQuery)) {
      return {
        success: false,
        error: new Error('Search query contains potentially dangerous content') as z.ZodError,
      };
    }
  }

  return schemaResult;
}

/**
 * Extracts client information from request for security monitoring
 */
export function extractClientInfo(request: FastifyRequest): {
  clientIp?: string;
  userAgent?: string;
  requestId?: string;
} {
  const headers = request.headers as Record<string, string>;

  return {
    clientIp: headers['x-forwarded-for'] || headers['x-real-ip'] || request.ip,
    userAgent: headers['user-agent'],
    requestId: headers['x-request-id'] || request.id,
  };
}

/**
 * Creates a validation error details object for monitoring
 */
export function createValidationErrorDetails(
  operation: string,
  field: string,
  issue: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  request: FastifyRequest,
  inputValue?: unknown,
  expectedType?: string,
): ValidationErrorDetails {
  const clientInfo = extractClientInfo(request);

  return {
    operation,
    field,
    issue,
    severity,
    inputValue,
    expectedType,
    timestamp: new Date().toISOString(),
    requestId: clientInfo.requestId,
    clientIp: clientInfo.clientIp,
    userAgent: clientInfo.userAgent,
  };
}

// ============================================================================
// Response Validation
// ============================================================================

/**
 * Validates response data before sending
 */
export function validateResponseData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  return validateWithSchema(schema, data);
}

/**
 * Sanitizes error messages for client responses
 */
export function sanitizeErrorMessage(error: string): string {
  // Remove file paths, stack traces, and other sensitive information
  const sanitized = error
    .replace(/\/[^\s]+/g, '[PATH]') // Replace file paths
    .replace(/\\[^\s]+/g, '[PATH]') // Replace Windows paths
    .replace(/at\s+.*\s+\([^)]+\)/g, '[STACK]') // Replace stack traces
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]') // Replace IP addresses
    .trim();

  return sanitized || 'Internal server error';
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if a request is from a trusted source
 */
export function isTrustedSource(request: FastifyRequest): boolean {
  const headers = request.headers as Record<string, string>;
  const clientIp = headers['x-forwarded-for'] || headers['x-real-ip'] || request.ip;

  // Define trusted IP ranges (localhost, private networks, etc.)
  const trustedRanges = [
    /^127\./, // localhost
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^::1$/, // IPv6 localhost
    /^fc00:/, // IPv6 private
  ];

  return trustedRanges.some((range) => range.test(clientIp));
}

/**
 * Calculates risk score based on request characteristics
 */
export function calculateRiskScore(request: FastifyRequest): number {
  let riskScore = 0;
  const headers = request.headers as Record<string, string>;

  // Check for suspicious headers
  if (headers['user-agent']?.includes('bot')) riskScore += 0.2;
  if (headers['x-forwarded-for']?.includes(',')) riskScore += 0.1; // Multiple proxies

  // Check request size
  const contentLength = parseInt(headers['content-length'] || '0');
  if (contentLength > 1024 * 1024) riskScore += 0.3; // > 1MB

  // Check query string length
  if (request.url.length > 1000) riskScore += 0.2;

  return Math.min(riskScore, 1.0);
}
