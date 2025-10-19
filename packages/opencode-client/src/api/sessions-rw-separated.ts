/**
 * Read/Write Separated Sessions API
 * Write operations go directly to OpenCode SDK
 * Read operations come from local database cache
 */

import { createOpencodeClient } from '@opencode-ai/sdk';
import { sessionStore } from '../index.js';

export interface Session {
  id: string;
  title?: string;
  messageCount?: number;
  lastActivityTime?: string;
  activityStatus?: 'active' | 'waiting_for_input' | 'completed' | 'error';
  isAgentTask?: boolean;
  agentTaskStatus?: string;
  createdAt?: string;
}

export interface CreateSessionOptions {
  title?: string;
  files?: string[];
  delegates?: string[];
}

export interface ListSessionsOptions {
  limit?: number;
  offset?: number;
}

export interface SearchSessionsOptions {
  query: string;
  k?: number;
}

// Client management for write operations
const baseURL = process.env.OPENCODE_SERVER_URL || 'http://localhost:4096';
const authHeader = process.env.OPENCODE_AUTH_TOKEN
  ? { Authorization: `Bearer ${process.env.OPENCODE_AUTH_TOKEN}` }
  : undefined;

// Prevent server auto-start
process.env.OPENCODE_NO_SERVER = 'true';

let clientPromise: Promise<any> | null = null;

async function getClient(): Promise<any> {
  if (clientPromise) return clientPromise;

  clientPromise = Promise.resolve(
    createOpencodeClient({
      baseUrl: baseURL,
      headers: authHeader,
    }),
  );
  return clientPromise;
}

/**
 * WRITE OPERATION: Create a new session directly on OpenCode server
 */
export interface CreateSessionResponse {
  success: boolean;
  session: Session;
}

export async function createSession(
  options: CreateSessionOptions = {},
): Promise<CreateSessionResponse> {
  const client = await getClient();

  try {
    const response = await client.session.create({
      body: {
        title: options.title,
        files: options.files,
        delegates: options.delegates,
      },
    });

    const session = response.data || response;

    if (!session.id) {
      throw new Error('Server response missing session ID');
    }

    return {
      success: true,
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.time?.created,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to create session on OpenCode server: ${error.message}`);
  }
}

/**
 * WRITE OPERATION: Close a session directly on OpenCode server
 */
export async function closeSession(sessionId: string): Promise<void> {
  const client = await getClient();

  try {
    await client.session.close(sessionId);
  } catch (error: any) {
    throw new Error(`Failed to close session on OpenCode server: ${error.message}`);
  }
}

/**
 * WRITE OPERATION: Send a message directly via OpenCode server
 */
export interface SendMessageOptions {
  sessionId: string;
  message: string;
  model?: {
    providerID: string;
    modelID: string;
  };
}

export async function sendMessage(options: SendMessageOptions): Promise<any> {
  const client = await getClient();

  try {
    const response = await client.session.prompt({
      path: { id: options.sessionId },
      body: {
        message: options.message,
        model: options.model,
      },
    });

    return response.data || response;
  } catch (error: any) {
    throw new Error(`Failed to send message via OpenCode server: ${error.message}`);
  }
}

/**
 * READ OPERATION: List sessions from local database cache
 */
export async function listSessions(options: ListSessionsOptions = {}): Promise<Session[]> {
  if (!sessionStore) {
    throw new Error('Session store not initialized. Call initializeStores() first.');
  }

  try {
    // Get most recent sessions from local database
    const limit = options.limit || 20;
    const sessions = await sessionStore.getMostRecent(limit);

    return sessions.map(
      (doc): Session => ({
        id: doc.id,
        title: doc.metadata?.title as string | undefined,
        messageCount: doc.metadata?.messageCount as number | undefined,
        lastActivityTime: doc.metadata?.lastActivityTime as string | undefined,
        activityStatus: doc.metadata?.activityStatus as
          | 'active'
          | 'waiting_for_input'
          | 'completed'
          | 'error'
          | undefined,
        isAgentTask: doc.metadata?.isAgentTask as boolean | undefined,
        agentTaskStatus: doc.metadata?.agentTaskStatus as string | undefined,
        createdAt: doc.metadata?.createdAt as string | undefined,
      }),
    );
  } catch (error: any) {
    throw new Error(`Failed to list sessions from local cache: ${error.message}`);
  }
}

/**
 * READ OPERATION: Get specific session from local database cache
 */
export async function getSession(sessionId: string): Promise<Session> {
  if (!sessionStore) {
    throw new Error('Session store not initialized. Call initializeStores() first.');
  }

  try {
    const doc = await sessionStore.get(sessionId);

    if (!doc) {
      throw new Error(`Session ${sessionId} not found in local cache`);
    }

    return {
      id: doc.id,
      title: doc.metadata?.title as string | undefined,
      messageCount: doc.metadata?.messageCount as number | undefined,
      lastActivityTime: doc.metadata?.lastActivityTime as string | undefined,
      activityStatus: doc.metadata?.activityStatus as
        | 'active'
        | 'waiting_for_input'
        | 'completed'
        | 'error'
        | undefined,
      isAgentTask: doc.metadata?.isAgentTask as boolean | undefined,
      agentTaskStatus: doc.metadata?.agentTaskStatus as string | undefined,
      createdAt: doc.metadata?.createdAt as string | undefined,
    };
  } catch (error: any) {
    throw new Error(`Failed to get session from local cache: ${error.message}`);
  }
}

/**
 * READ OPERATION: Search sessions from local database cache
 */
export async function searchSessions(options: SearchSessionsOptions): Promise<Session[]> {
  if (!sessionStore) {
    throw new Error('Session store not initialized. Call initializeStores() first.');
  }

  try {
    // Search using text relevance from local database
    const limit = options.k || 10;
    const sessions = await sessionStore.getMostRelevant([options.query], limit);

    return sessions.map(
      (doc): Session => ({
        id: doc.id,
        title: doc.metadata?.title as string | undefined,
        messageCount: doc.metadata?.messageCount as number | undefined,
        lastActivityTime: doc.metadata?.lastActivityTime as string | undefined,
        activityStatus: doc.metadata?.activityStatus as
          | 'active'
          | 'waiting_for_input'
          | 'completed'
          | 'error'
          | undefined,
        isAgentTask: doc.metadata?.isAgentTask as boolean | undefined,
        agentTaskStatus: doc.metadata?.agentTaskStatus as string | undefined,
        createdAt: doc.metadata?.createdAt as string | undefined,
      }),
    );
  } catch (error: any) {
    throw new Error(`Failed to search sessions in local cache: ${error.message}`);
  }
}

/**
 * READ OPERATION: Get messages from local database cache
 */
export interface Message {
  info: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    time: {
      created: number;
      updated: number;
    };
  };
  parts: Array<{
    type: 'text' | 'image' | 'file';
    text?: string;
    [key: string]: any;
  }>;
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  if (!sessionStore) {
    throw new Error('Session store not initialized. Call initializeStores() first.');
  }

  try {
    const doc = await sessionStore.get(sessionId);

    if (!doc) {
      throw new Error(`Session ${sessionId} not found in local cache`);
    }

    // Messages are stored in metadata as an array
    return (doc.metadata?.messages as Message[]) || [];
  } catch (error: any) {
    throw new Error(`Failed to get messages from local cache: ${error.message}`);
  }
}

/**
 * UTILITY: Check if local cache is synchronized
 */
export async function checkCacheStatus(): Promise<{
  totalSessions: number;
  lastSyncTime?: number;
  isIndexerRunning: boolean;
}> {
  if (!sessionStore) {
    throw new Error('Session store not initialized. Call initializeStores() first.');
  }

  try {
    // Get all sessions to count them
    const allSessions = await sessionStore.getMostRecent(1000); // Get up to 1000 to count

    // In a real implementation, we would check if the indexer process is running
    // and get the last sync time from a status file or process manager
    const isIndexerRunning = false; // Would check actual process status

    return {
      totalSessions: allSessions.length,
      lastSyncTime: undefined, // Would get from indexer status
      isIndexerRunning,
    };
  } catch (error: any) {
    throw new Error(`Failed to check cache status: ${error.message}`);
  }
}
