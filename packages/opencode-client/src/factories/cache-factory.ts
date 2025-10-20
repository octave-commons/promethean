// SPDX-License-Identifier: GPL-3.0-only
// Cache tool factories

import {
  initializeCache,
  checkCache,
  createCacheKey,
  storeInCache,
  manageCache,
} from '../actions/cache/index.js';

export const cacheToolFactories = {
  createInitializeCacheTool: () => ({
    name: 'cache_initialize',
    description: 'Initialize cache for a specific model',
    input_schema: {
      type: 'object',
      properties: {
        modelName: {
          type: 'string',
          description: 'The model name to initialize cache for',
        },
      },
      required: ['modelName'],
    },
    execute: async (args: { modelName: string }) => {
      return initializeCache(args.modelName);
    },
  }),

  createCheckCacheTool: () => ({
    name: 'cache_check',
    description: 'Check if a prompt exists in cache',
    input_schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The prompt to check in cache',
        },
        modelName: {
          type: 'string',
          description: 'The model name',
        },
        jobType: {
          type: 'string',
          enum: ['generate', 'chat', 'embedding'],
          description: 'The job type',
        },
      },
      required: ['prompt', 'modelName', 'jobType'],
    },
    execute: async (args: { prompt: string; modelName: string; jobType: string }) => {
      return checkCache(args.prompt, args.modelName, args.jobType as any);
    },
  }),

  createCreateCacheKeyTool: () => ({
    name: 'cache_createKey',
    description: 'Create a cache key for a prompt',
    input_schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The prompt to create key for',
        },
        modelName: {
          type: 'string',
          description: 'The model name',
        },
        jobType: {
          type: 'string',
          enum: ['generate', 'chat', 'embedding'],
          description: 'The job type',
        },
      },
      required: ['prompt', 'modelName', 'jobType'],
    },
    execute: async (args: { prompt: string; modelName: string; jobType: string }) => {
      return createCacheKey(args.prompt, args.modelName, args.jobType as any);
    },
  }),

  createStoreInCacheTool: () => ({
    name: 'cache_store',
    description: 'Store a result in cache',
    input_schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The original prompt',
        },
        result: {
          type: 'string',
          description: 'The result to cache',
        },
        modelName: {
          type: 'string',
          description: 'The model name',
        },
        jobType: {
          type: 'string',
          enum: ['generate', 'chat', 'embedding'],
          description: 'The job type',
        },
        score: {
          type: 'number',
          description: 'Optional score for the result',
        },
        scoreSource: {
          type: 'string',
          enum: ['deterministic', 'user-feedback', 'auto-eval'],
          description: 'Optional score source',
        },
        scoreReason: {
          type: 'string',
          description: 'Optional reason for the score',
        },
        taskCategory: {
          type: 'string',
          description: 'Optional task category',
        },
        executionTime: {
          type: 'number',
          description: 'Optional execution time in milliseconds',
        },
        tokensUsed: {
          type: 'number',
          description: 'Optional number of tokens used',
        },
      },
      required: ['prompt', 'result', 'modelName', 'jobType'],
    },
    execute: async (args: {
      prompt: string;
      result: string;
      modelName: string;
      jobType: string;
      score?: number;
      scoreSource?: string;
      scoreReason?: string;
      taskCategory?: string;
      executionTime?: number;
      tokensUsed?: number;
    }) => {
      return storeInCache(
        args.prompt,
        args.result,
        args.modelName,
        args.jobType as any,
        args.score,
        args.scoreSource as any,
        args.scoreReason,
        args.taskCategory,
        args.executionTime,
        args.tokensUsed,
      );
    },
  }),

  createManageCacheTool: () => ({
    name: 'cache_manage',
    description: 'Manage cache (clear, get stats, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['stats', 'clear', 'clear-expired', 'performance-analysis'],
          description: 'The cache management action',
        },
      },
      required: ['action'],
    },
    execute: async (args: { action: string }) => {
      return manageCache(args.action as any);
    },
  }),
};
