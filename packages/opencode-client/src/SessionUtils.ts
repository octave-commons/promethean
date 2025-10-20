import { AgentTask } from './AgentTask.js';
import { SessionInfo } from './SessionInfo.js';
import type { SessionClient, OpenCodeEvent } from './types/index.js';

interface SessionData {
  id: string;
  title?: string;
  isAgentTask?: boolean;
  agentTaskStatus?: string;
  [key: string]: unknown;
}

class SessionUtils {
  static extractSessionId(event: OpenCodeEvent): string | null {
    if (!event.properties) {
      return event.sessionId || null;
    }
    
    const extractors: Record<string, () => string | undefined> = {
      'session.idle': () => (event.properties as any).sessionID || (event.properties as any).session?.id,
      'session.updated': () => (event.properties as any).info?.id || (event.properties as any).session?.id,
      'message.updated': () => (event.properties as any).message?.session_id || event.sessionId,
      'message.part.updated': () =>
        (event.properties as any).message?.session_id || event.sessionId,
      'session.compacted': () => event.sessionId || (event.properties as any).session?.id,
    };

    const extractor = extractors[event.type];
    return extractor ? extractor() || null : null;
  }

  static async getSessionMessages(client: SessionClient, sessionId: string) {
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

  static determineActivityStatus(
    _session: SessionData,
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

  static createSessionInfo(
    session: SessionData,
    messageCount: number,
    agentTask?: AgentTask,
  ): SessionInfo {
    const now = Date.now();
    const activityStatus = this.determineActivityStatus(session, messageCount, agentTask);
    const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;

    return {
      id: session.id,
      title: session.title,
      messageCount,
      lastActivityTime: new Date().toISOString(),
      sessionAge,
      activityStatus,
      isAgentTask: !!agentTask || session.isAgentTask === true,
      agentTaskStatus: agentTask?.status,
    };
  }
}

export { SessionUtils };
