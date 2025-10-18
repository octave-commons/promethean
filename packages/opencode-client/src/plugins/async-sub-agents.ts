// SPDX-License-Identifier: GPL-3.0-only
// Async Sub-Agents Plugin - provides comprehensive agent task management and inter-agent communication

import type { Plugin } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';
import {
  initializeStores,
  AgentTaskManager,
  SessionUtils,
  MessageProcessor,
  EventProcessor,
  InterAgentMessenger,
  agentTasks,
  type AgentTask,
  type SessionInfo,
} from '../index.js';

// Cache for agent status markdown
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

/**
 * Async Sub-Agents Plugin
 *
 * Provides comprehensive agent task management including:
 * - Session spawning and management
 * - Agent task monitoring and status tracking
 * - Inter-agent communication
 * - Event-driven task completion detection
 * - Persistent storage with DualStoreManager
 */
export const AsyncSubAgentsPlugin: Plugin = async ({ client }) => {
  // Initialize stores using the centralized opencode-client tools
  const sessionStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
  const agentTaskStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');

  // Initialize all API layers with stores
  initializeStores(sessionStore, agentTaskStore);

  console.log('🚀 Async Sub-Agents Plugin initialized - agent task management enabled');

  // Load persisted tasks on startup
  await AgentTaskManager.getAllTasks();

  // Start task monitoring
  const monitoringInterval = setInterval(AgentTaskManager.monitorTasks, 5 * 60 * 1000);

  // Start event processing for automatic task management
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
          sessionId: { type: 'string', description: 'The ID of session to retrieve' },
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
          sessionId: { type: 'string', description: 'The ID of session to close' },
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
            console.error('Error in spawn_session:', error);
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
    // Update stored task with summary
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
