// SPDX-License-Identifier: GPL-3.0-only
// Shared markdown formatters for Session Orchestrator tools

import {
  sessionToMarkdown,
  messageToMarkdown,
  eventToMarkdown,
} from '../services/indexer-formatters.js';

export interface SearchResultsSummary {
  totalSessions: number;
  totalEvents: number;
  totalMessages: number;
}

export interface SearchResultsPayload {
  sessions: any[];
  events: any[];
  messages: any[];
  query: string;
  summary: SearchResultsSummary;
}

export function formatSearchResults(results: SearchResultsPayload): string {
  let output = `# Unified Search Results\n\n`;
  output += `**Query:** ${results.query}\n\n`;

  output += `## Summary\n`;
  output += `- **Sessions:** ${results.summary.totalSessions}\n`;
  output += `- **Events:** ${results.summary.totalEvents}\n`;
  output += `- **Messages:** ${results.summary.totalMessages}\n\n`;

  if (results.summary.totalSessions > 0) {
    output += `## Sessions (${results.summary.totalSessions})\n\n`;
    results.sessions.forEach((session) => {
      try {
        output += sessionToMarkdown(session);
      } catch (error) {
        output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
      }
    });
  }

  if (results.summary.totalEvents > 0) {
    output += `## Events (${results.summary.totalEvents})\n\n`;
    results.events.forEach((event) => {
      try {
        output += eventToMarkdown(event);
      } catch (error) {
        output += `**Event:** ${JSON.stringify(event).substring(0, 200)}...\n\n`;
      }
    });
  }

  if (results.summary.totalMessages > 0) {
    output += `## Messages (${results.summary.totalMessages})\n\n`;
    results.messages.forEach((message) => {
      try {
        output += messageToMarkdown(message);
      } catch (error) {
        output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
      }
    });
  }

  return output;
}

export function formatSessionsList(result: any): string {
  if ('error' in result) {
    return `Error listing sessions: ${result.error}`;
  }

  const sessions = result.sessions || [];
  let output = `# Active Sessions (${sessions.length})\n\n`;

  sessions.forEach((session: any) => {
    try {
      output += sessionToMarkdown(session);
    } catch (error) {
      output += `**Session:** ${JSON.stringify(session).substring(0, 200)}...\n\n`;
    }
  });

  if (result.summary) {
    output += `## Summary\n`;
    output += `- **Active:** ${result.summary.active}\n`;
    output += `- **Waiting for Input:** ${result.summary.waiting_for_input}\n`;
    output += `- **Idle:** ${result.summary.idle}\n`;
    output += `- **Agent Tasks:** ${result.summary.agentTasks}\n\n`;
  }

  if (result.pagination) {
    output += `## Pagination\n`;
    output += `- **Page:** ${result.pagination.currentPage} / ${result.pagination.totalPages}\n`;
    output += `- **Total:** ${result.totalCount} sessions\n`;
    output += `- **Showing:** ${result.pagination.limit} per page\n`;
  }

  return output;
}

export function formatEventsList(events: any[]): string {
  let output = `# Events (${events.length})\n\n`;

  events.forEach((event) => {
    try {
      output += eventToMarkdown(event);
    } catch (error) {
      output += `**Event:** ${JSON.stringify(event).substring(0, 200)}...\n\n`;
    }
  });

  return output;
}

export function formatMessagesList(messages: any[], sessionId: string): string {
  let output = `# Messages for Session ${sessionId} (${messages.length})\n\n`;

  messages.forEach((message) => {
    try {
      output += messageToMarkdown(message);
    } catch (error) {
      output += `**Message:** ${JSON.stringify(message).substring(0, 200)}...\n\n`;
    }
  });

  return output;
}
