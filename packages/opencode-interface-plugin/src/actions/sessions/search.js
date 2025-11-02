// SPDX-License-Identifier: GPL-3.0-only
import { getSessionStore } from '../../stores.js';
import { SessionUtils } from '../../utils/SessionUtils.js';
function sessionToSessionData(session) {
    const now = Date.now();
    const sessionTime = session.time;
    return {
        id: session.id,
        title: session.title,
        createdAt: now,
        updatedAt: now,
        lastActivity: now,
        status: 'active',
        time: {
            created: sessionTime?.created,
            updated: sessionTime?.updated,
        },
    };
}
export async function search({ query, k, sessionId, }) {
    try {
        // Search sessions from dual store - fail fast if not available
        const store = await getSessionStore();
        const storedSessions = await store.getMostRecent(1000); // Get a large number
        if (!storedSessions?.length) {
            return {
                query,
                results: [],
                totalCount: 0,
            };
        }
        const sessionEntries = storedSessions
            .filter((entry) => entry.id &&
            (entry.id.startsWith('session_') || entry.id.startsWith('session:')) &&
            !entry.id.includes(':messages'))
            .map((entry) => JSON.parse(entry.text));
        // Simple text-based search filtering
        let filteredSessions = sessionEntries;
        if (query) {
            const queryLower = query.toLowerCase();
            filteredSessions = sessionEntries.filter((session) => {
                // Search in session title, description, and other text fields
                return (session.title?.toLowerCase().includes(queryLower) ||
                    session.description?.toLowerCase().includes(queryLower) ||
                    session.id?.toLowerCase().includes(queryLower) ||
                    session.agent?.toLowerCase().includes(queryLower));
            });
        }
        if (sessionId) {
            filteredSessions = filteredSessions.filter((session) => session.id === sessionId);
        }
        // Apply limit k if specified
        const sessions = k ? filteredSessions.slice(0, k) : filteredSessions;
        const enhanced = await Promise.all(sessions.map(async (session) => {
            try {
                // Get messages from dual store - fail fast if not available
                const messageKey = `session:${session.id}:messages`;
                const messageEntry = await store.get(messageKey);
                let messages = [];
                if (messageEntry) {
                    messages = JSON.parse(messageEntry.text);
                }
                return SessionUtils.createSessionInfo(sessionToSessionData(session), messages.length, undefined);
            }
            catch (error) {
                console.error(`Error processing session ${session.id}:`, error);
                return {
                    ...SessionUtils.createSessionInfo(sessionToSessionData(session), 0, undefined),
                    error: 'Could not fetch messages',
                };
            }
        }));
        return {
            query,
            results: enhanced,
            totalCount: enhanced.length,
        };
    }
    catch (error) {
        console.error('Error searching sessions:', error);
        return {
            error: `Failed to search sessions: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
//# sourceMappingURL=search.js.map