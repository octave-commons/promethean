/**
 * Git Workflow Core Implementation for Heal Command
 * Orchestrates pre-operation and post-operation Git workflows for healing operations
 */

import type { ScarContext, HealingResult } from './scar-context-types.js';
import type { Task } from '../testing-transition/types.js';
import { GitUtils, type GitOperationResult } from './utils/git-utils.js';
import { CommitMessageGenerator, type TaskDiff } from './utils/commit-message-generator.js';
import { ScarFileManager } from './scar-file-manager.js';
import { GitTagManager } from './git-tag-manager.js';

/**
 * Git workflow configuration options
 */
export interface GitWorkflowConfig {
  /** Repository root path */
  repoPath?: string;
  /** Whether to create annotated tags */
  createAnnotatedTags?: boolean;
  /** Whether to sign tags */
  signTags?: boolean;
  /** Tag prefix for healing operations */
  tagPrefix?: string;
  /** Scar file configuration */
  scarFileConfig?: {
    filePath?: string;
    maxFileSize?: number;
  };
  /** Commit message options */
  commitMessageOptions?: {
    maxSubjectLength?: number;
    includeTaskIds?: boolean;
    includeFilePaths?: boolean;
    prefix?: string;
  };
  /** Whether to push changes to remote */
  pushToRemote?: boolean;
  /** Whether to create backups before operations */
  createBackups?: boolean;
}

/**
 * Pre-operation result
 */
export interface PreOperationResult {
  /** Whether pre-operation was successful */
  success: boolean;
  /** Pre-operation commit SHA */
  commitSha?: string;
  /** Pre-operation tag */
  tag?: string;
  /** Any error message */
  error?: string;
  /** Current repository state */
  repoState?: GitState;
}

/**
 * Post-operation result
 */
export interface PostOperationResult {
  /** Whether post-operation was successful */
  success: boolean;
  /** Post-operation commit SHA */
  commitSha?: string;
  /** Post-operation tag */
  tag?: string;
  /** Final tag */
  finalTag?: string;
  /** List of commits created */
  commits?: string[];
  /** Any error message */
  error?: string;
  /** Number of files changed */
  filesChanged?: number;
}

/**
 * Git workflow manager for healing operations
 */
export class GitWorkflow {
  private readonly repoPath: string;
  private readonly config: Required<GitWorkflowConfig>;
  private readonly gitUtils: GitUtils;
  private readonly commitMessageGenerator: CommitMessageGenerator;
  private readonly scarFileManager: ScarFileManager;
  private readonly gitTagManager: GitTagManager;

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

    this.gitUtils = new GitUtils(this.repoPath);
    this.commitMessageGenerator = new CommitMessageGenerator(this.config.commitMessageOptions);
    this.scarFileManager = new ScarFileManager(this.config.scarFileConfig);
    this.gitTagManager = new GitTagManager(this.repoPath, {
      tagPrefix: this.config.tagPrefix,
      createAnnotatedTags: this.config.createAnnotatedTags,
      signTags: this.config.signTags,
    });
  }

  /**
   * Execute pre-operation workflow
   */
  async preOperation(context: ScarContext): Promise<PreOperationResult> {
    try {
      // Get current repository state
      const repoState = await this.gitUtils.getCurrentState();

      // Create backup if requested and working directory is not clean
      if (this.config.createBackups && !repoState.isClean) {
        const stashResult = await this.gitUtils.stash(`Pre-heal backup: ${context.reason}`);
        if (!stashResult.success) {
          return {
            success: false,
            error: `Failed to create backup: ${stashResult.error}`,
            repoState,
          };
        }
      }

      // Stage any existing changes
      if (repoState.modifiedFiles.length > 0 || repoState.untrackedFiles.length > 0) {
        const allFiles = [...repoState.modifiedFiles, ...repoState.untrackedFiles];
        const addResult = await this.gitUtils.addFiles(allFiles);
        if (!addResult.success) {
          return {
            success: false,
            error: `Failed to stage files: ${addResult.error}`,
            repoState,
          };
        }
      }

      // Create pre-operation commit
      const preOpMessage = this.commitMessageGenerator.generatePreOperationMessage(context);
      const commitResult = await this.gitUtils.commit(preOpMessage, true); // allow empty
      if (!commitResult.success) {
        return {
          success: false,
          error: `Failed to create pre-operation commit: ${commitResult.error}`,
          repoState,
        };
      }

      const preOpSha = commitResult.data?.sha;
      if (!preOpSha) {
        return {
          success: false,
          error: 'Pre-operation commit created but no SHA returned',
          repoState,
        };
      }

      // Create pre-operation tag
      const preOpTag = `${context.metadata.tag}-pre-op`;
      const tagResult = await this.gitTagManager.createHealTag(
        `Pre-operation: ${context.reason}`,
        preOpSha,
        {
          operation: 'pre-op',
          reason: context.reason,
          timestamp: new Date().toISOString(),
        },
      );

      if (!tagResult.success) {
        return {
          success: false,
          error: `Failed to create pre-operation tag: ${tagResult.error}`,
          repoState,
        };
      }

      return {
        success: true,
        commitSha: preOpSha,
        tag: tagResult.tag,
        repoState,
      };
    } catch (error) {
      return {
        success: false,
        error: `Pre-operation workflow failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Execute post-operation workflow
   */
  async postOperation(context: ScarContext, modifiedTasks: Task[]): Promise<PostOperationResult> {
    try {
      const commits: string[] = [];
      let totalFilesChanged = 0;

      // Get current state to compare with pre-operation
      const currentState = await this.gitUtils.getCurrentState();

      // Commit tasks directory changes
      const tasksCommitResult = await this.commitTasksDirectory(context);
      if (tasksCommitResult.success && tasksCommitResult.data?.sha) {
        commits.push(tasksCommitResult.data.sha);
        const filesChanged = await this.gitUtils.getChangedFiles(tasksCommitResult.data.sha);
        totalFilesChanged += filesChanged.length;
      }

      // Commit kanban board changes
      const boardCommitResult = await this.commitKanbanBoard(context, modifiedTasks);
      if (boardCommitResult.success && boardCommitResult.data?.sha) {
        commits.push(boardCommitResult.data.sha);
        const filesChanged = await this.gitUtils.getChangedFiles(boardCommitResult.data.sha);
        totalFilesChanged += filesChanged.length;
      }

      // Commit dependency changes if any
      const depCommitResult = await this.commitDependencies(context);
      if (depCommitResult.success && depCommitResult.data?.sha) {
        commits.push(depCommitResult.data.sha);
        const filesChanged = await this.gitUtils.getChangedFiles(depCommitResult.data.sha);
        totalFilesChanged += filesChanged.length;
      }

      // Create post-operation commit
      const postOpMessage = this.commitMessageGenerator.generatePostOperationMessage(context, modifiedTasks);
      const postOpCommitResult = await this.gitUtils.commit(postOpMessage, true);
      if (!postOpCommitResult.success) {
        return {
          success: false,
          error: `Failed to create post-operation commit: ${postOpCommitResult.error}`,
        };
      }

      const postOpSha = postOpCommitResult.data?.sha;
      if (!postOpSha) {
        return {
          success: false,
          error: 'Post-operation commit created but no SHA returned',
        };
      }

      commits.push(postOpSha);

      // Create post-operation tag
      const postOpTag = `${context.metadata.tag}-post-op`;
      const postOpTagResult = await this.gitTagManager.createHealTag(
        `Post-operation: ${context.reason}`,
        postOpSha,
        {
          operation: 'post-op',
          reason: context.reason,
          tasksModified: modifiedTasks.length,
          timestamp: new Date().toISOString(),
        },
      );

      if (!postOpTagResult.success) {
        return {
          success: false,
          error: `Failed to create post-operation tag: ${postOpTagResult.error}`,
        };
      }

      // Create and store scar record
      const scarRecord = {
        start: await this.getPreOpSha(context.metadata.tag),
        end: postOpSha,
        tag: context.metadata.tag,
        story: this.generateScarStory(context, modifiedTasks),
        timestamp: new Date(),
      };

      await this.scarFileManager.addScar(scarRecord);

      // Create final tag
      const finalTag = context.metadata.tag;
      const finalTagResult = await this.gitTagManager.createHealTag(
        `Complete: ${context.reason}`,
        postOpSha,
        {
          operation: 'final',
          reason: context.reason,
          scarTag: context.metadata.tag,
          tasksModified: modifiedTasks.length,
          commitsCreated: commits.length,
          timestamp: new Date().toISOString(),
        },
      );

      // Push to remote if configured
      if (this.config.pushToRemote) {
        const tagsToPush = [postOpTagResult.tag, finalTagResult.tag].filter(Boolean);
        await this.gitTagManager.pushTags(tagsToPush);
      }

      return {
        success: true,
        commitSha: postOpSha,
        tag: postOpTagResult.tag,
        finalTag: finalTagResult.success ? finalTagResult.tag : undefined,
        commits,
        filesChanged: totalFilesChanged,
      };
    } catch (error) {
      return {
        success: false,
        error: `Post-operation workflow failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Commit tasks directory changes
   */
  async commitTasksDirectory(context: ScarContext): Promise<GitOperationResult> {
    try {
      // Add tasks directory files
      const addResult = await this.gitUtils.addFiles(['docs/agile/tasks/']);
      if (!addResult.success) {
        return addResult;
      }

      // Check if there are changes to commit
      const currentState = await this.gitUtils.getCurrentState();
      if (currentState.isClean) {
        return { success: true, data: 'No changes to commit in tasks directory' };
      }

      // Generate commit message and commit
      const message = this.commitMessageGenerator.generateTasksDirectoryMessage([]);
      return await this.gitUtils.commit(message);
    } catch (error) {
      return {
        success: false,
        error: `Failed to commit tasks directory: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Commit kanban board changes
   */
  async commitKanbanBoard(context: ScarContext, modifiedTasks: Task[]): Promise<GitOperationResult> {
    try {
      // Add kanban board files
      const boardFiles = [
        'docs/agile/boards/generated.md',
        'promethean.kanban.json',
      ];

      const addResult = await this.gitUtils.addFiles(boardFiles);
      if (!addResult.success) {
        return addResult;
      }

      // Check if there are changes to commit
      const currentState = await this.gitUtils.getCurrentState();
      if (currentState.isClean) {
        return { success: true, data: 'No changes to commit in kanban board' };
      }

      // Generate commit message and commit
      const message = this.commitMessageGenerator.generateKanbanBoardMessage(context.reason, modifiedTasks);
      return await this.gitUtils.commit(message);
    } catch (error) {
      return {
        success: false,
        error: `Failed to commit kanban board: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Commit dependency changes
   */
  async commitDependencies(context: ScarContext): Promise<GitOperationResult> {
    try {
      // Add dependency files
      const depFiles = [
        'package.json',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
      ];

      const addResult = await this.gitUtils.addFiles(depFiles);
      if (!addResult.success) {
        return addResult;
      }

      // Check if there are changes to commit
      const currentState = await this.gitUtils.getCurrentState();
      if (currentState.isClean) {
        return { success: true, data: 'No changes to commit in dependencies' };
      }

      // Generate commit message and commit
      const message = this.commitMessageGenerator.generateDependenciesMessage([], 'update');
      return await this.gitUtils.commit(message);
    } catch (error) {
      return {
        success: false,
        error: `Failed to commit dependencies: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create pre-op tag
   */
  async createPreOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    try {
      const tag = `${scarTag}-pre-op`;
      const result = await this.gitTagManager.createHealTag(`Pre-operation: ${scarTag}`, sha);
      
      return {
        success: result.success,
        data: result.success ? { tag: result.tag } : undefined,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create pre-op tag: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create post-op tag
   */
  async createPostOpTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    try {
      const tag = `${scarTag}-post-op`;
      const result = await this.gitTagManager.createHealTag(`Post-operation: ${scarTag}`, sha);
      
      return {
        success: result.success,
        data: result.success ? { tag: result.tag } : undefined,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create post-op tag: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create final tag
   */
  async createFinalTag(scarTag: string, sha: string): Promise<GitOperationResult> {
    try {
      const result = await this.gitTagManager.createHealTag(`Complete: ${scarTag}`, sha);
      
      return {
        success: result.success,
        data: result.success ? { tag: result.tag } : undefined,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create final tag: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Rollback to a specific commit
   */
  async rollback(targetSha: string, mode: 'soft' | 'mixed' | 'hard' = 'mixed'): Promise<GitOperationResult> {
    try {
      // Validate target SHA exists
      const exists = await this.gitUtils.refExists(targetSha);
      if (!exists) {
        return {
          success: false,
          error: `Target commit ${targetSha} does not exist`,
        };
      }

      // Perform rollback
      const resetResult = await this.gitUtils.reset(targetSha, mode);
      if (!resetResult.success) {
        return resetResult;
      }

      return {
        success: true,
        data: {
          message: `Successfully rolled back to ${targetSha.substring(0, 8)}`,
          mode,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Rollback failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get current repository state
   */
  async getCurrentState(): Promise<GitState> {
    return await this.gitUtils.getCurrentState();
  }

  /**
   * Get pre-operation SHA from tag
   */
  private async getPreOpSha(scarTag: string): Promise<string> {
    const preOpTag = `${scarTag}-pre-op`;
    const sha = await this.gitUtils.getCommitSha(preOpTag);
    return sha || '';
  }

  /**
   * Generate scar story from context and modified tasks
   */
  private generateScarStory(context: ScarContext, modifiedTasks: Task[]): string {
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
 * Create a git workflow manager
 */
export function createGitWorkflow(config?: GitWorkflowConfig): GitWorkflow {
  return new GitWorkflow(config);
}