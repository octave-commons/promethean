import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'node:path';
import { createKanbanUiServer } from './ui-server.js';
import { KanbanFileWatcher } from './file-watcher.js';
import { KanbanGitSync } from './git-sync.js';
/**
 * Development server for kanban boards with real-time synchronization
 *
 * Combines file watching, git synchronization, and WebSocket communication
 * to provide a live development experience for kanban board management.
 */
export class KanbanDevServer {
    options;
    uiOptions;
    httpServer = null;
    wsServer = null;
    fileWatcher = null;
    gitSync = null;
    isRunning = false;
    startTime = Date.now();
    connectedClients = new Set();
    /**
     * Creates a new KanbanDevServer instance
     * @param options - Configuration options for the development server
     */
    constructor(options) {
        this.options = {
            autoGit: true,
            autoOpen: true,
            debounceMs: 1000,
            ...options
        };
        this.uiOptions = {
            boardFile: this.options.boardFile,
            tasksDir: this.options.tasksDir,
            host: this.options.host,
            port: this.options.port
        };
    }
    /**
     * Starts the development server
     *
     * Initializes file watching, git synchronization, HTTP server,
     * and WebSocket connections. If autoOpen is enabled, opens the browser.
     * @throws Error if server fails to start
     */
    async start() {
        if (this.isRunning) {
            console.log('[kanban-dev] Development server is already running');
            return;
        }
        try {
            console.log('[kanban-dev] Starting development server...');
            this.startTime = Date.now();
            // Start file watching
            await this.startFileWatching();
            // Start git synchronization if enabled
            if (this.options.autoGit) {
                await this.startGitSync();
            }
            // Start HTTP server with WebSocket support
            await this.startHttpServer();
            // Open browser if enabled
            if (this.options.autoOpen) {
                await this.openBrowser();
            }
            this.isRunning = true;
            console.log(`[kanban-dev] Development server started successfully`);
            console.log(`[kanban-dev] UI: http://${this.options.host || '127.0.0.1'}:${this.options.port || 3000}`);
            console.log(`[kanban-dev] WebSocket: ws://${this.options.host || '127.0.0.1'}:${this.options.port || 3000}/ws`);
        }
        catch (error) {
            console.error('[kanban-dev] Failed to start development server:', error);
            await this.stop();
            throw error;
        }
    }
    /**
     * Stops the development server
     *
     * Gracefully shuts down file watching, git synchronization,
     * WebSocket connections, and HTTP server.
     */
    async stop() {
        console.log('[kanban-dev] Stopping development server...');
        // Stop file watching
        if (this.fileWatcher) {
            this.fileWatcher.stop();
            this.fileWatcher = null;
        }
        // Stop git sync
        if (this.gitSync) {
            // Git sync doesn't have explicit stop method
            this.gitSync = null;
        }
        // Close WebSocket connections
        this.connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.close();
            }
        });
        this.connectedClients.clear();
        // Close WebSocket server
        if (this.wsServer) {
            this.wsServer.close();
            this.wsServer = null;
        }
        // Close HTTP server
        if (this.httpServer) {
            await new Promise((resolve) => {
                this.httpServer.close((err) => {
                    if (err) {
                        console.error('[kanban-dev] Error closing HTTP server:', err);
                    }
                    resolve();
                });
            });
            this.httpServer = null;
        }
        this.isRunning = false;
        console.log('[kanban-dev] Development server stopped');
    }
    async startFileWatching() {
        const watcherOptions = {
            boardFile: this.options.boardFile,
            tasksDir: this.options.tasksDir,
            debounceMs: this.options.debounceMs,
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/dist/**',
                '**/.DS_Store',
                '**/*.tmp',
                '**/*.swp'
            ]
        };
        this.fileWatcher = new KanbanFileWatcher(watcherOptions, {
            onFileChange: this.handleFileChange.bind(this),
            onError: (error) => {
                console.error('[kanban-dev] File watcher error:', error);
                this.broadcastError('File watcher error', error);
            },
            onReady: () => {
                console.log('[kanban-dev] File watching is active');
            }
        });
        this.fileWatcher.start();
    }
    async startGitSync() {
        const workingDir = path.dirname(path.resolve(this.options.boardFile));
        const gitOptions = {
            workingDir,
            autoPush: true,
            autoPull: true,
            debounceMs: this.options.debounceMs * 2
        };
        this.gitSync = new KanbanGitSync(gitOptions, {
            onSyncStart: (operation) => {
                console.log(`[kanban-dev] Git ${operation} started`);
                this.broadcastSyncStatus();
            },
            onSyncComplete: (operation) => {
                console.log(`[kanban-dev] Git ${operation} completed`);
                this.broadcastSyncStatus();
            },
            onSyncError: (operation, error) => {
                console.error(`[kanban-dev] Git ${operation} failed:`, error);
                this.broadcastError(`Git ${operation} failed`, error);
            },
            onConflict: (conflictedFiles) => {
                console.warn('[kanban-dev] Git conflicts detected:', conflictedFiles);
                this.broadcastError('Git conflicts detected', new Error(`Conflicts: ${conflictedFiles.join(', ')}`));
            }
        });
        await this.gitSync.initialize();
    }
    async startHttpServer() {
        const host = this.options.host || '127.0.0.1';
        const port = this.options.port || 3000;
        // Create base UI server
        const baseServer = createKanbanUiServer(this.uiOptions);
        // Create WebSocket server
        this.wsServer = new WebSocketServer({
            noServer: true,
            path: '/ws'
        });
        this.wsServer.on('connection', (ws) => {
            this.handleWebSocketConnection(ws);
        });
        // Upgrade HTTP server to handle WebSocket connections
        const httpServer = createServer((req, res) => {
            // Handle WebSocket upgrade
            if (req.url === '/ws' && req.headers.upgrade?.toLowerCase() === 'websocket') {
                this.wsServer.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
                    this.wsServer.emit('connection', ws, req);
                });
                return;
            }
            // Handle regular HTTP requests with base server
            baseServer.emit('request', req, res);
        });
        this.httpServer = httpServer;
        await new Promise((resolve, reject) => {
            const onError = (error) => {
                this.httpServer.off('error', onError);
                reject(error);
            };
            this.httpServer.once('error', onError);
            this.httpServer.listen(port, host, () => {
                this.httpServer.off('error', onError);
                resolve();
            });
        });
    }
    handleWebSocketConnection(ws) {
        this.connectedClients.add(ws);
        console.log(`[kanban-dev] Client connected (${this.connectedClients.size} active)`);
        // Send initial status
        this.sendToClient(ws, {
            type: 'status',
            timestamp: new Date().toISOString(),
            data: this.getStatus()
        });
        // Handle client disconnect
        ws.on('close', () => {
            this.connectedClients.delete(ws);
            console.log(`[kanban-dev] Client disconnected (${this.connectedClients.size} active)`);
        });
        ws.on('error', (error) => {
            console.error('[kanban-dev] WebSocket error:', error);
            this.connectedClients.delete(ws);
        });
        // Handle client messages (could be used for manual sync triggers)
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                await this.handleClientMessage(ws, message);
            }
            catch (error) {
                console.error('[kanban-dev] Invalid client message:', error);
            }
        });
    }
    async handleClientMessage(ws, message) {
        if (message.type === 'status') {
            this.sendToClient(ws, {
                type: 'status',
                timestamp: new Date().toISOString(),
                data: this.getStatus()
            });
        }
        else if (message.type === 'sync' && this.gitSync) {
            await this.gitSync.syncWithRemote();
            this.broadcastSyncStatus();
        }
    }
    handleFileChange(event) {
        console.log(`[kanban-dev] File changed: ${event.relativePath} (${event.type})`);
        // Broadcast file change to all clients
        this.broadcastMessage({
            type: event.type === 'board' ? 'board-change' :
                event.type === 'task' ? 'task-change' : 'config-change',
            timestamp: new Date().toISOString(),
            data: {
                filePath: event.relativePath,
                event: event.event
            }
        });
        // Handle git synchronization
        if (this.gitSync && this.options.autoGit) {
            this.handleGitSync(event);
        }
    }
    async handleGitSync(event) {
        if (!this.gitSync || this.gitSync.isSyncInProgress()) {
            return;
        }
        try {
            if (event.type === 'board') {
                // Board changes should be pushed
                await this.gitSync.autoPush(`Auto-sync: ${event.relativePath} changed`);
            }
            else {
                // Task/config changes should check for remote changes first
                const hasRemoteChanges = await this.gitSync.checkForRemoteChanges();
                if (hasRemoteChanges) {
                    await this.gitSync.autoPull();
                }
                else {
                    await this.gitSync.autoPush(`Auto-sync: ${event.relativePath} changed`);
                }
            }
            this.broadcastSyncStatus();
        }
        catch (error) {
            console.error('[kanban-dev] Git sync failed:', error);
            this.broadcastError('Git sync failed', error);
        }
    }
    broadcastMessage(message) {
        const messageStr = JSON.stringify(message);
        this.connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }
    broadcastError(type, error) {
        this.broadcastMessage({
            type: 'error',
            timestamp: new Date().toISOString(),
            data: {
                type,
                message: error.message,
                stack: error.stack
            }
        });
    }
    broadcastSyncStatus() {
        if (!this.gitSync) {
            return;
        }
        const status = this.gitSync.getStatus();
        if (status) {
            this.broadcastMessage({
                type: 'sync-status',
                timestamp: new Date().toISOString(),
                data: status
            });
        }
    }
    sendToClient(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    async openBrowser() {
        const host = this.options.host || '127.0.0.1';
        const port = this.options.port || 3000;
        const url = `http://${host}:${port}`;
        try {
            // Use open command if available
            const { spawn } = await import('node:child_process');
            const platform = process.platform;
            let command;
            if (platform === 'darwin') {
                command = 'open';
            }
            else if (platform === 'win32') {
                command = 'start';
            }
            else {
                command = 'xdg-open';
            }
            spawn(command, [url], {
                detached: true,
                stdio: 'ignore',
                shell: true
            }).unref();
            console.log(`[kanban-dev] Opened browser at ${url}`);
        }
        catch (error) {
            console.log(`[kanban-dev] Could not open browser automatically. Please visit ${url} manually.`);
        }
    }
    /**
     * Gets the current status of the development server
     * @returns Current server status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            uptime: Date.now() - this.startTime,
            fileWatcherActive: this.fileWatcher?.isWatching() ?? false,
            gitSyncActive: this.gitSync !== null,
            lastSyncTime: this.gitSync?.getStatus()?.lastSyncTime,
            connectedClients: this.connectedClients.size,
            syncStatus: this.gitSync?.getStatus() ?? undefined
        };
    }
}
export default KanbanDevServer;
//# sourceMappingURL=dev-server.js.map