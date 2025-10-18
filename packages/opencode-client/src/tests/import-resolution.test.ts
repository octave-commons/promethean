#!/usr/bin/env node

/**
 * Unit Tests for Import Resolution
 * Tests that all imports are properly resolved after the TypeScript compilation fixes
 */

import test from 'ava';

// Test imports from ollama-queue package
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
  setProcessingInterval,
  now,
  OllamaError,
  UUID,
  JobStatus,
  JobPriority,
  JobType,
  OllamaOptions,
  Job,
  CacheEntry,
  POLL_INTERVAL
} from '@promethean/ollama-queue';

// Test imports from local modules
import { Job as LocalJob } from '../tools/Job.js';
import { CacheEntry as LocalCacheEntry } from '../tools/CacheEntry.js';
import { OllamaModel } from '../tools/OllamaModel.js';
import { OllamaOptions as LocalOllamaOptions } from '../tools/OllamaOptions.js';

// Test imports from tools that were fixed
import { startQueueProcessor } from '../tools/startQueueProcessor.js';
import { processQueue } from '../tools/processQueue.js';
import { getJobById } from '../tools/getJobById.js';
import { updateJobStatus } from '../tools/updateJobStatus.js';

// Test that ollama.ts imports work correctly
const ollamaModule = require('../tools/ollama.js');

test('ollama-queue imports should be properly resolved', (t) => {
  // Test basic imports
  t.truthy(typeof OLLAMA_URL === 'string');
  t.truthy(Array.isArray(jobQueue));
  t.truthy(activeJobs instanceof Map);
  t.truthy(modelCaches instanceof Map);
  t.truthy(typeof CACHE_SIMILARITY_THRESHOLD === 'number');
  t.truthy(typeof CACHE_MAX_AGE_MS === 'number');
  t.truthy(typeof MAX_CONCURRENT_JOBS === 'number');
  t.truthy(typeof POLL_INTERVAL === 'number');
  
  // Test function imports
  t.truthy(typeof getProcessingInterval === 'function');
  t.truthy(typeof clearProcessingInterval === 'function');
  t.truthy(typeof setProcessingInterval === 'function');
  t.truthy(typeof now === 'function');
  
  // Test class imports
  t.truthy(OllamaError.prototype instanceof Error);
  
  // Test type imports
  t.truthy(typeof UUID === 'string');
  t.truthy(['pending', 'running', 'completed', 'failed', 'canceled'].includes(JobStatus));
  t.truthy(['low', 'medium', 'high', 'urgent'].includes(JobPriority));
  t.truthy(['generate', 'chat', 'embedding'].includes(JobType));
});

test('local module imports should be properly resolved', (t) => {
  // Test that local imports work
  t.truthy(typeof LocalJob === 'function' || typeof LocalJob === 'object');
  t.truthy(typeof LocalCacheEntry === 'function' || typeof LocalCacheEntry === 'object');
  t.truthy(typeof OllamaModel === 'function' || typeof OllamaModel === 'object');
  t.truthy(typeof LocalOllamaOptions === 'function' || typeof LocalOllamaOptions === 'object');
});

test('tool function imports should be properly resolved', (t) => {
  // Test that tool functions are importable
  t.truthy(typeof startQueueProcessor === 'function');
  t.truthy(typeof processQueue === 'function');
  t.truthy(typeof getJobById === 'function');
  t.truthy(typeof updateJobStatus === 'function');
});

test('ollama.ts module should export expected functions', (t) => {
  // Test that the main ollama module exports the expected functions
  t.truthy(typeof ollamaModule.submitJob === 'function');
  t.truthy(typeof ollamaModule.getJobStatus === 'function');
  t.truthy(typeof ollamaModule.getJobResult === 'function');
  t.truthy(typeof ollamaModule.listJobs === 'function');
  t.truthy(typeof ollamaModule.cancelJob === 'function');
  t.truthy(typeof ollamaModule.listModels === 'function');
  t.truthy(typeof ollamaModule.getQueueInfo === 'function');
  t.truthy(typeof ollamaModule.manageCache === 'function');
  t.truthy(typeof ollamaModule.submitFeedback === 'function');
});

test('type compatibility between imports', (t) => {
  // Test that types are compatible between different imports
  const testJob: Job = {
    id: 'test-id' as UUID,
    status: 'pending' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt'
  };
  
  // Should be able to add to jobQueue
  t.notThrows(() => jobQueue.push(testJob));
  
  // Should be able to find with getJobById
  const foundJob = getJobById(testJob.id);
  t.truthy(foundJob);
  t.is(foundJob?.id, testJob.id);
  
  // Clean up
  const index = jobQueue.findIndex(job => job.id === testJob.id);
  if (index >= 0) {
    jobQueue.splice(index, 1);
  }
});

test('clearProcessingInterval function signature', (t) => {
  // Test that clearProcessingInterval has the correct signature
  t.notThrows(() => clearProcessingInterval());
  t.is(getProcessingInterval(), null);
});

test('setProcessingInterval function signature', (t) => {
  // Test that setProcessingInterval accepts NodeJS.Timeout
  const mockInterval = {} as NodeJS.Timeout;
  t.notThrows(() => setProcessingInterval(mockInterval));
  t.is(getProcessingInterval(), mockInterval);
  
  // Clean up
  clearProcessingInterval();
});

test('OllamaError class functionality', (t) => {
  // Test OllamaError class
  const error = new OllamaError(500, 'Test error');
  t.truthy(error instanceof Error);
  t.truthy(error instanceof OllamaError);
  t.is(error.status, 500);
  t.is(error.message, 'Test error');
});

test('constants should have expected values', (t) => {
  // Test that constants have reasonable values
  t.true(CACHE_SIMILARITY_THRESHOLD > 0 && CACHE_SIMILARITY_THRESHOLD <= 1);
  t.true(CACHE_MAX_AGE_MS > 0);
  t.true(MAX_CONCURRENT_JOBS > 0);
  t.true(POLL_INTERVAL > 0);
  t.truthy(OLLAMA_URL.startsWith('http'));
});

test('now function should return timestamp', (t) => {
  // Test that now() returns a reasonable timestamp
  const timestamp = now();
  t.true(typeof timestamp === 'number');
  t.true(timestamp > 0);
  t.true(timestamp <= Date.now());
  
  // Should be consistent
  const timestamp2 = now();
  t.true(timestamp2 >= timestamp);
});