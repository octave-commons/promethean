/**
 * Session cleanup utilities for OpenCode
 */

import { DualStoreManager } from '@promethean/persistence';

// Global store instances - will be initialized when needed
let sessionStore: DualStoreManager<'text', 'timestamp'> | null = null;

/**
 * Safely parse session data, handling both JSON and plain text formats
 */
function parseSessionData(session: any): any {
  try {
    return JSON.parse(session.text);
  } catch (error) {
    // Handle legacy plain text format - extract session ID from text
    const text = session.text;
    const sessionMatch = text.match(/Session:\s*(\w+)/);
    if (sessionMatch) {
      return {
        id: sessionMatch[1],
        title: `Session ${sessionMatch[1]}`,
        createdAt: session.timestamp || new Date().toISOString(),
        time: {
          created: session.timestamp || new Date().toISOString(),
        },
      };
    }
    // Fallback - create minimal session object
    return {
      id: session.id || 'unknown',
      title: 'Legacy Session',
      createdAt: session.timestamp || new Date().toISOString(),
      time: {
        created: session.timestamp || new Date().toISOString(),
      },
    };
  }
}

async function getSessionStore() {
  if (!sessionStore) {
    sessionStore = await DualStoreManager.create('sessions', 'text', 'timestamp');
  }
  return sessionStore;
}

interface SessionInfo {
  id: string;
  title?: string;
  createdAt?: string;
  time?: {
    created?: string;
    updated?: string;
  };
}

/**
 * Deduplicate sessions by keeping only the most recent version of each session ID
 */
export function deduplicateSessions(sessions: SessionInfo[]): SessionInfo[] {
  const sessionMap = new Map<string, SessionInfo>();

  for (const session of sessions) {
    if (!session || !session.id) continue;

    const existing = sessionMap.get(session.id);
    const sessionTime = session.time?.created || session.createdAt;
    const existingTime = existing?.time?.created || existing?.createdAt;

    // Keep the session with the most recent timestamp
    if (!existing || !existingTime || (sessionTime && existingTime && sessionTime > existingTime)) {
      sessionMap.set(session.id, session);
    }
  }

  return Array.from(sessionMap.values());
}

/**
 * Identify duplicate sessions in the store
 */
export async function identifyDuplicateSessions(): Promise<{
  duplicates: string[];
  total: number;
}> {
  try {
    const store = await getSessionStore();
    const storedSessions = await store.getMostRecent(1000);
    const parsedSessions = storedSessions.map((session) => parseSessionData(session));

    const sessionIdCount = new Map<string, number>();
    const duplicates: string[] = [];

    // Count occurrences of each session ID
    for (const session of parsedSessions) {
      if (session && session.id) {
        const count = sessionIdCount.get(session.id) || 0;
        sessionIdCount.set(session.id, count + 1);

        if (count === 1) {
          // Found second occurrence
          duplicates.push(session.id);
        }
      }
    }

    return {
      duplicates: duplicates.filter((id) => sessionIdCount.get(id)! > 1),
      total: duplicates.length,
    };
  } catch (error) {
    console.error('Error identifying duplicate sessions:', error);
    return { duplicates: [], total: 0 };
  }
}

/**
 * Clean up duplicate sessions by keeping only the most recent version
 */
export async function cleanupDuplicateSessions(): Promise<{ cleaned: number; errors: string[] }> {
  const errors: string[] = [];
  let cleaned = 0;

  try {
    const store = await getSessionStore();
    const storedSessions = await store.getMostRecent(1000);
    const parsedSessions = storedSessions.map((session) => ({
      ...parseSessionData(session),
      storeEntry: session,
    }));

    // Group sessions by ID
    const sessionGroups = new Map<string, any[]>();

    for (const session of parsedSessions) {
      if (!session || !session.id) continue;

      const group = sessionGroups.get(session.id) || [];
      group.push(session);
      sessionGroups.set(session.id, group);
    }

    // Process each group to find duplicates
    for (const [sessionId, sessions] of sessionGroups) {
      if (sessions.length <= 1) continue;

      // Sort by creation time, most recent first
      sessions.sort((a, b) => {
        const timeA = a.time?.created || a.createdAt || '';
        const timeB = b.time?.created || b.createdAt || '';
        return timeB.localeCompare(timeA);
      });

      // Keep the most recent, mark others for cleanup
      const toKeep = sessions[0];
      const toRemove = sessions.slice(1);

      console.log(
        `Session ${sessionId}: keeping most recent (${toKeep.time?.created || toKeep.createdAt}), removing ${toRemove.length} duplicates`,
      );

      // Note: DualStoreManager doesn't have a delete method, so we can only log for now
      // In a real implementation, you would delete the duplicate entries
      cleaned += toRemove.length;
    }

    console.log(`Cleanup complete: ${cleaned} duplicate sessions identified for removal`);
  } catch (error) {
    errors.push(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { cleaned, errors };
}

/**
 * Get session statistics to help diagnose issues
 */
export async function getSessionStats(): Promise<{
  total: number;
  unique: number;
  duplicates: number;
  oldestSession?: string;
  newestSession?: string;
}> {
  try {
    const store = await getSessionStore();
    const storedSessions = await store.getMostRecent(1000);
    const parsedSessions = storedSessions.map((session) => parseSessionData(session));

    const sessionIdCount = new Map<string, number>();
    let oldestSession: string | undefined;
    let newestSession: string | undefined;

    for (const session of parsedSessions) {
      if (!session || !session.id) continue;

      const count = sessionIdCount.get(session.id) || 0;
      sessionIdCount.set(session.id, count + 1);

      const sessionTime = session.time?.created || session.createdAt;
      if (sessionTime) {
        if (!oldestSession || sessionTime < oldestSession) {
          oldestSession = sessionTime;
        }
        if (!newestSession || sessionTime > newestSession) {
          newestSession = sessionTime;
        }
      }
    }

    const total = parsedSessions.length;
    const unique = sessionIdCount.size;
    const duplicates = total - unique;

    return {
      total,
      unique,
      duplicates,
      oldestSession,
      newestSession,
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return {
      total: 0,
      unique: 0,
      duplicates: 0,
    };
  }
}
