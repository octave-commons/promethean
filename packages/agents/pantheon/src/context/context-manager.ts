/**
 * Context Manager implementation
 * Migrated from agent-context package with unified type system integration
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AgentContext,
  ContextEvent,
  ContextSnapshot,
  ContextManager as IContextManager,
  EventStore,
  SnapshotStore,
  UnifiedAgentContext
} from './types.js';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security.js';
import { ContextManagerHelpers } from './context-manager-helpers.js';

export class DefaultContextManager implements IContextManager {
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
      await ContextManagerHelpers.checkRateLimit(this.rateLimiter, validatedAgentId, 'getContext');

      // Try to get latest snapshot first
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(validatedAgentId);

      if (latestSnapshot) {
        return await ContextManagerHelpers.buildContextFromSnapshot(
          validatedAgentId,
          latestSnapshot,
          this.eventStore,
        );
      }

      // No snapshot exists, build from all events
      return await ContextManagerHelpers.buildContextFromEvents(validatedAgentId, this.eventStore);
    } catch (error) {
      ContextManagerHelpers.logSecurityError(agentId, 'getContext', error);
      throw error;
    }
  }

  async updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      await ContextManagerHelpers.checkRateLimit(
        this.rateLimiter,
        validatedAgentId,
        'updateContext',
      );

      const sanitizedUpdates = SecurityValidator.sanitizeObject(updates);
      const currentContext = await this.getContext(validatedAgentId);
      const nextVersion = this.getNextVersion(validatedAgentId, currentContext.version);

      const updatedContext = this.buildUpdatedContext(
        currentContext,
        validatedAgentId,
        sanitizedUpdates,
        nextVersion,
      );

      await this.createUpdateEvent(
        validatedAgentId,
        sanitizedUpdates,
        currentContext.version,
        updatedContext.version,
      );

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

  private getNextVersion(agentId: string, currentVersion: number): number {
    const storedVersion = this.versionCounters.get(agentId) || currentVersion;
    const nextVersion = storedVersion + 1;
    this.versionCounters.set(agentId, nextVersion);
    return nextVersion;
  }

  private buildUpdatedContext(
    currentContext: AgentContext,
    agentId: string,
    updates: unknown,
    version: number,
  ): AgentContext {
    return {
      ...currentContext,
      ...(updates as Partial<AgentContext>),
      id: currentContext.id,
      agentId,
      version,
      updatedAt: new Date(),
    };
  }

  private async createUpdateEvent(
    agentId: string,
    updates: unknown,
    previousVersion: number,
    newVersion: number,
  ): Promise<void> {
    await this.appendEvent({
      type: 'context_updated',
      agentId,
      data: SecurityValidator.validateEventData({
        updates,
        previousVersion,
        newVersion,
      }),
      metadata: {
        timestamp: new Date(),
      },
    });
  }

  async appendEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<ContextEvent> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(event.agentId);
      const validatedData = SecurityValidator.validateEventData(event.data);

      // Rate limiting
      await ContextManagerHelpers.checkRateLimit(this.rateLimiter, validatedAgentId, 'appendEvent');

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
      ContextManagerHelpers.logSecurityError(agentId, 'createSnapshot', error);
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
      ContextManagerHelpers.logSecurityError(snapshotId, 'restoreFromSnapshot', error);
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
      ContextManagerHelpers.logSecurityError(agentId, 'deleteContext', error);
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
      ContextManagerHelpers.logSecurityError(agentId, 'getContextHistory', error);
      throw error;
    }
  }

  // Enhanced methods for unified system integration
  async createUnifiedContext(agentId: string, initialState?: Record<string, any>): Promise<UnifiedAgentContext> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      
      const context: AgentContext = {
        id: uuidv4(),
        agentId: validatedAgentId,
        state: initialState || {},
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          initialState: true,
          unified: true
        }
      };

      // Create creation event
      await this.appendEvent({
        type: 'context_created',
        agentId: validatedAgentId,
        data: {
          initialState,
          version: 1
        }
      });

      return {
        ...context,
        agentId: validatedAgentId as any // Type conversion for unified system
      };
    } catch (error) {
      ContextManagerHelpers.logSecurityError(agentId, 'createUnifiedContext', error);
      throw error;
    }
  }

  async getContextStatistics(agentId: string): Promise<{
    totalEvents: number;
    totalSnapshots: number;
    lastActivity: Date;
    contextSize: number;
    version: number;
  }> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      
      const events = await this.eventStore.getEvents(validatedAgentId);
      const context = await this.getContext(validatedAgentId);
      
      return {
        totalEvents: events.length,
        totalSnapshots: Math.floor(context.version / this.snapshotInterval),
        lastActivity: events.length > 0 ? events[events.length - 1].timestamp : context.updatedAt,
        contextSize: ContextManagerHelpers.calculateContextSize(context),
        version: context.version
      };
    } catch (error) {
      ContextManagerHelpers.logSecurityError(agentId, 'getContextStatistics', error);
      throw error;
    }
  }

  async validateContextIntegrity(agentId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const context = await this.getContext(validatedAgentId);
      const issues: string[] = [];

      try {
        ContextManagerHelpers.validateContextIntegrity(context);
      } catch (error) {
        issues.push(error instanceof Error ? error.message : 'Unknown validation error');
      }

      // Check for version consistency
      const events = await this.eventStore.getEvents(validatedAgentId);
      const expectedVersion = events.filter(e => e.type === 'context_updated').length + 1;
      if (context.version !== expectedVersion) {
        issues.push(`Version mismatch: expected ${expectedVersion}, got ${context.version}`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export default DefaultContextManager;