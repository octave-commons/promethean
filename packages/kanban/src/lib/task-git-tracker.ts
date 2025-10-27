/**
 * Task Git Tracker
 *
 * Provides read-only git integration for tracking task changes with commit SHAs
 * to eliminate orphaned task problems and improve auditability.
 *
 * NOTE: This tracker is READ-ONLY - it never creates commits, only detects them.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';

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
}

/**
 * Tracks task changes with read-only git commit detection for auditability
 */
export class TaskGitTracker {
  private readonly repoRoot: string;
  constructor(options: TaskGitTrackingOptions = {}) {
    this.repoRoot = options.repoRoot || process.cwd();
  }

  /**
   * Gets current git HEAD SHA
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
   * Gets the last commit that modified a specific file
   */
  getLastCommitForFile(filePath: string): TaskCommitEntry | null {
    try {
      // Check if file is outside repository - if so, return null gracefully
      const resolvedPath = path.resolve(filePath);
      const repoRootPath = path.resolve(this.repoRoot);

      if (!resolvedPath.startsWith(repoRootPath)) {
        // File is outside the git repository
        return null;
      }

      const output = execSync(`git log --format='%H|%s|%an|%ad' --date=iso -n 1 -- "${filePath}"`, {
        cwd: this.repoRoot,
        encoding: 'utf8',
      }).trim();

      if (!output) {
        return null;
      }

      const parts = output.split('|');
      if (parts.length < 4) {
        return null;
      }

      const sha = parts[0];
      const message = parts[1];
      const author = parts[2];
      const timestamp = parts[3];

      if (!sha || !message || !author || !timestamp) {
        return null;
      }

      // Determine operation type from commit message
      let type: TaskCommitEntry['type'] = 'update';
      if (message.includes('Create task')) {
        type = 'create';
      } else if (message.includes('Change task status')) {
        type = 'status_change';
      } else if (message.includes('Move task')) {
        type = 'move';
      }

      return {
        sha: sha.trim(),
        message: message.trim(),
        author: author.trim(),
        timestamp: timestamp.trim(),
        type,
      };
    } catch (error) {
      console.warn(`Warning: Could not get last commit for ${filePath}:`, error);
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
   * Updates task frontmatter with commit tracking information (read-only)
   */
  updateTaskCommitTracking(
    frontmatter: Record<string, any>,
    taskFilePath: string,
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): Record<string, any> {
    // Get the last commit that actually modified this file
    const lastCommit = this.getLastCommitForFile(taskFilePath);

    if (!lastCommit) {
      // File might not be in git yet, return unchanged
      return frontmatter;
    }

    // Initialize commit history if it doesn't exist
    const commitHistory = frontmatter.commitHistory || [];

    // Check if this commit entry already exists to avoid duplicates
    const lastEntry = commitHistory[commitHistory.length - 1];
    if (lastEntry && lastEntry.sha === lastCommit.sha) {
      // Same commit already tracked, don't add duplicate
      return frontmatter;
    }

    // Add new commit entry with operation details
    const commitEntry = {
      ...lastCommit,
      taskUuid,
      operation,
      details: details || `${operation} operation`,
    };

    const updatedCommitHistory = [...commitHistory, commitEntry];

    // Update last commit SHA
    const updatedFrontmatter = {
      ...frontmatter,
      lastCommitSha: lastCommit.sha,
      commitHistory: updatedCommitHistory,
    };

    return updatedFrontmatter;
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
   * Gets default author from git config
   */

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
          try {
            const commitLog = execSync(
              `git log --oneline --grep="${frontmatter.uuid}" -n 5 --since="3 months ago"`,
              {
                cwd: this.repoRoot,
                encoding: 'utf8',
              },
            ).trim();

            // If there are recent commits, task is likely active
            if (commitLog) {
              // Task has recent activity, which is a good sign
            }
          } catch (error) {
            // No recent commits found, which is fine
          }
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
      recommendations.push(
        'Commit tracking will be updated automatically on next kanban operation',
      );
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
  taskFilePath: string,
  taskUuid: string,
  operation: 'create' | 'update' | 'status_change' | 'move',
  details?: string,
): Record<string, any> {
  return defaultTaskGitTracker.updateTaskCommitTracking(
    frontmatter,
    taskFilePath,
    taskUuid,
    operation,
    details,
  );
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
