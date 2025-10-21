// SPDX-License-Identifier: GPL-3.0-only
// Persistent queue implementation using LMDB-cache

import { PersistentJobStore } from './persistent-store.js';
import {
  type Job,
  type UUID,
  type JobStatus,
  type JobType,
  type OllamaOptions,
  OLLAMA_URL,
  OllamaError,
  check,
  callOllamaGenerate,
  callOllamaChat,
  callOllamaEmbed,
  now,
  MAX_CONCURRENT_JOBS,
  POLL_INTERVAL,
  getProcessingInterval,
  setProcessingInterval,
  clearProcessingInterval,
  initializeCache,
  getPromptEmbedding,
  createCacheKey,
  checkCache,
  storeInCache,
  inferTaskCategory,
  calculatePerformanceScore,
  CACHE_SIMILARITY_THRESHOLD,
  CACHE_MAX_AGE_MS,
  modelCaches,
} from './index.js';

// Global persistent store instance
let persistentStore: PersistentJobStore | null = null;

// Initialize the persistent store
export async function initializePersistentStore(
  cachePath: string = './ollama-queue-cache',
): Promise<void> {
  persistentStore = new PersistentJobStore(cachePath);
  await persistentStore.initialize();
  console.log(`Persistent job store initialized at: ${cachePath}`);
}

export function getPersistentStore(): PersistentJobStore {
  if (!persistentStore) {
    throw new Error('Persistent store not initialized. Call initializePersistentStore() first.');
  }
  return persistentStore;
}

// Job management functions using persistent store
export async function submitJob(jobData: {
  type: JobType;
  modelName: string;
  prompt?: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  input?: string | string[];
  options?: OllamaOptions;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  name?: string;
  agentId?: string;
  sessionId?: string;
}): Promise<Job> {
  const store = getPersistentStore();
  const timestamp = now();

  const job: Job = {
    id: crypto.randomUUID(),
    name: jobData.name,
    agentId: jobData.agentId,
    sessionId: jobData.sessionId,
    status: 'pending',
    priority: jobData.priority || 'medium',
    type: jobData.type,
    createdAt: timestamp,
    updatedAt: timestamp,
    modelName: jobData.modelName,
    prompt: jobData.prompt,
    messages: jobData.messages,
    input: jobData.input,
    options: jobData.options,
  };

  await store.addJob(job);
  console.log(`Submitted ${jobData.type} job ${job.id} for model ${jobData.modelName}`);

  return job;
}

export async function getJob(id: UUID): Promise<Job | undefined> {
  const store = getPersistentStore();
  return await store.getJob(id);
}

export async function listJobs(options?: {
  status?: JobStatus;
  limit?: number;
  agentId?: string;
  sessionId?: string;
}): Promise<Job[]> {
  const store = getPersistentStore();
  return await store.listJobs(options);
}

export async function updateJobStatus(
  id: UUID,
  status: JobStatus,
  updates: Partial<Job> = {},
): Promise<void> {
  const store = getPersistentStore();
  const existingJob = await store.getJob(id);

  if (!existingJob) {
    throw new Error(`Job not found: ${id}`);
  }

  const updatedJob = {
    ...existingJob,
    status,
    updatedAt: now(),
    ...updates,
  };

  await store.updateJob(id, updatedJob);

  // Update active jobs and processing sets
  if (status === 'running') {
    await store.addActiveJob(id, updatedJob);
    await store.addProcessing(id);
  } else if (status === 'completed' || status === 'failed' || status === 'canceled') {
    await store.removeActiveJob(id);
    await store.removeProcessing(id);
  }
}

export async function deleteJob(id: UUID): Promise<void> {
  const store = getPersistentStore();
  await store.deleteJob(id);
}

export async function getQueueStats(): Promise<{
  pending: number;
  running: number;
  completed: number;
  failed: number;
  canceled: number;
  total: number;
}> {
  const store = getPersistentStore();
  return await store.getQueueStats();
}

// Job processing functions
export async function processJob(job: Job): Promise<void> {
  await updateJobStatus(job.id, 'running', { startedAt: now() });

  try {
    let result: unknown;
    let cacheKey: string | null = null;
    const startTime = now();

    switch (job.type) {
      case 'generate': {
        if (!job.prompt) throw new Error('Generate job missing prompt');
        const cachedResult = await checkCache(job.prompt, job.modelName, job.type);
        if (cachedResult !== null) {
          result = cachedResult;
          await updateJobStatus(job.id, 'completed', { result, completedAt: now() });
          return;
        }
        result = await callOllamaGenerate(job.modelName, job.prompt, job.options);
        cacheKey = job.prompt;
        break;
      }
      case 'chat': {
        if (!job.messages) throw new Error('Chat job missing messages');
        const chatString = job.messages.map((m) => `${m.role}: ${m.content}`).join('\n');
        const cachedChatResult = await checkCache(chatString, job.modelName, job.type);
        if (cachedChatResult !== null) {
          result = cachedChatResult;
          await updateJobStatus(job.id, 'completed', { result, completedAt: now() });
          return;
        }
        result = await callOllamaChat(job.modelName, job.messages, job.options);
        cacheKey = chatString;
        break;
      }
      case 'embedding': {
        if (!job.input) throw new Error('Embedding job missing input');
        result = await callOllamaEmbed(job.modelName, job.input);
        break;
      }
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    const executionTime = now() - startTime;
    const performanceData = await calculatePerformanceScore(job, result, executionTime);

    if (cacheKey && result) {
      await storeInCache(cacheKey, result, job.modelName, job.type, performanceData);
    }

    await updateJobStatus(job.id, 'completed', { result, completedAt: now() });
  } catch (error) {
    const executionTime = now() - (job.startedAt || job.createdAt);
    const failurePerformance = {
      score: -1.0,
      scoreSource: 'deterministic' as const,
      scoreReason: `Job failed: ${error instanceof Error ? error.message : String(error)}`,
      taskCategory: inferTaskCategory(job),
      executionTime,
    };

    if (job.type !== 'embedding' && (job.prompt || job.messages)) {
      const failureKey =
        job.prompt || job.messages?.map((m) => `${m.role}: ${m.content}`).join('\n') || '';
      await storeInCache(
        failureKey,
        { error: failurePerformance.scoreReason },
        job.modelName,
        job.type,
        failurePerformance,
      );
    }

    await updateJobStatus(job.id, 'failed', {
      error: { message: error instanceof Error ? error.message : String(error) },
      completedAt: now(),
    });
  }
}

export async function processQueue(): Promise<void> {
  const store = getPersistentStore();
  const processingJobs = await store.getProcessingJobs();

  if (processingJobs.length >= MAX_CONCURRENT_JOBS) return;

  const pendingJobs = await store.listJobs({ status: 'pending' });

  // Sort by priority
  pendingJobs.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const availableSlots = MAX_CONCURRENT_JOBS - processingJobs.length;
  const jobsToProcess = pendingJobs.slice(0, availableSlots);

  for (const job of jobsToProcess) {
    const isProcessing = await store.isProcessing(job.id);
    if (isProcessing) continue;

    await store.addProcessing(job.id);
    processJob(job).catch(console.error);
  }
}

export function startQueueProcessor(): void {
  if (getProcessingInterval()) return;
  const t = setInterval(processQueue, POLL_INTERVAL);
  setProcessingInterval(t);
  processQueue();
  console.log('Persistent queue processor started');
}

export function stopQueueProcessor(): void {
  clearProcessingInterval();
  console.log('Persistent queue processor stopped');
}

export async function closePersistentStore(): Promise<void> {
  if (persistentStore) {
    await persistentStore.close();
    persistentStore = null;
    console.log('Persistent job store closed');
  }
}
