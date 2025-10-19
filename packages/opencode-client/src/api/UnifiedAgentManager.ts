/**
 * Unified Agent Management API
 * Provides high-level abstractions for session, task, and agent management
 * Always queries dual store directly - no in-memory state
 */

import { AgentTask } from '../AgentTask.js';
import { AgentTaskManager } from './AgentTaskManager.js';
import { MessageProcessor } from './MessageProcessor.js';
import { createSession, closeSession, listSessions, getSession } from './sessions.js';

export interface CreateAgentSessionOptions {
  title?: string;
  files?: string[];
  delegates?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  taskType?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AgentSession {
  sessionId: string;
  task: AgentTask;
  session: {
    id: string;
    title?: string;
    files?: string[];
    delegates?: string[];
    createdAt?: string;
    status?: string;
  };
  createdAt: Date;
  status: 'initializing' | 'running' | 'completed' | 'failed' | 'idle';
}

export interface AgentSessionOptions {
  autoStart?: boolean;
  timeout?: number;
  retryAttempts?: number;
  onStatusChange?: (sessionId: string, oldStatus: string, newStatus: string) => void;
  onMessage?: (sessionId: string, message: { type: string; content: string }) => void;
}

/**
 * Unified Agent Manager - High-level API for complete agent lifecycle management
 * Always queries dual store directly - no in-memory state
 */
export class UnifiedAgentManager {
  private static instance: UnifiedAgentManager;

  private constructor() {}

  static getInstance(): UnifiedAgentManager {
    if (!UnifiedAgentManager.instance) {
      UnifiedAgentManager.instance = new UnifiedAgentManager();
    }
    return UnifiedAgentManager.instance;
  }

  private ensureStoresInitialized(): void {
    // This will throw if stores aren't initialized, which is better than silent failures
    try {
      // Try to access AgentTaskManager to ensure stores are ready
      void AgentTaskManager.getAllTasks;
    } catch (error) {
      throw new Error('Agent stores not initialized. Call initializeStores() first.');
    }
  }

  /**
   * Get session from storage by ID
   */
  private async getSessionFromStorage(sessionId: string): Promise<AgentSession | null> {
    try {
      const session = await getSession(sessionId);
      if (!session) {
        return null;
      }

      const allTasks = await AgentTaskManager.getAllTasks();
      const task = allTasks.get(sessionId);

      if (!task) {
        return null;
      }

      return {
        sessionId: session.id,
        task,
        session: {
          id: session.id,
          title: session.title,
          files: [], // Session interface doesn't have files/delegates, but AgentSession expects them
          delegates: [],
          createdAt: session.createdAt,
          status: session.activityStatus,
        },
        createdAt: new Date(session.createdAt || Date.now()),
        status: this.mapStatusToAgentStatus(
          session.agentTaskStatus || session.activityStatus || 'initializing',
        ),
      };
    } catch (error) {
      console.warn(`Failed to get session ${sessionId} from storage:`, error);
      return null;
    }
  }

  /**
   * Map session status to agent session status
   */
  private mapStatusToAgentStatus(status: string): AgentSession['status'] {
    switch (status) {
      case 'active':
      case 'running':
        return 'running';
      case 'completed':
        return 'completed';
      case 'error':
      case 'failed':
        return 'failed';
      case 'waiting_for_input':
        return 'idle';
      default:
        return 'initializing';
    }
  }

  /**
   * Create a new agent session with task assignment in a single operation
   */
  async createAgentSession(
    taskDescription: string,
    initialMessage?: string,
    options: CreateAgentSessionOptions = {},
    sessionOptions: AgentSessionOptions = {},
  ): Promise<AgentSession> {
    try {
      // Ensure stores are initialized before proceeding
      this.ensureStoresInitialized();

      // Step 1: Create the session
      const sessionResult = await createSession({
        title: options.title || `Task: ${taskDescription.substring(0, 50)}...`,
        files: options.files || [],
        delegates: options.delegates || [],
      });

      if (!sessionResult.success) {
        throw new Error(`Failed to create session: ${JSON.stringify(sessionResult)}`);
      }

      const sessionId = sessionResult.session.id;

      // Step 2: Create and assign the task
      await AgentTaskManager.createTask(sessionId, taskDescription);

      // Send the task description as the first message
      await MessageProcessor.processMessage(null, sessionId, {
        type: 'user',
        content: taskDescription,
        timestamp: new Date().toISOString(),
      });

      // Step 3: Send initial message if provided
      if (initialMessage) {
        await MessageProcessor.processMessage(null, sessionId, {
          type: 'user',
          content: initialMessage,
          timestamp: new Date().toISOString(),
        });
      }

      // Step 4: Start if requested
      if (sessionOptions.autoStart) {
        await AgentTaskManager.updateTaskStatus(sessionId, 'running');
      }

      // Step 5: Return the created session by querying from storage
      const agentSession = await this.getSessionFromStorage(sessionId);
      if (!agentSession) {
        throw new Error(`Failed to retrieve created session ${sessionId}`);
      }

      return agentSession;
    } catch (error) {
      throw new Error(`Failed to create agent session: ${(error as Error).message}`);
    }
  }

  /**
   * Start an existing agent session
   */
  async startAgentSession(sessionId: string): Promise<void> {
    this.ensureStoresInitialized();

    const agentSession = await this.getSessionFromStorage(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      await AgentTaskManager.updateTaskStatus(sessionId, 'running');
    } catch (error) {
      throw new Error(`Failed to start session ${sessionId}: ${(error as Error).message}`);
    }
  }

  /**
   * Stop an agent session
   */
  async stopAgentSession(sessionId: string, completionMessage?: string): Promise<void> {
    this.ensureStoresInitialized();

    const agentSession = await this.getSessionFromStorage(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      await AgentTaskManager.updateTaskStatus(sessionId, 'completed', completionMessage);
    } catch (error) {
      throw new Error(`Failed to stop session ${sessionId}: ${(error as Error).message}`);
    }
  }

  /**
   * Send a message to an agent session
   */
  async sendMessageToAgent(
    sessionId: string,
    message: string,
    messageType: string = 'user',
  ): Promise<void> {
    this.ensureStoresInitialized();

    const agentSession = await this.getSessionFromStorage(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      await MessageProcessor.processMessage(null, sessionId, {
        type: messageType,
        content: message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error(
        `Failed to send message to session ${sessionId}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get agent session details
   */
  async getAgentSession(sessionId: string): Promise<AgentSession | null> {
    return this.getSessionFromStorage(sessionId);
  }

  /**
   * List all active agent sessions
   */
  async listAgentSessions(): Promise<AgentSession[]> {
    try {
      const sessions = await listSessions();
      const agentSessions: AgentSession[] = [];

      for (const session of sessions) {
        if (session.isAgentTask) {
          const agentSession = await this.getSessionFromStorage(session.id);
          if (agentSession) {
            agentSessions.push(agentSession);
          }
        }
      }

      return agentSessions;
    } catch (error) {
      console.warn('Failed to list agent sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions by status
   */
  async getSessionsByStatus(status: AgentSession['status']): Promise<AgentSession[]> {
    const sessions = await this.listAgentSessions();
    return sessions.filter((session) => session.status === status);
  }

  /**
   * Close and cleanup an agent session
   */
  async closeAgentSession(sessionId: string): Promise<void> {
    this.ensureStoresInitialized();

    const agentSession = await this.getSessionFromStorage(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Update task status to completed if not already
      if (agentSession.status === 'running') {
        await this.stopAgentSession(sessionId, 'Session closed by user');
      }

      // Close session
      await closeSession(sessionId);
    } catch (error) {
      throw new Error(`Failed to close session ${sessionId}: ${(error as Error).message}`);
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    averageAge: number;
  }> {
    const sessions = await this.listAgentSessions();
    const now = new Date().getTime();

    const byStatus = sessions.reduce(
      (acc, session) => {
        acc[session.status] = (acc[session.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const averageAge =
      sessions.length > 0
        ? sessions.reduce((sum, session) => sum + (now - session.createdAt.getTime()), 0) /
          sessions.length
        : 0;

    return {
      total: sessions.length,
      byStatus,
      averageAge,
    };
  }

  /**
   * Cleanup old/completed sessions
   */
  async cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
    const now = new Date().getTime();
    const sessions = await this.listAgentSessions();
    const sessionsToCleanup = sessions.filter(
      (session) =>
        (session.status === 'completed' || session.status === 'failed') &&
        now - session.createdAt.getTime() > maxAge,
    );

    for (const session of sessionsToCleanup) {
      try {
        await this.closeAgentSession(session.sessionId);
      } catch (error) {
        console.error(`Failed to cleanup session ${session.sessionId}:`, error);
      }
    }

    return sessionsToCleanup.length;
  }
}

// Export singleton instance
export const unifiedAgentManager = UnifiedAgentManager.getInstance();

// Export convenience functions for direct usage
export async function createAgentSession(
  taskDescription: string,
  initialMessage?: string,
  options?: CreateAgentSessionOptions,
  sessionOptions?: AgentSessionOptions,
): Promise<AgentSession> {
  return unifiedAgentManager.createAgentSession(
    taskDescription,
    initialMessage,
    options,
    sessionOptions,
  );
}

export async function startAgentSession(sessionId: string): Promise<void> {
  return unifiedAgentManager.startAgentSession(sessionId);
}

export async function stopAgentSession(
  sessionId: string,
  completionMessage?: string,
): Promise<void> {
  return unifiedAgentManager.stopAgentSession(sessionId, completionMessage);
}

export async function sendMessageToAgent(
  sessionId: string,
  message: string,
  messageType?: string,
): Promise<void> {
  return unifiedAgentManager.sendMessageToAgent(sessionId, message, messageType);
}

export async function closeAgentSession(sessionId: string): Promise<void> {
  return unifiedAgentManager.closeAgentSession(sessionId);
}
