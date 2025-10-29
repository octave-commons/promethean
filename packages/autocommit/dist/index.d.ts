import { Config } from './config.js';
export declare function performCommit(config: Config, root: string, log: (msg: string) => void, warn: (msg: string) => void): Promise<void>;
/**
 * Starts autocommit watcher for a single git repository.
 * @param config - Configuration object containing autocommit settings
 * @param repoPath - Path to the git repository to watch
 * @returns Object containing cleanup function
 */
export declare function startSingleRepository(config: Config, repoPath: string): Promise<{
    close: () => void;
}>;
/**
 * Starts autocommit watcher for git repositories.
 * @param config - Configuration object containing autocommit settings
 * @returns Object containing cleanup function
 * @throws AutocommitError if no git repositories are found
 */
export declare function start(config: Config): Promise<{
    close: () => void;
}>;
//# sourceMappingURL=index.d.ts.map