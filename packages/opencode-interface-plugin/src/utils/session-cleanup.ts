// SPDX-License-Identifier: GPL-3.0-only

import type { SessionInfo } from '../types/SessionInfo.js';

export interface CleanupSessionInfo extends SessionInfo {
  createdAt?: string | number;
  time?: {
    created?: string;
    updated?: string;
  };
}

/**
 * Deduplicate sessions by keeping only most recent version of each session ID
 */
export function deduplicateSessions(sessions: CleanupSessionInfo[]): CleanupSessionInfo[] {
  const sessionMap = new Map<string, CleanupSessionInfo>();

  for (const session of sessions) {
    if (!session || !session.id) continue;

    const existing = sessionMap.get(session.id);
    const sessionTime =
      session.time?.created ||
      (typeof session.createdAt === 'string' ? session.createdAt : session.createdAt?.toString());
    const existingTime =
      existing?.time?.created ||
      (typeof existing?.createdAt === 'string'
        ? existing.createdAt
        : existing?.createdAt?.toString());

    // Keep session with most recent timestamp
    if (!existing || !existingTime || (sessionTime && existingTime && sessionTime > existingTime)) {
      sessionMap.set(session.id, session);
    }
  }

  return Array.from(sessionMap.values());
}
