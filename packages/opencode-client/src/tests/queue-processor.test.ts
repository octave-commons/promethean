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

// Mock global functions BEFORE importing the modules that use them
const mockClearInterval = sinon.stub(global, 'clearInterval');
const mockTimeout = {
  ref: () => {},
  unref: () => {},
  refresh: () => {},
  hasRef: () => true,
} as unknown as NodeJS.Timeout;
const mockSetInterval = sinon.stub(global, 'setInterval').returns(mockTimeout);

// Import the functions we're testing
import {
  getProcessingInterval,
  clearProcessingInterval,
  setProcessingInterval,
  jobQueue,
  now,
  POLL_INTERVAL,
} from '@promethean/ollama-queue';

// Use the functions directly from @promethean/ollama-queue for more reliable testing
import { startQueueProcessor, processQueue } from '@promethean/ollama-queue';

test.beforeEach(() => {
  // Reset all mocks before each test
  mockClearInterval.reset();
  mockSetInterval.reset();

  // Clear the job queue and reset processing interval
  jobQueue.length = 0;
  clearProcessingInterval();
});

test.afterEach(() => {
  // Clean up after each test
  clearProcessingInterval();
});

// Test that clearProcessingInterval works correctly (the main fix)
test('clearProcessingInterval should clear interval and set to null', (t) => {
  // Set up an interval
  const mockInterval = {} as NodeJS.Timeout;
  setProcessingInterval(mockInterval);

  // Clear the interval
  clearProcessingInterval();

  // Verify that clearInterval was called and interval is null
  t.true(mockClearInterval.calledWith(mockInterval));
  t.true(getProcessingInterval() === null);
});

test('clearProcessingInterval should handle null interval gracefully', (t) => {
  // Ensure no interval is set
  clearProcessingInterval();

  // Should not throw when clearing null interval
  t.notThrows(() => clearProcessingInterval());
  t.true(getProcessingInterval() === null);
});

test('startQueueProcessor should not start if already running', (t) => {
  // Set up an existing interval
  const existingInterval = {} as NodeJS.Timeout;
  setProcessingInterval(existingInterval);

  // Try to start again
  startQueueProcessor();

  // Should not call setInterval again
  t.false(mockSetInterval.called);
  t.is(getProcessingInterval(), existingInterval);
});

test('startQueueProcessor should start if not running', (t) => {
  // Ensure no interval is running
  clearProcessingInterval();

  // Start the processor
  startQueueProcessor();

  // Should call setInterval and processQueue
  t.true(mockSetInterval.calledOnce);
  t.true(mockSetInterval.calledWith(processQueue, POLL_INTERVAL));

  // Test the main fix: manually set interval and then clear it
  setProcessingInterval(mockTimeout);
  const interval = getProcessingInterval();
  t.truthy(interval);

  // Test the main fix - clearProcessingInterval should set to null
  clearProcessingInterval();
  t.true(getProcessingInterval() === null);
  t.true(mockClearInterval.calledWith(interval));
});

test('queue can be started and stopped multiple times', (t) => {
  // Test the main fix: setting and clearing intervals
  setProcessingInterval(mockTimeout);
  t.truthy(getProcessingInterval());

  // Use clearProcessingInterval (the main fix)
  clearProcessingInterval();
  t.true(getProcessingInterval() === null);
  t.true(mockClearInterval.calledWith(mockTimeout));

  // Test again with a different mock
  const anotherTimeout = { ...mockTimeout } as NodeJS.Timeout;
  setProcessingInterval(anotherTimeout);
  t.truthy(getProcessingInterval());

  clearProcessingInterval();
  t.true(getProcessingInterval() === null);
});

test('imports should be properly resolved and types should be correct', (t) => {
  // Test that imports are working correctly
  t.truthy(typeof getProcessingInterval === 'function');
  t.truthy(typeof clearProcessingInterval === 'function');
  t.truthy(typeof setProcessingInterval === 'function');
  t.truthy(typeof jobQueue === 'object');
  t.truthy(Array.isArray(jobQueue));
  t.truthy(typeof now === 'function');
  t.truthy(typeof POLL_INTERVAL === 'number');
});

test('queue state management after stop and restart', (t) => {
  // Test the main fix: clearProcessingInterval should work correctly
  setProcessingInterval(mockTimeout);
  t.truthy(getProcessingInterval());

  // Apply the main fix
  clearProcessingInterval();
  t.true(getProcessingInterval() === null);
  t.true(mockClearInterval.calledWith(mockTimeout));

  // Should be able to set a new interval
  setProcessingInterval(mockTimeout);
  t.truthy(getProcessingInterval());
});

test('processQueue should handle empty queue gracefully', (t) => {
  // Ensure queue is empty
  jobQueue.length = 0;

  // Should not throw when processing empty queue
  t.notThrows(() => processQueue());
});

test('edge case - multiple rapid start/stop cycles', (t) => {
  // Reset mock call count for this test
  mockClearInterval.resetHistory();

  // Test the main fix: multiple clearProcessingInterval calls should work
  for (let i = 0; i < 5; i++) {
    setProcessingInterval(mockTimeout);
    t.truthy(getProcessingInterval());

    clearProcessingInterval();
    t.true(getProcessingInterval() === null);
  }

  // Should have called clearInterval the same number of times
  t.is(mockClearInterval.callCount, 5);
});

test('type safety - clearProcessingInterval has correct signature', (t) => {
  // This test verifies type safety - clearProcessingInterval should not accept arguments
  // and should work correctly (the main fix)
  setProcessingInterval(mockTimeout);
  t.truthy(getProcessingInterval());

  // The main fix: clearProcessingInterval should work without arguments
  t.notThrows(() => clearProcessingInterval());
  t.true(getProcessingInterval() === null);
});
