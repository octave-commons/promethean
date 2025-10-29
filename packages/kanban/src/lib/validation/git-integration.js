/**
 * Git Integration for P0 Security Validation - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

/**
 * Validates git requirements for P0 security tasks - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitValidator {
    repoRoot;

    constructor(repoRoot = process.cwd()) {
        this.repoRoot = repoRoot;
        console.warn('[kanban-dev] Git validator is DISABLED - no git operations will be performed');
    }

    /**
     * Checks if there are committed code changes for a task - DISABLED
     */
    async hasCodeChanges(options) {
        console.warn('[kanban-dev] Code changes check skipped - git functionality disabled');
        return false;
    }

    /**
     * Gets commits related to a specific task - DISABLED
     */
    async getTaskCommits(options) {
        console.warn('[kanban-dev] Task commits retrieval skipped - git functionality disabled');
        return [];
    }

    /**
     * Filters commits to find those relevant to a specific task - DISABLED
     */
    filterRelevantCommits(commits, taskUuid, taskTitle) {
        console.warn('[kanban-dev] Commit filtering skipped - git functionality disabled');
        return [];
    }

    /**
     * Gets file changes for a specific commit - DISABLED
     */
    async getCommitFiles(commitHash) {
        console.warn(`[kanban-dev] Commit files retrieval skipped for ${commitHash} - git functionality disabled`);
        return [];
    }

    /**
     * Checks if commits include security-related file changes - DISABLED
     */
    async hasSecurityFileChanges(commits) {
        console.warn('[kanban-dev] Security file changes check skipped - git functionality disabled');
        return false;
    }

    /**
     * Gets repository information - DISABLED
     */
    async getRepoInfo() {
        console.warn('[kanban-dev] Repository info retrieval skipped - git functionality disabled');
        return {
            branch: 'main',
            isClean: true
        };
    }

    /**
     * Validates that repository is in a good state for P0 validation - DISABLED
     */
    async validateRepoState() {
        console.warn('[kanban-dev] Repository state validation skipped - git functionality disabled');
        return {
            valid: true, // Always valid when git is disabled
            errors: [],
            warnings: ['Git functionality is disabled']
        };
    }
}

/**
 * Default git validator instance - DISABLED
 */
export const defaultGitValidator = new GitValidator();

/**
 * Convenience function to check for task-related code changes - DISABLED
 */
export async function hasTaskCodeChanges(options) {
    console.warn('[kanban-dev] Task code changes check skipped - git functionality disabled');
    return false;
}

/**
 * Convenience function to get task-related commits - DISABLED
 */
export async function getTaskCommits(options) {
    console.warn('[kanban-dev] Task commits retrieval skipped - git functionality disabled');
    return [];
}

//# sourceMappingURL=git-integration.js.map/**
 * Git Integration for P0 Security Validation - DISABLED
 *
 * All git functionality has been disabled. This module provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */

/**
 * Validates git requirements for P0 security tasks - DISABLED
 *
 * All git operations have been disabled. This class provides no-op stubs
 * to maintain API compatibility while preventing any git operations.
 */
export class GitValidator {
    repoRoot;

    constructor(repoRoot = process.cwd()) {
        this.repoRoot = repoRoot;
        console.warn('[kanban-dev] Git validator is DISABLED - no git operations will be performed');
    }

    /**
     * Checks if there are committed code changes for a task - DISABLED
     */
    async hasCodeChanges(options) {
        console.warn('[kanban-dev] Code changes check skipped - git functionality disabled');
        return false;
    }

    /**
     * Gets commits related to a specific task - DISABLED
     */
    async getTaskCommits(options) {
        console.warn('[kanban-dev] Task commits retrieval skipped - git functionality disabled');
        return [];
    }

    /**
     * Filters commits to find those relevant to a specific task - DISABLED
     */
    filterRelevantCommits(commits, taskUuid, taskTitle) {
        console.warn('[kanban-dev] Commit filtering skipped - git functionality disabled');
        return [];
    }

    /**
     * Gets file changes for a specific commit - DISABLED
     */
    async getCommitFiles(commitHash) {
        console.warn(`[kanban-dev] Commit files retrieval skipped for ${commitHash} - git functionality disabled`);
        return [];
    }

    /**
     * Checks if commits include security-related file changes - DISABLED
     */
    async hasSecurityFileChanges(commits) {
        console.warn('[kanban-dev] Security file changes check skipped - git functionality disabled');
        return false;
    }

    /**
     * Gets repository information - DISABLED
     */
    async getRepoInfo() {
        console.warn('[kanban-dev] Repository info retrieval skipped - git functionality disabled');
        return {
            branch: 'main',
            isClean: true
        };
    }

    /**
     * Validates that repository is in a good state for P0 validation - DISABLED
     */
    async validateRepoState() {
        console.warn('[kanban-dev] Repository state validation skipped - git functionality disabled');
        return {
            valid: true, // Always valid when git is disabled
            errors: [],
            warnings: ['Git functionality is disabled']
        };
    }
}

/**
 * Default git validator instance - DISABLED
 */
export const defaultGitValidator = new GitValidator();

/**
 * Convenience function to check for task-related code changes - DISABLED
 */
export async function hasTaskCodeChanges(options) {
    console.warn('[kanban-dev] Task code changes check skipped - git functionality disabled');
    return false;
}

/**
 * Convenience function to get task-related commits - DISABLED
 */
export async function getTaskCommits(options) {
    console.warn('[kanban-dev] Task commits retrieval skipped - git functionality disabled');
    return [];
}

//# sourceMappingURL=git-integration.js.map