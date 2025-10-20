/**
 * Actor Model — Core actor behaviors and talent management
 */

import type { Actor, ActorScript, Behavior, Talent } from './types.js';

export type ActorFactory = {
  createActor: (script: ActorScript, goals: readonly string[]) => Actor;
  createBehavior: (name: string, mode: Behavior['mode'], plan: Behavior['plan']) => Behavior;
  createTalent: (name: string, behaviors: readonly Behavior[]) => Talent;
};

export const makeActorFactory = (): ActorFactory => {
  const createActor = (script: ActorScript, goals: readonly string[]): Actor => ({
    id: `actor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    script,
    goals,
  });

  const createBehavior = (
    name: string,
    mode: Behavior['mode'],
    plan: Behavior['plan'],
  ): Behavior => ({
    name,
    mode,
    plan,
  });

  const createTalent = (name: string, behaviors: readonly Behavior[]): Talent => ({
    name,
    behaviors,
  });

  return {
    createActor,
    createBehavior,
    createTalent,
  };
};
