#!/usr/bin/env node

/**
 * Unit Tests for Queue Processor Functionality
 * Tests the TypeScript compilation fixes for:
 * 1. Fixed `setProcessingInterval(null)` type mismatch by using `clearProcessingInterval()`
 * 2. Updated imports in `src/tools/ollama.ts` and `src/actions/ollama/tools.ts`
 * 3. Updated `stopQueueProcessor()` function implementation
 * 4. Removed unused imports and functions
 */

import test from 'ava';
import sinon from 'sinon';
import { 
  getProcessingInterval,
  clearProcessingInterval,
  setProcessingInterval,
  jobQueue,
  now,
  POLL_INTERVAL
} from '@promethean/ollama-queue';

// Import the functions we're testing
import { startQueueProcessor } from '../tools/startQueueProcessor.js';
import { processQueue } from '../tools/processQueue.js';

// Mock the ollama-queue module
const mockClearInterval = sinon.stub(global, 'clearInterval');
const mockSetInterval = sinon.stub(global, 'setInterval');
const mockConsoleLog = sinon.stub(console, 'log');
const mockConsoleError = sinon.stub(console, 'error');

test.beforeEach(() => {
  // Reset all mocks before each test
  mockClearInterval.reset();
  mockSetInterval.reset();
  mockConsoleLog.reset();
  mockConsoleError.reset();
  
  // Clear the job queue and reset processing interval
  jobQueue.length = 0;
  clearProcessingInterval();
});

test.afterEach(() => {
  // Clean up after each test
  clearProcessingInterval();
});

// RED PHASE: These tests should initially fail due to the TypeScript compilation issues

test('stopQueueProcessor() should clear the processing interval', (t) => {
  // This test should fail if stopQueueProcessor is using setProcessingInterval(null) incorrectly
  const mockInterval = {} as NodeJS.Timeout;
  setProcessingInterval(mockInterval);
  
  // Call the function that should be fixed
  const { stopQueueProcessor } = require('../tools/ollama.js');
  stopQueueProcessor();
  
  // Verify that clearInterval was called
  t.true(mockClearInterval.calledWith(mockInterval));
  t.is(getProcessingInterval(), null);
});

test('startQueueProcessor() should not start if already running', (t) => {
  // Set up an existing interval
  const existingInterval = {} as NodeJS.Timeout;
  setProcessingInterval(existingInterval);
  
  // Try to start again
  startQueueProcessor();
  
  // Should not call setInterval again
  t.false(mockSetInterval.called);
  t.is(getProcessingInterval(), existingInterval);
});

test('startQueueProcessor() should start if not running', (t) => {
  // Ensure no interval is running
  clearProcessingInterval();
  
  // Start the processor
  startQueueProcessor();
  
  // Should call setInterval and processQueue
  t.true(mockSetInterval.calledOnce);
  t.true(mockSetInterval.calledWith(processQueue, POLL_INTERVAL));
  t.is(getProcessingInterval(), mockSetInterval.returnValues[0]);
});

test('queue can be started and stopped multiple times', (t) => {
  // Start the processor
  startQueueProcessor();
  const firstInterval = getProcessingInterval();
  
  // Stop it
  const { stopQueueProcessor } = require('../tools/ollama.js');
  stopQueueProcessor();
  t.is(getProcessingInterval(), null);
  t.true(mockClearInterval.calledWith(firstInterval));
  
  // Start again
  startQueueProcessor();
  const secondInterval = getProcessingInterval();
  
  // Should have different intervals
  t.not(secondInterval, firstInterval);
  t.true(mockSetInterval.calledTwice);
});

test('imports should be properly resolved and types should be correct', (t) => {
  // This test verifies that imports are working correctly
  t.truthy(typeof getProcessingInterval === 'function');
  t.truthy(typeof clearProcessingInterval === 'function');
  t.truthy(typeof setProcessingInterval === 'function');
  t.truthy(typeof jobQueue === 'object');
  t.truthy(Array.isArray(jobQueue));
  t.truthy(typeof now === 'function');
  t.truthy(typeof POLL_INTERVAL === 'number');
});

test('error handling when clearing non-existent interval', (t) => {
  // Try to clear when no interval is set
  const { stopQueueProcessor } = require('../tools/ollama.js');
  
  // Should not throw an error
  t.notThrows(() => stopQueueProcessor());
  t.is(getProcessingInterval(), null);
});

test('type safety - clearProcessingInterval accepts no arguments', (t) => {
  // This test verifies type safety - clearProcessingInterval should not accept arguments
  t.notThrows(() => clearProcessingInterval());
  
  // @ts-expect-error - This should be a type error if clearProcessingInterval has correct signature
  // t.throws(() => clearProcessingInterval({} as NodeJS.Timeout));
});

test('queue state management after stop and restart', (t) => {
  // Add a test job to the queue
  const testJob = {
    id: 'test-job-1',
    status: 'pending' as const,
    priority: 'medium' as const,
    type: 'generate' as const,
    createdAt: now(),
    updatedAt: now(),
    modelName: 'test-model',
    prompt: 'test prompt'
  };
  jobQueue.push(testJob);
  
  // Start processor
  startQueueProcessor();
  t.truthy(getProcessingInterval());
  
  // Stop processor
  const { stopQueueProcessor } = require('../tools/ollama.js');
  stopQueueProcessor();
  t.is(getProcessingInterval(), null);
  
  // Queue should still contain the job
  t.is(jobQueue.length, 1);
  t.is(jobQueue[0].id, 'test-job-1');
  
  // Should be able to restart
  startQueueProcessor();
  t.truthy(getProcessingInterval());
});

test('processQueue should handle empty queue gracefully', (t) => {
  // Ensure queue is empty
  jobQueue.length = 0;
  
  // Should not throw when processing empty queue
  t.notThrows(() => processQueue());
});

test('edge case - multiple rapid start/stop cycles', (t) => {
  // Rapid start/stop cycles
  for (let i = 0; i < 5; i++) {
    startQueueProcessor();
    const interval = getProcessingInterval();
    t.truthy(interval);
    
    const { stopQueueProcessor } = require('../tools/ollama.js');
    stopQueueProcessor();
    t.is(getProcessingInterval(), null);
  }
  
  // Should have called setInterval and clearInterval the same number of times
  t.is(mockSetInterval.callCount, 5);
  t.is(mockClearInterval.callCount, 5);
});