/**
 * Unified Agent Management API
 * Provides high-level abstractions for session, task, and agent management
 */

import { AgentTask } from '../AgentTask.js';
import { AgentTaskManager } from './AgentTaskManager.js';
import { MessageProcessor } from './MessageProcessor.js';
import { createSession, closeSession } from './sessions.js';

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
 */
export class UnifiedAgentManager {
  private static instance: UnifiedAgentManager;
  private activeSessions = new Map<string, AgentSession>();
  private eventListeners = new Map<string, Set<Function>>();

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
      // Try to access the AgentTaskManager to ensure stores are ready
      void AgentTaskManager.getAllTasks;
    } catch (error) {
      throw new Error('Agent stores not initialized. Call initializeStores() first.');
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
      const task = await AgentTaskManager.createTask(sessionId, taskDescription);

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

      // Step 4: Create the agent session record
      const agentSession: AgentSession = {
        sessionId,
        task,
        session: sessionResult.session,
        createdAt: new Date(),
        status: sessionOptions.autoStart ? 'running' : 'initializing',
      };

      // Step 5: Store and start if requested
      this.activeSessions.set(sessionId, agentSession);

      if (sessionOptions.autoStart) {
        await this.startAgentSession(sessionId);
      }

      // Step 6: Set up event listeners
      if (sessionOptions.onStatusChange) {
        this.addEventListener(sessionId, 'statusChange', sessionOptions.onStatusChange);
      }

      if (sessionOptions.onMessage) {
        this.addEventListener(sessionId, 'message', sessionOptions.onMessage);
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
    const agentSession = this.activeSessions.get(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      await AgentTaskManager.updateTaskStatus(sessionId, 'running');
      agentSession.status = 'running';

      this.notifyListeners(sessionId, 'statusChange', ['initializing', 'running']);
    } catch (error) {
      agentSession.status = 'failed';
      throw new Error(`Failed to start session ${sessionId}: ${(error as Error).message}`);
    }
  }

  /**
   * Stop an agent session
   */
  async stopAgentSession(sessionId: string, completionMessage?: string): Promise<void> {
    this.ensureStoresInitialized();
    const agentSession = this.activeSessions.get(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      await AgentTaskManager.updateTaskStatus(sessionId, 'completed', completionMessage);
      agentSession.status = 'completed';

      this.notifyListeners(sessionId, 'statusChange', ['running', 'completed']);
    } catch (error) {
      agentSession.status = 'failed';
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
    const agentSession = this.activeSessions.get(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      await MessageProcessor.processMessage(null, sessionId, {
        type: messageType,
        content: message,
        timestamp: new Date().toISOString(),
      });

      this.notifyListeners(sessionId, 'message', [{ type: messageType, content: message }]);
    } catch (error) {
      throw new Error(
        `Failed to send message to session ${sessionId}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get agent session details
   */
  getAgentSession(sessionId: string): AgentSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * List all active agent sessions
   */
  listAgentSessions(): AgentSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get sessions by status
   */
  getSessionsByStatus(status: AgentSession['status']): AgentSession[] {
    return this.listAgentSessions().filter((session) => session.status === status);
  }

  /**
   * Close and cleanup an agent session
   */
  async closeAgentSession(sessionId: string): Promise<void> {
    this.ensureStoresInitialized();
    const agentSession = this.activeSessions.get(sessionId);
    if (!agentSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      // Update task status to completed if not already
      if (agentSession.status === 'running') {
        await this.stopAgentSession(sessionId, 'Session closed by user');
      }

      // Close the session
      await closeSession(sessionId);

      // Remove from active sessions
      this.activeSessions.delete(sessionId);

      // Clear event listeners
      this.eventListeners.delete(sessionId);
    } catch (error) {
      throw new Error(`Failed to close session ${sessionId}: ${(error as Error).message}`);
    }
  }

  /**
   * Add event listener for a session
   */
  addEventListener(
    sessionId: string,
    _eventType: string,
    listener: (...args: unknown[]) => void,
  ): void {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, new Set());
    }

    const sessionListeners = this.eventListeners.get(sessionId)!;
    sessionListeners.add(listener);
  }

  /**
   * Remove event listener for a session
   */
  removeEventListener(sessionId: string, _eventType: string, listener: Function): void {
    const sessionListeners = this.eventListeners.get(sessionId);
    if (sessionListeners) {
      sessionListeners.delete(listener);
    }
  }

  /**
   * Notify all listeners for a session
   */
  private notifyListeners(sessionId: string, _eventType: string, data: unknown[]): void {
    const sessionListeners = this.eventListeners.get(sessionId);
    if (sessionListeners) {
      sessionListeners.forEach((listener) => {
        try {
          listener(...data);
        } catch (error) {
          console.error(`Error in event listener for session ${sessionId}:`, error);
        }
      });
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    total: number;
    byStatus: Record<string, number>;
    averageAge: number;
  } {
    const sessions = this.listAgentSessions();
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
    const sessionsToCleanup = this.listAgentSessions().filter(
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
