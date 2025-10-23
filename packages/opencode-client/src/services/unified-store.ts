import type { GenericEntry } from '@promethean/persistence';
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

// Simple store access wrappers for indexer operations
export const sessionStoreAccess = {
  insert: async (entry: any) => {
    await sessionStore.insert(entry);
    return entry.id || 'generated-id';
  },
  getMostRecent: async (limit = 20) => {
    return await sessionStore.getMostRecent(limit);
  },
  getMostRelevant: async (queries: readonly string[], limit = 20) => {
    return await sessionStore.getMostRelevant(queries as string[], limit);
  },
};

export const eventStoreAccess = {
  insert: async (entry: any) => {
    await eventStore.insert(entry);
    return entry.id || 'generated-id';
  },
  getMostRecent: async (limit = 20) => {
    return await eventStore.getMostRecent(limit);
  },
  getMostRelevant: async (queries: readonly string[], limit = 20) => {
    return await eventStore.getMostRelevant(queries as string[], limit);
  },
};

export const messageStoreAccess = {
  insert: async (entry: any) => {
    await messageStore.insert(entry);
    return entry.id || 'generated-id';
  },
  getMostRecent: async (limit = 20) => {
    return await messageStore.getMostRecent(limit);
  },
  getMostRelevant: async (queries: readonly string[], limit = 20) => {
    return await messageStore.getMostRelevant(queries as string[], limit);
  },
};

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
