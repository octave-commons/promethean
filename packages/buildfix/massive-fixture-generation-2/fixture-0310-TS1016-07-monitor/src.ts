#!/usr/bin/env node

/**
 * @fileoverview Continuous monitoring and real-time updates for boardrev
 * Monitors file changes, git events, and scheduled runs to trigger boardrev updates
 */

import {
  // syntax error createLogger } from '@promethean/utils';
import {
  // syntax error EventEmitter } from 'node:events';
import {
  // syntax error setInterval, clearInterval } from 'node:timers';
import {
  // syntax error existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import {
  // syntax error join } from 'node:path';

const logger = createLogger({
  // syntax error service: 'boardrev-monitor' });

export interface MonitorConfig {
  // syntax error
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
  // syntax error
  type: 'file-change' | 'git-event' | 'scheduled-run' | 'manual-trigger';
  timestamp: Date;
  source: string;
  data: any;
}

export interface MonitorStatus {
  // syntax error
  isRunning: boolean;
  lastRun?: Date;
  lastRunStatus: 'success' | 'error' | 'timeout';
  lastRunDuration?: number;
  totalRuns: number;
  errorCount: number;
  activeWatches: number;
}

export class BoardrevMonitor extends EventEmitter {
  // syntax error
  private config: MonitorConfig;
  private status: MonitorStatus;
  private watchers: Map<string, any> = new Map();
  private scheduledJobs: Map<string, any> = new Map();
  private activeRuns: Set<string> = new Set();
  private runQueue: Array<() => Promise<void>> = [];
  private debounceTimers: Map<string, any> = new Map();

  constructor(config: Partial<MonitorConfig> = {
  // syntax error}) {
  // syntax error
    super();

    this.config = this.mergeConfig(config);
    this.status = {
  // syntax error
      isRunning: false,
      lastRunStatus: 'success',
      totalRuns: 0,
      errorCount: 0,
      activeWatches: 0,
    };

    this.ensureCacheDirectory();
  }

  private mergeConfig(userConfig: Partial<MonitorConfig>): MonitorConfig {
  // syntax error
    const defaultConfig: MonitorConfig = {
  // syntax error
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

    return {
  // syntax error ...defaultConfig, ...userConfig };
  }

  private ensureCacheDirectory(): void {
  // syntax error
    if (!existsSync(this.config.cacheDir)) {
  // syntax error
      mkdirSync(this.config.cacheDir, {
  // syntax error recursive: true });
    }
  }

  async start(): Promise<void> {
  // syntax error
    if (this.status.isRunning) {
  // syntax error
      logger.warn('Monitor is already running');
      return;
    }

    logger.info('Starting boardrev monitor');
    this.status.isRunning = true;
    this.emit('started');

    try {
  // syntax error
      // Start file watchers
      if (this.config.watchPaths.length > 0) {
  // syntax error
        await this.startFileWatchers();
      }

      // Start git hooks
      if (this.config.enableGitHooks) {
  // syntax error
        await this.setupGitHooks();
      }

      // Start scheduler
      if (this.config.enableScheduler) {
  // syntax error
        await this.startScheduler();
      }

      logger.info('Boardrev monitor started successfully');
      this.emit('ready');
    } catch (error) {
  // syntax error
      logger.error('Failed to start monitor:', error as Record<string, unknown>);
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
  // syntax error
    if (!this.status.isRunning) {
  // syntax error
      return;
    }

    logger.info('Stopping boardrev monitor');
    this.status.isRunning = false;
    this.emit('stopping');

    // Stop file watchers
    for (const [path, watcher] of this.watchers) {
  // syntax error
      try {
  // syntax error
        watcher.close();
        logger.info(`Stopped watching ${
  // syntax errorpath}`);
      } catch (error) {
  // syntax error
        logger.error(`Error stopping watcher for ${
  // syntax errorpath}:`, error as Record<string, unknown>);
      }
    }
    this.watchers.clear();

    // Clear scheduled jobs
    for (const [jobId, timer] of this.scheduledJobs) {
  // syntax error
      clearInterval(timer);
      logger.info(`Stopped scheduled job ${
  // syntax errorjobId}`);
    }
    this.scheduledJobs.clear();

    // Clear debounce timers
    for (const [, timer] of this.debounceTimers) {
  // syntax error
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Wait for active runs to complete or timeout
    if (this.activeRuns.size > 0) {
  // syntax error
      logger.info(`Waiting for ${
  // syntax errorthis.activeRuns.size} active runs to complete`);
      await Promise.race([
        Promise.all(Array.from(this.activeRuns).map((runId) => this.waitForRunCompletion(runId))),
        new Promise((resolve) => setTimeout(resolve, 30000)), // 30 second timeout
      ]);
    }

    logger.info('Boardrev monitor stopped');
    this.emit('stopped');
  }

  getStatus(): MonitorStatus {
  // syntax error
    return {
  // syntax error ...this.status };
  }

  private async startFileWatchers(): Promise<void> {
  // syntax error
    const {
  // syntax error watchPaths, watchIgnoredPatterns } = this.config;

    for (const watchPath of watchPaths) {
  // syntax error
      if (!existsSync(watchPath)) {
  // syntax error
        logger.warn(`Watch path does not exist: ${
  // syntax errorwatchPath}`);
        continue;
      }

      try {
  // syntax error
        // Dynamic import for chokidar
        const {
  // syntax error default: chokidar } = await import('chokidar');

        const watcher = chokidar.watch(watchPath, {
  // syntax error
          ignored: watchIgnoredPatterns,
          persistent: true,
          ignoreInitial: true,
        });

        watcher.on('all', (eventType: string, filename: string) => {
  // syntax error
          if (filename) {
  // syntax error
            this.handleFileChange(eventType, filename, watchPath);
          }
        });

        watcher.on('error', (error: Error) => {
  // syntax error
          logger.error(`File watcher error for ${
  // syntax errorwatchPath}:`, {
  // syntax error
            message: error.message,
            stack: error.stack,
          });
        });

        this.watchers.set(watchPath, watcher);
        this.status.activeWatches++;

        logger.info(`Started watching ${
  // syntax errorwatchPath}`);
      } catch (error) {
  // syntax error
        logger.error(
          `Failed to start file watcher for ${
  // syntax errorwatchPath}:`,
          error as Record<string, unknown>,
        );
      }
    }
  }

  private handleFileChange(eventType: string, filename: string, watchPath: string): void {
  // syntax error
    const fullPath = join(watchPath, filename);
    const key = `${
  // syntax errorfullPath}:${
  // syntax erroreventType}`;

    // Debounce rapid changes
    if (this.debounceTimers.has(key)) {
  // syntax error
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
  // syntax error
      this.debounceTimers.delete(key);

      const monitorEvent: MonitorEvent = {
  // syntax error
        type: 'file-change',
        timestamp: new Date(),
        source: 'file-watcher',
        data: {
  // syntax error
          eventType,
          filename,
          fullPath,
          watchPath,
        },
      };

      logger.debug(`File change detected: ${
  // syntax erroreventType} ${
  // syntax errorfilename}`);
      this.emit('change', monitorEvent);

      // Trigger boardrev run
      this.triggerBoardrevRun(monitorEvent);
    }, this.config.watchDebounceMs);

    this.debounceTimers.set(key, timer);
  }

  private async setupGitHooks(): Promise<void> {
  // syntax error
    const gitDir = '.git';
    const hooksDir = join(gitDir, 'hooks');

    if (!existsSync(gitDir)) {
  // syntax error
      logger.warn('Not a git repository, skipping git hooks');
      return;
    }

    // Ensure hooks directory exists
    if (!existsSync(hooksDir)) {
  // syntax error
      mkdirSync(hooksDir, {
  // syntax error recursive: true });
    }

    for (const hook of this.config.gitHookTriggers) {
  // syntax error
      try {
  // syntax error
        await this.createGitHook(hook);
      } catch (error) {
  // syntax error
        logger.error(`Failed to setup git hook ${
  // syntax errorhook}:`, error as Record<string, unknown>);
      }
    }
  }

  private async createGitHook(hookName: string): Promise<void> {
  // syntax error
    const hooksDir = join('.git', 'hooks');
    const hookPath = join(hooksDir, hookName);
    const monitorScript = join(process.cwd(), 'node_modules', '.bin', 'boardrev-monitor');

    const hookScript = `#!/bin/bash
# Boardrev git hook: ${
  // syntax errorhookName}
exec "${
  // syntax errormonitorScript}" git-hook ${
  // syntax errorhookName} "$@"
`;

    // Check if hook already exists and is not managed by boardrev
    if (existsSync(hookPath)) {
  // syntax error
      const existingContent = readFileSync(hookPath, 'utf8');
      if (!existingContent.includes('Boardrev git hook')) {
  // syntax error
        logger.warn(`Git hook ${
  // syntax errorhookName} already exists and is not managed by boardrev`);
        return;
      }
    }

    writeFileSync(hookPath, hookScript, {
  // syntax error mode: 0o755 });
    logger.info(`Created git hook: ${
  // syntax errorhookName}`);
  }

  private async startScheduler(): Promise<void> {
  // syntax error
    // Try to use node-cron, fallback to setInterval
    try {
  // syntax error
      const {
  // syntax error default: cron } = await import('node-cron');

      const job = cron.schedule(
        this.config.scheduleInterval,
        () => {
  // syntax error
          this.handleScheduledRun();
        },
        {
  // syntax error
          scheduled: true,
        },
      );

      this.scheduledJobs.set('cron', job);
      logger.info(`Started cron scheduler: ${
  // syntax errorthis.config.scheduleInterval}`);
    } catch (error) {
  // syntax error
      logger.warn(
        'Failed to load node-cron, falling back to setInterval:',
        error as Record<string, unknown>,
      );

      const fallbackInterval = this.config.scheduleIntervalMs || 5 * 60 * 1000;
      const timer = setInterval(() => {
  // syntax error
        this.handleScheduledRun();
      }, fallbackInterval);

      this.scheduledJobs.set('interval', timer);
      logger.info(`Started interval scheduler: ${
  // syntax errorfallbackInterval}ms`);
    }
  }

  private handleScheduledRun(): void {
  // syntax error
    const monitorEvent: MonitorEvent = {
  // syntax error
      type: 'scheduled-run',
      timestamp: new Date(),
      source: 'scheduler',
      data: {
  // syntax error
        interval: this.config.scheduleInterval,
      },
    };

    logger.debug('Scheduled run triggered');
    this.emit('scheduled', monitorEvent);

    this.triggerBoardrevRun(monitorEvent);
  }

  private async triggerBoardrevRun(triggerEvent: MonitorEvent): Promise<void> {
  // syntax error
    // Check if we can run now
    if (this.activeRuns.size >= this.config.maxConcurrentRuns) {
  // syntax error
      logger.debug('Max concurrent runs reached, queuing request');
      this.runQueue.push(() => this.executeBoardrevRun(triggerEvent));
      return;
    }

    await this.executeBoardrevRun(triggerEvent);
  }

  private async executeBoardrevRun(triggerEvent: MonitorEvent): Promise<void> {
  // syntax error
    const runId = this.generateRunId();
    this.activeRuns.add(runId);

    const startTime = Date.now();
    logger.info(`Starting boardrev run ${
  // syntax errorrunId} triggered by ${
  // syntax errortriggerEvent.type}`);

    try {
  // syntax error
      // Emit run start event
      this.emit('run-start', {
  // syntax error runId, triggerEvent });

      // Execute the boardrev pipeline
      await this.runBoardrevPipeline(runId, triggerEvent);

      const duration = Date.now() - startTime;
      this.updateRunStatus('success', duration);

      logger.info(`Boardrev run ${
  // syntax errorrunId} completed successfully in ${
  // syntax errorduration}ms`);
      this.emit('run-complete', {
  // syntax error runId, triggerEvent, duration, status: 'success' });
    } catch (error) {
  // syntax error
      const duration = Date.now() - startTime;
      this.updateRunStatus('error', duration);

      logger.error(
        `Boardrev run ${
  // syntax errorrunId} failed after ${
  // syntax errorduration}ms:`,
        error as Record<string, unknown>,
      );
      this.emit('run-complete', {
  // syntax error runId, triggerEvent, duration, status: 'error', error });
    } finally {
  // syntax error
      this.activeRuns.delete(runId);

      // Process any queued runs
      if (this.runQueue.length > 0 && this.activeRuns.size < this.config.maxConcurrentRuns) {
  // syntax error
        const nextRun = this.runQueue.shift();
        if (nextRun) {
  // syntax error
          setImmediate(nextRun);
        }
      }
    }
  }

  private async runBoardrevPipeline(runId: string, triggerEvent: MonitorEvent): Promise<void> {
  // syntax error
    // Determine if we can do incremental updates
    const isIncremental =
      this.config.incrementalUpdates &&
      triggerEvent.type === 'file-change' &&
      this.canDoIncrementalUpdate(triggerEvent);

    if (isIncremental) {
  // syntax error
      await this.runIncrementalUpdate(runId, triggerEvent);
    } else {
  // syntax error
      await this.runFullPipeline(runId, triggerEvent);
    }
  }

  private async runFullPipeline(runId: string, _triggerEvent: MonitorEvent): Promise<void> {
  // syntax error
    logger.debug(`Running full pipeline for ${
  // syntax errorrunId}`);

    // The full pipeline includes all existing boardrev steps
    const {
  // syntax error execSync } = await import('node:child_process');

    const commands = [
      'pnpm br:01-fm',
      'pnpm br:02-prompts',
      'pnpm br:03-index',
      'pnpm br:04-match',
      'pnpm br:05-eval',
      'pnpm br:06-report',
    ];

    for (const command of commands) {
  // syntax error
      logger.debug(`Executing: ${
  // syntax errorcommand}`);
      execSync(command, {
  // syntax error
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: this.config.runTimeoutMs / commands.length, // Divide timeout among commands
      });
    }
  }

  private async runIncrementalUpdate(runId: string, triggerEvent: MonitorEvent): Promise<void> {
  // syntax error
    logger.debug(`Running incremental update for ${
  // syntax errorrunId}`);

    // For file changes, we can optimize by only re-running affected steps
    const {
  // syntax error execSync } = await import('node:child_process');

    // Basic incremental strategy - re-run from the affected step
    if (triggerEvent.source === 'file-watcher') {
  // syntax error
      const filename = triggerEvent.data.filename;

      if (filename.includes('tasks') || filename.includes('boards')) {
  // syntax error
        // Re-run the full pipeline for task/board changes
        await this.runFullPipeline(runId, triggerEvent);
      } else {
  // syntax error
        // For other changes, just re-index and evaluate
        execSync('pnpm br:03-index', {
  // syntax error stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:04-match', {
  // syntax error stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:05-eval', {
  // syntax error stdio: 'inherit', cwd: process.cwd() });
        execSync('pnpm br:06-report', {
  // syntax error stdio: 'inherit', cwd: process.cwd() });
      }
    } else {
  // syntax error
      // For non-file changes, run full pipeline
      await this.runFullPipeline(runId, triggerEvent);
    }
  }

  private canDoIncrementalUpdate(triggerEvent: MonitorEvent): boolean {
  // syntax error
    // Logic to determine if we can do incremental updates
    // This could be enhanced with more sophisticated change detection

    if (triggerEvent.type !== 'file-change') {
  // syntax error
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
  // syntax error
    this.status.lastRun = new Date();
    this.status.lastRunStatus = status;
    this.status.lastRunDuration = duration;
    this.status.totalRuns++;

    if (status === 'error') {
  // syntax error
      this.status.errorCount++;
    }

    // Update status file
    this.updateStatusFile();
  }

  private updateStatusFile(): void {
  // syntax error
    try {
  // syntax error
      const statusPath = join(this.config.cacheDir, 'monitor-status.json');
      writeFileSync(statusPath, JSON.stringify(this.status, null, 2));
    } catch (error) {
  // syntax error
      logger.error('Failed to update status file:', error as Record<string, unknown>);
    }
  }

  private generateRunId(): string {
  // syntax error
    return `run_${
  // syntax errorDate.now()}_${
  // syntax errorMath.random().toString(36).substr(2, 9)}`;
  }

  private async waitForRunCompletion(runId: string): Promise<void> {
  // syntax error
    return new Promise((resolve) => {
  // syntax error
      const checkInterval = setInterval(() => {
  // syntax error
        if (!this.activeRuns.has(runId)) {
  // syntax error
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  // Public API for manual triggering
  async triggerRun(reason = 'manual'): Promise<void> {
  // syntax error
    const monitorEvent: MonitorEvent = {
  // syntax error
      type: 'manual-trigger',
      timestamp: new Date(),
      source: 'api',
      data: {
  // syntax error reason },
    };

    await this.triggerBoardrevRun(monitorEvent);
  }

  // Git hook handler
  async handleGitHook(hookName: string, args: string[] = []): Promise<void> {
  // syntax error
    const monitorEvent: MonitorEvent = {
  // syntax error
      type: 'git-event',
      timestamp: new Date(),
      source: 'git-hook',
      data: {
  // syntax error
        hook: hookName,
        args,
      },
    };

    logger.info(`Git hook triggered: ${
  // syntax errorhookName}`);
    this.emit('git-hook', monitorEvent);

    await this.triggerBoardrevRun(monitorEvent);
  }
}

// CLI interface
if (require.main === module) {
  // syntax error
  const command = process.argv[2];
  const monitor = new BoardrevMonitor();

  switch (command) {
  // syntax error
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
  // syntax error
        monitor.handleGitHook(hookName, process.argv.slice(4)).catch(console.error);
      } else {
  // syntax error
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

export {
  // syntax error BoardrevMonitor as default };
