// SPDX-License-Identifier: GPL-3.0-only
// Message tooling shared across Session Orchestrator plugins

import { tool } from '@opencode-ai/plugin/tool';
import type { OpencodeClient } from '@opencode-ai/sdk';

import { getSessionMessages } from '../actions/messages/index.js';
import { formatMessagesList } from '../shared/formatters.js';

export function createReadOnlyMessageTools(
  opencodeClient: OpencodeClient,
): Record<string, ReturnType<typeof tool>> {
  return {
    'list-messages': tool({
      description: 'List messages for a specific session',
      args: {
        sessionId: tool.schema.string().describe('Session ID'),
        limit: tool.schema.number().default(10).describe('Number of messages to return'),
      },
      async execute(args) {
        try {
          const messages = await getSessionMessages(opencodeClient, args.sessionId);
          const limitedMessages = messages.slice(-args.limit);

          return formatMessagesList(limitedMessages, args.sessionId);
        } catch (error) {
          throw new Error(
            `Failed to list messages: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),

    'get-message': tool({
      description: 'Get a specific message from a session',
      args: {
        sessionId: tool.schema.string().describe('Session ID'),
        messageId: tool.schema.string().describe('Message ID'),
      },
      async execute(args) {
        try {
          const result = await opencodeClient.session.message({
            path: { id: args.sessionId, messageID: args.messageId },
          });

          let output = `# Message Details\n\n`;
          output += `**Session ID:** ${args.sessionId}\n`;
          output += `**Message ID:** ${args.messageId}\n\n`;

          if (result.data) {
            output += `\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n`;
          } else {
            output += `No message data found.\n`;
          }

          return output;
        } catch (error) {
          throw new Error(
            `Failed to get message: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      },
    }),
  };
}

export function createMessageMutationTools(
  opencodeClient: OpencodeClient,
): Record<string, ReturnType<typeof tool>> {
  return {
    'send-prompt': tool({
      description: 'Send a prompt/message to a session',
      args: {
        sessionId: tool.schema.string().describe('Session ID'),
        content: tool.schema.string().describe('Message content'),
      },
      async execute(args) {
        try {
          const result = await opencodeClient.session.prompt({
            path: { id: args.sessionId },
            body: {
              parts: [
                {
                  type: 'text' as const,
                  text: args.content,
                },
              ],
            },
          });

          let output = `# Message Sent\n\n`;
          output += `**Session ID:** ${args.sessionId}\n`;
          output += `**Content:** ${args.content}\n\n`;

          if (result.data) {
            output += `**Response:**\n`;
            output += `\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n`;
          } else {
            output += `Message sent successfully.\n`;
          }

          return output;
        } catch (error) {
          return `Failed to send prompt: ${error instanceof Error ? error.message : String(error)}`;
        }
      },
    }),
  };
}
