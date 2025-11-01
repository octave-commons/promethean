import { readFile } from 'fs/promises';
import * as path from 'path';

export function isDotFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  return basename.startsWith('.') && basename.length > 1;
}

export function getDefaultIgnoreDirs(): readonly string[] {
  return [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.cache',
    'target',
    '.vscode',
    '.idea',
    '*.log',
    '.env*',
    '.DS_Store',
    'tmp',
    'temp',
    '.pytest_cache',
    '__pycache__',
    '.next',
    '.nuxt',
    '.output',
    '.vercel',
  ] as const;
}

export async function parseGitignore(gitignorePath: string): Promise<string[]> {
  try {
    const content = await readFile(gitignorePath, 'utf-8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  } catch {
    return [];
  }
}

export function createDefaultIgnorePredicate(root: string): (filePath: string) => Promise<boolean> {
  const defaultIgnores = getDefaultIgnoreDirs();
  let gitignorePatterns: string[] = [];

  // Load .gitignore asynchronously
  parseGitignore(path.join(root, '.gitignore'))
    .then((patterns) => {
      gitignorePatterns = patterns;
    })
    .catch(() => {
      // Ignore .gitignore parsing errors
    });

  return async (filePath: string): Promise<boolean> => {
    const relativePath = path.relative(root, filePath);

    // Skip dotfiles
    if (isDotFile(relativePath)) {
      return true;
    }

    // Skip common build/cache directories
    const segments = relativePath.split(path.sep);
    for (const segment of segments) {
      if (defaultIgnores.includes(segment)) {
        return true;
      }
    }

    // Check .gitignore patterns (simple matching)
    for (const pattern of gitignorePatterns) {
      if (patternMatches(pattern, relativePath)) {
        return true;
      }
    }

    return false;
  };
}

function patternMatches(pattern: string, filePath: string): boolean {
  // Simple glob matching for common patterns
  if (pattern.includes('*')) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
    return regex.test(filePath);
  }

  if (pattern.endsWith('/')) {
    return filePath.startsWith(pattern) || filePath.startsWith('/' + pattern);
  }

  return (
    filePath === pattern || filePath.endsWith('/' + pattern) || path.basename(filePath) === pattern
  );
}
