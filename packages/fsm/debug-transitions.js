// Quick debug to understand availableTransitions behavior
import { createWorkflowMachine } from './dist/tests/integration-fsm-architecture.test.js';
import {
  createMachine,
  defineTransition,
  availableTransitions,
  createSnapshot,
} from './dist/index.js';

const machine = createWorkflowMachine();

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

const transitions = availableTransitions(machine, failedSnapshot);
console.log('Available transitions from failed state:');
console.log(transitions.map((t) => ({ event: t.event, from: t.from, to: t.to })));
