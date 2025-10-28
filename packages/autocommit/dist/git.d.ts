export declare function gitRoot(cwd: string): Promise<string>;
export declare function hasRepo(cwd: string): Promise<boolean>;
export declare function statusPorcelain(cwd: string): Promise<string>;
export declare function listChangedFiles(cwd: string): Promise<string[]>;
export declare function addAll(cwd: string): Promise<void>;
export declare function hasStagedChanges(cwd: string): Promise<boolean>;
export declare function stagedDiff(cwd: string, maxBytes: number): Promise<string>;
export declare function repoSummary(cwd: string): Promise<string>;
/**
 * Creates a git commit with the given message.
 * @param cwd - Working directory for the git repository
 * @param message - Commit message (will be sanitized to prevent injection)
 * @param signoff - Whether to add signoff flag
 * @throws Error if message is invalid after sanitization
 */
export declare function commit(cwd: string, message: string, signoff?: boolean): Promise<void>;
/**
 * Sanitizes a commit message to prevent command injection attacks.
 * Removes control characters and limits length to reasonable bounds.
 * @param message - Raw commit message
 * @returns Sanitized message safe for git commands
 */
export declare function sanitizeCommitMessage(message: string): string;
/**
 * Finds all git repositories recursively within a directory.
 * @param rootPath - Root directory to search for git repositories
 * @returns Array of absolute paths to git repository roots
 */
export declare function findGitRepositories(rootPath: string): Promise<string[]>;
//# sourceMappingURL=git.d.ts.map