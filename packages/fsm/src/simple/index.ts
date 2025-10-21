/**
 * Simple FSM API
 *
 * A lightweight, functional FSM implementation for basic use cases.
 * This is the recommended starting point for most FSM needs.
 */

export {
  SimpleMachine,
  createSimpleMachine,
} from './simple-machine.js';

export type {
  SimpleStateConfig,
  SimpleTransitionConfig,
  SimpleMachineDefinition,
  StateMap,
} from './simple-machine.js';

// Re-export core types for convenience
export type {
  State,
  Event,
  StateMachine,
  FSMSnapshot,
  TransitionResult,
  FSMError,
  ValidationResult,
  MachineAnalysis,
  Guard,
  Action,
} from '../core/types.js';