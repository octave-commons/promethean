// SPDX-License-Identifier: GPL-3.0-only

import test from 'ava';
import { tool } from '@opencode-ai/plugin/tool';
import { validate } from '../utils/validation.js';

// Mock the dependencies
const mockPluginContext: any = {
  client: {
    session: {
      create: async () => ({ data: { id: 'test-session', title: 'Test Session' } }),
      messages: async () => ({ data: [] }),
      message: async () => ({ data: { id: 'msg-1', role: 'user', content: 'test' } }),
      prompt: async () => ({ data: { id: 'msg-2', role: 'assistant', content: 'response' } }),
    },
  },
  project: {
    name: 'test-project',
    description: 'Test project',
  },
  directory: '/tmp/test',
  worktree: '/tmp/test',
  $: {
    run: async () => ({ stdout: 'test output' }),
  },
};

// Mock action functions
const mockListSessions = async () => ({ sessions: [], summary: {}, pagination: {} });
const mockGetSession = async () => ({ session: { id: 'test' }, messages: [] });
const mockCloseSession = async () => ({ success: true });
const mockSpawnSession = async () => ({ id: 'new-session', title: 'New Session' });
const mockSearchSessions = async () => [];
const mockListEvents = async () => [];
const mockGetSessionMessages = async () => [];

// Mock formatter functions
const mockSessionToMarkdown = (session: any) => `## Session: ${session.id}\n`;
const mockMessageToMarkdown = (message: any) => `**Message:** ${message.content}\n`;
const mockEventToMarkdown = (event: any) => `**Event:** ${event.type}\n`;

test('plugin tools can be created without store initialization', async (t) => {
  // Test that we can create tools without initializing stores
  const tools = {
    'compile-context': tool({
      description: 'Test compile context tool',
      args: {
        query: tool.schema.string().optional().describe('Search query'),
        limit: tool.schema.number().default(50).describe('Maximum results'),
      },
      async execute(args) {
        const query = validate.searchQuery(args.query);
        const limit = validate.limit(args.limit, 50);

        return `# Compiled Context\nQuery: ${query}\nLimit: ${limit}`;
      },
    }),

    'search-context': tool({
      description: 'Test search context tool',
      args: {
        query: tool.schema.string().describe('Search query'),
        limit: tool.schema.number().default(20).describe('Maximum results'),
      },
      async execute(args) {
        const query = validate.string(args.query, 'query');
        const limit = validate.limit(args.limit, 20);

        return `# Search Results\nQuery: ${query}\nLimit: ${limit}`;
      },
    }),

    'get-session': tool({
      description: 'Test get session tool',
      args: {
        sessionId: tool.schema.string().describe('Session ID'),
      },
      async execute(args) {
        const sessionId = validate.sessionId(args.sessionId);
        return `# Session Details\nSession ID: ${sessionId}`;
      },
    }),
  };

  t.truthy(tools['compile-context']);
  t.truthy(tools['search-context']);
  t.truthy(tools['get-session']);

  // Test tool execution
  const compileResult = await tools['compile-context'].execute(
    { query: 'test' },
    mockPluginContext,
  );
  t.true(compileResult.includes('test'));
  t.true(compileResult.includes('Compiled Context'));

  const searchResult = await tools['search-context'].execute({ query: 'test' }, mockPluginContext);
  t.true(searchResult.includes('test'));
  t.true(searchResult.includes('Search Results'));

  const sessionResult = await tools['get-session'].execute(
    { sessionId: 'session-123' },
    mockPluginContext,
  );
  t.true(sessionResult.includes('session-123'));
  t.true(sessionResult.includes('Session Details'));
});

test('validation works correctly in tool context', async (t) => {
  const testTool = tool({
    description: 'Test validation tool',
    args: {
      sessionId: tool.schema.string().describe('Session ID'),
      limit: tool.schema.number().optional().describe('Limit'),
    },
    async execute(args) {
      const sessionId = validate.sessionId(args.sessionId);
      const limit = validate.limit(args.limit, 10);

      return { sessionId, limit };
    },
  });

  // Test valid input
  const validResult = await testTool.execute(
    { sessionId: 'test-session', limit: 5 },
    mockPluginContext,
  );
  t.is(validResult.sessionId, 'test-session');
  t.is(validResult.limit, 5);

  // Test invalid session ID
  await t.throwsAsync(testTool.execute({ sessionId: '' }, mockPluginContext), {
    message: /Session ID cannot be empty/,
  });

  // Test invalid limit
  await t.throwsAsync(testTool.execute({ sessionId: 'test', limit: -1 }, mockPluginContext), {
    message: /Limit must be greater than 0/,
  });
});

test('tool structure is correct', async (t) => {
  const testTool = tool({
    description: 'Test tool for structure validation',
    args: {
      query: tool.schema.string().describe('Test query'),
    },
    async execute(args) {
      return `Result: ${args.query}`;
    },
  });

  t.is(typeof testTool.description, 'string');
  t.truthy(testTool.args);
  t.is(typeof testTool.execute, 'function');
  t.is(testTool.description, 'Test tool for structure validation');
});
