/**
 * Simple test to verify authorization functionality
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

import {
  createAuthorizedToolFactory,
  getCurrentAuthConfig,
  isStrictModeEnabled,
  isAuthRequiredForDangerous,
  validateAdminIp,
  getAuthorizationHealth,
} from '../core/authorization.js';

// Mock tool factory for testing
const createMockTool = (name: string) => () => ({
  spec: {
    name,
    description: `Mock tool ${name}`,
  },
  invoke: async (args: unknown) => ({ tool: name, args, success: true }),
});

// Mock tool context
const createMockContext = (env: Record<string, string> = {}) => ({
  env: {
    ...env,
    MCP_ROOT_PATH: '/tmp/test',
  },
  fetch: global.fetch.bind(global),
  now: () => new Date(),
});

describe('Authorization Core Functionality', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.MCP_STRICT_MODE;
    delete process.env.MCP_REQUIRE_AUTH_DANGEROUS;
    delete process.env.MCP_ADMIN_IP_WHITELIST;
    delete process.env.MCP_ENABLE_AUDIT;
  });

  it('should provide current auth config', () => {
    const config = getCurrentAuthConfig();

    assert(typeof config.strictMode === 'boolean', 'Should include strictMode');
    assert(
      typeof config.requireAuthForDangerous === 'boolean',
      'Should include requireAuthForDangerous',
    );
    assert(Array.isArray(config.adminIpWhitelist), 'Should include adminIpWhitelist');
    assert(typeof config.enableAuditLog === 'boolean', 'Should include enableAuditLog');
  });

  it('should report authorization health', () => {
    const health = getAuthorizationHealth();

    assert(typeof health.strictMode === 'boolean', 'Should report strict mode');
    assert(
      typeof health.requireAuthForDangerous === 'boolean',
      'Should report require auth dangerous',
    );
    assert(typeof health.adminIpWhitelistSize === 'number', 'Should report whitelist size');
    assert(typeof health.auditLogEnabled === 'boolean', 'Should report audit log enabled');
    assert(typeof health.configuredTools === 'number', 'Should report configured tools');
    assert(typeof health.dangerousTools === 'number', 'Should report dangerous tools');
  });

  it('should validate admin IP correctly', () => {
    process.env.MCP_ADMIN_IP_WHITELIST = '192.168.1.100,127.0.0.1';

    const validResult = validateAdminIp('192.168.1.100');
    assert(validResult.valid === true, 'Should validate whitelisted IP');

    const invalidResult = validateAdminIp('192.168.1.200');
    assert(invalidResult.valid === false, 'Should reject non-whitelisted IP');
    assert(invalidResult.reason, 'Should provide reason for rejection');

    const noIpResult = validateAdminIp();
    assert(noIpResult.valid === false, 'Should reject missing IP');
  });

  it('should enforce strict mode for unknown tools', async () => {
    process.env.MCP_STRICT_MODE = 'true';

    const context = createMockContext({
      MCP_USER_ID: 'test-user',
      MCP_USER_ROLE: 'user',
    });

    const toolFactory = createAuthorizedToolFactory(createMockTool('unknown_tool'), 'unknown_tool');

    const tool = toolFactory(context);

    try {
      await tool.invoke({ test: 'data' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(
        error.message.includes('not found in authorization configuration'),
        'Should deny unknown tools in strict mode',
      );
    }
  });

  it('should allow known tools in strict mode', async () => {
    process.env.MCP_STRICT_MODE = 'true';

    const context = createMockContext({
      MCP_USER_ID: 'test-user',
      MCP_USER_ROLE: 'user',
    });

    const toolFactory = createAuthorizedToolFactory(
      createMockTool('files_view_file'),
      'files_view_file',
    );

    const tool = toolFactory(context);
    const result = await tool.invoke({ test: 'data' });

    assert(result.success, 'Should allow known tools in strict mode');
  });

  it('should require auth for dangerous operations', async () => {
    process.env.MCP_REQUIRE_AUTH_DANGEROUS = 'true';

    const context = createMockContext({
      MCP_USER_ID: 'anonymous',
      MCP_USER_ROLE: 'guest',
    });

    const toolFactory = createAuthorizedToolFactory(
      createMockTool('files_write_content'),
      'files_write_content',
    );

    const tool = toolFactory(context);

    try {
      await tool.invoke({ test: 'data' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(
        error.message.includes('Authentication required for dangerous operation'),
        'Should require auth for dangerous operations',
      );
    }
  });

  it('should allow authenticated users for dangerous operations', async () => {
    process.env.MCP_REQUIRE_AUTH_DANGEROUS = 'true';

    const context = createMockContext({
      MCP_USER_ID: 'authenticated-user',
      MCP_USER_ROLE: 'user',
    });

    const toolFactory = createAuthorizedToolFactory(
      createMockTool('kanban_update_status'),
      'kanban_update_status',
    );

    const tool = toolFactory(context);
    const result = await tool.invoke({ test: 'data' });

    assert(result.success, 'Should allow authenticated users');
  });

  it('should enforce admin IP whitelist', async () => {
    process.env.MCP_ADMIN_IP_WHITELIST = '192.168.1.100';

    const context = createMockContext({
      MCP_USER_ID: 'admin-user',
      MCP_USER_ROLE: 'admin',
      REMOTE_ADDR: '192.168.1.200', // Not whitelisted
    });

    const toolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');
    const tool = toolFactory(context);

    try {
      await tool.invoke({ test: 'data' });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('Admin access denied from IP'), 'Should enforce IP whitelist');
    }
  });

  it('should allow admin from whitelisted IP', async () => {
    process.env.MCP_ADMIN_IP_WHITELIST = '192.168.1.100';

    const context = createMockContext({
      MCP_USER_ID: 'admin-user',
      MCP_USER_ROLE: 'admin',
      REMOTE_ADDR: '192.168.1.100', // Whitelisted
    });

    const toolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');
    const tool = toolFactory(context);
    const result = await tool.invoke({ test: 'data' });

    assert(result.success, 'Should allow admin from whitelisted IP');
  });
});
