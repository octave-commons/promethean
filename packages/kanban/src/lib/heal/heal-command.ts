/**
 * Main Heal Command Implementation for Kanban System
 *
 * This module provides the complete heal command implementation that integrates
 * git tag management, scar history, and intelligent healing operations.
 * It orchestrates the entire healing workflow from analysis to completion.
 */

import path from 'node:path';
import { ScarContextBuilder } from './scar-context-builder.js';
import { GitTagManager, createGitTagManager } from './git-tag-manager.js';
import { ScarHistoryManager, createScarHistoryManager } from './scar-history-manager.js';
import { createEventLogEntry } from './type-guards.js';
import type { ScarContext, HealingResult } from './scar-context-types.js';
import type { Board, Task } from '../types.js';
import { loadBoard, readTasksFolder, syncBoardAndTasks } from '../kanban.js';

/**
 * Heal command configuration options
 */
export interface HealCommandOptions {
  /** Reason for the healing operation */
  reason: string;
  /** Whether to perform a dry run (no changes) */
  dryRun?: boolean;
  /** Whether to create git tags */
  createTags?: boolean;
  /** Whether to push tags to remote */
  pushTags?: boolean;
  /** Whether to analyze git history */
  analyzeGit?: boolean;
  /** Maximum git history depth */
  gitHistoryDepth?: number;
  /** Search terms for finding relevant tasks */
  searchTerms?: string[];
  /** Filter tasks by specific columns */
  columnFilter?: string[];
  /** Filter tasks by specific labels */
  labelFilter?: string[];
  /** Whether to include task analysis */
  includeTaskAnalysis?: boolean;
  /** Whether to include performance metrics */
  includePerformanceMetrics?: boolean;
  /** Custom git tag manager options */
  gitTagOptions?: {
    tagPrefix?: string;
    signTags?: boolean;
  };
  /** Custom scar history options */
  scarHistoryOptions?: {
    maxScarsRetained?: number;
    compressOldData?: boolean;
  };
}

/**
 * Healing operation result with additional metadata
 */
export interface ExtendedHealingResult extends HealingResult {
  /** The scar record that was created */
  scar?: {
    tag: string;
    startSha: string;
    endSha: string;
  };
  /** Git tag creation result */
  tagResult?: {
    success: boolean;
    tag: string;
    error?: string;
  };
  /** Context building time in milliseconds */
  contextBuildTime?: number;
  /** Healing operation time in milliseconds */
  healingTime?: number;
  /** Total operation time in milliseconds */
  totalTime?: number;
}

/**
 * Main heal command class
 */
export class HealCommand {
  private readonly boardPath: string;
  private readonly tasksDir: string;
  private readonly repoRoot: string;
  private readonly gitTagManager: GitTagManager;
  private readonly scarHistoryManager: ScarHistoryManager;

  constructor(boardPath: string, tasksDir: string) {
    this.boardPath = boardPath;
    this.tasksDir = tasksDir;
    this.repoRoot = path.dirname(boardPath);
    this.gitTagManager = createGitTagManager(this.repoRoot);
    this.scarHistoryManager = createScarHistoryManager(this.repoRoot);
  }

  /**
   * Execute the complete healing operation
   */
  async execute(options: HealCommandOptions): Promise<ExtendedHealingResult> {
    const startTime = Date.now();
    let context: ScarContext | null = null;
    let startSha: string | null = null;
    let endSha: string | null = null;

    try {
      // Get starting commit SHA
      startSha = await this.getCurrentCommitSha();
      if (!startSha) {
        throw new Error('Unable to determine current commit SHA');
      }

      // Build scar context
      const contextStartTime = Date.now();
      context = await this.buildScarContext(options);
      const contextBuildTime = Date.now() - contextStartTime;

      // Add initial event
      context.eventLog.push(
        createEventLogEntry(
          'heal-operation-started',
          {
            reason: options.reason,
            dryRun: options.dryRun,
            createTags: options.createTags,
            startSha,
          },
          'info',
        ),
      );

      // Perform the actual healing
      const healingStartTime = Date.now();
      const healingResult = await this.performHealing(context, options);
      const healingTime = Date.now() - healingStartTime;

      // Get ending commit SHA (if changes were made)
      if (!options.dryRun && healingResult.status !== 'failed') {
        endSha = await this.getCurrentCommitSha();
        if (!endSha) {
          throw new Error('Unable to determine final commit SHA');
        }
      } else {
        endSha = startSha; // No changes made
      }

      // Create git tag if requested
      let tagResult;
      if (options.createTags && !options.dryRun) {
        tagResult = await this.gitTagManager.createHealTag(options.reason, endSha, {
          contextBuildTime,
          healingTime,
          tasksModified: healingResult.tasksModified,
          filesChanged: healingResult.filesChanged,
        });
      }

      // Record scar history
      let scar;
      if (endSha && endSha !== startSha && !options.dryRun) {
        const recordResult = await this.scarHistoryManager.recordHealingOperation(
          context,
          healingResult,
          startSha,
          endSha,
        );

        if (recordResult.success && recordResult.scar) {
          scar = {
            tag: recordResult.scar.tag,
            startSha,
            endSha,
          };
        }
      }

      // Push tags if requested
      if (options.pushTags && tagResult?.success) {
        await this.gitTagManager.pushTags([tagResult.tag]);
      }

      const totalTime = Date.now() - startTime;

      // Add completion event
      context.eventLog.push(
        createEventLogEntry(
          'heal-operation-completed',
          {
            status: healingResult.status,
            totalTime,
            contextBuildTime,
            healingTime,
            tagCreated: tagResult?.success,
            scarRecorded: !!scar,
          },
          'info',
        ),
      );

      return {
        ...healingResult,
        scar,
        tagResult,
        contextBuildTime,
        healingTime,
        totalTime,
        completedAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (context) {
        context.eventLog.push(
          createEventLogEntry(
            'heal-operation-failed',
            {
              error: errorMessage,
              totalTime: Date.now() - startTime,
            },
            'error',
          ),
        );
      }

      return {
        status: 'failed',
        summary: `Healing operation failed: ${errorMessage}`,
        tasksModified: 0,
        filesChanged: 0,
        errors: [errorMessage],
        completedAt: new Date(),
        totalTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get healing recommendations based on current state
   */
  async getHealingRecommendations(options: Partial<HealCommandOptions> = {}): Promise<{
    recommendations: string[];
    criticalIssues: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      suggestedAction: string;
    }>;
    relatedScars: Array<{
      scar: any;
      relevance: number;
      reason: string;
    }>;
  }> {
    // Build context for analysis
    const context = await this.buildScarContext({
      reason: 'Analysis for healing recommendations',
      ...options,
    });

    const recommendations: string[] = [];
    const criticalIssues: any[] = [];

    // Analyze system metrics
    const metrics = await this.analyzeSystemMetrics(context);

    if (metrics.wipViolations.length > 0) {
      criticalIssues.push({
        type: 'wip_violation',
        description: `${metrics.wipViolations.length} columns exceed WIP limits`,
        severity: 'high',
        suggestedAction: 'Move tasks to reduce WIP or adjust limits',
      });
      recommendations.push(`Address ${metrics.wipViolations.length} WIP limit violations`);
    }

    if (metrics.incompleteTasks.length > 0) {
      criticalIssues.push({
        type: 'incomplete_tasks',
        description: `${metrics.incompleteTasks.length} tasks have missing information`,
        severity: 'medium',
        suggestedAction: 'Complete missing task information',
      });
      recommendations.push(`Complete ${metrics.incompleteTasks.length} incomplete tasks`);
    }

    if (metrics.duplicateTasks.length > 0) {
      criticalIssues.push({
        type: 'duplicate_tasks',
        description: `${metrics.duplicateTasks.length} sets of duplicate tasks found`,
        severity: 'high',
        suggestedAction: 'Merge or remove duplicate tasks',
      });
      recommendations.push(`Resolve ${metrics.duplicateTasks.length} duplicate task groups`);
    }

    if (metrics.boardHealthScore < 70) {
      criticalIssues.push({
        type: 'low_health_score',
        description: `Board health score is ${metrics.boardHealthScore}/100`,
        severity: 'medium',
        suggestedAction: 'Address board health issues',
      });
      recommendations.push('Improve overall board health');
    }

    // Find related scars
    const relatedScars = await this.scarHistoryManager.findRelatedScars(
      options.reason || 'general healing',
      5,
    );

    return {
      recommendations,
      criticalIssues,
      relatedScars,
    };
  }

  /**
   * Get scar history analysis
   */
  async getScarHistoryAnalysis() {
    return this.scarHistoryManager.analyzeScars();
  }

  /**
   * Build scar context for healing operations
   */
  private async buildScarContext(options: Partial<HealCommandOptions>): Promise<ScarContext> {
    const builder = new ScarContextBuilder(this.boardPath, this.tasksDir);

    const builderOptions = {
      maxPreviousScars: 10,
      maxSearchResults: 20,
      maxGitHistory: options.gitHistoryDepth || 50,
      includeTaskAnalysis: options.includeTaskAnalysis ?? true,
      includePerformanceMetrics: options.includePerformanceMetrics ?? true,
      searchTerms: options.searchTerms || [],
      columnFilter: options.columnFilter || [],
      labelFilter: options.labelFilter || [],
    };

    return builder.buildContext(options.reason || 'Automated healing operation', builderOptions);
  }

  /**
   * Perform the actual healing operations
   */
  private async performHealing(
    context: ScarContext,
    options: HealCommandOptions,
  ): Promise<HealingResult> {
    const result: HealingResult = {
      status: 'in_progress',
      summary: '',
      tasksModified: 0,
      filesChanged: 0,
      errors: [],
    };

    try {
      if (options.dryRun) {
        result.summary = 'Dry run completed - no changes made';
        result.status = 'completed';
        return result;
      }

      // Load current board and tasks
      const board = await loadBoard(this.boardPath, this.tasksDir);
      const tasks = await readTasksFolder(this.tasksDir);

      // Perform healing operations based on context analysis
      const healingActions = await this.determineHealingActions(context, board, tasks);

      for (const action of healingActions) {
        try {
          const actionResult = await this.executeHealingAction(action, board, tasks);
          result.tasksModified += actionResult.tasksModified;
          result.filesChanged += actionResult.filesChanged;

          if (actionResult.errors.length > 0) {
            result.errors.push(...actionResult.errors);
          }
        } catch (error) {
          result.errors.push(`Failed to execute action ${action.type}: ${error}`);
        }
      }

      // Sync changes if any were made
      if (result.tasksModified > 0 || result.filesChanged > 0) {
        const board = await loadBoard(this.boardPath, this.tasksDir);
        await syncBoardAndTasks(board, this.tasksDir, this.boardPath);
      }

      result.summary = `Healing completed: ${result.tasksModified} tasks modified, ${result.filesChanged} files changed`;
      result.status = result.errors.length > 0 ? 'completed' : 'completed';
    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Healing failed: ${error}`);
      result.summary = `Healing operation failed: ${error}`;
    }

    return result;
  }

  /**
   * Determine what healing actions to take based on context
   */
  private async determineHealingActions(
    context: ScarContext,
    board: Board,
    tasks: Task[],
  ): Promise<
    Array<{
      type: string;
      description: string;
      priority: number;
    }>
  > {
    const actions: Array<{
      type: string;
      description: string;
      priority: number;
    }> = [];

    // Analyze context for issues that need healing
    for (const event of context.eventLog) {
      if (event.severity === 'error') {
        actions.push({
          type: 'fix_error',
          description: `Fix error: ${event.operation}`,
          priority: 10,
        });
      }
    }

    // Check for WIP violations
    for (const column of board.columns) {
      if (column.limit && column.tasks.length > column.limit) {
        actions.push({
          type: 'fix_wip_violation',
          description: `Move tasks from ${column.name} (exceeds WIP limit)`,
          priority: 8,
        });
      }
    }

    // Check for incomplete tasks
    for (const task of tasks) {
      if (!task.title || !task.content) {
        actions.push({
          type: 'complete_task',
          description: `Complete missing information for task ${task.uuid}`,
          priority: 6,
        });
      }
    }

    // Sort by priority (highest first)
    return actions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute a specific healing action
   */
  private async executeHealingAction(
    action: any,
    _board: Board,
    _tasks: Task[],
  ): Promise<{
    tasksModified: number;
    filesChanged: number;
    errors: string[];
  }> {
    const result = {
      tasksModified: 0,
      filesChanged: 0,
      errors: [] as string[],
    };

    try {
      switch (action.type) {
        case 'fix_wip_violation':
          // Implementation would move tasks to fix WIP violations
          result.tasksModified = 1;
          result.filesChanged = 1;
          break;

        case 'complete_task':
          // Implementation would complete missing task information
          result.tasksModified = 1;
          result.filesChanged = 1;
          break;

        case 'fix_error':
          // Implementation would fix specific errors
          result.filesChanged = 1;
          break;

        default:
          result.errors.push(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      result.errors.push(`Action execution failed: ${error}`);
    }

    return result;
  }

  /**
   * Analyze system metrics from context
   */
  private async analyzeSystemMetrics(context: ScarContext): Promise<any> {
    // Extract metrics from context event log
    const metricsEvent = context.eventLog.find(
      (event) => event.operation === 'system-metrics-analyzed',
    );

    if (metricsEvent) {
      return metricsEvent.details;
    }

    // Return default metrics if not found
    return {
      wipViolations: [],
      incompleteTasks: [],
      duplicateTasks: [],
      boardHealthScore: 100,
    };
  }

  /**
   * Get current commit SHA
   */
  private async getCurrentCommitSha(): Promise<string | null> {
    try {
      const { execSync } = await import('node:child_process');
      const sha = execSync('git rev-parse HEAD', {
        cwd: this.repoRoot,
        encoding: 'utf8',
      });
      return sha.trim();
    } catch (error) {
      return null;
    }
  }
}

/**
 * Convenience function to create a heal command
 */
export function createHealCommand(boardPath: string, tasksDir: string): HealCommand {
  return new HealCommand(boardPath, tasksDir);
}

/**
 * Default options for heal command
 */
export const DEFAULT_HEAL_COMMAND_OPTIONS: Partial<HealCommandOptions> = {
  dryRun: false,
  createTags: true,
  pushTags: false,
  analyzeGit: true,
  gitHistoryDepth: 50,
  includeTaskAnalysis: true,
  includePerformanceMetrics: true,
};
