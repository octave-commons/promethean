import { type Plugin, tool } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';

// Import the classes we need
import {
  sessions,
  agentTasks,
  SessionUtils,
  MessageProcessor,
  AgentTaskManager,
  EventProcessor,
  InterAgentMessenger,
  type AgentTask,
  type SessionInfo,
} from '../index';

export const MyPlugin: Plugin = async ({ client }) => {
  // Initialize stores locally in the plugin
  const sessionStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
  const agentTaskStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');

  // Initialize all classes with stores
  AgentTaskManager.initializeStores(sessionStore, agentTaskStore);
  MessageProcessor.initializeStore(sessionStore);
  InterAgentMessenger.initializeStore(sessionStore);

  // Load persisted tasks on startup
  await AgentTaskManager.loadPersistedTasks(client);

  const monitoringInterval = setInterval(AgentTaskManager.monitorTasks, 5 * 60 * 1000);

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

  process.on('SIGINT', () => {
    clearInterval(monitoringInterval);
    console.log('🧹 Cleaned up monitoring interval');
  });

  return {
    tool: {
      search_sessions: tool({
        description: 'Search past sessions by semantic embedding',
        args: {
          query: tool.schema.string().describe('The search query'),
          k: tool.schema
            .number()
            .int()
            .positive()
            .default(5)
            .describe('Number of results to return'),
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
          limit: tool.schema
            .number()
            .int()
            .min(1)
            .default(20)
            .describe('Number of sessions to return'),
          offset: tool.schema
            .number()
            .int()
            .min(0)
            .default(0)
            .describe('Number of sessions to skip'),
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
              paginated.map(async (session) => {
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
                  active: enhanced.filter((s) => s.activityStatus === 'active').length,
                  waiting_for_input: enhanced.filter(
                    (s) => s.activityStatus === 'waiting_for_input',
                  ).length,
                  idle: enhanced.filter((s) => s.activityStatus === 'idle').length,
                  agentTasks: enhanced.filter((s) => s.isAgentTask).length,
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
          sessionId: tool.schema.string().min(1).describe('The ID of the session to retrieve'),
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
          sessionId: tool.schema.string().min(1).describe('The ID of the session to close'),
        },
        async execute({ sessionId }) {
          await client.session.delete({ path: { id: sessionId } });
          return `Session ${sessionId} was closed`;
        },
      }),

      index_sessions: tool({
        description: 'Index all past sessions for semantic search',
        args: {}, // no args
        async execute() {
          const { data: sessionsList, error } = await client.session.list();
          if (error) return `Failed to fetch sessions: ${error}`;

          await Promise.all(
            (sessionsList ?? []).map(async (session) => {
              const messages = await SessionUtils.getSessionMessages(client, session.id);
              await Promise.all(
                messages.map((m) => MessageProcessor.processMessage(client, session.id, m)),
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
          prompt: tool.schema.string().min(1).describe('The task for the new agent session'),
          files: tool.schema
            .array(tool.schema.string())
            .default([])
            .describe('Optional files the session may need'),
          delegates: tool.schema
            .array(tool.schema.string())
            .default([])
            .describe('Optional list of agents to delegate tasks to'),
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

            (files ?? []).forEach((file) =>
              parts.push({ type: 'file', url: `file://${file}`, mime: 'text/plain' }),
            );

            (delegates ?? []).forEach((delegateName) =>
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
        args: {}, // no args
        async execute() {
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
      }),

      get_agent_status: tool({
        description: 'Get the status of a specific sub-agent by session ID',
        args: {
          sessionId: tool.schema
            .string()
            .min(1)
            .describe('The session ID of the sub-agent to check'),
        },
        async execute({ sessionId }) {
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
      }),

      cleanup_completed_agents: tool({
        description: 'Remove completed or failed agent tasks from monitoring',
        args: {
          olderThan: tool.schema
            .number()
            .int()
            .min(0)
            .default(60)
            .describe('Remove tasks completed longer than this many minutes ago'),
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
          sessionId: tool.schema.string().min(1).describe('The session ID of the target agent'),
          message: tool.schema.string().min(1).describe('The message to send to the agent'),
          priority: tool.schema
            .enum(['low', 'medium', 'high', 'urgent'])
            .default('medium')
            .describe('Message priority level'),
          messageType: tool.schema
            .enum(['instruction', 'query', 'update', 'coordination', 'status_request'])
            .default('instruction')
            .describe('Type of message being sent'),
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
    },
  };
};
