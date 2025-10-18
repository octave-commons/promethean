import { readFile } from 'node:fs/promises';
import path from 'node:path';

import edn from 'jsedn';

/**
 * Validates that a file path is safe for reading.
 * 
 * @param filePath - The file path to validate
 * @throws {Error} When path contains dangerous sequences
 */
function validateFilePath(filePath: string): void {
  // Reject null bytes and other dangerous characters
  if (filePath.includes(String.fromCharCode(0)) || filePath.includes('\r') || filePath.includes('\n')) {
    throw new Error(`Invalid characters detected in file path: ${filePath}`);
  }

  // Reject path traversal attempts
  if (filePath.includes('../') || filePath.includes('..\\') || filePath.includes('..')) {
    throw new Error(`Directory traversal detected in file path: ${filePath}`);
  }

  // Reject encoded traversal attempts
  if (filePath.includes('%2e%2e') || filePath.includes('%2E%2E')) {
    throw new Error(`Encoded directory traversal detected in file path: ${filePath}`);
  }

  // Reject command injection attempts
  if (filePath.includes('|') || filePath.includes(';') || filePath.includes('&')) {
    throw new Error(`Command injection detected in file path: ${filePath}`);
  }

  // Ensure the path is absolute
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Relative path not allowed: ${filePath}`);
  }

  // Additional validation for file extensions
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.edn') {
    throw new Error(`Only .edn files are allowed: ${filePath}`);
  }
}

type UnknownRecord = Record<string, unknown>;

/**
 * Loads and parses an EDN file into a JavaScript object.
 *
 * This function reads an EDN file, parses it using the jsedn library,
 * and normalizes the result by:
 * - Converting EDN keywords (starting with ':') to regular strings
 * - Recursively processing nested objects and arrays
 * - Preserving null values as null
 *
 * @param filePath - Absolute path to the EDN file
 * @returns Promise resolving to parsed and normalized JavaScript object
 *
 * @throws {Error} When file cannot be read
 * @throws {Error} When EDN syntax is invalid
 *
 * @example
 * ```typescript
 * // Given EDN file content: {:name "app" :version "1.0"}
 * const result = await loadEdnFile('./config.edn');
 * // Result: { name: "app", version: "1.0" }
 * ```
 */
export async function loadEdnFile(filePath: string): Promise<unknown> {
  // SECURITY: Validate file path before reading
  validateFilePath(filePath);
  
  try {
    const content = await readFile(filePath, 'utf8');
    
    // SECURITY: Validate content before parsing
    if (content.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error(`File too large: ${content.length} bytes (max 10MB)`);
    }
    
    // SECURITY: Check for dangerous content patterns
    if (content.includes('<script') || content.includes('javascript:') || content.includes('eval(')) {
      throw new Error(`Potentially dangerous content detected in EDN file: ${filePath}`);
    }
    
    return normalize(edn.toJS(edn.parse(content)));
  } catch (e) {
    throw new Error(`Failed to parse EDN file at ${filePath}: ${(e as Error).message}`);
  }
}

/**
 * Normalizes EDN-parsed values by converting keywords to strings.
 *
 * This function recursively processes the parsed EDN data structure:
 * - Objects: Converts keys starting with ':' to strings without the colon
 * - Arrays: Recursively processes each element
 * - Primitives: Returns as-is
 * - null/undefined: Returns null
 *
 * @param value - Value to normalize (from EDN parser)
 * @returns Normalized JavaScript value
 *
 * @example
 * ```typescript
 * normalize({ ':name': 'app', ':config': { ':port': 3000 } });
 * // Returns: { name: 'app', config: { port: 3000 } }
 * ```
 */
function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'object') {
    return value;
  }

  return Object.entries(value as UnknownRecord).reduce<UnknownRecord>(
    (accumulator, [rawKey, rawValue]) => ({
      ...accumulator,
      [rawKey.startsWith(':') ? rawKey.slice(1) : rawKey]: normalize(rawValue),
    }),
    {},
  );
}