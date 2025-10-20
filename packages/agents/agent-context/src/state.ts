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
  ContextManager,
  AgentContext,
  ContextEvent,
  ContextSnapshot,
} from './types.js';

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
