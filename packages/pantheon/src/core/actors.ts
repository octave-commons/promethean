import type { ActorPort, Actor, ActorConfig } from './ports.js';
import { makeAgentStateManager, type ActorStatePort } from '@promethean/agent-state';

export function makeActorAdapter(): ActorPort {
  // Create agent state manager for persistent actor storage
  const actorState = makeAgentStateManager({
    // Default dependencies - in real implementation these would be injected
    eventStore: null as any, // Would be real event store
    snapshotStore: null as any, // Would be real snapshot store
  });

  // In-memory cache for fast access
  const actors = new Map<string, Actor>();

  return {
    async tick(actorId: string): Promise<void> {
      // Try cache first
      let actor = actors.get(actorId);

      if (!actor) {
        // Load from persistent store
        actor = await actorState.getActor(actorId);
        if (!actor) {
          throw new Error(`Actor ${actorId} not found`);
        }
        actors.set(actorId, actor);
      }

      // Update actor state
      actor.lastTick = Date.now();

      // Save to both cache and persistent store
      actors.set(actorId, actor);
      await actorState.saveActor(actor);
    },

    async create(config: ActorConfig): Promise<string> {
      const id = `actor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const actor: Actor = {
        id,
        config,
        state: null,
        lastTick: Date.now(),
      };

      // Save to both cache and persistent store
      actors.set(id, actor);
      await actorState.saveActor(actor);

      return id;
    },

    async get(id: string): Promise<Actor | null> {
      // Try cache first
      let actor = actors.get(id);

      if (!actor) {
        // Load from persistent store
        actor = await actorState.getActor(id);
        if (actor) {
          actors.set(id, actor);
        }
      }

      return actor || null;
    },
  };
}
