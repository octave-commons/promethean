import test from 'ava';
import esmock from 'esmock';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';
test('KanbanDevServer orchestrates watcher, git sync, and websockets', async (t) => {
    const modulePath = fileURLToPath(new URL('../lib/dev-server.js', import.meta.url));
    const messages = [];
    let watcherStarted = false;
    let watcherStopped = false;
    let serverListening = false;
    let httpClosed = false;
    class FakeWatcher {
        start() {
            watcherStarted = true;
        }
        stop() {
            watcherStopped = true;
        }
        isWatching() {
            return watcherStarted && !watcherStopped;
        }
        getWatchedPaths() {
            return ['/repo/docs/agile/tasks'];
        }
    }
    const status = {
        isClean: true,
        hasChanges: false,
        hasRemoteChanges: false,
        currentBranch: 'main',
        aheadCount: 0,
        behindCount: 0,
        conflictCount: 0,
        lastSyncTime: new Date(),
    };
    class FakeGitSync {
        callbacks;
        constructor(_options, callbacks) {
            this.callbacks = callbacks;
        }
        async initialize() {
            this.callbacks.onSyncComplete?.('status', status);
        }
        async autoPush() {
            this.callbacks.onSyncComplete?.('push', status);
            return true;
        }
        async autoPull() {
            this.callbacks.onSyncComplete?.('pull', status);
            return true;
        }
        async checkForRemoteChanges() {
            return false;
        }
        getStatus() {
            return status;
        }
        isSyncInProgress() {
            return false;
        }
        async syncWithRemote() {
            return true;
        }
    }
    class FakeWebSocket {
        static OPEN = 1;
        readyState = FakeWebSocket.OPEN;
        sent = [];
        send(payload) {
            this.sent.push(payload);
            messages.push(payload);
        }
        close() { }
        on() { }
    }
    const wsServers = [];
    class FakeWebSocketServer extends EventEmitter {
        constructor() {
            super();
            wsServers.push(this);
        }
        handleUpgrade(_req, _socket, _head, cb) {
            cb(new FakeWebSocket());
        }
        close() { }
    }
    const fakeHttpServer = new EventEmitter();
    fakeHttpServer.listen = (_port, _host, cb) => {
        serverListening = true;
        cb();
    };
    fakeHttpServer.close = (cb) => {
        httpClosed = true;
        cb();
    };
    const watcherModule = fileURLToPath(new URL('../lib/file-watcher.js', import.meta.url));
    const gitSyncModule = fileURLToPath(new URL('../lib/git-sync.js', import.meta.url));
    const uiModule = fileURLToPath(new URL('../lib/ui-server.js', import.meta.url));
    const { KanbanDevServer } = await esmock(modulePath, {
        [watcherModule]: { KanbanFileWatcher: FakeWatcher },
        [gitSyncModule]: { KanbanGitSync: FakeGitSync },
        [uiModule]: {
            createKanbanUiServer: () => new EventEmitter(),
        },
        ws: {
            WebSocketServer: FakeWebSocketServer,
            WebSocket: FakeWebSocket,
        },
        'node:http': {
            createServer: () => fakeHttpServer,
        },
        'node:child_process': {
            spawn: () => ({ unref() { } }),
        },
    });
    const devServer = new KanbanDevServer({
        boardFile: '/repo/docs/agile/boards/generated.md',
        tasksDir: '/repo/docs/agile/tasks',
        host: '127.0.0.1',
        port: 4123,
        autoOpen: false,
    });
    await devServer.start();
    t.true(serverListening);
    t.true(watcherStarted);
    wsServers.at(-1)?.emit('connection', new FakeWebSocket());
    const statusSummary = devServer.getStatus();
    t.true(statusSummary.isRunning);
    t.is(statusSummary.connectedClients, 1);
    await devServer.stop();
    t.true(watcherStopped);
    t.true(httpClosed);
    await esmock.purge(modulePath);
});
//# sourceMappingURL=dev-server.test.js.map