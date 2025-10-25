// SPDX-License-Identifier: GPL-3.0-only
// Message serializer - Handles serialization of message-related data

import type { Serializer, SerializationOptions } from './types.js';
import { createSerializer } from './types.js';

export type MessageData = {
  readonly id: string;
  readonly sessionId: string;
  readonly role: string;
  readonly content?: string;
  readonly timestamp?: string | number;
  readonly parts?: Array<{
    readonly type: string;
    readonly text?: string;
    readonly [key: string]: unknown;
  }>;
  readonly metadata?: Record<string, unknown>;
};

export type MessageListResult = {
  readonly messages: MessageData[];
  readonly totalCount?: number;
  readonly sessionId: string;
};

function messageToMarkdown(message: MessageData): string {
  let output = `## Message: ${message.id}\n\n`;
  output += `**ID:** ${message.id}\n`;
  output += `**Session ID:** ${message.sessionId}\n`;
  output += `**Role:** ${message.role}\n`;

  if (message.timestamp) {
    output += `**Timestamp:** ${message.timestamp}\n`;
  }

  if (message.content) {
    output += `**Content:**\n${message.content}\n\n`;
  }

  if (message.parts && message.parts.length > 0) {
    output += `**Parts:**\n`;
    message.parts.forEach((part, index) => {
      output += `${index + 1}. **Type:** ${part.type}\n`;
      if (part.text) {
        output += `   **Text:** ${part.text}\n`;
      }
    });
    output += '\n';
  }

  if (message.metadata && Object.keys(message.metadata).length > 0) {
    output += `**Metadata:**\n`;
    output += `\`\`\`json\n${JSON.stringify(message.metadata, null, 2)}\n\`\`\`\n`;
  }

  output += '\n';
  return output;
}

function messageListToMarkdown(result: MessageListResult): string {
  let output = `# Messages for Session ${result.sessionId} (${result.messages.length})\n\n`;

  result.messages.forEach((message) => {
    output += messageToMarkdown(message);
  });

  if (result.totalCount) {
    output += `**Total:** ${result.totalCount} messages\n`;
  }

  return output;
}

export const messageSerializer = createSerializer<MessageData, string>((message) =>
  messageToMarkdown(message),
);

export const messageListSerializer = createSerializer<MessageListResult, string>((result) =>
  messageListToMarkdown(result),
);
