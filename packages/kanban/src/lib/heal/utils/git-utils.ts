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
  private readonly repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    console.warn('[kanban-dev] Git utils are DISABLED - no git operations will be performed');
  }

  /**
   * Get current repository state - DISABLED
   */
  async getCurrentState(): Promise<GitState> {
    console.warn('[kanban-dev] Git state retrieval skipped - functionality disabled');
    return {
      headSha: 'disabled',
      branch: 'main',
      isClean: true,
      modifiedFiles: [],
      untrackedFiles: [],
    };
  }

  /**
   * Add files to staging area - DISABLED
   */
  async addFiles(filePaths: string[]): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Git add skipped for ${filePaths.length} files - functionality disabled`,
    );
    return { success: true, data: 'Git functionality disabled' };
  }

  /**
   * Create a commit with message - DISABLED
   */
  async commit(message: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Git commit skipped for "${message}" - functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create a git tag - DISABLED
   */
  async createTag(tag: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Git tag creation skipped for ${tag} - functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Delete a git tag - DISABLED
   */
  async deleteTag(tag: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Git tag deletion skipped for ${tag} - functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Get commit SHA for a ref - DISABLED
   */
  async getCommitSha(ref: string): Promise<string | null> {
    console.warn(`[kanban-dev] Commit SHA retrieval skipped for ${ref} - functionality disabled`);
    return null;
  }

  /**
   * Get diff between two commits - DISABLED
   */
  async getDiff(fromRef: string, toRef: string = 'HEAD'): Promise<string> {
    console.warn(
      `[kanban-dev] Git diff retrieval skipped (${fromRef}..${toRef}) - functionality disabled`,
    );
    return '';
  }

  /**
   * Get files changed between two commits - DISABLED
   */
  async getChangedFiles(fromRef: string, toRef: string = 'HEAD'): Promise<string[]> {
    console.warn(
      `[kanban-dev] Changed files retrieval skipped (${fromRef}..${toRef}) - functionality disabled`,
    );
    return [];
  }

  /**
   * Get commit history - DISABLED
   */
  async getCommitHistory(): Promise<
    Array<{ sha: string; message: string; author: string; date: Date }>
  > {
    console.warn('[kanban-dev] Commit history retrieval skipped - functionality disabled');
    return [];
  }

  /**
   * Check if a ref exists - DISABLED
   */
  async refExists(ref: string): Promise<boolean> {
    console.warn(
      `[kanban-dev] Git ref existence check skipped for ${ref} - functionality disabled`,
    );
    return false;
  }

  /**
   * Reset to a specific commit - DISABLED
   */
  async reset(
    target: string,
    mode: 'soft' | 'mixed' | 'hard' = 'mixed',
  ): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Git reset skipped for ${target} (${mode}) - functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Stash current changes - DISABLED
   */
  async stash(): Promise<GitOperationResult> {
    console.warn('[kanban-dev] Git stash skipped - functionality disabled');
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Pop stashed changes - DISABLED
   */
  async stashPop(): Promise<GitOperationResult> {
    console.warn('[kanban-dev] Git stash pop skipped - functionality disabled');
    return { success: false, error: 'Git functionality disabled' };
  }
}

/**
 * Create a GitUtils instance - DISABLED
 */
export function createGitUtils(repoPath: string): GitUtils {
  console.warn(`[kanban-dev] Git utils creation skipped for ${repoPath} - functionality disabled`);
  return new GitUtils(repoPath);
}
