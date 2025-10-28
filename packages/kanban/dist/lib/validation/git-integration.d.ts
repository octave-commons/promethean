/**
 * Git Integration for P0 Security Validation
 *
 * This module provides git-related functionality for validating
 * P0 security task requirements, particularly code changes.
 */
export interface GitCommitInfo {
    hash: string;
    message: string;
    author: string;
    date: string;
    files: string[];
}
export interface GitValidationOptions {
    repoRoot?: string;
    sinceDate?: string;
    taskUuid?: string;
    taskTitle?: string;
    maxCommits?: number;
}
/**
 * Validates git requirements for P0 security tasks
 */
export declare class GitValidator {
    private readonly repoRoot;
    constructor(repoRoot?: string);
    /**
     * Checks if there are committed code changes for a task
     */
    hasCodeChanges(options: GitValidationOptions): Promise<boolean>;
    /**
     * Gets commits related to a specific task
     */
    getTaskCommits(options: GitValidationOptions): Promise<GitCommitInfo[]>;
    /**
     * Filters commits to find those relevant to a specific task
     */
    private filterRelevantCommits;
    /**
     * Gets file changes for a specific commit
     */
    getCommitFiles(commitHash: string): Promise<string[]>;
    /**
     * Checks if commits include security-related file changes
     */
    hasSecurityFileChanges(commits: GitCommitInfo[]): Promise<boolean>;
    /**
     * Gets repository information
     */
    getRepoInfo(): Promise<{
        branch: string;
        remote?: string;
        lastCommit?: string;
        isClean: boolean;
    }>;
    /**
     * Validates that the repository is in a good state for P0 validation
     */
    validateRepoState(): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
}
/**
 * Default git validator instance
 */
export declare const defaultGitValidator: GitValidator;
/**
 * Convenience function to check for task-related code changes
 */
export declare function hasTaskCodeChanges(options: GitValidationOptions): Promise<boolean>;
/**
 * Convenience function to get task-related commits
 */
export declare function getTaskCommits(options: GitValidationOptions): Promise<GitCommitInfo[]>;
//# sourceMappingURL=git-integration.d.ts.map