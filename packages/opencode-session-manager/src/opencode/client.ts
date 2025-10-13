/**
 * OpenCode client wrapper for session management
 */

import type {
  Session,
  SessionManagerConfig,
  CreateSessionRequest,
  UpdateSessionRequest,
  SendPromptRequest,
} from '../types.js';

export class OpenCodeSessionManager {
  private client: any;
  private config: SessionManagerConfig;

  constructor(config: SessionManagerConfig = {}) {
    this.config = {
      baseUrl: 'http://localhost:4096',
      autoRefresh: true,
      refreshInterval: 30000,
      theme: 'auto',
      ...config,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Dynamic import of OpenCode SDK from local installation
      const { createOpencodeClient } = await import(
        '../../../../.opencode/node_modules/@opencode-ai/sdk/dist/index.js'
      );
      this.client = createOpencodeClient({
        baseUrl: this.config.baseUrl,
      });
    } catch (error) {
      throw new Error(`Failed to initialize OpenCode client: ${error}`);
    }
  }

  async listSessions(): Promise<Session[]> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const sessions = await this.client.session.list();
      return sessions.map(this.transformSession);
    } catch (error) {
      throw new Error(`Failed to list sessions: ${error}`);
    }
  }

  async getSession(id: string): Promise<Session> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const session = await this.client.session.get({ path: { id } });
      return this.transformSession(session);
    } catch (error) {
      throw new Error(`Failed to get session ${id}: ${error}`);
    }
  }

  async createSession(request: CreateSessionRequest): Promise<Session> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const session = await this.client.session.create({
        body: request,
      });
      return this.transformSession(session);
    } catch (error) {
      throw new Error(`Failed to create session: ${error}`);
    }
  }

  async updateSession(
    id: string,
    request: UpdateSessionRequest
  ): Promise<Session> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const session = await this.client.session.update({
        path: { id },
        body: request,
      });
      return this.transformSession(session);
    } catch (error) {
      throw new Error(`Failed to update session ${id}: ${error}`);
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      await this.client.session.delete({ path: { id } });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete session ${id}: ${error}`);
    }
  }

  async sendPrompt(id: string, request: SendPromptRequest): Promise<any> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const result = await this.client.session.prompt({
        path: { id },
        body: {
          parts: [
            {
              type: 'text',
              text: request.text,
            },
            ...(request.parts || []),
          ],
        },
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to send prompt to session ${id}: ${error}`);
    }
  }

  async getSessionMessages(id: string): Promise<any[]> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const messages = await this.client.session.messages({ path: { id } });
      return messages;
    } catch (error) {
      throw new Error(`Failed to get messages for session ${id}: ${error}`);
    }
  }

  private transformSession(session: any): Session {
    return {
      id: session.id,
      title: session.title || 'Untitled Session',
      description: session.description,
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: session.updatedAt,
      status: session.status,
      messages: session.messages,
      metadata: session.metadata,
    };
  }

  // Event subscription for real-time updates
  async subscribeToEvents(callback: (event: any) => void): Promise<void> {
    if (!this.client) {
      await this.initialize();
    }

    try {
      const events = await this.client.event.subscribe();
      for await (const event of events.stream) {
        callback(event);
      }
    } catch (error) {
      throw new Error(`Failed to subscribe to events: ${error}`);
    }
  }
}

export default OpenCodeSessionManager;
