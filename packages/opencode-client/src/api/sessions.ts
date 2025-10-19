/**
 * API abstraction layer for OpenCode session operations
 * Thin wrapper around actions layer
 */

import { createOpencodeClient } from '@opencode-ai/sdk';
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

// Client management
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
 * List all active sessions
 */
export async function listSessions(options: ListSessionsOptions = {}): Promise<Session[]> {
  const client = await getClient();

  const response = await client.session.list({
    // Server only supports directory query, not limit/offset
    // We'll handle pagination on the client side
  });

  const allSessions = response.data || [];

  // Apply pagination manually since server doesn't support it
  const limit = options.limit || 20;
  const offset = options.offset || 0;

  return allSessions.slice(offset, offset + limit);
}

/**
 * Get details of a specific session
 */
export async function getSession(sessionId: string): Promise<Session> {
  const client = await getClient();

  const response = await client.session.get(sessionId);
  return response.data || response;
}

/**
 * Create a new session
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
 * Close a session
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
 * Search sessions
 */
export async function searchSessions(options: SearchSessionsOptions): Promise<Session[]> {
  const { search } = await import('../actions/sessions/search.js');

  const result = await search({
    query: options.query,
    k: options.k,
  });

  const parsed = JSON.parse(result);
  return parsed.sessions || [];
}

/**
 * Get messages for a session
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
  const client = await getClient();

  try {
    const response = await client.session.messages({
      path: { id: sessionId },
    });

    return response.data || [];
  } catch (error: any) {
    throw new Error(`Failed to get messages from OpenCode server: ${error.message}`);
  }
}

/**
 * Send a message to a session
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
