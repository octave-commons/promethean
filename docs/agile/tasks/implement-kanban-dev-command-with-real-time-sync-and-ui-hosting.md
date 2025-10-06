---
uuid: 7b8c9d0e-1f2a-3b4c-5d6e-7f8g9h0i1j2k
title: Implement kanban dev command with real-time sync and UI hosting
status: todo
priority: P1
labels:
  - kanban
  - dev-experience
  - file-watching
  - real-time-sync
  - ui-hosting
  - cli-enhancement
created_at: '2025-10-05T00:00:00.000Z'
---

## 🛠️ Task: Implement kanban dev command with real-time sync and UI hosting

## 🐛 Problem Statement

The current kanban workflow requires manual `git push/pull` operations and doesn't provide a seamless development experience. Users need:
1. **Real-time synchronization** between local changes and remote repository
2. **Live UI updates** when tasks are modified
3. **Automatic git operations** to keep the board in sync
4. **Development server** for the kanban UI with hot reloading

## 🎯 Desired Outcome

A `pnpm kanban dev` command that provides:
- **File watching**: Monitor board file changes and task modifications
- **Auto-sync**: `git push` when board changes externally, `git pull` when tasks change externally
- **UI hosting**: Local development server with live reload
- **Real-time updates**: UI automatically refreshes when any changes occur
- **Conflict resolution**: Handle merge conflicts gracefully
- **Performance**: Efficient file watching without excessive CPU usage

## 📋 Requirements

### Phase 1: File Watching System
- [ ] Implement board file watcher (`.kanban/board.md` and related files)
- [ ] Add task file monitoring (detect changes outside kanban API)
- [ ] Create event system for different change types
- [ ] Add debouncing to prevent excessive git operations

### Phase 2: Git Integration
- [ ] Implement automatic `git push` on board file changes
- [ ] Implement automatic `git pull` on remote changes detected
- [ ] Add conflict detection and resolution strategies
- [ ] Create sync status reporting and error handling

### Phase 3: Development Server
- [ ] Create HTTP server for hosting kanban UI
- [ ] Implement WebSocket for real-time UI updates
- [ ] Add hot reload functionality
- [ ] Configure static file serving for UI assets

### Phase 4: CLI Integration
- [ ] Add `dev` command to kanban CLI
- [ ] Create command-line options for dev server
- [ ] Add configuration for dev mode settings
- [ ] Implement graceful shutdown handling

### Phase 5: Real-time Communication
- [ ] WebSocket server for client updates
- [ ] Event broadcasting for file changes
- [ ] Client-side reconnection logic
- [ ] Status indicators for sync state

## 🏗️ Implementation Plan

### File Watching Architecture
```typescript
interface FileWatcher {
  watchBoardFile(): void
  watchTaskFiles(): void
  onBoardChange(callback: () => void): void
  onTaskChange(callback: (tasks: string[]) => void): void
}

class KanbanFileWatcher implements FileWatcher {
  private boardWatcher: FSWatcher
  private taskWatcher: FSWatcher
  private debounceTime = 1000 // 1 second
}
```

### Git Sync Service
```typescript
interface GitSyncService {
  autoPushOnBoardChange(): Promise<void>
  autoPullOnRemoteChange(): Promise<void>
  detectConflicts(): Promise<boolean>
  resolveConflicts(strategy: ConflictStrategy): Promise<void>
}

class KanbanGitSync implements GitSyncService {
  private repo: SimpleGit
  private syncInProgress = false
}
```

### Development Server
```typescript
interface DevServer {
  start(port: number): Promise<void>
  broadcastChange(event: ChangeEvent): void
  stop(): Promise<void>
}

class KanbanDevServer implements DevServer {
  private httpServer: Server
  private wsServer: WebSocketServer
  private fileWatcher: FileWatcher
  private gitSync: GitSyncService
}
```

### CLI Command Structure
```bash
# Basic dev command
pnpm kanban dev

# With custom options
pnpm kanban dev --port 3000 --no-auto-push --watch-only

# Development with debugging
pnpm kanban dev --verbose --debug-sync
```

## 🔄 Workflow Integration

### Change Detection Flow
1. **File watcher** detects changes to `.kanban/` directory
2. **Change type identification**:
   - Board file changes → trigger `git push`
   - Task file changes → trigger UI update
   - Remote changes → trigger `git pull` + UI refresh
3. **Debouncing** prevents rapid successive operations
4. **Conflict handling** for concurrent modifications

### Real-time UI Updates
1. **File change** detected by watcher
2. **WebSocket event** broadcast to connected clients
3. **Client receives** change notification
4. **UI refreshes** with latest data
5. **Status indicator** shows sync state

## 📊 Configuration Options

### Dev Mode Settings
```json
{
  "kanban": {
    "dev": {
      "port": 3000,
      "autoPush": true,
      "autoPull": true,
      "debounceMs": 1000,
      "watchFiles": [".kanban/**/*"],
      "uiPath": "./packages/kanban/ui/dist",
      "hotReload": true,
      "openBrowser": true
    }
  }
}
```

### CLI Options
```bash
--port <number>       Development server port (default: 3000)
--no-auto-push        Disable automatic git push
--no-auto-pull        Disable automatic git pull
--watch-only          Only watch files, no server
--no-hot-reload       Disable UI hot reload
--verbose             Detailed logging
--debug-sync          Show git sync details
```

## 🔧 Technical Implementation Details

### File Watching Strategy
- **Chokidar** for efficient cross-platform file watching
- **Debouncing** with configurable delay (default 1s)
- **Event filtering** to ignore temporary files
- **Recursive watching** of `.kanban/` directory

### Git Operations
- **Simple-git** library for git operations
- **Conflict detection** using `git status --porcelain`
- **Automatic merge** with conflict resolution strategies
- **Sync status tracking** to prevent overlapping operations

### WebSocket Communication
- **ws** library for WebSocket server
- **Event types**: `board-change`, `task-change`, `sync-status`, `error`
- **Reconnection logic** for client stability
- **Message queuing** during temporary disconnections

### Error Handling
- **Graceful degradation** when git operations fail
- **Retry mechanisms** for network issues
- **User notifications** for sync conflicts
- **Fallback to manual sync** when automatic fails

## 🎨 User Experience

### Development Workflow
1. **Start dev server**: `pnpm kanban dev`
2. **Automatic browser opening** to `http://localhost:3000`
3. **Make changes** to tasks or board files
4. **See real-time updates** in UI without manual refresh
5. **Automatic git sync** keeps remote repository updated
6. **Status indicators** show sync state and any conflicts

### Visual Feedback
- **Sync status indicator** (green: synced, yellow: syncing, red: conflict)
- **Toast notifications** for important events
- **Console logging** for debugging (verbose mode)
- **Error messages** with suggested resolutions

## 🔗 Related Resources

- **File watching**: `chokidar` library
- **Git operations**: `simple-git` library
- **WebSocket**: `ws` library
- **HTTP server**: Node.js `http` module
- **CLI framework**: Current kanban CLI structure
- **UI integration**: Existing kanban UI components

## ✅ Acceptance Criteria

1. **File Watching**: Accurately detect changes to board and task files
2. **Auto-sync**: Correctly push/pull changes based on modification source
3. **Real-time UI**: Live updates in browser when files change
4. **Performance**: No excessive CPU usage or memory leaks
5. **Error Handling**: Graceful handling of git conflicts and network issues
6. **CLI Integration**: Seamless integration with existing kanban CLI
7. **Configuration**: Customizable settings for different workflows
8. **Documentation**: Clear usage instructions and troubleshooting guide

## 🚀 Success Metrics

- **Zero manual git operations** during normal development workflow
- **Sub-second UI updates** after file changes
- **Reliable sync** with 99%+ success rate
- **Minimal resource usage** (<5% CPU, <50MB memory)
- **Developer satisfaction** through seamless workflow integration

This dev command will transform the kanban development experience from manual, error-prone operations to a seamless, real-time workflow that keeps the board automatically synchronized and provides instant visual feedback.