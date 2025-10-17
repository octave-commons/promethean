import { type Plugin } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';

// Types
interface AgentTask {
  sessionId: string;
  task: string;
  startTime: number;
  status: 'running' | 'completed' | 'failed' | 'idle';
  lastActivity: number;
  completionMessage?: string;
}

interface SessionInfo {
  id: string;
  title: string;
  messageCount: number;
  lastActivityTime: string;
  sessionAge: number;
  activityStatus: string;
  isAgentTask: boolean;
  agentTaskStatus?: string;
  error?: string;
}

// Storage
const sessions = new Map<string, any>();
let sessionStore: DualStoreManager<'text', 'timestamp'>;
let agentTaskStore: DualStoreManager<'text', 'timestamp'>;
const agentTasks = new Map<string, AgentTask>();

// Utility Functions
class SessionUtils {
  static extractSessionId(event: any): string | null {
    const extractors: Record<string, () => string | undefined> = {
      'session.idle': () => event.properties.sessionID || event.properties.session?.id,
      'session.updated': () => event.properties.info?.id || event.properties.session?.id,
      'message.updated': () => event.properties.message?.session_id || event.properties.sessionId,
      'message.part.updated': () =>
        event.properties.message?.session_id || event.properties.sessionId,
      'session.compacted': () => event.properties.sessionId || event.properties.session?.id,
    };

    const extractor = extractors[event.type];
    return extractor ? extractor() || null : null;
  }

  static async getSessionMessages(client: any, sessionId: string) {
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
    _session: any,
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

  static createSessionInfo(session: any, messageCount: number, agentTask?: AgentTask): SessionInfo {
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
      isAgentTask: !!agentTask,
      agentTaskStatus: agentTask?.status,
    };
  }
}

class MessageProcessor {
  private static readonly COMPLETION_PATTERNS = [
    /task.*completed/i,
    /finished.*task/i,
    /done.*with.*task/i,
    /task.*finished/i,
    /completed.*successfully/i,
    /work.*complete/i,
    /all.*done/i,
    /mission.*accomplished/i,
    /objective.*achieved/i,
    /✅|🎉|🏆|✓/g,
  ];

  static detectTaskCompletion(messages: any[]): { completed: boolean; completionMessage?: string } {
    if (!messages?.length) return { completed: false };

    const lastMessage = messages[messages.length - 1];
    const textParts = lastMessage?.parts?.filter((part: any) => part.type === 'text') || [];

    if (!textParts.length) return { completed: false };

    const lastText = textParts[textParts.length - 1].text.toLowerCase();
    const isCompleted = this.COMPLETION_PATTERNS.some((pattern) => pattern.test(lastText));

    return {
      completed: isCompleted,
      completionMessage: isCompleted ? lastText : undefined,
    };
  }

  static async processMessage(client: any, sessionId: string, message: any) {
    if (!message?.parts) return;

    await Promise.all(
      message.parts.map(async (part: any) => {
        if (part.type === 'text' && part.text.trim()) {
          try {
            await sessionStore.insert({
              id: message.info.id,
              text: part.text,
              timestamp: new Date().toISOString(),
              metadata: {
                sessionID: sessionId,
                messageID: message.info.id,
                type: 'text',
              },
            });
            console.log(`📝 Indexed message ${message.info.id} from session ${sessionId}`);
          } catch (error) {
            console.error(`Error storing message ${message.info.id}:`, error);
          }
        }
      }),
    );
  }

  static async processSessionMessages(client: any, sessionId: string) {
    const messages = await SessionUtils.getSessionMessages(client, sessionId);
    await Promise.all(messages.map((message) => this.processMessage(client, sessionId, message)));
  }
}

class AgentTaskManager {
  static async updateTaskStatus(
    sessionId: string,
    status: AgentTask['status'],
    completionMessage?: string,
  ) {
    const task = agentTasks.get(sessionId);
    if (!task) return;

    task.status = status;
    task.lastActivity = Date.now();
    if (completionMessage) task.completionMessage = completionMessage;

    console.log(`Agent task status updated for session ${sessionId}: ${status}`);

    try {
      await agentTaskStore.insert({
        id: sessionId,
        text: task.task,
        timestamp: task.startTime,
        metadata: {
          sessionId,
          status,
          lastActivity: task.lastActivity,
          completionMessage,
        },
      });
    } catch (error) {
      console.error('Error updating agent task in dual store:', error);
    }

    this.logTaskCompletion(sessionId, status, completionMessage);
  }

  private static logTaskCompletion(sessionId: string, status: string, completionMessage?: string) {
    if (status === 'completed') {
      console.log(`✅ Agent task completed for session ${sessionId}:`, completionMessage);
    } else if (status === 'failed') {
      console.log(`❌ Agent task failed for session ${sessionId}:`, completionMessage);
    }
  }

  static monitorTasks() {
    const now = Date.now();
    const timeoutThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, task] of agentTasks.entries()) {
      if (task.status === 'running' && now - task.lastActivity > timeoutThreshold) {
        console.warn(
          `⚠️ Agent task timeout for session ${sessionId} (inactive for ${timeoutThreshold / 60000} minutes)`,
        );
        this.updateTaskStatus(sessionId, 'failed', 'Task timed out due to inactivity');
      }
    }
  }

  static async createTask(sessionId: string, task: string): Promise<AgentTask> {
    const startTime = Date.now();
    const agentTask: AgentTask = {
      sessionId,
      task,
      startTime,
      status: 'running',
      lastActivity: startTime,
    };

    agentTasks.set(sessionId, agentTask);

    try {
      await agentTaskStore.insert({
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

  static async getAllTasks(): Promise<Map<string, AgentTask>> {
    try {
      const storedTasks = await agentTaskStore.getMostRecent(100);
      const allTasks = new Map(agentTasks);

      for (const task of storedTasks) {
        if (!allTasks.has(task.id || '')) {
          const sessionId = (task.metadata?.sessionId as string) || task.id || 'unknown';
          const startTime = this.parseTimestamp(task.timestamp);
          const status = (task.metadata?.status as AgentTask['status']) || 'idle';
          const lastActivity = this.parseTimestamp(task.metadata?.lastActivity) || startTime;
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
      return agentTasks;
    }
  }

  static parseTimestamp(timestamp: any): number {
    if (typeof timestamp === 'number') return timestamp;
    if (typeof timestamp === 'string') return new Date(timestamp).getTime();
    return Date.now();
  }
}

class EventProcessor {
  static async handleSessionIdle(client: any, sessionId: string) {
    console.log(`💤 Session ${sessionId} is idle`);
    await AgentTaskManager.updateTaskStatus(sessionId, 'idle');

    const messages = await SessionUtils.getSessionMessages(client, sessionId);
    const completion = MessageProcessor.detectTaskCompletion(messages);
    if (completion.completed) {
      await AgentTaskManager.updateTaskStatus(sessionId, 'completed', completion.completionMessage);
    }
  }

  static async handleSessionUpdated(_client: any, sessionId: string) {
    console.log(`🔄 Session ${sessionId} updated`);
    await AgentTaskManager.updateTaskStatus(sessionId, 'running');
  }

  static async handleMessageUpdated(_client: any, sessionId: string) {
    console.log(`💬 Message updated in session ${sessionId}`);
    await AgentTaskManager.updateTaskStatus(sessionId, 'running');
  }

  static async processSessionMessages(client: any, sessionId: string) {
    await MessageProcessor.processSessionMessages(client, sessionId);
  }
}

class InterAgentMessenger {
  static async sendMessage(
    client: any,
    sessionId: string,
    message: string,
    priority: string,
    messageType: string,
  ) {
    const targetTask = agentTasks.get(sessionId);
    if (!targetTask && !(await this.verifyAgentExists(sessionId))) {
      return `❌ No agent found with session ID: ${sessionId}`;
    }

    const senderSessionId = await this.getSenderSessionId(client);
    const formattedMessage = this.formatMessage(
      senderSessionId,
      sessionId,
      message,
      priority,
      messageType,
    );

    await client.session.prompt({
      path: { id: sessionId },
      body: { parts: [{ type: 'text' as const, text: formattedMessage }] },
    });

    await AgentTaskManager.updateTaskStatus(sessionId, 'running');
    await this.logCommunication(senderSessionId, sessionId, message, priority, messageType);

    const safeRecipientId = sessionId.length > 8 ? sessionId.substring(0, 8) : sessionId;
    return `✅ Message sent successfully to agent ${safeRecipientId}... (Priority: ${priority}, Type: ${messageType})`;
  }

  private static async verifyAgentExists(sessionId: string): Promise<boolean> {
    try {
      const storedTasks = await agentTaskStore.getMostRecent(100);
      return storedTasks.some((task) => task.id === sessionId);
    } catch {
      return false;
    }
  }

  private static async getSenderSessionId(client: any): Promise<string> {
    try {
      const currentSession = await client.session.list();
      return currentSession.data?.[0]?.id || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private static formatMessage(
    senderId: string,
    recipientId: string,
    message: string,
    priority: string,
    messageType: string,
  ): string {
    const safeSenderId = senderId.length > 8 ? senderId.substring(0, 8) : senderId;
    const safeRecipientId = recipientId.length > 8 ? recipientId.substring(0, 8) : recipientId;

    return `🔔 **INTER-AGENT MESSAGE** 🔔

**From:** Agent ${safeSenderId}...
**To:** Agent ${safeRecipientId}...
**Priority:** ${priority.toUpperCase()}
**Type:** ${messageType.replace('_', ' ').toUpperCase()}
**Time:** ${new Date().toLocaleTimeString()}

**Message:**
${message}

`;
  }

  private static async logCommunication(
    senderId: string,
    recipientId: string,
    message: string,
    priority: string,
    messageType: string,
  ) {
    console.log(`📨 Inter-agent message sent from ${senderId} to ${recipientId}`);
    console.log(`📝 Message type: ${messageType}, Priority: ${priority}`);

    try {
      await sessionStore.insert({
        id: `inter_agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        text: `Inter-agent message: ${message}`,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'inter_agent_communication',
          sender: senderId,
          recipient: recipientId,
          priority,
          messageType,
        },
      });
    } catch (error) {
      console.warn('⚠️ Failed to store inter-agent communication:', error);
    }
  }
}

// Main Plugin
export const MyPlugin: Plugin = async ({ client }) => {
  sessionStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
  agentTaskStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');

  // Start monitoring
  const monitoringInterval = setInterval(AgentTaskManager.monitorTasks, 5 * 60 * 1000);

  // Event listener
  (async () => {
    try {
      const events = await client.event.subscribe();
      console.log('🔍 Started listening for session events...');

      for await (const event of events.stream) {
        try {
          const sessionId = SessionUtils.extractSessionId(event);
          if (!sessionId) continue;

          const eventHandlers: Record<string, () => Promise<void>> = {
            'session.idle': () => EventProcessor.handleSessionIdle(client, sessionId),
            'session.updated': () => EventProcessor.handleSessionUpdated(client, sessionId),
            'message.updated': () => EventProcessor.handleMessageUpdated(client, sessionId),
          };

          const handler = eventHandlers[event.type];
          if (handler) await handler();

          if (event.type === 'session.idle' || event.type === 'session.updated') {
            await EventProcessor.processSessionMessages(client, sessionId);
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      }
    } catch (error) {
      console.error('Error subscribing to events:', error);
    }
  })();

  // Cleanup
  process.on('SIGINT', () => {
    clearInterval(monitoringInterval);
    console.log('🧹 Cleaned up monitoring interval');
  });

  return {
    tool: {
      search_sessions: {
        description: 'Search past sessions by semantic embedding',
        args: {
          query: { type: 'string', description: 'The search query' },
          k: { type: 'number', description: 'Number of results to return', default: 5 },
        },
        execute: async ({ query, k }: { query: string; k?: number }) => {
          try {
            const results = await sessionStore.getMostRelevant([query], k || 5);
            return JSON.stringify(results);
          } catch (error) {
            console.error('Error searching sessions:', error);
            return `Failed to search sessions: ${error}`;
          }
        },
      },

      list_sessions: {
        description: 'List all active sessions with pagination and activity status',
        args: {
          limit: { type: 'number', description: 'Number of sessions to return', default: 20 },
          offset: { type: 'number', description: 'Number of sessions to skip', default: 0 },
        },
        execute: async ({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
          try {
            const { data: sessionsList, error } = await client.session.list();
            if (error) return `Failed to fetch sessions: ${error}`;
            if (!sessionsList?.length) {
              return JSON.stringify({
                sessions: [],
                totalCount: 0,
                pagination: { limit, offset, hasMore: false },
              });
            }

            const sortedSessions = sessionsList.sort((a, b) => b.id.localeCompare(a.id));
            const paginatedSessions = sortedSessions.slice(offset, offset + limit);

            const enhancedSessions = await Promise.all(
              paginatedSessions.map(async (session) => {
                try {
                  const messages = await SessionUtils.getSessionMessages(client, session.id);
                  const agentTask = agentTasks.get(session.id);
                  return SessionUtils.createSessionInfo(session, messages.length, agentTask);
                } catch (error) {
                  console.error(`Error processing session ${session.id}:`, error);
                  const agentTask = agentTasks.get(session.id);
                  return {
                    ...SessionUtils.createSessionInfo(session, 0, agentTask),
                    error: 'Could not fetch messages',
                  };
                }
              }),
            );

            const totalCount = sessionsList.length;
            const hasMore = offset + limit < totalCount;

            return JSON.stringify(
              {
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
                  active: enhancedSessions.filter((s) => s.activityStatus === 'active').length,
                  waiting_for_input: enhancedSessions.filter(
                    (s) => s.activityStatus === 'waiting_for_input',
                  ).length,
                  idle: enhancedSessions.filter((s) => s.activityStatus === 'idle').length,
                  agentTasks: enhancedSessions.filter((s) => s.isAgentTask).length,
                },
              },
              null,
              2,
            );
          } catch (error) {
            console.error('Error in list_sessions:', error);
            return `Failed to list sessions: ${error}`;
          }
        },
      },

      get_session: {
        description: 'Get details of a specific session by ID',
        args: {
          sessionId: { type: 'string', description: 'The ID of the session to retrieve' },
        },
        execute: async ({ sessionId }: { sessionId: string }) => {
          const { data: session, error } = await client.session.get({ path: { id: sessionId } });
          if (error) return `Failed to fetch session "${sessionId}": ${error}`;
          return JSON.stringify(session);
        },
      },

      close_session: {
        description: 'Close a specific session by ID',
        args: {
          sessionId: { type: 'string', description: 'The ID of the session to close' },
        },
        execute: async ({ sessionId }: { sessionId: string }) => {
          await client.session.delete({ path: { id: sessionId } });
          return `Session ${sessionId} was closed`;
        },
      },

      index_sessions: {
        description: 'Index all past sessions for semantic search',
        args: {},
        execute: async () => {
          const { data: sessionsList, error } = await client.session.list();
          if (error) return `Failed to fetch sessions: ${error}`;

          await Promise.all(
            sessionsList?.map(async (session) => {
              const messages = await SessionUtils.getSessionMessages(client, session.id);
              await Promise.all(
                messages.map((message) =>
                  MessageProcessor.processMessage(client, session.id, message),
                ),
              );
            }) ?? [],
          );
          return `Indexed messages from ${sessionsList?.length} sessions for semantic search`;
        },
      },

      spawn_session: {
        description:
          'Spawn a new session with a specific task to run in the background while you continue your work',
        args: {
          prompt: { type: 'string', description: 'The task for the new agent session' },
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional files the session may need',
          },
          delegates: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional list of agents to delegate tasks to',
          },
        },
        execute: async ({
          prompt,
          files,
          delegates,
        }: {
          prompt: string;
          files?: string[];
          delegates?: string[];
        }) => {
          const agentName = `SubAgent-${Math.random().toString(36).substring(2, 8)}`;

          try {
            const { data: subSession, error } = await client.session.create({
              body: { title: agentName },
            });

            if (error) return `Failed to spawn sub-agent "${agentName}": ${error.data}`;

            sessions.set(subSession.id, subSession);
            await AgentTaskManager.createTask(subSession.id, prompt);

            const taskDescription = `You are "${agentName}", a sub-agent spawned to assist with the following task: ${prompt}. Work independently to complete this task while the main agent continues its work.`;

            const parts: Array<
              | { type: 'text'; text: string }
              | { type: 'file'; url: string; mime: string }
              | { type: 'agent'; name: string }
            > = [{ type: 'text', text: taskDescription }];

            if (files?.length) {
              files.forEach((file: string) =>
                parts.push({
                  type: 'file',
                  url: `file://${file}`,
                  mime: 'text/plain',
                }),
              );
            }

            if (delegates?.length) {
              delegates.forEach((delegateName: string) =>
                parts.push({
                  type: 'agent',
                  name: delegateName,
                }),
              );
            }

            client.session.prompt({
              path: { id: subSession.id },
              body: { parts },
            });

            console.log(
              `🚀 Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`,
            );
            return `Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`;
          } catch (error) {
            console.error('Error in spawn_agent:', error);
            return `Failed to spawn sub-agent "${agentName}": ${error}`;
          }
        },
      },

      monitor_agents: {
        description: 'Monitor the status of all spawned sub-agent tasks',
        args: {},
        execute: async () => {
          try {
            const allAgentTasks = await AgentTaskManager.getAllTasks();
            const now = Date.now();

            const agentStatus = Array.from(allAgentTasks.entries()).map(([sessionId, task]) => ({
              sessionId,
              task: task.task,
              status: task.status,
              startTime: new Date(task.startTime).toISOString(),
              lastActivity: new Date(task.lastActivity).toISOString(),
              duration: Math.round((now - task.startTime) / 1000),
              completionMessage: task.completionMessage,
            }));

            const summary = {
              totalAgents: allAgentTasks.size,
              running: agentStatus.filter((a) => a.status === 'running').length,
              completed: agentStatus.filter((a) => a.status === 'completed').length,
              failed: agentStatus.filter((a) => a.status === 'failed').length,
              idle: agentStatus.filter((a) => a.status === 'idle').length,
              agents: agentStatus,
            };

            return JSON.stringify(summary, null, 2);
          } catch (error) {
            console.error('Error monitoring agents:', error);
            return `Failed to monitor agents: ${error}`;
          }
        },
      },

      get_agent_status: {
        description: 'Get the status of a specific sub-agent by session ID',
        args: {
          sessionId: { type: 'string', description: 'The session ID of the sub-agent to check' },
        },
        execute: async ({ sessionId }: { sessionId: string }) => {
          try {
            let task = agentTasks.get(sessionId);

            if (!task) {
              const storedTasks = await agentTaskStore.getMostRecent(100);
              const storedTask = storedTasks.find((t) => t.id === sessionId);
              if (storedTask) {
                task = {
                  sessionId:
                    (storedTask.metadata?.sessionId as string) || storedTask.id || 'unknown',
                  task: storedTask.text,
                  startTime: AgentTaskManager.parseTimestamp(storedTask.timestamp),
                  status: (storedTask.metadata?.status as AgentTask['status']) || 'idle',
                  lastActivity:
                    AgentTaskManager.parseTimestamp(storedTask.metadata?.lastActivity) ||
                    AgentTaskManager.parseTimestamp(storedTask.timestamp),
                  completionMessage: storedTask.metadata?.completionMessage as string | undefined,
                };
              }
            }

            if (!task) return `No agent task found for session ${sessionId}`;

            const now = Date.now();
            const status = {
              sessionId,
              task: task.task,
              status: task.status,
              startTime: new Date(task.startTime).toISOString(),
              lastActivity: new Date(task.lastActivity).toISOString(),
              duration: Math.round((now - task.startTime) / 1000),
              completionMessage: task.completionMessage,
            };

            return JSON.stringify(status, null, 2);
          } catch (error) {
            console.error('Error getting agent status:', error);
            return `Failed to get agent status: ${error}`;
          }
        },
      },

      cleanup_completed_agents: {
        description: 'Remove completed or failed agent tasks from monitoring',
        args: {
          olderThan: {
            type: 'number',
            description: 'Remove tasks completed longer than this many minutes ago',
            default: 60,
          },
        },
        execute: async ({ olderThan = 60 }: { olderThan?: number }) => {
          const now = Date.now();
          const threshold = olderThan * 60 * 1000;
          let removedCount = 0;

          for (const [sessionId, task] of Array.from(agentTasks.entries())) {
            const isCompletedOrFailed = task.status === 'completed' || task.status === 'failed';
            const isOldEnough = now - task.lastActivity > threshold;

            if (isCompletedOrFailed && isOldEnough) {
              agentTasks.delete(sessionId);
              removedCount++;
              console.log(`🧹 Cleaned up agent task ${sessionId} (${task.status})`);
            }
          }

          return `Cleaned up ${removedCount} completed/failed agent tasks older than ${olderThan} minutes`;
        },
      },

      send_agent_message: {
        description:
          'Send a message to a specific agent session to enable inter-agent communication',
        args: {
          sessionId: { type: 'string', description: 'The session ID of the target agent' },
          message: { type: 'string', description: 'The message to send to the agent' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Message priority level',
            default: 'medium',
          },
          messageType: {
            type: 'string',
            enum: ['instruction', 'query', 'update', 'coordination', 'status_request'],
            description: 'Type of message being sent',
            default: 'instruction',
          },
        },
        execute: async ({
          sessionId,
          message,
          priority = 'medium',
          messageType = 'instruction',
        }: {
          sessionId: string;
          message: string;
          priority?: string;
          messageType?: string;
        }) => {
          try {
            return await InterAgentMessenger.sendMessage(
              client,
              sessionId,
              message,
              priority,
              messageType,
            );
          } catch (error) {
            console.error('Error sending agent message:', error);
            return `❌ Failed to send message to agent ${sessionId}: ${error}`;
          }
        },
      },
    },
  };
};
