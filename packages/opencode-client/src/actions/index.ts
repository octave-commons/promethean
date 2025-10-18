// SPDX-License-Identifier: GPL-3.0-only
// Actions module index

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

// Task actions
export * from './tasks/index.js';

// Ollama actions
export * from './ollama/index.js';

// Process actions
export {
  start as startProcess,
  stop as stopProcess,
  list as listProcesses,
  status as processStatus,
  tail,
  err,
} from './process/index.js';
export * from './process/utils.js';

// Cache actions
export * from './cache/index.js';
