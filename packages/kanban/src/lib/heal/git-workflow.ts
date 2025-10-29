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
  public gitUtils: Record<string, unknown>;
  public commitMessageGenerator: Record<string, unknown>;
  public scarFileManager: Record<string, unknown>;
  public gitTagManager: Record<string, unknown>;

  constructor(config: GitWorkflowConfig = {}) {
    this.repoPath = config.repoPath || process.cwd();

    // Use config parameter
    console.log(`Git workflow config: ${config.tagPrefix || 'default'}`);

    // Store config reference
    this.config = config as Required<GitWorkflowConfig>;

    // Initialize disabled stub objects
    this.gitUtils = { disabled: true };
    this.commitMessageGenerator = { disabled: true };
    this.scarFileManager = { disabled: true };
    this.gitTagManager = { disabled: true };

    console.warn(
      `[kanban-dev] Git workflow is DISABLED for repo ${this.repoPath} - no git operations will be performed`,
    );
  }

  /**
   * Execute pre-operation workflow - DISABLED
   */
  async preOperation(context: ScarContext): Promise<PreOperationResult> {
    console.warn(
      `[kanban-dev] Pre-operation workflow skipped for "${context.reason}" - git functionality disabled`,
    );
    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Execute post-operation workflow - DISABLED
   */
  async postOperation(context: ScarContext, modifiedTasks: Task[]): Promise<PostOperationResult> {
    console.warn(
      `[kanban-dev] Post-operation workflow skipped for "${context.reason}" with ${modifiedTasks.length} modified tasks - git functionality disabled`,
    );

    return {
      success: false,
      error: 'Git functionality disabled',
    };
  }

  /**
   * Commit tasks directory changes - DISABLED
   */
  async commitTasksDirectory(context: ScarContext): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Tasks directory commit skipped for "${context.reason}" - git functionality disabled`,
    );
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Commit kanban board changes - DISABLED
   */
  async commitKanbanBoard(
    context: ScarContext,
    modifiedTasks: Task[],
  ): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Kanban board commit skipped for "${context.reason}" with ${modifiedTasks.length} tasks - git functionality disabled`,
    );
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Commit dependency changes - DISABLED
   */
  async commitDependencies(context: ScarContext): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Dependencies commit skipped for "${context.reason}" - git functionality disabled`,
    );
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create pre-op tag - DISABLED
   */
  async createPreOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Pre-op tag creation skipped for ${scarTag} at ${sha} - git functionality disabled`,
    );
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create post-op tag - DISABLED
   */
  async createPostOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Post-op tag creation skipped for ${scarTag} at ${sha} - git functionality disabled`,
    );
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Create final tag - DISABLED
   */
  async createFinalTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Final tag creation skipped for ${scarTag} at ${sha} - git functionality disabled`,
    );
    return { success: false, error: 'Git functionality disabled' };
  }

  /**
   * Rollback to a specific commit - DISABLED
   */
  async rollback(
    targetSha: string,
    mode: 'soft' | 'mixed' | 'hard' = 'mixed',
  ): Promise<GitOperationResult> {
    console.warn(
      `[kanban-dev] Rollback skipped for ${targetSha} (${mode}) - git functionality disabled`,
    );
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
   * Generate scar story from context and modified tasks - DISABLED
   */
}

/**
 * Create a git workflow manager - DISABLED
 */
export function createGitWorkflow(config?: GitWorkflowConfig): GitWorkflow {
  console.warn('[kanban-dev] Git workflow creation skipped - functionality disabled');
  return new GitWorkflow(config);
}
