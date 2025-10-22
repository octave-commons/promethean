/**
 * Functional Default Context Manager
 *
 * This file contains pure functional implementations of context management operations.
 * These were previously instance methods on DefaultContextManager class.
 */

import { v4 as uuidv4 } from 'uuid';

import {
  AgentContext,
  ContextEvent,
  ContextSnapshot,
  ContextManager,
  EventStore,
  SnapshotStore,
} from './types';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security';
import {
  checkRateLimit,
  buildContextFromSnapshot,
  buildContextFromEvents,
  logSecurityError,
} from './context-manager-helpers-functional';

// Context manager state interface
export interface ContextManagerState {
  versionCounters: Map<string, number>;
  rateLimiter: RateLimiter;
  eventStore: EventStore;
  snapshotStore: SnapshotStore;
  snapshotInterval: number;
}

// Create initial context manager state
export const createContextManagerState = (
  eventStore: EventStore,
  snapshotStore: SnapshotStore,
  snapshotInterval: number = 100,
): ContextManagerState => ({
  versionCounters: new Map(),
  rateLimiter: RateLimiter.getInstance('context-manager', 60000, 100),
  eventStore,
  snapshotStore,
  snapshotInterval,
});

// Get context for an agent
export const getContext = async (
  state: ContextManagerState,
  agentId: string,
): Promise<AgentContext> => {
  try {
    // Validate and sanitize input
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);

    // Rate limiting
    await checkRateLimit(state.rateLimiter, validatedAgentId, 'getContext');

    // Try to get latest snapshot first
    const latestSnapshot = await state.snapshotStore.getLatestSnapshot(validatedAgentId);

    if (latestSnapshot) {
      return await buildContextFromSnapshot(validatedAgentId, latestSnapshot, state.eventStore);
    }

    // No snapshot exists, build from all events
    return await buildContextFromEvents(validatedAgentId, state.eventStore);
  } catch (error) {
    logSecurityError(agentId, 'getContext', error);
    throw error;
  }
};

// Update context for an agent
export const updateContext = async (
  state: ContextManagerState,
  agentId: string,
  updates: Partial<AgentContext>,
): Promise<{ updatedContext: AgentContext; newState: ContextManagerState }> => {
  try {
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);

    await checkRateLimit(state.rateLimiter, validatedAgentId, 'updateContext');

    const sanitizedUpdates = SecurityValidator.sanitizeObject(updates);
    const currentContext = await getContext(state, validatedAgentId);
    const { nextVersion, newState: versionState } = getNextVersion(
      state,
      validatedAgentId,
      currentContext.version,
    );

    const updatedContext = buildUpdatedContext(
      currentContext,
      validatedAgentId,
      sanitizedUpdates,
      nextVersion,
    );

    await createUpdateEvent(
      state.eventStore,
      validatedAgentId,
      sanitizedUpdates,
      currentContext.version,
      updatedContext.version,
    );

    return { updatedContext, newState: versionState };
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
};

// Get next version number
export const getNextVersion = (
  state: ContextManagerState,
  agentId: string,
  currentVersion: number,
): { nextVersion: number; newState: ContextManagerState } => {
  const storedVersion = state.versionCounters.get(agentId) || currentVersion;
  const nextVersion = storedVersion + 1;

  const newVersionCounters = new Map(state.versionCounters);
  newVersionCounters.set(agentId, nextVersion);

  return {
    nextVersion,
    newState: { ...state, versionCounters: newVersionCounters },
  };
};

// Build updated context
export const buildUpdatedContext = (
  currentContext: AgentContext,
  agentId: string,
  updates: unknown,
  version: number,
): AgentContext => {
  return {
    ...currentContext,
    ...(updates as Partial<AgentContext>),
    id: currentContext.id,
    agentId,
    version,
    updatedAt: new Date(),
  };
};

// Create update event
export const createUpdateEvent = async (
  eventStore: EventStore,
  agentId: string,
  updates: unknown,
  previousVersion: number,
  newVersion: number,
): Promise<void> => {
  const event: Omit<ContextEvent, 'id' | 'timestamp'> = {
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
  };

  await appendEventToStore(eventStore, event);
};

// Append event to store
export const appendEventToStore = async (
  eventStore: EventStore,
  event: Omit<ContextEvent, 'id' | 'timestamp'>,
): Promise<ContextEvent> => {
  // Validate and sanitize input
  const validatedAgentId = SecurityValidator.validateAgentId(event.agentId);
  const validatedData = SecurityValidator.validateEventData(event.data);

  const fullEvent: ContextEvent = {
    ...event,
    agentId: validatedAgentId,
    data: validatedData,
    id: uuidv4(),
    timestamp: new Date(),
  };

  await eventStore.appendEvent(fullEvent);
  return fullEvent;
};

// Append event with snapshot management
export const appendEvent = async (
  state: ContextManagerState,
  event: Omit<ContextEvent, 'id' | 'timestamp'>,
): Promise<{ event: ContextEvent; shouldSnapshot: boolean }> => {
  try {
    // Validate and sanitize input
    const validatedAgentId = SecurityValidator.validateAgentId(event.agentId);
    const validatedData = SecurityValidator.validateEventData(event.data);

    // Rate limiting
    await checkRateLimit(state.rateLimiter, validatedAgentId, 'appendEvent');

    const fullEvent: ContextEvent = {
      ...event,
      agentId: validatedAgentId,
      data: validatedData,
      id: uuidv4(),
      timestamp: new Date(),
    };

    await state.eventStore.appendEvent(fullEvent);

    // Check if we should create a snapshot
    const currentContext = await getContext(state, validatedAgentId);
    const shouldSnapshot = currentContext.version % state.snapshotInterval === 0;

    return { event: fullEvent, shouldSnapshot };
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
};

// Create snapshot
export const createSnapshot = async (
  state: ContextManagerState,
  agentId: string,
): Promise<ContextSnapshot> => {
  try {
    // Validate and sanitize input
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);

    const context = await getContext(state, validatedAgentId);
    const latestEvent = await state.eventStore.getEvents(validatedAgentId);
    const lastEvent = latestEvent[latestEvent.length - 1];

    const snapshot: ContextSnapshot = {
      id: uuidv4(),
      agentId: validatedAgentId,
      timestamp: new Date(),
      state: SecurityValidator.sanitizeObject(context.state) as Record<string, unknown>,
      version: context.version,
      eventId: lastEvent?.id || uuidv4(),
    };

    await state.snapshotStore.saveSnapshot(snapshot);
    return snapshot;
  } catch (error) {
    logSecurityError(agentId, 'createSnapshot', error);
    throw error;
  }
};

// Restore from snapshot
export const restoreFromSnapshot = async (
  state: ContextManagerState,
  snapshotId: string,
): Promise<AgentContext> => {
  try {
    // Validate and sanitize input
    const validatedSnapshotId = SecurityValidator.validateSnapshotId(snapshotId);

    const snapshot = await state.snapshotStore.getSnapshot(validatedSnapshotId);
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
    logSecurityError(snapshotId, 'restoreFromSnapshot', error);
    throw error;
  }
};

// Delete context
export const deleteContext = async (state: ContextManagerState, agentId: string): Promise<void> => {
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
    await appendEvent(state, {
      type: 'context_deleted',
      agentId: validatedAgentId,
      data: {
        deletedAt: new Date(),
        deletedBy: 'system',
      },
    });
  } catch (error) {
    logSecurityError(agentId, 'deleteContext', error);
    throw error;
  }
};

// Get context history
export const getContextHistory = async (
  state: ContextManagerState,
  agentId: string,
  limit?: number,
): Promise<ContextEvent[]> => {
  try {
    // Validate and sanitize input
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);

    const events = await state.eventStore.getEvents(validatedAgentId);
    return limit ? events.slice(-limit) : events;
  } catch (error) {
    logSecurityError(agentId, 'getContextHistory', error);
    throw error;
  }
};
