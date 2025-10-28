/**
 * Git Workflow Core Implementation for Heal Command
 * Orchestrates pre-operation and post-operation Git workflows for healing operations
 */
import type { ScarContext, Task, GitState } from './scar-context-types.js';
import { type GitOperationResult } from './utils/git-utils.js';
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
export declare class GitWorkflow {
    private readonly repoPath;
    private readonly config;
    private readonly gitUtils;
    private readonly commitMessageGenerator;
    private readonly scarFileManager;
    private readonly gitTagManager;
    constructor(config?: GitWorkflowConfig);
    /**
     * Execute pre-operation workflow
     */
    preOperation(context: ScarContext): Promise<PreOperationResult>;
    /**
     * Execute post-operation workflow
     */
    postOperation(context: ScarContext, modifiedTasks: Task[]): Promise<PostOperationResult>;
    /**
     * Commit tasks directory changes
     */
    commitTasksDirectory(context: ScarContext): Promise<GitOperationResult>;
    /**
     * Commit kanban board changes
     */
    commitKanbanBoard(context: ScarContext, modifiedTasks: Task[]): Promise<GitOperationResult>;
    /**
     * Commit dependency changes
     */
    commitDependencies(context: ScarContext): Promise<GitOperationResult>;
    /**
     * Create pre-op tag
     */
    createPreOpTag(scarTag: string, sha: string): Promise<GitOperationResult>;
    /**
     * Create post-op tag
     */
    createPostOpTag(scarTag: string, sha: string): Promise<GitOperationResult>;
    /**
     * Create final tag
     */
    createFinalTag(scarTag: string, sha: string): Promise<GitOperationResult>;
    /**
     * Rollback to a specific commit
     */
    rollback(targetSha: string, mode?: 'soft' | 'mixed' | 'hard'): Promise<GitOperationResult>;
    /**
     * Get current repository state
     */
    getCurrentState(): Promise<GitState>;
    /**
     * Get pre-operation SHA from tag
     */
    private getPreOpSha;
    /**
     * Generate scar story from context and modified tasks
     */
    private generateScarStory;
}
/**
 * Create a git workflow manager
 */
export declare function createGitWorkflow(config?: GitWorkflowConfig): GitWorkflow;
//# sourceMappingURL=git-workflow.d.ts.map