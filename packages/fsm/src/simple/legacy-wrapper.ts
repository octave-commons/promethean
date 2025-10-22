/**
 * Legacy Class Wrapper for Simple FSM
 *
 * This file provides the deprecated class-based API as a thin wrapper
 * around the functional core implementation.
 */

import type {
  State,
  Event,
  StateMachine,
  MachineDefinition,
  TransitionDefinition,
  EventResult,
  FSMSnapshot,
  ValidationResult,
  MachineAnalysis,
} from '../core/types.js';

import type { SimpleMachineDefinition, SimpleMachineState } from './functional-core.js';

import {
  createSimpleMachineState,
  getCurrentSimpleState,
  getCurrentSimpleContext,
  canSimpleTransition,
  simpleTransition,
  resetSimpleMachine,
  getSimpleAvailableTransitions,
} from './functional-core.js';

/**
 * @deprecated Use functional API instead: createSimpleMachineState, simpleTransition, etc.
 */
export class SimpleMachine<S extends State = State, C = unknown>
  implements StateMachine<S, C, Event>
{
  public readonly definition: MachineDefinition<S, C, Event>;
  private state: SimpleMachineState<S, C>;

  constructor(definition: SimpleMachineDefinition<S, C>) {
    console.warn(
      'SimpleMachine class is deprecated. Use functional API instead: createSimpleMachineState, simpleTransition, etc.',
    );

    this.state = createSimpleMachineState(definition);
    this.definition = this.state.definition;
  }

  get currentState(): S {
    return getCurrentSimpleState(this.state);
  }

  get currentContext(): C {
    return getCurrentSimpleContext(this.state);
  }

  transition(event: Event, targetState?: S): EventResult<S, C, Event> {
    const result = simpleTransition(this.state, event, targetState);
    this.state = result.newState;

    // Call transition callback if defined
    if (result.result.transition && this.definition.onTransition) {
      this.definition.onTransition(result.result.transition);
    }

    return result.result;
  }

  canTransition(event: Event, targetState?: S): boolean {
    return canSimpleTransition(this.state, event, targetState);
  }

  reset(context?: C): FSMSnapshot<S, C> {
    this.state = resetSimpleMachine(this.state, context);
    return this.state.currentSnapshot;
  }

  getAvailableTransitions(): readonly TransitionDefinition<S, C, Event>[] {
    return getSimpleAvailableTransitions(this.state);
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

// Factory function for backward compatibility
/**
 * @deprecated Use createSimpleMachineState from functional-core instead
 */
export function createSimpleMachine<S extends State = State, C = unknown>(
  definition: SimpleMachineDefinition<S, C>,
): SimpleMachine<S, C> {
  return new SimpleMachine(definition);
}
