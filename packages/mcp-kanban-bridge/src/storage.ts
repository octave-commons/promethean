import { EventStorage, SyncEvent, BridgeConfig } from './types.js';
import Redis from 'ioredis';

export class RedisEventStorage implements EventStorage {
  private redis: Redis;
  private keyPrefix = 'sync:event:';

  constructor(config: BridgeConfig) {
    if (config.storage.type !== 'redis' || !config.storage.redis) {
      throw new Error('Redis configuration required for RedisEventStorage');
    }

    this.redis = new Redis({
      host: config.storage.redis.host,
      port: config.storage.redis.port,
      db: config.storage.redis.db,
      password: config.storage.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async saveEvent(event: SyncEvent): Promise<void> {
    const key = `${this.keyPrefix}${event.id}`;
    const eventData = JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    await this.redis.setex(key, 86400, eventData); // 24 hours TTL
  }

  async getEvent(eventId: string): Promise<SyncEvent | null> {
    const key = `${this.keyPrefix}${eventId}`;
    const eventData = await this.redis.get(key);

    if (!eventData) {
      return null;
    }

    const parsed = JSON.parse(eventData);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
    };
  }

  async getEvents(filter?: {
    source?: string;
    processed?: boolean;
    limit?: number;
  }): Promise<SyncEvent[]> {
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.redis.keys(pattern);

    let eventKeys = keys.sort(); // Sort by key (which includes timestamp)

    if (filter?.source) {
      // Filter by source after fetching all events
      // In production, you'd want to use Redis sets or sorted sets for better performance
    }

    const events: SyncEvent[] = [];

    for (const key of eventKeys) {
      const eventData = await this.redis.get(key);
      if (eventData) {
        const parsed = JSON.parse(eventData);
        const event = {
          ...parsed,
          timestamp: new Date(parsed.timestamp),
        };

        // Apply filters
        if (filter?.source && event.source !== filter.source) continue;
        if (filter?.processed !== undefined && event.processed !== filter.processed) continue;

        events.push(event);

        if (filter?.limit && events.length >= filter.limit) break;
      }
    }

    return events;
  }

  async updateEvent(eventId: string, updates: Partial<SyncEvent>): Promise<void> {
    const existingEvent = await this.getEvent(eventId);
    if (!existingEvent) {
      throw new Error(`Event ${eventId} not found`);
    }

    const updatedEvent = {
      ...existingEvent,
      ...updates,
    };

    await this.saveEvent(updatedEvent);
  }

  async deleteEvent(eventId: string): Promise<void> {
    const key = `${this.keyPrefix}${eventId}`;
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export class MemoryEventStorage implements EventStorage {
  private events: Map<string, SyncEvent> = new Map();

  async saveEvent(event: SyncEvent): Promise<void> {
    this.events.set(event.id, event);
  }

  async getEvent(eventId: string): Promise<SyncEvent | null> {
    return this.events.get(eventId) || null;
  }

  async getEvents(filter?: {
    source?: string;
    processed?: boolean;
    limit?: number;
  }): Promise<SyncEvent[]> {
    let events = Array.from(this.events.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    ); // Sort by timestamp descending

    if (filter?.source) {
      events = events.filter((event) => event.source === filter.source);
    }

    if (filter?.processed !== undefined) {
      events = events.filter((event) => event.processed === filter.processed);
    }

    if (filter?.limit) {
      events = events.slice(0, filter.limit);
    }

    return events;
  }

  async updateEvent(eventId: string, updates: Partial<SyncEvent>): Promise<void> {
    const existingEvent = this.events.get(eventId);
    if (!existingEvent) {
      throw new Error(`Event ${eventId} not found`);
    }

    const updatedEvent = {
      ...existingEvent,
      ...updates,
    };

    this.events.set(eventId, updatedEvent);
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.events.delete(eventId);
  }

  async clear(): Promise<void> {
    this.events.clear();
  }

  // Debug methods
  getEventCount(): number {
    return this.events.size;
  }

  getAllEvents(): SyncEvent[] {
    return Array.from(this.events.values());
  }
}

export class EventStorageFactory {
  static create(config: BridgeConfig): EventStorage {
    switch (config.storage.type) {
      case 'redis':
        return new RedisEventStorage(config);
      case 'memory':
        return new MemoryEventStorage();
      default:
        throw new Error(`Unsupported storage type: ${config.storage.type}`);
    }
  }
}
