// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for session tools

import { tool } from '@opencode-ai/plugin/tool';
import { listSessions, create, close, get, search } from '../actions/index.js';

interface ListSessionsArgs {
  limit?: number;
  offset?: number;
}

interface CreateSessionArgs {
  title?: string;
  files?: string[];
  delegates?: string[];
}

interface CloseSessionArgs {
  sessionId: string;
}

interface GetSessionArgs {
  sessionId: string;
  limit?: number;
  offset?: number;
}

interface SearchSessionsArgs {
  query: string;
  k?: number;
  sessionId?: string;
}

// Factory for listSessions tool
export function createListSessionsTool() {
  return tool({
    description: 'List all sessions with pagination and enhanced information',
    args: {
      limit: tool.schema.number().default(20).describe('Maximum number of sessions to return'),
      offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
    },
    async execute(args: ListSessionsArgs): Promise<string> {
      const { limit = 20, offset = 0 } = args;
      const result = await listSessions({ limit, offset });
      return result;
    },
  });
}

// Factory for createSession tool
export function createCreateSessionTool() {
  return tool({
    description: 'Create a new session',
    args: {
      title: tool.schema.string().optional().describe('Session title'),
      files: tool.schema
        .array(tool.schema.string())
        .optional()
        .describe('Files to include in session'),
      delegates: tool.schema
        .array(tool.schema.string())
        .optional()
        .describe('Delegates for the session'),
    },
    async execute(args: CreateSessionArgs, context: any): Promise<string> {
      const { title } = args;
      const client = context.client;

      const result = await create({ title, client });
      return result;
    },
  });
}

// Factory for closeSession tool
export function createCloseSessionTool() {
  return tool({
    description: 'Close a session',
    args: {
      sessionId: tool.schema.string().describe('ID of the session to close'),
    },
    async execute(args: CloseSessionArgs): Promise<string> {
      const { sessionId } = args;
      const result = await close({ sessionId });
      return result;
    },
  });
}

// Factory for getSession tool
export function createGetSessionTool() {
  return tool({
    description: 'Get detailed information about a specific session',
    args: {
      sessionId: tool.schema.string().describe('ID of the session to retrieve'),
      limit: tool.schema.number().optional().describe('Limit number of messages to return'),
      offset: tool.schema.number().optional().describe('Offset for messages pagination'),
    },
    async execute(args: GetSessionArgs): Promise<string> {
      const { sessionId, limit, offset } = args;
      const result = await get({ sessionId, limit, offset });
      return result;
    },
  });
}

// Factory for searchSessions tool
export function createSearchSessionsTool() {
  return tool({
    description: 'Search sessions by query',
    args: {
      query: tool.schema.string().describe('Search query'),
      k: tool.schema.number().optional().describe('Maximum number of results to return'),
      sessionId: tool.schema.string().optional().describe('Specific session ID to search within'),
    },
    async execute(args: SearchSessionsArgs): Promise<string> {
      const { query, k, sessionId } = args;
      const result = await search({ query, k, sessionId });
      return result;
    },
  });
}

// Export all factory functions
export const sessionsToolFactories = {
  createListSessionsTool,
  createCreateSessionTool,
  createCloseSessionTool,
  createGetSessionTool,
  createSearchSessionsTool,
};
