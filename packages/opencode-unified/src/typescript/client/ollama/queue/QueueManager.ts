// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Queue Manager

import { Job, QueueMetrics, QueueConfig } from '../types.js';
import { PriorityQueue } from './PriorityQueue.js';
import { QueueMonitor } from './QueueMonitor.js';
import { randomUUID } from 'node:crypto';

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
    const job: Job = {
      id: randomUUID(),
      agentId: jobData.agentId || 'default',
      sessionId: jobData.sessionId || 'default',
      modelName: jobData.modelName,
      type: jobData.jobType || 'generate',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      priority: jobData.priority || 'medium',
      prompt: jobData.prompt,
      messages: jobData.messages,
      input: jobData.input,
      options: jobData.options,
    };

    // Store job
    this.jobs.set(job.id, job);

    // Add to priority queue
    this.priorityQueue.enqueue(job);

    // Record submission
    this.queueMonitor.recordJobSubmission(job);

    return job;
  }

  /**
   * Get next job from queue
   */
  getNextJob(): Job | null {
    const job = this.priorityQueue.dequeue();
    if (job) {
      job.status = 'running';
      job.updatedAt = Date.now();
      job.startedAt = Date.now();
      this.activeJobs.add(job.id);
      this.queueMonitor.recordJobStart(job);
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
      job.completedAt = Date.now();
      job.result = result;
      job.hasResult = true;
      this.activeJobs.delete(jobId);
      this.queueMonitor.recordJobCompletion(job);
    }
  }

  /**
   * Mark job as failed
   */
  failJob(jobId: string, error: Error): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.updatedAt = Date.now();
      job.completedAt = Date.now();
      job.error = { message: error.message };
      job.hasError = true;
      this.activeJobs.delete(jobId);
      this.queueMonitor.recordJobFailure(job, error);
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
    const jobs = Array.from(this.jobs.values());
    const pendingJobs = jobs.filter((job) => job.status === 'pending').length;
    const runningJobs = jobs.filter((job) => job.status === 'running').length;
    const completedJobs = jobs.filter((job) => job.status === 'completed').length;
    const failedJobs = jobs.filter((job) => job.status === 'failed').length;

    const monitorMetrics = this.queueMonitor.getMetrics();
    return {
      totalJobs: jobs.length,
      pendingJobs,
      runningJobs,
      completedJobs,
      failedJobs,
      averageWaitTime: monitorMetrics.averageWaitTime,
      averageProcessingTime: monitorMetrics.averageProcessingTime,
      queueDepth: pendingJobs,
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
