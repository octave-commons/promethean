// SPDX-License-Identifier: GPL-3.0-only
// Search serializer - Handles serialization of search results

import { createSerializer } from './types.js';
import type { SessionData } from './session.js';
import type { EventData } from './event.js';
import type { MessageData } from './message.js';

export type SearchResult = {
  readonly sessions: SessionData[];
  readonly events: EventData[];
  readonly messages: MessageData[];
  readonly query: string;
  readonly summary: {
    readonly totalSessions: number;
    readonly totalEvents: number;
    readonly totalMessages: number;
  };
};

function searchResultToMarkdown(result: SearchResult): string {
  let output = `# Unified Search Results\n\n`;
  output += `**Query:** ${result.query}\n\n`;

  output += `## Summary\n`;
  output += `- **Sessions:** ${result.summary.totalSessions}\n`;
  output += `- **Events:** ${result.summary.totalEvents}\n`;
  output += `- **Messages:** ${result.summary.totalMessages}\n\n`;

  if (result.summary.totalSessions > 0) {
    output += `## Sessions (${result.summary.totalSessions})\n\n`;
    result.sessions.forEach((session) => {
      output += `### Session: ${session.title || session.id}\n`;
      output += `**ID:** ${session.id}\n`;
      if (session.title) output += `**Title:** ${session.title}\n`;
      if (session.createdAt) output += `**Created:** ${session.createdAt}\n`;
      output += '\n';
    });
  }

  if (result.summary.totalEvents > 0) {
    output += `## Events (${result.summary.totalEvents})\n\n`;
    result.events.forEach((event) => {
      output += `### Event: ${event.type}\n`;
      output += `**ID:** ${event.id}\n`;
      output += `**Type:** ${event.type}\n`;
      if (event.timestamp) output += `**Timestamp:** ${event.timestamp}\n`;
      if (event.sessionId) output += `**Session ID:** ${event.sessionId}\n`;
      output += '\n';
    });
  }

  if (result.summary.totalMessages > 0) {
    output += `## Messages (${result.summary.totalMessages})\n\n`;
    result.messages.forEach((message) => {
      output += `### Message: ${message.id}\n`;
      output += `**ID:** ${message.id}\n`;
      output += `**Role:** ${message.role}\n`;
      output += `**Session ID:** ${message.sessionId}\n`;
      if (message.content) {
        output += `**Content:** ${message.content.substring(0, 200)}...\n`;
      }
      output += '\n';
    });
  }

  return output;
}

export const searchResultSerializer = createSerializer<SearchResult, string>((result) =>
  searchResultToMarkdown(result),
);
