#!/usr/bin/env node

/**
 * Unit Tests for Actions Ollama Tools
 * Tests the TypeScript compilation fixes in src/actions/ollama/tools.ts
 */

import test from 'ava';
import sinon from 'sinon';

// Import the functions we're testing
import {
  submitJob,
  getJobStatus,
  getJobResult,
  listJobs,
  cancelJob,
  getQueueInfo,
  submitFeedback
} from '../actions/ollama/tools.js';

// Import dependencies
import {
  jobQueue,
  activeJobs,
  modelCaches,
  getProcessingInterval,
  setProcessingInterval,
  clearProcessingInterval,
  now,
  JobStatus,
  JobPriority,
  JobType
} from '@promethean/ollama-queue';

// Mock dependencies
const mockProcessQueue = sinon.stub();
const mockInitializeCache = sinon.stub();
const mockGetPromptEmbedding = sinon.stub();
const mockCache = {
  queryByEmbedding: sinon.stub(),
  add: sinon.stub()
};

// Mock the modules that use these functions
sinon.stub('../actions/ollama/queue.js', 'processQueue').returns(mockProcessQueue);
sinon.stub('../actions/cache/initialize.js', 'initializeCache').resolves(mockCache);
sinon.stub('../actions/cache/key.js', 'getPromptEmbedding').resolves([1, 2, 3]);

test.beforeEach(() => {
  // Reset all mocks and state
  mockProcessQueue.reset();
  mockInitializeCache.reset();
  mockGetPromptEmbedding.reset();
  mockCache.queryByEmbedding.reset();
  mockCache.add.reset();
  
  // Clear the job queue
  jobQueue.length = 0;
  activeJobs.clear();
  clearProcessingInterval();
});

test.afterEach(() => {
  // Clean up
  clearProcessingInterval();
});

test('submitJob should create job and start processor if not running', async (t) => {
  const jobData = {
    name: 'test-job',
    agentId: 'test-agent',
    sessionId: 'test-session',
    status: 'pending' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    modelName: 'test-model',
    prompt: 'test prompt'
  };
  
  const result = await submitJob(jobData);
  
  // Should create job
  t.is(jobQueue.length, 1);
  const createdJob = jobQueue[0];
  t.is(createdJob.name, 'test-job');
  t.is(createdJob.agentId, 'test-agent');
  t.is(createdJob.sessionId, 'test-session');
  t.is(createdJob.modelName, 'test-model');
  t.is(createdJob.prompt, 'test prompt');
  t.truthy(createdJob.id);
  t.truthy(createdJob.createdAt);
  t.truthy(createdJob.updatedAt);
  
  // Should start processor
  t.truthy(getProcessingInterval());
  
  // Should return correct result
  t.is(result.jobId, createdJob.id);
  t.is(result.jobName, 'test-job');
  t.is(result.status, 'pending');
  t.is(result.queuePosition, 1);
});

test('submitJob should not start processor if already running', async (t) => {
  // Set up existing processor
  const existingInterval = {} as NodeJS.Timeout;
  setProcessingInterval(existingInterval);
  
  const jobData = {
    name: 'test-job',
    agentId: 'test-agent',
    sessionId: 'test-session',
    status: 'pending' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    modelName: 'test-model',
    prompt: 'test prompt'
  };
  
  await submitJob(jobData);
  
  // Should not change the interval
  t.is(getProcessingInterval(), existingInterval);
});

test('getJobStatus should return job status', async (t) => {
  // Create a test job
  const testJob = {
    id: 'test-job-id',
    name: 'test-job',
    agentId: 'test-agent',
    sessionId: 'test-session',
    status: 'completed' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    startedAt: now(),
    completedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt',
    result: 'test result'
  };
  
  jobQueue.push(testJob);
  
  const result = await getJobStatus('test-job-id');
  
  t.is(result.id, 'test-job-id');
  t.is(result.name, 'test-job');
  t.is(result.status, 'completed');
  t.is(result.priority, 'medium');
  t.is(result.modelName, 'test-model');
  t.truthy(result.createdAt);
  t.truthy(result.updatedAt);
  t.truthy(result.startedAt);
  t.truthy(result.completedAt);
});

test('getJobStatus should throw error for non-existent job', async (t) => {
  await t.throwsAsync(() => getJobStatus('non-existent-id'), {
    message: 'Job not found: non-existent-id'
  });
});

test('getJobResult should return job result for completed job', async (t) => {
  // Create a completed job
  const testJob = {
    id: 'test-job-id',
    name: 'test-job',
    agentId: 'test-agent',
    sessionId: 'test-session',
    status: 'completed' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    completedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt',
    result: 'test result'
  };
  
  jobQueue.push(testJob);
  
  const result = await getJobResult('test-job-id');
  
  t.is(result.id, 'test-job-id');
  t.is(result.name, 'test-job');
  t.is(result.status, 'completed');
  t.is(result.result, 'test result');
  t.truthy(result.completedAt);
});

test('getJobResult should throw error for non-completed job', async (t) => {
  // Create a pending job
  const testJob = {
    id: 'test-job-id',
    name: 'test-job',
    agentId: 'test-agent',
    sessionId: 'test-session',
    status: 'pending' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt'
  };
  
  jobQueue.push(testJob);
  
  await t.throwsAsync(() => getJobResult('test-job-id'), {
    message: 'Job not completed: test-job-id (status: pending)'
  });
});

test('listJobs should filter and limit jobs correctly', async (t) => {
  // Create test jobs
  const jobs = [
    {
      id: 'job-1',
      agentId: 'agent-1',
      sessionId: 'session-1',
      status: 'pending' as JobStatus,
      priority: 'medium' as JobPriority,
      type: 'generate' as JobType,
      createdAt: now() - 1000,
      updatedAt: now() - 1000,
      modelName: 'model-1',
      prompt: 'prompt 1'
    },
    {
      id: 'job-2',
      agentId: 'agent-1',
      sessionId: 'session-1',
      status: 'completed' as JobStatus,
      priority: 'high' as JobPriority,
      type: 'chat' as JobType,
      createdAt: now(),
      updatedAt: now(),
      modelName: 'model-2',
      messages: [{ role: 'user', content: 'message' }]
    },
    {
      id: 'job-3',
      agentId: 'agent-2',
      sessionId: 'session-2',
      status: 'pending' as JobStatus,
      priority: 'low' as JobPriority,
      type: 'embedding' as JobType,
      createdAt: now() - 500,
      updatedAt: now() - 500,
      modelName: 'model-3',
      input: 'input text'
    }
  ];
  
  jobQueue.push(...jobs);
  
  // Test filtering by agent
  const agentJobs = await listJobs({
    agentOnly: true,
    agentId: 'agent-1',
    sessionId: 'session-1',
    limit: 10
  });
  
  t.is(agentJobs.length, 2);
  t.true(agentJobs.every(job => job.agentId === 'agent-1'));
  
  // Test filtering by status
  const pendingJobs = await listJobs({
    status: 'pending',
    agentOnly: false,
    limit: 10
  });
  
  t.is(pendingJobs.length, 2);
  t.true(pendingJobs.every(job => job.status === 'pending'));
  
  // Test limit
  const limitedJobs = await listJobs({
    agentOnly: false,
    limit: 1
  });
  
  t.is(limitedJobs.length, 1);
});

test('cancelJob should cancel pending job for correct agent', async (t) => {
  // Create a pending job
  const testJob = {
    id: 'test-job-id',
    agentId: 'test-agent',
    sessionId: 'test-session',
    status: 'pending' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt'
  };
  
  jobQueue.push(testJob);
  
  const result = await cancelJob('test-job-id', 'test-agent');
  
  t.is(result.id, 'test-job-id');
  t.is(result.status, 'canceled');
  t.is(result.message, 'Job canceled successfully');
  
  // Job should be updated
  const updatedJob = jobQueue.find(job => job.id === 'test-job-id');
  t.is(updatedJob?.status, 'canceled');
  t.truthy(updatedJob?.completedAt);
});

test('cancelJob should throw error for wrong agent', async (t) => {
  // Create a pending job
  const testJob = {
    id: 'test-job-id',
    agentId: 'test-agent',
    sessionId: 'test-session',
    status: 'pending' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt'
  };
  
  jobQueue.push(testJob);
  
  await t.throwsAsync(() => cancelJob('test-job-id', 'wrong-agent'), {
    message: 'Cannot cancel job from another agent: test-job-id'
  });
});

test('getQueueInfo should return correct statistics', async (t) => {
  // Create test jobs
  const jobs = [
    {
      id: 'job-1',
      agentId: 'agent-1',
      sessionId: 'session-1',
      status: 'pending' as JobStatus,
      priority: 'medium' as JobPriority,
      type: 'generate' as JobType,
      createdAt: now(),
      updatedAt: now(),
      modelName: 'model-1',
      prompt: 'prompt 1'
    },
    {
      id: 'job-2',
      agentId: 'agent-1',
      sessionId: 'session-1',
      status: 'completed' as JobStatus,
      priority: 'high' as JobPriority,
      type: 'chat' as JobType,
      createdAt: now(),
      updatedAt: now(),
      modelName: 'model-2',
      messages: [{ role: 'user', content: 'message' }]
    },
    {
      id: 'job-3',
      agentId: 'agent-2',
      sessionId: 'session-2',
      status: 'failed' as JobStatus,
      priority: 'low' as JobPriority,
      type: 'embedding' as JobType,
      createdAt: now(),
      updatedAt: now(),
      modelName: 'model-3',
      input: 'input text'
    }
  ];
  
  jobQueue.push(...jobs);
  
  // Add an active job
  const activeJob = {
    id: 'active-job',
    agentId: 'agent-1',
    sessionId: 'session-1',
    status: 'running' as JobStatus,
    priority: 'medium' as JobPriority,
    type: 'generate' as JobType,
    createdAt: now(),
    updatedAt: now(),
    startedAt: now(),
    modelName: 'model-1',
    prompt: 'active prompt'
  };
  activeJobs.set('active-job', activeJob);
  
  const result = await getQueueInfo();
  
  t.is(result.pending, 1);
  t.is(result.running, 1);
  t.is(result.completed, 1);
  t.is(result.failed, 1);
  t.is(result.canceled, 0);
  t.is(result.total, 4);
  t.true(result.processorActive === false); // No processor running
  t.is(typeof result.maxConcurrent, 'number');
  t.is(typeof result.cacheSize, 'number');
});

test('submitFeedback should update cache entry', async (t) => {
  // Mock cache hit
  mockCache.queryByEmbedding.resolves([{
    id: 'cache-key',
    score: 0.9,
    metadata: {
      modelName: 'test-model',
      jobType: 'generate',
      score: 0.5,
      scoreSource: 'deterministic' as const,
      taskCategory: 'test-category'
    }
  }]);
  
  const feedbackOptions = {
    prompt: 'test prompt',
    modelName: 'test-model',
    jobType: 'generate',
    score: 0.8,
    reason: 'Good response',
    taskCategory: 'updated-category'
  };
  
  const result = await submitFeedback(feedbackOptions);
  
  t.is(result.message, 'Feedback submitted successfully');
  t.is(result.score, 0.8);
  t.is(result.modelName, 'test-model');
  t.is(result.jobType, 'generate');
  t.is(result.taskCategory, 'updated-category');
  
  // Should have queried cache
  t.true(mockCache.queryByEmbedding.calledOnce);
  t.true(mockCache.add.calledOnce);
});

test('submitFeedback should throw error when no cache entry found', async (t) => {
  // Mock no cache hit
  mockCache.queryByEmbedding.resolves([]);
  
  const feedbackOptions = {
    prompt: 'test prompt',
    modelName: 'test-model',
    jobType: 'generate',
    score: 0.8
  };
  
  await t.throwsAsync(() => submitFeedback(feedbackOptions), {
    message: 'No matching cache entry found for feedback'
  });
});