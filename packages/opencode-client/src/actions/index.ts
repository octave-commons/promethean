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

// Ollama actions - specific exports to avoid conflicts
export type { Job, OllamaOptions } from './ollama/types.js';
export { getJobById, updateJobStatus } from './ollama/jobs.js';
export { listModels, type OllamaModel } from './ollama/models.js';
export { check } from './ollama/api.js';
export { processQueue } from './ollama/queue.js';
export {
  submitJob,
  getJobStatus,
  getJobResult,
  listJobs,
  cancelJob,
  getQueueInfo,
  submitFeedback,
} from './ollama/tools.js';

// Process actions
export {
  startProcess,
  stopProcess,
  listProcesses,
  getProcessList,
  checkProcessStatus,
  tailProcessOutput,
  tailProcessError,
  type StartProcessOptions,
  type StopProcessOptions,
  type StatusOptions,
  type TailOptions,
  type ProcessInfo,
} from './process/index.js';
export * from './process/utils.js';

// Cache actions - specific exports to avoid conflicts
export type { CacheEntry } from './cache/types.js';
export { initializeCache } from './cache/initialize.js';
export { checkCache } from './cache/check.js';
export { createCacheKey } from './cache/key.js';
export { storeInCache } from './cache/store.js';
export { manageCache } from './cache/manage.js';
