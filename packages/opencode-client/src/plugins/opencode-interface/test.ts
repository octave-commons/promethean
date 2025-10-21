// SPDX-License-Identifier: GPL-3.0-only
// Basic tests for the OpenCode Interface Plugin

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { OpencodeInterfacePlugin } from './index.js';

describe('OpenCode Interface Plugin', () => {
  let plugin: any;

  beforeEach(async () => {
    // Initialize the plugin with minimal mock context
    const mockContext = {
      client: {} as any,
      project: { name: 'test' } as any,
      directory: '/tmp' as any,
      worktree: {} as any,
      $: {} as any,
    };
    plugin = await OpencodeInterfacePlugin(mockContext);
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  it('should initialize successfully', () => {
    assert(plugin, 'Plugin should be defined');
    assert(plugin.tool, 'Plugin should have tools');
    assert(typeof plugin.tool === 'object', 'Tools should be an object');
  });

  it('should have all expected session tools', () => {
    const sessionTools = [
      'list-sessions',
      'get-session',
      'create-session',
      'close-session',
      'spawn-session',
      'search-sessions',
    ];

    sessionTools.forEach((toolName) => {
      assert(plugin.tool[toolName], `Should have ${toolName} tool`);
      assert(
        typeof plugin.tool[toolName].execute === 'function',
        `${toolName} should have execute function`,
      );
      assert(
        typeof plugin.tool[toolName].description === 'string',
        `${toolName} should have description`,
      );
      assert(typeof plugin.tool[toolName].args === 'object', `${toolName} should have args schema`);
    });
  });

  it('should have all expected event tools', () => {
    const eventTools = ['list-events', 'subscribe-events'];

    eventTools.forEach((toolName) => {
      assert(plugin.tool[toolName], `Should have ${toolName} tool`);
      assert(
        typeof plugin.tool[toolName].execute === 'function',
        `${toolName} should have execute function`,
      );
      assert(
        typeof plugin.tool[toolName].description === 'string',
        `${toolName} should have description`,
      );
      assert(typeof plugin.tool[toolName].args === 'object', `${toolName} should have args schema`);
    });
  });

  it('should have all expected message tools', () => {
    const messageTools = ['list-messages', 'get-message', 'send-prompt'];

    messageTools.forEach((toolName) => {
      assert(plugin.tool[toolName], `Should have ${toolName} tool`);
      assert(
        typeof plugin.tool[toolName].execute === 'function',
        `${toolName} should have execute function`,
      );
      assert(
        typeof plugin.tool[toolName].description === 'string',
        `${toolName} should have description`,
      );
      assert(typeof plugin.tool[toolName].args === 'object', `${toolName} should have args schema`);
    });
  });

  it('should have all expected indexer tools', () => {
    const indexerTools = ['start-indexer', 'stop-indexer', 'indexer-status'];

    indexerTools.forEach((toolName) => {
      assert(plugin.tool[toolName], `Should have ${toolName} tool`);
      assert(
        typeof plugin.tool[toolName].execute === 'function',
        `${toolName} should have execute function`,
      );
      assert(
        typeof plugin.tool[toolName].description === 'string',
        `${toolName} should have description`,
      );
      assert(typeof plugin.tool[toolName].args === 'object', `${toolName} should have args schema`);
    });
  });

  it('should have proper tool validation schemas', () => {
    // Test that tools have proper validation schemas
    const listSessionsTool = plugin.tool['list-sessions'];
    assert(listSessionsTool.args.limit, 'Should have limit argument');
    assert(listSessionsTool.args.offset, 'Should have offset argument');
    assert(listSessionsTool.args.format, 'Should have format argument');

    // Test enum validation
    const validFormats = listSessionsTool.args.format._def.values;
    assert(validFormats.includes('table'), 'Should support table format');
    assert(validFormats.includes('json'), 'Should support json format');
  });

  it('should have event hooks', () => {
    assert(typeof plugin.event === 'function', 'Should have event hook');
    assert(typeof plugin['tool.execute.before'] === 'function', 'Should have before hook');
    assert(typeof plugin['tool.execute.after'] === 'function', 'Should have after hook');
  });

  // Note: Full integration tests would require a running OpenCode server
  // These tests focus on plugin structure and validation
});

console.log('OpenCode Interface Plugin tests completed');
