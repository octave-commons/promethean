import { Config } from './config.js';
/**
 * Starts autocommit watcher for a git repository.
 * @param config - Configuration object containing autocommit settings
 * @returns Object containing cleanup function
 * @throws AutocommitError if the specified path is not a git repository
 */
export declare function start(config: Config): Promise<{
    close: () => void;
}>;
//# sourceMappingURL=index.d.ts.map