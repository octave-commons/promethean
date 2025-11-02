// SPDX-License-Identifier: GPL-3.0-only
import { getSessionStore } from '../../stores.js';
import { SessionUtils } from '../../utils/SessionUtils.js';
import { deduplicateSessions } from '../../utils/session-cleanup.js';
/**
 * Extract session ID from legacy text format
 */
function extractSessionIdFromText(text) {
    const sessionMatch = text.match(/Session:\s*(\w+)/);
    return sessionMatch?.[1] || null;
}
/**
 * Create session data from timestamp
 */
function createSessionDataFromTimestamp(sessionId, title, timestamp) {
    const now = typeof timestamp === 'number' ? timestamp : Date.now();
    return {
        id: sessionId,
        title,
        createdAt: now,
        updatedAt: now,
        lastActivity: now,
        status: 'unknown',
        time: {
            created: new Date(typeof timestamp === 'number' ? timestamp : Date.now()).toISOString(),
        },
    };
}
/**
 * Safely parse session data, handling both JSON and plain text formats
 */
function parseSessionData(session) {
    try {
        return JSON.parse(session.text);
    }
    catch (error) {
        // Handle legacy plain text format - extract session ID from text
        const sessionId = extractSessionIdFromText(session.text);
        if (sessionId) {
            return createSessionDataFromTimestamp(sessionId, `Session ${sessionId}`, session.timestamp);
        }
        // Fallback - create minimal session object
        return createSessionDataFromTimestamp(session.id?.toString() || 'unknown', 'Legacy Session', session.timestamp);
    }
}
function calculateFetchLimit(limit, offset) {
    return Math.min(limit + offset + 50, 500);
}
function createEmptyResponse(limit, offset) {
    return {
        sessions: [],
        totalCount: 0,
        pagination: {
            limit,
            offset,
            hasMore: false,
            currentPage: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
            totalPages: 0,
        },
        summary: {
            active: 0,
            waiting_for_input: 0,
            idle: 0,
            agentTasks: 0,
        },
    };
}
function sortSessionsByTime(sessions) {
    return [...sessions].sort((a, b) => {
        // Use createdAt or time.created from SessionInfo for sorting
        const aTime = a.createdAt || a.time?.created || '';
        const bTime = b.createdAt || b.time?.created || '';
        if (aTime && bTime && typeof aTime === 'string' && typeof bTime === 'string') {
            return bTime.localeCompare(aTime);
        }
        const aId = a.id || '';
        const bId = b.id || '';
        return bId.localeCompare(aId);
    });
}
async function getSessionMessages(sessionId) {
    const messageKey = `session:${sessionId}:messages`;
    const store = await getSessionStore();
    const allStored = await store.getMostRecent(100);
    const messageEntry = allStored.find((entry) => entry.id === messageKey);
    if (!messageEntry) {
        return [];
    }
    return JSON.parse(messageEntry.text);
}
async function enhanceSessionWithMessages(session) {
    try {
        const messages = await getSessionMessages(session.id);
        // Convert CleanupSessionInfo to SessionData for SessionUtils
        const sessionData = {
            id: session.id,
            title: session.title,
            createdAt: session.createdAt,
            updatedAt: session.createdAt,
            lastActivity: session.createdAt,
            status: 'unknown',
            time: session.time,
        };
        return SessionUtils.createSessionInfo(sessionData, messages.length, undefined);
    }
    catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
        // Convert CleanupSessionInfo to SessionData for SessionUtils
        const sessionData = {
            id: session.id,
            title: session.title,
            createdAt: session.createdAt,
            updatedAt: session.createdAt,
            lastActivity: session.createdAt,
            status: 'unknown',
            time: session.time,
        };
        return {
            ...SessionUtils.createSessionInfo(sessionData, 0, undefined),
            error: 'Could not fetch messages',
        };
    }
}
function createSessionSummary(sessions) {
    return {
        active: sessions.filter((s) => s.activityStatus === 'active').length,
        waiting_for_input: sessions.filter((s) => s.activityStatus === 'waiting_for_input').length,
        idle: sessions.filter((s) => s.activityStatus === 'idle').length,
        agentTasks: sessions.filter((s) => s.isAgentTask).length,
    };
}
function createListResponse(sessions, totalCount, limit, offset) {
    const hasMore = offset + limit < totalCount;
    return {
        sessions,
        totalCount,
        pagination: {
            limit,
            offset,
            hasMore,
            currentPage: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
            totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 0,
        },
        summary: createSessionSummary(sessions),
    };
}
function logDebug(debugEnabled, message, data) {
    if (debugEnabled) {
        console.log(`[DEBUG] ${message}`, data || '');
    }
}
function logSessionInfo(debugEnabled, sessions) {
    if (debugEnabled) {
        console.log(`[INFO] Session IDs being processed:`);
        sessions.slice(0, 5).forEach((s) => {
            console.log(`  - ${s.id}`);
        });
    }
}
export async function list({ limit, offset, }) {
    const debugEnabled = Boolean(process.env.OPENCODE_DEBUG);
    try {
        logDebug(debugEnabled, `list called with limit=${limit}, offset=${offset}`);
        const fetchLimit = calculateFetchLimit(limit, offset);
        logDebug(debugEnabled, `fetchLimit=${fetchLimit}`);
        const store = await getSessionStore();
        const storedSessions = await store.getMostRecent(fetchLimit);
        logDebug(debugEnabled, `retrieved ${storedSessions?.length || 0} sessions from store`);
        if (!storedSessions?.length) {
            return createEmptyResponse(limit, offset);
        }
        // Filter to only include actual session entries (those with session_ prefix)
        const sessionEntries = storedSessions.filter((entry) => entry.id && entry.id.startsWith('session_'));
        logDebug(debugEnabled, `filtered to ${sessionEntries?.length || 0} actual session entries`);
        if (!sessionEntries?.length) {
            return createEmptyResponse(limit, offset);
        }
        const parsedSessions = sessionEntries.map((session) => parseSessionData(session));
        const sessionsList = deduplicateSessions(parsedSessions);
        logDebug(debugEnabled, `after deduplication: ${sessionsList?.length || 0} sessions`);
        logSessionInfo(debugEnabled, sessionsList);
        if (!sessionsList?.length) {
            return createEmptyResponse(limit, offset);
        }
        const sortedSessions = sortSessionsByTime(sessionsList);
        const paginated = sortedSessions.slice(offset, offset + limit);
        logDebug(debugEnabled, `after pagination: ${paginated.length} sessions (offset=${offset}, limit=${limit})`);
        const enhanced = await Promise.all(paginated.map((session) => enhanceSessionWithMessages(session)));
        return createListResponse(enhanced, sessionsList.length, limit, offset);
    }
    catch (error) {
        console.error('Error in list_sessions:', error);
        console.error('Parameters received:', { limit, offset });
        return {
            error: `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
//# sourceMappingURL=list.js.map