/**
 * Agent Coordination System Types
 *
 * Unified type system for agent instance management, task assignment,
 * and real-time coordination in the Promethean Agent OS.
 *
 * We only expose the base agent instance primitives at the top level to
 * avoid duplicate symbol collisions across the more specialized modules.
 * Use the exported namespaces for the full surface area.
 */

// Agent instance management types
export * from './agent-instance.js';

export * as CoordinationTypes from './coordination.js';
export * as TaskAssignmentTypes from './task-assignment.js';
export * as EnsoIntegrationTypes from './enso-integration.js';
export * as KanbanIntegrationTypes from './kanban-integration.js';
