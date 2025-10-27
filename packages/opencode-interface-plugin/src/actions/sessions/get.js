// SPDX-License-Identifier: GPL-3.0-only
import { getSessionStore } from '../../stores.js';
import { SessionUtils } from '../../utils/SessionUtils.js';
const formatTimestamp = (timestamp) => {
    if (!timestamp) {
        return new Date().toISOString();
    }
    if (typeof timestamp === 'number') {
        return new Date(timestamp).toISOString();
    }
    if (timestamp instanceof Date) {
        return timestamp.toISOString();
    }
    return timestamp;
};
const extractSessionFromText = (text) => {
    const sessionMatch = text.match(/Session:\s*(\w+)/);
    if (sessionMatch?.[1]) {
        const sessionId = sessionMatch[1];
        return {
            id: sessionId,
            title: `Session ${sessionId}`,
        };
    }
    return {};
};
const createFallbackSession = (entry) => {
    const sessionFromText = extractSessionFromText(entry.text);
    return {
        id: sessionFromText.id || entry.id || 'unknown',
        title: sessionFromText.title || 'Legacy Session',
        createdAt: formatTimestamp(entry.timestamp),
    };
};
/**
 * Safely parse session data, handling both JSON and plain text formats
 */
const parseSessionData = (entry) => {
    try {
        return JSON.parse(entry.text);
    }
    catch {
        return createFallbackSession(entry);
    }
};
const getSessionEntry = async (sessionId) => {
    const store = await getSessionStore();
    return store.get(sessionId);
};
const parseMessages = (messageEntry) => {
    try {
        return JSON.parse(messageEntry.text);
    }
    catch {
        return [];
    }
};
const createSessionResponse = (session, messages, limit, offset) => {
    const sessionInfo = SessionUtils.createSessionInfo(session, messages.length, undefined);
    const paginatedMessages = limit ? messages.slice(offset || 0, (offset || 0) + limit) : messages;
    return {
        session: sessionInfo,
        messages: paginatedMessages,
    };
};
const getMessagesForSession = async (sessionId) => {
    const messageKey = `session:${sessionId}:messages`;
    const store = await getSessionStore();
    const messageEntry = await store.get(messageKey);
    if (!messageEntry) {
        return [];
    }
    return parseMessages(messageEntry);
};
export async function get({ sessionId, limit, offset, }) {
    const sessionEntry = await getSessionEntry(sessionId);
    if (!sessionEntry) {
        return { error: 'Session not found in dual store' };
    }
    const session = parseSessionData(sessionEntry);
    const messages = await getMessagesForSession(sessionId);
    return createSessionResponse(session, messages, limit, offset);
}
//# sourceMappingURL=get.js.map