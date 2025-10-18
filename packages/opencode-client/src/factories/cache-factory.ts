// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for cache tools

import { tool } from '@opencode-ai/plugin/tool';
import {
  initializeCache,
  checkCache,
  createCacheKey,
  storeInCache,
  manageCache,
} from '../actions/index.js';

// Factory for initializeCache tool
export function createInitializeCacheTool(): any {
  return tool({
    description: 'Initialize cache for a specific model',
    args: {
      modelName: tool.schema.string().describe('Model name to initialize cache for'),
    },
    async execute({ modelName }) {
      await initializeCache(modelName);
      return JSON.stringify({ initialized: true, modelName });
    },
  });
}

// Factory for checkCache tool
export function createCheckCacheTool(): any {
  return tool({
    description: 'Check if a prompt exists in cache',
    args: {
      prompt: tool.schema.string().describe('Prompt to check in cache'),
      modelName: tool.schema.string().describe('Model name to check cache for'),
      jobType: tool.schema.enum(['generate', 'chat', 'embedding']).describe('Job type'),
    },
    async execute({ prompt, modelName, jobType }) {
      const result = await checkCache(prompt, modelName, jobType as any);
      return JSON.stringify(result);
    },
  });
}

// Factory for createCacheKey tool
export function createCreateCacheKeyTool(): any {
  return tool({
    description: 'Create a cache key for a prompt',
    args: {
      prompt: tool.schema.string().describe('Prompt to create key for'),
      modelName: tool.schema.string().describe('Model name'),
      jobType: tool.schema.enum(['generate', 'chat', 'embedding']).describe('Job type'),
    },
    async execute({ prompt, modelName, jobType }) {
      const result = createCacheKey(prompt, modelName, jobType as any);
      return JSON.stringify({ cacheKey: result });
    },
  });
}

// Factory for storeInCache tool
export function createStoreInCacheTool(): any {
  return tool({
    description: 'Store a result in cache',
    args: {
      prompt: tool.schema.string().describe('Original prompt'),
      result: tool.schema.string().describe('Result to cache'),
      modelName: tool.schema.string().describe('Model name'),
      jobType: tool.schema.enum(['generate', 'chat', 'embedding']).describe('Job type'),
      score: tool.schema.number().optional().describe('Performance score'),
      scoreSource: tool.schema
        .enum(['deterministic', 'user-feedback', 'auto-eval'])
        .optional()
        .describe('Score source'),
      scoreReason: tool.schema.string().optional().describe('Reason for score'),
      taskCategory: tool.schema.string().optional().describe('Task category'),
      executionTime: tool.schema.number().optional().describe('Execution time in ms'),
      tokensUsed: tool.schema.number().optional().describe('Number of tokens used'),
    },
    async execute(args) {
      const {
        prompt,
        result,
        modelName,
        jobType,
        score,
        scoreSource,
        scoreReason,
        taskCategory,
        executionTime,
        tokensUsed,
      } = args;

      const performanceData = {
        score,
        scoreSource,
        scoreReason,
        taskCategory,
        executionTime,
        tokensUsed,
      };

      await storeInCache(prompt, result, modelName, jobType as any, performanceData);
      return JSON.stringify({ stored: true, modelName, jobType });
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
      const result = await manageCache(action);
      return JSON.stringify(result);
    },
  });
}

// Export all factory functions
export const cacheToolFactories = {
  createInitializeCacheTool,
  createCheckCacheTool,
  createCreateCacheKeyTool,
  createStoreInCacheTool,
  createManageCacheTool,
};
