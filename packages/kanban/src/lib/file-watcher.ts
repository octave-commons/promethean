import { watch, FSWatcher } from 'chokidar';
import path from 'node:path';

type EventName = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir' | 'all' | 'raw' | 'ready' | 'error';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  }) as T;
}

// File watching interfaces for kanban development mode
export type FileChangeEvent = {
  readonly type: 'board' | 'task' | 'config';
  readonly filePath: string;
  readonly relativePath: string;
  readonly event: 'add' | 'change' | 'unlink';
};

export type FileWatcherOptions = {
  readonly boardFile: string;
  readonly tasksDir: string;
  readonly debounceMs?: number;
  readonly ignored?: ReadonlyArray<string>;
};

export type FileWatcherCallbacks = {
  readonly onFileChange: (event: FileChangeEvent) => void;
  readonly onError?: (error: Error) => void;
  readonly onReady?: () => void;
};

export class KanbanFileWatcher {
  private readonly boardFile: string;
  private readonly tasksDir: string;
  private readonly debounceMs: number;
  private readonly ignored: ReadonlyArray<string>;
  private readonly callbacks: FileWatcherCallbacks;

  private watcher: FSWatcher | null = null;
  private debouncedBoardChange: (event: FileChangeEvent) => void;
  private debouncedTaskChange: (events: FileChangeEvent[]) => void;
  private pendingTaskEvents: FileChangeEvent[] = [];

  constructor(options: FileWatcherOptions, callbacks: FileWatcherCallbacks) {
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
    this.debouncedBoardChange = debounce((event: FileChangeEvent) => {
      this.callbacks.onFileChange(event);
    }, this.debounceMs);

    this.debouncedTaskChange = debounce((events: FileChangeEvent[]) => {
      if (events.length > 0) {
        // Process each task change individually
        events.forEach(event => this.callbacks.onFileChange(event));
      }
      this.pendingTaskEvents = [];
    }, this.debounceMs);
  }

  start(): void {
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

    this.watcher.on('error', (error: unknown) => {
      console.error('[kanban-dev] File watcher error:', error);
      this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
    });

    this.watcher.on('all', (event: EventName, filePath: string) => {
      if (event === 'add' || event === 'change' || event === 'unlink') {
        this.handleFileEvent(event, filePath);
      }
    });
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('[kanban-dev] File watching stopped');
    }
  }

  private handleFileEvent(event: 'add' | 'change' | 'unlink', filePath: string): void {
    const resolvedPath = path.resolve(filePath);

    // Determine event type
    let eventType: FileChangeEvent['type'];
    if (resolvedPath === this.boardFile) {
      eventType = 'board';
    } else if (resolvedPath.startsWith(this.tasksDir) && filePath.endsWith('.md')) {
      eventType = 'task';
    } else if (filePath.includes('kanban') && (filePath.endsWith('.json') || filePath.endsWith('.yml') || filePath.endsWith('.yaml'))) {
      eventType = 'config';
    } else {
      return; // Ignore irrelevant files
    }

    const relativePath = path.relative(process.cwd(), resolvedPath);
    const changeEvent: FileChangeEvent = {
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
    } else if (eventType === 'task' || eventType === 'config') {
      // Task/config changes are batched
      this.pendingTaskEvents.push(changeEvent);
      this.debouncedTaskChange(this.pendingTaskEvents);
    }
  }

  isWatching(): boolean {
    return this.watcher !== null;
  }

  getWatchedPaths(): ReadonlyArray<string> {
    return this.watcher ? Object.keys(this.watcher.getWatched()) : [];
  }
}

export default KanbanFileWatcher;