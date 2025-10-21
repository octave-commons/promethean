/**
 * @fileoverview Comprehensive input validation for MCP service
 */

import * as path from 'node:path';
import { z } from 'zod';

/**
 * Based on the validation framework from indexer-service but standalone
 */

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
// Validation Types
// ============================================================================

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

// ============================================================================
// Basic Validation Functions
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

  // Check for unicode homograph characters
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

  // Check normalized string for dangerous patterns
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

  // Block reserved device names
  const baseName = path.basename(trimmed).toUpperCase();
  if (WINDOWS_RESERVED_NAMES.includes(baseName)) {
    return false;
  }

  return true;
}

/**
 * Validates Unix-specific path security
 */
function validateUnixPathSecurity(trimmed: string): boolean {
  // Block tilde expansion attempts
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
 * Comprehensive path security validation
 */
export function validatePathSecurity(rel: string): PathValidationResult {
  const securityIssues: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  const trimmed = rel.trim();

  // CRITICAL: Path traversal detection must run FIRST
  const traversalResult = detectPathTraversal(trimmed);
  if (traversalResult.isTraversal) {
    securityIssues.push('Path traversal attempt detected');
    if (traversalResult.hasUnicodeAttack || !traversalResult.isAbsolutePath) {
      riskLevel = 'critical';
    } else {
      riskLevel = 'high';
    }
  } else if (traversalResult.isAbsolutePath) {
    securityIssues.push('Absolute path access detected');
    riskLevel = 'high';
  }

  // Basic validation
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

  // Unix-specific validation
  if (!validateUnixPathSecurity(trimmed)) {
    securityIssues.push('Unix path security violation');
    if (trimmed.startsWith('~') && riskLevel !== 'critical') {
      riskLevel = 'critical';
    } else if (riskLevel !== 'critical') {
      riskLevel = 'high';
    }
  }

  // Path normalization
  if (!validatePathNormalization(trimmed)) {
    securityIssues.push('Path normalization failed');
    if (riskLevel === 'low') {
      riskLevel = 'medium';
    }
  }

  // Glob pattern attacks
  if (containsGlobAttackPatterns(trimmed)) {
    securityIssues.push('Glob pattern attack detected');
    if (riskLevel !== 'critical') riskLevel = 'medium';
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
 * Validates a single path
 */
export function validateSinglePath(inputPath: unknown): ValidationResult<string> {
  if (typeof inputPath !== 'string') {
    return {
      success: false,
      error: new Error('Path must be a string'),
    };
  }

  const securityResult = validatePathSecurity(inputPath);
  if (!securityResult.valid) {
    return {
      success: false,
      error: new Error(`Security validation failed: ${securityResult.securityIssues?.join(', ')}`),
    };
  }

  return { success: true, data: securityResult.sanitized || inputPath };
}

/**
 * Validates an array of paths
 */
export function validatePathArrayFull(inputPaths: unknown): ValidationResult<string[]> {
  if (!Array.isArray(inputPaths)) {
    return {
      success: false,
      error: new Error('Input must be an array'),
    };
  }

  const validPaths: string[] = [];
  const securityIssues: string[] = [];

  for (const pathItem of inputPaths) {
    if (typeof pathItem !== 'string') {
      securityIssues.push(`${pathItem}: Invalid path type`);
      continue;
    }

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
      error: new Error(`Path security validation failed: ${securityIssues.join('; ')}`),
    };
  }

  return { success: true, data: validPaths };
}

/**
 * Enhanced security validation for MCP operations
 * Combines MCP's existing symlink checks with comprehensive validation
 */
export async function validateMcpOperation(
  rootPath: string,
  targetPath: string,
  _operation: 'read' | 'write' | 'list' | 'tree' = 'read',
): Promise<{ valid: boolean; error?: string; sanitizedPath?: string }> {
  // First use comprehensive validation
  const validationResult = validateSinglePath(targetPath);
  if (!validationResult.success) {
    return {
      valid: false,
      error: `Validation failed: ${validationResult.error.message}`,
    };
  }

  const sanitizedPath = validationResult.data;

  // Then perform MCP-specific security checks
  try {
    // Import MCP's existing security functions
    const { normalizeToRoot, isInsideRoot } = await import('../files.js');

    // Normalize path and check if it's inside root
    const normalizedPath = normalizeToRoot(rootPath, sanitizedPath);
    if (!isInsideRoot(rootPath, normalizedPath)) {
      return {
        valid: false,
        error: 'Path outside allowed root directory',
      };
    }

    return {
      valid: true,
      sanitizedPath: normalizedPath,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

// ============================================================================
// Enhanced MCP Tool Validation
// ============================================================================

/**
 * Security validation for GitHub API operations
 */
export function validateGitHubOperation(args: unknown): ValidationResult {
  const schema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    path: z.string().min(1).max(1000),
    query: z.record(z.any()).optional(),
    headers: z.record(z.string()).optional(),
    body: z.any().optional(),
    paginate: z.boolean().optional(),
    perPage: z.number().int().positive().max(1000).optional(),
    maxPages: z.number().int().positive().max(100).optional(),
  });

  try {
    const validated = schema.parse(args);

    // Additional security checks for GitHub path
    if (validated.path) {
      const pathValidation = validatePathSecurity(validated.path);
      if (!pathValidation.valid) {
        return {
          success: false,
          error: new Error(
            `GitHub path validation failed: ${pathValidation.securityIssues?.join(', ')}`,
          ),
        };
      }

      // Check for GitHub API injection patterns
      const dangerousPatterns = [
        /\.\./, // Path traversal
        /[<>]/, // HTML injection
        /['"]/, // Command injection
        /\${/, // Template injection
        /[\r\n]/, // CRLF injection
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(validated.path)) {
          return {
            success: false,
            error: new Error('GitHub path contains potentially dangerous patterns'),
          };
        }
      }
    }

    // Validate headers for injection
    if (validated.headers) {
      for (const [key, value] of Object.entries(validated.headers)) {
        if (/[<>:"\\]/.test(value)) {
          return {
            success: false,
            error: new Error(`Header ${key} contains dangerous characters`),
          };
        }
      }
    }

    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('GitHub validation failed'),
    };
  }
}

/**
 * Security validation for PNPM operations
 */
export function validatePnpmOperation(args: unknown): ValidationResult {
  const schema = z.object({
    args: z.array(z.string().max(1000)).max(20).nonempty(),
    cwd: z.string().optional(),
    env: z.record(z.string()).optional(),
    timeout: z.number().int().positive().max(600000).optional(), // 10 minutes max
  });

  try {
    const validated = schema.parse(args);

    // Security checks for PNPM arguments
    const dangerousArgs = [
      '--exec',
      '--script',
      'run',
      'exec',
      ';',
      '&&',
      '||',
      '|',
      '`',
      '$',
      '$(',
      '${',
      '<',
      '>',
      '>>',
    ];

    for (const arg of validated.args) {
      // Check for dangerous command patterns
      for (const dangerous of dangerousArgs) {
        if (arg.includes(dangerous)) {
          return {
            success: false,
            error: new Error(`PNPM argument contains dangerous pattern: ${arg}`),
          };
        }
      }

      // Check for path traversal in arguments
      const pathValidation = validatePathSecurity(arg);
      if (!pathValidation.valid && pathValidation.riskLevel === 'critical') {
        return {
          success: false,
          error: new Error(`PNPM argument contains path traversal: ${arg}`),
        };
      }

      // Check for script injection
      if (/\.(js|ts|sh|bat|cmd|ps1)$/i.test(arg) && arg.includes('/')) {
        return {
          success: false,
          error: new Error(`PNPM argument attempts script execution: ${arg}`),
        };
      }
    }

    // Validate working directory
    if (validated.cwd) {
      const cwdValidation = validatePathSecurity(validated.cwd);
      if (!cwdValidation.valid) {
        return {
          success: false,
          error: new Error(
            `PNPM working directory validation failed: ${cwdValidation.securityIssues?.join(', ')}`,
          ),
        };
      }
    }

    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('PNPM validation failed'),
    };
  }
}

/**
 * Security validation for NX operations
 */
export function validateNxOperation(args: unknown): ValidationResult {
  const schema = z.object({
    generator: z.string().min(1).max(100),
    args: z.record(z.string()).optional(),
    dryRun: z.boolean().optional(),
    force: z.boolean().optional(),
  });

  try {
    const validated = schema.parse(args);

    // Security checks for NX generator
    const dangerousGenerators = ['exec', 'run', 'deploy', 'publish', 'build:prod'];

    if (dangerousGenerators.some((dangerous) => validated.generator.includes(dangerous))) {
      return {
        success: false,
        error: new Error(`NX generator is potentially dangerous: ${validated.generator}`),
      };
    }

    // Check generator name for injection
    if (/[<>:"\\|?*]/.test(validated.generator)) {
      return {
        success: false,
        error: new Error('NX generator name contains dangerous characters'),
      };
    }

    // Validate generator arguments
    if (validated.args) {
      for (const [key, value] of Object.entries(validated.args)) {
        // Check for dangerous patterns in values
        const dangerousPatterns = [
          /\.\./, // Path traversal
          /[<>]/, // HTML injection
          /['"`]/, // Command injection
          /\${/, // Template injection
          /[\r\n]/, // CRLF injection
        ];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(value)) {
            return {
              success: false,
              error: new Error(`NX argument ${key} contains dangerous patterns`),
            };
          }
        }

        // Check for path traversal in argument values
        const pathValidation = validatePathSecurity(value);
        if (!pathValidation.valid && pathValidation.riskLevel === 'critical') {
          return {
            success: false,
            error: new Error(`NX argument ${key} contains path traversal`),
          };
        }
      }
    }

    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('NX validation failed'),
    };
  }
}

/**
 * Security validation for TDD (test execution) operations
 */
export function validateTddOperation(args: unknown): ValidationResult {
  const schema = z.object({
    command: z.string().min(1).max(1000),
    args: z.array(z.string().max(500)).max(10).optional(),
    cwd: z.string().optional(),
    timeout: z.number().int().positive().max(300000).optional(), // 5 minutes max
  });

  try {
    const validated = schema.parse(args);

    // Security checks for test commands
    const dangerousCommands = [
      'rm',
      'rmdir',
      'del',
      'format',
      'fdisk',
      'mkfs',
      'shutdown',
      'reboot',
      'halt',
      'poweroff',
      'sudo',
      'su',
      'chmod',
      'chown',
    ];

    const commandBase = validated.command?.split(' ')[0]?.toLowerCase() || '';
    if (dangerousCommands.includes(commandBase)) {
      return {
        success: false,
        error: new Error(`TDD command is dangerous: ${validated.command}`),
      };
    }

    // Check for command injection patterns
    const injectionPatterns = [
      /[;&|`$()]/, // Command injection
      /\${/, // Template injection
      /[<>]/, // HTML injection
      /[\r\n]/, // CRLF injection
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(validated.command)) {
        return {
          success: false,
          error: new Error('TDD command contains injection patterns'),
        };
      }
    }

    // Validate command arguments
    if (validated.args) {
      for (const arg of validated.args) {
        const pathValidation = validatePathSecurity(arg);
        if (!pathValidation.valid && pathValidation.riskLevel === 'critical') {
          return {
            success: false,
            error: new Error(`TDD argument contains path traversal: ${arg}`),
          };
        }

        // Check for dangerous argument patterns
        if (/[;&|`$()<>]/.test(arg)) {
          return {
            success: false,
            error: new Error(`TDD argument contains dangerous patterns: ${arg}`),
          };
        }
      }
    }

    // Validate working directory
    if (validated.cwd) {
      const cwdValidation = validatePathSecurity(validated.cwd);
      if (!cwdValidation.valid) {
        return {
          success: false,
          error: new Error(
            `TDD working directory validation failed: ${cwdValidation.securityIssues?.join(', ')}`,
          ),
        };
      }
    }

    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('TDD validation failed'),
    };
  }
}

/**
 * Security validation for search operations
 */
export function validateSearchOperation(args: unknown): ValidationResult {
  const schema = z.object({
    query: z.string().min(1).max(1000),
    regex: z.boolean().optional(),
    caseSensitive: z.boolean().optional(),
    includeHidden: z.boolean().optional(),
    maxDepth: z.number().int().positive().max(25).optional(),
    maxFileSizeBytes: z.number().int().positive().max(10000000).optional(), // 10MB max
    maxResults: z.number().int().positive().max(1000).optional(),
    rel: z.string().optional(),
    includeGlobs: z.array(z.string().max(500)).max(20).optional(),
    excludeGlobs: z.array(z.string().max(500)).max(20).optional(),
    sortBy: z.enum(['path', 'firstMatchLine']).optional(),
  });

  try {
    const validated = schema.parse(args);

    // Security checks for search query
    const dangerousPatterns = [
      /[;&|`$()]/, // Command injection
      /\${/, // Template injection
      /<script/i, // Script injection
      /javascript:/i, // JavaScript injection
      /data:/i, // Data URI injection
      /[\r\n]/, // CRLF injection
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(validated.query)) {
        return {
          success: false,
          error: new Error('Search query contains injection patterns'),
        };
      }
    }

    // Check for regex DoS attacks
    if (validated.regex) {
      // Use safe string matching to avoid backreference issues
      const queryStr = validated.query || '';
      
      // Check for dangerous pattern substrings
      if (queryStr.includes('(a+)+b') || 
          queryStr.includes('a+a+a+a+') ||
          queryStr.includes('(.*).*+') ||
          queryStr.includes('(.*).*') ||
          queryStr.includes('(.*).*{')) {
        return {
          success: false,
          error: new Error('Search regex contains potential DoS patterns'),
        };
      }
    }

    // Validate relative path
    if (validated.rel) {
      const pathValidation = validatePathSecurity(validated.rel);
      if (!pathValidation.valid) {
        return {
          success: false,
          error: new Error(
            `Search path validation failed: ${pathValidation.securityIssues?.join(', ')}`,
          ),
        };
      }
    }

    // Validate glob patterns
    if (validated.includeGlobs) {
      for (const glob of validated.includeGlobs) {
        const globValidation = validatePathSecurity(glob);
        if (!globValidation.valid && globValidation.riskLevel === 'critical') {
          return {
            success: false,
            error: new Error(`Search include glob is dangerous: ${glob}`),
          };
        }
      }
    }

    if (validated.excludeGlobs) {
      for (const glob of validated.excludeGlobs) {
        const globValidation = validatePathSecurity(glob);
        if (!globValidation.valid && globValidation.riskLevel === 'critical') {
          return {
            success: false,
            error: new Error(`Search exclude glob is dangerous: ${glob}`),
          };
        }
      }
    }

    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Search validation failed'),
    };
  }
}

/**
 * Universal validator for all MCP operations
 */
export function validateMcpTool(toolName: string, args: unknown): ValidationResult {
  switch (toolName) {
    case 'github_request':
    case 'github_graphql':
    case 'github_apply_patch':
    case 'github_pull_request_api':
    case 'github_pull_request_review':
    case 'github_contents':
    case 'github_workflows':
      return validateGitHubOperation(args);

    case 'pnpm':
    case 'pnpm_install':
    case 'pnpm_run':
    case 'pnpm_test':
      return validatePnpmOperation(args);

    case 'nx':
    case 'nx_generate':
    case 'nx_run':
    case 'nx_build':
      return validateNxOperation(args);

    case 'tdd':
    case 'tdd_run':
    case 'tdd_test':
      return validateTddOperation(args);

    case 'files_search':
      return validateSearchOperation(args);

    case 'files_view_file':
    case 'files_write_content':
    case 'files_list_directory':
      // File operations already have path validation in files.ts
      // But we can add additional checks here if needed
      return { success: true, data: args };

    default:
      // For unknown tools, perform basic validation
      if (typeof args !== 'object' || args === null) {
        return {
          success: false,
          error: new Error('Invalid arguments format'),
        };
      }

      // Check for obviously dangerous patterns in any string field
      const checkStringForDanger = (value: unknown): boolean => {
        if (typeof value === 'string') {
          return /[;&|`$()<>]/.test(value) || /\.\./.test(value);
        }
        return false;
      };

      const checkObjectRecursively = (obj: any): boolean => {
        if (typeof obj === 'string') {
          return checkStringForDanger(obj);
        }
        if (Array.isArray(obj)) {
          return obj.some(checkObjectRecursively);
        }
        if (typeof obj === 'object' && obj !== null) {
          return Object.values(obj || {}).some(checkObjectRecursively);
        }
        return false;
      };

      if (checkObjectRecursively(args)) {
        return {
          success: false,
          error: new Error('Arguments contain potentially dangerous patterns'),
        };
      }

      return { success: true, data: args };
  }
}
