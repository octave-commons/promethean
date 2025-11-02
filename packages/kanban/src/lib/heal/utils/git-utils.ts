/**
 * Git utility functions for heal command workflow - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

/**
 * Git repository state information - DISABLED VERSION
 */
export interface GitState {
  headSha: string;
  branch: string;
  isClean: boolean;
  modifiedFiles: string[];
  untrackedFiles: string[];
}

/**
 * Git operation result - DISABLED VERSION
 */
export interface GitOperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Git utilities class - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitUtils {
  constructor(_repoPath: string) {
    console.warn('[GitUtils] Git functionality is disabled');
  }

  /**
   * Get current repository state - DISABLED
   */
  async getCurrentState(): Promise<GitState> {
    console.warn('[GitUtils] getCurrentState called but git is disabled');
    return {
      headSha: 'disabled',
      branch: 'main',
      isClean: true,
      modifiedFiles: [],
      untrackedFiles: [],
    };
  }

  /**
   * Add files to git - DISABLED
   */
  async addFiles(_filePaths: string[]): Promise<GitOperationResult> {
    console.warn('[GitUtils] addFiles called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Commit changes - DISABLED
   */
  async commit(_message: string): Promise<GitOperationResult> {
    console.warn('[GitUtils] commit called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Create a git tag - DISABLED
   */
  async createTag(_tag: string): Promise<GitOperationResult> {
    console.warn('[GitUtils] createTag called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Delete a git tag - DISABLED
   */
  async deleteTag(_tag: string): Promise<GitOperationResult> {
    console.warn('[GitUtils] deleteTag called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Get commit SHA for ref - DISABLED
   */
  async getCommitSha(_ref: string): Promise<string | null> {
    console.warn('[GitUtils] getCommitSha called but git is disabled');
    return null;
  }

  /**
   * Get diff between commits - DISABLED
   */
  async getDiff(_fromRef: string, _toRef: string): Promise<string> {
    console.warn('[GitUtils] getDiff called but git is disabled');
    return '';
  }

  /**
   * Get changed files between commits - DISABLED
   */
  async getChangedFiles(_fromRef: string, _toRef: string): Promise<string[]> {
    console.warn('[GitUtils] getChangedFiles called but git is disabled');
    return [];
  }

  /**
   * Get commit history - DISABLED
   */
  async getCommitHistory(
    _fromRef?: string,
    _toRef?: string,
  ): Promise<{ sha: string; message: string; author: string; date: Date }[]> {
    console.warn('[GitUtils] getCommitHistory called but git is disabled');
    return [];
  }

  /**
   * Check if ref exists - DISABLED
   */
  async refExists(_ref: string): Promise<boolean> {
    console.warn('[GitUtils] refExists called but git is disabled');
    return false;
  }

  /**
   * Reset to specific commit - DISABLED
   */
  async reset(
    _target: string,
    _mode: 'soft' | 'mixed' | 'hard' = 'mixed',
  ): Promise<GitOperationResult> {
    console.warn('[GitUtils] reset called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Stash changes - DISABLED
   */
  async stash(): Promise<GitOperationResult> {
    console.warn('[GitUtils] stash called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }

  /**
   * Pop stashed changes - DISABLED
   */
  async stashPop(): Promise<GitOperationResult> {
    console.warn('[GitUtils] stashPop called but git is disabled');
    return {
      success: false,
      error: 'Git functionality is disabled',
    };
  }
}
