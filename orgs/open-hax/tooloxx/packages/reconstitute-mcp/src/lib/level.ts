/**
 * LevelDB wrapper for storing session data, paths, and notes.
 */

import type { Level } from 'level';
import { loadConfig } from './config.js';
import { debug } from './log.js';

let dbInstance: Level<string, string> | null = null;

/**
 * Get or create the LevelDB instance.
 */
export async function getDb(): Promise<Level<string, string>> {
  if (dbInstance) {
    return dbInstance;
  }

  const config = loadConfig();
  const { Level } = await import('level');
  dbInstance = new Level(config.levelPath, {
    valueEncoding: 'json',
  });

  debug('LevelDB initialized', { path: config.levelPath });
  return dbInstance;
}

/**
 * Close the LevelDB instance.
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    debug('LevelDB closed');
  }
}

/**
 * Key prefixes for different data types.
 */
export const KeyPrefix = {
  /** Session data: run:<runId>:session:<sessionId> */
  SESSION: 'run:*:session:',
  /** Paths recorded: path:<path> */
  PATH: 'path:',
  /** Notes: note:<title> */
  NOTE: 'note:',
  /** TTL cache: ttl:<key> */
  TTL: 'ttl:',
  /** Session metadata: session-meta:<sessionId> */
  SESSION_META: 'session-meta:',
} as const;

/**
 * Get a prefixed key for session data.
 */
export function sessionKey(runId: string, sessionId: string): string {
  return `run:${runId}:session:${sessionId}`;
}

/**
 * Parse a session key to extract runId and sessionId.
 */
export function parseSessionKey(key: string): { runId: string; sessionId: string } | null {
  const match = key.match(/^run:(.+):session:(.+)$/);
  if (!match) return null;
  return { runId: match[1], sessionId: match[2] };
}

/**
 * Store session data.
 */
export async function putSession(runId: string, sessionId: string, data: unknown): Promise<void> {
  const db = await getDb();
  const key = sessionKey(runId, sessionId);
  await db.put(key, JSON.stringify(data));
  debug('Session stored', { runId, sessionId });
}

/**
 * Get session data.
 */
export async function getSession<T>(runId: string, sessionId: string): Promise<T | null> {
  const db = await getDb();
  const key = sessionKey(runId, sessionId);
  try {
    const value = await db.get(key);
    return JSON.parse(value) as T;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

/**
 * Store a recorded path.
 */
export async function putPath(path: string, metadata: Record<string, unknown>): Promise<void> {
  const db = await getDb();
  const key = `path:${path}`;
  await db.put(key, JSON.stringify(metadata));
  debug('Path recorded', { path });
}

/**
 * List all recorded paths.
 */
export async function listPaths(): Promise<Array<{ path: string; metadata: Record<string, unknown> }>> {
  const db = await getDb();
  const paths: Array<{ path: string; metadata: Record<string, unknown> }> = [];

  for await (const [key, value] of db.iterator({ gt: 'path:', lt: 'path~' })) {
    const path = key.replace('path:', '');
    paths.push({ path, metadata: JSON.parse(value) });
  }

  return paths;
}

/**
 * Check if a path has been recorded.
 */
export async function hasPath(path: string): Promise<boolean> {
  const db = await getDb();
  try {
    await db.get(`path:${path}`);
    return true;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

/**
 * Store a note.
 */
export async function putNote(title: string, body: string, metadata?: Record<string, unknown>): Promise<void> {
  const db = await getDb();
  const key = `note:${title}`;
  const value = {
    body,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...metadata,
  };
  await db.put(key, JSON.stringify(value));
  debug('Note stored', { title });
}

/**
 * Get a note by title.
 */
export interface Note {
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Get a note by title.
 */
export async function getNote(title: string): Promise<Note | null> {
  const db = await getDb();
  try {
    const value = await db.get(`note:${title}`);
    const parsed = JSON.parse(value);
    return { title, ...parsed };
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

/**
 * List all notes.
 */
export async function listNotes(): Promise<Note[]> {
  const db = await getDb();
  const notes: Note[] = [];

  for await (const [key, value] of db.iterator({ gt: 'note:', lt: 'note~' })) {
    const title = key.replace('note:', '');
    const parsed = JSON.parse(value);
    notes.push({ title, ...parsed });
  }

  return notes;
}

/**
 * Delete a note.
 */
export async function deleteNote(title: string): Promise<boolean> {
  const db = await getDb();
  try {
    await db.del(`note:${title}`);
    debug('Note deleted', { title });
    return true;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

/**
 * Search notes by body content (simple substring match).
 */
export async function searchNotes(query: string): Promise<Note[]> {
  const notes = await listNotes();
  const lowerQuery = query.toLowerCase();
  return notes.filter((note) => note.body.toLowerCase().includes(lowerQuery));
}

/**
 * Store session metadata (e.g., session list, indexing status).
 */
export interface SessionMetadata {
  sessionId: string;
  messageCount: number;
  indexedAt: number;
  agentType?: string;
  dateRange?: { first: string; last: string };
}

export async function putSessionMeta(sessionId: string, meta: SessionMetadata): Promise<void> {
  const db = await getDb();
  await db.put(`session-meta:${sessionId}`, JSON.stringify(meta));
}

export async function getSessionMeta(sessionId: string): Promise<SessionMetadata | null> {
  const db = await getDb();
  try {
    const value = await db.get(`session-meta:${sessionId}`);
    return JSON.parse(value) as SessionMetadata;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

export async function listSessionMetas(): Promise<SessionMetadata[]> {
  const db = await getDb();
  const metas: SessionMetadata[] = [];

  for await (const [, value] of db.iterator({ gt: 'session-meta:', lt: 'session-meta~' })) {
    metas.push(JSON.parse(value) as SessionMetadata);
  }

  return metas;
}

/**
 * Delete a session and its metadata.
 */
export async function deleteSession(runId: string, sessionId: string): Promise<void> {
  const db = await getDb();
  await db.del(sessionKey(runId, sessionId));
  await db.del(`session-meta:${sessionId}`);
  debug('Session deleted', { runId, sessionId });
}
