export interface RepoWatcherOptions {
    repoRoot: string;
    bridgeUrl: string;
    debounceMs?: number;
    authToken?: string;
}
export declare function checkGitIgnored(repoRoot: string, pathRel: string): Promise<boolean>;
export declare function createRepoWatcher({ repoRoot, bridgeUrl, debounceMs, authToken, }: RepoWatcherOptions): Promise<{
    readonly close: () => Promise<void>;
    readonly _handle: (event: "add" | "change" | "unlink", rawPath: string) => Promise<void>;
}>;
//# sourceMappingURL=repo-watcher.d.ts.map