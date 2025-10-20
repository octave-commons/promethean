import type { ActorPort, Actor, ActorConfig } from './ports.js';

export function makeActorAdapter(): ActorPort {
  const actors = new Map<string, Actor>();

  return {
    async tick(actorId: string): Promise<void> {
      const actor = actors.get(actorId);
      if (!actor) {
        throw new Error(`Actor ${actorId} not found`);
      }

      // Simple tick implementation - update last tick time
      actor.lastTick = Date.now();
      actors.set(actorId, actor);
    },

    async create(config: ActorConfig): Promise<string> {
      const id = `actor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const actor: Actor = {
        id,
        config,
        state: null,
        lastTick: Date.now(),
      };

      actors.set(id, actor);
      return id;
    },

    async get(id: string): Promise<Actor | null> {
      return actors.get(id) || null;
    },
  };
}
