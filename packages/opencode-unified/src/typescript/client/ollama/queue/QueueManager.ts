// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Queue Manager

import { Job, QueueMetrics, QueueConfig, JobSchedulerConfig } from '../types.js';
import { PriorityQueue } from './PriorityQueue.js';
import { JobScheduler } from './JobScheduler.js';
import { QueueMonitor } from './QueueMonitor.js';
import { randomUUID } from 'node:crypto';

export class QueueManager {
  private jobs: Map<string, Job> = new Map();
  private priorityQueue: PriorityQueue;
  private jobScheduler: JobScheduler;
  private queueMonitor: QueueMonitor;
  private config: QueueConfig;
  private schedulerConfig: JobSchedulerConfig;
  private processingInterval: NodeJS.Timeout | null = null;
  private activeJobs: Set<string> = new Set();

  constructor(config: QueueConfig, schedulerConfig: JobSchedulerConfig) {
    this.config = config;
    this.schedulerConfig = schedulerConfig;
    this.priorityQueue = new PriorityQueue();
    this.jobScheduler = new JobScheduler(schedulerConfig);
    this.queueMonitor = new QueueMonitor();
  }

  /**
   * Submit a new job to the queue
   */
  submitJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
    const job: Job = {
      ...jobData,
      id: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.jobs.set(job.id, job);
    this.priorityQueue.enqueue(job);
    this.queueMonitor.recordJobSubmission(job);

    return job;
  }

  /**
   * Get the next job to process
   */
  getNextJob(): Job | null {
    if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
      return null;
    }

    const job = this.priorityQueue.dequeue();
    if (job) {
      this.activeJobs.add(job.id);
      this.updateJobStatus(job.id, 'running');
      this.queueMonitor.recordJobStart(job);
    }

    return job;
  }

  /**
   * Complete a job
   */
  completeJob(jobId: string, result?: unknown, error?: Error): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    this.activeJobs.delete(jobId);
    
    if (error) {
      this.updateJobStatus(jobId, 'failed');
      job.error = { message: error.message, code: 'JOB_ERROR' };
      job.hasError = true;
      this.queueMonitor.recordJobFailure(job, error);
    } else {
      this.updateJobStatus(jobId, 'completed');
      job.result = result;
      job.hasResult = true;
      job.completedAt = Date.now();
      this.queueMonitor.recordJobCompletion(job);
    }
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string, agentId?: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (agentId && job.agentId !== agentId) {
      throw new Error(`Cannot cancel job from another agent: ${jobId}`);
    }

    if (job.status !== 'pending') {
      throw new Error(`Cannot cancel job in status: ${job.status}`);
    }

    this.priorityQueue.remove(jobId);
    this.updateJobStatus(jobId, 'canceled');
    job.completedAt = Date.now();
    this.queueMonitor.recordJobCancellation(job);

    return true;
  }

  /**
   * Update job status
   */
  updateJobStatus(jobId: string, status: Job['status'], metadata?: Partial<Job>): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    job.status = status;
    job.updatedAt = Date.now();

    if (metadata) {
      Object.assign(job, metadata);
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * List jobs with optional filtering
   */
  listJobs(options: {
    status?: Job['status'];
    limit?: number;
    agentOnly?: boolean;
    agentId?: string;
    sessionId?: string;
  }): Job[] {
    let jobs = Array.from(this.jobs.values());

    // Apply filters
    if (options.status) {
      jobs = jobs.filter(job => job.status === options.status);
    }

    if (options.agentOnly && options.agentId) {
      jobs = jobs.filter(job => job.agentId === options.agentId);
    }

    if (options.sessionId) {
      jobs = jobs.filter(job => job.sessionId === options.sessionId);
    }

    // Sort by creation time (newest first)
    jobs.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    if (options.limit) {
      jobs = jobs.slice(0, options.limit);
    }

    return jobs;
  }

  /**
   * Get queue metrics
   */
  getMetrics(): QueueMetrics {
    const jobs = Array.from(this.jobs.values());
    const pending = jobs.filter(j => j.status === 'pending').length;
    const running = jobs.filter(j => j.status === 'running').length;
    const completed = jobs.filter(j => j.status === 'completed').length;
    const failed = jobs.filter(j => j.status === 'failed').length;

    const completedJobs = jobs.filter(j => j.status === 'completed');
    const averageProcessingTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => {
          const processingTime = (job.completedAt || 0) - (job.startedAt || job.createdAt);
          return sum + processingTime;
        }, 0) / completedJobs.length
      : 0;

    const averageWaitTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => {
          const waitTime = (job.startedAt || job.completedAt || 0) - job.createdAt;
          return sum + waitTime;
        }, 0) / completedJobs.length
      : 0;

    return {
      totalJobs: jobs.length,
      pendingJobs: pending,
      runningJobs: running,
      completedJobs: completed,
      failedJobs: failed,
      averageWaitTime,
      averageProcessingTime,
      queueDepth: pending,
      throughput: this.queueMonitor.getThroughput(),
    };
  }

  /**
   * Get queue info (legacy compatibility)
   */
  getQueueInfo() {
    const metrics = this.getMetrics();
    return {
      pending: metrics.pendingJobs,
      running: metrics.runningJobs,
      completed: metrics.completedJobs,
      failed: metrics.failedJobs,
      canceled: jobs.filter(j => j.status === 'canceled').length,
      total: metrics.totalJobs,
      maxConcurrent: this.config.maxConcurrentJobs,
      processorActive: this.processingInterval !== null,
      cacheSize: 0, // Will be updated by cache manager
    };
  }

  /**
   * Start queue processor
   */
  startProcessor(processCallback: (job: Job) => Promise<void>): void {
    if (this.processingInterval) {
      return; // Already running
    }

    this.processingInterval = setInterval(async () => {
      try {
        const job = this.getNextJob();
        if (job) {
          await processCallback(job);
        }
      } catch (error) {
        console.error('Queue processor error:', error);
      }
    }, this.config.processingInterval);
  }

  /**
   * Stop queue processor
   */
  stopProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Clear all jobs
   */
  clearJobs(): void {
    this.jobs.clear();
    this.priorityQueue.clear();
    this.activeJobs.clear();
    this.queueMonitor.reset();
  }

  /**
   * Get queue statistics
   */
  getStatistics() {
    return {
      ...this.getMetrics(),
      schedulerConfig: this.schedulerConfig,
      queueConfig: this.config,
      activeJobs: this.activeJobs.size,
      monitorStats: this.queueMonitor.getStatistics(),
    };
  }
}