/**
 * Functional Core Implementation for Simple FSM
 *
 * This file contains the pure functional implementation of the Simple FSM.
 * All state management is immutable and functions are pure.
 */

import type {
  State,
  Event,
  MachineDefinition,
  TransitionDefinition,
  StateDefinition,
  EventResult,
  FSMSnapshot,
  CoreTransition,
  FSMError,
  Guard,
  Action,
} from '../core/types.js';

// Simple state configuration
export interface SimpleStateConfig<C = unknown> {
  readonly entry?: Action<C>;
  readonly exit?: Action<C>;
  readonly timeout?: number;
  readonly onTimeout?: State;
}

// Simple transition configuration
export interface SimpleTransitionConfig<C = unknown> {
  readonly guard?: Guard<C>;
  readonly action?: Action<C>;
}

// Simple state map type
export type StateMap<S extends State = State, C = unknown> = {
  readonly [K in S]: {
    readonly on?: Partial<Record<string, S | readonly S[]>>;
    readonly config?: SimpleStateConfig<C>;
  };
};

// Simple machine definition
export interface SimpleMachineDefinition<S extends State = State, C = unknown> {
  readonly initialState: S;
  readonly finalStates?: readonly S[];
  readonly context?: C;
  readonly states: StateMap<S, C>;
  readonly onTransition?: (transition: CoreTransition<S, C, Event>) => void;
  readonly onError?: (error: FSMError) => void;
}

// Simple machine state type
export type SimpleMachineState<S extends State = State, C = unknown> = {
  readonly definition: MachineDefinition<S, C, Event>;
  readonly currentSnapshot: FSMSnapshot<S, C>;
};

// Factory function
export const createSimpleMachineState = <S extends State = State, C = unknown>(
  definition: SimpleMachineDefinition<S, C>,
  context?: C,
): SimpleMachineState<S, C> => {
  const machineDefinition = convertSimpleDefinition(definition);
  const currentSnapshot: FSMSnapshot<S, C> = {
    state: definition.initialState,
    context: context ?? definition.context ?? ({} as C),
    timestamp: Date.now(),
    history: [],
  };

  return {
    definition: machineDefinition,
    currentSnapshot,
  };
};

// Accessors
export const getCurrentSimpleState = <S extends State, C>(state: SimpleMachineState<S, C>): S =>
  state.currentSnapshot.state;

export const getCurrentSimpleContext = <S extends State, C>(state: SimpleMachineState<S, C>): C =>
  state.currentSnapshot.context;

// Core operations
export const canSimpleTransition = <S extends State, C>(
  state: SimpleMachineState<S, C>,
  event: Event,
  targetState?: S,
): boolean => {
  const currentState = getCurrentSimpleState(state);

  if (targetState) {
    const transition = findDirectSimpleTransition(
      state.definition,
      currentState,
      targetState,
      event,
    );
    return (
      !!transition &&
      (!transition.guard ||
        evaluateSimpleGuard(transition.guard, event, state.currentSnapshot.context))
    );
  } else {
    const transition = findEventSimpleTransition(state.definition, currentState, event);
    return (
      !!transition &&
      (!transition.guard ||
        evaluateSimpleGuard(transition.guard, event, state.currentSnapshot.context))
    );
  }
};

export const simpleTransition = <S extends State, C>(
  state: SimpleMachineState<S, C>,
  event: Event,
  targetState?: S,
): { newState: SimpleMachineState<S, C>; result: EventResult<S, C, Event> } => {
  try {
    const currentState = getCurrentSimpleState(state);

    // Find transition
    const transition = targetState
      ? findDirectSimpleTransition(state.definition, currentState, targetState, event)
      : findEventSimpleTransition(state.definition, currentState, event);

    if (!transition) {
      const error: FSMError = {
        type: 'invalid-event',
        message: targetState
          ? `No transition from ${currentState} to ${targetState} for event ${String(event)}`
          : `No transition from ${currentState} for event ${String(event)}`,
        from: currentState,
        to: targetState,
        event: event as any,
      };

      return {
        newState: state,
        result: {
          success: false,
          snapshot: state.currentSnapshot,
          error,
        },
      };
    }

    // Check guard
    if (
      transition.guard &&
      !evaluateSimpleGuard(transition.guard, event, state.currentSnapshot.context)
    ) {
      const error: FSMError = {
        type: 'guard-failed',
        message: `Guard condition failed for transition from ${currentState} to ${transition.to}`,
        from: currentState,
        to: transition.to,
        event: event as any,
      };

      return {
        newState: state,
        result: {
          success: false,
          snapshot: state.currentSnapshot,
          error,
        },
      };
    }

    // Execute transition
    const newSnapshot = executeSimpleTransition(transition, event, state.currentSnapshot);

    return {
      newState: {
        ...state,
        currentSnapshot: newSnapshot,
      },
      result: {
        success: true,
        snapshot: newSnapshot,
        transition: newSnapshot.history![newSnapshot.history!.length - 1],
      },
    };
  } catch (error) {
    const fsmError: FSMError = {
      type: 'action-failed',
      message: error instanceof Error ? error.message : String(error),
      from: getCurrentSimpleState(state),
      event: event as any,
      cause: error instanceof Error ? error : undefined,
    };

    return {
      newState: state,
      result: {
        success: false,
        snapshot: state.currentSnapshot,
        error: fsmError,
      },
    };
  }
};

export const resetSimpleMachine = <S extends State, C>(
  state: SimpleMachineState<S, C>,
  context?: C,
): SimpleMachineState<S, C> => {
  const newSnapshot: FSMSnapshot<S, C> = {
    state: state.definition.initialState,
    context: context ?? state.definition.context ?? ({} as C),
    timestamp: Date.now(),
    history: [],
  };

  return {
    ...state,
    currentSnapshot: newSnapshot,
  };
};

export const getSimpleAvailableTransitions = <S extends State, C>(
  state: SimpleMachineState<S, C>,
): readonly TransitionDefinition<S, C, Event>[] => {
  const currentState = getCurrentSimpleState(state);
  const transitions: TransitionDefinition<S, C, Event>[] = [];

  for (const transition of state.definition.transitions) {
    if (transition.from === currentState) {
      transitions.push(transition);
    }
  }

  return transitions;
};

// Helper functions
function convertSimpleDefinition<S extends State, C>(
  definition: SimpleMachineDefinition<S, C>,
): MachineDefinition<S, C, Event> {
  const transitions: TransitionDefinition<S, C, Event>[] = [];
  const states = new Map<S, StateDefinition<S, C>>();

  // Convert state map to transitions and states
  for (const [stateName, stateConfig] of Object.entries(definition.states)) {
    const state = stateName as S;
    const config = stateConfig as any;

    // Add state definition
    const stateDef: StateDefinition<S, C> = {
      id: state,
      isInitial: state === definition.initialState,
      isFinal: definition.finalStates?.includes(state),
    };
    states.set(state, stateDef);

    // Convert transitions
    if (config.on) {
      for (const [eventName, target] of Object.entries(config.on)) {
        if (Array.isArray(target)) {
          for (const targetState of target) {
            transitions.push({
              from: state,
              event: eventName,
              to: targetState,
            });
          }
        } else {
          transitions.push({
            from: state,
            event: eventName,
            to: target as S,
          });
        }
      }
    }
  }

  return {
    initialState: definition.initialState,
    states,
    transitions,
    context: definition.context,
    onTransition: definition.onTransition,
    onError: definition.onError,
  };
}

function findDirectSimpleTransition<S extends State, C>(
  definition: MachineDefinition<S, C, Event>,
  from: S,
  to: S,
  event: Event,
): TransitionDefinition<S, C, Event> | undefined {
  return definition.transitions.find(
    (t) => t.from === from && t.to === to && t.event === String(event),
  );
}

function findEventSimpleTransition<S extends State, C>(
  definition: MachineDefinition<S, C, Event>,
  from: S,
  event: Event,
): TransitionDefinition<S, C, Event> | undefined {
  return definition.transitions.find((t) => t.from === from && t.event === String(event));
}

function evaluateSimpleGuard<C>(guard: Guard<C>, event: Event, context: C): boolean {
  try {
    const result = guard(context, event);
    return typeof result === 'boolean' ? result : false;
  } catch {
    return false;
  }
}

function executeSimpleTransition<S extends State, C>(
  transition: TransitionDefinition<S, C, Event>,
  event: Event,
  currentSnapshot: FSMSnapshot<S, C>,
): FSMSnapshot<S, C> {
  let newContext = { ...currentSnapshot.context };

  // Execute transition action
  if (transition.action) {
    try {
      const result = transition.action(newContext, event);
      if (result !== undefined) {
        newContext = result as C;
      }
    } catch (error) {
      throw new Error(
        `Transition action failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const coreTransition: CoreTransition<S, C, Event> = {
    from: transition.from,
    to: transition.to,
    event: event as any,
    status: 'transitioned',
    timestamp: Date.now(),
    context: newContext,
  };

  return {
    state: transition.to,
    context: newContext,
    timestamp: Date.now(),
    history: [...(currentSnapshot.history || []), coreTransition],
  };
}
