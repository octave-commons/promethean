/**
 * Graph-Based FSM API
 *
 * A feature-rich FSM implementation using graph structures for complex scenarios.
 * This provides visualization, analysis, and advanced features.
 */

// Note: For now, we'll re-export from the simple machine
// The full graph-based implementation will be added later
export { SimpleMachine, createSimpleMachine } from '../simple/index.js';

export type {
  SimpleStateConfig,
  SimpleTransitionConfig,
  SimpleMachineDefinition,
  StateMap,
} from '../simple/index.js';

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
  StateDefinition,
  TransitionDefinition,
} from '../core/types.js';

// Placeholder types for future graph-based implementation
export interface FSMConfig<
  Context = unknown,
  _Event = unknown,
  _StateMetadata = unknown,
  _TransitionMetadata = unknown,
> {
  readonly initialState: string;
  readonly finalStates?: string[];
  readonly context?: Context;
}

export interface FSMState<_Context = unknown, _Metadata = unknown> {
  readonly id: string;
  readonly metadata?: _Metadata;
}

export interface FSMTransition<Context = unknown, Event = unknown, Metadata = unknown> {
  readonly from: string;
  readonly to: string;
  readonly event?: string;
  readonly guard?: (context: Context, event?: Event) => boolean;
  readonly reducer?: (context: Context, event: Event) => Context;
  readonly metadata?: Metadata;
}

export interface FSMTransitionResult<State extends string, Context, Event> {
  readonly from: State;
  readonly to: State;
  readonly context: Context;
  readonly event: Event;
  readonly success: boolean;
  readonly reason?: string;
}

export interface FSMValidationResult {
  readonly valid: boolean;
  readonly errors: Array<string>;
  readonly warnings: Array<string>;
}

// Placeholder for FSMGraph - will be implemented properly later
export class FSMGraph<
  Context = unknown,
  Event = unknown,
  StateMetadata = unknown,
  TransitionMetadata = unknown,
> {
  constructor(_config: FSMConfig<Context, Event, StateMetadata, TransitionMetadata>) {
    // Placeholder implementation
  }
}
