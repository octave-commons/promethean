import type { AgentTask } from '../../types/index.js';
import { SessionInfo } from '../../SessionInfo.js';
import type { OpencodeClient } from '@opencode-ai/sdk';

interface Session extends Record<string, unknown> {
  id: string;
  title?: string;
}

export function extractSessionId(event: {
  type: string;
  properties: Record<string, unknown>;
}): string | null {
  const extractors: Record<string, () => string | undefined> = {
    'session.idle': () =>
      (event.properties as any).sessionID || (event.properties as any).session?.id,
    'session.updated': () =>
      (event.properties as any).info?.id || (event.properties as any).session?.id,
    'message.updated': () =>
      (event.properties as any).message?.session_id || (event.properties as any).sessionId,
    'message.part.updated': () =>
      (event.properties as any).message?.session_id || (event.properties as any).sessionId,
    'session.compacted': () =>
      (event.properties as any).sessionId || (event.properties as any).session?.id,
  };

  const extractor = extractors[event.type];
  return extractor ? extractor() || null : null;
}

export async function getSessionMessages(client: OpencodeClient, sessionId: string) {
  try {
    const { data: messages } = await client.session.messages({
      path: { id: sessionId },
    });
    return messages || [];
  } catch (error) {
    console.error(`Error fetching messages for session ${sessionId}:`, error);
    return [];
  }
}

export function determineActivityStatus(
  _session: Session,
  messageCount: number,
  agentTask?: AgentTask,
): string {
  if (agentTask) {
    if (agentTask.status === 'running') {
      const recentActivity = Date.now() - agentTask.lastActivity < 5 * 60 * 1000;
      return recentActivity ? 'active' : 'waiting_for_input';
    }
    return agentTask.status;
  }

  if (messageCount < 10) return 'active';
  if (messageCount < 50) return 'waiting_for_input';
  return 'idle';
}

export function createSessionInfo(
  session: Session,
  messageCount: number,
  agentTask?: AgentTask,
): SessionInfo {
  const now = Date.now();
  const activityStatus = determineActivityStatus(session, messageCount, agentTask);
  const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;

  return {
    id: session.id,
    title: session.title || 'Untitled Session',
    messageCount,
    lastActivityTime: new Date().toISOString(),
    sessionAge,
    activityStatus,
    isAgentTask: !!agentTask,
    agentTaskStatus: agentTask?.status,
  };
}
