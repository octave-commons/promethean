import { SessionUtils, sessionStore } from '../../index.js';

import {
  deduplicateSessions,
  type SessionInfo as CleanupSessionInfo,
} from '../../utils/session-cleanup.js';
import { SessionData } from '../../types/SessionData.js';
import type { StoreSession } from '../../types/StoreSession.js';
import type { SessionInfo } from '../../SessionInfo.js';

/**
 * Extract session ID from legacy text format
 */
function extractSessionIdFromText(text: string): string | null {
  const sessionMatch = text.match(/Session:\s*(\w+)/);
  return sessionMatch?.[1] || null;
}

/**
 * Create session data from timestamp
 */
function createSessionDataFromTimestamp(
  sessionId: string,
  title: string,
  timestamp: number | string | Date | undefined,
): SessionData {
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
function parseSessionData(session: StoreSession): SessionData {
  try {
    return JSON.parse(session.text);
  } catch (error) {
    // Handle legacy plain text format - extract session ID from text
    const sessionId = extractSessionIdFromText(session.text);
    if (sessionId) {
      return createSessionDataFromTimestamp(sessionId, `Session ${sessionId}`, session.timestamp);
    }

    // Fallback - create minimal session object
    return createSessionDataFromTimestamp(
      session.id?.toString() || 'unknown',
      'Legacy Session',
      session.timestamp,
    );
  }
}

function calculateFetchLimit(limit: number, offset: number): number {
  return Math.min(limit + offset + 50, 500);
}

function createEmptyResponse(limit: number, offset: number): string {
  return JSON.stringify({
    sessions: [],
    totalCount: 0,
    pagination: { limit, offset, hasMore: false },
  });
}

function sortSessionsByTime(sessions: CleanupSessionInfo[]): CleanupSessionInfo[] {
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

async function getSessionMessages(sessionId: string): Promise<unknown[]> {
  const messageKey = `session:${sessionId}:messages`;
  const allStored = await sessionStore.getMostRecent(100);
  const messageEntry = allStored.find((entry) => entry.id === messageKey);

  if (!messageEntry) {
    return [];
  }

  return JSON.parse(messageEntry.text);
}

async function enhanceSessionWithMessages(session: CleanupSessionInfo): Promise<SessionInfo> {
  try {
    const messages = await getSessionMessages(session.id);
    // Convert CleanupSessionInfo to SessionData for SessionUtils
    const sessionData: SessionData = {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.createdAt,
      lastActivity: session.createdAt,
      status: 'unknown',
      time: session.time,
    } as SessionData;
    return SessionUtils.createSessionInfo(sessionData, messages.length, undefined);
  } catch (error: unknown) {
    console.error(`Error processing session ${session.id}:`, error);
    // Convert CleanupSessionInfo to SessionData for SessionUtils
    const sessionData: SessionData = {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.createdAt,
      lastActivity: session.createdAt,
      status: 'unknown',
      time: session.time,
    } as SessionData;
    return {
      ...SessionUtils.createSessionInfo(sessionData, 0, undefined),
      error: 'Could not fetch messages',
    } as SessionInfo & { error: string };
  }
}

function createSessionSummary(sessions: SessionInfo[]): Record<string, number> {
  return {
    active: sessions.filter((s) => s.activityStatus === 'active').length,
    waiting_for_input: sessions.filter((s) => s.activityStatus === 'waiting_for_input').length,
    idle: sessions.filter((s) => s.activityStatus === 'idle').length,
    agentTasks: sessions.filter((s) => s.isAgentTask).length,
  };
}

function createListResponse(
  sessions: SessionInfo[],
  totalCount: number,
  limit: number,
  offset: number,
): string {
  const hasMore = offset + limit < totalCount;

  return JSON.stringify(
    {
      sessions,
      totalCount,
      pagination: {
        limit,
        offset,
        hasMore,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary: createSessionSummary(sessions),
    },
    null,
    2,
  );
}

function logDebug(debugEnabled: boolean, message: string, data?: unknown): void {
  if (debugEnabled) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
}

function logSessionInfo(debugEnabled: boolean, sessions: CleanupSessionInfo[]): void {
  if (debugEnabled) {
    console.log(`[INFO] Session IDs being processed:`);
    sessions.slice(0, 5).forEach((s) => {
      console.log(`  - ${s.id}`);
    });
  }
}

export async function list({ limit, offset }: { limit: number; offset: number }): Promise<string> {
  const debugEnabled = Boolean(process.env.OPENCODE_DEBUG);

  try {
    logDebug(debugEnabled, `list called with limit=${limit}, offset=${offset}`);

    const fetchLimit = calculateFetchLimit(limit, offset);
    logDebug(debugEnabled, `fetchLimit=${fetchLimit}`);

    const storedSessions = await sessionStore.getMostRecent(fetchLimit);
    logDebug(debugEnabled, `retrieved ${storedSessions?.length || 0} sessions from store`);

    if (!storedSessions?.length) {
      return createEmptyResponse(limit, offset);
    }

    const parsedSessions = storedSessions.map((session) => parseSessionData(session));
    const sessionsList = deduplicateSessions(parsedSessions);

    logDebug(debugEnabled, `after deduplication: ${sessionsList?.length || 0} sessions`);
    logSessionInfo(debugEnabled, sessionsList);

    if (!sessionsList?.length) {
      return createEmptyResponse(limit, offset);
    }

    const sortedSessions = sortSessionsByTime(sessionsList);
    const paginated = sortedSessions.slice(offset, offset + limit);

    logDebug(
      debugEnabled,
      `after pagination: ${paginated.length} sessions (offset=${offset}, limit=${limit})`,
    );

    const enhanced = await Promise.all(
      paginated.map((session) => enhanceSessionWithMessages(session)),
    );

    return createListResponse(enhanced, sessionsList.length, limit, offset);
  } catch (error: unknown) {
    console.error('Error in list_sessions:', error);
    console.error('Parameters received:', { limit, offset });
    return `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`;
  }
}
