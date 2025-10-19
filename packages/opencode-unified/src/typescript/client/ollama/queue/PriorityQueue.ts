// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Priority Queue

import { Job } from '../types.js';

export class PriorityQueue {
  private queues: Map<string, Job[]> = new Map();
  private priorityOrder: string[] = ['urgent', 'high', 'medium', 'low'];

  constructor() {
    // Initialize queues for each priority level
    this.priorityOrder.forEach((priority) => {
      this.queues.set(priority, []);
    });
  }

  /**
   * Add a job to the appropriate priority queue
   */
  enqueue(job: Job): void {
    const queue = this.queues.get(job.priority);
    if (!queue) {
      throw new Error(`Invalid priority: ${job.priority}`);
    }
    queue.push(job);
  }

  /**
   * Get the next job based on priority
   */
  dequeue(): Job | null {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue.shift() || null;
      }
    }
    return null;
  }

  /**
   * Remove a specific job from the queue
   */
  remove(jobId: string): boolean {
    for (const [, queue] of this.queues) {
      const index = queue.findIndex((job) => job.id === jobId);
      if (index !== -1) {
        queue.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Find and remove a specific job from the queue, returning the job if found
   */
  findAndRemove(jobId: string): Job | null {
    for (const [, queue] of this.queues) {
      const index = queue.findIndex((job) => job.id === jobId);
      if (index !== -1) {
        const [job] = queue.splice(index, 1);
        return job;
      }
    }
    return null;
  }

  /**
   * Get the number of jobs in each priority queue
   */
  getQueueCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.priorityOrder.forEach((priority) => {
      const queue = this.queues.get(priority);
      counts[priority] = queue ? queue.length : 0;
    });
    return counts;
  }

  /**
   * Get the total number of pending jobs
   */
  size(): number {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }

  /**
   * Check if the queue is empty
   */
  isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Get all jobs in the queue (for debugging/monitoring)
   */
  getAllJobs(): Job[] {
    const allJobs: Job[] = [];
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue) {
        allJobs.push(...queue);
      }
    }
    return allJobs;
  }

  /**
   * Get jobs for a specific priority level
   */
  getJobsByPriority(priority: string): Job[] {
    const queue = this.queues.get(priority);
    return queue ? [...queue] : [];
  }

  /**
   * Clear all queues
   */
  clear(): void {
    this.queues.forEach((queue) => (queue.length = 0));
  }

  /**
   * Get the position of a job in the queue
   */
  getJobPosition(jobId: string): number {
    let position = 0;
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue) {
        const index = queue.findIndex((job) => job.id === jobId);
        if (index !== -1) {
          return position + index;
        }
        position += queue.length;
      }
    }
    return -1; // Job not found
  }

  /**
   * Reorder a job (change its priority)
   */
  reorderJob(jobId: string, newPriority: string): boolean {
    const job = this.remove(jobId);
    if (!job) {
      return false;
    }

    job.priority = newPriority as Job['priority'];
    this.enqueue(job);
    return true;
  }

  /**
   * Get queue statistics
   */
  getStatistics() {
    const counts = this.getQueueCounts();
    const total = this.size();

    return {
      total,
      counts,
      averageWaitTime: 0, // Will be calculated by monitor
      oldestJobAge: this.getOldestJobAge(),
      newestJobAge: this.getNewestJobAge(),
    };
  }

  /**
   * Get the age of the oldest job in the queue
   */
  private getOldestJobAge(): number {
    const allJobs = this.getAllJobs();
    if (allJobs.length === 0) {
      return 0;
    }

    const oldestJob = allJobs.reduce((oldest, current) =>
      current.createdAt < oldest.createdAt ? current : oldest,
    );

    return Date.now() - oldestJob.createdAt;
  }

  /**
   * Get the age of the newest job in the queue
   */
  private getNewestJobAge(): number {
    const allJobs = this.getAllJobs();
    if (allJobs.length === 0) {
      return 0;
    }

    const newestJob = allJobs.reduce((newest, current) =>
      current.createdAt > newest.createdAt ? current : newest,
    );

    return Date.now() - newestJob.createdAt;
  }
}
