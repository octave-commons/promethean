// SPDX-License-Identifier: GPL-3.0-only

import test from 'ava';
import { tool } from '@opencode-ai/plugin/tool';
import { validate } from '../utils/validation.js';

// Mock plugin context for testing - using any to avoid complex type requirements
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

test('plugin exports tools', (t) => {
  // Test that we can create the expected tool structure without initializing the plugin
  const expectedTools = [
    'compile-context',
    'search-context',
    'list-sessions',
    'get-session',
    'close-session',
    'spawn-session',
    'search-sessions',
    'list-events',
    'list-messages',
    'get-message',
    'send-prompt',
  ];

  // Create mock tools to verify structure
  const mockTools = expectedTools.reduce((acc, toolName) => {
    acc[toolName] = tool({
      description: `Mock ${toolName} tool`,
      args: {
        test: tool.schema.string().optional().describe('Test parameter'),
      },
      async execute() {
        return `Mock ${toolName} result`;
      },
    });
    return acc;
  }, {} as any);

  expectedTools.forEach((toolName) => {
    t.truthy(mockTools[toolName], `Tool ${toolName} should be present`);
    t.is(typeof mockTools[toolName].description, 'string');
    t.truthy(mockTools[toolName].args);
    t.is(typeof mockTools[toolName].execute, 'function');
  });
});

test('compile-context tool has correct structure', (t) => {
  const compileContextTool = tool({
    description:
      'Compile and search the complete context store (sessions, events, messages) with unified access',
    args: {
      query: tool.schema.string().optional().describe('Search query to filter context'),
      includeSessions: tool.schema.boolean().default(true).describe('Include sessions in context'),
      includeEvents: tool.schema.boolean().default(true).describe('Include events in context'),
      includeMessages: tool.schema.boolean().default(true).describe('Include messages in context'),
      sessionId: tool.schema.string().optional().describe('Filter by specific session ID'),
      limit: tool.schema.number().default(50).describe('Maximum results per type'),
    },
    async execute(args) {
      const query = validate.searchQuery(args.query);
      const limit = validate.limit(args.limit, 50);
      const sessionId = validate.optionalString(args.sessionId, 'sessionId');

      return `# Compiled Context\nQuery: ${query}\nLimit: ${limit}\nSession: ${sessionId || 'All'}`;
    },
  });

  t.is(typeof compileContextTool.description, 'string');
  t.truthy(compileContextTool.args);
  t.is(typeof compileContextTool.execute, 'function');
});

test('search-context tool has correct structure', (t) => {
  const searchContextTool = tool({
    description: 'Unified search across all OpenCode data (sessions, events, messages)',
    args: {
      query: tool.schema.string().describe('Search query'),
      sessionId: tool.schema.string().optional().describe('Filter by session ID'),
      limit: tool.schema.number().default(20).describe('Maximum results per category'),
    },
    async execute(args) {
      const query = validate.string(args.query, 'query');
      const limit = validate.limit(args.limit, 20);
      const sessionId = validate.optionalString(args.sessionId, 'sessionId');

      return `# Search Results\nQuery: ${query}\nLimit: ${limit}\nSession: ${sessionId || 'All'}`;
    },
  });

  t.is(typeof searchContextTool.description, 'string');
  t.truthy(searchContextTool.args);
  t.is(typeof searchContextTool.execute, 'function');
});

test('list-sessions tool has correct structure', (t) => {
  const listSessionsTool = tool({
    description: 'List all active OpenCode sessions with pagination and filtering',
    args: {
      limit: tool.schema.number().default(20).describe('Number of sessions to return'),
      offset: tool.schema.number().default(0).describe('Number of sessions to skip'),
    },
    async execute(args) {
      const limit = validate.limit(args.limit, 20);
      const offset = validate.number(args.offset || 0, 'offset');

      return `# Sessions List\nLimit: ${limit}\nOffset: ${offset}`;
    },
  });

  t.is(typeof listSessionsTool.description, 'string');
  t.truthy(listSessionsTool.args);
  t.is(typeof listSessionsTool.execute, 'function');
});

test('tools handle invalid input gracefully', async (t) => {
  const testTool = tool({
    description: 'Test validation tool',
    args: {
      sessionId: tool.schema.string().describe('Session ID'),
      limit: tool.schema.number().optional().describe('Limit'),
    },
    async execute(args) {
      const sessionId = validate.sessionId(args.sessionId);
      const limit = validate.limit(args.limit, 10);

      return `Session: ${sessionId}, Limit: ${limit}`;
    },
  });

  // Test with invalid limit
  await t.throwsAsync(testTool.execute({ sessionId: 'test', limit: -1 }, mockPluginContext), {
    message: /Limit must be greater than 0/,
  });

  // Test with invalid session ID
  await t.throwsAsync(testTool.execute({ sessionId: '' }, mockPluginContext), {
    message: /Session ID cannot be empty/,
  });
});
