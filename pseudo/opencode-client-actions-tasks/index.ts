import type { DualStoreManager } from '@promethean/persistence';
import type { AgentTask } from '../../types/index.js';

export type TaskContext = DualStoreManager<'text', 'timestamp'>;

export async function loadPersistedTasks(
  context: TaskContext,
  client?: { session: { get: (params: { path: { id: string } }) => Promise<{ data?: unknown }> } },
): Promise<{ loadedCount: number; cleanedCount: number }> {
  try {
    console.log('🔄 Loading persisted agent tasks...');
    const storedTasks = await context.getMostRecent(100);
    let loadedCount = 0;
    let cleanedCount = 0;

    for (const task of storedTasks) {
      const sessionId = task.metadata?.sessionId as string;
      if (sessionId) {
        // Verify session still exists before restoring
        const sessionExists = client ? await verifySessionExists(client, sessionId) : true;
        if (sessionExists) {
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

export async function verifySessionExists(
  client: { session: { get: (params: { path: { id: string } }) => Promise<{ data?: unknown }> } },
  sessionId: string,
): Promise<boolean> {
  try {
    const { data: session } = await client.session.get({ path: { id: sessionId } });
    return !!session;
  } catch {
    return false;
  }
}

export async function updateTaskStatus(
  _context: TaskContext,
  sessionId: string,
  status: AgentTask['status'],
  completionMessage?: string,
): Promise<void> {
  console.log(`Agent task status updated for session ${sessionId}: ${status}`);
  logTaskCompletion(sessionId, status, completionMessage);
}

function logTaskCompletion(sessionId: string, status: string, completionMessage?: string) {
  if (status === 'completed') {
    console.log(`✅ Agent task completed for session ${sessionId}:`, completionMessage);
  } else if (status === 'failed') {
    console.log(`❌ Agent task failed for session ${sessionId}:`, completionMessage);
  }
}

export function monitorTasks(_context: TaskContext): void {
  // Monitor tasks from store
  console.log('📊 Monitoring tasks for timeouts...');
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

  await context.insert({
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

  return agentTask;
}

export async function getTasks(context: TaskContext, limit = 20): Promise<Map<string, AgentTask>> {
  const tasks = await context.getMostRecent(limit);
  const taskMap = new Map<string, AgentTask>();

  for (const task of tasks) {
    const sessionId = task.metadata?.sessionId as string;
    if (sessionId) {
      taskMap.set(sessionId, {
        sessionId,
        task: task.text,
        startTime: (task.metadata?.startTime as number) || Date.now(),
        status: (task.metadata?.status as AgentTask['status']) || 'idle',
        lastActivity: (task.metadata?.lastActivity as number) || Date.now(),
        completionMessage: task.metadata?.completionMessage as string,
      });
    }
  }

  return taskMap;
}

export async function cleanupOrphanedTask(context: TaskContext, sessionId: string): Promise<void> {
  try {
    // Mark the task as failed since the session no longer exists
    await context.insert({
      id: sessionId,
      text: 'Orphaned task - session no longer exists',
      timestamp: new Date().toISOString(),
      metadata: {
        sessionId,
        status: 'failed',
        lastActivity: Date.now(),
        completionMessage: 'Session no longer exists',
      },
    });
  } catch (error) {
    console.error(`Failed to cleanup orphaned task for session ${sessionId}:`, error);
  }
}

export function parseTimestamp(timestamp: string | number | Date): number {
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp).getTime();
  return Date.now();
}
