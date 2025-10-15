// SPDX-License-Identifier: GPL-3.0-only
// Ollama LLM job queue system for async background processing

import { tool } from '@opencode-ai/plugin';
import { randomUUID } from 'node:crypto';
import { ollamaEmbed, InMemoryChroma } from '@promethean/utils';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export class OllamaError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
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

export type OllamaModel = Readonly<{
  name: string;
  size?: number;
  digest?: string;
  modified_at?: string;
  details?: {
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}>;

// In-memory store with persistence to LevelDB (simplified for MVP)
const jobQueue: Job[] = [];
const activeJobs = new Map<UUID, Job>();
const processing = new Set<UUID>();

// Prompt cache configuration
const CACHE_SIMILARITY_THRESHOLD = 0.85; // Cosine similarity threshold for cache hits
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const modelCaches = new Map<string, InMemoryChroma<CacheEntry>>();

// Queue processing configuration
const MAX_CONCURRENT_JOBS = 6;
const POLL_INTERVAL = 5000; // 5 seconds

let processingInterval: NodeJS.Timeout | null = null;

const now = () => Date.now();

// Prompt cache functions
type CacheEntry = {
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

async function initializeCache(modelName: string): Promise<InMemoryChroma<CacheEntry>> {
  if (!modelCaches.has(modelName)) {
    modelCaches.set(modelName, new InMemoryChroma<CacheEntry>());
  }
  return modelCaches.get(modelName)!;
}

async function getPromptEmbedding(prompt: string, modelName: string): Promise<number[]> {
  try {
    return await ollamaEmbed(modelName, prompt);
  } catch (error) {
    console.warn('Failed to generate embedding for prompt caching:', error);
    throw error;
  }
}

function createCacheKey(prompt: string, modelName: string, jobType: JobType): string {
  return `${jobType}:${modelName}:${Buffer.from(prompt).toString('base64').slice(0, 32)}`;
}

async function checkCache(
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
        metadata.modelName === modelName &&
        metadata.jobType === jobType &&
        now() - (metadata.createdAt as number) < CACHE_MAX_AGE_MS,
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

async function storeInCache(
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

    cache.add([
      {
        id: cacheKey,
        embedding,
        metadata: cacheEntry,
      },
    ]);

    const scoreInfo =
      performanceData?.score !== undefined ? ` (score: ${performanceData.score.toFixed(2)})` : '';
    console.log(`Stored ${modelName} ${jobType} result in cache (size: ${cache.size})${scoreInfo}`);
  } catch (error) {
    console.warn('Failed to store in cache:', error);
  }
}

// AI Learning System - Performance Analysis Functions

function inferTaskCategory(job: Job): string {
  const prompt = job.prompt || job.messages?.map((m) => m.content).join(' ') || '';
  const lowerPrompt = prompt.toLowerCase();

  // BuildFix detection
  if (lowerPrompt.includes('typescript') && lowerPrompt.includes('error')) {
    return 'buildfix-ts-errors';
  }
  if (lowerPrompt.includes('fix the error') || lowerPrompt.includes('compilation error')) {
    return 'buildfix-general';
  }

  // Code review detection
  if (
    lowerPrompt.includes('review') ||
    lowerPrompt.includes('critique') ||
    lowerPrompt.includes('improve')
  ) {
    return 'code-review';
  }

  // TDD detection
  if (lowerPrompt.includes('test') || lowerPrompt.includes('tdd') || lowerPrompt.includes('spec')) {
    return 'tdd-analysis';
  }

  // Documentation generation
  if (
    lowerPrompt.includes('document') ||
    lowerPrompt.includes('readme') ||
    lowerPrompt.includes('explain')
  ) {
    return 'documentation';
  }

  // General coding
  if (
    lowerPrompt.includes('code') ||
    lowerPrompt.includes('function') ||
    lowerPrompt.includes('implement')
  ) {
    return 'coding';
  }

  return 'general';
}

async function calculatePerformanceScore(
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

  // Default performance data
  const performanceData = {
    taskCategory,
    executionTime,
  };

  // BuildFix deterministic scoring
  if (taskCategory.startsWith('buildfix-')) {
    return {
      ...performanceData,
      score: 1.0, // Success = positive score
      scoreSource: 'deterministic' as const,
      scoreReason: 'BuildFix job completed successfully',
    };
  }

  // Performance-based scoring for other tasks
  let score = 0.5; // Neutral baseline
  let scoreReason = 'Job completed successfully';

  // Fast execution bonus
  if (executionTime < 5000) {
    // Under 5 seconds
    score += 0.2;
    scoreReason += ' (fast execution)';
  } else if (executionTime > 30000) {
    // Over 30 seconds
    score -= 0.1;
    scoreReason += ' (slow execution)';
  }

  // Task-specific scoring
  if (taskCategory === 'code-review') {
    // Code reviews should be thorough but not too long
    if (executionTime > 10000 && executionTime < 60000) {
      score += 0.1;
      scoreReason += ' (appropriate review time)';
    }
  }

  return {
    ...performanceData,
    score: Math.max(-1, Math.min(1, score)), // Clamp to [-1, 1]
    scoreSource: 'auto-eval' as const,
    scoreReason,
  };
}

// Helper functions
const getJobsByAgent = (agentId?: string, sessionId?: string): Job[] => {
  return jobQueue.filter((job) => {
    if (agentId && job.agentId !== agentId) return false;
    if (sessionId && job.sessionId !== sessionId) return false;
    return true;
  });
};

const getJobById = (id: UUID): Job | undefined => {
  return jobQueue.find((job) => job.id === id);
};

const updateJobStatus = (id: UUID, status: JobStatus, updates: Partial<Job> = {}): void => {
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
};

// Ollama API integration
async function check(res: Readonly<Response>, ctx: string): Promise<Response> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const snippet = text ? `: ${text.slice(0, 400)}${text.length > 400 ? '…' : ''}` : '';
    throw new OllamaError(res.status, `ollama ${ctx} ${res.status}${snippet}`);
  }
  return res;
}

async function callOllamaGenerate(
  model: string,
  prompt: string,
  options?: OllamaOptions,
): Promise<unknown> {
  const requestBody = {
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      ...options,
    },
  };

  if (options?.format) {
    (requestBody as any).format = options.format;
  }

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  await check(res, 'generate');
  const data = await res.json();

  if (!data.response) {
    throw new Error('Invalid generate response from ollama');
  }

  return data.response;
}

async function callOllamaChat(
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

  if (!data.message?.content) {
    throw new Error('Invalid chat response from ollama');
  }

  return data.message.content;
}

async function callOllamaEmbed(model: string, input: string | string[]): Promise<number[]> {
  const requestBody = {
    model,
    input: Array.isArray(input) ? input : [input],
  };

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

  // Return first embedding for single input, or all for batch
  return Array.isArray(input) ? data.embeddings : data.embeddings[0];
}

// Job processing
async function processJob(job: Job): Promise<void> {
  updateJobStatus(job.id, 'running', { startedAt: now() });

  try {
    let result: unknown;
    let cacheKey: string | null = null;
    const startTime = now();

    switch (job.type) {
      case 'generate':
        if (!job.prompt) throw new Error('Generate job missing prompt');

        // Check cache first
        const cachedResult = await checkCache(job.prompt, job.modelName, job.type);
        if (cachedResult !== null) {
          result = cachedResult;
          updateJobStatus(job.id, 'completed', {
            result,
            completedAt: now(),
          });
          return;
        }

        result = await callOllamaGenerate(job.modelName, job.prompt, job.options);
        cacheKey = job.prompt;
        break;

      case 'chat':
        if (!job.messages) throw new Error('Chat job missing messages');

        // For chat jobs, create a string representation for caching
        const chatString = job.messages.map((m) => `${m.role}: ${m.content}`).join('\n');
        const cachedChatResult = await checkCache(chatString, job.modelName, job.type);
        if (cachedChatResult !== null) {
          result = cachedChatResult;
          updateJobStatus(job.id, 'completed', {
            result,
            completedAt: now(),
          });
          return;
        }

        result = await callOllamaChat(job.modelName, job.messages, job.options);
        cacheKey = chatString;
        break;

      case 'embedding':
        if (!job.input) throw new Error('Embedding job missing input');
        result = await callOllamaEmbed(job.modelName, job.input);
        // Don't cache embedding jobs as they're typically fast and context-specific
        break;

      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    const executionTime = now() - startTime;

    // Calculate performance score based on job characteristics
    const performanceData = await calculatePerformanceScore(job, result, executionTime);

    // Store successful results in cache (except embeddings)
    if (cacheKey && result) {
      await storeInCache(cacheKey, result, job.modelName, job.type, performanceData);
    }

    updateJobStatus(job.id, 'completed', {
      result,
      completedAt: now(),
    });
  } catch (error) {
    // Store failure in cache with negative score for learning
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

    updateJobStatus(job.id, 'failed', {
      error: {
        message: error instanceof Error ? error.message : String(error),
      },
      completedAt: now(),
    });
  }
}

// Queue processor
async function processQueue(): Promise<void> {
  if (processing.size >= MAX_CONCURRENT_JOBS) {
    return;
  }

  const pendingJobs = jobQueue
    .filter((job) => job.status === 'pending')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  for (const job of pendingJobs.slice(0, MAX_CONCURRENT_JOBS - processing.size)) {
    if (processing.has(job.id)) continue;

    processing.add(job.id);
    // Process job without blocking queue
    processJob(job).catch(console.error);
  }
}

// Start queue processor
function startQueueProcessor(): void {
  if (processingInterval) return;

  processingInterval = setInterval(processQueue, POLL_INTERVAL);
  processQueue(); // Process immediately
}

// Stop queue processor
function stopQueueProcessor(): void {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
}

// Tools
export const submitJob = tool({
  description: 'Submit a new LLM job to the queue',
  args: {
    jobName: tool.schema.string().optional().describe('Optional name for the job'),
    modelName: tool.schema.string().describe('Ollama model name to use'),
    jobType: tool.schema.enum(['generate', 'chat', 'embedding']).describe('Type of job'),
    prompt: tool.schema.string().optional().describe('Prompt for generate jobs'),
    messages: tool.schema
      .array(
        tool.schema.object({
          role: tool.schema.enum(['system', 'user', 'assistant']),
          content: tool.schema.string(),
        }),
      )
      .optional()
      .describe('Messages for chat jobs'),
    input: tool.schema
      .union([tool.schema.string(), tool.schema.array(tool.schema.string())])
      .optional()
      .describe('Input for embedding jobs'),
    priority: tool.schema
      .enum(['low', 'medium', 'high', 'urgent'])
      .default('medium')
      .describe('Job priority'),
    options: tool.schema
      .object({
        temperature: tool.schema.number().optional(),
        top_p: tool.schema.number().optional(),
        num_ctx: tool.schema.number().optional(),
        num_predict: tool.schema.number().optional(),
        stop: tool.schema.array(tool.schema.string()).optional(),
        format: tool.schema.union([tool.schema.literal('json'), tool.schema.object({})]).optional(),
      })
      .optional()
      .describe('Ollama generation options'),
  },
  async execute(args, context) {
    const { agent, sessionID } = context;
    const { jobName, modelName, jobType, prompt, messages, input, priority, options } = args;

    const id = randomUUID();
    const timestamp = now();

    let job: Job;

    switch (jobType) {
      case 'generate':
        if (!prompt) throw new Error('Prompt is required for generate jobs');
        job = {
          id,
          name: jobName,
          agentId: agent,
          sessionId: sessionID,
          status: 'pending',
          priority,
          type: 'generate',
          createdAt: timestamp,
          updatedAt: timestamp,
          modelName,
          prompt,
          options,
        };
        break;

      case 'chat':
        if (!messages || messages.length === 0)
          throw new Error('Messages are required for chat jobs');
        job = {
          id,
          name: jobName,
          agentId: agent,
          sessionId: sessionID,
          status: 'pending',
          priority,
          type: 'chat',
          createdAt: timestamp,
          updatedAt: timestamp,
          modelName,
          messages,
          options,
        };
        break;

      case 'embedding':
        if (!input) throw new Error('Input is required for embedding jobs');
        job = {
          id,
          name: jobName,
          agentId: agent,
          sessionId: sessionID,
          status: 'pending',
          priority,
          type: 'embedding',
          createdAt: timestamp,
          updatedAt: timestamp,
          modelName,
          input,
        };
        break;

      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }

    jobQueue.push(job);

    // Start processor if not running
    if (!processingInterval) {
      startQueueProcessor();
    }

    const result = {
      jobId: id,
      jobName,
      status: 'pending',
      queuePosition: jobQueue.filter((j) => j.status === 'pending').length,
    };

    return JSON.stringify(result);
  },
});

export const getJobStatus = tool({
  description: 'Get the status of a specific job',
  args: {
    jobId: tool.schema.string().describe('Job ID to check'),
  },
  async execute({ jobId }) {
    const job = getJobById(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const result = {
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

    return JSON.stringify(result);
  },
});

export const getJobResult = tool({
  description: 'Get the result of a completed job',
  args: {
    jobId: tool.schema.string().describe('Job ID to get result from'),
  },
  async execute({ jobId }) {
    const job = getJobById(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status !== 'completed') {
      throw new Error(`Job not completed: ${jobId} (status: ${job.status})`);
    }

    const result = {
      id: job.id,
      name: job.name,
      status: job.status,
      result: job.result,
      completedAt: job.completedAt,
    };

    return JSON.stringify(result);
  },
});

export const listJobs = tool({
  description: 'List jobs with optional filtering',
  args: {
    status: tool.schema
      .enum(['pending', 'running', 'completed', 'failed', 'canceled'])
      .optional()
      .describe('Filter by status'),
    limit: tool.schema.number().default(50).describe('Maximum number of jobs to return'),
    agentOnly: tool.schema.boolean().default(true).describe('Only show jobs from current agent'),
  },
  async execute(args, context) {
    const { agent, sessionID } = context;
    const { status, limit, agentOnly } = args;

    let jobs = agentOnly ? getJobsByAgent(agent, sessionID) : [...jobQueue];

    if (status) {
      jobs = jobs.filter((job) => job.status === status);
    }

    // Sort by creation time (newest first)
    jobs.sort((a, b) => b.createdAt - a.createdAt);

    const result = jobs.slice(0, limit).map((job) => ({
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

    return JSON.stringify(result);
  },
});

export const cancelJob = tool({
  description: 'Cancel a pending job',
  args: {
    jobId: tool.schema.string().describe('Job ID to cancel'),
  },
  async execute({ jobId }, context) {
    const { agent } = context;
    const job = getJobById(jobId);

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.agentId !== agent) {
      throw new Error(`Cannot cancel job from another agent: ${jobId}`);
    }

    if (job.status !== 'pending') {
      throw new Error(`Cannot cancel job in status: ${job.status}`);
    }

    updateJobStatus(jobId, 'canceled', { completedAt: now() });

    const result = {
      id: jobId,
      status: 'canceled',
      message: 'Job canceled successfully',
    };

    return JSON.stringify(result);
  },
});

export const listModels = tool({
  description: 'List available Ollama models',
  args: {
    detailed: tool.schema.boolean().default(false).describe('Include detailed model information'),
  },
  async execute({ detailed }) {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      await check(res, 'list models');
      const data = await res.json();

      if (!data.models || !Array.isArray(data.models)) {
        throw new Error('Invalid models response from ollama');
      }

      const models: OllamaModel[] = data.models;

      const result = {
        models: detailed ? models : models.map((model) => model.name),
        count: models.length,
      };

      return JSON.stringify(result);
    } catch (error) {
      if (error instanceof OllamaError) {
        throw new Error(`Failed to list models: ${error.message}`);
      }
      throw new Error(
        `Failed to list models: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const getQueueInfo = tool({
  description: 'Get queue statistics and information',
  args: {},
  async execute() {
    const pending = jobQueue.filter((j) => j.status === 'pending').length;
    const running = activeJobs.size;
    const completed = jobQueue.filter((j) => j.status === 'completed').length;
    const failed = jobQueue.filter((j) => j.status === 'failed').length;
    const canceled = jobQueue.filter((j) => j.status === 'canceled').length;

    const result = {
      pending,
      running,
      completed,
      failed,
      canceled,
      total: jobQueue.length,
      maxConcurrent: MAX_CONCURRENT_JOBS,
      processorActive: !!processingInterval,
      cacheSize: Array.from(modelCaches.values()).reduce((sum, cache) => sum + cache.size, 0),
    };

    return JSON.stringify(result);
  },
});

export const manageCache = tool({
  description: 'Manage the prompt cache (clear, get stats, etc.)',
  args: {
    action: tool.schema
      .enum(['stats', 'clear', 'clear-expired', 'performance-analysis'])
      .describe('Cache management action'),
  },
  async execute({ action }) {
    switch (action) {
      case 'stats':
        const totalSize = Array.from(modelCaches.values()).reduce(
          (sum, cache) => sum + cache.size,
          0,
        );
        const modelStats = Array.from(modelCaches.entries()).map(([model, cache]) => ({
          model,
          size: cache.size,
        }));

        const stats = {
          totalSize,
          modelCount: modelCaches.size,
          models: modelStats,
          similarityThreshold: CACHE_SIMILARITY_THRESHOLD,
          maxAgeMs: CACHE_MAX_AGE_MS,
          maxAgeHours: CACHE_MAX_AGE_MS / (1000 * 60 * 60),
        };
        return JSON.stringify(stats);

      case 'clear':
        const totalCleared = Array.from(modelCaches.values()).reduce(
          (sum, cache) => sum + cache.size,
          0,
        );
        modelCaches.clear();
        console.log(`Prompt cache cleared for all models (${totalCleared} entries)`);
        return JSON.stringify({
          message: 'Cache cleared successfully',
          clearedEntries: totalCleared,
          size: 0,
        });

      case 'clear-expired':
        // For in-memory cache, we'd need to iterate and remove expired entries
        // For now, just return info about this limitation
        const currentSize = Array.from(modelCaches.values()).reduce(
          (sum, cache) => sum + cache.size,
          0,
        );
        return JSON.stringify({
          message:
            'Clear expired not implemented for in-memory cache. Use "clear" to remove all entries.',
          size: currentSize,
        });

      case 'performance-analysis':
        // Analyze performance across all cached entries
        const analysis: any = {
          totalEntries: 0,
          models: {},
          taskCategories: {},
          averageScores: {},
          performanceByCategory: {},
        };

        for (const [modelName, cache] of modelCaches.entries()) {
          const entries = cache.getAll();
          analysis.models[modelName] = {
            entries: entries.length,
            averageScore: 0,
            taskDistribution: {},
          };

          let totalScore = 0;
          let scoredEntries = 0;

          for (const entry of entries) {
            const metadata = entry.metadata as CacheEntry;
            if (metadata.score !== undefined) {
              totalScore += metadata.score;
              scoredEntries++;
            }

            if (metadata.taskCategory) {
              analysis.models[modelName].taskDistribution[metadata.taskCategory] =
                (analysis.models[modelName].taskDistribution[metadata.taskCategory] || 0) + 1;

              if (!analysis.performanceByCategory[metadata.taskCategory]) {
                analysis.performanceByCategory[metadata.taskCategory] = {
                  totalScore: 0,
                  count: 0,
                  models: {},
                };
              }

              analysis.performanceByCategory[metadata.taskCategory].totalScore +=
                metadata.score || 0;
              analysis.performanceByCategory[metadata.taskCategory].count++;

              if (!analysis.performanceByCategory[metadata.taskCategory].models[modelName]) {
                analysis.performanceByCategory[metadata.taskCategory].models[modelName] = {
                  totalScore: 0,
                  count: 0,
                };
              }

              analysis.performanceByCategory[metadata.taskCategory].models[modelName].totalScore +=
                metadata.score || 0;
              analysis.performanceByCategory[metadata.taskCategory].models[modelName].count++;
            }
          }

          analysis.models[modelName].averageScore =
            scoredEntries > 0 ? totalScore / scoredEntries : 0;
          analysis.totalEntries += entries.length;
        }

        // Calculate category averages
        for (const [category, data] of Object.entries(analysis.performanceByCategory)) {
          analysis.performanceByCategory[category].averageScore =
            data.count > 0 ? data.totalScore / data.count : 0;

          for (const [model, modelData] of Object.entries(data.models)) {
            analysis.performanceByCategory[category].models[model].averageScore =
              modelData.count > 0 ? modelData.totalScore / modelData.count : 0;
          }
        }

        return JSON.stringify(analysis, null, 2);

      default:
        throw new Error(`Unknown cache action: ${action}`);
    }
  },
});

export const submitFeedback = tool({
  description: 'Submit feedback on a cached result to improve model routing',
  args: {
    prompt: tool.schema.string().describe('The original prompt that generated the result'),
    modelName: tool.schema.string().describe('The model that generated the result'),
    jobType: tool.schema.enum(['generate', 'chat']).describe('The type of job'),
    score: tool.schema
      .number()
      .min(-1)
      .max(1)
      .describe('Feedback score from -1 (terrible) to 1 (excellent)'),
    reason: tool.schema.string().optional().describe('Reason for the feedback'),
    taskCategory: tool.schema.string().optional().describe('Task category for better routing'),
  },
  async execute({ prompt, modelName, jobType, score, reason, taskCategory }) {
    try {
      const cache = await initializeCache(modelName);
      const embedding = await getPromptEmbedding(prompt, modelName);

      // Find the existing cache entry
      const hits = cache.queryByEmbedding(embedding, {
        k: 1,
        filter: (metadata) => metadata.modelName === modelName && metadata.jobType === jobType,
      });

      if (hits.length === 0) {
        throw new Error('No matching cache entry found for feedback');
      }

      const existingEntry = hits[0].metadata as CacheEntry;
      const cacheKey = hits[0].id;

      // Update the entry with feedback
      const updatedEntry: CacheEntry = {
        ...existingEntry,
        score,
        scoreSource: 'user-feedback',
        scoreReason: reason || `User feedback: ${score}`,
        taskCategory: taskCategory || existingEntry.taskCategory,
      };

      // Remove old entry and add updated one
      cache.remove([cacheKey]);
      cache.add([
        {
          id: cacheKey,
          embedding,
          metadata: updatedEntry,
        },
      ]);

      console.log(`Updated cache entry with user feedback: score=${score}, reason="${reason}"`);

      return JSON.stringify({
        message: 'Feedback submitted successfully',
        score,
        modelName,
        jobType,
        taskCategory: updatedEntry.taskCategory,
      });
    } catch (error) {
      throw new Error(
        `Failed to submit feedback: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

// Initialize queue processor on module load (cache initialized per model on demand)
startQueueProcessor();

// Cleanup on process exit
process.on('SIGINT', () => {
  stopQueueProcessor();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopQueueProcessor();
  process.exit(0);
});
