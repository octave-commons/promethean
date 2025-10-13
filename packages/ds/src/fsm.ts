// FSM Extension for Graph class
// Extends the existing Graph functionality with FSM-specific operations

import { Graph } from './graph.js';

//#region FSM Types and Extensions

export type FSMState<Context = unknown, Metadata = unknown> = {
    readonly id: string;
    readonly metadata?: Metadata;
    readonly entryActions?: Array<(context: Context, event?: unknown) => Context | void>;
    readonly exitActions?: Array<(context: Context, event?: unknown) => Context | void>;
    readonly validation?: (context: Context) => boolean | string;
    readonly isFinal?: boolean;
    readonly isInitial?: boolean;
    readonly parent?: string; // For hierarchical states
    readonly children?: string[]; // For composite states
}

export type FSMTransition<Context = unknown, Event = unknown, Metadata = unknown> = {
    readonly from: string;
    readonly to: string;
    readonly event?: string;
    readonly guard?: (context: Context, event?: Event) => boolean;
    readonly reducer?: (context: Context, event: Event) => Context;
    readonly actions?: Array<(context: Context, event: Event) => Context | void>;
    readonly metadata?: Metadata;
    readonly priority?: number;
    readonly condition?: string; // Schema-based condition expression
}

export type FSMConfig<Context = unknown, Event = unknown, StateMetadata = unknown, TransitionMetadata = unknown> = {
    readonly initialState: string;
    readonly finalStates?: string[];
    readonly context?: Context;
    readonly hierarchical?: boolean;
    readonly parallelRegions?: string[][];
    readonly globalTransitions?: FSMTransition<Context, Event, TransitionMetadata>[];
    readonly stateMetadata?: Record<string, StateMetadata>;
    readonly transitionMetadata?: Record<string, TransitionMetadata>;
}

export type FSMTransitionResult<State extends string, Context, Event> = {
    readonly from: State;
    readonly to: State;
    readonly context: Context;
    readonly event: Event;
    readonly success: boolean;
    readonly reason?: string;
    readonly executedActions: Array<string>;
}

export type FSMValidationResult = {
    readonly valid: boolean;
    readonly errors: Array<string>;
    readonly warnings: Array<string>;
}

export class FSMGraph<
    Context = unknown,
    Event = unknown,
    StateMetadata = unknown,
    TransitionMetadata = unknown,
> extends Graph<
    FSMState<Context, StateMetadata>,
    FSMTransition<Context, Event, TransitionMetadata> | FSMTransition<Context, Event, TransitionMetadata>[]
> {
    private readonly config: FSMConfig<Context, Event, StateMetadata, TransitionMetadata>;
    private currentState: string;
    private currentContext: Context;

    constructor(config: FSMConfig<Context, Event, StateMetadata, TransitionMetadata>) {
        super({ directed: true });
        this.config = config;
        this.currentState = config.initialState;
        this.currentContext = config.context ?? ({} as Context);

        // Initialize the FSM structure
        this.initializeFSM();
    }

    private initializeFSM(): void {
        // Add initial state
        this.addState(this.config.initialState, { isInitial: true });

        // Add final states
        if (this.config.finalStates) {
            for (const finalState of this.config.finalStates) {
                this.addState(finalState, { isFinal: true });
            }
        }

        // Add global transitions
        if (this.config.globalTransitions) {
            for (const transition of this.config.globalTransitions) {
                this.addTransition(transition);
            }
        }
    }

    private getEventType(event: Event): string {
        if (typeof event === 'string') {
            return event;
        }
        if (typeof event === 'object' && event !== null && 'type' in event) {
            return (event as any).type;
        }
        return String(event);
    }

    private eventMatches(transitionEvent: string | undefined, actualEvent: Event): boolean {
        if (!transitionEvent) return true;
        if (typeof actualEvent === 'string') {
            return transitionEvent === actualEvent;
        }
        if (typeof actualEvent === 'object' && actualEvent !== null && 'type' in actualEvent) {
            return transitionEvent === (actualEvent as any).type;
        }
        return transitionEvent === String(actualEvent);
    }

    //#region State Management
    addState(id: string, state: Omit<FSMState<Context, StateMetadata>, 'id'> = {}): this {
        const fullState: FSMState<Context, StateMetadata> = { id, ...state };
        this.addNode(id, fullState);
        return this;
    }

    hasState(id: string): boolean {
        return this.hasNode(id);
    }

    getState(id: string): FSMState<Context, StateMetadata> | undefined {
        return this.getNode(id);
    }

    updateState(id: string, updates: Partial<FSMState<Context, StateMetadata>>): this {
        const currentState = this.getState(id);
        if (!currentState) {
            throw new Error(`State ${id} not found`);
        }
        const updatedState = { ...currentState, ...updates };
        this.setNodeData(id, updatedState);
        return this;
    }

    removeState(id: string): this {
        // Check if state is current state
        if (this.currentState === id) {
            throw new Error(`Cannot remove current state ${id}`);
        }

        // Check if state is initial state
        if (this.config.initialState === id) {
            throw new Error(`Cannot remove initial state ${id}`);
        }

        this.removeNode(id);
        return this;
    }

    getCurrentState(): string {
        return this.currentState;
    }

    getCurrentStateData(): FSMState<Context, StateMetadata> | undefined {
        return this.getState(this.currentState);
    }

    getContext(): Context {
        return this.currentContext;
    }

    setContext(context: Context): void {
        this.currentContext = context;
    }

    updateContext(updater: (context: Context) => Context): void {
        this.currentContext = updater(this.currentContext);
    }
    //#endregion

    //#region Transition Management
    addTransition(transition: FSMTransition<Context, Event, TransitionMetadata>): this {
        // Check if edge already exists
        const existingEdge = this.getEdge(transition.from, transition.to);
        if (existingEdge && existingEdge.data) {
            // Edge exists, check if it's already an array of transitions
            if (Array.isArray(existingEdge.data)) {
                // Add to existing array
                const updatedData = [...existingEdge.data, transition];
                this.addEdge(transition.from, transition.to, { data: updatedData, overwrite: true });
            } else {
                // Convert single transition to array
                const updatedData = [
                    existingEdge.data,
                    transition,
                ];
                this.addEdge(transition.from, transition.to, { data: updatedData, overwrite: true });
            }
        } else {
            // Create new edge with single transition
            this.addEdge(transition.from, transition.to, { data: transition });
        }
        return this;
    }

    hasTransition(from: string, to: string, event?: string): boolean {
        const edge = this.getEdge(from, to);
        if (!edge) return false;
        if (!event) return true;

        const edgeData = edge.data;
        if (Array.isArray(edgeData)) {
            return edgeData.some((t) => t.event === event);
        }
        return edgeData?.event === event;
    }

    getTransition(
        from: string,
        to: string,
        event?: string,
    ): FSMTransition<Context, Event, TransitionMetadata> | undefined {
        const edge = this.getEdge(from, to);
        if (!edge) return undefined;

        const edgeData = edge.data;
        if (Array.isArray(edgeData)) {
            if (!event) return edgeData[0]; // Return first transition if no event specified
            return edgeData.find((t) => t.event === event);
        }

        if (!event || edgeData?.event === event) {
            return edgeData;
        }
        return undefined;
    }

    getTransitionsFrom(state: string): FSMTransition<Context, Event, TransitionMetadata>[] {
        const transitions: FSMTransition<Context, Event, TransitionMetadata>[] = [];
        for (const edge of this.edges()) {
            if (edge.u === state && edge.data) {
                if (Array.isArray(edge.data)) {
                    transitions.push(...edge.data);
                } else {
                    transitions.push(edge.data);
                }
            }
        }
        return transitions;
    }

    getTransitionsTo(state: string): FSMTransition<Context, Event, TransitionMetadata>[] {
        const transitions: FSMTransition<Context, Event, TransitionMetadata>[] = [];
        for (const edge of this.edges()) {
            if (edge.v === state && edge.data) {
                if (Array.isArray(edge.data)) {
                    transitions.push(...edge.data);
                } else {
                    transitions.push(edge.data);
                }
            }
        }
        return transitions;
    }

    getAvailableTransitions(event?: Event): FSMTransition<Context, Event, TransitionMetadata>[] {
        const transitions = this.getTransitionsFrom(this.currentState);
        if (!event) return transitions;
        return transitions.filter((t) => this.eventMatches(t.event, event));
    }
    //#endregion

    //#region FSM Operations
    canTransition(event: Event, targetState?: string): boolean {
        const transitions = targetState
            ? this.getTransition(this.currentState, targetState, this.getEventType(event))
                ? [this.getTransition(this.currentState, targetState, this.getEventType(event))!]
                : []
            : this.getAvailableTransitions(event);

        return transitions.some((transition) => {
            if (!transition.guard) return true;
            try {
                return transition.guard(this.currentContext, event);
            } catch {
                return false;
            }
        });
    }

    transition(event: Event, targetState?: string): FSMTransitionResult<string, Context, Event> {
        const transitions = targetState
            ? this.getTransition(this.currentState, targetState, this.getEventType(event))
                ? [this.getTransition(this.currentState, targetState, this.getEventType(event))!]
                : []
            : this.getAvailableTransitions(event);

        // Sort by priority if specified
        transitions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

        for (const transition of transitions) {
            // Check guard
            if (transition.guard) {
                try {
                    if (!transition.guard(this.currentContext, event)) {
                        continue;
                    }
                } catch (error) {
                    return {
                        from: this.currentState,
                        to: this.currentState,
                        context: this.currentContext,
                        event,
                        success: false,
                        reason: `Guard failed: ${error instanceof Error ? error.message : String(error)}`,
                        executedActions: [],
                    };
                }
            }

            // Execute exit actions for current state
            const currentStateData = this.getCurrentStateData();
            const executedActions: string[] = [];

            if (currentStateData?.exitActions) {
                for (const action of currentStateData.exitActions) {
                    try {
                        const result = action(this.currentContext, event);
                        if (result !== undefined) {
                            this.currentContext = result as Context;
                        }
                        executedActions.push(`exit:${this.currentState}`);
                    } catch (error) {
                        return {
                            from: this.currentState,
                            to: this.currentState,
                            context: this.currentContext,
                            event,
                            success: false,
                            reason: `Exit action failed: ${error instanceof Error ? error.message : String(error)}`,
                            executedActions,
                        };
                    }
                }
            }

            // Execute transition reducer
            let newContext = this.currentContext;
            if (transition.reducer) {
                try {
                    newContext = transition.reducer(this.currentContext, event);
                } catch (error) {
                    return {
                        from: this.currentState,
                        to: transition.to,
                        context: this.currentContext,
                        event,
                        success: false,
                        reason: `Reducer failed: ${error instanceof Error ? error.message : String(error)}`,
                        executedActions,
                    };
                }
            }

            // Execute transition actions
            if (transition.actions) {
                for (const action of transition.actions) {
                    try {
                        const result = action(newContext, event);
                        if (result !== undefined) {
                            newContext = result as Context;
                        }
                        executedActions.push(`transition:${transition.from}->${transition.to}`);
                    } catch (error) {
                        return {
                            from: this.currentState,
                            to: transition.to,
                            context: newContext,
                            event,
                            success: false,
                            reason: `Transition action failed: ${error instanceof Error ? error.message : String(error)}`,
                            executedActions,
                        };
                    }
                }
            }

            // Update state and context
            const oldState = this.currentState;
            this.currentState = transition.to;
            this.currentContext = newContext;

            // Execute entry actions for new state
            const newStateData = this.getState(transition.to);
            if (newStateData?.entryActions) {
                for (const action of newStateData.entryActions) {
                    try {
                        const result = action(this.currentContext, event);
                        if (result !== undefined) {
                            this.currentContext = result as Context;
                        }
                        executedActions.push(`entry:${transition.to}`);
                    } catch (error) {
                        return {
                            from: oldState,
                            to: transition.to,
                            context: this.currentContext,
                            event,
                            success: false,
                            reason: `Entry action failed: ${error instanceof Error ? error.message : String(error)}`,
                            executedActions,
                        };
                    }
                }
            }

            return {
                from: oldState,
                to: transition.to,
                context: this.currentContext,
                event,
                success: true,
                executedActions,
            };
        }

        return {
            from: this.currentState,
            to: this.currentState,
            context: this.currentContext,
            event,
            success: false,
            reason: targetState
                ? `No transition found from ${this.currentState} to ${targetState} for event ${String(event)}`
                : `No transition found from ${this.currentState} for event ${String(event)}`,
            executedActions: [],
        };
    }

    reset(state?: string, context?: Context): void {
        this.currentState = state ?? this.config.initialState;
        this.currentContext = context ?? this.config.context ?? ({} as Context);
    }

    isFinalState(): boolean {
        return this.config.finalStates?.includes(this.currentState) ?? false;
    }

    isInitialState(): boolean {
        return this.currentState === this.config.initialState;
    }
    //#endregion

    //#region Validation and Analysis
    validate(): FSMValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check if initial state exists
        if (!this.hasState(this.config.initialState)) {
            errors.push(`Initial state ${this.config.initialState} does not exist`);
        }

        // Check if final states exist
        if (this.config.finalStates) {
            for (const finalState of this.config.finalStates) {
                if (!this.hasState(finalState)) {
                    errors.push(`Final state ${finalState} does not exist`);
                }
            }
        }

        // Check for unreachable states
        const reachable = this.bfs(this.config.initialState).order;
        const allStates = Array.from(this.nodes()).map((n) => n.id as string);
        const unreachable = allStates.filter((state) => !reachable.includes(state));
        if (unreachable.length > 0) {
            warnings.push(`Unreachable states: ${unreachable.join(', ')}`);
        }

        // Check for dead-end states (non-final states with no outgoing transitions)
        for (const { id } of this.nodes()) {
            const stateId = id as string;
            if (this.config.finalStates?.includes(stateId)) continue;
            const outgoingTransitions = this.getTransitionsFrom(stateId);
            if (outgoingTransitions.length === 0) {
                warnings.push(`State ${stateId} has no outgoing transitions`);
            }
        }

        // Check for invalid transitions (transitions to non-existent states)
        for (const edge of this.edges()) {
            if (!this.hasState(edge.v as string)) {
                errors.push(`Transition from ${edge.u} to non-existent state ${edge.v}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    getStateHierarchy(): Record<string, string[]> {
        const hierarchy: Record<string, string[]> = {};

        for (const { id, data } of this.nodes()) {
            const stateId = id as string;
            if (data?.parent) {
                if (!hierarchy[data.parent]) {
                    hierarchy[data.parent] = [];
                }
                hierarchy[data.parent].push(stateId);
            }
        }

        return hierarchy;
    }

    findPaths(from: string, to: string): string[][] {
        const paths: string[][] = [];
        const visited = new Set<string>();

        const dfs = (current: string, path: string[]) => {
            if (current === to) {
                paths.push([...path, to]);
                return;
            }

            if (visited.has(current)) return;
            visited.add(current);

            for (const [neighbor] of this.neighbors(current)) {
                dfs(neighbor as string, [...path, current]);
            }

            visited.delete(current);
        };

        dfs(from, []);
        return paths;
    }

    getTransitionMatrix(): Record<string, Record<string, FSMTransition<Context, Event, TransitionMetadata>[]>> {
        const matrix: Record<string, Record<string, FSMTransition<Context, Event, TransitionMetadata>[]>> = {};

        for (const { id: from } of this.nodes()) {
            const fromId = from as string;
            matrix[fromId] = {};
            for (const { id: to } of this.nodes()) {
                const toId = to as string;
                matrix[fromId][toId] = [];
                for (const edge of this.edges()) {
                    if (edge.u === from && edge.v === to && edge.data) {
                        const edgeData = edge.data;
                        if (Array.isArray(edgeData)) {
                            matrix[fromId][toId].push(...edgeData);
                        } else {
                            matrix[fromId][toId].push(edgeData);
                        }
                    }
                }
            }
        }

        return matrix;
    }
    //#endregion

    //#region Serialization
    toJSONFSM(): {
        config: FSMConfig<Context, Event, StateMetadata, TransitionMetadata>;
        currentState: string;
        currentContext: Context;
        graph: {
            directed: boolean;
            nodes: Array<{ id: string; data?: FSMState<Context, StateMetadata> }>;
            edges: Array<{
                u: string;
                v: string;
                data?:
                    | FSMTransition<Context, Event, TransitionMetadata>
                    | FSMTransition<Context, Event, TransitionMetadata>[];
            }>;
        };
    } {
        const graph = this.toJSON();
        return {
            config: this.config,
            currentState: this.currentState,
            currentContext: this.currentContext,
            graph: {
                directed: graph.directed,
                nodes: graph.nodes.map((n) => ({ id: n.id as string, data: n.data })),
                edges: graph.edges.map((e) => ({ u: e.u as string, v: e.v as string, data: e.data })),
            },
        };
    }

    static fromJSONFSM<
        Context = unknown,
        Event = unknown,
        StateMetadata = unknown,
        TransitionMetadata = unknown,
    >(json: {
        config: FSMConfig<Context, Event, StateMetadata, TransitionMetadata>;
        currentState: string;
        currentContext: Context;
        graph: {
            directed: boolean;
            nodes: Array<{ id: string; data?: FSMState<Context, StateMetadata> }>;
            edges: Array<{
                u: string;
                v: string;
                data?:
                    | FSMTransition<Context, Event, TransitionMetadata>
                    | FSMTransition<Context, Event, TransitionMetadata>[];
            }>;
        };
    }): FSMGraph<Context, Event, StateMetadata, TransitionMetadata> {
        const fsm = new FSMGraph<Context, Event, StateMetadata, TransitionMetadata>(json.config);

        // Restore graph structure
        for (const node of json.graph.nodes) {
            if (node.data) {
                fsm.addNode(node.id, node.data);
            }
        }

        for (const edge of json.graph.edges) {
            fsm.addEdge(edge.u, edge.v, { data: edge.data });
        }

        // Restore current state and context
        fsm.currentState = json.currentState;
        fsm.currentContext = json.currentContext;

        return fsm;
    }
    //#endregion
}

//#endregion
