// Note: Using dynamic imports for OpenCode SDK since it may not be available in all contexts
// In a real implementation, you would install @opencode-ai/sdk as a dependency
import { DualStoreManager } from '@promethean/persistence';
import {
  AgentTask,
  AgentStatus,
  SessionInfo,
  SessionListResponse,
  AgentMonitoringSummary,
  InterAgentMessage,
  SpawnAgentOptions,
  AgentOrchestratorConfig,
} from './types.js';

// Define OpenCodeClient interface locally for now
interface OpenCodeClient {
  session: {
    create: (options: {
      body: { title: string };
    }) => Promise<{ data?: { id: string; title: string }; error?: any }>;
    list: () => Promise<{ data?: Array<{ id: string; title: string }>; error?: any }>;
    get: (options: { path: { id: string } }) => Promise<{ data?: any; error?: any }>;
    delete: (options: { path: { id: string } }) => Promise<void>;
    messages: (options: { path: { id: string } }) => Promise<{ data?: Array<any>; error?: any }>;
    prompt: (options: { path: { id: string }; body: { parts: any[] } }) => Promise<void>;
  };
  event: {
    subscribe: () => Promise<{ stream: AsyncIterable<any> }>;
  };
}

export class AgentOrchestrator {
  private client: OpenCodeClient;
  private sessionStore?: DualStoreManager<'text', 'timestamp'>;
  private agentTaskStore?: DualStoreManager<'text', 'timestamp'>;
  private agentTasks: Map<string, AgentTask> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private config: Required<AgentOrchestratorConfig>;

  constructor(client: OpenCodeClient, config: AgentOrchestratorConfig = {}) {
    this.client = client;
    this.config = {
      timeoutThreshold: config.timeoutThreshold ?? 30 * 60 * 1000, // 30 minutes
      monitoringInterval: config.monitoringInterval ?? 5 * 60 * 1000, // 5 minutes
      autoCleanup: config.autoCleanup ?? false,
      persistenceEnabled: config.persistenceEnabled ?? true,
    };
  }

  async initialize(): Promise<void> {
    if (this.config.persistenceEnabled) {
      this.sessionStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
      this.agentTaskStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');
    }

    // Start monitoring if auto-cleanup is enabled
    if (this.config.autoCleanup) {
      this.startMonitoring();
    }
  }

  async spawnAgent(options: SpawnAgentOptions): Promise<string> {
    const { prompt, files, delegates } = options;
    const agentName = `SubAgent-${Math.random().toString(36).substring(2, 8)}`;

    try {
      const { data: subSession, error } = await this.client.session.create({
        body: { title: agentName },
      });

      if (error || !subSession) {
        throw new Error(`Failed to create session: ${error?.data || 'Unknown error'}`);
      }

      const taskDescription = `You are "${agentName}", a sub-agent spawned to assist with the following task: ${prompt}. Work independently to complete this task while the main agent continues its work.`;

      const startTime = Date.now();
      const agentTask: AgentTask = {
        sessionId: subSession.id,
        task: prompt,
        startTime,
        status: 'running',
        lastActivity: startTime,
      };

      // Track the agent task
      this.agentTasks.set(subSession.id, agentTask);

      // Store in persistent storage if enabled
      if (this.config.persistenceEnabled && this.agentTaskStore) {
        try {
          await this.agentTaskStore.insert({
            id: subSession.id,
            text: prompt,
            timestamp: new Date().toISOString(),
            metadata: {
              sessionId: subSession.id,
              startTime,
              status: 'running',
              lastActivity: startTime,
            },
          });
        } catch (error) {
          console.warn('Failed to store agent task:', error);
        }
      }

      console.log(
        `🚀 Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`,
      );

      // Prepare message parts
      const parts: any[] = [{ type: 'text', text: taskDescription }];

      // Include files if provided
      if (files && files.length > 0) {
        for (const file of files) {
          parts.push({
            type: 'file',
            url: `file://${file}`,
            mime: 'text/plain',
          });
        }
      }

      // Include delegates if provided
      if (delegates && delegates.length > 0) {
        for (const delegateName of delegates) {
          parts.push({
            type: 'agent',
            name: delegateName,
          });
        }
      }

      // Send the prompt to the new session
      await this.client.session.prompt({
        path: { id: subSession.id },
        body: { parts },
      });

      return `Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`;
    } catch (error) {
      console.error('Error spawning agent:', error);
      throw new Error(`Failed to spawn sub-agent "${agentName}": ${error}`);
    }
  }

  async monitorAgents(): Promise<AgentMonitoringSummary> {
    try {
      const now = Date.now();
      let allAgentTasks = new Map(this.agentTasks);

      // Load tasks from persistent storage if enabled
      if (this.config.persistenceEnabled && this.agentTaskStore) {
        const storedTasks = await this.agentTaskStore.getMostRecent(100);

        for (const task of storedTasks) {
          if (!allAgentTasks.has(task.id || '')) {
            const sessionId = (task.metadata?.sessionId as string) || task.id || 'unknown';
            const startTime =
              typeof task.timestamp === 'number'
                ? task.timestamp
                : task.timestamp
                  ? new Date(task.timestamp).getTime()
                  : Date.now();
            const status = (task.metadata?.status as AgentTask['status']) || 'idle';
            const lastActivity =
              typeof task.metadata?.lastActivity === 'number'
                ? task.metadata.lastActivity
                : task.metadata?.lastActivity
                  ? new Date(task.metadata?.lastActivity as string).getTime()
                  : startTime;
            const completionMessage = task.metadata?.completionMessage as string | undefined;

            allAgentTasks.set(task.id || '', {
              sessionId,
              task: task.text,
              startTime,
              status,
              lastActivity,
              completionMessage,
            });
          }
        }
      }

      const agentStatus = Array.from(allAgentTasks.entries()).map(([sessionId, task]) => ({
        sessionId,
        task: task.task,
        status: task.status,
        startTime: new Date(task.startTime).toISOString(),
        lastActivity: new Date(task.lastActivity).toISOString(),
        duration: Math.round((now - task.startTime) / 1000),
        completionMessage: task.completionMessage,
      }));

      return {
        totalAgents: allAgentTasks.size,
        running: agentStatus.filter((a: AgentStatus) => a.status === 'running').length,
        completed: agentStatus.filter((a: AgentStatus) => a.status === 'completed').length,
        failed: agentStatus.filter((a: AgentStatus) => a.status === 'failed').length,
        idle: agentStatus.filter((a: AgentStatus) => a.status === 'idle').length,
        agents: agentStatus,
      };
    } catch (error) {
      console.error('Error monitoring agents:', error);
      throw new Error(`Failed to monitor agents: ${error}`);
    }
  }

  async getAgentStatus(sessionId: string): Promise<AgentStatus | string> {
    try {
      let task = this.agentTasks.get(sessionId);

      // Try to find in persistent storage if not in memory
      if (!task && this.config.persistenceEnabled && this.agentTaskStore) {
        const storedTasks = await this.agentTaskStore.getMostRecent(100);
        const storedTask = storedTasks.find((t: any) => t.id === sessionId);

        if (storedTask) {
          task = {
            sessionId: (storedTask.metadata?.sessionId as string) || storedTask.id || 'unknown',
            task: storedTask.text,
            startTime:
              typeof storedTask.timestamp === 'number'
                ? storedTask.timestamp
                : new Date(storedTask.timestamp).getTime(),
            status: (storedTask.metadata?.status as AgentTask['status']) || 'idle',
            lastActivity:
              typeof storedTask.metadata?.lastActivity === 'number'
                ? storedTask.metadata?.lastActivity
                : new Date(
                    (storedTask.metadata?.lastActivity as string | number) ||
                      (storedTask.timestamp as string | number),
                  ).getTime(),
            completionMessage: storedTask.metadata?.completionMessage as string | undefined,
          };
        }
      }

      if (!task) {
        return `No agent task found for session ${sessionId}`;
      }

      const now = Date.now();
      return {
        sessionId,
        task: task.task,
        status: task.status,
        startTime: new Date(task.startTime).toISOString(),
        lastActivity: new Date(task.lastActivity).toISOString(),
        duration: Math.round((now - task.startTime) / 1000),
        completionMessage: task.completionMessage,
      };
    } catch (error) {
      console.error('Error getting agent status:', error);
      throw new Error(`Failed to get agent status: ${error}`);
    }
  }

  async sendAgentMessage(
    sessionId: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    messageType:
      | 'instruction'
      | 'query'
      | 'update'
      | 'coordination'
      | 'status_request' = 'instruction',
  ): Promise<string> {
    try {
      // Verify the target session exists and is an agent
      const targetTask = this.agentTasks.get(sessionId);

      if (!targetTask && this.config.persistenceEnabled && this.agentTaskStore) {
        const storedTasks = await this.agentTaskStore.getMostRecent(100);
        const storedTask = storedTasks.find((t: any) => t.id === sessionId);
        if (!storedTask) {
          return `❌ No agent found with session ID: ${sessionId}`;
        }
      } else if (!targetTask) {
        return `❌ No agent found with session ID: ${sessionId}`;
      }

      // Get current session info for sender identification
      const currentSession = await this.client.session.list();
      const senderSessionId = currentSession.data?.[0]?.id || 'unknown';

      // Create structured message
      const structuredMessage: InterAgentMessage = {
        type: 'inter_agent_message',
        sender: senderSessionId,
        recipient: sessionId,
        timestamp: new Date().toISOString(),
        priority,
        messageType,
        content: message,
        metadata: {
          sentVia: 'AgentOrchestrator',
          urgency: priority === 'urgent' ? 'immediate_attention_required' : 'normal',
        },
      };

      // Format the message for the agent
      const safeSenderId =
        senderSessionId.length > 8 ? senderSessionId.substring(0, 8) : senderSessionId;
      const safeRecipientId = sessionId.length > 8 ? sessionId.substring(0, 8) : sessionId;

      const formattedMessage = `🔔 **INTER-AGENT MESSAGE** 🔔

**From:** Agent ${safeSenderId}...
**To:** Agent ${safeRecipientId}...
**Priority:** ${priority.toUpperCase()}
**Type:** ${messageType.replace('_', ' ').toUpperCase()}
**Time:** ${new Date().toLocaleTimeString()}

**Message:**
${message}

---
*This is an inter-agent communication sent via the AgentOrchestrator. Please respond if this requires action or acknowledgment.*`;

      // Send the message to the target agent session
      await this.client.session.prompt({
        path: { id: sessionId },
        body: {
          parts: [{ type: 'text', text: formattedMessage }],
        },
      });

      // Update the target agent's last activity
      await this.updateAgentTaskStatus(sessionId, 'running');

      // Store the communication if persistence is enabled
      if (this.config.persistenceEnabled && this.sessionStore) {
        try {
          await this.sessionStore.insert({
            id: `inter_agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            text: `Inter-agent message: ${message}`,
            timestamp: new Date().toISOString(),
            metadata: {
              type: 'inter_agent_communication',
              sender: senderSessionId,
              recipient: sessionId,
              priority,
              messageType,
              structuredMessage,
            },
          });
        } catch (storeError) {
          console.warn('Failed to store inter-agent communication:', storeError);
        }
      }

      console.log(`📨 Inter-agent message sent from ${senderSessionId} to ${sessionId}`);

      return `✅ Message sent successfully to agent ${safeRecipientId}... (Priority: ${priority}, Type: ${messageType})`;
    } catch (error) {
      console.error('Error sending agent message:', error);
      throw new Error(`Failed to send message to agent ${sessionId}: ${error}`);
    }
  }

  async listSessions(limit = 20, offset = 0): Promise<SessionListResponse> {
    try {
      const { data: sessionsList, error } = await this.client.session.list();
      if (error) {
        throw new Error(`Failed to fetch sessions: ${error}`);
      }

      if (!sessionsList || sessionsList.length === 0) {
        return {
          sessions: [],
          totalCount: 0,
          pagination: { limit, offset, hasMore: false, currentPage: 1, totalPages: 0 },
          summary: { active: 0, waiting_for_input: 0, idle: 0, agentTasks: 0 },
        };
      }

      const now = Date.now();
      const sortedSessions = sessionsList.sort((a: any, b: any) => b.id.localeCompare(a.id));
      const paginatedSessions = sortedSessions.slice(offset, offset + limit);

      const enhancedSessions = await Promise.all(
        paginatedSessions.map(async (session: any) => {
          try {
            const { data: messages } = await this.client.session.messages({
              path: { id: session.id },
            });

            const messageCount = messages?.length || 0;
            const agentTask = this.agentTasks.get(session.id);

            let activityStatus: SessionInfo['activityStatus'] = 'idle';

            if (agentTask) {
              if (agentTask.status === 'running') {
                const recentActivity = now - agentTask.lastActivity < 5 * 60 * 1000;
                activityStatus = recentActivity ? 'active' : 'waiting_for_input';
              } else {
                activityStatus =
                  agentTask.status === 'completed'
                    ? 'active'
                    : agentTask.status === 'failed'
                      ? 'idle'
                      : 'idle';
              }
            } else {
              if (messageCount < 10) {
                activityStatus = 'active';
              } else if (messageCount < 50) {
                activityStatus = 'waiting_for_input';
              }
            }

            const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;

            return {
              id: session.id,
              title: session.title,
              messageCount,
              lastActivityTime: new Date().toISOString(),
              sessionAge,
              activityStatus,
              isAgentTask: !!agentTask,
              agentTaskStatus: agentTask?.status,
            };
          } catch (messageError) {
            console.error(`Error fetching messages for session ${session.id}:`, messageError);

            const agentTask = this.agentTasks.get(session.id);
            const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;

            return {
              id: session.id,
              title: session.title,
              messageCount: 0,
              lastActivityTime: new Date().toISOString(),
              sessionAge,
              activityStatus:
                agentTask?.status === 'running'
                  ? 'waiting_for_input'
                  : ('idle' as SessionInfo['activityStatus']),
              isAgentTask: !!agentTask,
              agentTaskStatus: agentTask?.status,
              error: 'Could not fetch messages',
            };
          }
        }),
      );

      const totalCount = sessionsList.length;
      const hasMore = offset + limit < totalCount;

      return {
        sessions: enhancedSessions,
        totalCount,
        pagination: {
          limit,
          offset,
          hasMore,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          active: enhancedSessions.filter((s: SessionInfo) => s.activityStatus === 'active').length,
          waiting_for_input: enhancedSessions.filter(
            (s: SessionInfo) => s.activityStatus === 'waiting_for_input',
          ).length,
          idle: enhancedSessions.filter((s: SessionInfo) => s.activityStatus === 'idle').length,
          agentTasks: enhancedSessions.filter((s: SessionInfo) => s.isAgentTask).length,
        },
      };
    } catch (error) {
      console.error('Error listing sessions:', error);
      throw new Error(`Failed to list sessions: ${error}`);
    }
  }

  async cleanupCompletedAgents(olderThanMinutes = 60): Promise<string> {
    const now = Date.now();
    const threshold = olderThanMinutes * 60 * 1000;
    let removedCount = 0;

    for (const [sessionId, task] of Array.from(this.agentTasks.entries())) {
      const isCompletedOrFailed = task.status === 'completed' || task.status === 'failed';
      const isOldEnough = now - task.lastActivity > threshold;

      if (isCompletedOrFailed && isOldEnough) {
        this.agentTasks.delete(sessionId);
        removedCount++;
        console.log(`🧹 Cleaned up agent task ${sessionId} (${task.status})`);
      }
    }

    return `Cleaned up ${removedCount} completed/failed agent tasks older than ${olderThanMinutes} minutes`;
  }

  private async updateAgentTaskStatus(
    sessionId: string,
    status: AgentTask['status'],
    completionMessage?: string,
  ): Promise<void> {
    const existingTask = this.agentTasks.get(sessionId);
    if (existingTask) {
      existingTask.status = status;
      existingTask.lastActivity = Date.now();
      if (completionMessage) {
        existingTask.completionMessage = completionMessage;
      }

      // Update in persistent storage if enabled
      if (this.config.persistenceEnabled && this.agentTaskStore) {
        try {
          await this.agentTaskStore.insert({
            id: sessionId,
            text: existingTask.task,
            timestamp: existingTask.startTime,
            metadata: {
              sessionId,
              status,
              lastActivity: existingTask.lastActivity,
              completionMessage,
            },
          });
        } catch (error) {
          console.error('Error updating agent task in persistent storage:', error);
        }
      }

      console.log(`Agent task status updated for session ${sessionId}: ${status}`);
    }
  }

  private monitorAgentTasks(): void {
    const now = Date.now();

    for (const [sessionId, task] of Array.from(this.agentTasks.entries())) {
      if (task.status === 'running' && now - task.lastActivity > this.config.timeoutThreshold) {
        console.warn(
          `⚠️ Agent task timeout for session ${sessionId} (inactive for ${this.config.timeoutThreshold / 60000} minutes)`,
        );
        this.updateAgentTaskStatus(sessionId, 'failed', 'Task timed out due to inactivity');
      }
    }
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(
      () => this.monitorAgentTasks(),
      this.config.monitoringInterval,
    );
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('🧹 Stopped agent monitoring');
    }
  }

  async destroy(): Promise<void> {
    this.stopMonitoring();

    // Cleanup persistent connections if needed
    // This would depend on the DualStoreManager implementation
    console.log('🧹 AgentOrchestrator destroyed');
  }
}
