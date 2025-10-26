// SPDX-License-Identifier: GPL-3.0-only
// Message Management Tools

import { tool } from '@opencode-ai/plugin/tool';

// Import from opencode-client (peer dependency)
import { getSessionMessages } from '@promethean-os/opencode-client';

// Import markdown formatters
import { messageToMarkdown } from '@promethean-os/opencode-client';

/**
 * Format messages list as markdown
 */
function formatMessagesList(messages: any[], sessionId: string): string {
  let output = `# Messages for Session ${sessionId} (${messages.length})\n\n`;

  messages.forEach((message: any) => {
    try {
      output += messageToMarkdown(message);
    } catch (e) {
      output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
    }
  });

  return output;
}

/**
 * List messages tool
 */
export const list = tool({
  description: 'List messages for a specific session',
  args: {
    sessionId: tool.schema.string().describe('Session ID'),
    limit: tool.schema.number().default(10).describe('Number of messages to return'),
  },
  async execute(args: any) {
    try {
      const messages = await getSessionMessages(args.sessionId);
      const limitedMessages = messages.slice(-args.limit);

      return formatMessagesList(limitedMessages, args.sessionId);
    } catch (error) {
      throw new Error(
        `Failed to list messages: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

/**
 * Get message tool
 */
export const get = tool({
  description: 'Get a specific message from a session',
  args: {
    sessionId: tool.schema.string().describe('Session ID'),
    messageId: tool.schema.string().describe('Message ID'),
  },
  async execute(args: any) {
    try {
      // This will need to be implemented using the SDK
      const opencodeClient = args.client; // Will be provided by plugin
      const result = await opencodeClient.session.message({
        path: { id: args.sessionId, messageID: args.messageId },
      });

      let output = `# Message Details\n\n`;
      output += `**Session ID:** ${args.sessionId}\n`;
      output += `**Message ID:** ${args.messageId}\n\n`;

      if (result.data) {
        try {
          output += messageToMarkdown(result.data);
        } catch (e) {
          output += `**Message Data:**\n`;
          output += `\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n`;
        }
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
});

/**
 * Send prompt tool
 */
export const send = tool({
  description: 'Send a prompt/message to a session',
  args: {
    sessionId: tool.schema.string().describe('Session ID'),
    content: tool.schema.string().describe('Message content'),
  },
  async execute(args: any) {
    try {
      // This will need to be implemented using the SDK
      const opencodeClient = args.client; // Will be provided by plugin
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
});
