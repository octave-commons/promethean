// SPDX-License-Identifier: GPL-3.0-only
// Ollama LLM job queue system for async background processing

import { tool } from '@opencode-ai/plugin';
import { randomUUID } from 'node:crypto';

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

// Queue processing configuration
const MAX_CONCURRENT_JOBS = 2;
const POLL_INTERVAL = 5000; // 5 seconds

let processingInterval: NodeJS.Timeout | null = null;

const now = () => Date.now();

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

    switch (job.type) {
      case 'generate':
        if (!job.prompt) throw new Error('Generate job missing prompt');
        result = await callOllamaGenerate(job.modelName, job.prompt, job.options);
        break;
      case 'chat':
        if (!job.messages) throw new Error('Chat job missing messages');
        result = await callOllamaChat(job.modelName, job.messages, job.options);
        break;
      case 'embedding':
        if (!job.input) throw new Error('Embedding job missing input');
        result = await callOllamaEmbed(job.modelName, job.input);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    updateJobStatus(job.id, 'completed', {
      result,
      completedAt: now(),
    });
  } catch (error) {
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
    };

    return JSON.stringify(result);
  },
});

// Initialize queue processor on module load
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
