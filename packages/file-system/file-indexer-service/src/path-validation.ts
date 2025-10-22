/**
 * Path validation utilities to prevent path traversal attacks
 * Critical security module for indexer-service
 */

import * as path from 'node:path';

/**
 * Normalizes a path and validates it's safe for access
 * @param inputPath The path to validate
 * @param allowedBasePaths Optional list of allowed base paths
 * @returns The normalized, safe path
 * @throws Error if path is invalid or potentially dangerous
 */
export function validateAndNormalizePath(
  inputPath: string,
  allowedBasePaths: string[] = [],
): string {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  // Remove any null bytes
  const cleanPath = inputPath.replace(/\0/g, '');

  // Check for obvious path traversal attempts
  if (cleanPath.includes('../') || cleanPath.includes('..\\')) {
    throw new Error('Path traversal detected: relative parent directory access not allowed');
  }

  // Check for encoded traversal attempts
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(cleanPath);
  } catch {
    decodedPath = cleanPath;
  }

  if (decodedPath.includes('../') || decodedPath.includes('..\\')) {
    throw new Error('Encoded path traversal detected');
  }

  // Normalize path separators
  const normalizedPath = cleanPath.replace(/\\/g, '/');

  // Remove leading slashes to prevent absolute path access (unless allowed)
  if (normalizedPath.startsWith('/') && allowedBasePaths.length === 0) {
    throw new Error('Absolute paths not allowed without explicit base path configuration');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Any double dot (already caught above, but defensive)
    /\/etc\//, // System directories
    /\/proc\//, // Linux proc filesystem
    /\/sys\//, // Linux sys filesystem
    /\/windows\//i, // Windows system directories
    /\/program files\//i, // Windows program files
    /\/users\//i, // Windows users directory
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(normalizedPath)) {
      throw new Error(`Suspicious path pattern detected: ${pattern.source}`);
    }
  }

  // If allowed base paths are specified, ensure path is within allowed bounds
  if (allowedBasePaths.length > 0) {
    const isAllowed = allowedBasePaths.some((basePath) => {
      const normalizedBase = basePath.replace(/\\/g, '/').replace(/\/$/, '');
      return normalizedPath.startsWith(normalizedBase + '/') || normalizedPath === normalizedBase;
    });

    if (!isAllowed) {
      throw new Error(`Path not within allowed base paths: ${allowedBasePaths.join(', ')}`);
    }
  }

  // Additional safety: resolve any remaining relative components
  const pathParts = normalizedPath.split('/').filter((part) => part !== '');
  const resolvedParts: string[] = [];

  for (const part of pathParts) {
    if (part === '..') {
      // This should already be caught, but defensive programming
      throw new Error('Path traversal detected during resolution');
    }
    if (part !== '.' && part !== '') {
      resolvedParts.push(part);
    }
  }

  return resolvedParts.join('/');
}

/**
 * Validates an array of file patterns
 * @param patterns Array of file patterns to validate
 * @param allowedBasePaths Optional list of allowed base paths
 * @returns Array of validated, normalized patterns
 */
export function validateFilePatterns(
  patterns: string[],
  allowedBasePaths: string[] = [],
): string[] {
  if (!Array.isArray(patterns)) {
    throw new Error('Patterns must be an array');
  }

  return patterns.map((pattern) => {
    if (!pattern || typeof pattern !== 'string') {
      throw new Error('Each pattern must be a non-empty string');
    }

    // Allow glob patterns but still validate the path components
    const validatedPattern = validateAndNormalizePath(pattern, allowedBasePaths);

    // Ensure glob patterns don't contain dangerous characters
    if (
      validatedPattern.includes('$') ||
      validatedPattern.includes('`') ||
      validatedPattern.includes('|')
    ) {
      throw new Error('Pattern contains potentially dangerous characters');
    }

    return validatedPattern;
  });
}

/**
 * Validates that a path is safe for file system operations
 * Includes additional checks for file system specific attacks
 */
export function validateFileSystemPath(inputPath: string, allowedBasePaths: string[] = []): string {
  const validatedPath = validateAndNormalizePath(inputPath, allowedBasePaths);

  // Additional file system specific checks
  if (validatedPath.length > 4096) {
    throw new Error('Path too long');
  }

  // Check for control characters
  if (/[\x00-\x1f\x7f-\x9f]/.test(validatedPath)) {
    throw new Error('Path contains control characters');
  }

  // Check for Unicode homograph attacks
  const unicodeHomographs = [
    '‥', // Unicode two-dot leader (U+2025)
    '﹒', // Unicode small full stop (U+FE52)
    '．', // Unicode fullwidth full stop (U+FF0E)
  ];

  for (const homograph of unicodeHomographs) {
    if (validatedPath.includes(homograph)) {
      throw new Error('Path contains suspicious Unicode characters');
    }
  }

  return validatedPath;
}

/**
 * Creates a path validator with specific allowed base paths
 * @param allowedBasePaths List of allowed base paths
 * @returns A validator function for the specified base paths
 */
export function createPathValidator(allowedBasePaths: string[]) {
  return {
    validatePath: (path: string) => validateFileSystemPath(path, allowedBasePaths),
    validatePatterns: (patterns: string[]) => validateFilePatterns(patterns, allowedBasePaths),
  };
}
