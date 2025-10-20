// SPDX-License-Identifier: GPL-3.0-only
// Persistent job storage using LMDB-cache

import { openLmdbCache, type Cache } from '@promethean/lmdb-cache';
import { Job, UUID, JobStatus } from './index.js';

export class PersistentJobStore {
  private jobCache: Cache<Job> | null = null;
  private activeJobsCache: Cache<true> | null = null; // Simple set implementation
  private processingCache: Cache<true> | null = null; // Simple set implementation

  constructor(private cachePath: string) {}

  async initialize(): Promise<void> {
    this.jobCache = await openLmdbCache<Job>({
      path: `${this.cachePath}/jobs`,
      namespace: 'jobs',
      defaultTtlMs: undefined, // Jobs don't expire by default
    });

    this.activeJobsCache = await openLmdbCache<true>({
      path: `${this.cachePath}/active`,
      namespace: 'active',
      defaultTtlMs: undefined,
    });

    this.processingCache = await openLmdbCache<true>({
      path: `${this.cachePath}/processing`,
      namespace: 'processing',
      defaultTtlMs: undefined,
    });
  }

  private ensureInitialized(): void {
    if (!this.jobCache || !this.activeJobsCache || !this.processingCache) {
      throw new Error('PersistentJobStore not initialized. Call initialize() first.');
    }
  }

  // Job operations
  async addJob(job: Job): Promise<void> {
    await this.jobCache.set(job.id, job);
  }

  async getJob(id: UUID): Promise<Job | undefined> {
    return await this.jobCache.get(id);
  }

  async updateJob(id: UUID, updates: Partial<Job>): Promise<void> {
    const existingJob = await this.getJob(id);
    if (!existingJob) {
      throw new Error(`Job not found: ${id}`);
    }

    const updatedJob = { ...existingJob, ...updates };
    await this.jobCache.set(id, updatedJob);
  }

  async deleteJob(id: UUID): Promise<void> {
    await this.jobCache.del(id);
    await this.activeJobsCache.del(id);
    await this.processingCache.del(id);
  }

  async listJobs(options?: {
    status?: JobStatus;
    limit?: number;
    agentId?: string;
    sessionId?: string;
  }): Promise<Job[]> {
    const jobs: Job[] = [];
    const entries = this.jobCache.entries({ limit: options?.limit });

    for await (const [id, job] of entries) {
      // Apply filters
      if (options?.status && job.status !== options.status) continue;
      if (options?.agentId && job.agentId !== options.agentId) continue;
      if (options?.sessionId && job.sessionId !== options.sessionId) continue;

      jobs.push(job);
    }

    // Sort by creation time (newest first)
    jobs.sort((a, b) => b.createdAt - a.createdAt);

    return jobs;
  }

  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    return await this.listJobs({ status });
  }

  async countJobsByStatus(status: JobStatus): Promise<number> {
    const jobs = await this.getJobsByStatus(status);
    return jobs.length;
  }

  // Active jobs management
  async addActiveJob(id: UUID, job: Job): Promise<void> {
    await this.activeJobsCache.set(id, true);
    await this.updateJob(id, job);
  }

  async removeActiveJob(id: UUID): Promise<void> {
    await this.activeJobsCache.del(id);
  }

  async hasActiveJob(id: UUID): Promise<boolean> {
    return await this.activeJobsCache.has(id);
  }

  async getActiveJobs(): Promise<Job[]> {
    const activeJobIds: UUID[] = [];
    const entries = this.activeJobsCache.entries();

    for await (const [id] of entries) {
      activeJobIds.push(id);
    }

    const jobs: Job[] = [];
    for (const id of activeJobIds) {
      const job = await this.getJob(id);
      if (job) {
        jobs.push(job);
      }
    }

    return jobs;
  }

  // Processing set management
  async addProcessing(id: UUID): Promise<void> {
    await this.processingCache.set(id, true);
  }

  async removeProcessing(id: UUID): Promise<void> {
    await this.processingCache.del(id);
  }

  async isProcessing(id: UUID): Promise<boolean> {
    return await this.processingCache.has(id);
  }

  async getProcessingJobs(): Promise<UUID[]> {
    const processingIds: UUID[] = [];
    const entries = this.processingCache.entries();

    for await (const [id] of entries) {
      processingIds.push(id);
    }

    return processingIds;
  }

  // Queue statistics
  async getQueueStats(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
    canceled: number;
    total: number;
  }> {
    const [pending, running, completed, failed, canceled] = await Promise.all([
      this.countJobsByStatus('pending'),
      this.countJobsByStatus('running'),
      this.countJobsByStatus('completed'),
      this.countJobsByStatus('failed'),
      this.countJobsByStatus('canceled'),
    ]);

    const total = pending + running + completed + failed + canceled;

    return {
      pending,
      running,
      completed,
      failed,
      canceled,
      total,
    };
  }

  // Cleanup operations
  async cleanupOldJobs(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoffTime = Date.now() - olderThanMs;
    let deletedCount = 0;

    const entries = this.jobCache.entries();
    for await (const [id, job] of entries) {
      // Only clean up old completed/failed/canceled jobs
      if (
        (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled') &&
        job.updatedAt &&
        job.updatedAt < cutoffTime
      ) {
        await this.deleteJob(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async close(): Promise<void> {
    await Promise.all([
      this.jobCache.close(),
      this.activeJobsCache.close(),
      this.processingCache.close(),
    ]);
  }
}
