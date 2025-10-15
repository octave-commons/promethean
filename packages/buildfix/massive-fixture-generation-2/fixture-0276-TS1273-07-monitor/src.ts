#!/usr/bin/env node

/**
 * @fileoverview Continuous monitoring and real-time updates for boardrev
 * Monitors file changes, git events, and scheduled runs to trigger boardrev updates
 */

import { createLogger } from '@promethean/utils';
import { EventEmitter } from 'node:events';
import { setInterval, clearInterval } from 'node:timers';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const logger = createLogger({ service: 'boardrev-monitor' });

export interface MonitorConfig {
  // File watching
  watchPaths: string[];
  watchDebounceMs: number;
  watchIgnoredPatterns: string[];

  // Git integration
  enableGitHooks: boolean;
  gitHookTriggers: ('pre-commit' | 'post-commit' | 'pre-push')[];

  // Scheduling
  enableScheduler: boolean;
  scheduleInterval: string; // cron pattern
  scheduleIntervalMs?: number; // fallback in milliseconds

  // Performance
  maxConcurrentRuns: number;
  runTimeoutMs: number;

  // Notifications
  enableNotifications: boolean;
  notificationWebhook?: string;

  // Caching
  cacheDir: string;
  incrementalUpdates: boolean;
}

export interface MonitorEvent {
  type: 'file-change' | 'git-event' | 'scheduled-run' | 'manual-trigger';
  timestamp: Date;
  source: string;
  data: any;
}

export interface MonitorStatus {
  isRunning: boolean;
  lastRun?: Date;
  lastRunStatus: 'success' | 'error' | 'timeout';
  lastRunDuration?: number;
  totalRuns: number;
  errorCount: number;
  activeWatches: number;
}

export class BoardrevMonitor extends EventEmitter {
  private config: MonitorConfig;
  private status: MonitorStatus;
  private watchers: Map<string, any> = new Map();
  private scheduledJobs: Map<string, any> = new Map();
  private activeRuns: Set<string> = new Set();
  private runQueue: Array<() => Promise<void>> = [];
  private debounceTimers: Map<string, any> = new Map();

  constructor(config: Partial<MonitorConfig> = {}) {
    super();

    this.config = this.mergeConfig(config);
    this.status = {
      isRunning: false,
      lastRunStatus: 'success',
      totalRuns: 0,
      errorCount: 0,
      activeWatches: 0,
    };

    this.ensureCacheDirectory();
  }

  private mergeConfig(userConfig: Partial<MonitorConfig>): MonitorConfig {
    const defaultConfig: MonitorConfig = {
      watchPaths: ['docs/agile/tasks', 'docs/agile/boards'],
      watchDebounceMs: 2000,
      watchIgnoredPatterns: ['*.tmp', '*.swp', '.git/*'],

      enableGitHooks: true,
      gitHookTriggers: ['pre-commit', 'post-commit'],

      enableScheduler: true,
      scheduleInterval: '*/5 * * * *', // Every 5 minutes
      scheduleIntervalMs: 5 * 60 * 1000, // 5 minutes fallback

      maxConcurrentRuns: 3,
      runTimeoutMs: 10 * 60 * 1000, // 10 minutes

      enableNotifications: false,

      cacheDir: '.cache/boardrev',
      incrementalUpdates: true,
    };

    return { ...defaultConfig, ...userConfig };
  }

  private ensureCacheDirectory(): void {
    if (!existsSync(this.config.cacheDir)) {
      mkdirSync(this.config.cacheDir, { recursive: true });
    }
  }

  async start(): Promise<void> {
    if (this.status.isRunning) {
      logger.warn('Monitor is already running');
      return;
    }

    logger.info('Starting boardrev monitor');
    this.status.isRunning = true;
    this.emit('started');

    try {
      // Start file watchers
      if (this.config.watchPaths.length > 0) {
        await this.startFileWatchers();
      }

      // Start git hooks
      if (this.config.enableGitHooks) {
        await this.setupGitHooks();
      }

      // Start scheduler
      if (this.config.enableScheduler) {
        await this.startScheduler();
      }

      logger.info('Boardrev monitor started successfully');
      this.emit('ready');
    } catch (error) {
      logger.error('Failed to start monitor:', error as Record<string, unknown>);
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.status.isRunning) {
      return;
    }

    logger.info('Stopping boardrev monitor');
    this.status.isRunning = false;
    this.emit('stopping');

    // Stop file watchers
    for (const [path, watcher] of this.watchers) {
      try {
        watcher.close();
        logger.info(`Stopped watching ${path}`);
      } catch (error) {
        logger.error(`Error stopping watcher for ${path}:`, error as Record<string, unknown>);
      }
    }
    this.watchers.clear();

    // Clear scheduled jobs
    for (const [jobId, timer] of this.scheduledJobs) {
      clearInterval(timer);
      logger.info(`Stopped scheduled job ${jobId}`);
    }
    this.scheduledJobs.clear();

    // Clear debounce timers
    for (const [, timer] of this.debounceTimers) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Wait for active runs to complete or timeout
    if (this.activeRuns.size > 0) {
      logger.info(`Waiting for ${this.activeRuns.size} active runs to complete`);
      await Promise.race([
        Promise.all(Array.from(this.activeRuns).map((runId) => this.waitForRunCompletion(runId))),
        new Promise((resolve) => setTimeout(resolve, 30000)), // 30 second timeout
      ]);
    }

    logger.info('Boardrev monitor stopped');
    this.emit('stopped');
  }

  getStatus(): MonitorStatus {
    return { ...this.status };
  }

  private async startFileWatchers(): Promise<void> {
    const { watchPaths, watchIgnoredPatterns } = this.config;

    for (const watchPath of watchPaths) {
      if (!existsSync(watchPath)) {
        logger.warn(`Watch path does not exist: ${watchPath}`);
        continue;
      }

      try {
        // Dynamic import for chokidar
        const { default: chokidar } = await import('chokidar');

        const watcher = chokidar.watch(watchPath, {
          ignored: watchIgnoredPatterns,
          persistent: true,
          ignoreInitial: true,
        });

        watcher.on('all', (eventType: string, filename: string) => {
          if (filename) {
            this.handleFileChange(eventType, filename, watchPath);
          }
        });

        watcher.on('error', (error: Error) => {
          logger.error(`File watcher error for ${watchPath}:`, {
            message: error.message,
            stack: error.stack,
          });
        });

        this.watchers.set(watchPath, watcher);
        this.status.activeWatches++;

        logger.info(`Started watching ${watchPath}`);
      } catch (error) {
        logger.error(
          `Failed to start file watcher for ${watchPath}:`,
          error as Record<string, unknown>,
        );
      }
    }
  }

  private handleFileChange(eventType: string, filename: string, watchPath: string): void {
    const fullPath = join(watchPath, filename);
    const key = `${fullPath}:${eventType}`;

    // Debounce rapid changes
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);

      const monitorEvent: MonitorEvent = {
        type: 'file-change',
        timestamp: new Date(),
        source: 'file-watcher',
        data: {
          eventType,
          filename,
          fullPath,
          watchPath,
        },
      };

      logger.debug(`File change detected: ${eventType} ${filename}`);
      this.emit('change', monitorEvent);

      // Trigger boardrev run
      this.triggerBoardrevRun(monitorEvent);
    }, this.config.watchDebounceMs);

    this.debounceTimers.set(key, timer);
  }

  private async setupGitHooks(): Promise<void> {
    const gitDir = '.git';
    const hooksDir = join(gitDir, 'hooks');

    if (!existsSync(gitDir)) {
      logger.warn('Not a git repository, skipping git hooks');
      return;
    }

    // Ensure hooks directory exists
    if (!existsSync(hooksDir)) {
      mkdirSync(hooksDir, { recursive: true });
    }

    for (const hook of this.config.gitHookTriggers) {
      try {
        await this.createGitHook(hook);
      } catch (error) {
        logger.error(`Failed to setup git hook ${hook}:`, error as Record<string, unknown>);
      }
    }
  }

  private async createGitHook(hookName: string): Promise<void> {
    const hooksDir = join('.git', 'hooks');
    const hookPath = join(hooksDir, hookName);
    const monitorScript = join(process.cwd(), 'node_modules', '.bin', 'boardrev-monitor');

    const hookScript = `#!/bin/bash
# Boardrev git hook: ${hookName}
exec "${monitorScript}" git-hook ${hookName} "$@"
`;

    // Check if hook already exists and is not managed by boardrev
    if (existsSync(hookPath)) {
      const existingContent = readFileSync(hookPath, 'utf8');
      if (!existingContent.includes('Boardrev git hook')) {
        logger.warn(`Git hook ${hookName} already exists and is not managed by boardrev`);
        return;
      }
    }

    writeFileSync(hookPath, hookScript, { mode: 0o755 });
    logger.info(`Created git hook: ${hookName}`);
  }

  private async startScheduler(): Promise<void> {
    // Try to use node-cron, fallback to setInterval
    try {
      const { default: cron } = await import('node-cron');

      const job = cron.schedule(
        this.config.scheduleInterval,
        () => {
          this.handleScheduledRun();
        },
        {
          scheduled: true,
        },
      );

      this.scheduledJobs.set('cron', job);
      logger.info(`Started cron scheduler: ${this.config.scheduleInterval}`);
    } catch (error) {
      logger.warn(
        'Failed to load node-cron, falling back to setInterval:',
        error as Record<string, unknown>,
      );

      const fallbackInterval = this.config.scheduleIntervalMs || 5 * 60 * 1000;
      const timer = setInterval(() => {
        this.handleScheduledRun();
      }, fallbackInterval);

      this.scheduledJobs.set('interval', timer);
      logger.info(`Started interval scheduler: ${fallbackInterval}ms`);
    }
  }

  private handleScheduledRun(): void {
    const monitorEvent: MonitorEvent = {
      type: 'scheduled-run',
      timestamp: new Date(),
      source: 'scheduler',
      data: {
        interval: this.config.scheduleInterval,
      },
    };

    logger.debug('Scheduled run triggered');
    this.emit('scheduled', monitorEvent);

    this.triggerBoardrevRun(monitorEvent);
  }

  private async triggerBoardrevRun(triggerEvent: MonitorEvent): Promise<void> {
    // Check if we can run now
    if (this.activeRuns.size >= this.config.maxConcurrentRuns) {
      logger.debug('Max concurrent runs reached, queuing request');
      this.runQueue.push(() => this.executeBoardrevRun(triggerEvent));
      return;
    }

    await this.executeBoardrevRun(triggerEvent);
  }

  private async executeBoardrevRun(triggerEvent: MonitorEvent): Promise<void> {
    const runId = this.generateRunId();
    this.activeRuns.add(runId);

    const startTime = Date.now();
    logger.info(`Starting boardrev run ${runId} triggered by ${triggerEvent.type}`);

    try {
      // Emit run start event
      this.emit('run-start', { runId, triggerEvent });

      // Execute the boardrev pipeline
      await this.runBoardrevPipeline(runId, triggerEvent);

      const duration = Date.now() - startTime;
      this.updateRunStatus('success', duration);

      logger.info(`Boardrev run ${runId} completed successfully in ${duration}ms`);
      this.emit('run-complete', { runId, triggerEvent, duration, status: 'success' });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateRunStatus('error', duration);

      logger.error(
        `Boardrev run ${runId} failed after ${duration}ms:`,
        error as Record<string, unknown>,
      );
      this.emit('run-complete', { runId, triggerEvent, duration, status: 'error', error });
    } finally {
      this.activeRuns.delete(runId);

      // Process any queued runs
      if (this.runQueue.length > 0 && this.activeRuns.size < this.config.maxConcurrentRuns) {
        const nextRun = this.runQueue.shift();
        if (nextRun) {
          setImmediate(nextRun);
        }
      }
    }
  }

  private async runBoardrevPipeline(runId: string, triggerEvent: MonitorEvent): Promise<void> {
    // Determine if we can do incremental updates
    const isIncremental =
      this.config.incrementalUpdates &&
      triggerEvent.type === 'file-change' &&
      this.canDoIncrementalUpdate(triggerEvent);

    if (isIncremental) {
      await this.runIncrementalUpdate(runId, triggerEvent);
    } else {
      await this.runFullPipeline(runId, triggerEvent);
    }
  }

  private async runFullPipeline(runId: string, _triggerEvent: MonitorEvent): Promise<void> {
    logger.debug(`Running full pipeline for ${runId}`);

    // The full pipeline includes all existing boardrev steps
    const { execSync } = await import('node:child_process');

    const commands = [
      'pnpm br:01-fm',
      'pnpm br:02-prompts',
      'pnpm br:03-index',
      'pnpm br:04-match',
      'pnpm br:05-eval',
      'pnpm br:06-report',
    ];

    for (const command of commands) {
      logger.debug(`Executing: ${command}`);
      execSync(command, {
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: this.config.runTimeoutMs / commands.length, // Divide timeout among commands
      });
    }
  }

  private async runIncrementalUpdate(runId: string, triggerEvent: MonitorEvent): Promise<void> {
    logger.debug(`Running incremental update for ${runId}`);

    // For file changes, we can optimize by only re-running affected steps
    const { execSync } = await import('node:child_process');

    // Basic incremental strategy - re-run from the affected step
    if (triggerEvent.source === 'file-watcher') {
      const filename = triggerEvent.data.filename;

      if (filename.includes('tasks') || filename.includes('boards')) {
        // Re-run the full pipeline for task/board changes
        await this.runFullPipeline(runId, triggerEvent);
      } else {
        // For other changes, just re-index and evaluate
        execSync('pnpm br:03-index', { stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:04-match', { stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:05-eval', { stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:06-report', { stdio: 'inherit', cwd: process.cwd() });
      }
    } else {
      // For non-file changes, run full pipeline
      await this.runFullPipeline(runId, triggerEvent);
    }
  }

  private canDoIncrementalUpdate(triggerEvent: MonitorEvent): boolean {
    // Logic to determine if we can do incremental updates
    // This could be enhanced with more sophisticated change detection

    if (triggerEvent.type !== 'file-change') {
      return false;
    }

    const filename = triggerEvent.data.filename;

    // Certain file types require full re-run
    const requiresFullRun = ['package.json', 'tsconfig.json', '*.config.js', '*.config.ts'].some(
      (pattern) => filename.includes(pattern.replace('*', '')),
    );

    return !requiresFullRun;
  }

  private updateRunStatus(status: 'success' | 'error' | 'timeout', duration: number): void {
    this.status.lastRun = new Date();
    this.status.lastRunStatus = status;
    this.status.lastRunDuration = duration;
    this.status.totalRuns++;

    if (status === 'error') {
      this.status.errorCount++;
    }

    // Update status file
    this.updateStatusFile();
  }

  private updateStatusFile(): void {
    try {
      const statusPath = join(this.config.cacheDir, 'monitor-status.json');
      writeFileSync(statusPath, JSON.stringify(this.status, null, 2));
    } catch (error) {
      logger.error('Failed to update status file:', error as Record<string, unknown>);
    }
  }

  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async waitForRunCompletion(runId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.activeRuns.has(runId)) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  // Public API for manual triggering
  async triggerRun(reason = 'manual'): Promise<void> {
    const monitorEvent: MonitorEvent = {
      type: 'manual-trigger',
      timestamp: new Date(),
      source: 'api',
      data: { reason },
    };

    await this.triggerBoardrevRun(monitorEvent);
  }

  // Git hook handler
  async handleGitHook(hookName: string, args: string[] = []): Promise<void> {
    const monitorEvent: MonitorEvent = {
      type: 'git-event',
      timestamp: new Date(),
      source: 'git-hook',
      data: {
        hook: hookName,
        args,
      },
    };

    logger.info(`Git hook triggered: ${hookName}`);
    this.emit('git-hook', monitorEvent);

    await this.triggerBoardrevRun(monitorEvent);
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const monitor = new BoardrevMonitor();

  switch (command) {
    case 'start':
      monitor.start().catch(console.error);
      break;
    case 'stop':
      monitor.stop().catch(console.error);
      break;
    case 'status':
      console.log(JSON.stringify(monitor.getStatus(), null, 2));
      break;
    case 'git-hook':
      const hookName = process.argv[3];
      if (hookName) {
        monitor.handleGitHook(hookName, process.argv.slice(4)).catch(console.error);
      } else {
        console.error('Git hook name required');
        process.exit(1);
      }
      break;
    case 'trigger':
      const reason = process.argv[3];
      monitor.triggerRun(reason).catch(console.error);
      break;
    default:
      console.log(`
Usage: boardrev-monitor <command>

Commands:
  start     - Start the monitor daemon
  stop      - Stop the monitor daemon
  status    - Show monitor status
  git-hook  <hook> - Handle git hook event
  trigger   [reason] - Manually trigger a run
      `);
      process.exit(1);
  }
}

export { BoardrevMonitor as default };

undefinedVariable;