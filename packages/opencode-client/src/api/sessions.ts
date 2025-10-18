/**
 * API abstraction layer for OpenCode session operations (unmocked)
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

// Eagerly capture env for client config
const baseURL = process.env.OPENCODE_SERVER_URL;
const timeout = process.env.OPENCODE_TIMEOUT ? Number(process.env.OPENCODE_TIMEOUT) : undefined;
const maxRetries = process.env.OPENCODE_RETRIES ? Number(process.env.OPENCODE_RETRIES) : undefined;
const logLevel = (process.env.OPENCODE_LOG_LEVEL as any) || undefined;
const authHeader = process.env.OPENCODE_AUTH_TOKEN
  ? { Authorization: `Bearer ${process.env.OPENCODE_AUTH_TOKEN}` }
  : undefined;

let clientPromise: Promise<any> | null = null;

async function getClient(): Promise<any> {
  if (clientPromise) return clientPromise;
  const sdk: any = await import('@opencode-ai/sdk');

  // Prefer factory helpers when available
  if (typeof sdk.createOpencode === 'function') {
    clientPromise = sdk
      .createOpencode({ serverUrl: baseURL, timeout, maxRetries, logLevel, fetchOptions: { headers: authHeader } })
      .then((r: any) => r.client ?? r);
    return clientPromise;
  }
  if (typeof sdk.createOpencodeClient === 'function') {
    clientPromise = Promise.resolve(
      sdk.createOpencodeClient({ serverUrl: baseURL, timeout, maxRetries, logLevel, fetchOptions: { headers: authHeader } }),
    );
    return clientPromise;
  }
  // Fallback: default export constructor
  if (typeof sdk.default === 'function') {
    clientPromise = Promise.resolve(
      new sdk.default({ baseURL, timeout, maxRetries, logLevel, fetchOptions: { headers: authHeader } }),
    );
    return clientPromise;
  }
  throw new Error('Unable to initialize @opencode-ai/sdk client');
}

/**
 * List all active sessions
 */
export async function listSessions(options: ListSessionsOptions = {}): Promise<Session[]> {
  const client = await getClient();
  if (typeof client.session?.list === 'function') {
    const res = await client.session.list({
      // Some SDK variants accept pagination directly; harmless if ignored
      // @ts-expect-error potential undocumented params
      limit: options.limit,
      offset: options.offset,
    });
    // Normalize
    return (res as any).sessions ?? (res as any) ?? [];
  }
  // Raw fallback
  const { data } = await client.get('/session', {
    query: { limit: options.limit, offset: options.offset },
  }).withResponse?.() ?? { data: await client.get('/session', { query: { limit: options.limit, offset: options.offset } }) };
  return (data as any).sessions ?? (data as any) ?? [];
}

/**
 * Get details of a specific session
 */
export async function getSession(sessionId: string): Promise<Session> {
  const client = await getClient();
  if (typeof client.session?.get === 'function') {
    return (await client.session.get(sessionId)) as any;
  }
  return (await client.get(`/session/${encodeURIComponent(sessionId)}`)) as any;
}

/**
 * Create a new session (optionally initialize with title/files/delegates)
 */
export async function createSession(options: CreateSessionOptions = {}): Promise<Session> {
  const client = await getClient();
  const session = (await client.session.create({ body: options.title ? { title: options.title } : undefined })) as any;

  const { title, files, delegates } = options;
  if (title || (files && files.length) || (delegates && delegates.length)) {
    if (typeof client.session?.init === 'function') {
      await client.session.init(session.id, { title, files, delegates } as any);
    } else {
      await client.post(`/session/${encodeURIComponent(session.id)}/init`, {
        body: { title, files, delegates },
      });
    }
  }
  return getSession(session.id);
}

/**
 * Close a session (maps to delete)
 */
export async function closeSession(sessionId: string): Promise<void> {
  const client = await getClient();
  if (typeof client.session?.delete === 'function') {
    await client.session.delete(sessionId);
    return;
  }
  await client.delete?.(`/session/${encodeURIComponent(sessionId)}`) ?? client.post(`/session/${encodeURIComponent(sessionId)}/delete`);
}

/**
 * Search past sessions by semantic embedding (fallback to raw endpoint if provided by server)
 */
export async function searchSessions(options: SearchSessionsOptions): Promise<Session[]> {
  const client = await getClient();
  const { query, k } = options;
  if (typeof client.session?.search === 'function') {
    const out = await client.session.search({ query, k });
    return (out as any).results ?? (out as any) ?? [];
  }
  const resp = await client.get?.('/session/search', { query: { q: query, k } });
  return (resp as any).results ?? (resp as any) ?? [];
}
