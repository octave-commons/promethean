// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Queue Manager

import { Job, QueueMetrics, QueueConfig, JobSchedulerConfig } from '../types.js';
import { PriorityQueue } from './PriorityQueue.js';
// import { JobScheduler } from './JobScheduler.js'; // Uncomment when needed for advanced scheduling
import { QueueMonitor } from './QueueMonitor.js';
import { randomUUID } from 'node:crypto';
import { validateJobSubmission } from '../../../shared/validation.js';
import { AuthManager, AuthenticationError } from '../../../shared/auth.js';

export class QueueManager {
  private jobs: Map<string, Job> = new Map();
  private priorityQueue: PriorityQueue;
  // private jobScheduler: JobScheduler; // Uncomment when needed for advanced scheduling
  private queueMonitor: QueueMonitor;
  private config: QueueConfig;
  private schedulerConfig: JobSchedulerConfig;
  private processingInterval: NodeJS.Timeout | null = null;
  private activeJobs: Set<string> = new Set();
  private authManager: AuthManager;

  constructor(config: QueueConfig, schedulerConfig: JobSchedulerConfig, authManager?: AuthManager) {
    this.config = config;
    this.schedulerConfig = schedulerConfig;
    this.priorityQueue = new PriorityQueue();
    // this.jobScheduler = new JobScheduler(schedulerConfig); // Uncomment when needed for advanced scheduling
    this.queueMonitor = new QueueMonitor();
    this.authManager = authManager || new AuthManager();
  }

  /**
   * Submit a new job to the queue with authentication
   */
  async submitJob(
    jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>,
    authToken?: string,
  ): Promise<Job> {
    // Authenticate agent if token provided
    if (authToken) {
      try {
        const tokenPayload = await this.authManager.verifyToken(authToken);
        const agent = this.authManager.getAgent(tokenPayload.sub);

        if (!agent) {
          throw new AuthenticationError('Agent not found', 'AGENT_NOT_FOUND');
        }

        // Check if agent has job submission permission
        await this.authManager.requirePermission(agent.id, 'job:submit');

        // Override agentId with authenticated agent
        jobData.agentId = agent.id;
        if (agent.sessionId) {
          jobData.sessionId = agent.sessionId;
        }
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError('Invalid authentication token', 'INVALID_TOKEN');
      }
    }
    // Validate job submission before processing
    const validation = await validateJobSubmission(jobData, {
      enablePromptInjectionDetection: true,
      enableInputSanitization: true,
      maxPromptLength: 10000,
      maxMessageCount: 50,
      strictMode: false,
    });

    if (!validation.isValid) {
      const errorMessages = validation.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      throw new Error(`Job validation failed: ${errorMessages}`);
    }

    // Use sanitized prompt if available
    const sanitizedJobData = { ...jobData };
    if (validation.sanitizedValue) {
      sanitizedJobData.prompt = validation.sanitizedValue;
    }

    const newJob: Job = {
      ...sanitizedJobData,
      id: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add security metadata
    if (validation.promptInjection) {
      newJob.hasError = validation.promptInjection.blocked;
      if (validation.promptInjection.blocked) {
        newJob.error = {
          message: 'Job blocked due to security concerns',
          code: 'SECURITY_BLOCK',
        };
        newJob.status = 'failed';
      }
    }

    this.jobs.set(newJob.id, newJob);
    this.priorityQueue.enqueue(newJob);
    this.queueMonitor.recordJobSubmission(newJob);

    return newJob;
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
   * Cancel a job with enhanced security validation and authentication
   */
  async cancelJob(jobId: string, authToken?: string, agentId?: string): Promise<boolean> {
    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
      throw new Error('Invalid job ID: must be a non-empty string');
    }

    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    // Authenticate agent if token provided
    let authenticatedAgentId = agentId;
    if (authToken) {
      try {
        const tokenPayload = await this.authManager.verifyToken(authToken);
        const agent = this.authManager.getAgent(tokenPayload.sub);

        if (!agent) {
          throw new AuthenticationError('Agent not found', 'AGENT_NOT_FOUND');
        }

        // Check if agent has job cancellation permission
        await this.authManager.requirePermission(agent.id, 'job:cancel');

        authenticatedAgentId = agent.id;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError('Invalid authentication token', 'INVALID_TOKEN');
      }
    }

    // Enhanced agent authorization check
    if (authenticatedAgentId) {
      if (!job.agentId || typeof job.agentId !== 'string') {
        throw new Error(`Job ${jobId} has invalid agent ID`);
      }

      if (job.agentId !== authenticatedAgentId) {
        throw new AuthenticationError(
          `Authorization failed: cannot cancel job ${jobId} from agent ${authenticatedAgentId}`,
          'AGENT_MISMATCH',
        );
      }
    }

    // Validate job status before cancellation
    const cancellableStatuses = ['pending', 'failed'];
    if (!cancellableStatuses.includes(job.status)) {
      throw new Error(
        `Cannot cancel job ${jobId} in status: ${job.status}. Only jobs with status ${cancellableStatuses.join(', ')} can be cancelled.`,
      );
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
   * List jobs with optional filtering and authentication
   */
  async listJobs(options: {
    status?: Job['status'];
    limit?: number;
    agentOnly?: boolean;
    agentId?: string;
    sessionId?: string;
    authToken?: string;
  }): Promise<Job[]> {
    // Authenticate agent if token provided
    if (options.authToken) {
      try {
        const tokenPayload = await this.authManager.verifyToken(options.authToken);
        const agent = this.authManager.getAgent(tokenPayload.sub);

        if (!agent) {
          throw new AuthenticationError('Agent not found', 'AGENT_NOT_FOUND');
        }

        // Check if agent has job listing permission
        await this.authManager.requirePermission(agent.id, 'job:list');

        // Override agentId with authenticated agent for filtering
        if (options.agentOnly) {
          options.agentId = agent.id;
        }
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError('Invalid authentication token', 'INVALID_TOKEN');
      }
    }
    let jobs = Array.from(this.jobs.values());

    // Apply filters
    if (options.status) {
      jobs = jobs.filter((job) => job.status === options.status);
    }

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
   * Legacy listJobs method for backward compatibility
   */
  listJobsSync(options: {
    status?: Job['status'];
    limit?: number;
    agentOnly?: boolean;
    agentId?: string;
    sessionId?: string;
  }): Job[] {

  /**
   * Get queue metrics
   */
  getMetrics(): QueueMetrics {
    const jobs = Array.from(this.jobs.values());
    const pending = jobs.filter((j) => j.status === 'pending').length;
    const running = jobs.filter((j) => j.status === 'running').length;
    const completed = jobs.filter((j) => j.status === 'completed').length;
    const failed = jobs.filter((j) => j.status === 'failed').length;

    const completedJobs = jobs.filter((j) => j.status === 'completed');
    const averageProcessingTime =
      completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            const processingTime = (job.completedAt || 0) - (job.startedAt || job.createdAt);
            return sum + processingTime;
          }, 0) / completedJobs.length
        : 0;

    const averageWaitTime =
      completedJobs.length > 0
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
      canceled: Array.from(this.jobs.values()).filter((j) => j.status === 'canceled').length,
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
