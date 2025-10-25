// SPDX-License-Identifier: GPL-3.0-only
// Event serializer - Handles serialization of event-related data

import type { Serializer, SerializationOptions } from './types.js';
import { createSerializer } from './types.js';

export type EventData = {
  readonly id: string;
  readonly type: string;
  readonly timestamp?: string | number;
  readonly sessionId?: string;
  readonly messageId?: string;
  readonly properties?: Record<string, unknown>;
  readonly text?: string;
};

export type EventListResult = {
  readonly events: EventData[];
  readonly totalCount?: number;
  readonly query?: string;
};

function eventToMarkdown(event: EventData): string {
  let output = `## Event: ${event.type}\n\n`;
  output += `**ID:** ${event.id}\n`;
  output += `**Type:** ${event.type}\n`;

  if (event.timestamp) {
    output += `**Timestamp:** ${event.timestamp}\n`;
  }

  if (event.sessionId) {
    output += `**Session ID:** ${event.sessionId}\n`;
  }

  if (event.messageId) {
    output += `**Message ID:** ${event.messageId}\n`;
  }

  if (event.text) {
    output += `**Text:** ${event.text}\n`;
  }

  if (event.properties && Object.keys(event.properties).length > 0) {
    output += `**Properties:**\n`;
    output += `\`\`\`json\n${JSON.stringify(event.properties, null, 2)}\n\`\`\`\n`;
  }

  output += '\n';
  return output;
}

function eventListToMarkdown(result: EventListResult): string {
  let output = `# Events (${result.events.length})\n\n`;

  if (result.query) {
    output += `**Query:** ${result.query}\n\n`;
  }

  result.events.forEach((event) => {
    output += eventToMarkdown(event);
  });

  if (result.totalCount) {
    output += `**Total:** ${result.totalCount} events\n`;
  }

  return output;
}

export const eventSerializer = createSerializer<EventData, string>((event) =>
  eventToMarkdown(event),
);

export const eventListSerializer = createSerializer<EventListResult, string>((result) =>
  eventListToMarkdown(result),
);
