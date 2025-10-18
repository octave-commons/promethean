// SPDX-License-Identifier: GPL-3.0-only
// Ollama job management actions

import { Job } from './types.js';
import { UUID, JobStatus, jobQueue, now, activeJobs, processing } from '@promethean/ollama-queue';

export function getJobById(id: UUID): Job | undefined {
  return jobQueue.find((job) => job.id === id);
}

export function updateJobStatus(id: UUID, status: JobStatus, updates: Partial<Job> = {}): void {
  const job = getJobById(id);
  if (job) {
    const index = jobQueue.findIndex((j) => j.id === id);
    const updatedJob = {
      ...job,
      status,
      updatedAt: now(),
      ...updates,
    };
    jobQueue[index] = updatedJob;

    if (status === 'running') {
      activeJobs.set(id, updatedJob);
    } else if (status === 'completed' || status === 'failed' || status === 'canceled') {
      activeJobs.delete(id);
      processing.delete(id);
    }
  }
}
