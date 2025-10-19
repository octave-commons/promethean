/**
 * Event Store implementations
 * Migrated from agent-context package
 */

import { v4 as uuidv4 } from 'uuid';
import type { ContextEvent, EventStore } from './types.js';
import { SecurityValidator, SecurityLogger } from './security.js';

// In-memory event store for testing and development
export class MemoryEventStore implements EventStore {
  private events: Map<string, ContextEvent[]> = new Map();

  async appendEvent(event: ContextEvent): Promise<void> {
    try {
      const validatedEvent = {
        ...event,
        id: event.id || uuidv4(),
        timestamp: event.timestamp || new Date(),
        agentId: SecurityValidator.validateAgentId(event.agentId),
        data: SecurityValidator.validateEventData(event.data),
      };

      const agentEvents = this.events.get(validatedEvent.agentId) || [];
      agentEvents.push(validatedEvent);
      this.events.set(validatedEvent.agentId, agentEvents);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedEvent.agentId,
        action: 'appendEvent',
        details: { eventId: validatedEvent.id, eventType: validatedEvent.type },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: event.agentId,
        action: 'appendEvent',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getEvents(
    agentId: string,
    fromVersion?: number
  ): Promise<ContextEvent[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const events = this.events.get(validatedAgentId) || [];

      if (fromVersion !== undefined) {
        // Filter events from a specific version
        return events.filter((event) => {
          const eventVersion = event.data.version || 0;
          return eventVersion >= fromVersion;
        });
      }

      return [...events];
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getEvents',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getEvent(eventId: string): Promise<ContextEvent | null> {
    try {
      if (!eventId || typeof eventId !== 'string') {
        throw new Error('Event ID must be a non-empty string');
      }

      for (const events of this.events.values()) {
        const event = events.find((e) => e.id === eventId);
        if (event) {
          return event;
        }
      }

      return null;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'getEvent',
        details: {
          eventId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  // Additional utility methods
  async getEventsByType(
    agentId: string,
    eventType: string
  ): Promise<ContextEvent[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const events = await this.getEvents(validatedAgentId);
      return events.filter((event) => event.type === eventType);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getEventsByType',
        details: {
          eventType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getEventsInDateRange(
    agentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ContextEvent[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const events = await this.getEvents(validatedAgentId);

      return events.filter(
        (event) => event.timestamp >= startDate && event.timestamp <= endDate
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getEventsInDateRange',
        details: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async clearEvents(agentId: string): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      this.events.delete(validatedAgentId);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId: validatedAgentId,
        action: 'clearEvents',
        details: { cleared: true },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'clearEvents',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  getStoreStats(): {
    totalAgents: number;
    totalEvents: number;
    eventsByAgent: Record<string, number>;
  } {
    const eventsByAgent: Record<string, number> = {};
    let totalEvents = 0;

    for (const [agentId, events] of this.events.entries()) {
      eventsByAgent[agentId] = events.length;
      totalEvents += events.length;
    }

    return {
      totalAgents: this.events.size,
      totalEvents,
      eventsByAgent,
    };
  }
}

// PostgreSQL event store for production use
export class PostgresEventStore implements EventStore {
  constructor(
    private pool: any, // PostgreSQL pool
    private tableName: string = 'context_events'
  ) {}

  async appendEvent(event: ContextEvent): Promise<void> {
    try {
      const validatedEvent = {
        ...event,
        id: event.id || uuidv4(),
        timestamp: event.timestamp || new Date(),
        agentId: SecurityValidator.validateAgentId(event.agentId),
        data: SecurityValidator.validateEventData(event.data),
      };

      const query = `
        INSERT INTO ${this.tableName} (id, agent_id, type, timestamp, data, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const values = [
        validatedEvent.id,
        validatedEvent.agentId,
        validatedEvent.type,
        validatedEvent.timestamp,
        JSON.stringify(validatedEvent.data),
        JSON.stringify(validatedEvent.metadata || {}),
      ];

      await this.pool.query(query, values);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedEvent.agentId,
        action: 'appendEvent',
        details: { eventId: validatedEvent.id, eventType: validatedEvent.type },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: event.agentId,
        action: 'appendEvent',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getEvents(
    agentId: string,
    fromVersion?: number
  ): Promise<ContextEvent[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      let query = `
        SELECT id, agent_id, type, timestamp, data, metadata
        FROM ${this.tableName}
        WHERE agent_id = $1
      `;

      const params: any[] = [validatedAgentId];

      if (fromVersion !== undefined) {
        query += ` AND (data->>'version')::numeric >= $2`;
        params.push(fromVersion);
      }

      query += ` ORDER BY timestamp ASC`;

      const result = await this.pool.query(query, params);

      return result.rows.map((row: any) => ({
        id: row.id,
        agentId: row.agent_id,
        type: row.type,
        timestamp: new Date(row.timestamp),
        data: row.data,
        metadata: row.metadata,
      }));
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getEvents',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getEvent(eventId: string): Promise<ContextEvent | null> {
    try {
      if (!eventId || typeof eventId !== 'string') {
        throw new Error('Event ID must be a non-empty string');
      }

      const query = `
        SELECT id, agent_id, type, timestamp, data, metadata
        FROM ${this.tableName}
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [eventId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        agentId: row.agent_id,
        type: row.type,
        timestamp: new Date(row.timestamp),
        data: row.data,
        metadata: row.metadata,
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'getEvent',
        details: {
          eventId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  // Additional utility methods for PostgreSQL
  async getEventsByType(
    agentId: string,
    eventType: string
  ): Promise<ContextEvent[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const query = `
        SELECT id, agent_id, type, timestamp, data, metadata
        FROM ${this.tableName}
        WHERE agent_id = $1 AND type = $2
        ORDER BY timestamp ASC
      `;

      const result = await this.pool.query(query, [
        validatedAgentId,
        eventType,
      ]);

      return result.rows.map((row: any) => ({
        id: row.id,
        agentId: row.agent_id,
        type: row.type,
        timestamp: new Date(row.timestamp),
        data: row.data,
        metadata: row.metadata,
      }));
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getEventsByType',
        details: {
          eventType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async initializeTable(): Promise<void> {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          agent_id VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          data JSONB NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_agent_id ON ${this.tableName}(agent_id);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_type ON ${this.tableName}(type);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_timestamp ON ${this.tableName}(timestamp);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_agent_timestamp ON ${this.tableName}(agent_id, timestamp);
      `;

      await this.pool.query(query);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        action: 'initializeTable',
        details: {
          tableName: this.tableName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }
}

export default {
  MemoryEventStore,
  PostgresEventStore,
};
