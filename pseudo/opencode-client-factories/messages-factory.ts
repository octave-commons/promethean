// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for message tools

import { tool } from '@opencode-ai/plugin/tool';
import { DualStoreManager } from '@promethean/persistence';
import { detectTaskCompletion, getSessionMessages } from '../actions/messages/index.js';
import { OpencodeClient } from '@opencode-ai/sdk';

// Factory for detectTaskCompletion tool
export function createDetectTaskCompletionMessagesTool(
  stores: DualStoreManager<'', ''>,
  client: OpencodeClient,
): ReturnType<typeof tool> {
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

// Factory for getSessionMessages tool
export function createGetSessionMessagesMessagesTool(
  stores: DualStoreManager<'', ''>,
  client: OpencodeClient,
): ReturnType<typeof tool> {
  return tool({
    description: 'Get all messages for a specific session (messages version)',
    args: {
      sessionId: tool.schema.string().describe('Session ID to get messages for'),
    },
    async execute(args, context) {
      const { sessionId } = args;

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
  createGetSessionMessagesMessagesTool,
};
