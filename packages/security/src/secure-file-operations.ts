import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { validatePath, PathSecurityConfig } from './path-validation.js';

/**
 * Secure file operation options
 */
export interface SecureFileOptions extends PathSecurityConfig {
  /** Whether to create parent directories if they don't exist */
  createParents?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** File permissions (octal) */
  mode?: number;
}

/**
 * Result of secure file operations
 */
export interface SecureFileResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Absolute path of the operated file */
  absolutePath?: string;
  /** Relative path from root */
  relativePath?: string;
  /** Error message if operation failed */
  error?: string;
  /** Additional metadata */
  metadata?: {
    size?: number;
    created?: boolean;
    modified?: boolean;
  };
}

/**
 * Securely reads a file within a root directory
 */
export async function secureReadFile(
  rootPath: string,
  filePath: string,
  options: SecureFileOptions = {},
): Promise<SecureFileResult & { content?: string }> {
  try {
    const validation = await validatePath(rootPath, filePath, options);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const content = await fs.readFile(validation.normalizedPath!, 'utf8');
    const stats = await fs.stat(validation.normalizedPath!);

    return {
      success: true,
      absolutePath: validation.normalizedPath,
      relativePath: validation.relativePath,
      content,
      metadata: {
        size: stats.size,
        created: false,
        modified: false,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Read operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Securely writes a file within a root directory
 */
export async function secureWriteFile(
  rootPath: string,
  filePath: string,
  content: string,
  options: SecureFileOptions = {},
): Promise<SecureFileResult> {
  try {
    const validation = await validatePath(rootPath, filePath, options);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const absolutePath = validation.normalizedPath!;
    const relativePath = validation.relativePath!;

    // Check if file exists and overwrite is disabled
    if (!options.overwrite) {
      try {
        await fs.access(absolutePath);
        return {
          success: false,
          error: 'File already exists and overwrite is disabled',
        };
      } catch {
        // File doesn't exist, which is what we want
      }
    }

    // Create parent directories if needed
    if (options.createParents) {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    }

    // Write the file with specified permissions
    await fs.writeFile(absolutePath, content, {
      encoding: 'utf8',
      mode: options.mode,
    });

    const stats = await fs.stat(absolutePath);

    return {
      success: true,
      absolutePath,
      relativePath,
      metadata: {
        size: stats.size,
        created: !options.overwrite,
        modified: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Write operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Securely appends content to a file within a root directory
 */
export async function secureAppendFile(
  rootPath: string,
  filePath: string,
  content: string,
  options: SecureFileOptions = {},
): Promise<SecureFileResult> {
  try {
    const validation = await validatePath(rootPath, filePath, options);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const absolutePath = validation.normalizedPath!;
    const relativePath = validation.relativePath!;

    // Create parent directories if needed
    if (options.createParents) {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    }

    // Append to the file
    await fs.appendFile(absolutePath, content, {
      encoding: 'utf8',
      mode: options.mode,
    });

    const stats = await fs.stat(absolutePath);

    return {
      success: true,
      absolutePath,
      relativePath,
      metadata: {
        size: stats.size,
        created: false,
        modified: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Append operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Securely deletes a file within a root directory
 */
export async function secureDeleteFile(
  rootPath: string,
  filePath: string,
  options: SecureFileOptions = {},
): Promise<SecureFileResult> {
  try {
    const validation = await validatePath(rootPath, filePath, options);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const absolutePath = validation.normalizedPath!;
    const relativePath = validation.relativePath!;

    // Check if file exists
    try {
      const stats = await fs.stat(absolutePath);
      if (stats.isDirectory()) {
        return {
          success: false,
          error: 'Path points to a directory, not a file',
        };
      }
    } catch {
      return {
        success: false,
        error: 'File does not exist',
      };
    }

    await fs.unlink(absolutePath);

    return {
      success: true,
      absolutePath,
      relativePath,
      metadata: {
        created: false,
        modified: false,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Delete operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Securely lists directory contents within a root directory
 */
export async function secureListDirectory(
  rootPath: string,
  dirPath: string,
  options: SecureFileOptions & { includeHidden?: boolean } = {},
): Promise<
  SecureFileResult & {
    entries?: Array<{ name: string; path: string; type: 'file' | 'directory'; size?: number }>;
  }
> {
  try {
    const validation = await validatePath(rootPath, dirPath, options);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const absolutePath = validation.normalizedPath!;
    const relativePath = validation.relativePath!;

    // Check if path is a directory
    const stats = await fs.stat(absolutePath);
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: 'Path is not a directory',
      };
    }

    const entries = await fs.readdir(absolutePath, { withFileTypes: true });
    const processedEntries = entries
      .filter((entry) => options.includeHidden || !entry.name.startsWith('.'))
      .map((entry) => ({
        name: entry.name,
        path: path.join(relativePath, entry.name).replace(/\\/g, '/'),
        type: entry.isDirectory() ? ('directory' as const) : ('file' as const),
        size: entry.isFile() ? undefined : undefined, // Would need additional stat call
      }));

    return {
      success: true,
      absolutePath,
      relativePath,
      entries: processedEntries,
    };
  } catch (error) {
    return {
      success: false,
      error: `List directory operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Securely creates a directory within a root directory
 */
export async function secureCreateDirectory(
  rootPath: string,
  dirPath: string,
  options: SecureFileOptions = {},
): Promise<SecureFileResult> {
  try {
    const validation = await validatePath(rootPath, dirPath, options);

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const absolutePath = validation.normalizedPath!;
    const relativePath = validation.relativePath!;

    // Check if directory already exists
    try {
      const stats = await fs.stat(absolutePath);
      if (stats.isDirectory()) {
        return {
          success: true,
          absolutePath,
          relativePath,
          metadata: {
            created: false,
            modified: false,
          },
        };
      } else {
        return {
          success: false,
          error: 'Path exists but is not a directory',
        };
      }
    } catch {
      // Directory doesn't exist, create it
    }

    await fs.mkdir(absolutePath, {
      recursive: true,
      mode: options.mode,
    });

    return {
      success: true,
      absolutePath,
      relativePath,
      metadata: {
        created: true,
        modified: false,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Create directory operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Securely copies a file within a root directory
 */
export async function secureCopyFile(
  rootPath: string,
  sourcePath: string,
  destPath: string,
  options: SecureFileOptions = {},
): Promise<SecureFileResult> {
  try {
    // Validate both source and destination paths
    const sourceValidation = await validatePath(rootPath, sourcePath, options);
    const destValidation = await validatePath(rootPath, destPath, options);

    if (!sourceValidation.isValid) {
      return {
        success: false,
        error: `Source path validation failed: ${sourceValidation.error}`,
      };
    }

    if (!destValidation.isValid) {
      return {
        success: false,
        error: `Destination path validation failed: ${destValidation.error}`,
      };
    }

    const sourceAbsolute = sourceValidation.normalizedPath!;
    const destAbsolute = destValidation.normalizedPath!;
    const destRelative = destValidation.relativePath!;

    // Check if source exists and is a file
    const sourceStats = await fs.stat(sourceAbsolute);
    if (!sourceStats.isFile()) {
      return {
        success: false,
        error: 'Source path is not a file',
      };
    }

    // Create parent directories for destination if needed
    if (options.createParents) {
      await fs.mkdir(path.dirname(destAbsolute), { recursive: true });
    }

    // Check if destination exists and overwrite is disabled
    if (!options.overwrite) {
      try {
        await fs.access(destAbsolute);
        return {
          success: false,
          error: 'Destination file already exists and overwrite is disabled',
        };
      } catch {
        // File doesn't exist, which is what we want
      }
    }

    await fs.copyFile(sourceAbsolute, destAbsolute);

    const destStats = await fs.stat(destAbsolute);

    return {
      success: true,
      absolutePath: destAbsolute,
      relativePath: destRelative,
      metadata: {
        size: destStats.size,
        created: !options.overwrite,
        modified: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Copy operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Securely moves a file within a root directory
 */
export async function secureMoveFile(
  rootPath: string,
  sourcePath: string,
  destPath: string,
  options: SecureFileOptions = {},
): Promise<SecureFileResult> {
  try {
    // First try to copy the file
    const copyResult = await secureCopyFile(rootPath, sourcePath, destPath, options);

    if (!copyResult.success) {
      return copyResult;
    }

    // If copy succeeded, delete the source
    const deleteResult = await secureDeleteFile(rootPath, sourcePath, options);

    if (!deleteResult.success) {
      // Try to clean up the copied file
      try {
        await fs.unlink(copyResult.absolutePath!);
      } catch {
        // Ignore cleanup errors
      }
      return {
        success: false,
        error: `Move operation failed: could not delete source file - ${deleteResult.error}`,
      };
    }

    return copyResult;
  } catch (error) {
    return {
      success: false,
      error: `Move operation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Batch secure file operations
 */
export async function secureBatchOperation<T>(
  operations: Array<() => Promise<T>>,
  options: { continueOnError?: boolean } = {},
): Promise<{ results: T[]; errors: string[] }> {
  const results: T[] = [];
  const errors: string[] = [];

  for (const operation of operations) {
    try {
      const result = await operation();
      results.push(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);

      if (!options.continueOnError) {
        break;
      }
    }
  }

  return { results, errors };
}
