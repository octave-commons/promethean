// SPDX-License-Identifier: GPL-3.0-only
// Ollama API integration tests

import test from 'ava';
import type { CacheAction } from '../types/index.js';
import {
  listModels,
  submitJob,
  getJobStatus,
  getJobResult,
  listJobs,
  getQueueInfo,
  manageCache,
} from '../api/ollama.js';

test('listModels returns available models', async (t) => {
  try {
    const models = await listModels(false);

    // Should return an array
    t.true(Array.isArray(models));

    // Should have models if Ollama is running
    if (models.length > 0) {
      // First model should have expected properties
      const firstModel = models[0];
      t.true(typeof firstModel === 'object' || typeof firstModel === 'string');
    }

    t.pass();
  } catch (error) {
    // If Ollama is not running, that's expected in test environment
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      t.pass('Ollama not running - expected in test environment');
    } else {
      t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

test('listModels detailed mode', async (t) => {
  try {
    const models = await listModels(true);

    // Should return an array
    t.true(Array.isArray(models));

    // In detailed mode, should return model objects
    if (models.length > 0) {
      const firstModel = models[0];
      if (typeof firstModel === 'object' && firstModel !== null) {
        t.true('name' in firstModel);
      }
    }

    t.pass();
  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      t.pass('Ollama not running - expected in test environment');
    } else {
      t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

test('submitJob creates a new job', async (t) => {
  try {
    const jobOptions = {
      modelName: 'test-model',
      jobType: 'generate' as const,
      priority: 'medium' as const,
      jobName: 'Test Job',
      prompt: 'Test prompt',
      agentId: 'test-agent',
      sessionId: 'test-session',
    };

    const job = await submitJob(jobOptions);

    // Should return job with expected properties
    t.true(typeof job.id === 'string');
    t.is(job.modelName, jobOptions.modelName);
    t.is(job.jobType, jobOptions.jobType);
    t.is(job.status, 'pending');
    t.is(job.jobName, jobOptions.jobName);

    t.pass();
  } catch (error) {
    // This should work even without Ollama running since it just queues the job
    t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

test('listJobs returns job list', async (t) => {
  try {
    const jobs = await listJobs({
      limit: 10,
      agentOnly: false,
    });

    // Should return an array
    t.true(Array.isArray(jobs));

    // Jobs should have expected properties
    jobs.forEach((job: any) => {
      t.true(typeof job.id === 'string');
      t.true(typeof job.status === 'string');
      t.true(typeof job.modelName === 'string');
    });

    t.pass();
  } catch (error) {
    t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

test('getQueueInfo returns queue statistics', async (t) => {
  try {
    const info = await getQueueInfo();

    // Should return object with queue statistics
    t.true(typeof info === 'object' && info !== null);

    // Should have expected properties
    if (info && typeof info === 'object') {
      t.true('total' in info);
      t.true('pending' in info);
      t.true('running' in info);
      t.true('completed' in info);
      t.true('maxConcurrent' in info);
    }

    t.pass();
  } catch (error) {
    t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

test('manageCache stats action', async (t) => {
  try {
    const stats = await manageCache('stats');

    // Should return cache statistics
    t.true(typeof stats === 'object' && stats !== null);

    if (stats && typeof stats === 'object') {
      t.true('totalSize' in stats);
      t.true('modelCount' in stats);
    }

    t.pass();
  } catch (error) {
    t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

test('manageCache invalid action throws error', async (t) => {
  try {
    await manageCache('invalid-action' as CacheAction);
    t.fail('Should have thrown an error for invalid action');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid action')) {
      t.pass('Correctly threw error for invalid action');
    } else {
      t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

test('getJobStatus for non-existent job', async (t) => {
  try {
    await getJobStatus('non-existent-job-id');
    t.fail('Should have thrown an error for non-existent job');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Job not found')) {
      t.pass('Correctly threw error for non-existent job');
    } else {
      t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

test('getJobResult for non-existent job', async (t) => {
  try {
    await getJobResult('non-existent-job-id');
    t.fail('Should have thrown an error for non-existent job');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Job not found')) {
      t.pass('Correctly threw error for non-existent job');
    } else {
      t.fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});
