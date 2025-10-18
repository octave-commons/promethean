// SPDX-License-Identifier: GPL-3.0-only
// Shared Ollama queue engine primitives for reuse across clients/plugins

import { ollamaEmbed, InMemoryChroma } from '@promethean/utils';

export const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export class OllamaError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// Types for job management
export type UUID = string;
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type JobType = 'generate' | 'chat' | 'embedding';

export type OllamaOptions = Readonly<{
  temperature?: number;
  top_p?: number;
  num_ctx?: number;
  num_predict?: number;
  stop?: readonly string[];
  format?: 'json' | object;
}>;

export type Job = Readonly<{
  id: UUID;
  name?: string;
  agentId?: string;
  sessionId?: string;
  status: JobStatus;
  priority: JobPriority;
  type: JobType;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: { message: string; code?: string };
  result?: unknown;
  modelName: string;
  // Job-specific fields
  prompt?: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  input?: string | string[];
  options?: OllamaOptions;
}>;

export type CacheEntry = {
  prompt: string;
  response: unknown;
  modelName: string;
  jobType: JobType;
  createdAt: number;
  embedding?: number[];
  // AI Learning System - Performance Tracking
  score?: number; // -1 to 1 (negative = failed, positive = succeeded)
  scoreSource?: 'deterministic' | 'user-feedback' | 'auto-eval';
  scoreReason?: string; // Why it got this score
  taskCategory?: string; // e.g., 'buildfix-ts-errors', 'code-review', 'tdd-analysis'
  executionTime?: number; // How long the response took to generate
  tokensUsed?: number; // Token usage for cost tracking
};

// In-memory store
export const jobQueue: Job[] = [];
export const activeJobs = new Map<UUID, Job>();
export const processing = new Set<UUID>();

// Prompt cache configuration
export const CACHE_SIMILARITY_THRESHOLD = 0.85; // Cosine similarity threshold for cache hits
export const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
export const modelCaches = new Map<string, InMemoryChroma<CacheEntry>>();

// Queue processing configuration
export const MAX_CONCURRENT_JOBS = 2;
export const POLL_INTERVAL = 5000; // 5 seconds

let processingInterval: NodeJS.Timeout | null = null;
export function getProcessingInterval() {
  return processingInterval;
}
export function setProcessingInterval(t: NodeJS.Timeout) {
  processingInterval = t;
}
export function clearProcessingInterval() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
}

export const now = () => Date.now();

// Low-level helpers
export async function check(res: Readonly<Response>, ctx: string): Promise<Response> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const snippet = text ? `: ${text.slice(0, 400)}${text.length > 400 ? '…' : ''}` : '';
    throw new OllamaError(res.status, `ollama ${ctx} ${res.status}${snippet}`);
  }
  return res;
}

export async function callOllamaGenerate(
  model: string,
  prompt: string,
  options?: OllamaOptions,
): Promise<unknown> {
  const requestBody: any = {
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      ...options,
    },
  };
  if (options?.format) requestBody.format = options.format;

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  await check(res, 'generate');
  const data = await res.json();
  if (!data.response) throw new Error('Invalid generate response from ollama');
  return data.response;
}

export async function callOllamaChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: OllamaOptions,
): Promise<unknown> {
  const requestBody = {
    model,
    messages,
    stream: false,
    options: {
      temperature: 0.7,
      ...options,
    },
  };
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  await check(res, 'chat');
  const data = await res.json();
  if (!data.message?.content) throw new Error('Invalid chat response from ollama');
  return data.message.content;
}

export async function callOllamaEmbed(model: string, input: string | string[]): Promise<number[]> {
  const requestBody = { model, input: Array.isArray(input) ? input : [input] };
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  await check(res, 'embeddings');
  const data = await res.json();
  if (!data.embeddings || !Array.isArray(data.embeddings)) {
    throw new Error('Invalid embeddings response from ollama');
  }
  return Array.isArray(input) ? data.embeddings : data.embeddings[0];
}

export async function initializeCache(
  modelName: string,
): Promise<InMemoryChroma<CacheEntry>> {
  if (!modelCaches.has(modelName)) {
    modelCaches.set(modelName, new InMemoryChroma<CacheEntry>());
  }
  return modelCaches.get(modelName)!;
}

export async function getPromptEmbedding(prompt: string, modelName: string): Promise<number[]> {
  try {
    return await ollamaEmbed(modelName, prompt);
  } catch (error) {
    console.warn('Failed to generate embedding for prompt caching:', error);
    throw error;
  }
}

export function createCacheKey(prompt: string, modelName: string, jobType: JobType): string {
  return `${jobType}:${modelName}:${Buffer.from(prompt).toString('base64').slice(0, 32)}`;
}

export async function checkCache(
  prompt: string,
  modelName: string,
  jobType: JobType,
): Promise<unknown | null> {
  try {
    const cache = await initializeCache(modelName);
    const queryEmbedding = await getPromptEmbedding(prompt, modelName);
    const hits = cache.queryByEmbedding(queryEmbedding, {
      k: 1,
      filter: (metadata) =>
        (metadata as any).modelName === modelName &&
        (metadata as any).jobType === jobType &&
        now() - ((metadata as any).createdAt as number) < CACHE_MAX_AGE_MS,
    });
    if (hits.length > 0 && hits[0].score >= CACHE_SIMILARITY_THRESHOLD) {
      console.log(
        `Cache hit for ${modelName} ${jobType} job with similarity ${hits[0].score.toFixed(3)}`,
      );
      return hits[0].metadata.response;
    }
  } catch (error) {
    console.warn('Cache lookup failed:', error);
  }
  return null;
}

export async function storeInCache(
  prompt: string,
  response: unknown,
  modelName: string,
  jobType: JobType,
  performanceData?: {
    score?: number;
    scoreSource?: 'deterministic' | 'user-feedback' | 'auto-eval';
    scoreReason?: string;
    taskCategory?: string;
    executionTime?: number;
    tokensUsed?: number;
  },
): Promise<void> {
  try {
    const cache = await initializeCache(modelName);
    const embedding = await getPromptEmbedding(prompt, modelName);
    const cacheKey = createCacheKey(prompt, modelName, jobType);
    const cacheEntry: CacheEntry = {
      prompt,
      response,
      modelName,
      jobType,
      createdAt: now(),
      embedding,
      ...performanceData,
    };
    cache.add([{ id: cacheKey, embedding, metadata: cacheEntry }]);
    const scoreInfo =
      performanceData && performanceData.score !== undefined
        ? ` (score: ${performanceData.score.toFixed(2)})`
        : '';
    console.log(`Stored ${modelName} ${jobType} result in cache (size: ${cache.size})${scoreInfo}`);
  } catch (error) {
    console.warn('Failed to store in cache:', error);
  }
}

export function inferTaskCategory(job: Job): string {
  const prompt = job.prompt || job.messages?.map((m) => m.content).join(' ') || '';
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('typescript') && lowerPrompt.includes('error')) return 'buildfix-ts-errors';
  if (lowerPrompt.includes('fix the error') || lowerPrompt.includes('compilation error'))
    return 'buildfix-general';
  if (lowerPrompt.includes('review') || lowerPrompt.includes('critique') || lowerPrompt.includes('improve'))
    return 'code-review';
  if (lowerPrompt.includes('test') || lowerPrompt.includes('tdd') || lowerPrompt.includes('spec'))
    return 'tdd-analysis';
  if (lowerPrompt.includes('document') || lowerPrompt.includes('readme') || lowerPrompt.includes('explain'))
    return 'documentation';
  if (lowerPrompt.includes('code') || lowerPrompt.includes('function') || lowerPrompt.includes('implement'))
    return 'coding';
  return 'general';
}

export async function calculatePerformanceScore(
  job: Job,
  result: unknown,
  executionTime: number,
): Promise<{
  score?: number;
  scoreSource?: 'deterministic' | 'user-feedback' | 'auto-eval';
  scoreReason?: string;
  taskCategory?: string;
  executionTime?: number;
  tokensUsed?: number;
}> {
  const taskCategory = inferTaskCategory(job);
  const performanceData = { taskCategory, executionTime } as const;
  if (taskCategory.startsWith('buildfix-')) {
    return {
      ...performanceData,
      score: 1.0,
      scoreSource: 'deterministic',
      scoreReason: 'BuildFix job completed successfully',
    };
  }
  let score = 0.5;
  let scoreReason = 'Job completed successfully';
  if (executionTime < 5000) {
    score += 0.2;
    scoreReason += ' (fast execution)';
  } else if (executionTime > 30000) {
    score -= 0.1;
    scoreReason += ' (slow execution)';
  }
  if (taskCategory === 'code-review') {
    if (executionTime > 10000 && executionTime < 60000) {
      score += 0.1;
      scoreReason += ' (appropriate review time)';
    }
  }
  return { ...performanceData, score: Math.max(-1, Math.min(1, score)), scoreSource: 'auto-eval', scoreReason };
}

export const getJobsByAgent = (agentId?: string, sessionId?: string): Job[] => {
  return jobQueue.filter((job) => {
    if (agentId && job.agentId !== agentId) return false;
    if (sessionId && job.sessionId !== sessionId) return false;
    return true;
  });
};

export const getJobById = (id: UUID): Job | undefined => {
  return jobQueue.find((job) => job.id === id);
};

export const updateJobStatus = (id: UUID, status: JobStatus, updates: Partial<Job> = {}): void => {
  const job = getJobById(id);
  if (job) {
    const index = jobQueue.findIndex((j) => j.id === id);
    const updatedJob = { ...job, status, updatedAt: now(), ...updates } as Job;
    jobQueue[index] = updatedJob;
    if (status === 'running') {
      activeJobs.set(id, updatedJob);
    } else if (status === 'completed' || status === 'failed' || status === 'canceled') {
      activeJobs.delete(id);
      processing.delete(id);
    }
  }
};

export async function processJob(job: Job): Promise<void> {
  updateJobStatus(job.id, 'running', { startedAt: now() });
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
          updateJobStatus(job.id, 'completed', { result, completedAt: now() });
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
          updateJobStatus(job.id, 'completed', { result, completedAt: now() });
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
    updateJobStatus(job.id, 'completed', { result, completedAt: now() });
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
      const failureKey = job.prompt || job.messages?.map((m) => `${m.role}: ${m.content}`).join('\n') || '';
      await storeInCache(failureKey, { error: failurePerformance.scoreReason }, job.modelName, job.type, failurePerformance);
    }
    updateJobStatus(job.id, 'failed', { error: { message: error instanceof Error ? error.message : String(error) }, completedAt: now() });
  }
}

export async function processQueue(): Promise<void> {
  if (processing.size >= MAX_CONCURRENT_JOBS) return;
  const pendingJobs = jobQueue
    .filter((job) => job.status === 'pending')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
      return (priorityOrder as any)[a.priority] - (priorityOrder as any)[b.priority];
    });
  for (const job of pendingJobs.slice(0, MAX_CONCURRENT_JOBS - processing.size)) {
    if (processing.has(job.id)) continue;
    processing.add(job.id);
    processJob(job).catch(console.error);
  }
}

export function startQueueProcessor(): void {
  if (getProcessingInterval()) return;
  const t = setInterval(processQueue, POLL_INTERVAL);
  setProcessingInterval(t);
  processQueue();
}

export function stopQueueProcessor(): void {
  clearProcessingInterval();
}
