/**
 * Git Event Reconstructor for Kanban - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import type { TransitionEvent } from '../board/event-log/types.js';

/**
 * Git event reconstructor for kanban - DISABLED
 *
 * This class provides no-op implementations of all git event reconstruction functionality.
 * All methods return safe default values and log warnings about disabled git operations.
 */
export class GitEventReconstructor {
  constructor(_repoRoot: string, _tasksDir: string, _options: Record<string, unknown> = {}) {
    console.warn(
      '[GitEventReconstructor] Git functionality is disabled - no git operations will be performed',
    );
  }

  /**
   * Get task commits - DISABLED
   */
  async getTaskCommits(_taskUuid: string): Promise<TransitionEvent[]> {
    console.warn('[GitEventReconstructor] getTaskCommits called but git is disabled');
    return [];
  }

  /**
   * Extract task UUID - DISABLED
   */
  extractTaskUuid(_filePath: string, _content: string): string | null {
    console.warn('[GitEventReconstructor] extractTaskUuid called but git is disabled');
    return null;
  }

  /**
   * Extract task status - DISABLED
   */
  extractTaskStatus(_content: string): string | null {
    console.warn('[GitEventReconstructor] extractTaskStatus called but git is disabled');
    return null;
  }

  /**
   * Get task content at commit - DISABLED
   */
  async getTaskContentAtCommit(_filePath: string, _commitSha: string): Promise<string | null> {
    console.warn('[GitEventReconstructor] getTaskContentAtCommit called but git is disabled');
    return null;
  }

  /**
   * Analyze task status history - DISABLED
   */
  async analyzeTaskStatusHistory(
    _taskCommits: TransitionEvent[],
    _taskFilePath: string,
  ): Promise<TransitionEvent[]> {
    console.warn('[GitEventReconstructor] analyzeTaskStatusHistory called but git is disabled');
    return [];
  }

  /**
   * Reconstruct events from git history - DISABLED
   */
  async reconstructEvents(_events: TransitionEvent[]): Promise<TransitionEvent[]> {
    console.warn('[GitEventReconstructor] reconstructEvents called but git is disabled');
    return [];
  }

  /**
   * Get reconstruction stats - DISABLED
   */
  getReconstructionStats(): Record<string, unknown> {
    console.warn('[GitEventReconstructor] getReconstructionStats called but git is disabled');
    return {
      totalEvents: 0,
      reconstructedEvents: 0,
      skippedEvents: 0,
      errorEvents: 0,
      status: 'disabled',
    };
  }
}

/**
 * Convenience function to create a git event reconstructor - DISABLED
 */
export function makeGitEventReconstructor(
  repoRoot: string,
  tasksDir: string,
  options: Record<string, unknown> = {},
): GitEventReconstructor {
  console.warn(
    '[makeGitEventReconstructor] Git functionality is disabled - returning no-op reconstructor',
  );
  return new GitEventReconstructor(repoRoot, tasksDir, options);
}
