/**
 * Git utility functions for the heal command workflow
 * Provides low-level git operations with proper error handling
 */

import { execSync } from 'node:child_process';

/**
 * Git repository state information
 */
export interface GitState {
  /** Current HEAD commit SHA */
  headSha: string;
  /** Current branch name */
  branch: string;
  /** Whether working directory is clean */
  isClean: boolean;
  /** List of modified files */
  modifiedFiles: string[];
  /** List of untracked files */
  untrackedFiles: string[];
}

/**
 * Git operation result
 */
export interface GitOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Result data (varies by operation) */
  data?: any;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Git utilities class
 */
export class GitUtils {
  private readonly repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  /**
   * Get current repository state
   */
  async getCurrentState(): Promise<GitState> {
    try {
      const headSha = this.execGit('rev-parse HEAD').trim();
      const branch = this.execGit('rev-parse --abbrev-ref HEAD').trim();
      const statusOutput = this.execGit('status --porcelain');

      const modifiedFiles: string[] = [];
      const untrackedFiles: string[] = [];

      const lines = statusOutput.split('\n');
      for (const line of lines) {
        if (line.trim().length === 0) continue;

        const status = line.substring(0, 2);
        const filePath = line.substring(3);

        if (status.includes('M') || status.includes('A') || status.includes('D')) {
          modifiedFiles.push(filePath);
        } else if (status === '??') {
          untrackedFiles.push(filePath);
        }
      }

      return {
        headSha,
        branch,
        isClean: modifiedFiles.length === 0 && untrackedFiles.length === 0,
        modifiedFiles,
        untrackedFiles,
      };
    } catch (error) {
      throw new Error(`Failed to get git state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Add files to staging area
   */
  async addFiles(filePaths: string[]): Promise<GitOperationResult> {
    try {
      if (filePaths.length === 0) {
        return { success: true, data: 'No files to add' };
      }

      const paths = filePaths.map((path) => `"${path.replace(/"/g, '\\"')}"`).join(' ');
      const output = this.execGit(`add ${paths}`);

      return { success: true, data: output };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add files: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create a commit with message
   */
  async commit(message: string, allowEmpty = false): Promise<GitOperationResult> {
    try {
      const emptyFlag = allowEmpty ? '--allow-empty' : '';
      const escapedMessage = message.replace(/"/g, '\\"');
      const output = this.execGit(`commit ${emptyFlag} -m "${escapedMessage}"`);

      // Extract the new commit SHA
      const sha = this.execGit('rev-parse HEAD').trim();

      return { success: true, data: { output, sha } };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create commit: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create a git tag
   */
  async createTag(tag: string, target?: string, message?: string): Promise<GitOperationResult> {
    try {
      const targetRef = target || 'HEAD';
      let command = `tag ${tag} ${targetRef}`;

      if (message) {
        const escapedMessage = message.replace(/"/g, '\\"');
        command += ` -a -m "${escapedMessage}"`;
      }

      const output = this.execGit(command);

      return { success: true, data: output };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create tag: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Delete a git tag
   */
  async deleteTag(tag: string): Promise<GitOperationResult> {
    try {
      const output = this.execGit(`tag -d ${tag}`);
      return { success: true, data: output };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete tag: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get commit SHA for a ref
   */
  async getCommitSha(ref: string): Promise<string | null> {
    try {
      const sha = this.execGit(`rev-parse ${ref}`).trim();
      return sha;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get diff between two commits
   */
  async getDiff(fromRef: string, toRef: string = 'HEAD'): Promise<string> {
    try {
      return this.execGit(`diff ${fromRef}..${toRef}`);
    } catch (error) {
      throw new Error(`Failed to get diff: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get files changed between two commits
   */
  async getChangedFiles(fromRef: string, toRef: string = 'HEAD'): Promise<string[]> {
    try {
      const output = this.execGit(`diff --name-only ${fromRef}..${toRef}`);
      return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(
    fromRef?: string,
    toRef: string = 'HEAD',
    limit?: number,
  ): Promise<Array<{ sha: string; message: string; author: string; date: Date }>> {
    try {
      const range = fromRef ? `${fromRef}..${toRef}` : toRef;
      const limitFlag = limit ? `-${limit}` : '';
      const output = this.execGit(`log ${limitFlag} --format="%H|%an|%ai|%s" ${range}`);

      const commits: Array<{ sha: string; message: string; author: string; date: Date }> = [];
      const lines = output.split('\n');

      for (const line of lines) {
        if (line.trim().length === 0) continue;

        const [sha, author, dateStr, ...messageParts] = line.split('|');
        const message = messageParts.join('|');

        if (sha && author && dateStr) {
          commits.push({
            sha,
            author,
            date: new Date(dateStr),
            message: message || '',
          });
        }
      }

      return commits;
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if a ref exists
   */
  async refExists(ref: string): Promise<boolean> {
    try {
      this.execGit(`rev-parse --verify ${ref}`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Reset to a specific commit
   */
  async reset(target: string, mode: 'soft' | 'mixed' | 'hard' = 'mixed'): Promise<GitOperationResult> {
    try {
      const output = this.execGit(`reset --${mode} ${target}`);
      return { success: true, data: output };
    } catch (error) {
      return {
        success: false,
        error: `Failed to reset: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Stash current changes
   */
  async stash(message?: string): Promise<GitOperationResult> {
    try {
      const messageFlag = message ? ` -m "${message.replace(/"/g, '\\"')}"` : '';
      const output = this.execGit(`stash push${messageFlag}`);
      return { success: true, data: output };
    } catch (error) {
      return {
        success: false,
        error: `Failed to stash: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Pop stashed changes
   */
  async stashPop(): Promise<GitOperationResult> {
    try {
      const output = this.execGit('stash pop');
      return { success: true, data: output };
    } catch (error) {
      return {
        success: false,
        error: `Failed to stash pop: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Execute a git command with proper error handling
   */
  private execGit(command: string, options: { stdio?: 'ignore' | 'pipe' } = {}): string {
    try {
      const stdio = options.stdio || 'pipe';
      return execSync(`git ${command}`, {
        cwd: this.repoPath,
        encoding: 'utf8',
        stdio,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      });
    } catch (error) {
      if (stdio === 'ignore') {
        throw error;
      }
      throw new Error(`Git command failed: git ${command} - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Create a GitUtils instance
 */
export function createGitUtils(repoPath: string): GitUtils {
  return new GitUtils(repoPath);
}