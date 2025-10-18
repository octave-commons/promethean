// SPDX-License-Identifier: GPL-3.0-only
// Ollama tool actions - high-level tool operations using persistent store

import {
  initializePersistentStore,
  submitJobPersistent,
  getJobPersistent,
  listJobsPersistent,
  getQueueStatsPersistent,
  startQueueProcessorPersistent,
  getProcessingInterval,
  now,
  updateJobStatus,
} from '@promethean/ollama-queue';
import { Job } from './types.js';
import { initializeCache } from '../cache/initialize.js';
import { getPromptEmbedding } from '../cache/key.js';
import type { CacheEntry } from '../cache/types.js';

// Initialize persistent store if not already done
let storeInitialized = false;

async function ensureStoreInitialized() {
  if (!storeInitialized) {
    await initializePersistentStore('./ollama-persistent-cache');
    storeInitialized = true;

    // Start the persistent queue processor if not already running
    if (!getProcessingInterval()) {
      startQueueProcessorPersistent();
    }
  }
}

// Submit a new job to queue
export async function submitJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
  await ensureStoreInitialized();

  const submittedJob = await submitJobPersistent(job);

  // Get queue position
  const pendingJobs = await listJobsPersistent({ status: 'pending' });
  const queuePosition = pendingJobs.findIndex((j) => j.id === submittedJob.id) + 1;

  return {
    jobId: submittedJob.id,
    jobName: job.name,
    status: submittedJob.status,
    queuePosition,
  };
}

// Get job status
export async function getJobStatus(jobId: string) {
  await ensureStoreInitialized();

  const job = await getJobPersistent(jobId);
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
  await ensureStoreInitialized();

  const job = await getJobPersistent(jobId);
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
  await ensureStoreInitialized();

  const { status, limit, agentOnly, agentId, sessionId } = options;

  const jobs = await listJobsPersistent({
    status: status as any,
    limit,
    agentId: agentOnly ? agentId : undefined,
    sessionId: agentOnly ? sessionId : undefined,
  });

  return jobs.map((job) => ({
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
  await ensureStoreInitialized();

  const job = await getJobPersistent(jobId);

  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (job.agentId !== agentId) {
    throw new Error(`Cannot cancel job from another agent: ${jobId}`);
  }

  if (job.status !== 'pending') {
    throw new Error(`Cannot cancel job in status: ${job.status}`);
  }

  await updateJobStatus(jobId, 'canceled', { completedAt: now() });

  return {
    id: jobId,
    status: 'canceled',
    message: 'Job canceled successfully',
  };
}

// Get queue information
export async function getQueueInfo() {
  await ensureStoreInitialized();

  const stats = await getQueueStatsPersistent();
  const processingInterval = getProcessingInterval();

  // Calculate cache size (this would need to be updated to work with persistent cache)
  let cacheSize = 0;
  try {
    // For now, we'll use a placeholder since cache integration needs more work
    cacheSize = 0;
  } catch (error) {
    console.warn('Failed to get cache size:', error);
  }

  return {
    pending: stats.pending,
    running: stats.running,
    completed: stats.completed,
    failed: stats.failed,
    canceled: stats.canceled,
    total: stats.total,
    maxConcurrent: 2, // MAX_CONCURRENT_JOBS from ollama-queue
    processorActive: !!processingInterval,
    cacheSize,
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
  await ensureStoreInitialized();

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

    // Update entry with feedback
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
