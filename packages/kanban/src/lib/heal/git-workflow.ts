/**
 * Git Workflow Core Implementation for Heal Command - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import type { ScarContext } from './scar-context-types.js';
import type { GitState } from './utils/git-utils.js';
import type { Task } from '../testing-transition/types.js';
import type { GitOperationResult } from './utils/git-utils.js';

/**
 * Git workflow configuration options - DISABLED VERSION
 */
export interface GitWorkflowConfig {
  repoPath?: string;
  createAnnotatedTags?: boolean;
  signTags?: boolean;
  tagPrefix?: string;
  scarFileConfig?: {
    filePath?: string;
    maxFileSize?: number;
  };
  commitMessageOptions?: {
    maxSubjectLength?: number;
    includeTaskIds?: boolean;
    includeFilePaths?: boolean;
    prefix?: string;
  };
  pushToRemote?: boolean;
  createBackups?: boolean;
}

/**
 * Pre-operation result - DISABLED VERSION
 */
export interface PreOperationResult {
  success: boolean;
  commitSha?: string;
  tag?: string;
  error?: string;
  repoState?: GitState;
}

/**
 * Post-operation result - DISABLED VERSION
 */
export interface PostOperationResult {
  success: boolean;
  commitSha?: string;
  tag?: string;
  finalTag?: string;
  commits?: string[];
  error?: string;
  filesChanged?: number;
}

/**
 * Git workflow manager for healing operations - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitWorkflow {
  private readonly repoPath: string;
  private readonly config: Required<GitWorkflowConfig>;

  constructor(config: GitWorkflowConfig = {}) {
    this.repoPath = config.repoPath || process.cwd();
    this.config = {
      repoPath: this.repoPath,
      createAnnotatedTags: config.createAnnotatedTags ?? true,
      signTags: config.signTags ?? false,
      tagPrefix: config.tagPrefix || 'heal',
      scarFileConfig: {
        filePath: config.scarFileConfig?.filePath || '.kanban/scars/scars.jsonl',
        maxFileSize: config.scarFileConfig?.maxFileSize || 10 * 1024 * 1024,
      },
      commitMessageOptions: {
        maxSubjectLength: config.commitMessageOptions?.maxSubjectLength || 72,
        includeTaskIds: config.commitMessageOptions?.includeTaskIds ?? true,
        includeFilePaths: config.commitMessageOptions?.includeFilePaths ?? false,
        prefix: config.commitMessageOptions?.prefix || 'heal',
      },
      pushToRemote: config.pushToRemote ?? false,
      createBackups: config.createBackups ?? true,
    };
    console.warn('[kanban-dev] Git workflow is DISABLED - no git operations will be performed');
  }

  /**
   * Execute pre-operation workflow - DISABLED
   */
  async preOperation(context: ScarContext): Promise<PreOperationResult> {
    console.warn(`[kanban-dev] Pre-operation workflow skipped for "${context.reason}" - git functionality disabled`);
    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Execute post-operation workflow - DISABLED
   */
  async postOperation(context: ScarContext, modifiedTasks: Task[]): Promise<PostOperationResult> {
    console.warn(`[kanban-dev] Post-operation workflow skipped for "${context.reason}" - git functionality disabled`);
    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Commit tasks directory changes - DISABLED
   */
  async commitTasksDirectory(context: ScarContext): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Tasks directory commit skipped - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Commit kanban board changes - DISABLED
   */
  async commitKanbanBoard(
    context: ScarContext,
    modifiedTasks: Task[],
  ): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Kanban board commit skipped for ${modifiedTasks.length} tasks - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Commit dependency changes - DISABLED
   */
  async commitDependencies(context: ScarContext): Promise<GitOperationResult> {
    console.warn('[kanban-dev] Dependencies commit skipped - git functionality disabled');
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create pre-op tag - DISABLED
   */
  async createPreOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Pre-op tag creation skipped for ${scarTag} - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create post-op tag - DISABLED
   */
  async createPostOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Post-op tag creation skipped for ${scarTag} - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create final tag - DISABLED
   */
  async createFinalTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Final tag creation skipped for ${scarTag} - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Rollback to a specific commit - DISABLED
   */
  async rollback(
    targetSha: string,
    mode: 'soft' | 'mixed' | 'hard' = 'mixed',
  ): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Rollback skipped for ${targetSha} (${mode}) - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Get current repository state - DISABLED
   */
  async getCurrentState(): Promise<GitState> {
    console.warn('[kanban-dev] Current state retrieval skipped - git functionality disabled');
    return {
      headSha: 'disabled',
      branch: 'main',
      isClean: true,
      modifiedFiles: [],
      untrackedFiles: [],
    };
  }

  /**
   * Get pre-operation SHA from tag - DISABLED
   */
  private async getPreOpSha(scarTag: string): Promise<string> {
    console.warn(`[kanban-dev] Pre-op SHA retrieval skipped for ${scarTag} - git functionality disabled`);
    return '';
  }

  /**
   * Generate scar story from context and modified tasks - DISABLED
   */
  private generateScarStory(context: ScarContext, modifiedTasks: Task[]): string {
    console.warn(`[kanban-dev] Scar story generation skipped - git functionality disabled`);
    let story = `Healing operation: ${context.reason}\n\n`;

    story += `Summary: ${context.metadata.narrative}\n`;
    story += `Tasks modified: ${modifiedTasks.length}\n`;
    story += `LLM operations: ${context.llmOperations.length}\n`;
    story += `Event log entries: ${context.eventLog.length}\n`;

    if (modifiedTasks.length > 0) {
      story += `\nModified tasks:\n`;
      for (const task of modifiedTasks.slice(0, 10)) {
        story += `- ${task.title} [${task.status}]\n`;
      }
      if (modifiedTasks.length > 10) {
        story += `  ... and ${modifiedTasks.length - 10} more\n`;
      }
    }

    if (context.searchResults.length > 0) {
      story += `\nFound ${context.searchResults.length} relevant tasks during analysis.\n`;
    }

    return story;
  }
}

/**
 * Create a git workflow manager - DISABLED
 */
export function createGitWorkflow(config?: GitWorkflowConfig): GitWorkflow {
  console.warn('[kanban-dev] Git workflow creation skipped - functionality disabled');
  return new GitWorkflow(config);
}/**
 * Git Workflow Core Implementation for Heal Command - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

import type { ScarContext } from './scar-context-types.js';
import type { GitState } from './utils/git-utils.js';
import type { Task } from '../testing-transition/types.js';
import type { GitOperationResult } from './utils/git-utils.js';

/**
 * Git workflow configuration options - DISABLED VERSION
 */
export interface GitWorkflowConfig {
  repoPath?: string;
  createAnnotatedTags?: boolean;
  signTags?: boolean;
  tagPrefix?: string;
  scarFileConfig?: {
    filePath?: string;
    maxFileSize?: number;
  };
  commitMessageOptions?: {
    maxSubjectLength?: number;
    includeTaskIds?: boolean;
    includeFilePaths?: boolean;
    prefix?: string;
  };
  pushToRemote?: boolean;
  createBackups?: boolean;
}

/**
 * Pre-operation result - DISABLED VERSION
 */
export interface PreOperationResult {
  success: boolean;
  commitSha?: string;
  tag?: string;
  error?: string;
  repoState?: GitState;
}

/**
 * Post-operation result - DISABLED VERSION
 */
export interface PostOperationResult {
  success: boolean;
  commitSha?: string;
  tag?: string;
  finalTag?: string;
  commits?: string[];
  error?: string;
  filesChanged?: number;
}

/**
 * Git workflow manager for healing operations - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitWorkflow {
  private readonly repoPath: string;
  private readonly config: Required<GitWorkflowConfig>;

  constructor(config: GitWorkflowConfig = {}) {
    this.repoPath = config.repoPath || process.cwd();
    this.config = {
      repoPath: this.repoPath,
      createAnnotatedTags: config.createAnnotatedTags ?? true,
      signTags: config.signTags ?? false,
      tagPrefix: config.tagPrefix || 'heal',
      scarFileConfig: {
        filePath: config.scarFileConfig?.filePath || '.kanban/scars/scars.jsonl',
        maxFileSize: config.scarFileConfig?.maxFileSize || 10 * 1024 * 1024,
      },
      commitMessageOptions: {
        maxSubjectLength: config.commitMessageOptions?.maxSubjectLength || 72,
        includeTaskIds: config.commitMessageOptions?.includeTaskIds ?? true,
        includeFilePaths: config.commitMessageOptions?.includeFilePaths ?? false,
        prefix: config.commitMessageOptions?.prefix || 'heal',
      },
      pushToRemote: config.pushToRemote ?? false,
      createBackups: config.createBackups ?? true,
    };
    console.warn('[kanban-dev] Git workflow is DISABLED - no git operations will be performed');
  }

  /**
   * Execute pre-operation workflow - DISABLED
   */
  async preOperation(context: ScarContext): Promise<PreOperationResult> {
    console.warn(`[kanban-dev] Pre-operation workflow skipped for "${context.reason}" - git functionality disabled`);
    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Execute post-operation workflow - DISABLED
   */
  async postOperation(context: ScarContext, modifiedTasks: Task[]): Promise<PostOperationResult> {
    console.warn(`[kanban-dev] Post-operation workflow skipped for "${context.reason}" - git functionality disabled`);
    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Commit tasks directory changes - DISABLED
   */
  async commitTasksDirectory(context: ScarContext): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Tasks directory commit skipped - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Commit kanban board changes - DISABLED
   */
  async commitKanbanBoard(
    context: ScarContext,
    modifiedTasks: Task[],
  ): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Kanban board commit skipped for ${modifiedTasks.length} tasks - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Commit dependency changes - DISABLED
   */
  async commitDependencies(context: ScarContext): Promise<GitOperationResult> {
    console.warn('[kanban-dev] Dependencies commit skipped - git functionality disabled');
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create pre-op tag - DISABLED
   */
  async createPreOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Pre-op tag creation skipped for ${scarTag} - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create post-op tag - DISABLED
   */
  async createPostOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Post-op tag creation skipped for ${scarTag} - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create final tag - DISABLED
   */
  async createFinalTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Final tag creation skipped for ${scarTag} - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Rollback to a specific commit - DISABLED
   */
  async rollback(
    targetSha: string,
    mode: 'soft' | 'mixed' | 'hard' = 'mixed',
  ): Promise<GitOperationResult> {
    console.warn(`[kanban-dev] Rollback skipped for ${targetSha} (${mode}) - git functionality disabled`);
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Get current repository state - DISABLED
   */
  async getCurrentState(): Promise<GitState> {
    console.warn('[kanban-dev] Current state retrieval skipped - git functionality disabled');
    return {
      headSha: 'disabled',
      branch: 'main',
      isClean: true,
      modifiedFiles: [],
      untrackedFiles: [],
    };
  }

  /**
   * Get pre-operation SHA from tag - DISABLED
   */
  private async getPreOpSha(scarTag: string): Promise<string> {
    console.warn(`[kanban-dev] Pre-op SHA retrieval skipped for ${scarTag} - git functionality disabled`);
    return '';
  }

  /**
   * Generate scar story from context and modified tasks - DISABLED
   */
  private generateScarStory(context: ScarContext, modifiedTasks: Task[]): string {
    console.warn(`[kanban-dev] Scar story generation skipped - git functionality disabled`);
    let story = `Healing operation: ${context.reason}\n\n`;

    story += `Summary: ${context.metadata.narrative}\n`;
    story += `Tasks modified: ${modifiedTasks.length}\n`;
    story += `LLM operations: ${context.llmOperations.length}\n`;
    story += `Event log entries: ${context.eventLog.length}\n`;

    if (modifiedTasks.length > 0) {
      story += `\nModified tasks:\n`;
      for (const task of modifiedTasks.slice(0, 10)) {
        story += `- ${task.title} [${task.status}]\n`;
      }
      if (modifiedTasks.length > 10) {
        story += `  ... and ${modifiedTasks.length - 10} more\n`;
      }
    }

    if (context.searchResults.length > 0) {
      story += `\nFound ${context.searchResults.length} relevant tasks during analysis.\n`;
    }

    return story;
  }
}

/**
 * Create a git workflow manager - DISABLED
 */
export function createGitWorkflow(config?: GitWorkflowConfig): GitWorkflow {
  console.warn('[kanban-dev] Git workflow creation skipped - functionality disabled');
  return new GitWorkflow(config);
}