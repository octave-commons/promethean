import type { AgentTask } from './types/index.js';
import { SessionInfo } from './SessionInfo.js';
import type {
  SessionClient,
  OpenCodeEvent,
  SessionEventProperties,
  MessageEventProperties,
} from './types/index.js';

type SessionData = {
  readonly id: string;
  readonly title?: string;
  readonly isAgentTask?: boolean;
  readonly agentTaskStatus?: string;
  readonly [key: string]: unknown;
};

const SessionUtils = {
  extractSessionId(event: OpenCodeEvent): string | null {
    if (!event.properties) {
      return event.sessionId || null;
    }

    const extractors: Readonly<Record<string, () => string | undefined>> = {
      session_idle: () => {
        const props = event.properties as SessionEventProperties;
        return props.sessionID || props.session?.id;
      },
      session_updated: () => {
        const props = event.properties as SessionEventProperties;
        return props.info?.id || props.session?.id;
      },
      message_updated: () => {
        const props = event.properties as MessageEventProperties;
        return props.message?.session_id || event.sessionId;
      },
      'message.part.updated': () => {
        const props = event.properties as MessageEventProperties;
        return props.message?.session_id || event.sessionId;
      },
      'session.compacted': () => {
        const props = event.properties as SessionEventProperties;
        return event.sessionId || props.session?.id;
      },
    };

    const extractor = extractors[event.type];
    return extractor ? extractor() || null : null;
  },

  async getSessionMessages(client: SessionClient, sessionId: string): Promise<readonly unknown[]> {
    const result = await client.session
      .messages({
        path: { id: sessionId },
      })
      .catch((error: unknown) => {
        console.error(`Error fetching messages for session ${sessionId}:`, error);
        return { data: [] };
      });

    return (result.data as unknown[]) || [];
  },

  determineActivityStatus(
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
  },

  createSessionInfo(
    session: SessionData,
    messageCount: number,
    agentTask?: AgentTask,
  ): SessionInfo {
    const now = Date.now();
    const activityStatus = SessionUtils.determineActivityStatus(session, messageCount, agentTask);
    const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;

    return {
      id: session.id,
      title: session.title || session.id,
      messageCount,
      lastActivityTime: new Date().toISOString(),
      sessionAge,
      activityStatus,
      isAgentTask: !!agentTask || session.isAgentTask === true,
      agentTaskStatus: agentTask?.status,
    };
  },
};

export { SessionUtils };
