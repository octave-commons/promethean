/**
 * Factories Module
 * Barrel export for all factory functions
 */

export {
  type LLMActorDependencies,
  type ToolActorDependencies,
  type CompositeActorDependencies,
  createLLMActorWithDependencies,
  createToolActorWithDependencies,
  createCompositeActorWithDependencies,
} from './actor-factory.js';
