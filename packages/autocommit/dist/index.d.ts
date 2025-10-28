import { Config } from './config.js';
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