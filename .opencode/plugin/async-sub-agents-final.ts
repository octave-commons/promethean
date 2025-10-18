// Refactored to use centralized opencode-client tools
import type { Plugin } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';

// Types
interface AgentTask {
  sessionId: string;
  task: string;
  startTime: number;
  status: 'running' | 'completed' | 'failed' | 'idle';
  lastActivity: number;
  completionMessage?: string;
  taskSummary?: string;
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
const markdownCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Tool helper function
function tool(config: {
  description: string;
  args?: any;
  execute: (args: any) => Promise<string> | string;
}) {
  return config;
}

// Utility Functions (simplified versions from centralized package)
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
  private static _sessionStore: DualStoreManager<'text', 'timestamp'>;

  static initializeStore(sessionStore: DualStoreManager<'text', 'timestamp'>) {
    this._sessionStore = sessionStore;
  }

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
            await this._sessionStore.insert({
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
    await Promise.all(
      messages.map((message: any) => this.processMessage(client, sessionId, message)),
    );
  }
}

class AgentTaskManager {
  private static _sessionStore: DualStoreManager<'text', 'timestamp'>;
  private static _agentTaskStore: DualStoreManager<'text', 'timestamp'>;

  static initializeStores(
    sessionStore: DualStoreManager<'text', 'timestamp'>,
    agentTaskStore: DualStoreManager<'text', 'timestamp'>,
  ) {
    this._sessionStore = sessionStore;
    this._agentTaskStore = agentTaskStore;
  }

  static async loadPersistedTasks(client?: any) {
    try {
      console.log('🔄 Loading persisted agent tasks...');
      const storedTasks = await this._agentTaskStore.getMostRecent(100);
      let loadedCount = 0;
      let cleanedCount = 0;

      for (const task of storedTasks) {
        const sessionId = task.metadata?.sessionId as string;
        if (sessionId) {
          // Verify session still exists before restoring
          const sessionExists = client ? await this.verifySessionExists(client, sessionId) : true;
          if (sessionExists) {
            // Restore task to memory
            const agentTask: AgentTask = {
              sessionId,
              task: task.text,
              startTime: this.parseTimestamp(task.timestamp),
              status: (task.metadata?.status as AgentTask['status']) || 'idle',
              lastActivity:
                this.parseTimestamp(task.metadata?.lastActivity) ||
                this.parseTimestamp(task.timestamp),
              completionMessage: task.metadata?.completionMessage as string | undefined,
            };

            agentTasks.set(sessionId, agentTask);
            loadedCount++;
          } else {
            // Clean up orphaned task
            await this.cleanupOrphanedTask(sessionId);
            cleanedCount++;
          }
        }
      }

      console.log(
        `✅ Loaded ${loadedCount} agent tasks, cleaned up ${cleanedCount} orphaned tasks`,
      );
    } catch (error) {
      console.error('Error loading persisted tasks:', error);
    }
  }

  static async verifySessionExists(client: any, sessionId: string): Promise<boolean> {
    try {
      const { data: session } = await client.session.get({ path: { id: sessionId } });
      return !!session;
    } catch {
      return false;
    }
  }

  static async cleanupOrphanedTask(sessionId: string) {
    console.log(`🧹 Cleaning up orphaned agent task: ${sessionId}`);
    agentTasks.delete(sessionId);
    // Note: We keep the persistent record for audit purposes
  }

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
      await this._agentTaskStore.insert({
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
      await this._agentTaskStore.insert({
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
      const storedTasks = await this._agentTaskStore.getMostRecent(100);
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
  private static _sessionStore: DualStoreManager<'text', 'timestamp'>;

  static initializeStore(sessionStore: DualStoreManager<'text', 'timestamp'>) {
    this._sessionStore = sessionStore;
  }

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
      await this._sessionStore.insert({
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

export const MyPlugin: Plugin = async ({ client }) => {
  // Initialize stores locally in the plugin
  sessionStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
  agentTaskStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');

  // Initialize all classes with stores
  AgentTaskManager.initializeStores(sessionStore, agentTaskStore);
  MessageProcessor.initializeStore(sessionStore);
  InterAgentMessenger.initializeStore(sessionStore);

  // Load persisted tasks on startup

  const monitoringInterval = setInterval(AgentTaskManager.monitorTasks, 5 * 60 * 1000);

  // Start event processing
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

  // Cleanup on process exit
  process.on('SIGINT', () => {
    clearInterval(monitoringInterval);
    console.log('🧹 Cleaned up monitoring interval');
  });

  return {
    tool: {
      search_sessions: tool({
        description: 'Search past sessions by semantic embedding',
        args: {
          query: { type: 'string', description: 'The search query' },
          k: { type: 'number', default: 5, description: 'Number of results to return' },
        },
        async execute({ query, k }) {
          try {
            const results = await sessionStore.getMostRelevant([query], k);
            return JSON.stringify(results);
          } catch (error) {
            console.error('Error searching sessions:', error);
            return `Failed to search sessions: ${error}`;
          }
        },
      }),

      list_sessions: tool({
        description: 'List all active sessions with pagination and activity status',
        args: {
          limit: { type: 'number', default: 20, description: 'Number of sessions to return' },
          offset: { type: 'number', default: 0, description: 'Number of sessions to skip' },
        },
        async execute({ limit, offset }) {
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

            const sortedSessions = [...sessionsList].sort((a, b) => b.id.localeCompare(a.id));
            const paginated = sortedSessions.slice(offset, offset + limit);

            const enhanced = await Promise.all(
              paginated.map(async (session: any) => {
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
                sessions: enhanced,
                totalCount,
                pagination: {
                  limit,
                  offset,
                  hasMore,
                  currentPage: Math.floor(offset / limit) + 1,
                  totalPages: Math.ceil(totalCount / limit),
                },
                summary: {
                  active: enhanced.filter((s: any) => s.activityStatus === 'active').length,
                  waiting_for_input: enhanced.filter(
                    (s: any) => s.activityStatus === 'waiting_for_input',
                  ).length,
                  idle: enhanced.filter((s: any) => s.activityStatus === 'idle').length,
                  agentTasks: enhanced.filter((s: any) => s.isAgentTask).length,
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
      }),

      get_session: tool({
        description: 'Get details of a specific session by ID',
        args: {
          sessionId: { type: 'string', description: 'The ID of the session to retrieve' },
        },
        async execute({ sessionId }) {
          const { data: session, error } = await client.session.get({ path: { id: sessionId } });
          if (error) return `Failed to fetch session "${sessionId}": ${error}`;
          return JSON.stringify(session);
        },
      }),

      close_session: tool({
        description: 'Close a specific session by ID',
        args: {
          sessionId: { type: 'string', description: 'The ID of the session to close' },
        },
        async execute({ sessionId }) {
          await client.session.delete({ path: { id: sessionId } });
          return `Session ${sessionId} was closed`;
        },
      }),

      index_sessions: tool({
        description: 'Index all past sessions for semantic search',
        args: {},
        async execute() {
          const { data: sessionsList, error } = await client.session.list();
          if (error) return `Failed to fetch sessions: ${error}`;

          await Promise.all(
            (sessionsList ?? []).map(async (session: any) => {
              const messages = await SessionUtils.getSessionMessages(client, session.id);
              await Promise.all(
                messages.map((m: any) => MessageProcessor.processMessage(client, session.id, m)),
              );
            }),
          );
          return `Indexed messages from ${sessionsList?.length ?? 0} sessions for semantic search`;
        },
      }),

      spawn_session: tool({
        description:
          'Spawn a new session with a specific task to run in the background while you continue your work',
        args: {
          prompt: { type: 'string', description: 'The task for the new agent session' },
          files: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: 'Optional files the session may need',
          },
          delegates: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: 'Optional list of agents to delegate tasks to',
          },
        },
        async execute({ prompt, files, delegates }) {
          const agentName = `SubAgent-${Math.random().toString(36).substring(2, 8)}`;

          try {
            const { data: subSession, error } = await client.session.create({
              body: { title: agentName },
            });
            if (error) return `Failed to spawn sub-agent "${agentName}": ${error.data}`;

            sessions.set(subSession.id, subSession);
            await AgentTaskManager.createTask(subSession.id, prompt);

            const taskDescription =
              `You are "${agentName}", a sub-agent spawned to assist with the following task: ${prompt}. ` +
              `Work independently to complete this task while the main agent continues its work.`;

            const parts: Array<
              | { type: 'text'; text: string }
              | { type: 'file'; url: string; mime: string }
              | { type: 'agent'; name: string }
            > = [{ type: 'text', text: taskDescription }];

            (files ?? []).forEach((file: string) =>
              parts.push({ type: 'file', url: `file://${file}`, mime: 'text/plain' }),
            );

            (delegates ?? []).forEach((delegateName: string) =>
              parts.push({ type: 'agent', name: delegateName }),
            );

            client.session.prompt({ path: { id: subSession.id }, body: { parts } });

            console.log(
              `🚀 Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`,
            );
            return `Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`;
          } catch (error) {
            console.error('Error in spawn_agent:', error);
            return `Failed to spawn sub-agent "${agentName}": ${error}`;
          }
        },
      }),

      monitor_agents: tool({
        description: 'Monitor the status of all spawned sub-agent tasks',
        args: {},
        async execute() {
          try {
            const allAgentTasks = await AgentTaskManager.getAllTasks();
            const now = Date.now();

            const agentStatus = await Promise.all(
              Array.from(allAgentTasks.entries()).map(async ([sessionId, task]) => ({
                sessionId,
                task: await ensureTaskSummary(task),
                status: task.status,
                startTime: new Date(task.startTime).toISOString(),
                lastActivity: new Date(task.lastActivity).toISOString(),
                duration: Math.round((now - task.startTime) / 1000),
                completionMessage: task.completionMessage,
              })),
            );

            const summary = {
              totalAgents: allAgentTasks.size,
              running: agentStatus.filter((a: any) => a.status === 'running').length,
              completed: agentStatus.filter((a: any) => a.status === 'completed').length,
              failed: agentStatus.filter((a: any) => a.status === 'failed').length,
              idle: agentStatus.filter((a: any) => a.status === 'idle').length,
              agents: agentStatus,
            };

            return formatAsMarkdown(summary);
          } catch (error) {
            console.error('Error monitoring agents:', error);
            return `Failed to monitor agents: ${error}`;
          }
        },
      }),

      get_agent_status: tool({
        description: 'Get the status of a specific sub-agent by session ID',
        args: {
          sessionId: { type: 'string', description: 'The session ID of the sub-agent to check' },
          fullTask: {
            type: 'boolean',
            default: false,
            description: 'Include full task details instead of summary',
          },
        },
        async execute({ sessionId, fullTask }) {
          try {
            let task = agentTasks.get(sessionId);

            if (!task) {
              const storedTasks = await agentTaskStore.getMostRecent(100);
              const storedTask = storedTasks.find((t: any) => t.id === sessionId);
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
            const taskText = fullTask ? task.task || 'Unknown task' : await ensureTaskSummary(task);

            const status = {
              sessionId,
              task: taskText,
              status: task.status,
              startTime: new Date(task.startTime).toISOString(),
              lastActivity: new Date(task.lastActivity).toISOString(),
              duration: Math.round((now - task.startTime) / 1000),
              completionMessage: task.completionMessage,
            };

            return formatSingleAgentAsMarkdown(status);
          } catch (error) {
            console.error('Error getting agent status:', error);
            return `Failed to get agent status: ${error}`;
          }
        },
      }),

      cleanup_completed_agents: tool({
        description: 'Remove completed or failed agent tasks from monitoring',
        args: {
          olderThan: {
            type: 'number',
            default: 60,
            description: 'Remove tasks completed longer than this many minutes ago',
          },
        },
        async execute({ olderThan }) {
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
      }),

      send_agent_message: tool({
        description:
          'Send a message to a specific agent session to enable inter-agent communication',
        args: {
          sessionId: { type: 'string', description: 'The session ID of the target agent' },
          message: { type: 'string', description: 'The message to send to the agent' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
            description: 'Message priority level',
          },
          messageType: {
            type: 'string',
            enum: ['instruction', 'query', 'update', 'coordination', 'status_request'],
            default: 'instruction',
            description: 'Type of message being sent',
          },
        },
        async execute({ sessionId, message, priority, messageType }) {
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
      }),

      clear_agent_cache: tool({
        description: 'Clear the agent status markdown cache',
        args: {},
        async execute() {
          markdownCache.clear();
          return 'Agent status cache cleared';
        },
      }),
    },
  };
};

// Helper functions for markdown formatting and task summarization

async function ensureTaskSummary(task: AgentTask): Promise<string> {
  if (task.taskSummary) {
    return task.taskSummary;
  }

  if (task.task) {
    task.taskSummary = await summarizeTask(task.task);
    // Update the stored task with the summary
    agentTasks.set(task.sessionId, task);
    return task.taskSummary;
  }

  return 'Unknown task';
}

async function summarizeTask(task: string): Promise<string> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'error/qwen3:4b-instruct-100k',
        prompt: `Summarize this task in 1-2 sentences maximum:\n\n${task}`,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response?.trim() || task.substring(0, 100) + '...';
  } catch (error) {
    console.warn('Failed to summarize task:', error);
    return task.substring(0, 100) + '...';
  }
}

function formatAsMarkdown(summary: any): string {
  const cacheKey = 'monitor_agents';
  const cached = markdownCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const { totalAgents, running, completed, failed, idle, agents } = summary;

  let markdown = `# Agent Status Summary\n\n`;
  markdown += `**Total Agents:** ${totalAgents}\n`;
  markdown += `**Running:** ${running} | **Completed:** ${completed} | **Failed:** ${failed} | **Idle:** ${idle}\n\n`;

  if (agents.length > 0) {
    markdown += `## Agent Details\n\n`;
    agents.forEach((agent: any) => {
      markdown += `### ${agent.sessionId.substring(0, 8)}...\n`;
      markdown += `- **Status:** ${agent.status}\n`;
      markdown += `- **Task:** ${agent.task}\n`;
      markdown += `- **Duration:** ${agent.duration}s\n`;
      if (agent.completionMessage) {
        markdown += `- **Completion:** ${agent.completionMessage}\n`;
      }
      markdown += `\n`;
    });
  }

  markdownCache.set(cacheKey, { content: markdown, timestamp: Date.now() });
  return markdown;
}

function formatSingleAgentAsMarkdown(status: any): string {
  const cacheKey = `agent_${status.sessionId}`;
  const cached = markdownCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  let markdown = `# Agent Status\n\n`;
  markdown += `**Session ID:** ${status.sessionId}\n`;
  markdown += `**Status:** ${status.status}\n`;
  markdown += `**Task:** ${status.task}\n`;
  markdown += `**Duration:** ${status.duration}s\n`;
  markdown += `**Started:** ${status.startTime}\n`;
  markdown += `**Last Activity:** ${status.lastActivity}\n`;
  if (status.completionMessage) {
    markdown += `**Completion:** ${status.completionMessage}\n`;
  }

  markdownCache.set(cacheKey, { content: markdown, timestamp: Date.now() });
  return markdown;
}
