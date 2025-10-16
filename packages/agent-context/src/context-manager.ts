import {
  AgentContext,
  ContextEvent,
  ContextSnapshot,
  ContextManager,
  EventStore,
  SnapshotStore,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security';

export class DefaultContextManager implements ContextManager {
  private versionCounters: Map<string, number> = new Map();
  private rateLimiter: RateLimiter;

  constructor(
    private eventStore: EventStore,
    private snapshotStore: SnapshotStore,
    private snapshotInterval: number = 100, // Create snapshot every 100 events
  ) {
    this.rateLimiter = RateLimiter.getInstance('context-manager', 60000, 100);
  }

  async getContext(agentId: string): Promise<AgentContext> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`getContext:${validatedAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'getContext',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Try to get latest snapshot first
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(validatedAgentId);

      if (latestSnapshot) {
        // Get events since snapshot
        const eventsSinceSnapshot = await this.eventStore.getEvents(
          validatedAgentId,
          latestSnapshot.version + 1,
        );

        // Apply events to snapshot state
        const currentState = this.applyEventsToState(latestSnapshot.state, eventsSinceSnapshot);

        return {
          id: uuidv4(),
          agentId: validatedAgentId,
          state: currentState as Record<string, unknown>,
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
      const allEvents = await this.eventStore.getEvents(validatedAgentId);
      const initialState = {};
      const currentState = this.applyEventsToState(initialState, allEvents);

      return {
        id: uuidv4(),
        agentId: validatedAgentId,
        state: currentState as Record<string, unknown>,
        version: allEvents.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          totalEvents: allEvents.length,
        },
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getContext',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`updateContext:${validatedAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'updateContext',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Validate and sanitize updates
      const sanitizedUpdates = SecurityValidator.sanitizeObject(updates);

      const currentContext = await this.getContext(validatedAgentId);

      // Get next version number (handles concurrent updates)
      const currentVersion = this.versionCounters.get(validatedAgentId) || currentContext.version;
      const nextVersion = currentVersion + 1;
      this.versionCounters.set(validatedAgentId, nextVersion);

      const updatedContext: AgentContext = {
        ...currentContext,
        ...(sanitizedUpdates as Partial<AgentContext>),
        id: currentContext.id, // Preserve original ID
        agentId: validatedAgentId, // Preserve agent ID
        version: nextVersion,
        updatedAt: new Date(),
      };

      // Create an event for this update
      await this.appendEvent({
        type: 'context_updated',
        agentId: validatedAgentId,
        data: SecurityValidator.validateEventData({
          updates: sanitizedUpdates,
          previousVersion: currentContext.version,
          newVersion: updatedContext.version,
        }),
        metadata: {
          timestamp: new Date(),
        },
      });

      return updatedContext;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'updateContext',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async appendEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<ContextEvent> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(event.agentId);
      const validatedData = SecurityValidator.validateEventData(event.data);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`appendEvent:${validatedAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'appendEvent',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const fullEvent: ContextEvent = {
        ...event,
        agentId: validatedAgentId,
        data: validatedData,
        id: uuidv4(),
        timestamp: new Date(),
      };

      await this.eventStore.appendEvent(fullEvent);

      // Check if we should create a snapshot
      const currentContext = await this.getContext(validatedAgentId);
      if (currentContext.version % this.snapshotInterval === 0) {
        await this.createSnapshot(validatedAgentId);
      }

      return fullEvent;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: event.agentId,
        action: 'appendEvent',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async createSnapshot(agentId: string): Promise<ContextSnapshot> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const context = await this.getContext(validatedAgentId);
      const latestEvent = await this.eventStore.getEvents(validatedAgentId);
      const lastEvent = latestEvent[latestEvent.length - 1];

      const snapshot: ContextSnapshot = {
        id: uuidv4(),
        agentId: validatedAgentId,
        timestamp: new Date(),
        state: SecurityValidator.sanitizeObject(context.state) as Record<string, unknown>,
        version: context.version,
        eventId: lastEvent?.id || uuidv4(),
      };

      await this.snapshotStore.saveSnapshot(snapshot);
      return snapshot;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'createSnapshot',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async restoreFromSnapshot(snapshotId: string): Promise<AgentContext> {
    try {
      // Validate and sanitize input
      const validatedSnapshotId = SecurityValidator.validateSnapshotId(snapshotId);

      const snapshot = await this.snapshotStore.getSnapshot(validatedSnapshotId);
      if (!snapshot) {
        SecurityLogger.log({
          type: 'data_access',
          severity: 'medium',
          action: 'restoreFromSnapshot',
          details: { snapshotId: validatedSnapshotId, reason: 'Snapshot not found' },
        });
        throw new Error(`Snapshot not found: ${validatedSnapshotId}`);
      }

      return {
        id: uuidv4(),
        agentId: snapshot.agentId,
        state: SecurityValidator.sanitizeObject(snapshot.state) as Record<string, unknown>,
        version: snapshot.version,
        createdAt: snapshot.timestamp,
        updatedAt: new Date(),
        metadata: {
          restoredFromSnapshot: validatedSnapshotId,
          originalSnapshotTime: snapshot.timestamp,
        },
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'restoreFromSnapshot',
        details: {
          snapshotId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  private applyEventsToState(initialState: unknown, events: ContextEvent[]): unknown {
    try {
      return events.reduce(
        (state: Record<string, unknown>, event) => {
          // Validate event data before applying
          const validatedData = SecurityValidator.validateEventData(event.data);

          switch (event.type) {
            case 'context_updated':
              // If updates has a 'state' property, merge that, otherwise merge the whole updates
              if (validatedData.updates && (validatedData.updates as any).state) {
                return { ...state, ...(validatedData.updates as any).state };
              }
              return { ...state, ...(validatedData.updates as Record<string, unknown>) };
            case 'state_set':
              return { ...state, ...(validatedData as Record<string, unknown>) };
            case 'state_delete':
              const newState = { ...state };
              delete newState[(validatedData as any).key];
              return newState;
            default:
              return state;
          }
        },
        initialState as Record<string, unknown>,
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'input_validation',
        severity: 'high',
        action: 'applyEventsToState',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async deleteContext(agentId: string): Promise<void> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: validatedAgentId,
        action: 'deleteContext',
        details: { initiated: true },
      });

      // In a real implementation, you might want to soft delete
      // For now, we'll create a deletion event
      await this.appendEvent({
        type: 'context_deleted',
        agentId: validatedAgentId,
        data: {
          deletedAt: new Date(),
          deletedBy: 'system',
        },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'deleteContext',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async getContextHistory(agentId: string, limit?: number): Promise<ContextEvent[]> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const events = await this.eventStore.getEvents(validatedAgentId);
      return limit ? events.slice(-limit) : events;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getContextHistory',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
