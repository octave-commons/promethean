export interface FileWatcherOptions {
    repoRoot?: string;
    publish?: (type: string, payload: any) => void;
    maxConcurrentLLMTasks?: number;
}
export declare function startFileWatcher(options?: FileWatcherOptions): Promise<{
    boardWatcher: import("chokidar").FSWatcher;
    tasksWatcher: import("chokidar").FSWatcher;
    repoWatcher: {
        readonly close: () => Promise<void>;
        readonly _handle: (event: "add" | "change" | "unlink", rawPath: string) => Promise<void>;
    };
    close(): Promise<void>;
}>;
//# sourceMappingURL=index.d.ts.map