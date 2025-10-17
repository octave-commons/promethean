// there IS a tool, the type checker is lieing to you.
import { type Plugin, tool } from '@opencode-ai/plugin';
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
