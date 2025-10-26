// SPDX-License-Identifier: GPL-3.0-only
// Actions module index - Core functionality only: Events, Messages, Sessions

// Event actions
export type { EventContext } from './events/index.js';
export type { SubscribeResult } from './events/subscribe.js';
export {
  handleSessionIdle,
  handleSessionUpdated,
  handleMessageUpdated,
  extractSessionId,
} from './events/index.js';
export { subscribe } from './events/subscribe.js';

// Message actions
export * from './messages/index.js';

// Messaging actions
export * from './messaging/index.js';

// Session actions
export type { CreateSessionResult } from './sessions/create.js';
export type { CloseSessionResult } from './sessions/close.js';
export type { GetSessionResult } from './sessions/get.js';
export type { ListSessionsResult } from './sessions/list.js';
export type { SearchSessionsResult } from './sessions/search.js';
export { create, close, get, search } from './sessions/index.js';
export { list as listSessions } from './sessions/index.js';
