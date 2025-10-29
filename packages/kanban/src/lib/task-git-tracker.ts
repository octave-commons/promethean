/**
 * Task Git Tracker - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import path from 'node:path';

export interface TaskCommitEntry {
  sha: string;
  timestamp: Date;
  operation: 'create' | 'update' | 'delete';
  details: Record<string, unknown>;
}

/**
 * Task git tracker for kanban - DISABLED
 *
 * This class provides no-op implementations of all git tracking functionality.
 * All methods return safe default values and log warnings about disabled git operations.
 */
export class TaskGitTracker {
  private repoRoot: string;

  constructor(repoRoot: string) {
    this.repoRoot = repoRoot;

    console.warn(
      '[TaskGitTracker] Git functionality is disabled - no git operations will be performed',
    );
  }

  /**
   * Track task operation - DISABLED
   */
  async trackOperation(
    taskFilePath: string,
    operation: 'create' | 'update' | 'delete',
    details: Record<string, unknown>,
  ): Promise<void> {
    console.warn('[TaskGitTracker] trackOperation called but git is disabled');
  }

  /**
   * Get task commit history - DISABLED
   */
  async getTaskHistory(taskFilePath: string): Promise<TaskCommitEntry[]> {
    console.warn('[TaskGitTracker] getTaskHistory called but git is disabled');
    return [];
  }

  /**
   * Extract frontmatter from task content - DISABLED
   */
  extractFrontmatter(content: string): Record<string, unknown> {
    console.warn('[TaskGitTracker] extractFrontmatter called but git is disabled');
    return {};
  }

  /**
   * Validate task commit tracking - DISABLED
   */
  async validateTracking(taskFilePath: string): Promise<boolean> {
    console.warn('[TaskGitTracker] validateTracking called but git is disabled');
    return false;
  }
}

/**
 * Default task git tracker instance - DISABLED
 */
export const defaultTaskGitTracker = new TaskGitTracker(process.cwd());

/**
 * Update task commit tracking - DISABLED
 */
export async function updateTaskCommitTracking(
  taskFilePath: string,
  operation: 'create' | 'update' | 'delete',
  details: Record<string, unknown>,
): Promise<void> {
  console.warn('[updateTaskCommitTracking] Git functionality is disabled');
  await defaultTaskGitTracker.trackOperation(taskFilePath, operation, details);
}

/**
 * Validate task commit tracking - DISABLED
 */
export async function validateTaskCommitTracking(taskFilePath: string): Promise<boolean> {
  console.warn('[validateTaskCommitTracking] Git functionality is disabled');
  return await defaultTaskGitTracker.validateTracking(taskFilePath);
}

export default TaskGitTracker;
