import * as path from 'node:path';
import { promises as fs } from 'node:fs';

/**
 * Security configuration for path validation
 */
export interface PathSecurityConfig {
  /** Maximum allowed path depth */
  maxDepth?: number;
  /** Whether to allow symbolic links */
  allowSymlinks?: boolean;
  /** Blocked file extensions */
  blockedExtensions?: string[];
  /** Allowed file extensions (if specified, only these are allowed) */
  allowedExtensions?: string[];
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Whether to check for dangerous file names */
  checkDangerousNames?: boolean;
}

/**
 * Result of path validation
 */
export interface PathValidationResult {
  /** Whether the path is valid */
  isValid: boolean;
  /** Normalized absolute path */
  normalizedPath?: string;
  /** Relative path from root */
  relativePath?: string;
  /** Error message if validation failed */
  error?: string;
  /** Security warnings */
  warnings?: string[];
}

/**
 * Dangerous file patterns that should be blocked
 */
const DANGEROUS_NAMES = new Set([
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
  '.htaccess',
  '.htpasswd',
  'web.config',
  'php.ini',
]);

const DANGEROUS_PATTERNS = [
  /\.\.[\/\\]/, // Directory traversal
  /[\/\\]\.\.[\/\\]/, // Traversal in middle
  /\.\.$/, // Ends with ..
  /^\.\./, // Starts with ..
  /[\/\\]\./, // Hidden files (optional)
];

/**
 * Default security configuration
 */
const DEFAULT_CONFIG: Required<PathSecurityConfig> = {
  maxDepth: 20,
  allowSymlinks: false,
  blockedExtensions: [
    '.exe',
    '.bat',
    '.cmd',
    '.scr',
    '.pif',
    '.com',
    '.vbs',
    '.js',
    '.jar',
    '.app',
    '.deb',
    '.rpm',
    '.dmg',
    '.pkg',
    '.msi',
    '.dll',
    '.so',
    '.dylib',
  ],
  allowedExtensions: [],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  checkDangerousNames: true,
};

/**
 * Validates and normalizes a file path within a given root directory
 */
export async function validatePath(
  rootPath: string,
  inputPath: string,
  config: PathSecurityConfig = {},
): Promise<PathValidationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const warnings: string[] = [];

  try {
    // Resolve and normalize paths
    const resolvedRoot = path.resolve(rootPath);
    const normalizedInput = path.normalize(inputPath).replace(/\\/g, '/');

    // Check for dangerous patterns
    if (finalConfig.checkDangerousNames) {
      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(normalizedInput)) {
          return {
            isValid: false,
            error: `Path contains dangerous pattern: ${pattern.source}`,
          };
        }
      }

      const fileName = path.basename(normalizedInput);
      if (DANGEROUS_NAMES.has(fileName.toUpperCase())) {
        return {
          isValid: false,
          error: `Dangerous file name detected: ${fileName}`,
        };
      }
    }

    // Check path depth
    const pathComponents = normalizedInput.split('/').filter(Boolean);
    const directoryComponents = pathComponents.slice(0, -1); // Exclude filename
    if (directoryComponents.length > finalConfig.maxDepth) {
      return {
        isValid: false,
        error: `Path depth exceeds maximum allowed depth of ${finalConfig.maxDepth}`,
      };
    }

    // Resolve the absolute path
    let absolutePath: string;
    if (path.isAbsolute(normalizedInput)) {
      absolutePath = path.resolve(normalizedInput);
    } else {
      absolutePath = path.resolve(resolvedRoot, normalizedInput);
    }

    // Ensure the path is within the root directory
    const relativePath = path.relative(resolvedRoot, absolutePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return {
        isValid: false,
        error: 'Path attempts to escape root directory',
      };
    }

    // Check file extensions
    const ext = path.extname(absolutePath).toLowerCase();
    if (finalConfig.blockedExtensions.includes(ext)) {
      return {
        isValid: false,
        error: `File extension ${ext} is not allowed`,
      };
    }

    if (finalConfig.allowedExtensions.length > 0 && !finalConfig.allowedExtensions.includes(ext)) {
      return {
        isValid: false,
        error: `File extension ${ext} is not in allowed list`,
      };
    }

    // Check for symbolic links if not allowed
    if (!finalConfig.allowSymlinks) {
      try {
        const stats = await fs.lstat(absolutePath);
        if (stats.isSymbolicLink()) {
          return {
            isValid: false,
            error: 'Symbolic links are not allowed',
          };
        }
      } catch (error) {
        // Path doesn't exist, which is fine for validation
      }
    }

    // Validate symlink chain if symlinks are allowed
    if (finalConfig.allowSymlinks) {
      const symlinkValidation = await validateSymlinkChain(resolvedRoot, absolutePath);
      if (!symlinkValidation.isValid) {
        return symlinkValidation;
      }
      warnings.push(...(symlinkValidation.warnings || []));
    }

    // Check file size if file exists
    try {
      const stats = await fs.stat(absolutePath);
      if (stats.isFile() && stats.size > finalConfig.maxFileSize) {
        return {
          isValid: false,
          error: `File size exceeds maximum allowed size of ${finalConfig.maxFileSize} bytes`,
        };
      }
    } catch (error) {
      // File doesn't exist, which is fine
    }

    return {
      isValid: true,
      normalizedPath: absolutePath,
      relativePath: relativePath.replace(/\\/g, '/'),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Validates a chain of symbolic links to ensure they don't escape the root
 */
async function validateSymlinkChain(
  rootPath: string,
  targetPath: string,
): Promise<PathValidationResult> {
  const warnings: string[] = [];
  const visited = new Set<string>();
  let currentPath = targetPath;

  while (true) {
    if (visited.has(currentPath)) {
      return {
        isValid: false,
        error: 'Circular symbolic link detected',
      };
    }
    visited.add(currentPath);

    try {
      const stats = await fs.lstat(currentPath);
      if (!stats.isSymbolicLink()) {
        break;
      }

      const linkTarget = await fs.readlink(currentPath);
      const resolvedTarget = path.resolve(path.dirname(currentPath), linkTarget);

      // Check if the symlink target escapes the root
      const relativePath = path.relative(rootPath, resolvedTarget);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return {
          isValid: false,
          error: 'Symbolic link chain escapes root directory',
        };
      }

      warnings.push(`Symbolic link: ${currentPath} -> ${resolvedTarget}`);
      currentPath = resolvedTarget;
    } catch (error) {
      // Can't stat the path, break the loop
      break;
    }
  }

  return {
    isValid: true,
    warnings,
  };
}

/**
 * Sanitizes a file name by removing or replacing dangerous characters
 */
export function sanitizeFileName(fileName: string): string {
  // Remove null bytes and control characters
  let sanitized = fileName.replace(/[\x00-\x1f\x7f]/g, '');

  // Replace dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');

  // Remove leading and trailing spaces and dots
  sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');

  // Ensure it's not empty after sanitization
  if (!sanitized) {
    sanitized = 'unnamed_file';
  }

  // Truncate if too long (255 characters is a common limit)
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const nameWithoutExt = path.basename(sanitized, ext);
    const maxNameLength = 255 - ext.length;
    sanitized = nameWithoutExt.substring(0, maxNameLength) + ext;
  }

  return sanitized;
}

/**
 * Creates a secure file path by combining directory and sanitized filename
 */
export function createSecurePath(directory: string, fileName: string): string {
  const sanitizedFileName = sanitizeFileName(fileName);
  return path.join(directory, sanitizedFileName);
}

/**
 * Checks if a path is safe for cross-platform use
 */
export function isCrossPlatformSafe(inputPath: string): boolean {
  // Check for empty paths
  if (!inputPath || inputPath.trim() === '') {
    return false;
  }

  // Check for Windows-specific issues
  const windowsIssues = /[<>:"|?*]/;
  if (windowsIssues.test(inputPath)) {
    return false;
  }

  // Check for reserved names (check full path and base name)
  const baseName = path.basename(inputPath);
  const baseNameWithoutExt = path.basename(inputPath, path.extname(inputPath));

  if (DANGEROUS_NAMES.has(baseNameWithoutExt.toUpperCase())) {
    return false;
  }

  // Check for trailing spaces or dots (Windows issue)
  // Check the actual filename, not just base without extension
  if (/[. ]$/.test(baseName)) {
    return false;
  }

  return true;
}

/**
 * Validates a batch of paths efficiently
 */
export async function validatePaths(
  rootPath: string,
  inputPaths: string[],
  config: PathSecurityConfig = {},
): Promise<PathValidationResult[]> {
  const results = await Promise.all(
    inputPaths.map((inputPath) => validatePath(rootPath, inputPath, config)),
  );

  return results;
}

/**
 * Creates a secure temporary file path
 */
export function createSecureTempPath(
  rootPath: string,
  prefix: string = 'tmp',
  extension: string = '.tmp',
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const fileName = `${prefix}_${timestamp}_${random}${extension}`;
  return createSecurePath(rootPath, fileName);
}
