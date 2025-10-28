/**
 * Actor Factory
 * Factory functions for creating actors with dependencies injected
 */

import type { Actor, ActorConfig } from '../core/types.js';
import { createLLMActor } from '../actions/actors/create-llm-actor.js';
import { createToolActor } from '../actions/actors/create-tool-actor.js';
import { createCompositeActor } from '../actions/actors/create-composite-actor.js';

// Factory interfaces for dependency injection
export interface LLMActorDependencies {
  llmProvider: unknown;
  logger?: unknown;
}

export interface ToolActorDependencies {
  toolRegistry: unknown;
  logger?: unknown;
}

export interface CompositeActorDependencies {
  actorRegistry: unknown;
  logger?: unknown;
}

// Factory functions
export const createLLMActorWithDependencies = (
  config: ActorConfig,
  dependencies: LLMActorDependencies,
): Actor => {
  return createLLMActor({
    config,
    llmProvider: dependencies.llmProvider,
    logger: dependencies.logger,
  });
};

export const createToolActorWithDependencies = (
  config: ActorConfig,
  dependencies: ToolActorDependencies,
): Actor => {
  return createToolActor({
    config,
    toolRegistry: dependencies.toolRegistry,
    logger: dependencies.logger,
  });
};

export const createCompositeActorWithDependencies = (
  config: ActorConfig,
  dependencies: CompositeActorDependencies,
): Actor => {
  return createCompositeActor({
    config,
    actorRegistry: dependencies.actorRegistry,
    logger: dependencies.logger,
  });
};
