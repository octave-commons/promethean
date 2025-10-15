import {
  AgentContext,
  ContextEvent,
  ContextSnapshot,
  ContextManager,
  EventStore,
  SnapshotStore,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class DefaultContextManager implements ContextManager {
  private versionCounters: Map<string, number> = new Map();

  constructor(
    private eventStore: EventStore,
    private snapshotStore: SnapshotStore,
    private snapshotInterval: number = 100, // Create snapshot every 100 events
  ) {}

  async getContext(agentId: string): Promise<AgentContext> {
    if (!agentId || agentId.trim() === '') {
      throw new Error('Agent ID cannot be empty');
    }

    // Try to get latest snapshot first
    const latestSnapshot = await this.snapshotStore.getLatestSnapshot(agentId);

    if (latestSnapshot) {
      // Get events since snapshot
      const eventsSinceSnapshot = await this.eventStore.getEvents(
        agentId,
        latestSnapshot.version + 1,
      );

      // Apply events to snapshot state
      const currentState = this.applyEventsToState(latestSnapshot.state, eventsSinceSnapshot);

      return {
        id: uuidv4(),
        agentId,
        state: currentState,
        version: latestSnapshot.version + eventsSinceSnapshot.length,
        createdAt: latestSnapshot.timestamp,
        updatedAt: new Date(),
        metadata: {
          snapshotId: latestSnapshot.id,
          eventsSinceSnapshot: eventsSinceSnapshot.length,
        },
      };
    }

    // No snapshot exists, build from all events
    const allEvents = await this.eventStore.getEvents(agentId);
    const initialState = {};
    const currentState = this.applyEventsToState(initialState, allEvents);

    return {
      id: uuidv4(),
      agentId,
      state: currentState,
      version: allEvents.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalEvents: allEvents.length,
      },
    };
  }

  async updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext> {
    if (!agentId || agentId.trim() === '') {
      throw new Error('Agent ID cannot be empty');
    }

    const currentContext = await this.getContext(agentId);

    // Get next version number (handles concurrent updates)
    const currentVersion = this.versionCounters.get(agentId) || currentContext.version;
    const nextVersion = currentVersion + 1;
    this.versionCounters.set(agentId, nextVersion);

    const updatedContext: AgentContext = {
      ...currentContext,
      ...updates,
      id: currentContext.id, // Preserve original ID
      agentId, // Preserve agent ID
      version: nextVersion,
      updatedAt: new Date(),
    };

    // Create an event for this update
    await this.appendEvent({
      type: 'context_updated',
      agentId,
      data: {
        updates,
        previousVersion: currentContext.version,
        newVersion: updatedContext.version,
      },
      metadata: {
        timestamp: new Date(),
      },
    });

    return updatedContext;
  }

  async appendEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<ContextEvent> {
    const fullEvent: ContextEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date(),
    };

    await this.eventStore.appendEvent(fullEvent);

    // Check if we should create a snapshot
    const currentContext = await this.getContext(event.agentId);
    if (currentContext.version % this.snapshotInterval === 0) {
      await this.createSnapshot(event.agentId);
    }

    return fullEvent;
  }

  async createSnapshot(agentId: string): Promise<ContextSnapshot> {
    const context = await this.getContext(agentId);
    const latestEvent = await this.eventStore.getEvents(agentId);
    const lastEvent = latestEvent[latestEvent.length - 1];

    const snapshot: ContextSnapshot = {
      id: uuidv4(),
      agentId,
      timestamp: new Date(),
      state: context.state,
      version: context.version,
      eventId: lastEvent?.id || uuidv4(),
    };

    await this.snapshotStore.saveSnapshot(snapshot);
    return snapshot;
  }

  async restoreFromSnapshot(snapshotId: string): Promise<AgentContext> {
    const snapshot = await this.snapshotStore.getSnapshot(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    return {
      id: uuidv4(),
      agentId: snapshot.agentId,
      state: snapshot.state,
      version: snapshot.version,
      createdAt: snapshot.timestamp,
      updatedAt: new Date(),
      metadata: {
        restoredFromSnapshot: snapshotId,
        originalSnapshotTime: snapshot.timestamp,
      },
    };
  }

  private applyEventsToState(initialState: any, events: ContextEvent[]): any {
    return events.reduce((state, event) => {
      switch (event.type) {
        case 'context_updated':
          // If updates has a 'state' property, merge that, otherwise merge the whole updates
          if (event.data.updates && event.data.updates.state) {
            return { ...state, ...event.data.updates.state };
          }
          return { ...state, ...event.data.updates };
        case 'state_set':
          return { ...state, ...event.data };
        case 'state_delete':
          const newState = { ...state };
          delete newState[event.data.key];
          return newState;
        default:
          return state;
      }
    }, initialState);
  }

  async deleteContext(agentId: string): Promise<void> {
    // In a real implementation, you might want to soft delete
    // For now, we'll create a deletion event
    await this.appendEvent({
      type: 'context_deleted',
      agentId,
      data: {
        deletedAt: new Date(),
        deletedBy: 'system',
      },
    });
  }

  async getContextHistory(agentId: string, limit?: number): Promise<ContextEvent[]> {
    const events = await this.eventStore.getEvents(agentId);
    return limit ? events.slice(-limit) : events;
  }
}
