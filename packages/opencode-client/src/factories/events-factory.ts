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

// Factory for handleSessionIdle tool
export function createHandleSessionIdleTool(): any {
  return tool({
    description: 'Handle session idle event',
    args: {
      sessionId: tool.schema.string().describe('Session ID that is idle'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;
      const taskContext = (context as any).taskContext;

      const eventContext = { client, taskContext };
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
export function createHandleSessionUpdatedTool(): any {
  return tool({
    description: 'Handle session updated event',
    args: {
      sessionId: tool.schema.string().describe('Session ID that was updated'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;
      const taskContext = (context as any).taskContext;

      const eventContext = { client, taskContext };
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
export function createHandleMessageUpdatedTool(): any {
  return tool({
    description: 'Handle message updated event',
    args: {
      sessionId: tool.schema.string().describe('Session ID where message was updated'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;
      const taskContext = (context as any).taskContext;

      const eventContext = { client, taskContext };
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
export function createExtractSessionIdTool(): any {
  return tool({
    description: 'Extract session ID from an event object',
    args: {
      event: tool.schema.object({}).describe('Event object to extract session ID from'),
      eventType: tool.schema.string().optional().describe('Type of the event'),
    },
    async execute({ event }) {
      const sessionId = extractSessionId(event);

      return JSON.stringify({
        sessionId,
        extracted: !!sessionId,
      });
    },
  });
}

// Factory for getSessionMessages tool
export function createGetSessionMessagesTool(): any {
  return tool({
    description: 'Get all messages for a specific session',
    args: {
      sessionId: tool.schema.string().describe('Session ID to get messages for'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;

      const messages = await getSessionMessages(client, sessionId);

      return JSON.stringify({
        sessionId,
        messageCount: messages.length,
        messages,
      });
    },
  });
}

// Factory for detectTaskCompletion tool
export function createDetectTaskCompletionTool(): any {
  return tool({
    description: 'Detect if a task has been completed based on messages',
    args: {
      messages: tool.schema
        .array(tool.schema.object({}))
        .describe('Messages to analyze for completion'),
    },
    async execute({ messages }) {
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
export function createProcessSessionMessagesTool(): any {
  return tool({
    description: 'Process all messages in a session',
    args: {
      sessionId: tool.schema.string().describe('Session ID to process messages for'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;

      const eventContext = { client, taskContext: (context as any).taskContext || {} };
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
