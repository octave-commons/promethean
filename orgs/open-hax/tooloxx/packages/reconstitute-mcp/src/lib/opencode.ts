/**
 * OpenCode SDK client for fetching sessions and messages.
 */

import { loadConfig } from './config.js';
import { debug, info, warn, error } from './log.js';

export interface OpenCodeSession {
  id: string;
  session_id: string;
  agent_type?: string;
  message_count: number;
  date_range?: {
    first_message: string;
    last_message: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OpenCodeMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool' | 'function' | 'tool_results' | 'tool_calls';
  content: string;
  timestamp: string;
  agent_type?: string;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  is_visible?: boolean;
  metadata?: Record<string, unknown>;
}

export interface OpenCodeSessionDetail {
  session_id: string;
  agent_type?: string;
  messages: OpenCodeMessage[];
  message_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Make a request to the OpenCode API.
 */
async function opencodeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = loadConfig();
  const url = `${config.opencodeBaseUrl}${endpoint}`;

  debug('OpenCode API request', { endpoint, url });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  // Add API key if available
  if (config.openaiApiKey) {
    headers['Authorization'] = `Bearer ${config.openaiApiKey}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenCode API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * List all sessions.
 */
export async function listSessions(limit: number = 100): Promise<OpenCodeSession[]> {
  info('Listing OpenCode sessions', { limit });

  const response = await opencodeRequest<{
    sessions: OpenCodeSession[];
  }>(`/api/v1/sessions?limit=${limit}`);

  debug('Sessions retrieved', { count: response.sessions.length });
  return response.sessions;
}

/**
 * Get a specific session by ID.
 */
export async function getSession(sessionId: string): Promise<OpenCodeSessionDetail> {
  info('Getting session', { sessionId });

  const response = await opencodeRequest<OpenCodeSessionDetail>(
    `/api/v1/sessions/${sessionId}`
  );

  debug('Session retrieved', {
    sessionId,
    messageCount: response.message_count,
  });

  return response;
}

/**
 * Get messages for a session with pagination.
 */
export async function getSessionMessages(
  sessionId: string,
  limit: number = 100,
  offset: number = 0
): Promise<OpenCodeMessage[]> {
  debug('Getting session messages', { sessionId, limit, offset });

  const response = await opencodeRequest<{
    messages: OpenCodeMessage[];
  }>(`/api/v1/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`);

  return response.messages;
}

/**
 * Get all messages for a session (handles pagination automatically).
 */
export async function getAllSessionMessages(sessionId: string): Promise<OpenCodeMessage[]> {
  info('Getting all messages for session', { sessionId });

  const allMessages: OpenCodeMessage[] = [];
  let offset = 0;
  const batchSize = 100;

  while (true) {
    const messages = await getSessionMessages(sessionId, batchSize, offset);
    if (messages.length === 0) break;
    allMessages.push(...messages);
    offset += messages.length;

    if (messages.length < batchSize) break;
  }

  debug('All messages retrieved', { sessionId, totalCount: allMessages.length });
  return allMessages;
}

/**
 * Get session metadata (lighter than full session).
 */
export async function getSessionMetadata(sessionId: string): Promise<OpenCodeSession | null> {
  try {
    const response = await opencodeRequest<OpenCodeSession>(
      `/api/v1/sessions/${sessionId}/metadata`
    );
    return response;
  } catch (err) {
    if ((err as Error).message.includes('404')) {
      return null;
    }
    throw err;
  }
}

/**
 * Search sessions by content.
 */
export async function searchSessions(
  query: string,
  limit: number = 20
): Promise<OpenCodeSession[]> {
  info('Searching sessions', { query, limit });

  const response = await opencodeRequest<{
    sessions: OpenCodeSession[];
  }>(`/api/v1/sessions/search?q=${encodeURIComponent(query)}&limit=${limit}`);

  return response.sessions;
}

/**
 * Get the total number of sessions.
 */
export async function countSessions(): Promise<number> {
  const response = await opencodeRequest<{ count: number }>('/api/v1/sessions/count');
  return response.count;
}

/**
 * Check if OpenCode is available.
 */
export async function checkOpenCodeHealth(): Promise<boolean> {
  const config = loadConfig();
  try {
    const response = await fetch(`${config.opencodeBaseUrl}/api/v1/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Convert OpenCode session to a searchable document.
 */
export function sessionToDocument(session: OpenCodeSessionDetail): string {
  const lines: string[] = [
    `Session: ${session.session_id}`,
    `Agent: ${session.agent_type ?? 'unknown'}`,
    `Messages: ${session.message_count}`,
    '',
    '--- Messages ---',
    '',
  ];

  for (const msg of session.messages) {
    lines.push(`[${msg.role}] ${msg.timestamp}`);
    if (msg.tool_calls) {
      lines.push(`Tools: ${msg.tool_calls.map((t) => t.function.name).join(', ')}`);
    }
    lines.push(msg.content.substring(0, 2000)); // Truncate very long messages
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Get messages as text for embedding.
 */
export function messagesToText(messages: OpenCodeMessage[]): string {
  return messages
    .filter((msg) => msg.is_visible !== false)
    .map((msg) => {
      let text = `[${msg.role}] `;
      if (msg.tool_calls) {
        text += `Tools: ${msg.tool_calls.map((t) => t.function.name).join(', ')} - `;
      }
      text += msg.content;
      return text;
    })
    .join('\n\n');
}
