/**
 * API abstraction layer for OpenCode event operations
 * Thin wrapper around actions layer
 */

export interface Event {
  id: string;
  type: string;
  timestamp?: string;
  sessionId?: string;
  properties?: any;
  time?: string;
  createdAt?: string;
}

export interface ListEventsOptions {
  limit?: number;
  type?: string;
  eventType?: string;
}

// Client management (reuse from sessions)
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

  if (typeof sdk.createOpencode === 'function') {
    clientPromise = sdk
      .createOpencode({
        serverUrl: baseURL,
        timeout,
        maxRetries,
        logLevel,
        fetchOptions: { headers: authHeader },
      })
      .then((r: any) => r.client ?? r);
    return clientPromise;
  }
  if (typeof sdk.createOpencodeClient === 'function') {
    clientPromise = Promise.resolve(
      sdk.createOpencodeClient({
        serverUrl: baseURL,
        timeout,
        maxRetries,
        logLevel,
        fetchOptions: { headers: authHeader },
      }),
    );
    return clientPromise;
  }
  if (typeof sdk.default === 'function') {
    clientPromise = Promise.resolve(
      new sdk.default({
        baseURL,
        timeout,
        maxRetries,
        logLevel,
        fetchOptions: { headers: authHeader },
      }),
    );
    return clientPromise;
  }
  throw new Error('Unable to initialize @opencode-ai/sdk client');
}

/**
 * List recent events
 */
export async function listEvents(options: ListEventsOptions = {}): Promise<Event[]> {
  const { list } = await import('../actions/events/list.js');

  // Try to get events without client first (dual store only)
  try {
    const result = await list({
      k: options.limit,
      eventType: options.eventType || options.type,
      client: null, // Pass null client to force dual store only
    });

    const parsed = JSON.parse(result);
    if (parsed.events && parsed.events.length > 0) {
      return parsed.events;
    }
  } catch (error) {
    console.warn('Dual store events failed, attempting server client:', error);
  }

  // Fallback to server client if dual store has no events
  try {
    const client = await getClient();
    const result = await list({
      k: options.limit,
      eventType: options.eventType || options.type,
      client,
    });

    const parsed = JSON.parse(result);
    return parsed.events || [];
  } catch (clientError) {
    console.warn('Server client also failed, returning empty result:', clientError);
    return [];
  }
}
