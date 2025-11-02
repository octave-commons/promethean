// SPDX-License-Identifier: GPL-3.0-only

import type { GenericEntry } from '@promethean-os/persistence';
import { getSessionStore, getEventStore, getMessageStore } from '../stores.js';

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
    const store = await getSessionStore();
    await store.insert(entry);
    return entry.id || 'generated-id';
  },
  getMostRecent: async (limit = 20) => {
    const store = await getSessionStore();
    return await store.getMostRecent(limit);
  },
  getMostRelevant: async (queries: readonly string[], limit = 20) => {
    const store = await getSessionStore();
    return await store.getMostRelevant(queries as string[], limit);
  },
};

export const eventStoreAccess = {
  insert: async (entry: any) => {
    const store = await getEventStore();
    await store.insert(entry);
    return entry.id || 'generated-id';
  },
  getMostRecent: async (limit = 20) => {
    const store = await getEventStore();
    return await store.getMostRecent(limit);
  },
  getMostRelevant: async (queries: readonly string[], limit = 20) => {
    const store = await getEventStore();
    return await store.getMostRelevant(queries as string[], limit);
  },
};

export const messageStoreAccess = {
  insert: async (entry: any) => {
    const store = await getMessageStore();
    await store.insert(entry);
    return entry.id || 'generated-id';
  },
  getMostRecent: async (limit = 20) => {
    const store = await getMessageStore();
    return await store.getMostRecent(limit);
  },
  getMostRelevant: async (queries: readonly string[], limit = 20) => {
    const store = await getMessageStore();
    return await store.getMostRelevant(queries as string[], limit);
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
    searchPromises.push(sessionStoreAccess.getMostRelevant([query], limit).catch(() => []));
  }

  if (includeMessages) {
    searchPromises.push(messageStoreAccess.getMostRelevant([query], limit).catch(() => []));
  }

  if (includeEvents) {
    searchPromises.push(eventStoreAccess.getMostRelevant([query], limit).catch(() => []));
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
