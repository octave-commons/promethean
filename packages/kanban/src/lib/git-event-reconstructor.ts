/**
 * Git Event Reconstructor - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import { randomUUID } from 'node:crypto';

import type { TransitionEvent } from '../board/event-log/types.js';
import type { KanbanConfig } from '../board/config/shared.js';

export interface GitCommit {
  sha: string;
  timestamp: string;
  author: string;
  message: string;
  files: string[];
}

export interface TaskStatusAtCommit {
  commitSha: string;
  timestamp: string;
  status: string;
  filePath: string;
}

export interface ReconstructedEvent {
  taskId: string;
  fromStatus: string;
  toStatus: string;
  timestamp: string;
  commitSha: string;
  author: string;
  message: string;
}

export interface GitEventReconstructorOptions {
  repoRoot?: string;
  tasksDir: string;
  since?: string;
  taskUuidFilter?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Reconstructs kanban events from git history - DISABLED VERSION
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitEventReconstructor {
  private readonly repoRoot: string;
  private readonly tasksDir: string;
  private readonly options: Required<
    Omit<GitEventReconstructorOptions, 'taskUuidFilter' | 'dryRun' | 'verbose'>
  >;

  constructor(options: GitEventReconstructorOptions) {
    this.repoRoot = options.repoRoot || process.cwd();
    this.tasksDir = options.tasksDir;
    this.options = {
      repoRoot: this.repoRoot,
      tasksDir: options.tasksDir,
      since: options.since || '2020-01-01',
    };
    console.warn('[kanban-dev] Git event reconstructor is DISABLED - no git operations will be performed');
  }

  /**
   * Get all commits that modified task files - DISABLED
   */
  private getTaskCommits(): GitCommit[] {
    console.warn('[kanban-dev] Git commit analysis skipped - functionality disabled');
    return [];
  }

  /**
   * Extract task UUID from file path or content - DISABLED
   */
  private extractTaskUuid(filePath: string, content?: string): string | null {
    console.warn('[kanban-dev] Task UUID extraction skipped - git functionality disabled');
    return null;
  }

  /**
   * Extract status from task file content - DISABLED
   */
  private extractTaskStatus(content: string): string | null {
    console.warn('[kanban-dev] Task status extraction skipped - git functionality disabled');
    return null;
  }

  /**
   * Get task file content at specific commit - DISABLED
   */
  private getTaskContentAtCommit(filePath: string, commitSha: string): string | null {
    console.warn('[kanban-dev] Git content retrieval skipped - functionality disabled');
    return null;
  }

  /**
   * Analyze status changes for a single task across commits - DISABLED
   */
  private analyzeTaskStatusHistory(
    taskCommits: GitCommit[],
    taskFilePath: string,
  ): ReconstructedEvent[] {
    console.warn('[kanban-dev] Task status history analysis skipped - git functionality disabled');
    return [];
  }

  /**
   * Reconstruct all events from git history - DISABLED
   */
  reconstructEvents(
    options: {
      taskUuidFilter?: string;
      dryRun?: boolean;
      verbose?: boolean;
    } = {},
  ): TransitionEvent[] {
    const { verbose = false } = options;

    if (verbose) {
      console.log('🔍 Git history analysis skipped - functionality disabled');
    }

    console.warn('[kanban-dev] No status transitions found in git history - functionality disabled');
    return [];
  }

  /**
   * Get statistics about reconstruction - DISABLED
   */
  getReconstructionStats(events: TransitionEvent[]): {
    totalEvents: number;
    uniqueTasks: number;
    dateRange: { earliest: string | null; latest: string | null };
    transitionTypes: Record<string, number>;
  } {
    console.warn('[kanban-dev] Reconstruction statistics skipped - git functionality disabled');
    return {
      totalEvents: 0,
      uniqueTasks: 0,
      dateRange: {
        earliest: null,
        latest: null,
      },
      transitionTypes: {},
    };
  }
}

/**
 * Factory function to create event reconstructor - DISABLED
 */
export const makeGitEventReconstructor = (
  config: KanbanConfig,
  options: Omit<GitEventReconstructorOptions, 'tasksDir'> = {},
): GitEventReconstructor => {
  console.warn('[kanban-dev] Git event reconstructor creation skipped - functionality disabled');
  return new GitEventReconstructor({
    ...options,
    tasksDir: config.tasksDir,
  });
};/**
 * Git Event Reconstructor - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import { randomUUID } from 'node:crypto';

import type { TransitionEvent } from '../board/event-log/types.js';
import type { KanbanConfig } from '../board/config/shared.js';

export interface GitCommit {
  sha: string;
  timestamp: string;
  author: string;
  message: string;
  files: string[];
}

export interface TaskStatusAtCommit {
  commitSha: string;
  timestamp: string;
  status: string;
  filePath: string;
}

export interface ReconstructedEvent {
  taskId: string;
  fromStatus: string;
  toStatus: string;
  timestamp: string;
  commitSha: string;
  author: string;
  message: string;
}

export interface GitEventReconstructorOptions {
  repoRoot?: string;
  tasksDir: string;
  since?: string;
  taskUuidFilter?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Reconstructs kanban events from git history - DISABLED VERSION
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitEventReconstructor {
  private readonly repoRoot: string;
  private readonly tasksDir: string;
  private readonly options: Required<
    Omit<GitEventReconstructorOptions, 'taskUuidFilter' | 'dryRun' | 'verbose'>
  >;

  constructor(options: GitEventReconstructorOptions) {
    this.repoRoot = options.repoRoot || process.cwd();
    this.tasksDir = options.tasksDir;
    this.options = {
      repoRoot: this.repoRoot,
      tasksDir: options.tasksDir,
      since: options.since || '2020-01-01',
    };
    console.warn('[kanban-dev] Git event reconstructor is DISABLED - no git operations will be performed');
  }

  /**
   * Get all commits that modified task files - DISABLED
   */
  private getTaskCommits(): GitCommit[] {
    console.warn('[kanban-dev] Git commit analysis skipped - functionality disabled');
    return [];
  }

  /**
   * Extract task UUID from file path or content - DISABLED
   */
  private extractTaskUuid(filePath: string, content?: string): string | null {
    console.warn('[kanban-dev] Task UUID extraction skipped - git functionality disabled');
    return null;
  }

  /**
   * Extract status from task file content - DISABLED
   */
  private extractTaskStatus(content: string): string | null {
    console.warn('[kanban-dev] Task status extraction skipped - git functionality disabled');
    return null;
  }

  /**
   * Get task file content at specific commit - DISABLED
   */
  private getTaskContentAtCommit(filePath: string, commitSha: string): string | null {
    console.warn('[kanban-dev] Git content retrieval skipped - functionality disabled');
    return null;
  }

  /**
   * Analyze status changes for a single task across commits - DISABLED
   */
  private analyzeTaskStatusHistory(
    taskCommits: GitCommit[],
    taskFilePath: string,
  ): ReconstructedEvent[] {
    console.warn('[kanban-dev] Task status history analysis skipped - git functionality disabled');
    return [];
  }

  /**
   * Reconstruct all events from git history - DISABLED
   */
  reconstructEvents(
    options: {
      taskUuidFilter?: string;
      dryRun?: boolean;
      verbose?: boolean;
    } = {},
  ): TransitionEvent[] {
    const { verbose = false } = options;

    if (verbose) {
      console.log('🔍 Git history analysis skipped - functionality disabled');
    }

    console.warn('[kanban-dev] No status transitions found in git history - functionality disabled');
    return [];
  }

  /**
   * Get statistics about reconstruction - DISABLED
   */
  getReconstructionStats(events: TransitionEvent[]): {
    totalEvents: number;
    uniqueTasks: number;
    dateRange: { earliest: string | null; latest: string | null };
    transitionTypes: Record<string, number>;
  } {
    console.warn('[kanban-dev] Reconstruction statistics skipped - git functionality disabled');
    return {
      totalEvents: 0,
      uniqueTasks: 0,
      dateRange: {
        earliest: null,
        latest: null,
      },
      transitionTypes: {},
    };
  }
}

/**
 * Factory function to create event reconstructor - DISABLED
 */
export const makeGitEventReconstructor = (
  config: KanbanConfig,
  options: Omit<GitEventReconstructorOptions, 'tasksDir'> = {},
): GitEventReconstructor => {
  console.warn('[kanban-dev] Git event reconstructor creation skipped - functionality disabled');
  return new GitEventReconstructor({
    ...options,
    tasksDir: config.tasksDir,
  });
};