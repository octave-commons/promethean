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

// Export the agent tasks map for backward compatibility
export { agentTasks };
