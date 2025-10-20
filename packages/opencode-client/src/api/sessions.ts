import { sessionStore, messageStore } from '../index.js';
import type { SessionInfo, Message, SessionStatus } from '../types/index.js';

export class SessionAPI {
  async createSession(sessionId: string, initialData?: Partial<SessionInfo>): Promise<SessionInfo> {
    const sessionInfo: SessionInfo = {
      id: sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastActivity: Date.now(),
      status: 'active',
      ...initialData,
    };

    await sessionStore.add(sessionId, sessionInfo);
    return sessionInfo;
  }

  async getSession(sessionId: string): Promise<SessionInfo | null> {
    const result = await sessionStore.get(sessionId);
    return (result?.metadata as SessionInfo) || null;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionInfo>,
  ): Promise<SessionInfo | null> {
    const existing = await this.getSession(sessionId);
    if (!existing) return null;

    const updated: SessionInfo = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      lastActivity: Date.now(),
    };

    await sessionStore.update(sessionId, updated);
    return updated;
  }

  async closeSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    await this.updateSession(sessionId, { status: 'closed' });
    return true;
  }

  async listSessions(status?: SessionStatus): Promise<SessionInfo[]> {
    const sessions = await sessionStore.getAll();
    return sessions
      .map((entry) => entry.metadata as SessionInfo)
      .filter((session) => !status || session.status === status);
  }

  async addMessage(
    sessionId: string,
    message: Omit<Message, 'id' | 'timestamp'>,
  ): Promise<Message> {
    const fullMessage: Message = {
      ...message,
      id: `${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    await messageStore.add(fullMessage.id, fullMessage);

    // Update session last activity
    await this.updateSession(sessionId, { lastActivity: Date.now() });

    return fullMessage;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const messages = await messageStore.getAll();
    return messages
      .map((entry) => entry.metadata as Message)
      .filter((message) => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async searchSessions(query: string, limit: number = 10): Promise<SessionInfo[]> {
    const results = await sessionStore.search(query, limit);
    return results.map((entry) => entry.metadata as SessionInfo);
  }
}

export const sessionAPI = new SessionAPI();
export default sessionAPI;
