// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for Ollama tools

import { tool } from '@opencode-ai/plugin/tool';
import { randomUUID } from 'node:crypto';
import { now, JobStatus } from '@promethean/ollama-queue';
import * as ollamaActions from '../actions/index.js';
import * as cacheActions from '../actions/index.js';
import type { Job } from '../actions/index.js';

// Factory for submitJob tool
export function createSubmitJobTool(): any {
  return tool({
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
          format: tool.schema
            .union([tool.schema.literal('json'), tool.schema.object({})])
            .optional(),
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

      const result = await ollamaActions.submitJob(job);

      return JSON.stringify(result);
    },
  });
}

// Factory for getJobStatus tool
export function createGetJobStatusTool(): any {
  return tool({
    description: 'Get status of a specific job',
    args: {
      jobId: tool.schema.string().describe('Job ID to check'),
    },
    async execute({ jobId }) {
      const result = await ollamaActions.getJobStatus(jobId);
      return JSON.stringify(result);
    },
  });
}

// Factory for getJobResult tool
export function createGetJobResultTool(): any {
  return tool({
    description: 'Get result of a completed job',
    args: {
      jobId: tool.schema.string().describe('Job ID to get result from'),
    },
    async execute({ jobId }) {
      const result = await ollamaActions.getJobResult(jobId);
      return JSON.stringify(result);
    },
  });
}

// Factory for listJobs tool
export function createListJobsTool(): any {
  return tool({
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

      const result = await ollamaActions.listJobs({
        status: status as JobStatus | undefined,
        limit,
        agentOnly,
        agentId: agent,
        sessionId: sessionID,
      });

      return JSON.stringify(result);
    },
  });
}

// Factory for cancelJob tool
export function createCancelJobTool(): any {
  return tool({
    description: 'Cancel a pending job',
    args: {
      jobId: tool.schema.string().describe('Job ID to cancel'),
    },
    async execute({ jobId }, context) {
      const { agent } = context;
      const result = await ollamaActions.cancelJob(jobId, agent);
      return JSON.stringify(result);
    },
  });
}

// Factory for listModels tool
export function createListModelsTool(): any {
  return tool({
    description: 'List available Ollama models',
    args: {
      detailed: tool.schema.boolean().default(false).describe('Include detailed model information'),
    },
    async execute({ detailed }) {
      const result = await ollamaActions.listModels(detailed);
      return JSON.stringify(result);
    },
  });
}

// Factory for getQueueInfo tool
export function createGetQueueInfoTool(): any {
  return tool({
    description: 'Get queue statistics and information',
    args: {},
    async execute() {
      const result = await ollamaActions.getQueueInfo();
      return JSON.stringify(result);
    },
  });
}

// Factory for manageCache tool
export function createManageCacheTool(): any {
  return tool({
    description: 'Manage prompt cache (clear, get stats, etc.)',
    args: {
      action: tool.schema
        .enum(['stats', 'clear', 'clear-expired', 'performance-analysis'])
        .describe('Cache management action'),
    },
    async execute({ action }) {
      const result = await cacheActions.manageCache(action);
      return JSON.stringify(result);
    },
  });
}

// Factory for submitFeedback tool
export function createSubmitFeedbackTool(): any {
  return tool({
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
      const result = await ollamaActions.submitFeedback({
        prompt,
        modelName,
        jobType,
        score,
        reason,
        taskCategory,
      });
      return JSON.stringify(result);
    },
  });
}

// Export all factory functions
export const ollamaToolFactories = {
  createSubmitJobTool,
  createGetJobStatusTool,
  createGetJobResultTool,
  createListJobsTool,
  createCancelJobTool,
  createListModelsTool,
  createGetQueueInfoTool,
  createManageCacheTool,
  createSubmitFeedbackTool,
};
