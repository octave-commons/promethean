// SPDX-License-Identifier: GPL-3.0-only

import type { OpencodeClient } from '@opencode-ai/sdk';
import { getSessionStore } from '../../stores.js';

export async function getSessionMessages(
  client: OpencodeClient,
  sessionId: string,
): Promise<unknown[]> {
  try {
    // First try to get from client
    const result = await client.session
      .messages({
        path: { id: sessionId },
      })
      .catch((error: unknown) => {
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
  } catch (error: unknown) {
    console.error(`Error getting session messages for ${sessionId}:`, error);
    return [];
  }
}
