// SPDX-License-Identifier: GPL-3.0-only
// Basic tests for the OpenCode Interface Plugin

import test from 'ava';

test('can import plugin', async (t) => {
  const { OpencodeInterfacePlugin } = await import('./index.js');
  t.truthy(OpencodeInterfacePlugin, 'Plugin should be importable');
  t.is(typeof OpencodeInterfacePlugin, 'function', 'Plugin should be a function');
});

test('can initialize plugin', async (t) => {
  const { OpencodeInterfacePlugin } = await import('./index.js');

  // Initialize the plugin with minimal mock context
  const mockContext = {
    client: {} as any,
    project: { name: 'test' } as any,
    directory: '/tmp' as any,
    worktree: {} as any,
    $: {} as any,
  };

  const plugin = await OpencodeInterfacePlugin(mockContext);
  t.truthy(plugin, 'Plugin should initialize');
  t.truthy(plugin.tool, 'Plugin should have tools');
  t.is(typeof plugin.tool, 'object', 'Tools should be an object');

  // Check that we have the expected tools
  const expectedTools = [
    'list-sessions',
    'get-session',
    'create-session',
    'close-session',
    'spawn-session',
    'search-sessions',
    'list-events',
    'subscribe-events',
    'list-messages',
    'get-message',
    'send-prompt',
    'start-indexer',
    'stop-indexer',
    'indexer-status',
  ];

  expectedTools.forEach((toolName) => {
    t.truthy(plugin.tool![toolName], `Should have ${toolName} tool`);
    t.is(
      typeof plugin.tool![toolName].execute,
      'function',
      `${toolName} should have execute function`,
    );
    t.is(
      typeof plugin.tool![toolName].description,
      'string',
      `${toolName} should have description`,
    );
  });
});
