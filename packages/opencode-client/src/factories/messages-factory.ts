// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for message tools

import { tool } from '@opencode-ai/plugin/tool';
import {
  detectTaskCompletion,
  processMessage,
  processSessionMessages,
  getSessionMessages,
} from '../actions/messages/index.js';

// Factory for detectTaskCompletion tool
export function createDetectTaskCompletionMessagesTool(): any {
  return tool({
    description: 'Detect if a task has been completed based on messages (messages version)',
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

// Factory for processMessage tool
export function createProcessMessageTool(): any {
  return tool({
    description: 'Process a single message and store it in the session store',
    args: {
      sessionId: tool.schema.string().describe('Session ID the message belongs to'),
      message: tool.schema.object({}).describe('Message object to process'),
    },
    async execute(args, context) {
      const { sessionId, message } = args;
      const sessionStore = (context as any).sessionStore;

      if (!sessionStore) {
        throw new Error('Session store not available in context');
      }

      const messageContext = { sessionStore };
      await processMessage(messageContext, sessionId, message);

      return JSON.stringify({
        success: true,
        sessionId,
        messageId: (message as any)?.info?.id || 'unknown',
        processed: true,
      });
    },
  });
}

// Factory for processSessionMessages tool
export function createProcessSessionMessagesMessagesTool(): any {
  return tool({
    description: 'Process all messages in a session (messages version)',
    args: {
      sessionId: tool.schema.string().describe('Session ID to process messages for'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;
      const sessionStore = (context as any).sessionStore;

      if (!client || !sessionStore) {
        throw new Error('Client or session store not available in context');
      }

      const messageContext = { sessionStore };
      await processSessionMessages(messageContext, client, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        event: 'session_messages_processed',
      });
    },
  });
}

// Factory for getSessionMessages tool
export function createGetSessionMessagesMessagesTool(): any {
  return tool({
    description: 'Get all messages for a specific session (messages version)',
    args: {
      sessionId: tool.schema.string().describe('Session ID to get messages for'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;

      if (!client) {
        throw new Error('Client not available in context');
      }

      const messages = await getSessionMessages(client, sessionId);

      return JSON.stringify({
        sessionId,
        messageCount: messages.length,
        messages,
      });
    },
  });
}

// Export all factory functions
export const messagesToolFactories = {
  createDetectTaskCompletionMessagesTool,
  createProcessMessageTool,
  createProcessSessionMessagesMessagesTool,
  createGetSessionMessagesMessagesTool,
};
