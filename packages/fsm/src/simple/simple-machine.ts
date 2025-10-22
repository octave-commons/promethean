/**
 * Simple FSM Implementation
 *
 * A functional, lightweight FSM implementation for basic use cases.
 * This is designed to be easy to understand and use while providing
 * the essential FSM functionality.
 *
 * This module re-exports the functional core and legacy wrapper for
 * backward compatibility.
 */

// Export functional core API
export type {
  SimpleStateConfig,
  SimpleTransitionConfig,
  StateMap,
  SimpleMachineDefinition,
  SimpleMachineState,
} from './functional-core.js';

export {
  createSimpleMachineState,
  getCurrentSimpleState,
  getCurrentSimpleContext,
  canSimpleTransition,
  simpleTransition,
  resetSimpleMachine,
  getSimpleAvailableTransitions,
} from './functional-core.js';

// Export legacy wrapper (deprecated)
export { SimpleMachine, createSimpleMachine } from './legacy-wrapper.js';
