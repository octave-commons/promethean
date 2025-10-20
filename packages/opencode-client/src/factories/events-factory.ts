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

type ToolContext = {
  agent: string;
  sessionID: string;
  messageID: string;
};

// Factory for handleSessionIdle tool
export function createHandleSessionIdleTool(
  stores: DualStoreManager<'text', 'timestamp'>,
  client: OpencodeClient,
): ToolFunction {
  return tool({
    description: 'Handle session idle event',
    args: {
      sessionId: tool.schema.string().describe('Session ID that is idle'),
    },
    async execute(args, context: ToolContext) {
      const { sessionId } = args;

      await handleSessionUpdated(stores, sessionId);

      return JSON.stringify({
        success: true,
        sessionId,
        event: 'session_updated_handled',
      });
    },
  });
}

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
    async execute(args, context) {
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
    async execute(args, context) {
      const { sessionId } = args;

      const taskContext: TaskContext = {
        agentTaskStore: stores,
      };

      const eventContext: EventContext = { client, taskContext };
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
