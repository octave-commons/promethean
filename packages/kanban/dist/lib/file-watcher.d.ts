/**
 * Represents a file change event detected by the watcher
 */
export type FileChangeEvent = {
    /** Type of file that changed */
    readonly type: 'board' | 'task' | 'config';
    /** Absolute path to the changed file */
    readonly filePath: string;
    /** Path relative to current working directory */
    readonly relativePath: string;
    /** Type of file system event */
    readonly event: 'add' | 'change' | 'unlink';
};
/**
 * Configuration options for the file watcher
 */
export type FileWatcherOptions = {
    /** Absolute path to the kanban board file */
    readonly boardFile: string;
    /** Absolute path to the tasks directory */
    readonly tasksDir: string;
    /** Debounce delay in milliseconds for file change events */
    readonly debounceMs?: number;
    /** Array of glob patterns to ignore */
    readonly ignored?: ReadonlyArray<string>;
};
/**
 * Callback functions for file watcher events
 */
export type FileWatcherCallbacks = {
    /** Called when a relevant file change is detected */
    readonly onFileChange: (event: FileChangeEvent) => void;
    /** Called when an error occurs during file watching */
    readonly onError?: (error: Error) => void;
    /** Called when the file watcher is ready and watching */
    readonly onReady?: () => void;
};
/**
 * File watcher for kanban development mode
 *
 * Monitors board files, task files, and configuration files for changes
 * and provides debounced event notifications to avoid excessive processing.
 */
export declare class KanbanFileWatcher {
    private readonly boardFile;
    private readonly tasksDir;
    private readonly debounceMs;
    private readonly ignored;
    private readonly callbacks;
    private watcher;
    private debouncedBoardChange;
    private debouncedTaskChange;
    private pendingTaskEvents;
    /**
     * Creates a new KanbanFileWatcher instance
     * @param options - Configuration options for the watcher
     * @param callbacks - Event callback functions
     */
    constructor(options: FileWatcherOptions, callbacks: FileWatcherCallbacks);
    /**
     * Starts the file watcher
     *
     * Begins monitoring the configured files and directories for changes.
     * If a watcher is already running, it will be stopped first.
     */
    start(): void;
    /**
     * Stops the file watcher
     *
     * Stops monitoring files and cleans up resources.
     */
    stop(): void;
    /**
     * Handles individual file events from the watcher
     * @param event - Type of file system event
     * @param filePath - Path to the affected file
     * @private
     */
    private handleFileEvent;
    /**
     * Checks if the file watcher is currently active
     * @returns True if watching files, false otherwise
     */
    isWatching(): boolean;
    /**
     * Gets the list of paths currently being watched
     * @returns Array of watched directory paths
     */
    getWatchedPaths(): ReadonlyArray<string>;
}
export default KanbanFileWatcher;
//# sourceMappingURL=file-watcher.d.ts.map