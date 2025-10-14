/**
 * FSM Integration Adapters
 *
 * Provides integration adapters for using the existing FSM functionality
 * with different systems (agents-workflow, piper, kanban).
 */

import type {
  MachineDefinition,
  MachineEvent,
  MachineSnapshot,
  TransitionDefinition,
} from "./types.js";
import { createSnapshot, transition } from "./machine.js";

export interface SystemConfig<Context = unknown, Event = unknown, Metadata = unknown> {
  readonly name: string;
  readonly initialState: string;
  readonly states: Record<string, StateConfig<Context, Metadata>>;
  readonly transitions: TransitionConfig<Context, Event, Metadata>[];
  readonly context?: Context;
  readonly metadata?: Record<string, Metadata>;
}

export interface StateConfig<Context = unknown, Metadata = unknown> {
  readonly id: string;
  readonly name?: string;
  readonly metadata?: Metadata;
  readonly entry?: (context: Context) => Context | void;
  readonly exit?: (context: Context) => Context | void;
}

export interface TransitionConfig<Context = unknown, Event = unknown, Metadata = unknown> {
  readonly from: string;
  readonly to: string;
  readonly event: string;
  readonly guard?: (context: Context, event: Event) => boolean;
  readonly action?: (context: Context, event: Event) => Context | void;
  readonly metadata?: Metadata;
}

/**
 * Generic FSM Engine that can be configured for different systems
 */
export class UnifiedFSMEngine<Context = unknown, Event = unknown, Metadata = unknown> {
  private readonly config: SystemConfig<Context, Event, Metadata>;
  private readonly machine: MachineDefinition<string, Record<string, any>, Context>;
  private currentSnapshot: MachineSnapshot<string, Context>;

  constructor(config: SystemConfig<Context, Event, Metadata>) {
    this.config = config;
    this.machine = this.createMachineDefinition();
    this.currentSnapshot = createSnapshot(this.machine);
  }

  getCurrentState(): string {
    return this.currentSnapshot.state;
  }

  getCurrentContext(): Context {
    return this.currentSnapshot.context;
  }

  async processEvent(eventType: string, payload: Event): Promise<{
    success: boolean;
    newState?: string;
    newContext?: Context;
    error?: string;
  }> {
    try {
      const event: MachineEvent<Record<string, any>> = {
        type: eventType,
        payload,
      };

      const result = transition(this.machine, this.currentSnapshot, event);

      if (result.status === 'transitioned') {
        this.currentSnapshot = result.snapshot;
        return {
          success: true,
          newState: result.snapshot.state,
          newContext: result.snapshot.context,
        };
      } else {
        return {
          success: false,
          error: `Transition from ${result.snapshot.state} failed for event ${eventType}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  reset(context?: Context): void {
    this.currentSnapshot = createSnapshot(this.machine, {
      context: context ?? this.config.context,
    });
  }

  getAvailableTransitions(): string[] {
    return this.config.transitions
      .filter(t => t.from === this.getCurrentState())
      .map(t => t.event);
  }

  serializeState(): string {
    return JSON.stringify({
      state: this.getCurrentState(),
      context: this.getCurrentContext(),
    });
  }

  deserializeState(data: string): void {
    const parsed = JSON.parse(data);
    this.currentSnapshot = createSnapshot(this.machine, {
      state: parsed.state,
      context: parsed.context,
    });
  }

  private createMachineDefinition(): MachineDefinition<string, Record<string, any>, Context> {
    const transitions: TransitionDefinition<string, Record<string, any>, Context>[] = this.config.transitions.map(t => ({
      from: t.from,
      to: t.to,
      event: t.event,
      guard: t.guard ? (details) => {
        return t.guard!(details.context, details.event.payload as Event);
      } : undefined,
      reducer: t.action ? (details) => {
        const newContext = t.action!(details.context, details.event.payload as Event);
        return newContext ?? details.context;
      } : undefined,
    }));

    return {
      initialState: this.config.initialState,
      initialContext: this.config.context ?? {} as Context,
      transitions,
    };
  }
}

// Type definitions for different systems

export interface KanbanContext {
  readonly tasks: Array<any>;
  readonly wipLimits: Record<string, number>;
  readonly columns: Array<any>;
  readonly metadata?: Record<string, unknown>;
}

export type KanbanEvent =
  | { type: 'task_created'; taskId: string }
  | { type: 'task_updated'; taskId: string; changes: Record<string, unknown> }
  | { type: 'task_moved'; taskId: string; fromColumn: string; toColumn: string }
  | { type: 'column_limit_changed'; column: string; newLimit: number }
  | { type: 'wip_violation'; taskId: string; column: string };

export interface WorkflowContext {
  readonly agents: Array<any>;
  readonly tasks: Array<any>;
  readonly status: 'idle' | 'running' | 'completed' | 'failed';
  readonly metadata?: Record<string, unknown>;
}

export type WorkflowEvent =
  | { type: 'agent_assigned'; agentId: string; taskId: string }
  | { type: 'task_started'; taskId: string }
  | { type: 'task_completed'; taskId: string; result: any }
  | { type: 'workflow_started' }
  | { type: 'workflow_completed'; results: any }
  | { type: 'workflow_failed'; error: string };

export interface PipelineContext {
  readonly steps: Array<any>;
  readonly results: Record<string, any>;
  readonly status: 'pending' | 'running' | 'completed' | 'failed';
  readonly metadata?: Record<string, unknown>;
}

export type PipelineEvent =
  | { type: 'step_started'; stepId: string }
  | { type: 'step_completed'; stepId: string; result: any }
  | { type: 'step_failed'; stepId: string; error: string }
  | { type: 'pipeline_started' }
  | { type: 'pipeline_completed'; results: any }
  | { type: 'pipeline_failed'; error: string };

// Factory functions for common configurations

export function createKanbanFSM(config: SystemConfig<KanbanContext, KanbanEvent>): UnifiedFSMEngine<KanbanContext, KanbanEvent> {
  return new UnifiedFSMEngine(config);
}

export function createAgentsWorkflowFSM(config: SystemConfig<WorkflowContext, WorkflowEvent>): UnifiedFSMEngine<WorkflowContext, WorkflowEvent> {
  return new UnifiedFSMEngine(config);
}

export function createPiperFSM(config: SystemConfig<PipelineContext, PipelineEvent>): UnifiedFSMEngine<PipelineContext, PipelineEvent> {
  return new UnifiedFSMEngine(config);
}

// Pre-configured basic workflows

export const basicKanbanConfig: SystemConfig<KanbanContext, KanbanEvent> = {
  name: 'basic-kanban',
  initialState: 'incoming',
  states: {
    incoming: { id: 'incoming' },
    todo: { id: 'todo' },
    in_progress: { id: 'in_progress' },
    review: { id: 'review' },
    done: { id: 'done' },
  },
  transitions: [
    { from: 'incoming', to: 'todo', event: 'task_created' },
    { from: 'todo', to: 'in_progress', event: 'task_started' },
    { from: 'in_progress', to: 'review', event: 'task_completed' },
    { from: 'review', to: 'done', event: 'task_approved' },
    { from: 'review', to: 'in_progress', event: 'task_rejected' },
  ],
  context: { tasks: [], wipLimits: {}, columns: [] },
};

export const basicWorkflowConfig: SystemConfig<WorkflowContext, WorkflowEvent> = {
  name: 'basic-workflow',
  initialState: 'idle',
  states: {
    idle: { id: 'idle' },
    running: { id: 'running' },
    completed: { id: 'completed' },
    failed: { id: 'failed' },
  },
  transitions: [
    { from: 'idle', to: 'running', event: 'workflow_started' },
    { from: 'running', to: 'completed', event: 'workflow_completed' },
    { from: 'running', to: 'failed', event: 'workflow_failed' },
    { from: 'completed', to: 'idle', event: 'workflow_reset' },
    { from: 'failed', to: 'idle', event: 'workflow_reset' },
  ],
  context: { agents: [], tasks: [], status: 'idle' },
};

export const basicPipelineConfig: SystemConfig<PipelineContext, PipelineEvent> = {
  name: 'basic-pipeline',
  initialState: 'pending',
  states: {
    pending: { id: 'pending' },
    running: { id: 'running' },
    completed: { id: 'completed' },
    failed: { id: 'failed' },
  },
  transitions: [
    { from: 'pending', to: 'running', event: 'pipeline_started' },
    { from: 'running', to: 'completed', event: 'pipeline_completed' },
    { from: 'running', to: 'failed', event: 'pipeline_failed' },
  ],
  context: { steps: [], results: {}, status: 'pending' },
};