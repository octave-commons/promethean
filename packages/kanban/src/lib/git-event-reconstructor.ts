/**
 * Git Event Reconstructor
 *
 * Reconstructs kanban event log from git history by analyzing task file changes
 * and extracting status transitions over time.
 */

import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { simpleGit, type SimpleGit } from 'simple-git';

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
  since?: string; // Git date format: "2025-01-01"
  taskUuidFilter?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Reconstructs kanban events from git history
 */
export class GitEventReconstructor {
  private readonly repoRoot: string;
  private readonly tasksDir: string;
  private readonly options: Required<
    Omit<GitEventReconstructorOptions, 'taskUuidFilter' | 'dryRun' | 'verbose'>
  >;
  private readonly git: SimpleGit;

  constructor(options: GitEventReconstructorOptions) {
    this.repoRoot = options.repoRoot || process.cwd();
    this.tasksDir = options.tasksDir;
    this.options = {
      repoRoot: this.repoRoot,
      tasksDir: options.tasksDir,
      since: options.since || '2020-01-01',
    };
    this.git = simpleGit(this.repoRoot);
  }

  /**
   * Get all commits that modified task files
   */
  private async getTaskCommits(): Promise<GitCommit[]> {
    const tasksPath = path.relative(this.repoRoot, this.tasksDir);

    try {
      const logOptions = [
        '--name-only',
        `--pretty=format:%H|%ai|%ae|%s`,
        '--',
        `${tasksPath}/*.md`,
      ];

      if (this.options.since) {
        logOptions.unshift(`--since=${this.options.since}`);
      }

      const log = await this.git.log(logOptions);

      if (!log.total) return [];

      const commits: GitCommit[] = [];

      for (const commit of log.all) {
        // Get files for this commit
        const diff = await this.git.diff([
          `${commit.hash}^!`,
          '--name-only',
          '--',
          `${tasksPath}/*.md`,
        ]);
        const files = diff
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.endsWith('.md') && line.includes(tasksPath));

        commits.push({
          sha: commit.hash,
          timestamp: commit.date,
          author: commit.author_email,
          message: commit.message,
          files,
        });
      }

      return commits.reverse(); // Return in chronological order
    } catch (error) {
      console.warn('Warning: Failed to get git commits:', error);
      return [];
    }
  }

  /**
   * Extract task UUID from file path or content
   */
  private extractTaskUuid(filePath: string, content?: string): string | null {
    // Try to extract from filename first
    const filename = path.basename(filePath, '.md');
    if (filename.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      return filename;
    }

    // Try to extract from file content
    if (content) {
      const uuidMatch = content.match(
        /uuid:\s*['"]?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})['"]?/i,
      );
      if (uuidMatch?.[1]) {
        return uuidMatch[1];
      }
    }

    return null;
  }

  /**
   * Extract status from task file content
   */
  private extractTaskStatus(content: string): string | null {
    const statusMatch = content.match(/status:\s*['"]?([^'"\n]+)['"]?/i);
    return statusMatch?.[1]?.trim() || null;
  }

  /**
   * Get task file content at specific commit
   */
  private async getTaskContentAtCommit(
    filePath: string,
    commitSha: string,
  ): Promise<string | null> {
    try {
      const content = await this.git.show([`${commitSha}:${filePath}`]);
      return content;
    } catch (error) {
      // File might not exist at this commit
      return null;
    }
  }

  /**
   * Analyze status changes for a single task across commits
   */
  private analyzeTaskStatusHistory(
    taskCommits: GitCommit[],
    taskFilePath: string,
  ): ReconstructedEvent[] {
    const events: ReconstructedEvent[] = [];
    let lastStatus: string | null = null;

    for (const commit of taskCommits) {
      const content = this.getTaskContentAtCommit(taskFilePath, commit.sha);

      if (!content) {
        // File was deleted or doesn't exist at this commit
        continue;
      }

      const currentStatus = this.extractTaskStatus(content);
      if (!currentStatus) {
        continue; // Skip commits without valid status
      }

      if (lastStatus && lastStatus !== currentStatus) {
        // Status changed - create event
        events.push({
          taskId: this.extractTaskUuid(taskFilePath, content) || 'unknown',
          fromStatus: lastStatus,
          toStatus: currentStatus,
          timestamp: commit.timestamp,
          commitSha: commit.sha,
          author: commit.author,
          message: commit.message,
        });
      }

      lastStatus = currentStatus;
    }

    return events;
  }

  /**
   * Reconstruct all events from git history
   */
  reconstructEvents(
    options: {
      taskUuidFilter?: string;
      dryRun?: boolean;
      verbose?: boolean;
    } = {},
  ): TransitionEvent[] {
    const { taskUuidFilter, verbose = false } = options;

    if (verbose) {
      console.log('🔍 Analyzing git history for task status changes...');
    }

    const commits = this.getTaskCommits();

    if (verbose) {
      console.log(`📊 Found ${commits.length} commits affecting task files`);
    }

    // Group commits by task file
    const taskCommits = new Map<string, GitCommit[]>();

    for (const commit of commits) {
      for (const filePath of commit.files) {
        if (!taskCommits.has(filePath)) {
          taskCommits.set(filePath, []);
        }
        taskCommits.get(filePath)!.push(commit);
      }
    }

    if (verbose) {
      console.log(`📁 Found ${taskCommits.size} task files with history`);
    }

    // Analyze each task's status history
    const allEvents: ReconstructedEvent[] = [];

    for (const [taskFilePath, commits] of taskCommits) {
      const taskUuid = this.extractTaskUuid(taskFilePath);

      // Apply filter if specified
      if (taskUuidFilter && taskUuid !== taskUuidFilter) {
        continue;
      }

      const events = this.analyzeTaskStatusHistory(commits, taskFilePath);
      allEvents.push(...events);

      if (verbose && events.length > 0) {
        console.log(`   📋 ${taskUuid || 'unknown'}: ${events.length} status changes`);
      }
    }

    if (verbose) {
      console.log(`✅ Reconstructed ${allEvents.length} total status transitions`);
    }

    // Convert to TransitionEvent format
    const transitionEvents: TransitionEvent[] = allEvents.map((event) => ({
      id: randomUUID(),
      timestamp: event.timestamp,
      taskId: event.taskId,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      reason: `Reconstructed from git: ${event.message}`,
      actor: 'system', // Git history is treated as system events
      metadata: {
        commitSha: event.commitSha,
        author: event.author,
        reconstructed: true,
      },
    }));

    // Sort by timestamp
    transitionEvents.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return transitionEvents;
  }

  /**
   * Get statistics about reconstruction
   */
  getReconstructionStats(events: TransitionEvent[]): {
    totalEvents: number;
    uniqueTasks: number;
    dateRange: { earliest: string | null; latest: string | null };
    transitionTypes: Record<string, number>;
  } {
    const uniqueTasks = new Set(events.map((e) => e.taskId));
    const transitionTypes: Record<string, number> = {};

    for (const event of events) {
      const transition = `${event.fromStatus} → ${event.toStatus}`;
      transitionTypes[transition] = (transitionTypes[transition] || 0) + 1;
    }

    const timestamps = events.map((e) => e.timestamp);
    const earliest =
      timestamps.length > 0 ? Math.min(...timestamps.map((t) => new Date(t).getTime())) : null;
    const latest =
      timestamps.length > 0 ? Math.max(...timestamps.map((t) => new Date(t).getTime())) : null;

    return {
      totalEvents: events.length,
      uniqueTasks: uniqueTasks.size,
      dateRange: {
        earliest: earliest ? new Date(earliest).toISOString() : null,
        latest: latest ? new Date(latest).toISOString() : null,
      },
      transitionTypes,
    };
  }
}

/**
 * Factory function to create event reconstructor
 */
export const makeGitEventReconstructor = (
  config: KanbanConfig,
  options: Omit<GitEventReconstructorOptions, 'tasksDir'> = {},
): GitEventReconstructor => {
  return new GitEventReconstructor({
    ...options,
    tasksDir: config.tasksDir,
  });
};
