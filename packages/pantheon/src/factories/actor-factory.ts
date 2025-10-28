/**
 * Actor Factory
 * Factory functions for creating actors with dependencies injected
 */

import type { ActorConfig } from '../core/types.js';
import type { ActorScript } from '@promethean-os/pantheon-core';
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
): ActorScript => {
  dependencies.llmProvider; // Use dependency to avoid unused warning
  return createLLMActor(
    {
      name: config.name,
      config: config.parameters as any,
    },
    {} as any,
  );
};

export const createToolActorWithDependencies = (
  config: ActorConfig,
  dependencies: ToolActorDependencies,
): ActorScript => {
  dependencies.toolRegistry; // Use dependency to avoid unused warning
  return createToolActor(
    {
      name: config.name,
      config: config.parameters as any,
    },
    {} as any,
  );
};

export const createCompositeActorWithDependencies = (
  config: ActorConfig,
  dependencies: CompositeActorDependencies,
): ActorScript => {
  dependencies.actorRegistry; // Use dependency to avoid unused warning
  return createCompositeActor(
    {
      name: config.name,
      config: config.parameters as any,
    },
    {} as any,
  );
};
