import { readFile } from 'fs/promises';
import * as path from 'path';
import type { Ignore } from 'ignore';

// Simple gitignore parser implementation
export class GitignoreParser {
  private patterns: string[] = [];
  private ignore: Ignore;

  constructor(gitignoreContent: string = '') {
    this.ignore = this.createIgnoreParser();
    if (gitignoreContent) {
      this.parse(gitignoreContent);
    }
  }

  private createIgnoreParser(): Ignore {
    // Simple implementation - in real scenario would use 'ignore' package
    const patterns: string[] = [];

    return {
      add: (pattern: string) => {
        patterns.push(pattern);
      },
      filter: (paths: string[]) => {
        return paths.filter((p) => !this.matches(p));
      },
      test: (path: string) => this.matches(path),
    } as Ignore;
  }

  private parse(content: string): void {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        this.patterns.push(trimmed);
        this.ignore.add(trimmed);
      }
    }
  }

  private matches(filePath: string): boolean {
    const relativePath = filePath.replace(/^\/+/, '');

    for (const pattern of this.patterns) {
      if (this.patternMatches(pattern, relativePath)) {
        return true;
      }
    }
    return false;
  }

  private patternMatches(pattern: string, filePath: string): boolean {
    // Simple glob matching - would use proper glob library in production
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
      return regex.test(filePath);
    }

    if (pattern.endsWith('/')) {
      return filePath.startsWith(pattern) || filePath.startsWith('/' + pattern);
    }

    return (
      filePath === pattern ||
      filePath.endsWith('/' + pattern) ||
      path.basename(filePath) === pattern
    );
  }

  static async fromFile(gitignorePath: string): Promise<GitignoreParser> {
    try {
      const content = await readFile(gitignorePath, 'utf-8');
      return new GitignoreParser(content);
    } catch {
      return new GitignoreParser();
    }
  }
}

export function isDotFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  return basename.startsWith('.') && basename.length > 1;
}

export function createDefaultIgnorePredicate(root: string): (filePath: string) => boolean {
  const gitignorePath = path.join(root, '.gitignore');
  let gitignoreParser: GitignoreParser;

  // Async initialization - for now use sync fallback
  try {
    const content = require('fs').readFileSync(gitignorePath, 'utf-8');
    gitignoreParser = new GitignoreParser(content);
  } catch {
    gitignoreParser = new GitignoreParser();
  }

  return (filePath: string) => {
    // Skip dotfiles
    if (isDotFile(filePath)) {
      return true;
    }

    // Skip common build/cache directories
    const segments = filePath.split(path.sep);
    for (const segment of segments) {
      if (
        ['node_modules', '.git', 'dist', 'build', 'coverage', '.cache', 'target'].includes(segment)
      ) {
        return true;
      }
    }

    // Check .gitignore patterns
    return gitignoreParser.matches(path.relative(root, filePath));
  };
}

export function getDefaultIgnoreDirs(): string[] {
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
  ];
}
