import { SyncQueue, SyncEvent, BridgeConfig } from './types';
import Redis from 'ioredis';

export class RedisSyncQueue implements SyncQueue {
  private redis: Redis;
  private processingQueue: string;
  private failedQueue: string;

  constructor(config: BridgeConfig) {
    if (config.storage.type !== 'redis' || !config.storage.redis) {
      throw new Error('Redis configuration required for RedisSyncQueue');
    }

    this.redis = new Redis({
      host: config.storage.redis.host,
      port: config.storage.redis.port,
      db: config.storage.redis.db,
      password: config.storage.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    this.processingQueue = 'sync:queue:processing';
    this.failedQueue = 'sync:queue:failed';
  }

  async add(event: SyncEvent): Promise<void> {
    const eventData = JSON.stringify(event);
    await this.redis.lpush('sync:queue', eventData);
  }

  async get(limit: number = 50): Promise<SyncEvent[]> {
    // Move events from main queue to processing queue
    const events = await this.redis.lrange('sync:queue', 0, limit - 1);
    
    if (events.length > 0) {
      // Remove from main queue
      await this.redis.ltrim('sync:queue', events.length, -1);
      
      // Add to processing queue with timestamp
      const pipeline = this.redis.pipeline();
      events.forEach(event => {
        pipeline.lpush(this.processingQueue, event);
        pipeline.expire(this.processingQueue, 300); // 5 minutes timeout
      });
      await pipeline.exec();
    }

    return events.map(event => JSON.parse(event));
  }

  async markProcessed(eventId: string): Promise<void> {
    // Remove from processing queue
    const events = await this.redis.lrange(this.processingQueue, 0, -1);
    
    for (let i = 0; i < events.length; i++) {
      const event = JSON.parse(events[i]);
      if (event.id === eventId) {
        await this.redis.lrem(this.processingQueue, 1, events[i]);
        break;
      }
    }
  }

  async retryFailed(): Promise<void> {
    const failedEvents = await this.redis.lrange(this.failedQueue, 0, -1);
    
    if (failedEvents.length > 0) {
      // Move failed events back to main queue
      const pipeline = this.redis.pipeline();
      failedEvents.forEach(event => {
        pipeline.lpush('sync:queue', event);
      });
      await pipeline.exec();
      
      // Clear failed queue
      await this.redis.del(this.failedQueue);
    }
  }

  async getSize(): Promise<number> {
    return await this.redis.llen('sync:queue');
  }

  async getProcessingSize(): Promise<number> {
    return await this.redis.llen(this.processingQueue);
  }

  async getFailedSize(): Promise<number> {
    return await this.redis.llen(this.failedQueue);
  }

  async addToFailed(event: SyncEvent, error: Error): Promise<void> {
    const failedEvent = {
      ...event,
      error: error.message,
      failedAt: new Date().toISOString(),
      retryCount: (event.data?.retryCount || 0) + 1
    };

    await this.redis.lpush(this.failedQueue, JSON.stringify(failedEvent));
  }

  async clear(): Promise<void> {
    await this.redis.del('sync:queue', this.processingQueue, this.failedQueue);
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export class MemorySyncQueue implements SyncQueue {
  private queue: SyncEvent[] = [];
  private processing: Map<string, SyncEvent> = new Map();
  private failed: SyncEvent[] = [];

  async add(event: SyncEvent): Promise<void> {
    this.queue.push(event);
  }

  async get(limit: number = 50): Promise<SyncEvent[]> {
    const events = this.queue.splice(0, limit);
    
    events.forEach(event => {
      this.processing.set(event.id, event);
    });

    return events;
  }

  async markProcessed(eventId: string): Promise<void> {
    this.processing.delete(eventId);
  }

  async retryFailed(): Promise<void> {
    const retryableEvents = this.failed.filter(event => 
      (event.data?.retryCount || 0) < 3
    );

    this.failed = this.failed.filter(event => 
      (event.data?.retryCount || 0) >= 3
    );

    this.queue.push(...retryableEvents);
  }

  async getSize(): Promise<number> {
    return this.queue.length;
  }

  async getProcessingSize(): Promise<number> {
    return this.processing.size;
  }

  async getFailedSize(): Promise<number> {
    return this.failed.length;
  }

  async addToFailed(event: SyncEvent, error: Error): Promise<void> {
    const failedEvent = {
      ...event,
      error: error.message,
      failedAt: new Date(),
      retryCount: (event.data?.retryCount || 0) + 1
    };

    this.failed.push(failedEvent);
    this.processing.delete(event.id);
  }

  async clear(): Promise<void> {
    this.queue = [];
    this.processing.clear();
    this.failed = [];
  }

  // Debug methods
  getQueueSnapshot(): { queue: SyncEvent[]; processing: SyncEvent[]; failed: SyncEvent[] } {
    return {
      queue: [...this.queue],
      processing: Array.from(this.processing.values()),
      failed: [...this.failed]
    };
  }
}

export class QueueFactory {
  static create(config: BridgeConfig): SyncQueue {
    switch (config.storage.type) {
      case 'redis':
        return new RedisSyncQueue(config);
      case 'memory':
        return new MemorySyncQueue();
      default:
        throw new Error(`Unsupported queue type: ${config.storage.type}`);
    }
  }
}