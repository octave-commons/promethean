/**
 * Unified FSM Package
 *
 * This package provides a comprehensive, layered approach to finite state machine implementation.
 * Choose the right API level for your needs:
 *
 * - Simple FSM: Lightweight, functional API for basic use cases
 * - Graph FSM: Feature-rich, graph-based API for complex scenarios
 * - Adapters: Pre-built integrations for common applications
 */

// Core types and interfaces (shared foundation)
export type {
  State,
  Event,
  StateMachine,
  FSMSnapshot,
  TransitionResult as CoreTransitionResult,
  CoreTransition,
  FSMError,
  Guard,
  Action,
  MachineDefinition as CoreMachineDefinition,
  TransitionDefinition as CoreTransitionDefinition,
  StateDefinition,
  ValidationResult,
  MachineAnalysis,
  PerformanceMetrics,
  MachineSnapshot as CoreMachineSnapshot,
} from './core/types.js';

// Simple FSM API (recommended for most use cases)
export { SimpleMachine, createSimpleMachine } from './simple/index.js';

export type {
  SimpleStateConfig,
  SimpleTransitionConfig,
  SimpleMachineDefinition,
  StateMap,
} from './simple/index.js';

// Graph-Based FSM API (for complex scenarios)
// Note: Currently re-exporting the existing FSMGraph from @promethean/ds/fsm
// A new unified graph implementation is in progress
export { FSMGraph } from './graph/index.js';

export type {
  FSMConfig,
  FSMState,
  FSMTransition,
  FSMTransitionResult,
  FSMValidationResult,
} from './graph/index.js';

// Application Adapters (pre-built integrations)
export {
  UnifiedFSMEngine,
  createKanbanFSM,
  createAgentsWorkflowFSM,
  createPiperFSM,
  basicKanbanConfig,
  basicWorkflowConfig,
  basicPipelineConfig,
} from './adapters.js';

export type {
  SystemConfig,
  StateConfig,
  TransitionConfig,
  KanbanContext,
  KanbanEvent,
  WorkflowContext,
  WorkflowEvent,
  PipelineContext,
  PipelineEvent,
} from './adapters.js';

// Legacy API (maintained for backward compatibility)
export type {
  InitialContext,
  MachineEvent,
  MachineDefinition,
  MachineSnapshot,
  SnapshotOptions,
  TransitionDetails,
  TransitionDefinition,
  TransitionForEvent,
  TransitionResult,
  TransitionManyResult,
  TransitionManyStatus,
  TransitionManyParams,
} from './types.js';

export {
  availableTransitions,
  canTransition,
  createMachine,
  createSnapshot,
  defineTransition,
  transition,
} from './machine.js';
export { transitionMany, transitionManyFromParams } from './sequence.js';
