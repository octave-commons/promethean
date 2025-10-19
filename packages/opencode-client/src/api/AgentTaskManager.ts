import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from '../AgentTask.js';
import {
  TaskContext,
  loadPersistedTasks as loadPersistedTasksAction,
  verifySessionExists as verifySessionExistsAction,
  cleanupOrphanedTask as cleanupOrphanedTaskAction,
  updateTaskStatus as updateTaskStatusAction,
  monitorTasks as monitorTasksAction,
  createTask as createTaskAction,
  getAllTasks as getAllTasksAction,
} from '../actions/tasks/index.js';

// Global state for backward compatibility
let agentTaskStore: DualStoreManager<'text', 'timestamp'>;
let agentTasks = new Map<string, AgentTask>();

export function initializeStores(
  _sessionStore: DualStoreManager<'text', 'timestamp'>,
  _agentTaskStore: DualStoreManager<'text', 'timestamp'>,
) {
  agentTaskStore = _agentTaskStore;
}

export async function loadPersistedTasks(client?: any) {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return loadPersistedTasksAction(context, client);
}

export async function verifySessionExists(client: any, sessionId: string): Promise<boolean> {
  return verifySessionExistsAction(client, sessionId);
}

export async function cleanupOrphanedTask(sessionId: string) {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return cleanupOrphanedTaskAction(context, sessionId);
}

export async function updateTaskStatus(
  sessionId: string,
  status: AgentTask['status'],
  completionMessage?: string,
) {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return updateTaskStatusAction(context, sessionId, status, completionMessage);
}

export function monitorTasks() {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return monitorTasksAction(context);
}

export async function createTask(sessionId: string, task: string): Promise<AgentTask> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return createTaskAction(context, sessionId, task);
}

export async function getAllTasks(): Promise<Map<string, AgentTask>> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return getAllTasksAction(context);
}

export function parseTimestamp(timestamp: any): number {
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp).getTime();
  return Date.now();
}

// Export the agent tasks map for backward compatibility
export { agentTasks };

// Create a class-like export for backward compatibility
export const import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from '../AgentTask.js';
import {
  TaskContext,
  SessionClient,
  loadPersistedTasks as loadPersistedTasksAction,
  verifySessionExists as verifySessionExistsAction,
  cleanupOrphanedTask as cleanupOrphanedTaskAction,
  updateTaskStatus as updateTaskStatusAction,
  monitorTasks as monitorTasksAction,
  createTask as createTaskAction,
  getAllTasks as getAllTasksAction,
} from '../actions/tasks/index.js';

// Global state for backward compatibility
let agentTaskStore: DualStoreManager<'text', 'timestamp'>;
const agentTasks = new Map<string, AgentTask>();

export function initializeStores(
  _sessionStore: DualStoreManager<'text', 'timestamp'>,
  _agentTaskStore: DualStoreManager<'text', 'timestamp'>,
): void {
  agentTaskStore = _agentTaskStore;
}

export async function loadPersistedTasks(client?: SessionClient): Promise<{ loadedCount: number; cleanedCount: number }> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return loadPersistedTasksAction(context, client);
}

export async function verifySessionExists(client: SessionClient, sessionId: string): Promise<boolean> {
  return verifySessionExistsAction(client, sessionId);
}

export async function cleanupOrphanedTask(sessionId: string): Promise<void> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return cleanupOrphanedTaskAction(context, sessionId);
}

export async function updateTaskStatus(
  sessionId: string,
  status: AgentTask['status'],
  completionMessage?: string,
): Promise<void> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return updateTaskStatusAction(context, sessionId, status, completionMessage);
}

export function monitorTasks(): void {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return monitorTasksAction(context);
}

export async function createTask(sessionId: string, task: string): Promise<AgentTask> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return createTaskAction(context, sessionId, task);
}

export async function getAllTasks(): Promise<Map<string, AgentTask>> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return getAllTasksAction(context);
}

export function parseTimestamp(timestamp: Timestamp): number {
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp).getTime();
  return Date.now();
}

// Export the agent tasks map for backward compatibility
export { agentTasks };

// Create a class-like export for backward compatibility
export const import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from '../AgentTask.js';
import { Timestamp } from '../types/index.js';
import {
  TaskContext,
  SessionClient,
  loadPersistedTasks as loadPersistedTasksAction,
  verifySessionExists as verifySessionExistsAction,
  cleanupOrphanedTask as cleanupOrphanedTaskAction,
  updateTaskStatus as updateTaskStatusAction,
  monitorTasks as monitorTasksAction,
  createTask as createTaskAction,
  getAllTasks as getAllTasksAction,
} from '../actions/tasks/index.js';

// Global state for backward compatibility
let agentTaskStore: DualStoreManager<'text', 'timestamp'>;
const agentTasks = new Map<string, AgentTask>();

export function initializeStores(
  _sessionStore: DualStoreManager<'text', 'timestamp'>,
  _agentTaskStore: DualStoreManager<'text', 'timestamp'>,
): void {
  agentTaskStore = _agentTaskStore;
}

export async function loadPersistedTasks(client?: SessionClient): Promise<{ loadedCount: number; cleanedCount: number }> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return loadPersistedTasksAction(context, client);
}

export async function verifySessionExists(client: SessionClient, sessionId: string): Promise<boolean> {
  return verifySessionExistsAction(client, sessionId);
}

export async function cleanupOrphanedTask(sessionId: string): Promise<void> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return cleanupOrphanedTaskAction(context, sessionId);
}

export async function updateTaskStatus(
  sessionId: string,
  status: AgentTask['status'],
  completionMessage?: string,
): Promise<void> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return updateTaskStatusAction(context, sessionId, status, completionMessage);
}

export function monitorTasks(): void {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return monitorTasksAction(context);
}

export async function createTask(sessionId: string, task: string): Promise<AgentTask> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return createTaskAction(context, sessionId, task);
}

export async function getAllTasks(): Promise<Map<string, AgentTask>> {
  const context: TaskContext = {
    agentTaskStore,
    agentTasks,
  };
  return getAllTasksAction(context);
}

export function parseTimestamp(timestamp: Timestamp): number {
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp).getTime();
  return Date.now();
}

// Export the agent tasks map for backward compatibility
export { agentTasks };

// Create a class-like export for backward compatibility
export const AgentTaskManager = {
  initializeStores,
  loadPersistedTasks,
  verifySessionExists,
  cleanupOrphanedTask,
  updateTaskStatus,
  monitorTasks,
  createTask,
  getAllTasks,
  parseTimestamp,
  agentTasks,
};;;
