// SPDX-License-Identifier: GPL-3.0-only
// Session serializer - Handles serialization of session-related data

import { createSerializer } from './types.js';

export type SessionData = {
  readonly id: string;
  readonly title?: string;
  readonly createdAt?: string | number;
  readonly updatedAt?: string | number;
  readonly status?: string;
  readonly metadata?: Record<string, unknown>;
};

export type SessionListResult = {
  readonly sessions: SessionData[];
  readonly totalCount?: number;
  readonly pagination?: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly limit: number;
    readonly offset: number;
  };
  readonly summary?: {
    readonly active: number;
    readonly waiting_for_input: number;
    readonly idle: number;
    readonly agentTasks: number;
  };
};

export type SessionActionResult = {
  readonly success: boolean;
  readonly session?: SessionData;
  readonly error?: string;
  readonly message?: string;
};

function sessionToMarkdown(session: SessionData): string {
  let output = `## Session: ${session.title || session.id}\n\n`;
  output += `**ID:** ${session.id}\n`;

  if (session.title) {
    output += `**Title:** ${session.title}\n`;
  }

  if (session.createdAt) {
    output += `**Created:** ${session.createdAt}\n`;
  }

  if (session.updatedAt) {
    output += `**Updated:** ${session.updatedAt}\n`;
  }

  if (session.status) {
    output += `**Status:** ${session.status}\n`;
  }

  if (session.metadata && Object.keys(session.metadata).length > 0) {
    output += `**Metadata:**\n`;
    output += `\`\`\`json\n${JSON.stringify(session.metadata, null, 2)}\n\`\`\`\n`;
  }

  output += '\n';
  return output;
}

function sessionListToMarkdown(result: SessionListResult): string {
  let output = `# Sessions (${result.sessions.length})\n\n`;

  if (result.summary) {
    output += `## Summary\n`;
    output += `- **Active:** ${result.summary.active}\n`;
    output += `- **Waiting for Input:** ${result.summary.waiting_for_input}\n`;
    output += `- **Idle:** ${result.summary.idle}\n`;
    output += `- **Agent Tasks:** ${result.summary.agentTasks}\n\n`;
  }

  result.sessions.forEach((session) => {
    output += sessionToMarkdown(session);
  });

  if (result.pagination) {
    output += `## Pagination\n`;
    output += `- **Page:** ${result.pagination.currentPage} / ${result.pagination.totalPages}\n`;
    output += `- **Total:** ${result.totalCount || result.sessions.length} sessions\n`;
    output += `- **Showing:** ${result.pagination.limit} per page\n\n`;
  }

  return output;
}

function sessionActionToMarkdown(result: SessionActionResult): string {
  let output = `# Session Action Result\n\n`;
  output += `**Success:** ${result.success}\n\n`;

  if (result.error) {
    output += `**Error:** ${result.error}\n\n`;
  }

  if (result.message) {
    output += `**Message:** ${result.message}\n\n`;
  }

  if (result.session) {
    output += `## Session Details\n\n`;
    output += sessionToMarkdown(result.session);
  }

  return output;
}

export const sessionSerializer = createSerializer<SessionData, string>((session) =>
  sessionToMarkdown(session),
);

export const sessionListSerializer = createSerializer<SessionListResult, string>((result) =>
  sessionListToMarkdown(result),
);

export const sessionActionSerializer = createSerializer<SessionActionResult, string>((result) =>
  sessionActionToMarkdown(result),
);
