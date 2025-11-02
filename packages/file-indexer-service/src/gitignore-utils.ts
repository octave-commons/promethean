import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Default patterns to ignore for developer tools
 */
export const DEFAULT_IGNORE_PATTERNS = [
  // Dotfiles and directories
  '.*',

  // Common build/cache directories
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  '.output',

  // Cache directories
  '.cache',
  '.tmp',
  'tmp',
  '.temp',
  'temp',

  // Log files
  '*.log',
  'logs',

  // OS files
  '.DS_Store',
  'Thumbs.db',

  // IDE files
  '.vscode',
  '.idea',
  '*.swp',
  '*.swo',

  // Dependency lock files (usually not needed for content scanning)
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
] as const;

/**
 * Get default ignore patterns for developer tools
 */
export function getDefaultIgnorePatterns(): readonly string[] {
  return [...DEFAULT_IGNORE_PATTERNS];
}

/**
 * Check if a file should be ignored based on default patterns
 */
export function shouldIgnoreFile(filePath: string, patterns: readonly string[]): boolean {
  const fileName = filePath.split('/').pop() || filePath;

  return patterns.some((pattern) => {
    // Simple glob matching for common patterns
    if (pattern.startsWith('*')) {
      const suffix = pattern.slice(1);
      return fileName.endsWith(suffix);
    }

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return fileName.startsWith(prefix);
    }

    // Exact match or directory match
    return (
      fileName === pattern || filePath.includes(`/${pattern}/`) || filePath.endsWith(`/${pattern}`)
    );
  });
}

/**
 * Try to read .gitignore patterns from a directory
 */
export async function readGitignorePatterns(rootDir: string): Promise<string[]> {
  const gitignorePath = join(rootDir, '.gitignore');

  if (!existsSync(gitignorePath)) {
    return [];
  }

  try {
    const content = await readFile(gitignorePath, 'utf-8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
  } catch {
    return [];
  }
}
