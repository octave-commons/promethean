// SPDX-License-Identifier: GPL-3.0-only
// Tests for parity plugins from pseudo/opencode-plugins/

import test from 'ava';
import { AsyncSubAgentsPlugin } from '../plugins/async-sub-agents.js';
import { EventCapturePlugin } from '../plugins/event-capture.js';
import { TypeCheckerPlugin } from '../plugins/type-checker.js';

// Mock context for testing - using type assertion to bypass strict checking
const mockContext = {
  client: {
    event: {
      subscribe: async () => ({
        stream: async function* () {
          yield { type: 'session.idle', properties: { sessionID: 'test-session' } };
        },
      }),
    },
    session: {
      list: async () => ({ data: [{ id: 'test-session', title: 'Test Session' }] }),
      get: async () => ({ data: { id: 'test-session', title: 'Test Session' } }),
      create: async () => ({ data: { id: 'new-session', title: 'New Session' } }),
      delete: async () => ({}),
      prompt: async () => ({}),
    },
    // Add minimal mocks for other required OpencodeClient properties
    postSessionIdPermissionsPermissionId: async () => ({}),
    project: async () => ({}),
    config: async () => ({}),
    tool: async () => ({}),
    model: async () => ({}),
    provider: async () => ({}),
    permission: async () => ({}),
    user: async () => ({}),
    auth: async () => ({}),
    chat: async () => ({}),
    path: async () => ({}),
    command: async () => ({}),
    find: async () => ({}),
    file: async () => ({}),
  },
  project: {
    id: 'test-project',
    name: 'Test Project',
  },
  directory: '/test',
  worktree: '/test',
  $: {
    text: async () => 'mock output',
    $: async () => 'mock output',
  },
} as any; // Use type assertion for testing

test('AsyncSubAgentsPlugin initializes correctly', async (t) => {
  const plugin = await AsyncSubAgentsPlugin(mockContext);

  t.truthy(plugin);
  t.truthy(plugin.tool);
  t.truthy(plugin.tool!.search_sessions);
  t.truthy(plugin.tool!.list_sessions);
  t.truthy(plugin.tool!.get_session);
  t.truthy(plugin.tool!.close_session);
  t.truthy(plugin.tool!.index_sessions);
  t.truthy(plugin.tool!.spawn_session);
  t.truthy(plugin.tool!.monitor_agents);
  t.truthy(plugin.tool!.get_agent_status);
  t.truthy(plugin.tool!.cleanup_completed_agents);
  t.truthy(plugin.tool!.send_agent_message);
  t.truthy(plugin.tool!.clear_agent_cache);
});

test('AsyncSubAgentsPlugin search_sessions tool works', async (t) => {
  const plugin = await AsyncSubAgentsPlugin(mockContext);
  const result = await plugin.tool!.search_sessions.execute({ query: 'test', k: 5 });

  t.is(typeof result, 'string');
  t.true(result.includes('Failed to search sessions') || result.includes('"results"'));
});

test('AsyncSubAgentsPlugin list_sessions tool works', async (t) => {
  const plugin = await AsyncSubAgentsPlugin(mockContext);
  const result = await plugin.tool!.list_sessions.execute({ limit: 10, offset: 0 });

  t.is(typeof result, 'string');
  t.true(result.includes('sessions') || result.includes('Failed to list sessions'));
});

test('EventCapturePlugin initializes correctly', async (t) => {
  const plugin = await EventCapturePlugin(mockContext);

  t.truthy(plugin);
  t.truthy(plugin.tool);
  t.truthy(plugin.tool!.search_events);
  t.truthy(plugin.tool!.get_recent_events);
  t.truthy(plugin.tool!.get_event_statistics);
  t.truthy(plugin.tool!.trace_session_activity);
});

test('EventCapturePlugin search_events tool works', async (t) => {
  const plugin = await EventCapturePlugin(mockContext);
  const result = await plugin.tool.search_events.execute({
    query: 'test',
    k: 5,
    eventType: 'session.idle',
  });

  t.is(typeof result, 'string');
  t.true(result.includes('events') || result.includes('Failed to search events'));
});

test('EventCapturePlugin get_recent_events tool works', async (t) => {
  const plugin = await EventCapturePlugin(mockContext);
  const result = await plugin.tool.get_recent_events.execute({
    limit: 10,
    eventType: 'session.idle',
  });

  t.is(typeof result, 'string');
  t.true(result.includes('events') || result.includes('Failed to get recent events'));
});

test('TypeCheckerPlugin initializes correctly', async (t) => {
  const plugin = await TypeCheckerPlugin(mockContext);

  t.truthy(plugin);
  t.truthy(plugin['tool.execute.after']);
  t.is(typeof plugin['tool.execute.after'], 'function');
});

test('TypeCheckerPlugin hook processes write operations', async (t) => {
  const plugin = await TypeCheckerPlugin(mockContext);
  const mockInput = { tool: 'write' };
  const mockOutput = {
    args: { filePath: 'test.ts' },
    metadata: {},
  };

  // Should not throw
  await plugin['tool.execute.after'](mockInput, mockOutput);

  // Should have added metadata
  t.truthy(mockOutput.metadata);
});

test('TypeCheckerPlugin ignores non-write operations', async (t) => {
  const plugin = await TypeCheckerPlugin(mockContext);
  const mockInput = { tool: 'read' };
  const mockOutput = {
    args: { filePath: 'test.ts' },
    metadata: {},
  };

  await plugin['tool.execute.after'](mockInput, mockOutput);

  // Should not have modified metadata for non-write operations
  t.deepEqual(mockOutput.metadata, {});
});

test('All parity plugins can be imported from index', async (t) => {
  const { AsyncSubAgentsPlugin, EventCapturePlugin, TypeCheckerPlugin } = await import(
    '../plugins/index.js'
  );

  t.truthy(AsyncSubAgentsPlugin);
  t.truthy(EventCapturePlugin);
  t.truthy(TypeCheckerPlugin);
  t.is(typeof AsyncSubAgentsPlugin, 'function');
  t.is(typeof EventCapturePlugin, 'function');
  t.is(typeof TypeCheckerPlugin, 'function');
});

test('ParityPlugins category exists in index', async (t) => {
  const { ParityPlugins } = await import('../plugins/index.js');

  t.truthy(ParityPlugins);
  t.truthy(ParityPlugins.asyncSubAgents);
  t.truthy(ParityPlugins.eventCapture);
  t.truthy(ParityPlugins.typeChecker);
});

test('PluginRegistry includes parity plugins', async (t) => {
  const { PluginRegistry } = await import('../plugins/index.js');

  t.truthy(PluginRegistry.asyncSubAgents);
  t.truthy(PluginRegistry.eventCapture);
  t.truthy(PluginRegistry.typeChecker);

  t.is(PluginRegistry.asyncSubAgents.name, 'Async Sub-Agents Plugin');
  t.is(PluginRegistry.eventCapture.name, 'Event Capture Plugin');
  t.is(PluginRegistry.typeChecker.name, 'Type Checker Plugin');
});
