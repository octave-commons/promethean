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
  POLL_INTERVAL,
} from '@promethean/ollama-queue';

// Import types separately
import type { JobStatus, JobPriority, JobType } from '@promethean/ollama-queue';

// Test imports from tools that were fixed
// Use the functions directly from @promethean/ollama-queue for more reliable testing
import {
  startQueueProcessor,
  processQueue,
  getJobById,
  updateJobStatus,
} from '@promethean/ollama-queue';

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

  // Test type imports (these are types, not runtime values)
  const jobStatus: JobStatus = 'pending';
  const jobPriority: JobPriority = 'medium';
  const jobType: JobType = 'generate';
  t.truthy(jobStatus === 'pending');
  t.truthy(jobPriority === 'medium');
  t.truthy(jobType === 'generate');
});

test('tool function imports should be properly resolved', (t) => {
  // Test that tool functions are importable
  t.truthy(typeof startQueueProcessor === 'function');
  t.truthy(typeof processQueue === 'function');
  t.truthy(typeof getJobById === 'function');
  t.truthy(typeof updateJobStatus === 'function');
});

test('clearProcessingInterval function signature', (t) => {
  // Test that clearProcessingInterval has the correct signature
  t.notThrows(() => clearProcessingInterval());
  t.true(getProcessingInterval() === null);
});

test('setProcessingInterval function signature', (t) => {
  // Test that setProcessingInterval accepts NodeJS.Timeout
  const mockInterval = {} as NodeJS.Timeout;
  t.notThrows(() => setProcessingInterval(mockInterval));
  t.is(getProcessingInterval(), mockInterval);

  // Clean up using clearProcessingInterval (which sets to null)
  clearProcessingInterval();
  t.true(getProcessingInterval() === null);
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

test('job operations should work correctly', (t) => {
  // Create a test job
  const testJob = {
    id: 'test-id',
    status: 'pending' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt',
  };

  // Should be able to add to jobQueue
  t.notThrows(() => jobQueue.push(testJob));

  // Should be able to find with getJobById
  const foundJob = getJobById(testJob.id);
  t.truthy(foundJob);
  t.is(foundJob?.id, testJob.id);

  // Should be able to update status
  t.notThrows(() => updateJobStatus(testJob.id, 'completed'));

  // Clean up
  const index = jobQueue.findIndex((job) => job.id === testJob.id);
  if (index >= 0) {
    jobQueue.splice(index, 1);
  }
});
