/**
 * Task Git Tracker - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

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
 * Tracks task changes with read-only git commit detection for auditability - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class TaskGitTracker {
  private readonly repoRoot: string;
  
  constructor(options: TaskGitTrackingOptions = {}) {
    this.repoRoot = options.repoRoot || process.cwd();
    console.warn('[kanban-dev] Task git tracker is DISABLED - no git operations will be performed');
  }

  /**
   * Gets current git HEAD SHA - DISABLED
   */
  getCurrentCommitSha(): string {
    console.warn('[kanban-dev] Current commit SHA retrieval skipped - git functionality disabled');
    return 'disabled';
  }

  /**
   * Gets last commit that modified a specific file - DISABLED
   */
  getLastCommitForFile(filePath: string): TaskCommitEntry | null {
    console.warn(`[kanban-dev] Last commit retrieval skipped for ${path.basename(filePath)} - git functionality disabled`);
    return null;
  }

  /**
   * Creates a standardized commit message for task operations - DISABLED
   */
  createTaskCommitMessage(
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): string {
    console.warn(`[kanban-dev] Commit message creation skipped for ${taskUuid} - git functionality disabled`);
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
   * Updates task frontmatter with commit tracking information (read-only) - DISABLED
   */
  updateTaskCommitTracking(
    frontmatter: Record<string, any>,
    taskFilePath: string,
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): Record<string, any> {
    console.warn(`[kanban-dev] Task commit tracking update skipped for ${taskUuid} - git functionality disabled`);
    return frontmatter;
  }

  /**
   * Validates that a task has proper commit tracking - DISABLED
   */
  validateTaskCommitTracking(frontmatter: Record<string, any>): {
    isValid: boolean;
    issues: string[];
  } {
    console.warn('[kanban-dev] Task commit tracking validation skipped - git functionality disabled');
    return {
      isValid: true, // Always valid when git is disabled
      issues: [],
    };
  }

  /**
   * Checks if a task is "orphaned" (lacks proper commit tracking) - DISABLED
   */
  isTaskOrphaned(frontmatter: Record<string, any>): boolean {
    console.warn('[kanban-dev] Orphaned task check skipped - git functionality disabled');
    return false; // Never orphaned when git is disabled
  }

  /**
   * Enhanced orphaned task detection - DISABLED
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
    console.warn('[kanban-dev] Task status analysis skipped - git functionality disabled');
    
    // Check if task has basic required fields
    const hasBasicFields = frontmatter.uuid && frontmatter.title && frontmatter.status;
    
    return {
      isTrulyOrphaned: !hasBasicFields,
      isUntracked: false,
      isHealthy: hasBasicFields,
      issues: hasBasicFields ? [] : ['Missing required fields (uuid, title, or status)'],
      recommendations: hasBasicFields ? [] : ['Add missing required fields to task'],
    };
  }

  /**
   * Gets statistics about commit tracking across tasks - DISABLED
   */
  getCommitTrackingStats(tasks: Array<{ frontmatter?: Record<string, any> }>): {
    total: number;
    withCommitTracking: number;
    orphaned: number;
    orphanageRate: number;
  } {
    console.warn('[kanban-dev] Commit tracking statistics skipped - git functionality disabled');
    const total = tasks.length;
    
    return {
      total,
      withCommitTracking: total, // All tasks considered tracked when git is disabled
      orphaned: 0,
      orphanageRate: 0,
    };
  }
}

/**
 * Default task git tracker instance - DISABLED
 */
export const defaultTaskGitTracker = new TaskGitTracker();

/**
 * Convenience function to update task commit tracking - DISABLED
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
 * Convenience function to validate task commit tracking - DISABLED
 */
export function validateTaskCommitTracking(frontmatter: Record<string, any>): {
  isValid: boolean;
  issues: string[];
} {
  return defaultTaskGitTracker.validateTaskCommitTracking(frontmatter);
}/**
 * Task Git Tracker - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

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
 * Tracks task changes with read-only git commit detection for auditability - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class TaskGitTracker {
  private readonly repoRoot: string;
  
  constructor(options: TaskGitTrackingOptions = {}) {
    this.repoRoot = options.repoRoot || process.cwd();
    console.warn('[kanban-dev] Task git tracker is DISABLED - no git operations will be performed');
  }

  /**
   * Gets current git HEAD SHA - DISABLED
   */
  getCurrentCommitSha(): string {
    console.warn('[kanban-dev] Current commit SHA retrieval skipped - git functionality disabled');
    return 'disabled';
  }

  /**
   * Gets last commit that modified a specific file - DISABLED
   */
  getLastCommitForFile(filePath: string): TaskCommitEntry | null {
    console.warn(`[kanban-dev] Last commit retrieval skipped for ${path.basename(filePath)} - git functionality disabled`);
    return null;
  }

  /**
   * Creates a standardized commit message for task operations - DISABLED
   */
  createTaskCommitMessage(
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): string {
    console.warn(`[kanban-dev] Commit message creation skipped for ${taskUuid} - git functionality disabled`);
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
   * Updates task frontmatter with commit tracking information (read-only) - DISABLED
   */
  updateTaskCommitTracking(
    frontmatter: Record<string, any>,
    taskFilePath: string,
    taskUuid: string,
    operation: 'create' | 'update' | 'status_change' | 'move',
    details?: string,
  ): Record<string, any> {
    console.warn(`[kanban-dev] Task commit tracking update skipped for ${taskUuid} - git functionality disabled`);
    return frontmatter;
  }

  /**
   * Validates that a task has proper commit tracking - DISABLED
   */
  validateTaskCommitTracking(frontmatter: Record<string, any>): {
    isValid: boolean;
    issues: string[];
  } {
    console.warn('[kanban-dev] Task commit tracking validation skipped - git functionality disabled');
    return {
      isValid: true, // Always valid when git is disabled
      issues: [],
    };
  }

  /**
   * Checks if a task is "orphaned" (lacks proper commit tracking) - DISABLED
   */
  isTaskOrphaned(frontmatter: Record<string, any>): boolean {
    console.warn('[kanban-dev] Orphaned task check skipped - git functionality disabled');
    return false; // Never orphaned when git is disabled
  }

  /**
   * Enhanced orphaned task detection - DISABLED
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
    console.warn('[kanban-dev] Task status analysis skipped - git functionality disabled');
    
    // Check if task has basic required fields
    const hasBasicFields = frontmatter.uuid && frontmatter.title && frontmatter.status;
    
    return {
      isTrulyOrphaned: !hasBasicFields,
      isUntracked: false,
      isHealthy: hasBasicFields,
      issues: hasBasicFields ? [] : ['Missing required fields (uuid, title, or status)'],
      recommendations: hasBasicFields ? [] : ['Add missing required fields to task'],
    };
  }

  /**
   * Gets statistics about commit tracking across tasks - DISABLED
   */
  getCommitTrackingStats(tasks: Array<{ frontmatter?: Record<string, any> }>): {
    total: number;
    withCommitTracking: number;
    orphaned: number;
    orphanageRate: number;
  } {
    console.warn('[kanban-dev] Commit tracking statistics skipped - git functionality disabled');
    const total = tasks.length;
    
    return {
      total,
      withCommitTracking: total, // All tasks considered tracked when git is disabled
      orphaned: 0,
      orphanageRate: 0,
    };
  }
}

/**
 * Default task git tracker instance - DISABLED
 */
export const defaultTaskGitTracker = new TaskGitTracker();

/**
 * Convenience function to update task commit tracking - DISABLED
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
 * Convenience function to validate task commit tracking - DISABLED
 */
export function validateTaskCommitTracking(frontmatter: Record<string, any>): {
  isValid: boolean;
  issues: string[];
} {
  return defaultTaskGitTracker.validateTaskCommitTracking(frontmatter);
}