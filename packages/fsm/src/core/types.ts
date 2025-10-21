/**
 * Core FSM Types
 *
 * These are the foundational types that all FSM implementations in this package
 * should build upon. They provide the common language and structure for state machines.
 */

// Basic state representation
export type State = string;

// Basic event representation
export type Event = string | { type: string; payload?: unknown };

// Transition result status
export type TransitionStatus =
  | 'no-transition'
  | 'transitioned'
  | 'invalid-transition'
  | 'guard-failed';

// Core transition representation
export interface CoreTransition<S extends State = State, C = unknown, E = Event> {
  readonly from: S;
  readonly to: S;
  readonly event: E;
  readonly status: TransitionStatus;
  readonly context: C;
  readonly timestamp: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// FSM snapshot - represents a point in time
export interface FSMSnapshot<S extends State = State, C = unknown> {
  readonly state: S;
  readonly context: C;
  readonly timestamp: number;
  readonly history?: readonly CoreTransition<S, C>[];
}

// Transition guard - condition that must be met for transition to occur
export type Guard<C = unknown, E = Event> = (context: C, event: E) => boolean | Promise<boolean>;

// Transition action - side effect that occurs during transition
export type Action<C = unknown, E = Event> = (context: C, event: E) => C | void | Promise<C | void>;

// State lifecycle actions
export interface StateActions<C = unknown> {
  readonly entry?: Action<C>;
  readonly exit?: Action<C>;
}

// Error handling
export interface FSMError {
  readonly type: 'guard-failed' | 'action-failed' | 'invalid-state' | 'invalid-event';
  readonly message: string;
  readonly from?: State;
  readonly to?: State;
  readonly event?: Event;
  readonly cause?: Error;
}

// Machine configuration interface
export interface MachineConfig<S extends State = State, C = unknown, E = Event> {
  readonly initialState: S;
  readonly finalStates?: readonly S[];
  readonly context?: C;
  readonly onTransition?: (transition: CoreTransition<S, C, E>) => void;
  readonly onError?: (error: FSMError) => void;
}

// Transition definition
export interface TransitionDefinition<S extends State = State, C = unknown, E = Event> {
  readonly from: S;
  readonly to: S;
  readonly event: E;
  readonly guard?: Guard<C, E>;
  readonly action?: Action<C, E>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// State definition
export interface StateDefinition<S extends State = State, C = unknown> {
  readonly id: S;
  readonly isInitial?: boolean;
  readonly isFinal?: boolean;
  readonly actions?: StateActions<C>;
  readonly timeout?: number; // in milliseconds
  readonly onTimeout?: S; // transition to this state on timeout
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// Machine definition
export interface MachineDefinition<S extends State = State, C = unknown, E = Event>
  extends MachineConfig<S, C, E> {
  readonly states: ReadonlyMap<S, StateDefinition<S, C>>;
  readonly transitions: ReadonlyArray<TransitionDefinition<S, C, E>>;
}

// Validation result
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

// Machine analysis result
export interface MachineAnalysis<S extends State = State, _C = unknown> {
  readonly reachableStates: readonly S[];
  readonly unreachableStates: readonly S[];
  readonly hasCycles: boolean;
  readonly isDeterministic: boolean;
  readonly stateTransitions: ReadonlyMap<S, readonly S[]>;
}

// Event handling result
export interface EventResult<S extends State = State, C = unknown, E = Event> {
  readonly success: boolean;
  readonly snapshot: FSMSnapshot<S, C>;
  readonly transition?: CoreTransition<S, C, E>;
  readonly error?: FSMError;
}

// Utility types for common patterns
export type StateMachine<S extends State = State, C = unknown, E = Event> = {
  readonly currentState: S;
  readonly currentContext: C;
  readonly definition: MachineDefinition<S, C, E>;

  transition(event: E, targetState?: S): EventResult<S, C, E>;
  canTransition(event: E, targetState?: S): boolean;
  reset(context?: C): FSMSnapshot<S, C>;
  getAvailableTransitions(): readonly TransitionDefinition<S, C, E>[];
  getReachableStates(): readonly S[];
  validate(): ValidationResult;
  analyze(): MachineAnalysis<S, C>;
};

// Builder pattern types
export interface MachineBuilder<S extends State = State, C = unknown, E = Event> {
  state(id: S, config?: Partial<StateDefinition<S, C>>): MachineBuilder<S, C, E>;
  transition(transition: TransitionDefinition<S, C, E>): MachineBuilder<S, C, E>;
  initialState(state: S): MachineBuilder<S, C, E>;
  finalState(state: S): MachineBuilder<S, C, E>;
  context(context: C): MachineBuilder<S, C, E>;
  onTransition(handler: (transition: CoreTransition<S, C, E>) => void): MachineBuilder<S, C, E>;
  onError(handler: (error: FSMError) => void): MachineBuilder<S, C, E>;
  build(): StateMachine<S, C, E>;
}

// Serialization types
export interface SerializedMachine<S extends State = State, C = unknown> {
  readonly version: string;
  readonly definition: MachineDefinition<S, C>;
  readonly snapshot: FSMSnapshot<S, C>;
}

export interface SerializedTransition<S extends State = State, C = unknown, E = Event> {
  readonly from: S;
  readonly to: S;
  readonly event: E;
  readonly context: C;
  readonly timestamp: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

// Comparison utilities
export type StateComparator<S extends State = State> = (a: S, b: S) => boolean;
export type EventComparator<E extends Event = Event> = (a: E, b: E) => boolean;

// Debugging and inspection
export interface Inspector<S extends State = State, C = unknown, E = Event> {
  getCurrentState(): S;
  getCurrentContext(): C;
  getHistory(): readonly CoreTransition<S, C, E>[];
  getDefinition(): MachineDefinition<S, C, E>;
  getTransitionsFrom(state: S): readonly TransitionDefinition<S, C, E>[];
  getTransitionsTo(state: S): readonly TransitionDefinition<S, C, E>[];
}

// Performance monitoring
export interface PerformanceMetrics<_C = unknown> {
  readonly transitionCount: number;
  readonly averageTransitionTime: number;
  readonly totalTransitionTime: number;
  readonly stateEntryCount: ReadonlyMap<State, number>;
  readonly transitionFrequency: ReadonlyMap<string, number>;
}

// Legacy compatibility types
export interface MachineSnapshot<S extends State = State, C = unknown> extends FSMSnapshot<S, C> {}

export interface MachineEvent<T = Record<string, unknown>, K extends keyof T = keyof T> {
  readonly type: K;
  readonly payload: T[K];
}

export interface InitialContext<C = unknown> {
  (): C;
}

// Transition result - unified result type for all FSM operations
export interface TransitionResult<S extends State = State, C = unknown, E = Event> {
  readonly status: TransitionStatus;
  readonly snapshot: FSMSnapshot<S, C>;
  readonly transition?: CoreTransition<S, C, E>;
  readonly error?: FSMError;
  readonly details?: {
    readonly from: S;
    readonly to: S;
    readonly context: C;
    readonly event: E;
  };
}
