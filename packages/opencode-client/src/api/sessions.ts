/**
 * API abstraction layer for OpenCode session operations
 * Thin wrapper around actions layer
 */

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
const timeout = process.env.OPENCODE_TIMEOUT ? Number(process.env.OPENCODE_TIMEOUT) : 10000;
const maxRetries = process.env.OPENCODE_RETRIES ? Number(process.env.OPENCODE_RETRIES) : 3;
const logLevel = (process.env.OPENCODE_LOG_LEVEL as any) || 'info';
const authHeader = process.env.OPENCODE_AUTH_TOKEN
  ? { Authorization: `Bearer ${process.env.OPENCODE_AUTH_TOKEN}` }
  : undefined;

// Prevent server auto-start
process.env.OPENCODE_NO_SERVER = 'true';

let clientPromise: Promise<any> | null = null;

async function getClient(): Promise<any> {
  if (clientPromise) return clientPromise;
  const { createOpencodeClient }: any = await import('@opencode-ai/sdk');

  clientPromise = Promise.resolve(
    createOpencodeClient({
      baseUrl: baseURL,
      timeout,
      maxRetries,
      logLevel,
      fetchOptions: { headers: authHeader },
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
    limit: options.limit || 20,
    offset: options.offset || 0,
  });

  return response.data || [];
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
  const { create } = await import('../actions/sessions/create.js');

  const result = await create({
    title: options.title,
    files: options.files,
    delegates: options.delegates,
    client,
  });

  return JSON.parse(result);
}

/**
 * Close a session
 */
export async function closeSession(sessionId: string): Promise<void> {
  const { close } = await import('../actions/sessions/close.js');

  await close({
    sessionId,
  });
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
