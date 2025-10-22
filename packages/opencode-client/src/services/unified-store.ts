/**
 * Simplified Unified Store Service
 *
 * Provides basic store search functionality for OpenCode interface plugin.
 * This is a minimal restoration of the previously deleted unified-store service.
 */

import type { GenericEntry, DualStoreEntry } from '@promethean/persistence';
import { sessionStore, eventStore, messageStore } from '../stores.js';

export interface SearchOptions {
  readonly limit?: number;
  readonly sessionId?: string;
  readonly includeSessions?: boolean;
  readonly includeMessages?: boolean;
  readonly includeEvents?: boolean;
}

export interface SearchResults {
  readonly sessions: readonly GenericEntry[];
  readonly messages: readonly GenericEntry[];
  readonly events: readonly GenericEntry[];
}

// Store entry with enhanced metadata for indexing
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

// Unified store access interface for indexer operations
export interface UnifiedStoreAccess {
  readonly storeName: string;
  insert<T>(entry: Omit<EnhancedStoreEntry<T>, 'id'>): Promise<string>;
  getMostRecent(limit?: number): Promise<EnhancedStoreEntry[]>;
  getMostRelevant(queries: readonly string[], limit?: number): Promise<EnhancedStoreEntry[]>;
}

// Simple implementation of unified store access using existing store proxies
class SimpleUnifiedStore implements UnifiedStoreAccess {
  constructor(
    public readonly storeName: string,
    private store: any,
  ) {}

  async insert<T>(entry: Omit<EnhancedStoreEntry<T>, 'id'>): Promise<string> {
    const id = `${this.storeName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fullEntry: EnhancedStoreEntry<T> = {
      ...entry,
      id,
      text: entry.text || '',
      timestamp: entry.timestamp || Date.now(),
    };

    await this.store.insert(fullEntry);
    return id;
  }

  async getMostRecent(limit = 20): Promise<EnhancedStoreEntry[]> {
    const results = await this.store.getMostRecent(limit);
    return results as EnhancedStoreEntry[];
  }

  async getMostRelevant(queries: readonly string[], limit = 20): Promise<EnhancedStoreEntry[]> {
    const results = await this.store.getMostRelevant(queries, limit);
    return results as EnhancedStoreEntry[];
  }
}

// Export store access instances for indexer operations
export const sessionStoreAccess = new SimpleUnifiedStore('sessionStore', sessionStore);
export const eventStoreAccess = new SimpleUnifiedStore('eventStore', eventStore);
export const messageStoreAccess = new SimpleUnifiedStore('messageStore', messageStore);

/**
 * Search across multiple stores with unified interface
 */
export const searchAcrossStores = async (
  query: string,
  options: SearchOptions = {},
): Promise<SearchResults> => {
  const {
    limit = 20,
    sessionId,
    includeSessions = true,
    includeMessages = true,
    includeEvents = true,
  } = options;

  const searchPromises: Promise<readonly GenericEntry[]>[] = [];

  if (includeSessions) {
    searchPromises.push(sessionStore.getMostRelevant([query], limit).catch(() => []));
  }

  if (includeMessages) {
    searchPromises.push(messageStore.getMostRelevant([query], limit).catch(() => []));
  }

  if (includeEvents) {
    searchPromises.push(eventStore.getMostRelevant([query], limit).catch(() => []));
  }

  const results = await Promise.all(searchPromises);

  let sessions: readonly GenericEntry[] = [];
  let messages: readonly GenericEntry[] = [];
  let events: readonly GenericEntry[] = [];

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

  // Filter by sessionId if provided
  if (sessionId) {
    sessions = sessions.filter((entry) => entry.metadata?.sessionId === sessionId);
    messages = messages.filter((entry) => entry.metadata?.sessionId === sessionId);
    events = events.filter((entry) => entry.metadata?.sessionId === sessionId);
  }

  return { sessions, messages, events };
};
