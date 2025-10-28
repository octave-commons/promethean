import { watch } from 'chokidar';
import path from 'node:path';
/**
 * Simple debounce implementation to delay function execution
 * @template T - Function type to debounce
 * @param func - The function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 * @internal
 */
function debounce(func, wait) {
    let timeout = null;
    return ((...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
            timeout = null;
        }, wait);
    });
}
/**
 * File watcher for kanban development mode
 *
 * Monitors board files, task files, and configuration files for changes
 * and provides debounced event notifications to avoid excessive processing.
 */
export class KanbanFileWatcher {
    boardFile;
    tasksDir;
    debounceMs;
    ignored;
    callbacks;
    watcher = null;
    debouncedBoardChange;
    debouncedTaskChange;
    pendingTaskEvents = [];
    /**
     * Creates a new KanbanFileWatcher instance
     * @param options - Configuration options for the watcher
     * @param callbacks - Event callback functions
     */
    constructor(options, callbacks) {
        this.boardFile = path.resolve(options.boardFile);
        this.tasksDir = path.resolve(options.tasksDir);
        this.debounceMs = options.debounceMs ?? 1000;
        this.ignored = options.ignored ?? [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/.DS_Store',
            '**/*.tmp',
            '**/*.swp'
        ];
        this.callbacks = callbacks;
        // Create debounced functions
        this.debouncedBoardChange = debounce((event) => {
            this.callbacks.onFileChange(event);
        }, this.debounceMs);
        this.debouncedTaskChange = debounce((events) => {
            if (events.length > 0) {
                // Process each task change individually
                events.forEach(event => this.callbacks.onFileChange(event));
            }
            this.pendingTaskEvents = [];
        }, this.debounceMs);
    }
    /**
     * Starts the file watcher
     *
     * Begins monitoring the configured files and directories for changes.
     * If a watcher is already running, it will be stopped first.
     */
    start() {
        if (this.watcher) {
            this.stop();
        }
        const boardDir = path.dirname(this.boardFile);
        const boardFileName = path.basename(this.boardFile);
        // Watch board file and directory
        const watchPaths = [
            `${boardDir}/${boardFileName}`,
            `${this.tasksDir}/**/*.md`,
            '**/promethean.kanban.json',
            '**/.kanbanrc.json',
            '**/.kanbanrc.yml',
            '**/.kanbanrc.yaml'
        ];
        this.watcher = watch(watchPaths, {
            ignored: [...this.ignored],
            persistent: true,
            ignoreInitial: false,
            usePolling: false,
            interval: 100,
            binaryInterval: 300,
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 50
            }
        });
        // Set up event handlers
        this.watcher.on('ready', () => {
            console.log(`[kanban-dev] File watching started`);
            console.log(`[kanban-dev] Watching board: ${this.boardFile}`);
            console.log(`[kanban-dev] Watching tasks: ${this.tasksDir}`);
            this.callbacks.onReady?.();
        });
        this.watcher.on('error', (error) => {
            console.error('[kanban-dev] File watcher error:', error);
            this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
        });
        this.watcher.on('all', (event, filePath) => {
            if (event === 'add' || event === 'change' || event === 'unlink') {
                this.handleFileEvent(event, filePath);
            }
        });
    }
    /**
     * Stops the file watcher
     *
     * Stops monitoring files and cleans up resources.
     */
    stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            console.log('[kanban-dev] File watching stopped');
        }
    }
    /**
     * Handles individual file events from the watcher
     * @param event - Type of file system event
     * @param filePath - Path to the affected file
     * @private
     */
    handleFileEvent(event, filePath) {
        const resolvedPath = path.resolve(filePath);
        // Determine event type
        let eventType;
        if (resolvedPath === this.boardFile) {
            eventType = 'board';
        }
        else if (resolvedPath.startsWith(this.tasksDir) && filePath.endsWith('.md')) {
            eventType = 'task';
        }
        else if (filePath.includes('kanban') && (filePath.endsWith('.json') || filePath.endsWith('.yml') || filePath.endsWith('.yaml'))) {
            eventType = 'config';
        }
        else {
            return; // Ignore irrelevant files
        }
        const relativePath = path.relative(process.cwd(), resolvedPath);
        const changeEvent = {
            type: eventType,
            filePath: resolvedPath,
            relativePath,
            event
        };
        console.log(`[kanban-dev] File ${event}: ${relativePath} (${eventType})`);
        // Handle different event types with appropriate debouncing
        if (eventType === 'board') {
            // Board changes are processed immediately (but debounced)
            this.debouncedBoardChange(changeEvent);
        }
        else if (eventType === 'task' || eventType === 'config') {
            // Task/config changes are batched
            this.pendingTaskEvents.push(changeEvent);
            this.debouncedTaskChange(this.pendingTaskEvents);
        }
    }
    /**
     * Checks if the file watcher is currently active
     * @returns True if watching files, false otherwise
     */
    isWatching() {
        return this.watcher !== null;
    }
    /**
     * Gets the list of paths currently being watched
     * @returns Array of watched directory paths
     */
    getWatchedPaths() {
        return this.watcher ? Object.keys(this.watcher.getWatched()) : [];
    }
}
export default KanbanFileWatcher;
//# sourceMappingURL=file-watcher.js.map