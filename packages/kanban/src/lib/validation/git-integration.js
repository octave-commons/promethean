/**
 * Git Integration for P0 Security Validation
 *
 * This module provides git-related functionality for validating
 * P0 security task requirements, particularly code changes.
 */
import { execSync } from 'node:child_process';
/**
 * Validates git requirements for P0 security tasks
 */
export class GitValidator {
    repoRoot;
    constructor(repoRoot = process.cwd()) {
        this.repoRoot = repoRoot;
    }
    /**
     * Checks if there are committed code changes for a task
     */
    async hasCodeChanges(options) {
        try {
            const commits = await this.getTaskCommits(options);
            return commits.length > 0;
        }
        catch (error) {
            console.warn(`Warning: Could not check git changes: ${error}`);
            return false;
        }
    }
    /**
     * Gets commits related to a specific task
     */
    async getTaskCommits(options) {
        const { sinceDate, taskUuid, taskTitle, maxCommits = 50 } = options;
        try {
            // Build git log command
            let gitCommand = `git log --since="${sinceDate || '30 days ago'}" --max-count=${maxCommits} --pretty=format:'%H|%s|%an|%ad' --date=iso --name-only`;
            const output = execSync(gitCommand, {
                cwd: this.repoRoot,
                encoding: 'utf8',
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });
            if (!output.trim()) {
                return [];
            }
            // Parse git output
            const commits = [];
            const lines = output.split('\n');
            let currentCommit = null;
            for (const line of lines) {
                if (line.includes('|')) {
                    // New commit header
                    if (currentCommit) {
                        commits.push(currentCommit);
                    }
                    const [hash, message, author, date] = line.split('|');
                    currentCommit = {
                        hash: hash.trim(),
                        message: message.trim(),
                        author: author.trim(),
                        date: date.trim(),
                        files: []
                    };
                }
                else if (line.trim() && currentCommit) {
                    // File path
                    currentCommit.files.push(line.trim());
                }
            }
            // Add last commit
            if (currentCommit) {
                commits.push(currentCommit);
            }
            // Filter commits by task relevance
            return this.filterRelevantCommits(commits, taskUuid, taskTitle);
        }
        catch (error) {
            console.warn(`Warning: Could not get git commits: ${error}`);
            return [];
        }
    }
    /**
     * Filters commits to find those relevant to a specific task
     */
    filterRelevantCommits(commits, taskUuid, taskTitle) {
        if (!taskUuid && !taskTitle) {
            return commits;
        }
        return commits.filter(commit => {
            const message = commit.message.toLowerCase();
            // Check for UUID match
            if (taskUuid && message.includes(taskUuid.toLowerCase())) {
                return true;
            }
            // Check for title match (partial, first 50 chars)
            if (taskTitle) {
                const titleWords = taskTitle
                    .toLowerCase()
                    .substring(0, 50)
                    .split(/\s+/)
                    .filter(word => word.length > 2); // Filter out short words
                // Check if commit message contains significant words from task title
                const matchingWords = titleWords.filter(word => message.includes(word));
                // Require at least 2 matching words or 50% of words (whichever is less)
                const minMatches = Math.min(2, Math.ceil(titleWords.length * 0.5));
                if (matchingWords.length >= minMatches) {
                    return true;
                }
            }
            // Check for security-related keywords
            const securityKeywords = [
                'security', 'vulnerability', 'fix', 'patch', 'cve', 'exploit',
                'authentication', 'authorization', 'injection', 'xss', 'csrf',
                'validation', 'sanitization', 'escape', 'filter', 'protect'
            ];
            const hasSecurityKeyword = securityKeywords.some(keyword => message.includes(keyword));
            return hasSecurityKeyword;
        });
    }
    /**
     * Gets file changes for a specific commit
     */
    async getCommitFiles(commitHash) {
        try {
            const output = execSync(`git show --name-only --format="" ${commitHash}`, {
                cwd: this.repoRoot,
                encoding: 'utf8',
                maxBuffer: 1024 * 1024
            });
            return output
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        }
        catch (error) {
            console.warn(`Warning: Could not get commit files for ${commitHash}: ${error}`);
            return [];
        }
    }
    /**
     * Checks if commits include security-related file changes
     */
    async hasSecurityFileChanges(commits) {
        const securityFilePatterns = [
            /security/i,
            /auth/i,
            /validation/i,
            /sanitiz/i,
            /escape/i,
            /filter/i,
            /protect/i,
            /middleware/i,
            /guard/i,
            /policy/i,
            /permission/i,
            /access/i
        ];
        for (const commit of commits) {
            for (const file of commit.files) {
                if (securityFilePatterns.some(pattern => pattern.test(file))) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Gets repository information
     */
    async getRepoInfo() {
        try {
            const branch = execSync('git rev-parse --abbrev-ref HEAD', {
                cwd: this.repoRoot,
                encoding: 'utf8'
            }).trim();
            let remote;
            try {
                remote = execSync('git config --get remote.origin.url', {
                    cwd: this.repoRoot,
                    encoding: 'utf8'
                }).trim();
            }
            catch {
                // No remote configured
            }
            const lastCommit = execSync('git rev-parse HEAD', {
                cwd: this.repoRoot,
                encoding: 'utf8'
            }).trim();
            const status = execSync('git status --porcelain', {
                cwd: this.repoRoot,
                encoding: 'utf8'
            }).trim();
            return {
                branch,
                remote,
                lastCommit,
                isClean: status.length === 0
            };
        }
        catch (error) {
            console.warn(`Warning: Could not get repo info: ${error}`);
            return {
                branch: 'unknown',
                isClean: false
            };
        }
    }
    /**
     * Validates that the repository is in a good state for P0 validation
     */
    async validateRepoState() {
        const errors = [];
        const warnings = [];
        try {
            const repoInfo = await this.getRepoInfo();
            // Check if we're in a git repository
            try {
                execSync('git rev-parse --git-dir', {
                    cwd: this.repoRoot,
                    encoding: 'utf8'
                });
            }
            catch {
                errors.push('Not in a git repository');
                return { valid: false, errors, warnings };
            }
            // Check if working directory is clean
            if (!repoInfo.isClean) {
                warnings.push('Working directory has uncommitted changes');
            }
            // Check if we're on main/master branch
            if (!['main', 'master'].includes(repoInfo.branch)) {
                warnings.push(`Not on main branch (currently on ${repoInfo.branch})`);
            }
            // Check if remote is configured
            if (!repoInfo.remote) {
                warnings.push('No remote repository configured');
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            errors.push(`Could not validate repository state: ${error}`);
            return { valid: false, errors, warnings };
        }
    }
}
/**
 * Default git validator instance
 */
export const defaultGitValidator = new GitValidator();
/**
 * Convenience function to check for task-related code changes
 */
export async function hasTaskCodeChanges(options) {
    const validator = new GitValidator(options.repoRoot);
    return validator.hasCodeChanges(options);
}
/**
 * Convenience function to get task-related commits
 */
export async function getTaskCommits(options) {
    const validator = new GitValidator(options.repoRoot);
    return validator.getTaskCommits(options);
}
//# sourceMappingURL=git-integration.js.map