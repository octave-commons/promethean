/**
 * Security utilities for preventing common web vulnerabilities in shadow-conf.
 *
 * This module provides comprehensive security validation functions to protect against:
 * - Path traversal attacks
 * - Command injection
 * - Script injection
 * - Directory boundary violations
 * - Encoded attack vectors
 */

import path from 'node:path';

/**
 * Security validation result type
 */
type ValidationResult = { success: true; sanitized: string } | { success: false; error: string };

/**
 * Comprehensive security configuration
 */
export interface SecurityConfig {
  /** Maximum allowed path length */
  maxPathLength: number;
  /** Maximum allowed filename length */
  maxFilenameLength: number;
  /** Maximum directory recursion depth */
  maxRecursionDepth: number;
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Allowed file extensions */
  allowedExtensions: readonly string[];
  /** Blocked system directories */
  blockedSystemDirs: readonly string[];
  /** Enable strict mode (additional validations) */
  strictMode: boolean;
}

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxPathLength: 4096,
  maxFilenameLength: 255,
  maxRecursionDepth: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.edn'],
  blockedSystemDirs: [
    '/proc',
    '/sys',
    '/dev',
    '/etc',
    '/bin',
    '/sbin',
    '/usr/bin',
    '/usr/sbin',
    'C:\\Windows',
    'C:\\Windows\\System32',
    'C:\\Program Files',
  ],
  strictMode: true,
};

/**
 * Validates and sanitizes a file path with comprehensive security checks.
 *
 * @param inputPath - The path to validate
 * @param context - Context for error messages
 * @param config - Security configuration
 * @param allowRelativeTraversal - Allow relative path traversal (default: false)
 * @returns Validation result
 */
export function validateAndSanitizePath(
  inputPath: string,
  context: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
  allowRelativeTraversal: boolean = false,
): ValidationResult {
  // Length validation
  if (inputPath.length > config.maxPathLength) {
    return {
      success: false,
      error: `${context} too long (max ${config.maxPathLength} characters)`,
    };
  }

  // Null byte and control character validation
  if (inputPath.includes('\0') || inputPath.includes('\r') || inputPath.includes('\n')) {
    return {
      success: false,
      error: `Invalid characters detected in ${context}`,
    };
  }

  // Command injection prevention
  const commandInjectionChars = ['|', ';', '&', '$', '`', '(', ')', '{', '}', '<', '>'];
  if (commandInjectionChars.some((char) => inputPath.includes(char))) {
    return {
      success: false,
      error: `Command injection detected in ${context}: ${inputPath}`,
    };
  }

  // Script injection prevention
  const scriptInjectionPatterns = [
    '<script',
    'javascript:',
    'eval(',
    'expression(',
    'Function(',
    'setTimeout(',
    'setInterval(',
    'new Function',
  ];
  const lowerInput = inputPath.toLowerCase();
  if (scriptInjectionPatterns.some((pattern) => lowerInput.includes(pattern))) {
    return {
      success: false,
      error: `Script injection detected in ${context}: ${inputPath}`,
    };
  }

  // Path traversal detection (basic patterns)
  if (!allowRelativeTraversal) {
    const traversalPatterns = [
      '../',
      '..\\',
      '..%2f',
      '..%5c',
      '%2e%2e',
      '%2E%2E',
      '/..',
      '\\..',
      '%2f..',
      '%5c..',
    ];
    if (traversalPatterns.some((pattern) => inputPath.toLowerCase().includes(pattern))) {
      return {
        success: false,
        error: `Directory traversal detected in ${context}: ${inputPath}`,
      };
    }
  }

  // Unicode and encoded bypass attempts
  const unicodePatterns = [
    '..%c0%af',
    '..%c1%9c',
    '..%e0%80%af', // Unicode bypass attempts
    '%252e%252e%252f', // Double-encoded traversal
  ];
  if (unicodePatterns.some((pattern) => inputPath.toLowerCase().includes(pattern))) {
    return {
      success: false,
      error: `Encoded directory traversal detected in ${context}: ${inputPath}`,
    };
  }

  // System directory access prevention
  const normalizedPath = path.normalize(inputPath);
  for (const systemDir of config.blockedSystemDirs) {
    if (
      normalizedPath.startsWith(systemDir) ||
      normalizedPath.toLowerCase().startsWith(systemDir.toLowerCase())
    ) {
      return {
        success: false,
        error: `Access to system directories not allowed: ${inputPath}`,
      };
    }
  }

  return { success: true, sanitized: inputPath };
}

/**
 * Validates and sanitizes a filename with strict security checks.
 *
 * @param filename - The filename to validate
 * @param config - Security configuration
 * @returns Validation result
 */
export function validateAndSanitizeFilename(
  filename: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): ValidationResult {
  // Length validation
  if (filename.length > config.maxFilenameLength) {
    return {
      success: false,
      error: `Filename too long (max ${config.maxFilenameLength} characters)`,
    };
  }

  // Path separator validation (filenames shouldn't contain paths)
  if (filename.includes('/') || filename.includes('\\')) {
    return {
      success: false,
      error: 'Filename must not contain path separators',
    };
  }

  // Reserved Windows names validation
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  if (reservedNames.test(filename.split('.')[0] || '')) {
    return {
      success: false,
      error: `Reserved filename detected: ${filename}`,
    };
  }

  // Character validation (only allow safe filename characters)
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return {
      success: false,
      error: `Filename contains invalid characters: ${filename}`,
    };
  }

  // Apply general path validation for additional security
  return validateAndSanitizePath(filename, 'filename', config);
}

/**
 * Validates that a resolved path stays within expected boundaries.
 *
 * @param resolvedPath - The resolved absolute path
 * @param basePath - The base path it should be contained within
 * @param context - Context for error messages
 * @returns Validation result
 */
export function validatePathBoundaries(
  resolvedPath: string,
  basePath: string,
  context: string,
): ValidationResult {
  const relativePath = path.relative(basePath, resolvedPath);

  // If relative path starts with '..', it escapes the base directory
  if (relativePath.startsWith('..') || path.relative(resolvedPath, basePath).startsWith('..')) {
    return {
      success: false,
      error: `Path boundary violation in ${context}: ${resolvedPath} escapes ${basePath}`,
    };
  }

  return { success: true, sanitized: resolvedPath };
}

/**
 * Validates directory recursion depth to prevent denial of service.
 *
 * @param currentDepth - Current recursion depth
 * @param config - Security configuration
 * @param context - Context for error messages
 * @returns Validation result
 */
export function validateRecursionDepth(
  currentDepth: number,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
  context: string = 'directory traversal',
): ValidationResult {
  if (currentDepth > config.maxRecursionDepth) {
    return {
      success: false,
      error: `Directory depth limit exceeded: ${currentDepth} levels in ${context}`,
    };
  }

  return { success: true, sanitized: currentDepth.toString() };
}

/**
 * Validates file size to prevent memory exhaustion attacks.
 *
 * @param fileSize - File size in bytes
 * @param config - Security configuration
 * @param filePath - File path for error context
 * @returns Validation result
 */
export function validateFileSize(
  fileSize: number,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
  filePath: string = 'file',
): ValidationResult {
  if (fileSize > config.maxFileSize) {
    return {
      success: false,
      error: `File too large: ${filePath} (${fileSize} bytes, max ${config.maxFileSize})`,
    };
  }

  return { success: true, sanitized: fileSize.toString() };
}

/**
 * Validates file extension against allowed list.
 *
 * @param filePath - File path to validate
 * @param config - Security configuration
 * @returns Validation result
 */
export function validateFileExtension(
  filePath: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): ValidationResult {
  const ext = path.extname(filePath).toLowerCase();

  if (!config.allowedExtensions.includes(ext)) {
    return {
      success: false,
      error: `File extension not allowed: ${ext} (allowed: ${config.allowedExtensions.join(', ')})`,
    };
  }

  return { success: true, sanitized: filePath };
}

/**
 * Sanitizes data for safe JSON serialization to prevent code injection.
 *
 * @param data - The data to sanitize
 * @param config - Security configuration
 * @returns Sanitized data safe for JSON serialization
 */
export function sanitizeForJsonSerialization(
  data: unknown,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Remove dangerous characters that could be used for injection
    let sanitized = data
      .replace(/[\0\r\n]/g, '') // Remove null bytes and line breaks
      .replace(/<\/script/gi, '</scr\\\\ipt') // Break script tags
      .replace(/<script/gi, '<scr\\\\ipt') // Break script tags
      .replace(/javascript:/gi, 'java\\\\script:') // Break JavaScript URLs
      .replace(/on[a-zA-Z]+=/gi, 'on\\\\$1='); // Break event handlers

    // Additional sanitization in strict mode
    if (config.strictMode) {
      sanitized = sanitized
        .replace(/eval\s*\(/gi, 'eval\\\\(')
        .replace(/Function\s*\(/gi, 'Function\\\\(')
        .replace(/setTimeout\s*\(/gi, 'setTimeout\\\\(')
        .replace(/setInterval\s*\(/gi, 'setInterval\\\\(');
    }

    return sanitized;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForJsonSerialization(item, config));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize keys as well
      const sanitizedKey = String(key).replace(/[^\w\-_]/g, '_');
      sanitized[sanitizedKey] = sanitizeForJsonSerialization(value, config);
    }
    return sanitized;
  }

  // Fallback for other types
  return String(data);
}

/**
 * Comprehensive security validation for CLI arguments.
 *
 * @param args - Command line arguments to validate
 * @param config - Security configuration
 * @returns Validation result
 */
export function validateCliArguments(
  args: readonly string[],
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): ValidationResult {
  for (const arg of args) {
    const result = validateAndSanitizePath(arg, 'CLI argument', config);
    if (!result.success) {
      return result;
    }
  }

  return { success: true, sanitized: args.join(' ') };
}
