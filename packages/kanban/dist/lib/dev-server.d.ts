import { type GitSyncStatus } from './git-sync.js';
/**
 * Configuration options for the development server
 */
export type DevServerOptions = {
    /** Path to the kanban board file */
    readonly boardFile: string;
    /** Path to the tasks directory */
    readonly tasksDir: string;
    /** Server host (default: 127.0.0.1) */
    readonly host?: string;
    /** Server port (default: 3000) */
    readonly port?: number;
    /** Enable automatic git synchronization */
    readonly autoGit?: boolean;
    /** Automatically open browser on startup */
    readonly autoOpen?: boolean;
    /** Debounce delay for file changes in milliseconds */
    readonly debounceMs?: number;
};
/**
 * Status information for the development server
 */
export type DevServerStatus = {
    /** Whether the server is currently running */
    readonly isRunning: boolean;
    /** Server uptime in milliseconds */
    readonly uptime: number;
    /** Whether the file watcher is active */
    readonly fileWatcherActive: boolean;
    /** Whether git synchronization is active */
    readonly gitSyncActive: boolean;
    /** Timestamp of last synchronization */
    readonly lastSyncTime?: Date;
    /** Number of connected WebSocket clients */
    readonly connectedClients: number;
    /** Current git synchronization status */
    readonly syncStatus?: GitSyncStatus;
};
/**
 * WebSocket message format for real-time communication
 */
export type WebSocketMessage = {
    /** Type of message */
    readonly type: 'board-change' | 'task-change' | 'config-change' | 'sync-status' | 'error' | 'status' | 'sync';
    /** ISO timestamp of when the message was sent */
    readonly timestamp: string;
    /** Message payload */
    readonly data: unknown;
};
/**
 * Development server for kanban boards with real-time synchronization
 *
 * Combines file watching, git synchronization, and WebSocket communication
 * to provide a live development experience for kanban board management.
 */
export declare class KanbanDevServer {
    private readonly options;
    private readonly uiOptions;
    private httpServer;
    private wsServer;
    private fileWatcher;
    private gitSync;
    private isRunning;
    private startTime;
    private connectedClients;
    /**
     * Creates a new KanbanDevServer instance
     * @param options - Configuration options for the development server
     */
    constructor(options: DevServerOptions);
    /**
     * Starts the development server
     *
     * Initializes file watching, git synchronization, HTTP server,
     * and WebSocket connections. If autoOpen is enabled, opens the browser.
     * @throws Error if server fails to start
     */
    start(): Promise<void>;
    /**
     * Stops the development server
     *
     * Gracefully shuts down file watching, git synchronization,
     * WebSocket connections, and HTTP server.
     */
    stop(): Promise<void>;
    private startFileWatching;
    private startGitSync;
    private startHttpServer;
    private handleWebSocketConnection;
    private handleClientMessage;
    private handleFileChange;
    private handleGitSync;
    private broadcastMessage;
    private broadcastError;
    private broadcastSyncStatus;
    private sendToClient;
    private openBrowser;
    /**
     * Gets the current status of the development server
     * @returns Current server status
     */
    getStatus(): DevServerStatus;
}
export default KanbanDevServer;
//# sourceMappingURL=dev-server.d.ts.map