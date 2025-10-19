/**
 * Helper utilities for context management
 * Migrated from agent-context package
 */

import { v4 as uuidv4 } from 'uuid';
import type { AgentContext, ContextEvent, ContextSnapshot, EventStore } from './types.js';
import { SecurityLogger, RateLimiter } from './security.js';

export class ContextManagerHelpers {
  static async checkRateLimit(
    rateLimiter: RateLimiter,
    identifier: string,
    action: string
  ): Promise<void> {
    try {
      await rateLimiter.checkLimit(`${identifier}:${action}`);
    } catch (error) {
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        agentId: identifier,
        action,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  static async buildContextFromSnapshot(
    agentId: string,
    snapshot: ContextSnapshot,
    eventStore: EventStore
  ): Promise<AgentContext> {
    try {
      // Get events that occurred after the snapshot
      const eventsAfterSnapshot = await eventStore.getEvents(agentId, snapshot.version);

      // Start with snapshot state
      let state = { ...snapshot.state };
      let version = snapshot.version;

      // Apply events in order
      for (const event of eventsAfterSnapshot) {
        if (event.type === 'context_updated' && event.data.updates) {
          state = { ...state, ...event.data.updates };
          version = event.data.newVersion || version + 1;
        }
      }

      return {
        id: uuidv4(),
        agentId,
        state,
        version,
        createdAt: snapshot.timestamp,
        updatedAt: new Date(),
        metadata: {
          restoredFromSnapshot: snapshot.id,
          originalSnapshotTime: snapshot.timestamp,
          eventsApplied: eventsAfterSnapshot.length
        }
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'buildContextFromSnapshot',
        details: { 
          snapshotId: snapshot.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  static async buildContextFromEvents(
    agentId: string,
    eventStore: EventStore
  ): Promise<AgentContext> {
    try {
      const events = await eventStore.getEvents(agentId);
      
      if (events.length === 0) {
        // No events exist, create initial context
        return {
          id: uuidv4(),
          agentId,
          state: {},
          version: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            initialState: true
          }
        };
      }

      // Build context by applying events in order
      let state: Record<string, any> = {};
      let version = 0;
      let createdAt = events[0].timestamp;

      for (const event of events) {
        if (event.type === 'context_created') {
          state = event.data.initialState || {};
          version = 1;
          createdAt = event.timestamp;
        } else if (event.type === 'context_updated' && event.data.updates) {
          state = { ...state, ...event.data.updates };
          version = event.data.newVersion || version + 1;
        }
      }

      return {
        id: uuidv4(),
        agentId,
        state,
        version,
        createdAt,
        updatedAt: new Date(),
        metadata: {
          builtFromEvents: true,
          totalEvents: events.length
        }
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'buildContextFromEvents',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  static logSecurityError(identifier: string, action: string, error: unknown): void {
    SecurityLogger.log({
      type: 'data_access',
      severity: 'high',
      agentId: identifier,
      action,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }

  static validateContextIntegrity(context: AgentContext): void {
    if (!context.id || typeof context.id !== 'string') {
      throw new Error('Context must have a valid ID');
    }

    if (!context.agentId || typeof context.agentId !== 'string') {
      throw new Error('Context must have a valid agent ID');
    }

    if (typeof context.version !== 'number' || context.version < 0) {
      throw new Error('Context version must be a non-negative number');
    }

    if (!context.createdAt || !(context.createdAt instanceof Date)) {
      throw new Error('Context must have a valid creation date');
    }

    if (!context.updatedAt || !(context.updatedAt instanceof Date)) {
      throw new Error('Context must have a valid update date');
    }

    if (context.updatedAt < context.createdAt) {
      throw new Error('Context update date cannot be before creation date');
    }
  }

  static createContextEvent(
    type: string,
    agentId: string,
    data: Record<string, any>,
    metadata?: Record<string, any>
  ): Omit<ContextEvent, 'id' | 'timestamp'> {
    return {
      type,
      agentId,
      data,
      metadata: {
        ...metadata,
        generatedAt: new Date().toISOString()
      }
    };
  }

  static calculateContextSize(context: AgentContext): number {
    return JSON.stringify(context).length;
  }

  static isContextExpired(context: AgentContext, maxAge: number): boolean {
    const now = new Date();
    const age = now.getTime() - context.updatedAt.getTime();
    return age > maxAge;
  }

  static mergeContextStates(
    currentState: Record<string, any>,
    updates: Record<string, any>
  ): Record<string, any> {
    const merged = { ...currentState };

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === undefined) {
        delete merged[key];
      } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // Deep merge for objects
        merged[key] = this.mergeContextStates(merged[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  static extractContextChanges(
    oldContext: AgentContext,
    newContext: AgentContext
  ): {
    added: Record<string, any>;
    modified: Record<string, any>;
    removed: string[];
  } {
    const added: Record<string, any> = {};
    const modified: Record<string, any> = {};
    const removed: string[] = [];

    const oldKeys = new Set(Object.keys(oldContext.state));
    const newKeys = new Set(Object.keys(newContext.state));

    // Find added keys
    for (const key of newKeys) {
      if (!oldKeys.has(key)) {
        added[key] = newContext.state[key];
      }
    }

    // Find removed keys
    for (const key of oldKeys) {
      if (!newKeys.has(key)) {
        removed.push(key);
      }
    }

    // Find modified keys
    for (const key of oldKeys) {
      if (newKeys.has(key) && JSON.stringify(oldContext.state[key]) !== JSON.stringify(newContext.state[key])) {
        modified[key] = newContext.state[key];
      }
    }

    return { added, modified, removed };
  }
}

export default ContextManagerHelpers;