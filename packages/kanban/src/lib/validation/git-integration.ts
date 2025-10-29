/**
 * Git Integration for P0 Security Validation - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

/**
 * Git commit information - DISABLED VERSION
 */
export interface GitCommitInfo {
  sha: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
}

/**
 * Git validation options - DISABLED VERSION
 */
export interface GitValidationOptions {
  taskUuid?: string;
  taskTitle?: string;
  filePaths?: string[];
  since?: string;
  until?: string;
}

/**
 * Validates git requirements for P0 security tasks - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitValidator {
  private readonly repoRoot: string;

  constructor(repoRoot: string = process.cwd()) {
    this.repoRoot = repoRoot;
    console.warn('[kanban-dev] Git validator is DISABLED - no git operations will be performed');
  }

  /**
   * Checks if there are committed code changes for a task - DISABLED
   */
  async hasCodeChanges(): Promise<boolean> {
    console.warn('[kanban-dev] Code changes check skipped - git functionality disabled');
    return false;
  }

  /**
   * Gets commits related to a specific task - DISABLED
   */
  async getTaskCommits(): Promise<GitCommitInfo[]> {
    console.warn('[kanban-dev] Task commits retrieval skipped - git functionality disabled');
    return [];
  }

  /**
   * Filters commits to find those relevant to a specific task - DISABLED
   */
  private filterRelevantCommits(): GitCommitInfo[] {
    console.warn('[kanban-dev] Commit filtering skipped - git functionality disabled');
    return [];
  }

  /**
   * Gets file changes for a specific commit - DISABLED
   */
  async getCommitFiles(): Promise<string[]> {
    console.warn('[kanban-dev] Commit files retrieval skipped - git functionality disabled');
    return [];
  }

  /**
   * Checks if commits include security-related file changes - DISABLED
   */
  async hasSecurityFileChanges(): Promise<boolean> {
    console.warn('[kanban-dev] Security file changes check skipped - git functionality disabled');
    return false;
  }

  /**
   * Gets repository information - DISABLED
   */
  async getRepoInfo(): Promise<{
    branch: string;
    remote?: string;
    lastCommit?: string;
    isClean: boolean;
  }> {
    console.warn('[kanban-dev] Repository info retrieval skipped - git functionality disabled');
    return {
      branch: 'main',
      isClean: true,
    };
  }

  /**
   * Validates that the repository is in a good state for P0 validation - DISABLED
   */
  async validateRepoState(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    console.warn('[kanban-dev] Repository state validation skipped - git functionality disabled');
    return {
      valid: true, // Always valid when git is disabled
      errors: [],
      warnings: ['Git functionality is disabled'],
    };
  }
}

/**
 * Default git validator instance - DISABLED
 */
export const defaultGitValidator = new GitValidator();

/**
 * Convenience function to check for task-related code changes - DISABLED
 */
export async function hasTaskCodeChanges(): Promise<boolean> {
  console.warn('[kanban-dev] Task code changes check skipped - git functionality disabled');
  return false;
}

/**
 * Convenience function to get task-related commits - DISABLED
 */
export async function getTaskCommits(): Promise<GitCommitInfo[]> {
  console.warn('[kanban-dev] Task commits retrieval skipped - git functionality disabled');
  return [];
}
