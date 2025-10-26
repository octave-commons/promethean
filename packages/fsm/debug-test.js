// Debug script to understand the failing test
const {
  createMachine,
  defineTransition,
  transition,
  createSnapshot,
} = require('./dist/machine.js');

// Workflow states and events (simplified)
const WorkflowState = {
  IDLE: 'idle',
  FAILED: 'failed',
  ROLLBACK: 'rollback',
  PROCESSING: 'processing',
};

// Create a simple test machine
const testMachine = createMachine({
  initialState: 'idle',
  transitions: [
    // failed -> rollback (only if recoverable)
    defineTransition({
      from: 'failed',
      to: 'rollback',
      event: 'rollback',
      guard: ({ context }) => context.metrics.recoverable === true,
      reducer: ({ context, event }) => ({
        ...context,
        metrics: {
          ...context.metrics,
          rollbackReason: event.payload.reason,
          rollbackTimestamp: Date.now(),
        },
      }),
    }),
    // rollback -> processing (if attempts < 3)
    defineTransition({
      from: 'rollback',
      to: 'processing',
      event: 'retry',
      guard: ({ context }) => context.attempts < 3,
      reducer: ({ context, event }) => ({
        ...context,
        attempts: context.attempts + 1,
        metrics: {
          ...context.metrics,
          retryAttempt: event.payload.attempt,
          retryTimestamp: Date.now(),
        },
      }),
    }),
    // rollback -> idle (if attempts >= 3)
    defineTransition({
      from: 'rollback',
      to: 'idle',
      event: 'retry',
      guard: ({ context }) => context.attempts >= 3,
      reducer: ({ context }) => ({
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

// Test scenario
let snapshot = createSnapshot(testMachine, {
  state: 'failed',
  context: {
    attempts: 2,
    metrics: { recoverable: true },
  },
});

console.log('Initial state:', snapshot.state);
console.log('Initial attempts:', snapshot.context.attempts);

// Rollback
const rollbackResult = transition(testMachine, snapshot, {
  type: 'rollback',
  payload: { reason: 'test' },
});
console.log('Rollback status:', rollbackResult.status);
if (rollbackResult.status === 'transitioned') {
  snapshot = rollbackResult.snapshot;
  console.log('After rollback state:', snapshot.state);
  console.log('After rollback attempts:', snapshot.context.attempts);

  // Retry
  const retryResult = transition(testMachine, snapshot, { type: 'retry', payload: { attempt: 2 } });
  console.log('Retry status:', retryResult.status);
  if (retryResult.status === 'transitioned') {
    snapshot = retryResult.snapshot;
    console.log('After retry state:', snapshot.state);
    console.log('After retry attempts:', snapshot.context.attempts);
  }
}
