/**
 * Simple FSM Implementation
 *
 * A functional, lightweight FSM implementation for basic use cases.
 * This is designed to be easy to understand and use while providing
 * the essential FSM functionality.
 */

import type {
  State,
  Event,
  StateMachine,
  MachineDefinition,
  TransitionDefinition,
  StateDefinition,
  EventResult,
  FSMSnapshot,
  CoreTransition,
  FSMError,
  ValidationResult,
  MachineAnalysis,
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

// Simple machine implementation
export class SimpleMachine<S extends State = State, C = unknown>
  implements StateMachine<S, C, Event>
{
  public readonly definition: MachineDefinition<S, C, Event>;
  private currentSnapshot: FSMSnapshot<S, C>;

  constructor(definition: SimpleMachineDefinition<S, C>) {
    this.definition = this.convertToMachineDefinition(definition);
    this.currentSnapshot = {
      state: definition.initialState,
      context: definition.context ?? ({} as C),
      timestamp: Date.now(),
      history: [],
    };
  }

  get currentState(): S {
    return this.currentSnapshot.state;
  }

  get currentContext(): C {
    return this.currentSnapshot.context;
  }

  transition(event: Event, targetState?: S): EventResult<S, C, Event> {
    try {
      // Convert event to consistent format

      // Find transition
      let transition: TransitionDefinition<S, C, Event> | undefined;

      if (targetState) {
        // Direct state transition
        transition = this.findDirectTransition(this.currentState, targetState, event);
      } else {
        // Event-driven transition
        transition = this.findEventTransition(this.currentState, event);
      }

      if (!transition) {
        const error: FSMError = {
          type: 'invalid-state',
          message: targetState
            ? `No transition from ${this.currentState} to ${targetState} for event ${String(event)}`
            : `No transition from ${this.currentState} for event ${String(event)}`,
          from: this.currentState,
          to: targetState,
          event: event as any,
        };

        this.definition.onError?.(error);

        return {
          success: false,
          snapshot: this.currentSnapshot,
          error,
        };
      }

      // Check guard
      if (transition.guard && !this.evaluateGuard(transition.guard, event)) {
        const error: FSMError = {
          type: 'guard-failed',
          message: `Guard condition failed for transition from ${this.currentState} to ${transition.to}`,
          from: this.currentState,
          to: transition.to,
          event: event as any,
        };

        this.definition.onError?.(error);

        return {
          success: false,
          snapshot: this.currentSnapshot,
          error,
        };
      }

      // Execute transition
      const newSnapshot = this.executeTransition(transition, event);

      // Notify on transition
      const lastTransition = newSnapshot.history![newSnapshot.history!.length - 1];
      if (lastTransition) {
        this.definition.onTransition?.(lastTransition as CoreTransition<S, C, Event>);
      }

      return {
        success: true,
        snapshot: newSnapshot,
        transition: newSnapshot.history![newSnapshot.history!.length - 1],
      };
    } catch (error) {
      const fsmError: FSMError = {
        type: 'action-failed',
        message: error instanceof Error ? error.message : String(error),
        from: this.currentState,
        event: event as any,
        cause: error instanceof Error ? error : undefined,
      };

      this.definition.onError?.(fsmError);

      return {
        success: false,
        snapshot: this.currentSnapshot,
        error: fsmError,
      };
    }
  }

  canTransition(event: Event, targetState?: S): boolean {
    if (targetState) {
      const transition = this.findDirectTransition(this.currentState, targetState, event);
      return !!transition && (!transition.guard || this.evaluateGuard(transition.guard, event));
    } else {
      const transition = this.findEventTransition(this.currentState, event);
      return !!transition && (!transition.guard || this.evaluateGuard(transition.guard, event));
    }
  }

  reset(context?: C): FSMSnapshot<S, C> {
    this.currentSnapshot = {
      state: this.definition.initialState,
      context: context ?? this.definition.context ?? ({} as C),
      timestamp: Date.now(),
      history: [],
    };
    return this.currentSnapshot;
  }

  getAvailableTransitions(): readonly TransitionDefinition<S, C, Event>[] {
    const transitions: TransitionDefinition<S, C, Event>[] = [];

    for (const transition of this.definition.transitions) {
      if (transition.from === this.currentState) {
        transitions.push(transition);
      }
    }

    return transitions;
  }

  getReachableStates(): readonly S[] {
    const reachable = new Set<S>();
    const visited = new Set<S>();
    const queue: S[] = [this.currentState];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      reachable.add(current);

      for (const transition of this.definition.transitions) {
        if (transition.from === current && !visited.has(transition.to)) {
          queue.push(transition.to);
        }
      }
    }

    return Array.from(reachable);
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check initial state exists
    if (!this.definition.states.has(this.definition.initialState)) {
      errors.push(`Initial state '${this.definition.initialState}' is not defined`);
    }

    // Check final states exist
    for (const finalState of this.definition.finalStates ?? []) {
      if (!this.definition.states.has(finalState)) {
        errors.push(`Final state '${finalState}' is not defined`);
      }
    }

    // Check transitions reference valid states
    for (const transition of this.definition.transitions) {
      if (!this.definition.states.has(transition.from)) {
        errors.push(`Transition references undefined state '${transition.from}'`);
      }
      if (!this.definition.states.has(transition.to)) {
        errors.push(`Transition references undefined state '${transition.to}'`);
      }
    }

    // Check for unreachable states
    const reachable = this.getReachableStates();
    for (const [stateId] of this.definition.states) {
      if (!reachable.includes(stateId)) {
        warnings.push(`State '${stateId}' is unreachable from initial state`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  analyze(): MachineAnalysis<S, C> {
    const reachable = this.getReachableStates();
    const allStates = Array.from(this.definition.states.keys());
    const unreachable = allStates.filter((state) => !reachable.includes(state));

    // Check for cycles (simplified)
    const hasCycles = this.detectCycles();

    // Build state transition map
    const stateTransitions = new Map<S, readonly S[]>();
    for (const [stateId] of this.definition.states) {
      const transitions = this.definition.transitions
        .filter((t) => t.from === stateId)
        .map((t) => t.to);
      stateTransitions.set(stateId, transitions);
    }

    return {
      reachableStates: reachable,
      unreachableStates: unreachable,
      hasCycles,
      isDeterministic: !hasCycles, // Simplified - true FSM complexity would need more analysis
      stateTransitions,
    };
  }

  // Private helper methods

  private convertToMachineDefinition(
    def: SimpleMachineDefinition<S, C>,
  ): MachineDefinition<S, C, Event> {
    const states = new Map<S, StateDefinition<S, C>>();
    const transitions: TransitionDefinition<S, C, Event>[] = [];

    // Convert state definitions
    for (const [stateId, stateConfig] of Object.entries(def.states)) {
      const config = stateConfig as any;
      const stateDef: StateDefinition<S, C> = {
        id: stateId as S,
        isInitial: stateId === def.initialState,
        isFinal: def.finalStates?.includes(stateId as S),
        actions: config?.config
          ? {
              entry: config.config.entry,
              exit: config.config.exit,
            }
          : undefined,
        timeout: config?.config?.timeout,
        metadata: undefined,
      };
      states.set(stateId as S, stateDef);

      // Convert transitions
      if (config?.on) {
        for (const [eventType, target] of Object.entries(config.on)) {
          const targets = Array.isArray(target) ? target : [target];
          for (const targetState of targets) {
            const transition: TransitionDefinition<S, C, Event> = {
              from: stateId as S,
              to: targetState as S,
              event: this.createEvent(eventType),
              guard: config.config?.guard,
              action: config.config?.action,
            };
            transitions.push(transition);
          }
        }
      }
    }

    return {
      initialState: def.initialState,
      finalStates: def.finalStates,
      context: def.context,
      onTransition: def.onTransition,
      onError: def.onError,
      states,
      transitions,
    };
  }

  private getEventType(event: Event): string {
    if (typeof event === 'string') return event;
    if (typeof event === 'object' && event !== null && 'type' in event) {
      return (event as any).type;
    }
    return String(event);
  }

  private createEvent(type: string): Event {
    return { type };
  }

  private findEventTransition(
    state: S,
    event: Event,
  ): TransitionDefinition<S, C, Event> | undefined {
    const eventType = this.getEventType(event);
    return this.definition.transitions.find(
      (t) => t.from === state && this.getEventType(t.event) === eventType,
    );
  }

  private findDirectTransition(
    from: S,
    to: S,
    _event: Event,
  ): TransitionDefinition<S, C, Event> | undefined {
    return this.definition.transitions.find((t) => t.from === from && t.to === to);
  }

  private evaluateGuard(guard: Guard<C, Event>, event: Event): boolean {
    try {
      const result = guard(this.currentContext, event);
      return typeof result === 'boolean' ? result : false;
    } catch {
      return false; // Guard errors should fail the transition
    }
  }

  private executeTransition(
    transition: TransitionDefinition<S, C, Event>,
    event: Event,
  ): FSMSnapshot<S, C> {
    let newContext = this.currentContext;
    const history = [...(this.currentSnapshot.history ?? [])];

    // Execute exit action for current state
    const currentStateDef = this.definition.states.get(this.currentState);
    if (currentStateDef?.actions?.exit) {
      try {
        const result = currentStateDef.actions.exit(newContext, event);
        if (result !== undefined) {
          newContext = result as C;
        }
      } catch (error) {
        // Exit action errors should not prevent transition
        console.warn('Exit action failed:', error);
      }
    }

    // Execute transition action
    if (transition.action) {
      try {
        const result = transition.action(newContext, event);
        if (result !== undefined) {
          newContext = result as C;
        }
      } catch (error) {
        // Transition action errors should not prevent transition
        console.warn('Transition action failed:', error);
      }
    }

    // Create transition record
    const transitionRecord: CoreTransition<S, C, Event> = {
      from: this.currentState,
      to: transition.to,
      event,
      status: 'transitioned',
      context: newContext,
      timestamp: Date.now(),
      metadata: transition.metadata,
    };
    history.push(transitionRecord);

    // Execute entry action for new state
    const newStateDef = this.definition.states.get(transition.to);
    if (newStateDef?.actions?.entry) {
      try {
        const result = newStateDef.actions.entry(newContext, event);
        if (result !== undefined) {
          newContext = result as C;
        }
      } catch (error) {
        // Entry action errors should not prevent transition
        console.warn('Entry action failed:', error);
      }
    }

    // Create new snapshot
    const newSnapshot: FSMSnapshot<S, C> = {
      state: transition.to,
      context: newContext,
      timestamp: Date.now(),
      history,
    };

    this.currentSnapshot = newSnapshot;
    return newSnapshot;
  }

  private detectCycles(): boolean {
    // Simple cycle detection using DFS
    const visited = new Set<S>();
    const recursionStack = new Set<S>();

    const hasCycle = (state: S): boolean => {
      if (recursionStack.has(state)) return true;
      if (visited.has(state)) return false;

      visited.add(state);
      recursionStack.add(state);

      for (const transition of this.definition.transitions) {
        if (transition.from === state && hasCycle(transition.to)) {
          return true;
        }
      }

      recursionStack.delete(state);
      return false;
    };

    return hasCycle(this.definition.initialState);
  }
}

// Factory function
export function createSimpleMachine<S extends State = State, C = unknown>(
  definition: SimpleMachineDefinition<S, C>,
): SimpleMachine<S, C> {
  return new SimpleMachine(definition);
}
