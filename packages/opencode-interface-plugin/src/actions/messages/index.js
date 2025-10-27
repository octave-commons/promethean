// SPDX-License-Identifier: GPL-3.0-only
import { getSessionStore } from '../../stores.js';
export async function getSessionMessages(client, sessionId) {
    try {
        // First try to get from client
        const result = await client.session
            .messages({
            path: { id: sessionId },
        })
            .catch((error) => {
            console.error(`Error fetching messages for session ${sessionId}:`, error);
            return { data: [] };
        });
        if (result.data && Array.isArray(result.data)) {
            return result.data;
        }
        // Fallback to local store
        const messageKey = `session:${sessionId}:messages`;
        const store = await getSessionStore();
        const messageEntry = await store.get(messageKey);
        if (!messageEntry) {
            return [];
        }
        return JSON.parse(messageEntry.text);
    }
    catch (error) {
        console.error(`Error getting session messages for ${sessionId}:`, error);
        return [];
    }
}
//# sourceMappingURL=index.js.map