// SPDX-License-Identifier: GPL-3.0-only

import test from 'ava';
import { OpencodeInterfacePlugin } from '../index.js';

// Mock the dependencies before importing the plugin
import {
  mockInitializeStores,
  mockCompileContext,
  mockSearchAcrossStores,
} from './test-helpers.js';

// Mock the store initialization
import { initializeStores } from '../initializeStores.js';
import { compileContext } from '../compileContext.js';
import { searchAcrossStores } from '../services/unified-store.js';

// Replace the real functions with mocks
const originalInitializeStores = initializeStores;
const originalCompileContext = compileContext;
const originalSearchAcrossStores = searchAcrossStores;

// Mock the functions globally
(global as any).initializeStores = mockInitializeStores;
(global as any).compileContext = mockCompileContext;
(global as any).searchAcrossStores = mockSearchAcrossStores;

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

test('plugin exports tools', async (t) => {
  const plugin = await OpencodeInterfacePlugin(mockPluginContext);

  t.truthy(plugin);
  t.truthy(plugin.tool);

  // Check that all expected tools are present
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

  expectedTools.forEach((toolName) => {
    t.truthy(plugin.tool![toolName], `Tool ${toolName} should be present`);
  });
});

test('compile-context tool has correct structure', async (t) => {
  const plugin = await OpencodeInterfacePlugin(mockPluginContext);
  const compileContextTool = plugin.tool!['compile-context'];

  t.is(typeof compileContextTool.description, 'string');
  t.truthy(compileContextTool.args);
  t.is(typeof compileContextTool.execute, 'function');
});

test('search-context tool has correct structure', async (t) => {
  const plugin = await OpencodeInterfacePlugin(mockPluginContext);
  const searchContextTool = plugin.tool!['search-context'];

  t.is(typeof searchContextTool.description, 'string');
  t.truthy(searchContextTool.args);
  t.is(typeof searchContextTool.execute, 'function');
});

test('list-sessions tool has correct structure', async (t) => {
  const plugin = await OpencodeInterfacePlugin(mockPluginContext);
  const listSessionsTool = plugin.tool!['list-sessions'];

  t.is(typeof listSessionsTool.description, 'string');
  t.truthy(listSessionsTool.args);
  t.is(typeof listSessionsTool.execute, 'function');
});

test('tools handle invalid input gracefully', async (t) => {
  const plugin = await OpencodeInterfacePlugin(mockPluginContext);
  const compileContextTool = plugin.tool!['compile-context'];

  // Test with invalid limit
  await t.throwsAsync(compileContextTool.execute({ limit: -1 } as any, {} as any), {
    message: /Limit must be greater than 0/,
  });

  // Test with invalid session ID
  const getSessionTool = plugin.tool!['get-session'];
  await t.throwsAsync(getSessionTool.execute({ sessionId: '' } as any, {} as any), {
    message: /Session ID cannot be empty/,
  });
});
