// SPDX-License-Identifier: GPL-3.0-only
import { getSessionStore, getEventStore, getMessageStore } from '../stores.js';
// Simple store access wrappers for indexer operations
export const sessionStoreAccess = {
    insert: async (entry) => {
        const store = await getSessionStore();
        await store.insert(entry);
        return entry.id || 'generated-id';
    },
    getMostRecent: async (limit = 20) => {
        const store = await getSessionStore();
        return await store.getMostRecent(limit);
    },
    getMostRelevant: async (queries, limit = 20) => {
        const store = await getSessionStore();
        return await store.getMostRelevant(queries, limit);
    },
};
export const eventStoreAccess = {
    insert: async (entry) => {
        const store = await getEventStore();
        await store.insert(entry);
        return entry.id || 'generated-id';
    },
    getMostRecent: async (limit = 20) => {
        const store = await getEventStore();
        return await store.getMostRecent(limit);
    },
    getMostRelevant: async (queries, limit = 20) => {
        const store = await getEventStore();
        return await store.getMostRelevant(queries, limit);
    },
};
export const messageStoreAccess = {
    insert: async (entry) => {
        const store = await getMessageStore();
        await store.insert(entry);
        return entry.id || 'generated-id';
    },
    getMostRecent: async (limit = 20) => {
        const store = await getMessageStore();
        return await store.getMostRecent(limit);
    },
    getMostRelevant: async (queries, limit = 20) => {
        const store = await getMessageStore();
        return await store.getMostRelevant(queries, limit);
    },
};
/**
 * Search across multiple stores with unified interface
 */
export const searchAcrossStores = async (query, options = {}) => {
    const { limit = 20, sessionId, includeSessions = true, includeMessages = true, includeEvents = true, } = options;
    const searchPromises = [];
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
    let sessions = [];
    let messages = [];
    let events = [];
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
//# sourceMappingURL=unified-store.js.map