/**
 * Functional factory for agent state management
 *
 * This package manages AGENT STATE via event sourcing, not conversation context.
 * For LLM conversation compilation, use @promethean/persistence makeContextStore.
 */

import { DefaultContextManager } from './context-manager.js';
import type {
  EventStore,
  SnapshotStore,
  AgentContext,
  ContextEvent,
  ContextSnapshot,
} from './types.js';

// Pantheon compatibility types
export type Actor = {
  id: string;
  script: {
    name: string;
    roleName?: string;
    contextSources: readonly { id: string; label: string; where?: Record<string, unknown> }[];
    talents: readonly {
      name: string;
      behaviors: readonly {
        name: string;
        mode: 'active' | 'passive' | 'persistent';
        plan: (input: { goal: string; context: any[] }) => Promise<{ actions: any[] }>;
      }[];
    }[];
    program?: string;
  };
  goals: readonly string[];
};

export type ActorScript = Actor['script'];

export type ActorStatePort = {
  spawn: (script: ActorScript, goal: string) => Promise<Actor>;
  list: () => Promise<Actor[]>;
  get: (id: string) => Promise<Actor | null>;
  update: (id: string, updates: Partial<Actor>) => Promise<Actor>;
};

export type AgentStateDeps = {
  eventStore: EventStore;
  snapshotStore: SnapshotStore;
  snapshotInterval?: number;
};

export type AgentStateManager = {
  getContext(agentId: string): Promise<AgentContext>;
  updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext>;
  appendEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<ContextEvent>;
  createSnapshot(agentId: string): Promise<ContextSnapshot>;
  restoreFromSnapshot(snapshotId: string): Promise<AgentContext>;
  deleteContext(agentId: string): Promise<void>;
  getContextHistory(agentId: string, limit?: number): Promise<ContextEvent[]>;
};

/**
 * Create an agent state manager using functional dependency injection
 *
 * @param deps - Dependencies including event store, snapshot store, and optional snapshot interval
 * @returns Agent state manager with pure functions
 */
export const makeAgentStateManager = (deps: AgentStateDeps): AgentStateManager => {
  const manager = new DefaultContextManager(
    deps.eventStore,
    deps.snapshotStore,
    deps.snapshotInterval,
  );

  return {
    getContext: manager.getContext.bind(manager),
    updateContext: manager.updateContext.bind(manager),
    appendEvent: manager.appendEvent.bind(manager),
    createSnapshot: manager.createSnapshot.bind(manager),
    restoreFromSnapshot: manager.restoreFromSnapshot.bind(manager),
    deleteContext: manager.deleteContext.bind(manager),
    getContextHistory: manager.getContextHistory.bind(manager),
  };
};

/**
 * Create an ActorStatePort adapter for Pantheon compatibility
 *
 * @param deps - Agent state dependencies
 * @returns ActorStatePort implementation
 */
export const makeActorStatePort = (deps: AgentStateDeps): ActorStatePort => {
  const manager = makeAgentStateManager(deps);

  return {
    spawn: async (script: ActorScript, goal: string): Promise<Actor> => {
      const actor: Actor = {
        id: `actor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        script,
        goals: [goal],
      };

      // Store actor in agent context state for persistence
      await manager.updateContext(actor.id, {
        state: {
          actorId: actor.id,
          script: actor.script,
          goals: actor.goals,
          type: 'actor',
        },
      });

      return actor;
    },

    list: async (): Promise<Actor[]> => {
      // This would need to be implemented based on the actual storage structure
      // For now, return empty array as placeholder
      console.warn('ActorStatePort.list() not fully implemented - needs indexing');
      return [];
    },

    get: async (id: string): Promise<Actor | null> => {
      try {
        const context = await manager.getContext(id);
        if (context.state?.type === 'actor' && context.state?.script && context.state?.goals) {
          return {
            id: context.agentId,
            script: context.state.script as ActorScript,
            goals: context.state.goals as string[],
          };
        }
        return null;
      } catch {
        return null;
      }
    },

    update: async (id: string, updates: Partial<Actor>): Promise<Actor> => {
      const current = await manager.getContext(id);
      const updatedState = {
        ...current.state,
        ...updates,
        type: 'actor' as const,
      };

      const updated = await manager.updateContext(id, {
        state: updatedState,
      });

      return {
        id: updated.agentId,
        script: updated.state!.script as ActorScript,
        goals: updated.state!.goals as string[],
      };
    },
  };
};
