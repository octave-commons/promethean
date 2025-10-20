// SPDX-License-Identifier: GPL-3.0-only
// Actions module index - Core functionality only: Events, Messages, Sessions

// Event actions
export type { EventContext } from './events/index.js';
export {
  handleSessionIdle,
  handleSessionUpdated,
  handleMessageUpdated,
  extractSessionId,
} from './events/index.js';

// Message actions
export * from './messages/index.js';

// Messaging actions
export * from './messaging/index.js';

// Session actions
export { create, close, get, search } from './sessions/index.js';
export { list as listSessions } from './sessions/index.js';
