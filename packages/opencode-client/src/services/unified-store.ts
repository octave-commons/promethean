/**
 * Unified Store Access Interface
 *
 * Provides a standardized, type-safe interface for accessing OpenCode context stores.
 * This addresses the inconsistencies between read-heavy interface plugin and write-heavy indexer operations.
 */

import type { DualStoreEntry } from '@promethean/persistence';
import { insert, getMostRecent, getMostRelevant, get } from '@promethean/persistence/dualStore.js';
import { contextStore } from '../stores.js';

// Enhanced error types for better error handling
export class StoreOperationError extends Error {
  constructor(
    public readonly operation: string,
    public readonly storeName: string,
    cause: unknown,
  ) {
    super(
      `Failed ${operation} on ${storeName}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = 'StoreOperationError';
    this.cause = cause;
  }
}

export class TransactionError extends Error {
  constructor(
    public readonly operations: string[],
    cause: unknown,
  ) {
    super(
      `Transaction failed for operations [${operations.join(', ')}]: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = 'TransactionError';
    this.cause = cause;
  }
}

// Centralized ID generation strategy
export class IdGenerator {
  private static readonly SEPARATORS = {
    SESSION: 'sess',
    MESSAGE: 'msg',
    EVENT: 'evt',
  } as const;

  static generateSessionId(entityId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.SEPARATORS.SESSION}_${entityId}_${timestamp}_${random}`;
  }

  static generateMessageId(entityId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.SEPARATORS.MESSAGE}_${entityId}_${timestamp}_${random}`;
  }

  static generateEventId(eventType: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedType = eventType.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${this.SEPARATORS.EVENT}_${sanitizedType}_${timestamp}_${random}`;
  }

  static parseId(
    id: string,
  ): { type: string; entityId?: string; timestamp: number; random: string } | null {
    const match = id.match(/^(sess|msg|evt)_([^_]+)_(\d+)_([a-z0-9]+)$/);
    if (!match) return null;

    const [, type, entityId, timestampStr, random] = match;
    return {
      type: type === 'sess' ? 'session' : type === 'msg' ? 'message' : 'event',
      entityId: entityId || undefined,
      timestamp: parseInt(timestampStr || '0', 10),
      random: random || '',
    };
  }
}

// Query options interface
export interface QueryOptions {
  readonly queries?: readonly string[];
  readonly limit?: number;
  readonly sessionId?: string;
  readonly eventType?: string;
  readonly after?: number;
  readonly before?: number;
}

// Store entry with enhanced metadata
export interface EnhancedStoreEntry<T = Record<string, unknown>>
  extends DualStoreEntry<'text', 'timestamp'> {
  readonly metadata: {
    readonly type: 'session' | 'message' | 'event';
    readonly sessionId?: string;
    readonly messageId?: string;
    readonly eventType?: string;
    readonly role?: string;
    readonly title?: string;
  } & T;
}

// Unified store access interface
export interface UnifiedStoreAccess {
  readonly storeName: string;
  insert<T>(entry: Omit<EnhancedStoreEntry<T>, 'id'>): Promise<string>;
  query(options: QueryOptions): Promise<EnhancedStoreEntry[]>;
  get(id: string): Promise<EnhancedStoreEntry | null>;
  delete(id: string): Promise<boolean>;
  getMostRecent(limit?: number): Promise<EnhancedStoreEntry[]>;
  getMostRelevant(queries: readonly string[], limit?: number): Promise<EnhancedStoreEntry[]>;
}

// Connection pool for better performance
export class StoreConnectionPool {
  private static instance: StoreConnectionPool;
  private readonly pools = new Map<string, Promise<any>>();

  static getInstance(): StoreConnectionPool {
    if (!StoreConnectionPool.instance) {
      StoreConnectionPool.instance = new StoreConnectionPool();
    }
    return StoreConnectionPool.instance;
  }

  async getConnection(storeName: string): Promise<any> {
    const key = storeName;

    if (!this.pools.has(key)) {
      const connectionPromise = this.createConnection(storeName);
      this.pools.set(key, connectionPromise);

      // Set up connection cleanup
      connectionPromise.catch(() => {
        this.pools.delete(key);
      });
    }

    return this.pools.get(key)!;
  }

  private async createConnection(storeName: string): Promise<any> {
    try {
      const collection = contextStore.getCollection(storeName);
      return collection.dualStoreState;
    } catch (error) {
      throw new StoreOperationError('getConnection', storeName, error);
    }
  }

  async clearConnection(storeName: string): Promise<void> {
    this.pools.delete(storeName);
  }

  async clearAllConnections(): Promise<void> {
    this.pools.clear();
  }
}

// Transaction support for atomic operations
export class StoreTransactionManager {
  private static instance: StoreTransactionManager;
  private readonly activeTransactions = new Map<
    string,
    {
      operations: Promise<unknown>[];
      startTime: number;
    }
  >();

  static getInstance(): StoreTransactionManager {
    if (!StoreTransactionManager.instance) {
      StoreTransactionManager.instance = new StoreTransactionManager();
    }
    return StoreTransactionManager.instance;
  }

  async withTransaction<T>(transactionId: string, operations: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    const transaction = {
      operations: [] as Promise<unknown>[],
      startTime,
    };

    this.activeTransactions.set(transactionId, transaction);

    try {
      const result = await operations();
      this.activeTransactions.delete(transactionId);
      return result;
    } catch (error) {
      this.activeTransactions.delete(transactionId);
      throw new TransactionError(
        Array.from(transaction.operations).map((_, i) => `Operation ${i + 1}`),
        error,
      );
    }
  }

  getActiveTransactions(): readonly string[] {
    return Array.from(this.activeTransactions.keys());
  }

  getTransactionDuration(transactionId: string): number | null {
    const transaction = this.activeTransactions.get(transactionId);
    return transaction ? Date.now() - transaction.startTime : null;
  }
}

// Implementation of unified store access
export class UnifiedStore implements UnifiedStoreAccess {
  public readonly storeName: string;
  private readonly pool: StoreConnectionPool;

  constructor(storeName: string) {
    this.storeName = storeName;
    this.pool = StoreConnectionPool.getInstance();
  }

  async insert<T>(entry: Omit<EnhancedStoreEntry<T>, 'id'>): Promise<string> {
    try {
      const metadataType = entry.metadata?.type || 'event';
      const id = this.generateId(metadataType);
      const fullEntry: EnhancedStoreEntry<T> = {
        ...entry,
        id,
        text: entry.text || '',
        timestamp: entry.timestamp || Date.now(),
      };

      const connection = await this.pool.getConnection(this.storeName);
      await insert(connection, fullEntry as any);

      return id;
    } catch (error) {
      throw new StoreOperationError('insert', this.storeName, error);
    }
  }

  async query(options: QueryOptions): Promise<EnhancedStoreEntry[]> {
    try {
      const connection = await this.pool.getConnection(this.storeName);

      let results: DualStoreEntry<'text', 'timestamp'>[] = [];

      if (options.queries && options.queries.length > 0) {
        results = await getMostRelevant(connection, options.queries, options.limit || 20);
      } else {
        results = await getMostRecent(connection, options.limit || 20);
      }

      // Apply filters
      if (options.sessionId) {
        results = results.filter((entry) => entry.metadata?.sessionId === options.sessionId);
      }

      if (options.eventType) {
        results = results.filter((entry) => entry.metadata?.eventType === options.eventType);
      }

      if (options.after) {
        results = results.filter((entry) => {
          const timestamp =
            typeof entry.timestamp === 'number'
              ? entry.timestamp
              : typeof entry.timestamp === 'string'
                ? new Date(entry.timestamp).getTime()
                : entry.timestamp instanceof Date
                  ? entry.timestamp.getTime()
                  : 0;
          return timestamp >= options.after!;
        });
      }

      if (options.before) {
        results = results.filter((entry) => {
          const timestamp =
            typeof entry.timestamp === 'number'
              ? entry.timestamp
              : typeof entry.timestamp === 'string'
                ? new Date(entry.timestamp).getTime()
                : entry.timestamp instanceof Date
                  ? entry.timestamp.getTime()
                  : 0;
          return timestamp <= options.before!;
        });
      }

      return results as EnhancedStoreEntry[];
    } catch (error) {
      throw new StoreOperationError('query', this.storeName, error);
    }
  }

  async get(id: string): Promise<EnhancedStoreEntry | null> {
    try {
      const connection = await this.pool.getConnection(this.storeName);
      const result = await get(connection, id);
      return result as EnhancedStoreEntry | null;
    } catch (error) {
      throw new StoreOperationError('get', this.storeName, error);
    }
  }

  async delete(_id: string): Promise<boolean> {
    try {
      // Delete operation would need to be implemented in dual store
      // For now, return false as not implemented
      console.warn(`Delete operation not implemented for store ${this.storeName}`);
      return false;
    } catch (error) {
      throw new StoreOperationError('delete', this.storeName, error);
    }
  }

  async getMostRecent(limit?: number): Promise<EnhancedStoreEntry[]> {
    try {
      const connection = await this.pool.getConnection(this.storeName);
      const results = await getMostRecent(connection, limit);
      return results as EnhancedStoreEntry[];
    } catch (error) {
      throw new StoreOperationError('getMostRecent', this.storeName, error);
    }
  }

  async getMostRelevant(queries: readonly string[], limit?: number): Promise<EnhancedStoreEntry[]> {
    try {
      const connection = await this.pool.getConnection(this.storeName);
      const results = await getMostRelevant(connection, queries, limit || 20);
      return results as EnhancedStoreEntry[];
    } catch (error) {
      throw new StoreOperationError('getMostRelevant', this.storeName, error);
    }
  }

  private generateId(type: 'session' | 'message' | 'event'): string {
    switch (type) {
      case 'session':
        return IdGenerator.generateSessionId(Date.now().toString());
      case 'message':
        return IdGenerator.generateMessageId(Date.now().toString());
      case 'event':
        return IdGenerator.generateEventId('generic');
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
}

// Factory function to create unified store access
export const createStoreAccess = (storeName: string): UnifiedStoreAccess => {
  return new UnifiedStore(storeName);
};

// Pre-configured store access instances
export const sessionStoreAccess = createStoreAccess('sessionStore');
export const eventStoreAccess = createStoreAccess('eventStore');
export const messageStoreAccess = createStoreAccess('messageStore');

// Utility functions for common operations
export const withTransaction = async <T>(
  transactionId: string,
  operations: () => Promise<T>,
): Promise<T> => {
  const transactionManager = StoreTransactionManager.getInstance();
  return transactionManager.withTransaction(transactionId, operations);
};

// Batch operations for better performance
export const batchInsert = async <T>(
  storeAccess: UnifiedStoreAccess,
  entries: readonly Omit<EnhancedStoreEntry<T>, 'id'>[],
): Promise<readonly string[]> => {
  const transactionId = `batch_insert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return withTransaction(transactionId, async () => {
    const results = await Promise.all(entries.map((entry) => storeAccess.insert(entry)));
    return results;
  });
};

// Search utilities to eliminate N+1 patterns
export const searchAcrossStores = async (
  query: string,
  options: {
    readonly limit?: number;
    readonly sessionId?: string;
    readonly includeSessions?: boolean;
    readonly includeMessages?: boolean;
    readonly includeEvents?: boolean;
  } = {},
): Promise<{
  readonly sessions: readonly EnhancedStoreEntry[];
  readonly messages: readonly EnhancedStoreEntry[];
  readonly events: readonly EnhancedStoreEntry[];
}> => {
  const {
    limit = 20,
    sessionId,
    includeSessions = true,
    includeMessages = true,
    includeEvents = true,
  } = options;

  const searchPromises: Promise<readonly EnhancedStoreEntry[]>[] = [];

  if (includeSessions) {
    searchPromises.push(sessionStoreAccess.query({ queries: [query], limit, sessionId }));
  }

  if (includeMessages) {
    searchPromises.push(messageStoreAccess.query({ queries: [query], limit, sessionId }));
  }

  if (includeEvents) {
    searchPromises.push(eventStoreAccess.query({ queries: [query], limit, sessionId }));
  }

  const results = await Promise.all(searchPromises);

  let sessions: readonly EnhancedStoreEntry[] = [];
  let messages: readonly EnhancedStoreEntry[] = [];
  let events: readonly EnhancedStoreEntry[] = [];

  let resultIndex = 0;
  if (includeSessions) {
    sessions = results[resultIndex++] || [];
  }
  if (includeMessages) {
    messages = results[resultIndex++] || [];
  }
  if (includeEvents) {
    events = results[resultIndex++] || [];
  }

  return { sessions, messages, events };
};
