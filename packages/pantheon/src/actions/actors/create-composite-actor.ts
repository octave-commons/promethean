/**
 * Create Composite Actor Action
 * Creates an actor script that coordinates multiple sub-actors
 */

import type {
  ActorScript,
  Behavior,
  Talent,
  Action,
  ContextSource,
} from '@promethean-os/pantheon-core';

export type CompositeActorConfig = {
  subActors: ActorScript[];
  coordinationMode?: 'sequential' | 'parallel' | 'conditional';
};

export type CreateCompositeActorInput = {
  name: string;
  config: CompositeActorConfig;
  contextSources?: ContextSource[];
};

export type CreateCompositeActorScope = {
  // No external dependencies needed for this action
};

type CoordinationMode = 'sequential' | 'parallel' | 'conditional';

const createSequentialActions = (
  goal: string,
  subActors: readonly ActorScript[],
  parentName: string,
): Action[] => {
  const spawnActions = subActors.map((subActor) => ({
    type: 'spawn' as const,
    actor: subActor,
    goal: `${goal} (as ${subActor.name})`,
    config: { parentActor: parentName },
  }));

  const waitActions = subActors.map(() => ({
    type: 'wait' as const,
    duration: 1000,
    reason: 'Wait for sub-actor execution' as const,
  }));

  // Interleave spawn and wait actions
  return spawnActions.flatMap((spawn, index) => [spawn, waitActions[index] ?? []]).flat();
};

const createParallelActions = (
  goal: string,
  subActors: readonly ActorScript[],
  parentName: string,
): Action[] => {
  return subActors.map((subActor) => ({
    type: 'spawn' as const,
    actor: subActor,
    goal: `${goal} (as ${subActor.name})`,
    config: { parentActor: parentName, parallel: true },
  }));
};

const createConditionalActions = (
  goal: string,
  subActors: readonly ActorScript[],
  parentName: string,
): Action[] => {
  // Simple conditional logic - spawn first sub-actor that matches goal keywords
  const matchingActor = subActors.find(
    (actor) =>
      actor.name.toLowerCase().includes(goal.toLowerCase()) ||
      goal.toLowerCase().includes(actor.name.toLowerCase()),
  );

  return matchingActor
    ? [
        {
          type: 'spawn' as const,
          actor: matchingActor,
          goal: `${goal} (as ${matchingActor.name})`,
          config: { parentActor: parentName },
        },
      ]
    : [];
};

const createCoordinationActions = (
  goal: string,
  subActors: readonly ActorScript[],
  coordinationMode: CoordinationMode,
  parentName: string,
): Action[] => {
  switch (coordinationMode) {
    case 'sequential':
      return createSequentialActions(goal, subActors, parentName);
    case 'parallel':
      return createParallelActions(goal, subActors, parentName);
    case 'conditional':
      return createConditionalActions(goal, subActors, parentName);
    default:
      return [];
  }
};

const createCoordinationBehavior = (config: CompositeActorConfig, parentName: string): Behavior => {
  const { subActors, coordinationMode = 'sequential' } = config;

  return {
    name: 'coordination',
    mode: 'persistent',
    description: 'Coordinate execution of sub-actors',
    plan: async ({ goal }) => {
      const actions = createCoordinationActions(goal, subActors, coordinationMode, parentName);
      return { actions };
    },
  };
};

const createCoordinationTalent = (config: CompositeActorConfig, parentName: string): Talent => {
  const behavior = createCoordinationBehavior(config, parentName);

  return {
    name: 'coordination',
    behaviors: [behavior],
    description: 'Coordination of multiple sub-actors',
  };
};

export const createCompositeActor = (
  input: CreateCompositeActorInput,
  _scope: CreateCompositeActorScope,
): ActorScript => {
  const { name, config, contextSources = [] } = input;
  const { subActors, coordinationMode = 'sequential' } = config;

  const talent = createCoordinationTalent(config, name);

  return {
    name,
    contextSources,
    talents: [talent],
    description: `Composite Actor with ${subActors.length} sub-actors`,
    config: { subActors, coordinationMode },
  };
};
