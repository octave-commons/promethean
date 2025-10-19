/**
 * Task Git Tracker
 *
 * Provides git integration for tracking task changes with commit SHAs
 * to eliminate orphaned task problems and improve auditability.
 */

import { execSync } from 'node:child_process';

export interface TaskCommitEntry {
  sha: string;
  timestamp: string;
  message: string;
  author: string;
  type: 'create' | 'update' | 'status_change' | 'move';
}

export interface TaskGitTrackingOptions {
  repoRoot?: string;
  author?: string;
  autoCommit?: boolean;
}

/**
 * Tracks task changes with git commits for auditability
 */
export class TaskGitTracker {
  private readonly repoRoot: string;
  private readonly author: string;
  private readonly autoCommit: boolean;

  constructor(options: TaskGitTrackingOptions = {}) {
    this.repoRoot = options.repoRoot || process.cwd();
    this.author = options.author || this.getDefaultAuthor();
    this.autoCommit = options.autoCommit ?? true;
  }

  /**
   * Gets the current git HEAD SHA
   */
  getCurrentCommitSha(): string {
    try {
      return execSync('git rev-parse HEAD', {
        cwd: this.repoRoot,
        encoding: 'utf8',
      }).trim();
    } catch (error) {
      console.warn('Warning: Could not get current commit SHA:', error);
      return 'unknown';
    }
  }

  /**
   * Gets commit information for a specific SHA
   */
  getCommitInfo(sha: string): Omit<TaskCommitEntry, 'type'> | null {
    try {
      const output = execSync(`git show --format='%H|%s|%an|%ad' --date=iso ${sha}`, {
        cwd: this.repoRoot,
        encoding: 'utf8',
      }).trim();

      const parts = output.split('|');
      if (parts.length < 4) {
        return null;
      }

      const commitSha = parts[0];
      const message = parts[1];
      const author = parts[2];
      const timestamp = parts[3];

      if (!commitSha || !message || !author || !timestamp) {
        return null;
      }

      return {
        sha: commitSha.trim(),
        message: message.trim(),
        author: author.trim(),
        timestamp: timestamp.trim(),
      };
    } catch (error) {
      console.warn(`Warning: Could not get commit info for ${sha}:`, error);
      return null;
    }
  }

  /**
   * Creates a standardized commit message for task operations
   */
  createTaskCommitMessage(
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): string {
    const operationMap = {
      create: 'Create task',
      update: 'Update task',
      status_change: 'Change task status',
      move: 'Move task',
    };

    let message = `${operationMap[operation]}: ${taskUuid}`;

    if (details) {
      message += ` - ${details}`;
    }

    return message;
  }

  /**
   * Creates a commit entry for task tracking
   */
  createCommitEntry(
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): TaskCommitEntry {
    const sha = this.getCurrentCommitSha();
    const commitInfo = this.getCommitInfo(sha);

    if (commitInfo) {
      return {
        ...commitInfo,
        type: operation,
      };
    }

    // Fallback if we can't get commit info
    return {
      sha,
      timestamp: new Date().toISOString(),
      message: this.createTaskCommitMessage(taskUuid, operation, details),
      author: this.author,
      type: operation,
    };
  }

  /**
   * Updates task frontmatter with commit tracking information
   */
  updateTaskCommitTracking(
    frontmatter: Record<string, any>,
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): Record<string, any> {
    const commitEntry = this.createCommitEntry(taskUuid, operation, details);

    // Initialize commit history if it doesn't exist
    const commitHistory = frontmatter.commitHistory || [];

    // Add new commit entry
    const updatedCommitHistory = [...commitHistory, commitEntry];

    // Update last commit SHA
    const updatedFrontmatter = {
      ...frontmatter,
      lastCommitSha: commitEntry.sha,
      commitHistory: updatedCommitHistory,
    };

    return updatedFrontmatter;
  }

  /**
   * Commits task file changes with standardized message
   */
  async commitTaskChanges(
    taskFilePath: string,
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): Promise<{ success: boolean; sha?: string; error?: string }> {
    if (!this.autoCommit) {
      return { success: true };
    }

    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain', {
        cwd: this.repoRoot,
        encoding: 'utf8',
      }).trim();

      if (!status) {
        return { success: true, sha: this.getCurrentCommitSha() };
      }

      // Add the task file
      execSync(`git add "${taskFilePath}"`, {
        cwd: this.repoRoot,
      });

      // Create commit with standardized message
      const commitMessage = this.createTaskCommitMessage(taskUuid, operation, details);
      execSync(`git commit -m "${commitMessage}"`, {
        cwd: this.repoRoot,
      });

      const newSha = this.getCurrentCommitSha();
      return { success: true, sha: newSha };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Validates that a task has proper commit tracking
   */
  validateTaskCommitTracking(frontmatter: Record<string, any>): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check if lastCommitSha exists
    if (!frontmatter.lastCommitSha) {
      issues.push('Missing lastCommitSha field');
    }

    // Check if commitHistory exists and is valid
    if (!frontmatter.commitHistory) {
      issues.push('Missing commitHistory field');
    } else if (!Array.isArray(frontmatter.commitHistory)) {
      issues.push('commitHistory must be an array');
    } else {
      // Validate each commit entry
      frontmatter.commitHistory.forEach((entry: any, index: number) => {
        if (!entry || typeof entry !== 'object') {
          issues.push(`commitHistory[${index}] is not a valid object`);
          return;
        }

        if (!entry.sha || typeof entry.sha !== 'string') {
          issues.push(`commitHistory[${index}] missing or invalid sha`);
        }

        if (!entry.timestamp || typeof entry.timestamp !== 'string') {
          issues.push(`commitHistory[${index}] missing or invalid timestamp`);
        }

        if (!entry.message || typeof entry.message !== 'string') {
          issues.push(`commitHistory[${index}] missing or invalid message`);
        }

        if (!entry.author || typeof entry.author !== 'string') {
          issues.push(`commitHistory[${index}] missing or invalid author`);
        }

        if (!['create', 'update', 'status_change', 'move'].includes(entry.type)) {
          issues.push(`commitHistory[${index}] invalid type: ${entry.type}`);
        }
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Gets the default author from git config
   */
  private getDefaultAuthor(): string {
    try {
      const name = execSync('git config user.name', {
        cwd: this.repoRoot,
        encoding: 'utf8',
      }).trim();

      const email = execSync('git config user.email', {
        cwd: this.repoRoot,
        encoding: 'utf8',
      }).trim();

      return `${name} <${email}>`;
    } catch (error) {
      return 'Unknown <unknown@example.com>';
    }
  }

  /**
   * Checks if a task is "orphaned" (lacks proper commit tracking)
   */
  isTaskOrphaned(frontmatter: Record<string, any>): boolean {
    const validation = this.validateTaskCommitTracking(frontmatter);
    return !validation.isValid;
  }

  /**
   * Enhanced orphaned task detection that distinguishes between truly orphaned and untracked tasks
   */
  analyzeTaskStatus(
    frontmatter: Record<string, any>,
    taskFilePath?: string,
  ): {
    isTrulyOrphaned: boolean;
    isUntracked: boolean;
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const validation = this.validateTaskCommitTracking(frontmatter);
    const issues: string[] = [...validation.issues];
    const recommendations: string[] = [];

    // Check if task has basic required fields
    const hasBasicFields = frontmatter.uuid && frontmatter.title && frontmatter.status;

    // Check if task file exists in git history
    let fileExistsInGit = false;

    if (taskFilePath) {
      try {
        // Check if file is tracked by git
        const gitStatus = execSync(`git status --porcelain "${taskFilePath}"`, {
          cwd: this.repoRoot,
          encoding: 'utf8',
        }).trim();

        // If file is untracked or has unstaged changes, it's not truly orphaned
        fileExistsInGit = !gitStatus.startsWith('??');

        // Check for recent commits involving this task
        if (frontmatter.uuid) {
          const commitLog = execSync(
            `git log --oneline --grep="${frontmatter.uuid}" -n 5 --since="3 months ago"`,
            {
              cwd: this.repoRoot,
              encoding: 'utf8',
            },
          ).trim();
          // We could use hasRecentCommits here for additional analysis if needed
        }
      } catch (error) {
        // Git commands failed, assume file is not properly tracked
        fileExistsInGit = false;
      }
    }

    // Determine task status
    const isHealthy = validation.isValid && hasBasicFields;
    const isUntracked = !validation.isValid && hasBasicFields && fileExistsInGit;
    const isTrulyOrphaned = !validation.isValid && (!hasBasicFields || !fileExistsInGit);

    // Generate recommendations
    if (isUntracked) {
      recommendations.push('Task needs commit tracking initialization');
      recommendations.push('Run "pnpm kanban audit --fix" to add commit tracking');
    }

    if (isTrulyOrphaned) {
      if (!hasBasicFields) {
        recommendations.push('Task has missing required fields (uuid, title, or status)');
        recommendations.push('Consider deleting this task or adding missing fields');
      }
      if (!fileExistsInGit) {
        recommendations.push('Task file is not tracked by git');
        recommendations.push('Add file to git repository: git add <task-file>');
      }
    }

    return {
      isTrulyOrphaned,
      isUntracked,
      isHealthy,
      issues,
      recommendations,
    };
  }

  /**
   * Gets statistics about commit tracking across tasks
   */
  getCommitTrackingStats(tasks: Array<{ frontmatter?: Record<string, any> }>): {
    total: number;
    withCommitTracking: number;
    orphaned: number;
    orphanageRate: number;
  } {
    const total = tasks.length;
    let withCommitTracking = 0;

    for (const task of tasks) {
      const frontmatter = task.frontmatter || {};
      const validation = this.validateTaskCommitTracking(frontmatter);
      if (validation.isValid) {
        withCommitTracking++;
      }
    }

    const orphaned = total - withCommitTracking;
    const orphanageRate = total > 0 ? (orphaned / total) * 100 : 0;

    return {
      total,
      withCommitTracking,
      orphaned,
      orphanageRate,
    };
  }
}

/**
 * Default task git tracker instance
 */
export const defaultTaskGitTracker = new TaskGitTracker();

/**
 * Convenience function to update task commit tracking
 */
export function updateTaskCommitTracking(
  frontmatter: Record<string, any>,
  taskUuid: string,
  operation: 'create' | 'update' | 'status_change' | 'move',
  details?: string,
): Record<string, any> {
  return defaultTaskGitTracker.updateTaskCommitTracking(frontmatter, taskUuid, operation, details);
}

/**
 * Convenience function to validate task commit tracking
 */
export function validateTaskCommitTracking(frontmatter: Record<string, any>): {
  isValid: boolean;
  issues: string[];
} {
  return defaultTaskGitTracker.validateTaskCommitTracking(frontmatter);
}
