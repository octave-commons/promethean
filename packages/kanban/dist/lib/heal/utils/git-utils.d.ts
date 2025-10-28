/**
 * Git utility functions for the heal command workflow
 * Provides low-level git operations with proper error handling
 */
/**
 * Git repository state information
 */
export interface GitState {
    /** Current HEAD commit SHA */
    headSha: string;
    /** Current branch name */
    branch: string;
    /** Whether working directory is clean */
    isClean: boolean;
    /** List of modified files */
    modifiedFiles: string[];
    /** List of untracked files */
    untrackedFiles: string[];
}
/**
 * Git operation result
 */
export interface GitOperationResult {
    /** Whether the operation was successful */
    success: boolean;
    /** Result data (varies by operation) */
    data?: any;
    /** Error message if operation failed */
    error?: string;
}
/**
 * Git utilities class
 */
export declare class GitUtils {
    private readonly repoPath;
    constructor(repoPath: string);
    /**
     * Get current repository state
     */
    getCurrentState(): Promise<GitState>;
    /**
     * Add files to staging area
     */
    addFiles(filePaths: string[]): Promise<GitOperationResult>;
    /**
     * Create a commit with message
     */
    commit(message: string, allowEmpty?: boolean): Promise<GitOperationResult>;
    /**
     * Create a git tag
     */
    createTag(tag: string, target?: string, message?: string): Promise<GitOperationResult>;
    /**
     * Delete a git tag
     */
    deleteTag(tag: string): Promise<GitOperationResult>;
    /**
     * Get commit SHA for a ref
     */
    getCommitSha(ref: string): Promise<string | null>;
    /**
     * Get diff between two commits
     */
    getDiff(fromRef: string, toRef?: string): Promise<string>;
    /**
     * Get files changed between two commits
     */
    getChangedFiles(fromRef: string, toRef?: string): Promise<string[]>;
    /**
     * Get commit history
     */
    getCommitHistory(fromRef?: string, toRef?: string, limit?: number): Promise<Array<{
        sha: string;
        message: string;
        author: string;
        date: Date;
    }>>;
    /**
     * Check if a ref exists
     */
    refExists(ref: string): Promise<boolean>;
    /**
     * Reset to a specific commit
     */
    reset(target: string, mode?: 'soft' | 'mixed' | 'hard'): Promise<GitOperationResult>;
    /**
     * Stash current changes
     */
    stash(message?: string): Promise<GitOperationResult>;
    /**
     * Pop stashed changes
     */
    stashPop(): Promise<GitOperationResult>;
    /**
     * Execute a git command with proper error handling
     */
    private execGit;
}
/**
 * Create a GitUtils instance
 */
export declare function createGitUtils(repoPath: string): GitUtils;
//# sourceMappingURL=git-utils.d.ts.map