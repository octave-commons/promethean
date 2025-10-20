// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for event tools

import { tool } from '@opencode-ai/plugin/tool';

import {
  handleSessionIdle,
  handleSessionUpdated,
  handleMessageUpdated,
  extractSessionId,
  getSessionMessages,
  detectTaskCompletion,
  processSessionMessages,
} from '../actions/events/index.js';
import type { EventContext, OpenCodeEvent, EventMessage, EventClient } from '../../types/index.js';
import type { TaskContext } from '../../actions/tasks/index.js';

type ToolFunction = ReturnType<typeof tool>;

// Factory for handleSessionIdle tool
export function createHandleSessionIdleTool(): ToolFunction {
  return tool({
    description: 'Handle session idle event',
    args: {
      sessionId: tool.schema.string().describe('Session ID that is idle'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as Record<string, unknown>).client as EventClient;
      const taskContext = (context as Record<string, unknown>).taskContext as TaskContext;

      const eventContext: EventContext = { client, taskContext };
      await handleSessionIdle(eventContext, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        event: 'session_idle_handled',
      });
    },
  });
}

// Factory for handleSessionUpdated tool
export function createHandleSessionUpdatedTool(): ToolFunction {
  return tool({
    description: 'Handle session updated event',
    args: {
      sessionId: tool.schema.string().describe('Session ID that was updated'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as Record<string, unknown>).client as EventClient;
      const taskContext = (context as Record<string, unknown>).taskContext as TaskContext;

      const eventContext: EventContext = { client, taskContext };
      await handleSessionUpdated(eventContext, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        event: 'session_updated_handled',
      });
    },
  });
}

// Factory for handleMessageUpdated tool
export function createHandleMessageUpdatedTool(): ToolFunction {
  return tool({
    description: 'Handle message updated event',
    args: {
      sessionId: tool.schema.string().describe('Session ID where message was updated'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as Record<string, unknown>).client as EventClient;
      const taskContext = (context as Record<string, unknown>).taskContext as TaskContext;

      const eventContext: EventContext = { client, taskContext };
      await handleMessageUpdated(eventContext, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        event: 'message_updated_handled',
      });
    },
  });
}

// Factory for extractSessionId tool
export function createExtractSessionIdTool(): ToolFunction {
  return tool({
    description: 'Extract session ID from an event object',
    args: {
      event: tool.schema.object({}).describe('Event object to extract session ID from'),
      eventType: tool.schema.string().optional().describe('Type of the event'),
    },
    async execute({ event }) {
      const sessionId = extractSessionId(event as OpenCodeEvent);

      return JSON.stringify({
        sessionId,
        extracted: !!sessionId,
      });
    },
  });
}

// Factory for getSessionMessages tool
export function createGetSessionMessagesTool(): ToolFunction {
  return tool({
    description: 'Get all messages for a specific session',
    args: {
      sessionId: tool.schema.string().describe('Session ID to get messages for'),
    },
    async execute(args, context: any) {
      const { sessionId } = args;
      const client = context.client as OpencodeClient;

      const messages = await getSessionMessages(client, sessionId);

      return JSON.stringify({
        sessionId,
        messageCount: (messages as any).length,
        messages,
      });
    },
  });
}

// Factory for detectTaskCompletion tool
export function createDetectTaskCompletionTool(): ToolFunction {
  return tool({
    description: 'Detect if a task has been completed based on messages',
    args: {
      messages: tool.schema
        .array(tool.schema.object({}))
        .describe('Messages to analyze for completion'),
    },
    async execute({ messages }: { messages: any[] }) {
      const completion = detectTaskCompletion(messages);

      return JSON.stringify({
        completed: completion.completed,
        completionMessage: completion.completionMessage,
        messageCount: messages.length,
      });
    },
  });
}

// Factory for processSessionMessages tool
export function createProcessSessionMessagesTool(): ToolFunction {
  return tool({
    description: 'Process all messages in a session',
    args: {
      sessionId: tool.schema.string().describe('Session ID to process messages for'),
    },
    async execute(args, context: any) {
      const { sessionId } = args;
      const client = context.client as OpencodeClient;
      const taskContext = context.taskContext || {};

      const eventContext = { client, taskContext };
      await processSessionMessages(eventContext, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        event: 'session_messages_processed',
      });
    },
  });
}

// Export all factory functions
export const eventsToolFactories = {
  createHandleSessionIdleTool,
  createHandleSessionUpdatedTool,
  createHandleMessageUpdatedTool,
  createExtractSessionIdTool,
  createGetSessionMessagesTool,
  createDetectTaskCompletionTool,
  createProcessSessionMessagesTool,
};
