// Data Structures and Systems Package
// Exports all core data structures and system utilities

// Binary Search Tree
export * from './bst.js';

// Entity Component System (core)
export * from './ecs.js';

// ECS Prefab system
export * from './ecs.prefab.js';

// ECS Scheduler - export types and values separately
export type {
    Stage,
    ResourceName,
    SystemContext,
    QuerySpec,
    CompiledSystem,
    Batch,
    SchedulePlan,
} from './ecs.scheduler.js';

// Export values
export { DEFAULT_STAGE_ORDER, ResourceBag, Scheduler } from './ecs.scheduler.js';

// Rename SystemSpec from scheduler to avoid conflict
export type { SystemSpec as SchedulerSystemSpec } from './ecs.scheduler.js';

// Graph data structures
export * from './graph.js';

// System utilities
export * from './system.js';
