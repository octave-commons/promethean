// SPDX-License-Identifier: GPL-3.0-only
// Ollama tool actions - high-level tool operations

import { randomUUID } from 'node:crypto';
import {
  jobQueue,
  activeJobs,
  modelCaches,
  MAX_CONCURRENT_JOBS,
  getProcessingInterval,
  setProcessingInterval,
  now,
} from '@promethean/ollama-queue';
import { Job } from './types.js';
import { getJobById, updateJobStatus } from './jobs.js';
import { processQueue } from './queue.js';
import { initializeCache } from '../cache/initialize.js';
import { getPromptEmbedding } from '../cache/key.js';
import type { CacheEntry } from '../cache/types.js';

// Submit a new job to the queue
export async function submitJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = randomUUID();
  const timestamp = now();

  const newJob: Job = {
    ...job,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  jobQueue.push(newJob);

  // Start processor if not running
  if (!getProcessingInterval()) {
    startQueueProcessor();
  }

  return {
    jobId: id,
    jobName: job.name,
    status: 'pending',
    queuePosition: jobQueue.filter((j) => j.status === 'pending').length,
  };
}

// Get job status
export async function getJobStatus(jobId: string) {
  const job = getJobById(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  return {
    id: job.id,
    name: job.name,
    status: job.status,
    priority: job.priority,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    error: job.error,
  };
}

// Get job result
export async function getJobResult(jobId: string) {
  const job = getJobById(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (job.status !== 'completed') {
    throw new Error(`Job not completed: ${jobId} (status: ${job.status})`);
  }

  return {
    id: job.id,
    name: job.name,
    status: job.status,
    result: job.result,
    completedAt: job.completedAt,
  };
}

// List jobs with filtering
export async function listJobs(options: {
  status?: string;
  limit: number;
  agentOnly: boolean;
  agentId?: string;
  sessionId?: string;
}) {
  const { status, limit, agentOnly, agentId, sessionId } = options;

  let jobs =
    agentOnly && agentId && sessionId
      ? jobQueue.filter((job) => {
          if (agentId && job.agentId !== agentId) return false;
          if (sessionId && job.sessionId !== sessionId) return false;
          return true;
        })
      : [...jobQueue];

  if (status) {
    jobs = jobs.filter((job) => job.status === status);
  }

  // Sort by creation time (newest first)
  jobs.sort((a, b) => b.createdAt - a.createdAt);

  return jobs.slice(0, limit).map((job) => ({
    id: job.id,
    name: job.name,
    status: job.status,
    priority: job.priority,
    modelName: job.modelName,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    hasError: !!job.error,
    hasResult: job.status === 'completed' && !!job.result,
  }));
}

// Cancel a job
export async function cancelJob(jobId: string, agentId: string) {
  const job = getJobById(jobId);

  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (job.agentId !== agentId) {
    throw new Error(`Cannot cancel job from another agent: ${jobId}`);
  }

  if (job.status !== 'pending') {
    throw new Error(`Cannot cancel job in status: ${job.status}`);
  }

  updateJobStatus(jobId, 'canceled', { completedAt: now() });

  return {
    id: jobId,
    status: 'canceled',
    message: 'Job canceled successfully',
  };
}

// Get queue information
export async function getQueueInfo() {
  const pending = jobQueue.filter((j) => j.status === 'pending').length;
  const running = activeJobs.size;
  const completed = jobQueue.filter((j) => j.status === 'completed').length;
  const failed = jobQueue.filter((j) => j.status === 'failed').length;
  const canceled = jobQueue.filter((j) => j.status === 'canceled').length;

  return {
    pending,
    running,
    completed,
    failed,
    canceled,
    total: jobQueue.length,
    maxConcurrent: MAX_CONCURRENT_JOBS,
    processorActive: !!getProcessingInterval(),
    cacheSize: Array.from(modelCaches.values()).reduce((sum, cache) => sum + cache.size, 0),
  };
}

// Submit feedback
export async function submitFeedback(options: {
  prompt: string;
  modelName: string;
  jobType: string;
  score: number;
  reason?: string;
  taskCategory?: string;
}) {
  const { prompt, modelName, jobType, score, reason, taskCategory } = options;

  try {
    const cache = await initializeCache(modelName);
    const embedding = await getPromptEmbedding(prompt, modelName);

    // Find existing cache entry
    const hits = cache.queryByEmbedding(embedding, {
      k: 1,
      filter: (metadata) => metadata.modelName === modelName && metadata.jobType === jobType,
    });

    if (hits.length === 0) {
      throw new Error('No matching cache entry found for feedback');
    }

    const existingEntry = hits[0]?.metadata as CacheEntry;
    const cacheKey = hits[0]?.id;

    // Update the entry with feedback
    const updatedEntry: CacheEntry = {
      ...existingEntry,
      score,
      scoreSource: 'user-feedback',
      scoreReason: reason || `User feedback: ${score}`,
      taskCategory: taskCategory || existingEntry.taskCategory,
    };

    // Remove old entry and add updated one
    // cache.remove([cacheKey]); // TODO: Implement proper cache removal
    cache.add([
      {
        id: cacheKey || '',
        embedding,
        metadata: updatedEntry,
      },
    ]);

    console.log(`Updated cache entry with user feedback: score=${score}, reason="${reason}"`);

    return {
      message: 'Feedback submitted successfully',
      score,
      modelName,
      jobType,
      taskCategory: updatedEntry.taskCategory,
    };
  } catch (error) {
    throw new Error(
      `Failed to submit feedback: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Start queue processor
function startQueueProcessor(): void {
  if (!getProcessingInterval()) {
    const interval = setInterval(processQueue, 1000); // Process every second
    setProcessingInterval(interval);
  }
}
