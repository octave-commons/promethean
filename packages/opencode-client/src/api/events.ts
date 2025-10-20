/**
 * API abstraction layer for OpenCode event operations
 * Thin wrapper around actions layer
 */

import { createOpencode } from '@opencode-ai/sdk';
import type { SessionClient } from '../types/index.js';

export interface Event {
  id: string;
  type: string;
  timestamp?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  time?: string;
  createdAt?: string;
}

export interface ListEventsOptions {
  limit?: number;
  type?: string;
  eventType?: string;
}

// Client management (reuse from sessions)
const timeout = process.env.OPENCODE_TIMEOUT ? Number(process.env.OPENCODE_TIMEOUT) : undefined;

async function getClient(): Promise<SessionClient> {
  return createOpencode({
    timeout,
  }).then((r: SessionClient | { client?: SessionClient }) =>
    'client' in r ? (r.client as SessionClient) : (r as SessionClient),
  );
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
      client: undefined, // Pass undefined client to force dual store only
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
