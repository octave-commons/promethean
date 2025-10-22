/**
 * Security validation for DirectoryAdapter
 * Provides comprehensive security checks for file operations
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import type {
  SecurityValidator,
  SecurityOptions,
  FileOperationContext,
  PathValidationResult,
} from './types.js';

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_OPTIONS: SecurityOptions = {
  level: 'strict',
  allowedExtensions: ['.md'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowPathTraversal: false,
  allowSymlinks: false,
  requireAuthentication: false,
  auditLog: true,
};

/**
 * Comprehensive security validator implementation
 */
export class TaskSecurityValidator implements SecurityValidator {
  constructor(private readonly options: SecurityOptions = DEFAULT_SECURITY_OPTIONS) {}

  /**
   * Validate file path for security violations
   */
  async validatePath(
    filePath: string,
    context: FileOperationContext,
  ): Promise<PathValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Normalize the path
      const normalizedPath = path.normalize(filePath);

      // Check for path traversal attempts
      if (!this.options.allowPathTraversal) {
        if (this.containsPathTraversal(normalizedPath)) {
          issues.push('Path traversal detected');
        }
      }

      // Check for dangerous file extensions
      const ext = path.extname(normalizedPath).toLowerCase();
      if (!this.options.allowedExtensions.includes(ext)) {
        issues.push(
          `File extension '${ext}' not allowed. Allowed: ${this.options.allowedExtensions.join(', ')}`,
        );
      }

      // Check for suspicious file names
      const fileName = path.basename(normalizedPath);
      if (this.isSuspiciousFileName(fileName)) {
        warnings.push(`Suspicious file name: ${fileName}`);
      }

      // Check if path is within allowed directory (if base directory is set)
      if (context.metadata?.baseDirectory) {
        const relativePath = path.relative(context.metadata.baseDirectory, normalizedPath);
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
          issues.push('Path outside allowed directory');
        }
      }

      // Check for symlink security issues
      if (!this.options.allowSymlinks) {
        try {
          const stats = await fs.stat(normalizedPath);
          if (stats.isSymbolicLink()) {
            issues.push('Symbolic links not allowed');
          }
        } catch {
          // File doesn't exist, which is fine for create operations
        }
      }

      // Additional security checks based on operation type
      const operationSpecificIssues = await this.validateOperationSpecificPath(
        normalizedPath,
        context,
      );
      issues.push(...operationSpecificIssues);

      return {
        valid: issues.length === 0,
        normalizedPath,
        securityIssues: issues,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        normalizedPath: filePath,
        securityIssues: [
          `Path validation error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        warnings,
      };
    }
  }

  /**
   * Validate file content for security issues
   */
  async validateFileContent(
    content: string,
    context: FileOperationContext,
  ): Promise<PathValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Check file size
      const contentSize = Buffer.byteLength(content, 'utf8');
      if (contentSize > this.options.maxFileSize) {
        issues.push(
          `File size ${contentSize} exceeds maximum allowed size ${this.options.maxFileSize}`,
        );
      }

      // Check for potentially dangerous content patterns
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
        /javascript:/gi, // JavaScript URLs
        /vbscript:/gi, // VBScript URLs
        /on\w+\s*=/gi, // Event handlers
        /<iframe\b[^>]*>/gi, // Iframes
        /<object\b[^>]*>/gi, // Objects
        /<embed\b[^>]*>/gi, // Embeds
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          issues.push(`Potentially dangerous content detected: ${pattern.source}`);
        }
      }

      // Check for binary content (should be text for markdown files)
      if (this.containsBinaryContent(content)) {
        issues.push('Binary content detected in text file');
      }

      // Check for encoding issues
      if (!this.isValidUTF8(content)) {
        warnings.push('Invalid UTF-8 encoding detected');
      }

      // Check for suspicious patterns in markdown
      const markdownIssues = this.validateMarkdownSecurity(content);
      issues.push(...markdownIssues);

      return {
        valid: issues.length === 0,
        normalizedPath: context.path,
        securityIssues: issues,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        normalizedPath: context.path,
        securityIssues: [
          `Content validation error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        warnings,
      };
    }
  }

  /**
   * Validate the overall operation context
   */
  async validateOperation(context: FileOperationContext): Promise<boolean> {
    // Check if user is authenticated (if required)
    if (this.options.requireAuthentication && !context.user) {
      return false;
    }

    // Check operation rate limits (if implemented)
    // This would integrate with a rate limiting service

    // Check for suspicious patterns in metadata
    if (context.metadata) {
      const suspiciousKeys = ['password', 'secret', 'token', 'key', 'auth'];
      for (const key of suspiciousKeys) {
        if (key in context.metadata) {
          // Log suspicious activity but don't necessarily block
          console.warn(`Suspicious metadata key detected: ${key}`);
        }
      }
    }

    return true;
  }

  /**
   * Check for path traversal attempts
   */
  private containsPathTraversal(filePath: string): boolean {
    // Check for common path traversal patterns
    const traversalPatterns = [
      /\.\.[\/\\]/, // ../
      /[\/\\]\.\./, // /..
      /\.\.%2f/i, // ..%2f
      /\.\.%5c/i, // ..%5c
      /%2e%2e[\/\\]/i, // %2e%2e/
      /[\/\\]%2e%2e/i, // /%2e%2e
    ];

    return traversalPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Check for suspicious file names
   */
  private isSuspiciousFileName(fileName: string): boolean {
    const suspiciousPatterns = [
      /^\./, // Hidden files
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
      /[<>:"|?*]/, // Invalid characters
      /^(test|debug|temp|tmp)/i, // Temporary files
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(fileName));
  }

  /**
   * Operation-specific path validation
   */
  private async validateOperationSpecificPath(
    filePath: string,
    context: FileOperationContext,
  ): Promise<string[]> {
    const issues: string[] = [];

    switch (context.operation) {
      case 'delete':
        // Prevent deletion of critical files
        const criticalFiles = ['README.md', 'config.md', 'template.md'];
        if (criticalFiles.includes(path.basename(filePath))) {
          issues.push(`Cannot delete critical file: ${path.basename(filePath)}`);
        }
        break;

      case 'write':
      case 'create':
        // Check if directory exists
        const dir = path.dirname(filePath);
        try {
          await fs.access(dir);
        } catch {
          issues.push(`Directory does not exist: ${dir}`);
        }
        break;

      case 'move':
        // Prevent moving to system directories
        const systemDirs = ['/etc', '/bin', '/usr', '/System', 'Windows'];
        if (systemDirs.some((sysDir) => filePath.startsWith(sysDir))) {
          issues.push('Cannot move files to system directories');
        }
        break;
    }

    return issues;
  }

  /**
   * Check for binary content in text
   */
  private containsBinaryContent(content: string): boolean {
    // Check for null bytes and other binary indicators
    const binaryIndicators = [
      /\0/, // Null bytes
      /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, // Control characters
    ];

    return binaryIndicators.some((indicator) => indicator.test(content));
  }

  /**
   * Validate UTF-8 encoding
   */
  private isValidUTF8(content: string): boolean {
    try {
      // Try to encode and decode to check for valid UTF-8
      Buffer.from(content, 'utf8').toString('utf8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate markdown-specific security issues
   */
  private validateMarkdownSecurity(content: string): string[] {
    const issues: string[] = [];

    // Check for potentially dangerous markdown links
    const dangerousLinkPatterns = [
      /\[.*?\]\(javascript:/gi,
      /\[.*?\]\(vbscript:/gi,
      /\[.*?\]\(data:.*?base64/gi,
    ];

    for (const pattern of dangerousLinkPatterns) {
      if (pattern.test(content)) {
        issues.push(`Dangerous markdown link detected: ${pattern.source}`);
      }
    }

    // Check for HTML in markdown (could be XSS)
    const htmlPattern = /<[^>]*>/g;
    const htmlMatches = content.match(htmlPattern);
    if (htmlMatches && htmlMatches.length > 10) {
      issues.push('Excessive HTML content detected in markdown');
    }

    return issues;
  }

  /**
   * Generate content hash for integrity checking
   */
  generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Sanitize file path
   */
  sanitizePath(filePath: string): string {
    // Remove dangerous characters
    return filePath
      .replace(/[<>:"|?*]/g, '_')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }
}

/**
 * Create security validator with options
 */
export const createSecurityValidator = (options?: Partial<SecurityOptions>): SecurityValidator => {
  const finalOptions = { ...DEFAULT_SECURITY_OPTIONS, ...options };
  return new TaskSecurityValidator(finalOptions);
};
