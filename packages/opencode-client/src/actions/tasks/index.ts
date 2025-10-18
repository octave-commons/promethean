import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from '../../AgentTask.js';

export interface TaskContext {
  agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  agentTasks: Map<string, AgentTask>;
}

export async function loadPersistedTasks(
  context: TaskContext,
  client?: any,
): Promise<{ loadedCount: number; cleanedCount: number }> {
  try {
    console.log('🔄 Loading persisted agent tasks...');
    const storedTasks = await context.agentTaskStore.getMostRecent(100);
    let loadedCount = 0;
    let cleanedCount = 0;

    for (const task of storedTasks) {
      const sessionId = task.metadata?.sessionId as string;
      if (sessionId) {
        // Verify session still exists before restoring
        const sessionExists = client ? await verifySessionExists(client, sessionId) : true;
        if (sessionExists) {
          // Restore task to memory
          const agentTask: AgentTask = {
            sessionId,
            task: task.text,
            startTime: parseTimestamp(task.timestamp),
            status: (task.metadata?.status as AgentTask['status']) || 'idle',
            lastActivity:
              parseTimestamp(task.metadata?.lastActivity) || parseTimestamp(task.timestamp),
            completionMessage: task.metadata?.completionMessage as string | undefined,
          };

          context.agentTasks.set(sessionId, agentTask);
          loadedCount++;
        } else {
          // Clean up orphaned task
          await cleanupOrphanedTask(context, sessionId);
          cleanedCount++;
        }
      }
    }

    console.log(`✅ Loaded ${loadedCount} agent tasks, cleaned up ${cleanedCount} orphaned tasks`);
    return { loadedCount, cleanedCount };
  } catch (error) {
    console.error('Error loading persisted tasks:', error);
    return { loadedCount: 0, cleanedCount: 0 };
  }
}

export async function verifySessionExists(client: any, sessionId: string): Promise<boolean> {
  try {
    const { data: session } = await client.session.get({ path: { id: sessionId } });
    return !!session;
  } catch {
    return false;
  }
}

export async function cleanupOrphanedTask(context: TaskContext, sessionId: string) {
  console.log(`🧹 Cleaning up orphaned agent task: ${sessionId}`);
  context.agentTasks.delete(sessionId);
  // Note: We keep the persistent record for audit purposes
}

export async function updateTaskStatus(
  context: TaskContext,
  sessionId: string,
  status: AgentTask['status'],
  completionMessage?: string,
): Promise<void> {
  const task = context.agentTasks.get(sessionId);
  if (!task) return;

  const updatedTask = {
    ...task,
    status,
    lastActivity: Date.now(),
    ...(completionMessage && { completionMessage }),
  };

  context.agentTasks.set(sessionId, updatedTask);

  console.log(`Agent task status updated for session ${sessionId}: ${status}`);

  try {
    await context.agentTaskStore.insert({
      id: sessionId,
      text: updatedTask.task,
      timestamp: updatedTask.startTime,
      metadata: {
        sessionId,
        status,
        lastActivity: updatedTask.lastActivity,
        completionMessage,
      },
    });
  } catch (error) {
    console.error('Error updating agent task in dual store:', error);
  }

  logTaskCompletion(sessionId, status, completionMessage);
}

function logTaskCompletion(sessionId: string, status: string, completionMessage?: string) {
  if (status === 'completed') {
    console.log(`✅ Agent task completed for session ${sessionId}:`, completionMessage);
  } else if (status === 'failed') {
    console.log(`❌ Agent task failed for session ${sessionId}:`, completionMessage);
  }
}

export function monitorTasks(context: TaskContext): void {
  const now = Date.now();
  const timeoutThreshold = 30 * 60 * 1000; // 30 minutes

  for (const [sessionId, task] of context.agentTasks.entries()) {
    if (task.status === 'running' && now - task.lastActivity > timeoutThreshold) {
      console.warn(
        `⚠️ Agent task timeout for session ${sessionId} (inactive for ${timeoutThreshold / 60000} minutes)`,
      );
      updateTaskStatus(context, sessionId, 'failed', 'Task timed out due to inactivity');
    }
  }
}

export async function createTask(
  context: TaskContext,
  sessionId: string,
  task: string,
): Promise<AgentTask> {
  const startTime = Date.now();
  const agentTask: AgentTask = {
    sessionId,
    task,
    startTime,
    status: 'running',
    lastActivity: startTime,
  };

  context.agentTasks.set(sessionId, agentTask);

  try {
    await context.agentTaskStore.insert({
      id: sessionId,
      text: task,
      timestamp: new Date().toISOString(),
      metadata: {
        sessionId,
        startTime,
        status: 'running',
        lastActivity: startTime,
      },
    });
  } catch (error) {
    console.error('Error storing agent task in dual store:', error);
  }

  return agentTask;
}

export async function getAllTasks(context: TaskContext): Promise<Map<string, AgentTask>> {
  try {
    const storedTasks = await context.agentTaskStore.getMostRecent(100);
    const allTasks = new Map(context.agentTasks);

    for (const task of storedTasks) {
      if (!allTasks.has(task.id || '')) {
        const sessionId = (task.metadata?.sessionId as string) || task.id || 'unknown';
        const startTime = parseTimestamp(task.timestamp);
        const status = (task.metadata?.status as AgentTask['status']) || 'idle';
        const lastActivity = parseTimestamp(task.metadata?.lastActivity) || startTime;
        const completionMessage = task.metadata?.completionMessage as string | undefined;

        allTasks.set(task.id || '', {
          sessionId,
          task: task.text,
          startTime,
          status,
          lastActivity,
          completionMessage,
        });
      }
    }

    return allTasks;
  } catch (error) {
    console.error('Error getting all tasks:', error);
    return context.agentTasks;
  }
}

export function parseTimestamp(timestamp: any): number {
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp).getTime();
  return Date.now();
}
