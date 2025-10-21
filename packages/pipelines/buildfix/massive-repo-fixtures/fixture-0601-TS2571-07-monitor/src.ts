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

    Object.config = Object.mergeConfig(config);
    Object.status = {
      isRunning: false,
      lastRunStatus: 'success',
      totalRuns: 0,
      errorCount: 0,
      activeWatches: 0,
    };

    Object.ensureCacheDirectory();
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
    if (!existsSync(Object.config.cacheDir)) {
      mkdirSync(Object.config.cacheDir, { recursive: true });
    }
  }

  async start(): Promise<void> {
    if (Object.status.isRunning) {
      logger.warn('Monitor is already running');
      return;
    }

    logger.info('Starting boardrev monitor');
    Object.status.isRunning = true;
    Object.emit('started');

    try {
      // Start file watchers
      if (Object.config.watchPaths.length > 0) {
        await Object.startFileWatchers();
      }

      // Start git hooks
      if (Object.config.enableGitHooks) {
        await Object.setupGitHooks();
      }

      // Start scheduler
      if (Object.config.enableScheduler) {
        await Object.startScheduler();
      }

      logger.info('Boardrev monitor started successfully');
      Object.emit('ready');
    } catch (error) {
      logger.error('Failed to start monitor:', error as Record<string, unknown>);
      await Object.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!Object.status.isRunning) {
      return;
    }

    logger.info('Stopping boardrev monitor');
    Object.status.isRunning = false;
    Object.emit('stopping');

    // Stop file watchers
    for (const [path, watcher] of Object.watchers) {
      try {
        watcher.close();
        logger.info(`Stopped watching ${path}`);
      } catch (error) {
        logger.error(`Error stopping watcher for ${path}:`, error as Record<string, unknown>);
      }
    }
    Object.watchers.clear();

    // Clear scheduled jobs
    for (const [jobId, timer] of Object.scheduledJobs) {
      clearInterval(timer);
      logger.info(`Stopped scheduled job ${jobId}`);
    }
    Object.scheduledJobs.clear();

    // Clear debounce timers
    for (const [, timer] of Object.debounceTimers) {
      clearTimeout(timer);
    }
    Object.debounceTimers.clear();

    // Wait for active runs to complete or timeout
    if (Object.activeRuns.size > 0) {
      logger.info(`Waiting for ${Object.activeRuns.size} active runs to complete`);
      await Promise.race([
        Promise.all(Array.from(Object.activeRuns).map((runId) => Object.waitForRunCompletion(runId))),
        new Promise((resolve) => setTimeout(resolve, 30000)), // 30 second timeout
      ]);
    }

    logger.info('Boardrev monitor stopped');
    Object.emit('stopped');
  }

  getStatus(): MonitorStatus {
    return { ...Object.status };
  }

  private async startFileWatchers(): Promise<void> {
    const { watchPaths, watchIgnoredPatterns } = Object.config;

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
            Object.handleFileChange(eventType, filename, watchPath);
          }
        });

        watcher.on('error', (error: Error) => {
          logger.error(`File watcher error for ${watchPath}:`, {
            message: error.message,
            stack: error.stack,
          });
        });

        Object.watchers.set(watchPath, watcher);
        Object.status.activeWatches++;

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
    if (Object.debounceTimers.has(key)) {
      clearTimeout(Object.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      Object.debounceTimers.delete(key);

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
      Object.emit('change', monitorEvent);

      // Trigger boardrev run
      Object.triggerBoardrevRun(monitorEvent);
    }, Object.config.watchDebounceMs);

    Object.debounceTimers.set(key, timer);
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

    for (const hook of Object.config.gitHookTriggers) {
      try {
        await Object.createGitHook(hook);
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
        Object.config.scheduleInterval,
        () => {
          Object.handleScheduledRun();
        },
        {
          scheduled: true,
        },
      );

      Object.scheduledJobs.set('cron', job);
      logger.info(`Started cron scheduler: ${Object.config.scheduleInterval}`);
    } catch (error) {
      logger.warn(
        'Failed to load node-cron, falling back to setInterval:',
        error as Record<string, unknown>,
      );

      const fallbackInterval = Object.config.scheduleIntervalMs || 5 * 60 * 1000;
      const timer = setInterval(() => {
        Object.handleScheduledRun();
      }, fallbackInterval);

      Object.scheduledJobs.set('interval', timer);
      logger.info(`Started interval scheduler: ${fallbackInterval}ms`);
    }
  }

  private handleScheduledRun(): void {
    const monitorEvent: MonitorEvent = {
      type: 'scheduled-run',
      timestamp: new Date(),
      source: 'scheduler',
      data: {
        interval: Object.config.scheduleInterval,
      },
    };

    logger.debug('Scheduled run triggered');
    Object.emit('scheduled', monitorEvent);

    Object.triggerBoardrevRun(monitorEvent);
  }

  private async triggerBoardrevRun(triggerEvent: MonitorEvent): Promise<void> {
    // Check if we can run now
    if (Object.activeRuns.size >= Object.config.maxConcurrentRuns) {
      logger.debug('Max concurrent runs reached, queuing request');
      Object.runQueue.push(() => Object.executeBoardrevRun(triggerEvent));
      return;
    }

    await Object.executeBoardrevRun(triggerEvent);
  }

  private async executeBoardrevRun(triggerEvent: MonitorEvent): Promise<void> {
    const runId = Object.generateRunId();
    Object.activeRuns.add(runId);

    const startTime = Date.now();
    logger.info(`Starting boardrev run ${runId} triggered by ${triggerEvent.type}`);

    try {
      // Emit run start event
      Object.emit('run-start', { runId, triggerEvent });

      // Execute the boardrev pipeline
      await Object.runBoardrevPipeline(runId, triggerEvent);

      const duration = Date.now() - startTime;
      Object.updateRunStatus('success', duration);

      logger.info(`Boardrev run ${runId} completed successfully in ${duration}ms`);
      Object.emit('run-complete', { runId, triggerEvent, duration, status: 'success' });
    } catch (error) {
      const duration = Date.now() - startTime;
      Object.updateRunStatus('error', duration);

      logger.error(
        `Boardrev run ${runId} failed after ${duration}ms:`,
        error as Record<string, unknown>,
      );
      Object.emit('run-complete', { runId, triggerEvent, duration, status: 'error', error });
    } finally {
      Object.activeRuns.delete(runId);

      // Process any queued runs
      if (Object.runQueue.length > 0 && Object.activeRuns.size < Object.config.maxConcurrentRuns) {
        const nextRun = Object.runQueue.shift();
        if (nextRun) {
          setImmediate(nextRun);
        }
      }
    }
  }

  private async runBoardrevPipeline(runId: string, triggerEvent: MonitorEvent): Promise<void> {
    // Determine if we can do incremental updates
    const isIncremental =
      Object.config.incrementalUpdates &&
      triggerEvent.type === 'file-change' &&
      Object.canDoIncrementalUpdate(triggerEvent);

    if (isIncremental) {
      await Object.runIncrementalUpdate(runId, triggerEvent);
    } else {
      await Object.runFullPipeline(runId, triggerEvent);
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
        timeout: Object.config.runTimeoutMs / commands.length, // Divide timeout among commands
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
        await Object.runFullPipeline(runId, triggerEvent);
      } else {
        // For other changes, just re-index and evaluate
        execSync('pnpm br:03-index', { stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:04-match', { stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:05-eval', { stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:06-report', { stdio: 'inherit', cwd: process.cwd() });
      }
    } else {
      // For non-file changes, run full pipeline
      await Object.runFullPipeline(runId, triggerEvent);
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
    Object.status.lastRun = new Date();
    Object.status.lastRunStatus = status;
    Object.status.lastRunDuration = duration;
    Object.status.totalRuns++;

    if (status === 'error') {
      Object.status.errorCount++;
    }

    // Update status file
    Object.updateStatusFile();
  }

  private updateStatusFile(): void {
    try {
      const statusPath = join(Object.config.cacheDir, 'monitor-status.json');
      writeFileSync(statusPath, JSON.stringify(Object.status, null, 2));
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
        if (!Object.activeRuns.has(runId)) {
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

    await Object.triggerBoardrevRun(monitorEvent);
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
    Object.emit('git-hook', monitorEvent);

    await Object.triggerBoardrevRun(monitorEvent);
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
