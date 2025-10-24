import {
  AgentContext,
  ContextEvent,
  ContextSnapshot,
  ContextManager,
  EventStore,
  SnapshotStore,
} from './types.js';

// Import functional implementations
import {
  createContextManagerState,
  getContext as getContextFn,
  updateContext as updateContextFn,
  appendEvent as appendEventFn,
  createSnapshot as createSnapshotFn,
  restoreFromSnapshot as restoreFromSnapshotFn,
  deleteContext as deleteContextFn,
  getContextHistory as getContextHistoryFn,
  ContextManagerState,
} from './default-context-manager-functional.js';

/**
 * @deprecated Use the functional implementations from './default-context-manager-functional' instead.
 * This class is provided for backward compatibility and will be removed in a future version.
 */
export class DefaultContextManager implements ContextManager {
  private state: ContextManagerState;

  constructor(
    eventStore: EventStore,
    snapshotStore: SnapshotStore,
    snapshotInterval: number = 100, // Create snapshot every 100 events
  ) {
    this.state = createContextManagerState(eventStore, snapshotStore, snapshotInterval);
  }

  async getContext(agentId: string): Promise<AgentContext> {
    console.warn(
      'DefaultContextManager.getContext is deprecated. Use getContext from default-context-manager-functional instead.',
    );
    return getContextFn(this.state, agentId);
  }

  async updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext> {
    console.warn(
      'DefaultContextManager.updateContext is deprecated. Use updateContext from default-context-manager-functional instead.',
    );
    const result = await updateContextFn(this.state, agentId, updates);
    this.state = result.newState;
    return result.updatedContext;
  }

  async appendEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<ContextEvent> {
    console.warn(
      'DefaultContextManager.appendEvent is deprecated. Use appendEvent from default-context-manager-functional instead.',
    );
    const result = await appendEventFn(this.state, event);

    // Create snapshot if needed
    if (result.shouldSnapshot) {
      await createSnapshotFn(this.state, event.agentId);
    }

    return result.event;
  }

  async createSnapshot(agentId: string): Promise<ContextSnapshot> {
    console.warn(
      'DefaultContextManager.createSnapshot is deprecated. Use createSnapshot from default-context-manager-functional instead.',
    );
    return createSnapshotFn(this.state, agentId);
  }

  async restoreFromSnapshot(snapshotId: string): Promise<AgentContext> {
    console.warn(
      'DefaultContextManager.restoreFromSnapshot is deprecated. Use restoreFromSnapshot from default-context-manager-functional instead.',
    );
    return restoreFromSnapshotFn(this.state, snapshotId);
  }

  async deleteContext(agentId: string): Promise<void> {
    console.warn(
      'DefaultContextManager.deleteContext is deprecated. Use deleteContext from default-context-manager-functional instead.',
    );
    return deleteContextFn(this.state, agentId);
  }

  async getContextHistory(agentId: string, limit?: number): Promise<ContextEvent[]> {
    console.warn(
      'DefaultContextManager.getContextHistory is deprecated. Use getContextHistory from default-context-manager-functional instead.',
    );
    return getContextHistoryFn(this.state, agentId, limit);
  }
}
