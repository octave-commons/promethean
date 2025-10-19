/**
 * Agent Management Tool Factory
 * Creates OpenCode SDK-compatible tools for agent management
 */

import { tool } from '@opencode-ai/plugin/tool';
import {
  createAgentSession,
  startAgentSession,
  stopAgentSession,
  sendMessageToAgent,
  closeAgentSession,
  unifiedAgentManager,
} from '../api/UnifiedAgentManager.js';

export function createCreateAgentSessionTool(): any {
  return tool({
    description: 'Create a new agent session with task assignment and optional initial message',
    args: {
      task: tool.schema.string().describe('Task description for the agent to accomplish'),
      initialMessage: tool.schema
        .string()
        .optional()
        .describe('Optional initial message to send to the agent'),
      title: tool.schema.string().optional().describe('Optional title for the session'),
      priority: tool.schema
        .enum(['low', 'medium', 'high', 'urgent'])
        .optional()
        .describe('Task priority level'),
      files: tool.schema
        .array(tool.schema.string())
        .optional()
        .describe('Optional list of files to include in the session'),
      autoStart: tool.schema
        .boolean()
        .optional()
        .describe('Whether to start agent session automatically'),
    },
    async execute(args: any, _context: any) {
      try {
        const session = await createAgentSession(
          args.task,
          args.initialMessage,
          {
            title: args.title,
            priority: args.priority,
            files: args.files,
          },
          {
            autoStart: args.autoStart,
          },
        );

        const result = {
          success: true,
          sessionId: session.sessionId,
          status: session.status,
          task: session.task.task,
          createdAt: session.createdAt.toISOString(),
          lastActivity: new Date(session.task.lastActivity).toISOString(),
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createStartAgentSessionTool(): any {
  return tool({
    description: 'Start an existing agent session',
    args: {
      sessionId: tool.schema.string().describe('ID of session to start'),
    },
    async execute(args: any, _context: any) {
      try {
        await startAgentSession(args.sessionId);

        const result = {
          success: true,
          sessionId: args.sessionId,
          status: 'running',
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createStopAgentSessionTool(): any {
  return tool({
    description: 'Stop an agent session with optional completion message',
    args: {
      sessionId: tool.schema.string().describe('ID of session to stop'),
      completionMessage: tool.schema.string().optional().describe('Optional completion message'),
    },
    async execute(args: any, _context: any) {
      try {
        await stopAgentSession(args.sessionId, args.completionMessage);

        const result = {
          success: true,
          sessionId: args.sessionId,
          status: 'completed',
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createSendAgentMessageTool(): any {
  return tool({
    description: 'Send a message to an agent session',
    args: {
      sessionId: tool.schema.string().describe('ID of session to send message to'),
      message: tool.schema.string().describe('Message content to send'),
      messageType: tool.schema.string().optional().describe('Type of message (default: user)'),
    },
    async execute(args: any, _context: any) {
      try {
        await sendMessageToAgent(args.sessionId, args.message, args.messageType);

        const result = {
          success: true,
          sessionId: args.sessionId,
          message: args.message,
          messageType: args.messageType || 'user',
          sent: true,
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createCloseAgentSessionTool(): any {
  return tool({
    description: 'Close and cleanup an agent session',
    args: {
      sessionId: tool.schema.string().describe('ID of session to close'),
    },
    async execute(args: any, _context: any) {
      try {
        await closeAgentSession(args.sessionId);

        const result = {
          success: true,
          sessionId: args.sessionId,
          closed: true,
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createListAgentSessionsTool(): any {
  return tool({
    description: 'List all active agent sessions with optional filtering',
    args: {
      status: tool.schema.string().optional().describe('Filter sessions by status (optional)'),
      limit: tool.schema
        .number()
        .optional()
        .describe('Maximum number of sessions to return (optional)'),
    },
    async execute(args: any, _context: any) {
      try {
        let sessions = await unifiedAgentManager.listAgentSessions();

        // Apply status filter
        if (args.status) {
          sessions = sessions.filter((s) => s.status === args.status);
        }

        // Apply limit
        if (args.limit && args.limit > 0) {
          sessions = sessions.slice(0, args.limit);
        }

        const result = {
          success: true,
          sessions: sessions.map((s) => ({
            sessionId: s.sessionId,
            status: s.status,
            task: s.task.task,
            taskStatus: s.task.status,
            createdAt: s.createdAt.toISOString(),
            lastActivity: new Date(s.task.lastActivity).toISOString(),
            completionMessage: s.task.completionMessage,
          })),
          total: sessions.length,
          filtered: args.status || 'all',
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createGetAgentSessionTool(): any {
  return tool({
    description: 'Get detailed information about a specific agent session',
    args: {
      sessionId: tool.schema.string().describe('ID of session to retrieve'),
    },
    async execute(args: any, _context: any) {
      try {
        const session = await unifiedAgentManager.getAgentSession(args.sessionId);

        if (!session) {
          const result = {
            success: false,
            error: `Session ${args.sessionId} not found`,
          };
          return JSON.stringify(result);
        }

        const result = {
          success: true,
          session: {
            sessionId: session.sessionId,
            status: session.status,
            task: session.task.task,
            taskStatus: session.task.status,
            createdAt: session.createdAt.toISOString(),
            lastActivity: new Date(session.task.lastActivity).toISOString(),
            completionMessage: session.task.completionMessage,
          },
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createGetAgentStatsTool(): any {
  return tool({
    description: 'Get statistics about all agent sessions',
    args: {},
    async execute(_args: any, _context: any) {
      try {
        const stats = await unifiedAgentManager.getSessionStats();

        const result = {
          success: true,
          stats: {
            totalSessions: stats.total,
            byStatus: stats.byStatus,
            averageAge: stats.averageAge,
            averageAgeFormatted: `${Math.round(stats.averageAge / 1000)}s`,
          },
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

export function createCleanupAgentSessionsTool(): any {
  return tool({
    description: 'Cleanup old completed or failed sessions',
    args: {
      maxAge: tool.schema
        .number()
        .optional()
        .describe('Maximum age in milliseconds (default: 24 hours)'),
    },
    async execute(args: any, _context: any) {
      try {
        const maxAge = args.maxAge || 24 * 60 * 60 * 1000;
        const cleaned = await unifiedAgentManager.cleanupOldSessions(maxAge);

        const result = {
          success: true,
          cleaned,
          maxAge,
          maxAgeFormatted: `${Math.round(maxAge / (60 * 60 * 1000))} hours`,
        };
        return JSON.stringify(result);
      } catch (error) {
        const result = {
          success: false,
          error: (error as Error).message,
        };
        return JSON.stringify(result);
      }
    },
  });
}

// Export all agent management tool factories as a group
export const agentManagementToolFactories = [
  createCreateAgentSessionTool,
  createStartAgentSessionTool,
  createStopAgentSessionTool,
  createSendAgentMessageTool,
  createCloseAgentSessionTool,
  createListAgentSessionsTool,
  createGetAgentSessionTool,
  createGetAgentStatsTool,
  createCleanupAgentSessionsTool,
];
