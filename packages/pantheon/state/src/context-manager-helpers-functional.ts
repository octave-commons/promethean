/**
 * Functional Context Manager Helpers
 *
 * This file contains pure functional implementations of context management utilities.
 * These were previously static methods on ContextManagerHelpers class.
 */

import { AgentContext, ContextEvent, ContextSnapshot, EventStore } from './types.js';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security.js';
import { v4 as uuidv4 } from 'uuid';

// Rate limiting
export const checkRateLimit = async (
  rateLimiter: RateLimiter,
  agentId: string,
  action: string,
): Promise<void> => {
  if (!rateLimiter.isAllowed(`${action}:${agentId}`)) {
    SecurityLogger.log({
      type: 'rate_limit',
      severity: 'medium',
      agentId,
      action,
      details: { reason: 'Rate limit exceeded' },
    });
    throw new Error('Rate limit exceeded. Please try again later.');
  }
};

// Context building from snapshots
export const buildContextFromSnapshot = async (
  agentId: string,
  snapshot: ContextSnapshot,
  eventStore: EventStore,
): Promise<AgentContext> => {
  // Get events since snapshot
  const eventsSinceSnapshot = await eventStore.getEvents(agentId, snapshot.version + 1);

  // Apply events to snapshot state
  const currentState = applyEventsToState(snapshot.state, eventsSinceSnapshot);

  return {
    id: uuidv4(),
    agentId,
    state: currentState as Record<string, unknown>,
    version: snapshot.version + eventsSinceSnapshot.length,
    createdAt: snapshot.timestamp,
    updatedAt: new Date(),
    metadata: {
      snapshotId: snapshot.id,
      eventsSinceSnapshot: eventsSinceSnapshot.length,
    },
  };
};

// Context building from events
export const buildContextFromEvents = async (
  agentId: string,
  eventStore: EventStore,
): Promise<AgentContext> => {
  // No snapshot exists, build from all events
  const allEvents = await eventStore.getEvents(agentId);
  const initialState = {};
  const currentState = applyEventsToState(initialState, allEvents);

  return {
    id: uuidv4(),
    agentId,
    state: currentState as Record<string, unknown>,
    version: allEvents.length,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      totalEvents: allEvents.length,
    },
  };
};

// Event application to state
export const applyEventsToState = (initialState: unknown, events: ContextEvent[]): unknown => {
  try {
    return events.reduce(
      (state: Record<string, unknown>, event) => {
        // Validate event data before applying
        const validatedData = SecurityValidator.validateEventData(event.data);

        switch (event.type) {
          case 'context_updated':
            // If updates has a 'state' property, merge that, otherwise merge whole updates
            if (
              validatedData.updates &&
              typeof validatedData.updates === 'object' &&
              (validatedData.updates as any).state
            ) {
              return { ...state, ...(validatedData.updates as any).state };
            }
            return { ...state, ...(validatedData.updates as Record<string, unknown>) };
          case 'state_set':
            return { ...state, ...(validatedData as Record<string, unknown>) };
          case 'state_delete':
            const newState = { ...state };
            if (validatedData && typeof validatedData === 'object' && (validatedData as any).key) {
              delete newState[(validatedData as any).key];
            }
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
};

// Security error logging
export const logSecurityError = (agentId: string, action: string, error: unknown): void => {
  SecurityLogger.log({
    type: 'data_access',
    severity: 'medium',
    agentId,
    action,
    details: { error: error instanceof Error ? error.message : 'Unknown error' },
  });
};
