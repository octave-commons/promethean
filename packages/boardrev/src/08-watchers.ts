/**
 * @fileoverview Advanced file watching system for boardrev
 * Provides debounced watching, pattern matching, and event filtering
 */

import { EventEmitter } from "node:events";
import { join, relative, extname, basename } from "node:path";
import { existsSync, statSync } from "node:fs";
import { createLogger, type Logger } from "@promethean/utils";

export interface FileWatcherConfig {
  paths: string[];
  ignored: string[];
  debounceMs: number;
  maxDepth?: number;
  followSymlinks?: boolean;
  includeDirectories?: boolean;
}

export interface FileChangeEvent {
  type: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
  path: string;
  relativePath: string;
  stats?: any;
  timestamp: Date;
}

export interface FileFilter {
  pattern?: RegExp;
  extensions?: string[];
  ignorePattern?: RegExp;
  sizeRange?: { min?: number; max?: number };
  custom?: (event: FileChangeEvent) => boolean;
}

export class FileWatcher extends EventEmitter {
  private config: FileWatcherConfig;
  private logger: Logger;
  private watchers: Map<string, any> = new Map();
  private debounceTimers: Map<string, any> = new Map();
  private filters: FileFilter[] = [];
  private watchStats = {
    totalEvents: 0,
    filteredEvents: 0,
    lastEvent: null as Date | null
  };

  constructor(config: FileWatcherConfig) {
    super();
    this.config = config;
    this.logger = createLogger({ service: "boardrev-watcher" });
  }

  addFilter(filter: FileFilter): void {
    this.filters.push(filter);
  }

  removeFilter(filter: FileFilter): void {
    const index = this.filters.indexOf(filter);
    if (index > -1) {
      this.filters.splice(index, 1);
    }
  }

  async start(): Promise<void> {
    this.logger.info("Starting file watchers");

    for (const watchPath of this.config.paths) {
      await this.startWatchingPath(watchPath);
    }

    this.logger.info(`Started watching ${this.watchers.size} paths`);
    this.emit("started");
  }

  async stop(): Promise<void> {
    this.logger.info("Stopping file watchers");

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Close all watchers
    for (const [path, watcher] of this.watchers) {
      try {
        watcher.close();
        this.logger.debug(`Stopped watching ${path}`);
      } catch (error) {
        this.logger.error(`Error stopping watcher for ${path}:`, error);
      }
    }
    this.watchers.clear();

    this.logger.info("Stopped all file watchers");
    this.emit("stopped");
  }

  getStats() {
    return { ...this.watchStats };
  }

  private async startWatchingPath(watchPath: string): Promise<void> {
    if (!existsSync(watchPath)) {
      this.logger.warn(`Watch path does not exist: ${watchPath}`);
      return;
    }

    try {
      // Dynamic import for chokidar
      const { default: chokidar } = await import("chokidar");

      const watcher = chokidar.watch(watchPath, {
        ignored: this.config.ignored,
        persistent: true,
        ignoreInitial: true,
        depth: this.config.maxDepth,
        followSymlinks: this.config.followSymlinks,
        alwaysStat: true
      });

      watcher.on("all", (eventType: string, filename: string | null) => {
        if (filename) {
          this.handleFileEvent(eventType, filename, watchPath);
        }
      });

      watcher.on("error", (error: Error) => {
        this.logger.error(`File watcher error for ${watchPath}:`, error);
        this.emit("error", { path: watchPath, error });
      });

      watcher.on("ready", () => {
        this.logger.debug(`File watcher ready for ${watchPath}`);
        this.emit("watcher-ready", { path: watchPath });
      });

      this.watchers.set(watchPath, watcher);
      this.logger.debug(`Started watching ${watchPath}`);

    } catch (error) {
      this.logger.error(`Failed to start file watcher for ${watchPath}:`, error);
      throw error;
    }
  }

  private handleFileEvent(eventType: string, filename: string, watchPath: string): void {
    const fullPath = join(watchPath, filename);
    const relativePath = relative(process.cwd(), fullPath);

    try {
      const stats = statSync(fullPath);
      const event: FileChangeEvent = {
        type: this.normalizeEventType(eventType),
        path: fullPath,
        relativePath,
        stats,
        timestamp: new Date()
      };

      this.watchStats.totalEvents++;
      this.watchStats.lastEvent = event.timestamp;

      // Apply filters
      if (!this.passesFilters(event)) {
        this.watchStats.filteredEvents++;
        this.logger.debug(`Filtered event: ${eventType} ${relativePath}`);
        return;
      }

      // Debounce events
      this.debounceEvent(event);

    } catch (error) {
      this.logger.error(`Error handling file event for ${fullPath}:`, error);
    }
  }

  private normalizeEventType(eventType: string): FileChangeEvent["type"] {
    switch (eventType) {
      case "add": return "add";
      case "change": return "change";
      case "unlink": return "unlink";
      case "addDir": return "addDir";
      case "unlinkDir": return "unlinkDir";
      default: return eventType as any;
    }
  }

  private passesFilters(event: FileChangeEvent): boolean {
    // Skip directories if not configured to include them
    if (event.stats?.isDirectory() && !this.config.includeDirectories) {
      return false;
    }

    // Apply all filters
    for (const filter of this.filters) {
      if (!this.passesFilter(event, filter)) {
        return false;
      }
    }

    return true;
  }

  private passesFilter(event: FileChangeEvent, filter: FileFilter): boolean {
    // Pattern filter
    if (filter.pattern && !filter.pattern.test(event.relativePath)) {
      return false;
    }

    // Extension filter
    if (filter.extensions && filter.extensions.length > 0) {
      const ext = extname(event.relativePath);
      if (!filter.extensions.includes(ext)) {
        return false;
      }
    }

    // Ignore pattern filter
    if (filter.ignorePattern && filter.ignorePattern.test(event.relativePath)) {
      return false;
    }

    // Size filter
    if (filter.sizeRange && event.stats?.isFile()) {
      const size = event.stats.size;
      if (filter.sizeRange.min && size < filter.sizeRange.min) {
        return false;
      }
      if (filter.sizeRange.max && size > filter.sizeRange.max) {
        return false;
      }
    }

    // Custom filter
    if (filter.custom && !filter.custom(event)) {
      return false;
    }

    return true;
  }

  private debounceEvent(event: FileChangeEvent): void {
    const key = `${event.path}:${event.type}`;

    // Clear existing timer for this key
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      this.emit("change", event);
      this.logger.debug(`File change detected: ${event.type} ${event.relativePath}`);
    }, this.config.debounceMs);

    this.debounceTimers.set(key, timer);
  }

  // Utility methods for common filters
  static createMarkdownFilter(): FileFilter {
    return {
      extensions: [".md", ".markdown"]
    };
  }

  static createTaskFilter(): FileFilter {
    return {
      pattern: /docs\/agile\/tasks\//,
      extensions: [".md"]
    };
  }

  static createBoardFilter(): FileFilter {
    return {
      pattern: /docs\/agile\/boards\//,
      extensions: [".md"]
    };
  }

  static createConfigFilter(): FileFilter {
    return {
      extensions: [".json", ".yaml", ".yml", ".toml", ".config.js", ".config.ts"]
    };
  }

  static createIgnoreFilter(patterns: string[]): FileFilter {
    return {
      ignorePattern: new RegExp(patterns.map(p =>
        p.replace(/\*/g, ".*").replace(/\?/g, ".")
      ).join("|"))
    };
  }

  static createSizeFilter(min?: number, max?: number): FileFilter {
    return {
      sizeRange: { min, max }
    };
  }

  static createCustomFilter(filterFn: (event: FileChangeEvent) => boolean): FileFilter {
    return {
      custom: filterFn
    };
  }

  // Static factory method for common boardrev configuration
  static createBoardrevWatcher(): FileWatcher {
    const config: FileWatcherConfig = {
      paths: [
        "docs/agile/tasks",
        "docs/agile/boards",
        "package.json",
        "pnpm-workspace.yaml",
        ".git"
      ],
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/coverage/**",
        "**/.cache/**",
        "**/*.tmp",
        "**/*.swp",
        "**/*.log"
      ],
      debounceMs: 2000,
      maxDepth: 10,
      followSymlinks: false,
      includeDirectories: false
    };

    const watcher = new FileWatcher(config);

    // Add common filters
    watcher.addFilter(FileWatcher.createMarkdownFilter());
    watcher.addFilter(FileWatcher.createConfigFilter());
    watcher.addFilter(FileWatcher.createIgnoreFilter([
      "**/test/**",    // Ignore test files
      "**/test-*/**",  // Ignore test directories
      "**/*-test.*",   // Ignore test files
      "**/*.test.*",   // Ignore test files
      "**/coverage/**", // Ignore coverage reports
      "**/.*"          // Ignore hidden files (except specific ones)
    ]));

    // Custom filter for significant changes
    watcher.addFilter(FileWatcher.createCustomFilter((event) => {
      // Only include files that are likely to affect boardrev results
      const significantPaths = [
        "docs/agile/tasks/",
        "docs/agile/boards/",
        "package.json",
        "pnpm-workspace.yaml"
      ];

      return significantPaths.some(path => event.relativePath.includes(path));
    }));

    return watcher;
  }
}

export default FileWatcher;