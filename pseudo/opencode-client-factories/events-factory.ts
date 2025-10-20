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
import type { OpenCodeEvent, EventMessage } from '../types/index.js';
import type { TaskContext } from '../actions/tasks/index.js';
import type { EventContext } from '../actions/events/index.js';
import type { DualStoreManager } from '@promethean/persistence';
import { OpencodeClient } from '@opencode-ai/sdk';

type ToolFunction = ReturnType<typeof tool>;

// Factory for getSessionMessages tool
export function createGetSessionMessagesTool(
  stores: DualStoreManager<'text', 'timestamp'>,
  client: OpencodeClient,
): ToolFunction {
  return tool({
    description: 'Get all messages for a specific session',
    args: {
      sessionId: tool.schema.string().describe('Session ID to get messages for'),
    },
    async execute(args) {
      const { sessionId } = args;

      const messages = await getSessionMessages(client, sessionId);

      return JSON.stringify({
        sessionId,
        messageCount: (messages as EventMessage[]).length,
        messages,
      });
    },
  });
}

// Factory for detectTaskCompletion tool
export function createDetectTaskCompletionTool(
  stores: DualStoreManager<'text', 'timestamp'>,
  client: OpencodeClient,
): ToolFunction {
  return tool({
    description: 'Detect if a task has been completed based on messages',
    args: {
      messages: tool.schema
        .array(tool.schema.unknown())
        .describe('Messages to analyze for completion'),
    },
    async execute({ messages }) {
      const completion = detectTaskCompletion(messages as EventMessage[]);

      return JSON.stringify({
        completed: completion.completed,
        completionMessage: completion.completionMessage,
        messageCount: messages.length,
      });
    },
  });
}

// Factory for processSessionMessages tool
export function createProcessSessionMessagesTool(
  stores: DualStoreManager<'text', 'timestamp'>,
  client: OpencodeClient,
): ToolFunction {
  return tool({
    description: 'Process all messages in a session',
    args: {
      sessionId: tool.schema.string().describe('Session ID to process messages for'),
    },
    async execute(args) {
      const { sessionId } = args;

      const eventContext: EventContext = { client, taskContext: stores };
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
  // removed intetnionally because they are not useful to an agent.
  // the actions these tools were exposing are only useful as internal event handlers.
  // createHandleSessionIdleTool,
  // createHandleSessionUpdatedTool,
  // createHandleMessageUpdatedTool,
  // createExtractSessionIdTool,
  createGetSessionMessagesTool,
  createDetectTaskCompletionTool,
  createProcessSessionMessagesTool,
};
