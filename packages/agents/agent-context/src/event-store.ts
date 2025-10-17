import { ContextEvent, EventStore } from './types';
import { openLevelCache, Cache } from '@promethean/level-cache';

export class PostgresEventStore implements EventStore {
  private cache: Cache<ContextEvent> | null = null;
  private cachePromise: Promise<void> | null = null;

  constructor(
    private db: any,
    private cacheOptions?: any,
  ) {
    this.cachePromise = this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    this.cache = await openLevelCache({
      path: './tmp/agent-context-events',
      namespace: 'agent-context-events',
      ttl: 3600000, // 1 hour
      ...this.cacheOptions,
    });
  }

  private async getCache(): Promise<Cache<ContextEvent>> {
    if (!this.cache) {
      if (!this.cachePromise) {
        this.cachePromise = this.initializeCache();
      }
      await this.cachePromise;
    }
    if (!this.cache) {
      throw new Error('Failed to initialize cache');
    }
    return this.cache;
  }

  async appendEvent(event: ContextEvent): Promise<void> {
    // Validate event before storing
    if (!event.id || !event.type || !event.agentId || !event.timestamp) {
      throw new Error('Invalid event data: missing required fields');
    }

    const query = `
      INSERT INTO agent_context_events (id, type, agent_id, timestamp, data, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await this.db.query(query, [
      event.id,
      event.type,
      event.agentId,
      event.timestamp,
      JSON.stringify(event.data),
      JSON.stringify(event.metadata || {}),
    ]);

    // Update cache
    const cache = await this.getCache();
    await cache.set(event.id, event);
  }

  async getEvents(agentId: string, fromVersion?: number): Promise<ContextEvent[]> {
    // Try cache first
    const cache = await this.getCache();
    const cacheKey = `events:${agentId}:${fromVersion || 0}`;
    const cached = await cache.get(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    let query = `
      SELECT * FROM agent_context_events 
      WHERE agent_id = $1
    `;
    const params: any[] = [agentId];

    if (fromVersion !== undefined) {
      query += ` AND version >= $2 ORDER BY version ASC`;
      params.push(fromVersion);
    } else {
      query += ` ORDER BY version ASC`;
    }

    const result = await this.db.query(query, params);
    const events = result.rows.map(this.mapRowToEvent);

    // Cache the result
    await cache.set(cacheKey, events);
    return events;
  }

  async getEvent(eventId: string): Promise<ContextEvent | null> {
    // Try cache first
    const cache = await this.getCache();
    const cached = await cache.get(eventId);
    if (cached) {
      return cached;
    }

    const query = 'SELECT * FROM agent_context_events WHERE id = $1';
    const result = await this.db.query(query, [eventId]);

    if (result.rows.length === 0) {
      return null;
    }

    const event = this.mapRowToEvent(result.rows[0]);
    await cache.set(eventId, event);
    return event;
  }

  private mapRowToEvent(row: any): ContextEvent {
    return {
      id: row.id,
      type: row.type,
      agentId: row.agent_id,
      timestamp: new Date(row.timestamp),
      data: JSON.parse(row.data),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
}
