// SPDX-License-Identifier: GPL-3.0-only
// Serialization utilities

import type { SerializationOptions } from './types.js';
import { sessionActionSerializer, sessionListSerializer } from './session.js';
import { eventListSerializer } from './event.js';
import { messageListSerializer } from './message.js';
import { searchResultSerializer } from './search.js';
import type { SessionActionResult, SessionListResult } from './session.js';
import type { EventListResult } from './event.js';
import type { MessageListResult } from './message.js';
import type { SearchResult } from './search.js';

export type ActionResult =
  | SessionActionResult
  | SessionListResult
  | EventListResult
  | MessageListResult
  | SearchResult;

export function serializeActionResult<T extends ActionResult>(
  result: T,
  options: SerializationOptions = { format: 'markdown' },
): string {
  // Type guards to determine the result type
  if ('success' in result && typeof result.success === 'boolean') {
    return sessionActionSerializer.serialize(result as SessionActionResult);
  }

  if ('sessions' in result && !('events' in result) && !('messages' in result)) {
    return sessionListSerializer.serialize(result as SessionListResult);
  }

  if ('events' in result && !('sessions' in result) && !('messages' in result)) {
    return eventListSerializer.serialize(result as EventListResult);
  }

  if (
    'messages' in result &&
    'sessionId' in result &&
    !('events' in result) &&
    !('sessions' in result)
  ) {
    return messageListSerializer.serialize(result as MessageListResult);
  }

  if (
    'sessions' in result &&
    'events' in result &&
    'messages' in result &&
    'query' in result &&
    'summary' in result
  ) {
    return searchResultSerializer.serialize(result as SearchResult);
  }

  // Fallback to JSON serialization
  return JSON.stringify(result, null, options.pretty ? 2 : 0);
}
