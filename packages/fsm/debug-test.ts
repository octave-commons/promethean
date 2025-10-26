import {
  createMachine,
  createSnapshot,
  transition,
  type MachineDefinition,
  type MachineEvent,
} from './dist/index.js';

type WorkflowState = 'idle' | 'failed' | 'rollback' | 'processing';

type WorkflowEvents = {
  fail: { readonly error: string; readonly recoverable: boolean };
  rollback: { readonly reason: string };
  retry: { readonly attempt: number };
};

type WorkflowContext = Readonly<{
  readonly attempts: number;
  readonly metrics: { readonly recoverable?: boolean };
}>;

const testMachine = createMachine<WorkflowState, WorkflowEvents, WorkflowContext>({
  initialState: 'idle',
  initialContext: (): WorkflowContext => ({
    attempts: 2,
    metrics: { recoverable: true },
  }),
  transitions: [
    // Error handling from processing
    {
      from: 'processing',
      to: 'failed',
      event: 'fail',
      reducer: ({ context, event }): WorkflowContext => ({
        ...context,
        attempts: context.attempts + 1,
        metrics: {
          ...context.metrics,
          recoverable: event.payload.recoverable,
        },
      }),
    },

    // Rollback on failure
    {
      from: 'failed',
      to: 'rollback',
      event: 'rollback',
      guard: ({ context }) => context.metrics.recoverable === true,
      reducer: ({ context, event }): WorkflowContext => ({
        ...context,
        metrics: {
          ...context.metrics,
          rollbackReason: event.payload.reason,
        },
      }),
    },

    // Retry after rollback
    {
      from: 'rollback',
      to: 'processing',
      event: 'retry',
      guard: ({ context }) => context.attempts < 3,
      reducer: ({ context, event }): WorkflowContext => ({
        ...context,
        attempts: context.attempts + 1,
      }),
    },
  ],
});

// Test the scenario
const initial = createSnapshot(testMachine, {
  state: 'failed',
  context: {
    attempts: 2,
    metrics: { recoverable: true },
  },
});

console.log('Initial state:', initial.state);
console.log('Initial context:', initial.context);

const rollbackEvent: MachineEvent<WorkflowEvents, 'rollback'> = {
  type: 'rollback',
  payload: { reason: 'test rollback' },
};

const rollbackResult = transition(testMachine, initial, rollbackEvent);
console.log('Rollback result status:', rollbackResult.status);
console.log('Rollback result state:', rollbackResult.snapshot.state);

if (rollbackResult.status === 'transitioned') {
  const retryEvent: MachineEvent<WorkflowEvents, 'retry'> = {
    type: 'retry',
    payload: { attempt: 2 },
  };

  const retryResult = transition(testMachine, rollbackResult.snapshot, retryEvent);
  console.log('Retry result status:', retryResult.status);
  console.log('Retry result state:', retryResult.snapshot.state);
  console.log('Retry result context:', retryResult.snapshot.context);
}
