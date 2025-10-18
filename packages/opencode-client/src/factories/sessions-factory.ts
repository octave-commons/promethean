// SPDX-License-Identifier: GPL-3.0-only
// Factory functions for session tools

import { tool } from '@opencode-ai/plugin/tool';
import { listSessions, create, close, get, search } from '../actions/index.js';

// Factory for listSessions tool
export function createListSessionsTool(): any {
  return tool({
    description: 'List all sessions with pagination and enhanced information',
    args: {
      limit: tool.schema.number().default(20).describe('Maximum number of sessions to return'),
      offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
    },
    async execute(args, context) {
      const { limit, offset } = args;
      // Note: client needs to be passed from the calling context
      // This is a placeholder - actual client injection depends on the system architecture
      const client = (context as any).client;

      const result = await listSessions({ limit, offset, client });
      return result;
    },
  });
}

// Factory for createSession tool
export function createCreateSessionTool(): any {
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
    async execute(args, context) {
      const { title, files, delegates } = args;
      const client = (context as any).client;

      const result = await create({ title, files, delegates, client });
      return result;
    },
  });
}

// Factory for closeSession tool
export function createCloseSessionTool(): any {
  return tool({
    description: 'Close a session',
    args: {
      sessionId: tool.schema.string().describe('ID of the session to close'),
    },
    async execute(args, context) {
      const { sessionId } = args;
      const client = (context as any).client;

      const result = await close({ sessionId, client });
      return result;
    },
  });
}

// Factory for getSession tool
export function createGetSessionTool(): any {
  return tool({
    description: 'Get detailed information about a specific session',
    args: {
      sessionId: tool.schema.string().describe('ID of the session to retrieve'),
      limit: tool.schema.number().optional().describe('Limit number of messages to return'),
      offset: tool.schema.number().optional().describe('Offset for messages pagination'),
    },
    async execute(args, context) {
      const { sessionId, limit, offset } = args;
      const client = (context as any).client;

      const result = await get({ sessionId, limit, offset, client });
      return result;
    },
  });
}

// Factory for searchSessions tool
export function createSearchSessionsTool(): any {
  return tool({
    description: 'Search sessions by query',
    args: {
      query: tool.schema.string().describe('Search query'),
      k: tool.schema.number().optional().describe('Maximum number of results to return'),
      sessionId: tool.schema.string().optional().describe('Specific session ID to search within'),
    },
    async execute(args, context) {
      const { query, k, sessionId } = args;
      const client = (context as any).client;

      const result = await search({ query, k, sessionId, client });
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
