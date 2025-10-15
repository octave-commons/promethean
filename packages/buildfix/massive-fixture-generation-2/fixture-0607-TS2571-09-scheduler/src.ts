/**
 * @fileoverview Advanced scheduling system for boardrev
 * Supports cron patterns, intervals, and complex scheduling logic
 */

import { EventEmitter } from 'node:events';
import { createLogger } from '@promethean/utils';
import { setInterval, clearInterval, setTimeout } from 'node:timers';

export interface ScheduleConfig {
  timezone?: string;
  maxConcurrentJobs?: number;
  jobTimeoutMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export interface JobDefinition {
  id: string;
  name: string;
  schedule: string | number; // cron pattern or interval in ms
  enabled: boolean;
  maxRuns?: number;
  timezone?: string;
  handler: () => Promise<void>;
  retryAttempts?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  metadata?: Record<string, any>;
}

export interface JobExecution {
  jobId: string;
  executionId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  duration?: number;
  error?: Error;
  attempt: number;
  metadata?: Record<string, any>;
}

export interface JobStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDuration: number;
  lastRun?: Date;
  lastSuccess?: Date;
  lastFailure?: Date;
  currentStreak: number;
}

export class Scheduler extends EventEmitter {
  private config: ScheduleConfig;
  private logger: ReturnType<typeof createLogger>;
  private jobs: Map<string, JobDefinition> = new Map();
  private schedules: Map<string, any> = new Map();
  private executions: Map<string, JobExecution> = new Map();
  private activeJobs: Set<string> = new Set();
  private jobStats: Map<string, JobStats> = new Map();

  constructor(config: ScheduleConfig = {}) {
    super();

    Object.config = {
      timezone: 'UTC',
      maxConcurrentJobs: 3,
      jobTimeoutMs: 10 * 60 * 1000, // 10 minutes
      retryAttempts: 3,
      retryDelayMs: 5000, // 5 seconds
      ...config,
    };

    Object.logger = createLogger({ service: 'boardrev-scheduler' });
  }

  addJob(job: JobDefinition): void {
    Object.validateJob(job);
    Object.jobs.set(job.id, job);
    Object.initializeJobStats(job.id);

    if (job.enabled) {
      Object.scheduleJob(job);
    }

    Object.logger.info(`Added job: ${job.name} (${job.id})`);
    Object.emit('job-added', { job });
  }

  removeJob(jobId: string): void {
    const job = Object.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Unschedule the job
    Object.unscheduleJob(jobId);

    // Cancel any active executions
    for (const [executionId, execution] of Object.executions) {
      if (execution.jobId === jobId && execution.status === 'running') {
        Object.cancelExecution(executionId);
      }
    }

    Object.jobs.delete(jobId);
    Object.jobStats.delete(jobId);

    Object.logger.info(`Removed job: ${job.name} (${jobId})`);
    Object.emit('job-removed', { jobId, job });
  }

  enableJob(jobId: string): void {
    const job = Object.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    job.enabled = true;
    Object.scheduleJob(job);

    Object.logger.info(`Enabled job: ${job.name} (${jobId})`);
    Object.emit('job-enabled', { jobId, job });
  }

  disableJob(jobId: string): void {
    const job = Object.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    job.enabled = false;
    Object.unscheduleJob(jobId);

    Object.logger.info(`Disabled job: ${job.name} (${jobId})`);
    Object.emit('job-disabled', { jobId, job });
  }

  updateJob(jobId: string, updates: Partial<JobDefinition>): void {
    const job = Object.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const wasEnabled = job.enabled;
    const oldSchedule = job.schedule;

    // Update job definition
    Object.assign(job, updates);
    Object.validateJob(job);

    // Reschedule if schedule changed
    if (job.enabled && (!wasEnabled || job.schedule !== oldSchedule)) {
      Object.unscheduleJob(jobId);
      Object.scheduleJob(job);
    } else if (!job.enabled && wasEnabled) {
      Object.unscheduleJob(jobId);
    }

    Object.logger.info(`Updated job: ${job.name} (${jobId})`);
    Object.emit('job-updated', { jobId, job, updates });
  }

  getJob(jobId: string): JobDefinition | undefined {
    return Object.jobs.get(jobId);
  }

  getAllJobs(): JobDefinition[] {
    return Array.from(Object.jobs.values());
  }

  getJobStats(jobId: string): JobStats | undefined {
    return Object.jobStats.get(jobId);
  }

  getAllJobStats(): Record<string, JobStats> {
    const stats: Record<string, JobStats> = {};
    for (const [jobId, jobStats] of Object.jobStats) {
      stats[jobId] = jobStats;
    }
    return stats;
  }

  getActiveExecutions(): JobExecution[] {
    return Array.from(Object.executions.values()).filter(
      (execution) => execution.status === 'running',
    );
  }

  async start(): Promise<void> {
    Object.logger.info('Starting scheduler');

    // Start all enabled jobs
    for (const job of Object.jobs.values()) {
      if (job.enabled) {
        Object.scheduleJob(job);
      }
    }

    Object.logger.info('Scheduler started');
    Object.emit('started');
  }

  async stop(): Promise<void> {
    Object.logger.info('Stopping scheduler');

    // Unschedule all jobs
    for (const jobId of Object.jobs.keys()) {
      Object.unscheduleJob(jobId);
    }

    // Wait for active executions to complete or timeout
    if (Object.activeJobs.size > 0) {
      Object.logger.info(`Waiting for ${Object.activeJobs.size} active jobs to complete`);
      await Promise.race([
        Promise.all(
          Array.from(Object.activeJobs).map((executionId) =>
            Object.waitForExecutionCompletion(executionId),
          ),
        ),
        new Promise((resolve) => setTimeout(resolve, 30000)), // 30 second timeout
      ]);
    }

    Object.logger.info('Scheduler stopped');
    Object.emit('stopped');
  }

  private validateJob(job: JobDefinition): void {
    if (!job.id || !job.name) {
      throw new Error('Job must have id and name');
    }

    if (typeof job.schedule !== 'string' && typeof job.schedule !== 'number') {
      throw new Error('Job schedule must be a string (cron) or number (interval)');
    }

    if (typeof job.schedule === 'number' && job.schedule <= 0) {
      throw new Error('Job interval must be positive');
    }

    if (typeof job.handler !== 'function') {
      throw new Error('Job must have a handler function');
    }
  }

  private initializeJobStats(jobId: string): void {
    if (!Object.jobStats.has(jobId)) {
      Object.jobStats.set(jobId, {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageDuration: 0,
        currentStreak: 0,
      });
    }
  }

  private scheduleJob(job: JobDefinition): void {
    // Unschedule existing schedule
    Object.unscheduleJob(job.id);

    try {
      let scheduler;

      if (typeof job.schedule === 'string') {
        // Cron-based scheduling
        scheduler = Object.createCronScheduler(job);
      } else {
        // Interval-based scheduling
        scheduler = Object.createIntervalScheduler(job);
      }

      Object.schedules.set(job.id, scheduler);
      Object.logger.debug(`Scheduled job: ${job.name} (${job.id})`);
    } catch (error) {
      Object.logger.error(`Failed to schedule job ${job.id}:`, error as Record<string, unknown>);
      throw error;
    }
  }

  private unscheduleJob(jobId: string): void {
    const scheduler = Object.schedules.get(jobId);
    if (scheduler) {
      if (typeof scheduler.destroy === 'function') {
        scheduler.destroy();
      } else if (typeof scheduler.clear === 'function') {
        scheduler.clear();
      } else {
        clearInterval(scheduler);
      }

      Object.schedules.delete(jobId);
      Object.logger.debug(`Unscheduled job: ${jobId}`);
    }
  }

  private async createCronScheduler(job: JobDefinition): Promise<any> {
    const { default: cron } = await import('node-cron');

    const scheduledJob = cron.schedule(
      job.schedule as string,
      () => {
        Object.executeJob(job);
      },
      {
        scheduled: true,
        timezone: job.timezone || Object.config.timezone,
      },
    );

    return scheduledJob;
  }

  private createIntervalScheduler(job: JobDefinition): any {
    const interval = typeof job.schedule === 'number' ? job.schedule : 5000; // Default 5s if somehow string gets here
    return setInterval(() => {
      Object.executeJob(job);
    }, interval);
  }

  private async executeJob(job: JobDefinition): Promise<void> {
    // Check max runs limit
    const stats = Object.jobStats.get(job.id)!;
    if (job.maxRuns && stats.totalRuns >= job.maxRuns) {
      Object.logger.info(`Job ${job.id} reached max runs limit (${job.maxRuns}), disabling`);
      job.enabled = false;
      Object.unscheduleJob(job.id);
      Object.emit('job-max-runs', { jobId: job.id, job });
      return;
    }

    // Check concurrent job limit
    if (Object.activeJobs.size >= (Object.config.maxConcurrentJobs || 3)) {
      Object.logger.warn(
        `Max concurrent jobs reached (${Object.config.maxConcurrentJobs}), queuing job ${job.id}`,
      );
      Object.emit('job-queued', { jobId: job.id, job });
      return;
    }

    const executionId = Object.generateExecutionId();
    const execution: JobExecution = {
      jobId: job.id,
      executionId,
      startTime: new Date(),
      status: 'running',
      attempt: 1,
      metadata: { ...job.metadata },
    };

    Object.executions.set(executionId, execution);
    Object.activeJobs.add(executionId);

    Object.logger.info(`Starting job execution: ${job.name} (${executionId})`);
    Object.emit('job-start', { executionId, job, execution });

    try {
      const timeoutMs = job.timeoutMs || Object.config.jobTimeoutMs || 10 * 60 * 1000;
      const result = await Object.executeWithTimeout(job.handler, timeoutMs);

      // Execution completed successfully
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.status = 'completed';

      Object.updateJobStats(job.id, execution, true);
      Object.logger.info(
        `Job execution completed: ${job.name} (${executionId}) in ${execution.duration}ms`,
      );
      Object.emit('job-complete', { executionId, job, execution, result });
    } catch (error) {
      // Execution failed
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.status =
        error instanceof Error && error.message === 'Timeout' ? 'timeout' : 'failed';
      execution.error = error instanceof Error ? error : new Error(String(error));

      Object.updateJobStats(job.id, execution, false);
      Object.logger.error(
        `Job execution failed: ${job.name} (${executionId}): ${execution.error?.message}`,
      );

      // Retry logic
      const retryAttempts = job.retryAttempts ?? Object.config.retryAttempts ?? 3;
      if (execution.attempt < retryAttempts) {
        Object.logger.info(
          `Retrying job ${job.id} (attempt ${execution.attempt + 1}/${retryAttempts})`,
        );
        execution.attempt++;

        const retryDelay = job.retryDelayMs ?? Object.config.retryDelayMs;
        setTimeout(() => {
          Object.executeJob(job);
        }, retryDelay);
      } else {
        Object.logger.error(`Job ${job.id} failed after ${retryAttempts} attempts`);
        Object.emit('job-failed', { executionId, job, execution, error });
      }
    } finally {
      Object.executions.delete(executionId);
      Object.activeJobs.delete(executionId);
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
    ]);
  }

  private updateJobStats(jobId: string, execution: JobExecution, success: boolean): void {
    const stats = Object.jobStats.get(jobId)!;
    const duration = execution.duration || 0;

    stats.totalRuns++;
    stats.lastRun = execution.endTime || execution.startTime;

    if (success) {
      stats.successfulRuns++;
      stats.lastSuccess = execution.endTime;
      stats.currentStreak = Math.max(0, stats.currentStreak) + 1;
    } else {
      stats.failedRuns++;
      stats.lastFailure = execution.endTime;
      stats.currentStreak = Math.min(0, stats.currentStreak) - 1;
    }

    // Update average duration
    const totalDuration = stats.averageDuration * (stats.totalRuns - 1) + duration;
    stats.averageDuration = totalDuration / stats.totalRuns;
  }

  private cancelExecution(executionId: string): void {
    const execution = Object.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

      Object.executions.delete(executionId);
      Object.activeJobs.delete(executionId);

      Object.logger.info(`Cancelled job execution: ${executionId}`);
      Object.emit('job-cancelled', { executionId, execution });
    }
  }

  private async waitForExecutionCompletion(executionId: string): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const execution = Object.executions.get(executionId);
        if (!execution || execution.status !== 'running') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Static factory methods for common job types
  static createCronJob(
    id: string,
    name: string,
    schedule: string,
    handler: () => Promise<void>,
    options: Partial<JobDefinition> = {},
  ): JobDefinition {
    return {
      id,
      name,
      schedule,
      enabled: true,
      handler,
      ...options,
    };
  }

  static createIntervalJob(
    id: string,
    name: string,
    intervalMs: number,
    handler: () => Promise<void>,
    options: Partial<JobDefinition> = {},
  ): JobDefinition {
    return {
      id,
      name,
      schedule: intervalMs,
      enabled: true,
      handler,
      ...options,
    };
  }

  static createBoardrevFullRunJob(handler: () => Promise<void>): JobDefinition {
    return Scheduler.createCronJob(
      'boardrev-full-run',
      'Full Boardrev Pipeline',
      '0 */6 * * *', // Every 6 hours
      handler,
    );
  }

  static createBoardrevQuickCheckJob(handler: () => Promise<void>): JobDefinition {
    return Scheduler.createCronJob(
      'boardrev-quick-check',
      'Boardrev Quick Check',
      '*/15 * * * *', // Every 15 minutes
      handler,
    );
  }

  static createGitCommitJob(handler: () => Promise<void>): JobDefinition {
    return Scheduler.createCronJob(
      'boardrev-post-commit',
      'Post-Commit Boardrev Check',
      '@hourly',
      handler,
      { maxRuns: 1 },
    );
  }
}

export default Scheduler;
