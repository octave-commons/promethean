// SPDX-License-Identifier: GPL-3.0-only

import { getSessionStore } from '../../stores.js';
import { SessionUtils } from '../../utils/SessionUtils.js';

// Define Session type locally since API was removed
type Session = {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
};

type SessionEntry = {
  readonly text: string;
  readonly id?: string;
  readonly timestamp?: Date | number | string;
};

export type GetSessionResult =
  | {
      readonly session: unknown;
      readonly messages: unknown[];
    }
  | {
      readonly error: string;
    };

const formatTimestamp = (timestamp?: Date | number | string): string => {
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

const extractSessionFromText = (text: string): Partial<Session> => {
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

const createFallbackSession = (entry: SessionEntry): Session => {
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
const parseSessionData = (entry: SessionEntry): Session => {
  try {
    return JSON.parse(entry.text) as Session;
  } catch {
    return createFallbackSession(entry);
  }
};

const getSessionEntry = async (sessionId: string): Promise<SessionEntry | null> => {
  const store = await getSessionStore();
  return store.get(sessionId);
};

const parseMessages = (messageEntry: { text: string }): unknown[] => {
  try {
    return JSON.parse(messageEntry.text) as unknown[];
  } catch {
    return [];
  }
};

const createSessionResponse = (
  session: Session,
  messages: unknown[],
  limit?: number,
  offset?: number,
): GetSessionResult => {
  const sessionInfo = SessionUtils.createSessionInfo(session as any, messages.length, undefined);
  const paginatedMessages = limit ? messages.slice(offset || 0, (offset || 0) + limit) : messages;

  return {
    session: sessionInfo,
    messages: paginatedMessages,
  };
};

const getMessagesForSession = async (sessionId: string): Promise<unknown[]> => {
  const messageKey = `session:${sessionId}:messages`;
  const store = await getSessionStore();
  const messageEntry = await store.get(messageKey);

  if (!messageEntry) {
    return [];
  }

  return parseMessages(messageEntry);
};

export async function get({
  sessionId,
  limit,
  offset,
}: {
  readonly sessionId: string;
  readonly limit?: number;
  readonly offset?: number;
}): Promise<GetSessionResult> {
  const sessionEntry = await getSessionEntry(sessionId);
  if (!sessionEntry) {
    return { error: 'Session not found in dual store' };
  }

  const session = parseSessionData(sessionEntry);
  const messages = await getMessagesForSession(sessionId);

  return createSessionResponse(session, messages, limit, offset);
}
