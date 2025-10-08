import { createServer, Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { createKanbanUiServer, type KanbanUiServerOptions } from './ui-server.js';
import { KanbanFileWatcher, type FileChangeEvent, type FileWatcherOptions } from './file-watcher.js';
import { KanbanGitSync, type GitSyncOptions, type GitSyncStatus } from './git-sync.js';

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
export class KanbanDevServer {
  private readonly options: DevServerOptions;
  private readonly uiOptions: KanbanUiServerOptions;

  private httpServer: Server | null = null;
  private wsServer: WebSocketServer | null = null;
  private fileWatcher: KanbanFileWatcher | null = null;
  private gitSync: KanbanGitSync | null = null;

  private isRunning = false;
  private startTime = Date.now();
  private connectedClients = new Set<WebSocket>();

  /**
   * Creates a new KanbanDevServer instance
   * @param options - Configuration options for the development server
   */
  constructor(options: DevServerOptions) {
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
  async start(): Promise<void> {
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

    } catch (error) {
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
  async stop(): Promise<void> {
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
      await new Promise<void>((resolve) => {
        this.httpServer!.close((err?: Error) => {
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

  private async startFileWatching(): Promise<void> {
    const watcherOptions: FileWatcherOptions = {
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
      onError: (error: Error) => {
        console.error('[kanban-dev] File watcher error:', error);
        this.broadcastError('File watcher error', error);
      },
      onReady: () => {
        console.log('[kanban-dev] File watching is active');
      }
    });

    this.fileWatcher.start();
  }

  private async startGitSync(): Promise<void> {
    const workingDir = path.dirname(path.resolve(this.options.boardFile));

    const gitOptions: GitSyncOptions = {
      workingDir,
      autoPush: true,
      autoPull: true,
      debounceMs: this.options.debounceMs! * 2
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

  private async startHttpServer(): Promise<void> {
    const host = this.options.host || '127.0.0.1';
    const port = this.options.port || 3000;

    // Create base UI server
    const baseServer = createKanbanUiServer(this.uiOptions);

    // Create WebSocket server
    this.wsServer = new WebSocketServer({
      noServer: true,
      path: '/ws'
    });

    this.wsServer.on('connection', (ws: WebSocket) => {
      this.handleWebSocketConnection(ws);
    });

    // Upgrade HTTP server to handle WebSocket connections
    const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
      // Handle WebSocket upgrade
      if (req.url === '/ws' && req.headers.upgrade?.toLowerCase() === 'websocket') {
        this.wsServer!.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws: WebSocket) => {
          this.wsServer!.emit('connection', ws, req);
        });
        return;
      }

      // Handle regular HTTP requests with base server
      baseServer.emit('request', req, res);
    });

    this.httpServer = httpServer;

    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        this.httpServer!.off('error', onError);
        reject(error);
      };

      this.httpServer!.once('error', onError);

      this.httpServer!.listen(port, host, () => {
        this.httpServer!.off('error', onError);
        resolve();
      });
    });
  }

  private handleWebSocketConnection(ws: WebSocket): void {
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

    ws.on('error', (error: Error) => {
      console.error('[kanban-dev] WebSocket error:', error);
      this.connectedClients.delete(ws);
    });

    // Handle client messages (could be used for manual sync triggers)
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        await this.handleClientMessage(ws, message);
      } catch (error) {
        console.error('[kanban-dev] Invalid client message:', error);
      }
    });
  }

  private async handleClientMessage(ws: WebSocket, message: WebSocketMessage): Promise<void> {
    if (message.type === 'status') {
      this.sendToClient(ws, {
        type: 'status',
        timestamp: new Date().toISOString(),
        data: this.getStatus()
      });
    } else if (message.type === 'sync' && this.gitSync) {
      await this.gitSync.syncWithRemote();
      this.broadcastSyncStatus();
    }
  }

  private handleFileChange(event: FileChangeEvent): void {
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

  private async handleGitSync(event: FileChangeEvent): Promise<void> {
    if (!this.gitSync || this.gitSync.isSyncInProgress()) {
      return;
    }

    try {
      if (event.type === 'board') {
        // Board changes should be pushed
        await this.gitSync.autoPush(`Auto-sync: ${event.relativePath} changed`);
      } else {
        // Task/config changes should check for remote changes first
        const hasRemoteChanges = await this.gitSync.checkForRemoteChanges();
        if (hasRemoteChanges) {
          await this.gitSync.autoPull();
        } else {
          await this.gitSync.autoPush(`Auto-sync: ${event.relativePath} changed`);
        }
      }

      this.broadcastSyncStatus();
    } catch (error) {
      console.error('[kanban-dev] Git sync failed:', error);
      this.broadcastError('Git sync failed', error as Error);
    }
  }

  private broadcastMessage(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);

    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private broadcastError(type: string, error: Error): void {
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

  private broadcastSyncStatus(): void {
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

  private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private async openBrowser(): Promise<void> {
    const host = this.options.host || '127.0.0.1';
    const port = this.options.port || 3000;
    const url = `http://${host}:${port}`;

    try {
      // Use open command if available
      const { spawn } = await import('node:child_process');
      const platform = process.platform;

      let command: string;
      if (platform === 'darwin') {
        command = 'open';
      } else if (platform === 'win32') {
        command = 'start';
      } else {
        command = 'xdg-open';
      }

      spawn(command, [url], {
        detached: true,
        stdio: 'ignore',
        shell: true
      }).unref();

      console.log(`[kanban-dev] Opened browser at ${url}`);
    } catch (error) {
      console.log(`[kanban-dev] Could not open browser automatically. Please visit ${url} manually.`);
    }
  }

  /**
   * Gets the current status of the development server
   * @returns Current server status
   */
  getStatus(): DevServerStatus {
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