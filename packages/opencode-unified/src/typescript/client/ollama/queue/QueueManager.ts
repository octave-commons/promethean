// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Queue Manager

import { Job, QueueMetrics, QueueConfig, JobSchedulerConfig } from '../types.js';
import { PriorityQueue } from './PriorityQueue.js';
import { QueueMonitor } from './QueueMonitor.js';
import { randomUUID } from 'node:crypto';
import { validateJobSubmission } from '../../../shared/validation.js';

export class QueueManager {
  private jobs: Map<string, Job> = new Map();
  private priorityQueue: PriorityQueue;
  private queueMonitor: QueueMonitor;
  private config: QueueConfig;
  private processingInterval: NodeJS.Timeout | null = null;
  private activeJobs: Set<string> = new Set();

  constructor(config: QueueConfig) {
    this.config = config;
    this.priorityQueue = new PriorityQueue();
    this.queueMonitor = new QueueMonitor();
  }

  /**
   * Add a job to the queue
   */
  async addJob(jobData: any): Promise<Job> {
    // Validate job submission
    const validation = await validateJobSubmission(jobData, this.config.validation);
    if (!validation.isValid) {
      throw new Error(
        `Job validation failed: ${validation.errors.map((e) => e.message).join(', ')}`,
      );
    }

    const job: Job = {
      id: randomUUID(),
      ...jobData,
      status: 'queued',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: jobData.priority || 'medium',
      attempts: 0,
      maxAttempts: jobData.maxAttempts || 3,
    };

    // Store job
    this.jobs.set(job.id, job);

    // Add to priority queue
    this.priorityQueue.enqueue(job);

    // Update metrics
    this.queueMonitor.recordJobQueued();

    return job;
  }

  /**
   * Get next job from queue
   */
  getNextJob(): Job | null {
    const job = this.priorityQueue.dequeue();
    if (job) {
      job.status = 'pending';
      job.updatedAt = Date.now();
      this.activeJobs.add(job.id);
      this.queueMonitor.recordJobDequeued();
    }
    return job;
  }

  /**
   * Mark job as completed
   */
  completeJob(jobId: string, result?: any): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.updatedAt = Date.now();
      job.result = result;
      this.activeJobs.delete(jobId);
      this.queueMonitor.recordJobCompleted();
    }
  }

  /**
   * Mark job as failed
   */
  failJob(jobId: string, error: Error): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.attempts++;
      job.updatedAt = Date.now();
      job.lastError = error.message;

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        this.activeJobs.delete(jobId);
        this.queueMonitor.recordJobFailed();
      } else {
        // Re-queue for retry
        job.status = 'queued';
        this.priorityQueue.enqueue(job);
        this.queueMonitor.recordJobRetry();
      }
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * List jobs with filtering
   */
  listJobs(
    options: {
      status?: Job['status'];
      limit?: number;
      agentOnly?: boolean;
      agentId?: string;
      sessionId?: string;
    } = {},
  ): Job[] {
    let jobs = Array.from(this.jobs.values());

    // Filter by status
    if (options.status) {
      jobs = jobs.filter((job) => job.status === options.status);
    }

    // Filter by agent
    if (options.agentOnly && options.agentId) {
      jobs = jobs.filter((job) => job.agentId === options.agentId);
    }

    if (options.sessionId) {
      jobs = jobs.filter((job) => job.sessionId === options.sessionId);
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
    const statusCounts = this.jobs.values().reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: this.jobs.size,
      queued: statusCounts.queued || 0,
      pending: statusCounts.pending || 0,
      processing: this.activeJobs.size,
      completed: statusCounts.completed || 0,
      failed: statusCounts.failed || 0,
      averageWaitTime: this.queueMonitor.getAverageWaitTime(),
      throughput: this.queueMonitor.getThroughput(),
    };
  }

  /**
   * Get queue information
   */
  getQueueInfo() {
    return {
      config: this.config,
      metrics: this.getMetrics(),
      activeJobs: Array.from(this.activeJobs),
    };
  }

  /**
   * Start automatic job processor
   */
  startProcessor(processCallback: (job: Job) => Promise<void>): void {
    if (this.processingInterval) {
      this.stopProcessor();
    }

    this.processingInterval = setInterval(async () => {
      const job = this.getNextJob();
      if (job) {
        try {
          await processCallback(job);
          this.completeJob(job.id);
        } catch (error) {
          this.failJob(job.id, error as Error);
        }
      }
    }, this.config.processingInterval || 1000);
  }

  /**
   * Stop automatic job processor
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
      config: this.config,
      uptime: process.uptime(),
    };
  }
}
