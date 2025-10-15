import test from 'ava';

import {
  availableTransitions,
  canTransition,
  createMachine,
  createSnapshot,
  defineTransition,
  transition,
  transitionMany,
  type MachineDefinition,
  type MachineEvent,
  type TransitionResult,
} from '../index.js';

// Integration tests for FSM Architecture
// Focus: Layered API, Backward Compatibility, Performance, Error Handling

// Complex workflow state types
type WorkflowState =
  | 'idle'
  | 'initializing'
  | 'processing'
  | 'validating'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'rollback';

type WorkflowEvents = {
  start: { readonly workflowId: string; readonly config: Record<string, any> };
  initialize: { readonly resources: string[] };
  process: { readonly data: any[]; readonly batchSize: number };
  validate: { readonly rules: string[] };
  finalize: { readonly output: string };
  complete: { readonly summary: Record<string, any> };
  fail: { readonly error: string; readonly recoverable: boolean };
  rollback: { readonly reason: string };
  retry: { readonly attempt: number };
};

type WorkflowContext = Readonly<{
  readonly workflowId: string;
  readonly config: Record<string, any>;
  readonly resources: string[];
  readonly data: any[];
  readonly processed: any[];
  readonly errors: string[];
  readonly attempts: number;
  readonly startTime: number;
  readonly metrics: Record<string, any>;
}>;

// Create comprehensive workflow machine
const createWorkflowMachine = (): MachineDefinition<
  WorkflowState,
  WorkflowEvents,
  WorkflowContext
> =>
  createMachine<WorkflowState, WorkflowEvents, WorkflowContext>({
    initialState: 'idle',
    initialContext: (): WorkflowContext => ({
      workflowId: '',
      config: {},
      resources: [],
      data: [],
      processed: [],
      errors: [],
      attempts: 0,
      startTime: Date.now(),
      metrics: {},
    }),
    transitions: [
      // Start workflow
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'idle',
        to: 'initializing',
        event: 'start',
        guard: ({ event }) => !!event.payload.workflowId && !!event.payload.config,
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          workflowId: event.payload.workflowId,
          config: event.payload.config,
          startTime: Date.now(),
          metrics: { ...context.metrics, startTimestamp: Date.now() },
        }),
      }),

      // Initialize resources
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'initializing',
        to: 'processing',
        event: 'initialize',
        guard: ({ event }) => event.payload.resources.length > 0,
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          resources: event.payload.resources,
          metrics: { ...context.metrics, resourceCount: event.payload.resources.length },
        }),
      }),

      // Process data
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'processing',
        to: 'validating',
        event: 'process',
        guard: ({ event, context }) =>
          event.payload.data.length > 0 &&
          event.payload.batchSize > 0 &&
          context.resources.length > 0,
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          data: event.payload.data,
          processed: event.payload.data.slice(0, event.payload.batchSize),
          metrics: {
            ...context.metrics,
            dataCount: event.payload.data.length,
            batchSize: event.payload.batchSize,
            processedCount: Math.min(event.payload.batchSize, event.payload.data.length),
          },
        }),
      }),

      // Validate results
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'validating',
        to: 'finalizing',
        event: 'validate',
        guard: ({ event, context }) =>
          event.payload.rules.length > 0 && context.processed.length > 0,
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          metrics: {
            ...context.metrics,
            validationRules: event.payload.rules.length,
            validationTimestamp: Date.now(),
          },
        }),
      }),

      // Finalize workflow
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'finalizing',
        to: 'completed',
        event: 'finalize',
        guard: ({ event }) => !!event.payload.output,
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          metrics: {
            ...context.metrics,
            output: event.payload.output,
            completionTimestamp: Date.now(),
            totalDuration: Date.now() - context.startTime,
          },
        }),
      }),

      // Complete workflow
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'completed',
        to: 'idle',
        event: 'complete',
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          metrics: { ...context.metrics, ...event.payload.summary },
        }),
      }),

      // Error handling from processing
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'processing',
        to: 'failed',
        event: 'fail',
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          errors: [...context.errors, event.payload.error],
          attempts: context.attempts + 1,
          metrics: {
            ...context.metrics,
            lastError: event.payload.error,
            errorTimestamp: Date.now(),
            recoverable: event.payload.recoverable,
          },
        }),
      }),

      // Error handling from validating
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'validating',
        to: 'failed',
        event: 'fail',
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          errors: [...context.errors, event.payload.error],
          attempts: context.attempts + 1,
          metrics: {
            ...context.metrics,
            lastError: event.payload.error,
            errorTimestamp: Date.now(),
            recoverable: event.payload.recoverable,
          },
        }),
      }),

      // Error handling from finalizing
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'finalizing',
        to: 'failed',
        event: 'fail',
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          errors: [...context.errors, event.payload.error],
          attempts: context.attempts + 1,
          metrics: {
            ...context.metrics,
            lastError: event.payload.error,
            errorTimestamp: Date.now(),
            recoverable: event.payload.recoverable,
          },
        }),
      }),

      // Rollback on failure
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'failed',
        to: 'rollback',
        event: 'rollback',
        guard: ({ context }) => context.metrics.recoverable === true,
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          metrics: {
            ...context.metrics,
            rollbackReason: event.payload.reason,
            rollbackTimestamp: Date.now(),
          },
        }),
      }),

      // Retry after rollback
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'rollback',
        to: 'processing',
        event: 'retry',
        guard: ({ context }) => context.attempts < 3,
        reducer: ({ context, event }): WorkflowContext => ({
          ...context,
          attempts: context.attempts + 1,
          metrics: {
            ...context.metrics,
            retryAttempt: event.payload.attempt,
            retryTimestamp: Date.now(),
          },
        }),
      }),

      // Return to idle from failed after max retries
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'failed',
        to: 'idle',
        event: 'retry',
        guard: ({ context }) => context.attempts >= 3,
        reducer: ({ context }): WorkflowContext => ({
          ...context,
          metrics: {
            ...context.metrics,
            maxRetriesReached: true,
            finalTimestamp: Date.now(),
          },
        }),
      }),

      // Return to idle from rollback after max retries
      defineTransition<WorkflowState, WorkflowEvents, WorkflowContext>({
        from: 'rollback',
        to: 'idle',
        event: 'retry',
        guard: ({ context }) => context.attempts >= 3,
        reducer: ({ context }): WorkflowContext => ({
          ...context,
          metrics: {
            ...context.metrics,
            maxRetriesReached: true,
            finalTimestamp: Date.now(),
          },
        }),
      }),
    ],
  });

test('FSM Integration - Complete Workflow Execution', (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);

  // Start workflow
  const startEvent: MachineEvent<WorkflowEvents, 'start'> = {
    type: 'start',
    payload: { workflowId: 'test-123', config: { timeout: 5000 } },
  };

  const startResult = transition(machine, initial, startEvent);
  t.is(startResult.status, 'transitioned');

  let currentSnapshot = (
    startResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'initializing');
  t.is(currentSnapshot.context.workflowId, 'test-123');
  t.deepEqual(currentSnapshot.context.config, { timeout: 5000 });

  // Initialize resources
  const initEvent: MachineEvent<WorkflowEvents, 'initialize'> = {
    type: 'initialize',
    payload: { resources: ['db', 'cache', 'queue'] },
  };

  const initResult = transition(machine, currentSnapshot, initEvent);
  t.is(initResult.status, 'transitioned');
  currentSnapshot = (
    initResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'processing');
  t.deepEqual(currentSnapshot.context.resources, ['db', 'cache', 'queue']);

  // Process data
  const processEvent: MachineEvent<WorkflowEvents, 'process'> = {
    type: 'process',
    payload: { data: [1, 2, 3, 4, 5], batchSize: 3 },
  };

  const processResult = transition(machine, currentSnapshot, processEvent);
  t.is(processResult.status, 'transitioned');
  currentSnapshot = (
    processResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'validating');
  t.deepEqual(currentSnapshot.context.data, [1, 2, 3, 4, 5]);
  t.deepEqual(currentSnapshot.context.processed, [1, 2, 3]);

  // Validate results
  const validateEvent: MachineEvent<WorkflowEvents, 'validate'> = {
    type: 'validate',
    payload: { rules: ['rule1', 'rule2'] },
  };

  const validateResult = transition(machine, currentSnapshot, validateEvent);
  t.is(validateResult.status, 'transitioned');
  currentSnapshot = (
    validateResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'finalizing');

  // Finalize workflow
  const finalizeEvent: MachineEvent<WorkflowEvents, 'finalize'> = {
    type: 'finalize',
    payload: { output: 'success' },
  };

  const finalizeResult = transition(machine, currentSnapshot, finalizeEvent);
  t.is(finalizeResult.status, 'transitioned');
  currentSnapshot = (
    finalizeResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'completed');

  // Complete workflow
  const completeEvent: MachineEvent<WorkflowEvents, 'complete'> = {
    type: 'complete',
    payload: { summary: { totalProcessed: 5, success: true } },
  };

  const completeResult = transition(machine, currentSnapshot, completeEvent);
  t.is(completeResult.status, 'transitioned');
  currentSnapshot = (
    completeResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'idle');
  t.deepEqual(currentSnapshot.context.metrics.totalProcessed, 5);
  t.true(currentSnapshot.context.metrics.success);
});

test('FSM Integration - Error Handling and Recovery', (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);

  // Start workflow
  const startEvent: MachineEvent<WorkflowEvents, 'start'> = {
    type: 'start',
    payload: { workflowId: 'error-test', config: {} },
  };

  const startResult = transition(machine, initial, startEvent);
  let currentSnapshot = (
    startResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  // Initialize resources
  const initEvent: MachineEvent<WorkflowEvents, 'initialize'> = {
    type: 'initialize',
    payload: { resources: ['db'] },
  };

  const initResult = transition(machine, currentSnapshot, initEvent);
  currentSnapshot = (
    initResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  // Process data
  const processEvent: MachineEvent<WorkflowEvents, 'process'> = {
    type: 'process',
    payload: { data: [1, 2], batchSize: 2 },
  };

  const processResult = transition(machine, currentSnapshot, processEvent);
  currentSnapshot = (
    processResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  // Simulate failure
  const failEvent: MachineEvent<WorkflowEvents, 'fail'> = {
    type: 'fail',
    payload: { error: 'Database connection lost', recoverable: true },
  };

  const failResult = transition(machine, currentSnapshot, failEvent);
  t.is(failResult.status, 'transitioned');
  currentSnapshot = (
    failResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'failed');
  t.deepEqual(currentSnapshot.context.errors, ['Database connection lost']);
  t.is(currentSnapshot.context.attempts, 1);
  t.true(currentSnapshot.context.metrics.recoverable);

  // Rollback
  const rollbackEvent: MachineEvent<WorkflowEvents, 'rollback'> = {
    type: 'rollback',
    payload: { reason: 'Database connection lost' },
  };

  const rollbackResult = transition(machine, currentSnapshot, rollbackEvent);
  t.is(rollbackResult.status, 'transitioned');
  currentSnapshot = (
    rollbackResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'rollback');

  // Retry (attempt 1)
  const retryEvent1: MachineEvent<WorkflowEvents, 'retry'> = {
    type: 'retry',
    payload: { attempt: 1 },
  };

  const retryResult1 = transition(machine, currentSnapshot, retryEvent1);
  t.is(retryResult1.status, 'transitioned');
  currentSnapshot = (
    retryResult1 as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'processing');
  t.is(currentSnapshot.context.attempts, 2);

  // Simulate another failure
  const failEvent2: MachineEvent<WorkflowEvents, 'fail'> = {
    type: 'fail',
    payload: { error: 'Timeout occurred', recoverable: true },
  };

  const failResult2 = transition(machine, currentSnapshot, failEvent2);
  currentSnapshot = (
    failResult2 as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  // Rollback again
  const rollbackResult2 = transition(machine, currentSnapshot, rollbackEvent);
  currentSnapshot = (
    rollbackResult2 as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  // Retry (attempt 2)
  const retryEvent2: MachineEvent<WorkflowEvents, 'retry'> = {
    type: 'retry',
    payload: { attempt: 2 },
  };

  const retryResult2 = transition(machine, currentSnapshot, retryEvent2);
  currentSnapshot = (
    retryResult2 as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'processing');
  t.is(currentSnapshot.context.attempts, 3);

  // Simulate final failure
  const failEvent3: MachineEvent<WorkflowEvents, 'fail'> = {
    type: 'fail',
    payload: { error: 'Max retries exceeded', recoverable: false },
  };

  const failResult3 = transition(machine, currentSnapshot, failEvent3);
  currentSnapshot = (
    failResult3 as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  // Try retry (should transition to idle since attempts >= 3)
  const retryEvent3: MachineEvent<WorkflowEvents, 'retry'> = {
    type: 'retry',
    payload: { attempt: 3 },
  };

  const retryResult3 = transition(machine, currentSnapshot, retryEvent3);
  t.is(retryResult3.status, 'transitioned');
  currentSnapshot = (
    retryResult3 as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(currentSnapshot.state, 'idle');
  t.true(currentSnapshot.context.metrics.maxRetriesReached);
  t.is(currentSnapshot.context.attempts, 4); // Should be incremented
});

test('FSM Integration - Performance with Large Workflows', (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);

  const startTime = performance.now();

  // Create large workflow
  const largeData = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `item-${i}` }));

  const events: ReadonlyArray<MachineEvent<WorkflowEvents>> = [
    {
      type: 'start',
      payload: { workflowId: 'large-workflow', config: { batchSize: 1000 } },
    },
    {
      type: 'initialize',
      payload: { resources: Array.from({ length: 50 }, (_, i) => `resource-${i}`) },
    },
    {
      type: 'process',
      payload: { data: largeData, batchSize: 1000 },
    },
    {
      type: 'validate',
      payload: { rules: Array.from({ length: 20 }, (_, i) => `rule-${i}`) },
    },
    {
      type: 'finalize',
      payload: { output: 'large-workflow-complete' },
    },
  ];

  const sequence = transitionMany(machine, initial, events);
  const endTime = performance.now();

  t.is(sequence.status, 'complete');
  t.is(sequence.results.length, 5);
  t.is(sequence.snapshot.state, 'completed');
  t.is(sequence.snapshot.context.data.length, 10000);
  t.is(sequence.snapshot.context.processed.length, 1000);
  t.is(sequence.snapshot.context.resources.length, 50);

  // Performance should be reasonable (< 100ms for this operation)
  const duration = endTime - startTime;
  t.true(duration < 100, `Workflow processing took ${duration}ms, expected < 100ms`);
});

test('FSM Integration - Backward Compatibility', (t) => {
  // Test that the FSM maintains backward compatibility with existing patterns
  const machine = createWorkflowMachine();

  // Test old-style snapshot creation
  const oldStyleSnapshot = createSnapshot(machine, {
    state: 'processing' as WorkflowState,
    context: {
      workflowId: 'legacy-test',
      config: { legacy: true },
      resources: ['legacy-resource'],
      data: [1, 2, 3],
      processed: [1],
      errors: [],
      attempts: 0,
      startTime: Date.now() - 1000,
      metrics: { legacyMode: true },
    },
  });

  t.is(oldStyleSnapshot.state, 'processing');
  t.is(oldStyleSnapshot.context.workflowId, 'legacy-test');
  t.true(oldStyleSnapshot.context.metrics.legacyMode);

  // Test that transitions still work with legacy snapshots
  const validateEvent: MachineEvent<WorkflowEvents, 'validate'> = {
    type: 'validate',
    payload: { rules: ['legacy-rule'] },
  };

  const result = transition(machine, oldStyleSnapshot, validateEvent);
  t.is(result.status, 'transitioned');

  const newSnapshot = (
    result as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  t.is(newSnapshot.state, 'finalizing');
  t.true(newSnapshot.context.metrics.legacyMode); // Should preserve legacy data
});

test('FSM Integration - Complex Guard Logic', (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);

  // Test guard rejection for invalid start
  const invalidStartEvent: MachineEvent<WorkflowEvents, 'start'> = {
    type: 'start',
    payload: { workflowId: '', config: {} }, // Empty workflowId should fail guard
  };

  const invalidStartResult = transition(machine, initial, invalidStartEvent);
  t.is(invalidStartResult.status, 'guard-rejected');

  // Test guard rejection for empty resources
  const startEvent: MachineEvent<WorkflowEvents, 'start'> = {
    type: 'start',
    payload: { workflowId: 'guard-test', config: {} },
  };

  const startResult = transition(machine, initial, startEvent);
  let currentSnapshot = (
    startResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  const emptyResourcesEvent: MachineEvent<WorkflowEvents, 'initialize'> = {
    type: 'initialize',
    payload: { resources: [] }, // Empty resources should fail guard
  };

  const emptyResourcesResult = transition(machine, currentSnapshot, emptyResourcesEvent);
  t.is(emptyResourcesResult.status, 'guard-rejected');

  // Test guard rejection for invalid data
  const validResourcesEvent: MachineEvent<WorkflowEvents, 'initialize'> = {
    type: 'initialize',
    payload: { resources: ['test'] },
  };

  const validResourcesResult = transition(machine, currentSnapshot, validResourcesEvent);
  currentSnapshot = (
    validResourcesResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  const invalidDataEvent: MachineEvent<WorkflowEvents, 'process'> = {
    type: 'process',
    payload: { data: [], batchSize: 0 }, // Empty data and batch size should fail guard
  };

  const invalidDataResult = transition(machine, currentSnapshot, invalidDataEvent);
  t.is(invalidDataResult.status, 'guard-rejected');
});

test('FSM Integration - Available Transitions and State Queries', (t) => {
  const machine = createWorkflowMachine();

  // Test available transitions from each state
  const idleSnapshot = createSnapshot(machine, { state: 'idle' });
  const idleTransitions = availableTransitions(machine, idleSnapshot);
  t.deepEqual(
    idleTransitions.map((t) => t.event),
    ['start'],
  );

  const processingSnapshot = createSnapshot(machine, {
    state: 'processing',
    context: {
      workflowId: 'test',
      config: {},
      resources: ['test'],
      data: [1, 2, 3],
      processed: [1],
      errors: [],
      attempts: 0,
      startTime: Date.now(),
      metrics: {},
    },
  });
  const processingTransitions = availableTransitions(machine, processingSnapshot);
  t.deepEqual(
    processingTransitions.map((t) => t.event),
    ['validate', 'fail'],
  );

  const failedSnapshot = createSnapshot(machine, {
    state: 'failed',
    context: {
      workflowId: 'test',
      config: {},
      resources: [],
      data: [],
      processed: [],
      errors: ['test error'],
      attempts: 1,
      startTime: Date.now(),
      metrics: { recoverable: true },
    },
  });
  const failedTransitions = availableTransitions(machine, failedSnapshot);
  t.deepEqual(
    failedTransitions.map((t) => t.event),
    ['rollback'],
  );

  // Test canTransition functionality
  t.true(
    canTransition(machine, idleSnapshot, {
      type: 'start',
      payload: { workflowId: 'test', config: {} },
    }),
  );
  t.false(
    canTransition(machine, idleSnapshot, { type: 'process', payload: { data: [], batchSize: 1 } }),
  );

  t.true(
    canTransition(machine, processingSnapshot, { type: 'validate', payload: { rules: ['test'] } }),
  );
  t.false(
    canTransition(machine, processingSnapshot, {
      type: 'start',
      payload: { workflowId: 'test', config: {} },
    }),
  );
});

test('FSM Integration - Error Handling Edge Cases', (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);

  // Test transition with malformed payload
  const malformedStartEvent: MachineEvent<WorkflowEvents, 'start'> = {
    type: 'start',
    payload: { workflowId: '', config: {} }, // Empty workflowId should fail guard
  };

  const malformedResult = transition(machine, initial, malformedStartEvent);
  t.is(malformedResult.status, 'guard-rejected');

  // Test transitionMany with empty events array
  const emptySequence = transitionMany(machine, initial, []);
  t.is(emptySequence.status, 'no-events');
  t.deepEqual(emptySequence.snapshot, initial);

  // Test transitionMany with mixed valid/invalid events
  const mixedEvents: MachineEvent<WorkflowEvents>[] = [
    { type: 'start', payload: { workflowId: 'mixed-test', config: {} } },
    { type: 'initialize', payload: { resources: [] } }, // Will fail guard
    { type: 'process', payload: { data: [], batchSize: 1 } }, // Won't be reached
  ];

  const mixedSequence = transitionMany(machine, initial, mixedEvents);
  t.is(mixedSequence.status, 'halted');
  t.is(mixedSequence.results.length, 2); // Should stop after second event
});

test('FSM Integration - Context Immutability', (t) => {
  const machine = createWorkflowMachine();
  const initial = createSnapshot(machine);

  // Start workflow
  const startEvent: MachineEvent<WorkflowEvents, 'start'> = {
    type: 'start',
    payload: { workflowId: 'immutability-test', config: {} },
  };

  const startResult = transition(machine, initial, startEvent);
  const newSnapshot = (
    startResult as Extract<
      TransitionResult<WorkflowState, WorkflowEvents, WorkflowContext>,
      { readonly status: 'transitioned' }
    >
  ).snapshot;

  // Original snapshot should be unchanged
  t.is(initial.state, 'idle');
  t.is(initial.context.workflowId, '');

  // New snapshot should have updated context
  t.is(newSnapshot.state, 'initializing');
  t.is(newSnapshot.context.workflowId, 'immutability-test');

  // Context should be immutable
  t.throws(
    () => {
      (newSnapshot.context as any).workflowId = 'modified';
    },
    { message: /Cannot assign/ },
  );

  // Test that snapshots are independent
  const snapshot1 = createSnapshot(machine);
  const snapshot2 = createSnapshot(machine);

  t.not(snapshot1, snapshot2);
  t.deepEqual(snapshot1, snapshot2);
});
