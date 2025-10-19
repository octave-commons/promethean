// SPDX-License-Identifier: GPL-3.0-only
// Ollama LLM job queue system for async background processing

import { tool } from '@opencode-ai/plugin/tool';
import { randomUUID } from 'node:crypto';
import {
  OLLAMA_URL,
  jobQueue,
  activeJobs,
  modelCaches,
  CACHE_SIMILARITY_THRESHOLD,
  CACHE_MAX_AGE_MS,
  MAX_CONCURRENT_JOBS,
  getProcessingInterval,
  clearProcessingInterval,
  now,
} from '@promethean/ollama-queue';
import { Job } from './Job.js';
import { OllamaModel } from './OllamaModel.js';
import { CacheEntry } from './CacheEntry.js';
import { initializeCache } from './initializeCache.js';
import { getPromptEmbedding } from './getPromptEmbedding.js';
import { getJobById } from './getJobById.js';
import { updateJobStatus } from './updateJobStatus.js';
import { check } from './check.js';
import { startQueueProcessor } from './startQueueProcessor.js';
import { OllamaError } from '@promethean/ollama-queue';

// Stop queue processor
function stopQueueProcessor(): void {
  clearProcessingInterval();
}

// Tools
export const submitJob: any = tool({
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
    if (!getProcessingInterval()) {
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

export const getJobStatus: any = tool({
  description: 'Get status of a specific job',
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

export const getJobResult: any = tool({
  description: 'Get result of a completed job',
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

export const listJobs: any = tool({
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

    let jobs = agentOnly
      ? ((agentId?: string, sessionId?: string): Job[] => {
          return jobQueue.filter((job) => {
            if (agentId && job.agentId !== agentId) return false;
            if (sessionId && job.sessionId !== sessionId) return false;
            return true;
          });
        })(agent, sessionID)
      : [...jobQueue];

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

export const cancelJob: any = tool({
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

export const listModels: any = tool({
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
      processorActive: !!getProcessingInterval(),
      cacheSize: Array.from(modelCaches.values()).reduce((sum, cache) => sum + cache.size, 0),
    };

    return JSON.stringify(result);
  },
});

export const manageCache: any = tool({
  description: 'Manage prompt cache (clear, get stats, etc.)',
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

        for (const [modelName] of modelCaches.entries()) {
          const entries: any[] = []; // TODO: Implement proper cache entries retrieval
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
          const dataAny = data as any;
          analysis.performanceByCategory[category].averageScore =
            dataAny.count > 0 ? dataAny.totalScore / dataAny.count : 0;

          for (const [model, modelData] of Object.entries(dataAny.models)) {
            const modelDataAny = modelData as any;
            analysis.performanceByCategory[category].models[model].averageScore =
              modelDataAny.count > 0 ? modelDataAny.totalScore / modelDataAny.count : 0;
          }
        }

        return JSON.stringify(analysis, null, 2);

      default:
        throw new Error(`Unknown cache action: ${action}`);
    }
  },
});

export const submitFeedback: any = tool({
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
    reason: tool.schema.string().optional().describe('Reason for feedback'),
    taskCategory: tool.schema.string().optional().describe('Task category for better routing'),
  },
  async execute({ prompt, modelName, jobType, score, reason, taskCategory }) {
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
// DISABLED: This causes CLI commands to hang
// startQueueProcessor();

// Cleanup on process exit
process.on('SIGINT', () => {
  stopQueueProcessor();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopQueueProcessor();
  process.exit(0);
});
