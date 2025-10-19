// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Job Scheduler

import { Job, JobSchedulerConfig } from '../types.js';

export class JobScheduler {
  private config: JobSchedulerConfig;
  private agentJobCounts: Map<string, number> = new Map();
  private lastResetTime: number = Date.now();

  constructor(config: JobSchedulerConfig) {
    this.config = config;
  }

  /**
   * Schedule jobs based on the configured algorithm
   */
  scheduleJobs(jobs: Job[]): Job[] {
    switch (this.config.algorithm) {
      case 'fifo':
        return this.scheduleFIFO(jobs);
      case 'priority':
        return this.scheduleByPriority(jobs);
      case 'fair-share':
        return this.scheduleFairShare(jobs);
      case 'weighted-fair-share':
        return this.scheduleWeightedFairShare(jobs);
      default:
        return this.scheduleFIFO(jobs);
    }
  }

  /**
   * FIFO (First In, First Out) scheduling
   */
  private scheduleFIFO(jobs: Job[]): Job[] {
    return jobs.sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Priority-based scheduling
   */
  private scheduleByPriority(jobs: Job[]): Job[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return jobs.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      // If same priority, use FIFO
      return a.createdAt - b.createdAt;
    });
  }

  /**
   * Fair-share scheduling
   */
  private scheduleFairShare(jobs: Job[]): Job[] {
    // Group jobs by agent
    const agentJobs = new Map<string, Job[]>();
    jobs.forEach((job) => {
      if (!agentJobs.has(job.agentId)) {
        agentJobs.set(job.agentId, []);
      }
      agentJobs.get(job.agentId)!.push(job);
    });

    // Sort each agent's jobs by priority and creation time
    agentJobs.forEach((agentJobList) => {
      agentJobList.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        return a.createdAt - b.createdAt;
      });
    });

    // Interleave jobs from different agents
    const scheduledJobs: Job[] = [];
    const agentQueues = Array.from(agentJobs.values());

    while (agentQueues.some((queue) => queue.length > 0)) {
      for (let i = 0; i < agentQueues.length; i++) {
        const queue = agentQueues[i];
        if (queue && queue.length > 0) {
          const job = queue.shift()!;

          // Check if agent has exceeded max jobs
          const currentCount = this.agentJobCounts.get(job.agentId) || 0;
          if (currentCount < this.config.maxJobsPerAgent) {
            scheduledJobs.push(job);
            this.agentJobCounts.set(job.agentId, currentCount + 1);
          } else {
            // Put job back at the end of its queue
            queue.push(job);
          }
        }
      }
    }

    return scheduledJobs;
  }

  /**
   * Weighted fair-share scheduling
   */
  private scheduleWeightedFairShare(jobs: Job[]): Job[] {
    // Group jobs by agent
    const agentJobs = new Map<string, Job[]>();
    jobs.forEach((job) => {
      if (!agentJobs.has(job.agentId)) {
        agentJobs.set(job.agentId, []);
      }
      agentJobs.get(job.agentId)!.push(job);
    });

    // Sort each agent's jobs by priority and creation time
    agentJobs.forEach((agentJobList) => {
      agentJobList.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        return a.createdAt - b.createdAt;
      });
    });

    // Calculate weights for each agent
    const agentWeights = new Map<string, number>();
    const totalWeight = Object.values(this.config.fairShareWeight).reduce(
      (sum, weight) => sum + weight,
      0,
    );

    Object.entries(this.config.fairShareWeight).forEach(([agentId, weight]) => {
      agentWeights.set(agentId, weight / totalWeight);
    });

    // Schedule jobs based on weights
    const scheduledJobs: Job[] = [];
    const agentQueues = Array.from(agentJobs.entries());

    while (agentQueues.some(([_, queue]) => queue.length > 0)) {
      // Sort agents by their current job count vs weight ratio
      agentQueues.sort(([agentA], [agentB]) => {
        const countA = this.agentJobCounts.get(agentA) || 0;
        const countB = this.agentJobCounts.get(agentB) || 0;
        const weightA = agentWeights.get(agentA) || 1 / agentQueues.length;
        const weightB = agentWeights.get(agentB) || 1 / agentQueues.length;

        const ratioA = countA / weightA;
        const ratioB = countB / weightB;

        return ratioA - ratioB;
      });

      for (const [agentId, queue] of agentQueues) {
        if (queue.length > 0) {
          const job = queue.shift()!;

          // Check if agent has exceeded its weighted share
          const currentCount = this.agentJobCounts.get(agentId) || 0;
          const weight = agentWeights.get(agentId) || 1 / agentQueues.length;
          const maxJobs = Math.ceil(this.config.maxJobsPerAgent * weight);

          if (currentCount < maxJobs) {
            scheduledJobs.push(job);
            this.agentJobCounts.set(agentId, currentCount + 1);
          } else {
            // Put job back at the end of its queue
            queue.push(job);
          }
        }
      }
    }

    return scheduledJobs;
  }

  /**
   * Apply aging to prevent starvation
   */
  applyAging(jobs: Job[]): Job[] {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    // Reset counters periodically
    if (timeSinceReset > 60000) {
      // Reset every minute
      this.agentJobCounts.clear();
      this.lastResetTime = now;
    }

    return jobs.map((job) => {
      const waitTime = now - job.createdAt;
      const ageMultiplier = 1 + (waitTime / 300000) * this.config.agingFactor; // 5 minutes base

      return {
        ...job,
        effectivePriority: this.calculateEffectivePriority(job, ageMultiplier),
      };
    });
  }

  /**
   * Calculate effective priority considering aging
   */
  private calculateEffectivePriority(job: Job, ageMultiplier: number): number {
    const basePriority = { urgent: 4, high: 3, medium: 2, low: 1 }[job.priority];
    return basePriority * ageMultiplier;
  }

  /**
   * Update job count for an agent (when job completes)
   */
  decrementAgentJobCount(agentId: string): void {
    const currentCount = this.agentJobCounts.get(agentId) || 0;
    this.agentJobCounts.set(agentId, Math.max(0, currentCount - 1));
  }

  /**
   * Get scheduler statistics
   */
  getStatistics() {
    return {
      algorithm: this.config.algorithm,
      maxJobsPerAgent: this.config.maxJobsPerAgent,
      agentJobCounts: Object.fromEntries(this.agentJobCounts),
      fairShareWeights: this.config.fairShareWeight,
      agingFactor: this.config.agingFactor,
      lastResetTime: this.lastResetTime,
    };
  }

  /**
   * Reset scheduler state
   */
  reset(): void {
    this.agentJobCounts.clear();
    this.lastResetTime = Date.now();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<JobSchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
