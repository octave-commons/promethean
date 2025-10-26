import type { ActorPort, Actor, ActorConfig } from './ports.js';

export function makeActorAdapter(): ActorPort {
  // In-memory storage for now - will integrate with agent-state later
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

      console.log(`Actor ${actorId} ticked at ${actor.lastTick}`);
    },

    async create(config: ActorConfig): Promise<string> {
      const id = `actor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const actor: Actor = {
        id,
        config,
        state: null,
        lastTick: Date.now(),
      };

      actors.set(id, actor);
      console.log(`Created actor ${id} with config:`, config);

      return id;
    },

    async get(id: string): Promise<Actor | null> {
      return actors.get(id) || null;
    },
  };
}
