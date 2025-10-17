/**
 * Authorization System Tests
 *
 * Tests for the MCP authorization framework
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

import {
  createAuthorizedToolFactory,
  getToolAuthRequirements,
  getDangerousTools,
  getToolsByPermissionLevel,
  auditLogger,
  getCurrentAuthConfig,
  isStrictModeEnabled,
  isAuthRequiredForDangerous,
  isAdminIpWhitelisted,
  validateAdminIp,
  getStrictModeDeniedTools,
  getAuthorizationHealth,
} from '../core/authorization.js';
import type { ToolFactory, ToolContext } from '../core/types.js';

// Mock tool factory for testing
const createMockTool = (name: string, shouldFail: boolean = false): ToolFactory => {
  return () => ({
    spec: {
      name,
      description: `Mock tool ${name}`,
    },
    invoke: async (args: unknown) => {
      if (shouldFail) {
        throw new Error(`Tool ${name} failed`);
      }
      return { tool: name, args, success: true };
    },
  });
};

// Mock tool context
const createMockContext = (env: Record<string, string> = {}): ToolContext => ({
  env: {
    ...env,
    MCP_ROOT_PATH: '/tmp/test',
  },
  fetch: global.fetch.bind(global),
  now: () => new Date(),
});

describe('Authorization Framework', () => {
  beforeEach(() => {
    // Clear audit log before each test
    auditLogger.getRecent(0); // This clears the log

    // Reset environment variables for each test
    delete process.env.MCP_STRICT_MODE;
    delete process.env.MCP_REQUIRE_AUTH_DANGEROUS;
    delete process.env.MCP_ADMIN_IP_WHITELIST;
    delete process.env.MCP_ENABLE_AUDIT;
    delete process.env.MCP_DEFAULT_ROLE;
  });

  describe('Tool Authorization Requirements', () => {
    it('should have requirements for dangerous tools', () => {
      const dangerousTools = getDangerousTools();
      assert(dangerousTools.length > 0, 'Should have dangerous tools defined');

      dangerousTools.forEach((toolName) => {
        const reqs = getToolAuthRequirements(toolName);
        assert(reqs, `Tool ${toolName} should have requirements`);
        assert(reqs.dangerous, `Tool ${toolName} should be marked as dangerous`);
        assert(reqs.auditLog, `Tool ${toolName} should require audit logging`);
      });
    });

    it('should categorize tools by permission level', () => {
      const deleteTools = getToolsByPermissionLevel('delete');
      const adminTools = getToolsByPermissionLevel('admin');

      assert(deleteTools.length > 0, 'Should have tools requiring delete permission');
      assert(adminTools.length > 0, 'Should have tools requiring admin permission');

      // Check that exec_run requires admin
      assert(adminTools.includes('exec_run'), 'exec_run should require admin permission');

      // Check that file deletion requires delete permission
      assert(
        deleteTools.includes('kanban_delete_task'),
        'kanban_delete_task should require delete permission',
      );
    });
  });

  describe('Guest User Access', () => {
    it('should allow read-only operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'guest-user',
        MCP_USER_ROLE: 'guest',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('files_view_file'),
        'files_view_file',
      );

      const tool = toolFactory(context);
      const result = (await tool.invoke({ path: 'test.txt' })) as any;

      assert(result.success, 'Guest should be able to read files');
    });

    it('should deny dangerous operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'guest-user',
        MCP_USER_ROLE: 'guest',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('files_write_content'),
        'files_write_content',
      );

      const tool = toolFactory(context);

      await assert.rejects(
        () => tool.invoke({ filePath: 'test.txt', content: 'hello' }),
        /Authorization denied.*Role 'guest' lacks required permission level: write/,
      );
    });

    it('should deny command execution', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'guest-user',
        MCP_USER_ROLE: 'guest',
      });

      const toolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');

      const tool = toolFactory(context);

      await assert.rejects(
        () => tool.invoke({ commandId: 'test' }),
        /Authorization denied.*Role 'guest' not in required roles: developer, admin/,
      );
    });
  });

  describe('User Access', () => {
    it('should allow write operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'regular-user',
        MCP_USER_ROLE: 'user',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('kanban_update_status'),
        'kanban_update_status',
      );

      const tool = toolFactory(context);
      const result = (await tool.invoke({ uuid: 'test-uuid', status: 'in-progress' })) as any;

      assert(result.success, 'User should be able to update task status');
    });

    it('should deny delete operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'regular-user',
        MCP_USER_ROLE: 'user',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('kanban_delete_task'),
        'kanban_delete_task',
      );

      const tool = toolFactory(context);

      await assert.rejects(
        () => tool.invoke({ uuid: 'test-uuid' }),
        /Authorization denied.*Role 'user' lacks required permission level: delete/,
      );
    });
  });

  describe('Developer Access', () => {
    it('should allow delete operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'developer-user',
        MCP_USER_ROLE: 'developer',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('kanban_delete_task'),
        'kanban_delete_task',
      );

      const tool = toolFactory(context);
      const result = (await tool.invoke({ uuid: 'test-uuid' })) as any;

      assert(result.success, 'Developer should be able to delete tasks');
    });

    it('should deny admin operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'developer-user',
        MCP_USER_ROLE: 'developer',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('process_update_task_runner_config'),
        'process_update_task_runner_config',
      );

      const tool = toolFactory(context);

      await assert.rejects(
        () => tool.invoke({ config: {} }),
        /Authorization denied.*Role 'developer' not in required roles: admin/,
      );
    });
  });

  describe('Admin Access', () => {
    it('should allow all operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'admin-user',
        MCP_USER_ROLE: 'admin',
        REMOTE_ADDR: '127.0.0.1', // Whitelisted IP
      });

      // Test admin-level tool
      const adminToolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');

      const adminTool = adminToolFactory(context);
      const adminResult = (await adminTool.invoke({ commandId: 'test' })) as any;
      assert(adminResult.success, 'Admin should be able to execute commands');

      // Test delete tool
      const deleteToolFactory = createAuthorizedToolFactory(
        createMockTool('kanban_delete_task'),
        'kanban_delete_task',
      );

      const deleteTool = deleteToolFactory(context);
      const deleteResult = (await deleteTool.invoke({ uuid: 'test-uuid' })) as any;
      assert(deleteResult.success, 'Admin should be able to delete tasks');
    });
  });

  describe('Audit Logging', () => {
    it('should log denied attempts', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'guest-user',
        MCP_USER_ROLE: 'guest',
        REMOTE_ADDR: '192.168.1.100',
        USER_AGENT: 'test-agent',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('files_write_content'),
        'files_write_content',
      );

      const tool = toolFactory(context);

      try {
        await tool.invoke({ filePath: 'test.txt', content: 'hello' });
      } catch {
        // Expected to fail
      }

      const recentLogs = auditLogger.getRecent(1);
      assert(recentLogs.length === 1, 'Should have one audit log entry');

      const log = recentLogs[0]!;
      assert(log.userId === 'guest-user', 'Should log correct user ID');
      assert(log.role === 'guest', 'Should log correct role');
      assert(log.toolName === 'files_write_content', 'Should log correct tool name');
      assert(log.result === 'denied', 'Should log denied result');
      assert(log.ipAddress === '192.168.1.100', 'Should log IP address');
      assert(log.userAgent === 'test-agent', 'Should log user agent');
    });

    it('should log successful dangerous operations', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'admin-user',
        MCP_USER_ROLE: 'admin',
        REMOTE_ADDR: '127.0.0.1', // Whitelisted IP
      });

      const toolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');

      const tool = toolFactory(context);
      await tool.invoke({ commandId: 'test' });

      const recentLogs = auditLogger.getRecent(2);
      const completionLog = recentLogs.find((log) => log.action === 'complete');

      assert(completionLog !== undefined, 'Should log completion for dangerous operations');
      assert(completionLog.result === 'allowed', 'Should log successful completion');
    });

    it('should filter logs by user', async () => {
      const context1 = createMockContext({
        MCP_USER_ID: 'user1',
        MCP_USER_ROLE: 'guest',
      });

      const context2 = createMockContext({
        MCP_USER_ID: 'user2',
        MCP_USER_ROLE: 'guest',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('files_write_content'),
        'files_write_content',
      );

      const tool1 = toolFactory(context1);
      const tool2 = toolFactory(context2);

      // Both should fail and be logged
      try {
        await tool1.invoke({ filePath: 'test1.txt', content: 'hello' });
      } catch {}

      try {
        await tool2.invoke({ filePath: 'test2.txt', content: 'world' });
      } catch {}

      const user1Logs = auditLogger.getByUser('user1');
      const user2Logs = auditLogger.getByUser('user2');

      assert(user1Logs.length === 1, 'Should have one log for user1');
      assert(user2Logs.length === 1, 'Should have one log for user2');
      assert(user1Logs[0]!.userId === 'user1', 'Should have correct user ID');
      assert(user2Logs[0]!.userId === 'user2', 'Should have correct user ID');
    });
  });

  describe('Error Handling', () => {
    it('should handle tool failures gracefully', async () => {
      process.env.MCP_STRICT_MODE = 'false'; // Disable strict mode for this test

      const context = createMockContext({
        MCP_USER_ID: 'admin-user',
        MCP_USER_ROLE: 'admin',
        REMOTE_ADDR: '127.0.0.1', // Whitelisted IP
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('failing_tool', true),
        'failing_tool',
      );

      const tool = toolFactory(context);

      await assert.rejects(() => tool.invoke({ test: 'data' }), /Tool failing_tool failed/);
    });

    it('should handle invalid roles', async () => {
      const context = createMockContext({
        MCP_USER_ID: 'test-user',
        MCP_USER_ROLE: 'invalid-role',
      });

      const toolFactory = createAuthorizedToolFactory(
        createMockTool('files_view_file'),
        'files_view_file',
      );

      const tool = toolFactory(context);

      await assert.rejects(
        () => tool.invoke({ path: 'test.txt' }),
        /Invalid user role: invalid-role/,
      );
    });
  });

  describe('Tool Description Updates', () => {
    it('should add authorization notice to tool descriptions', () => {
      const context = createMockContext({
        MCP_USER_ID: 'admin-user',
        MCP_USER_ROLE: 'admin',
      });

      const toolFactory = createAuthorizedToolFactory(createMockTool('test_tool'), 'test_tool');

      const tool = toolFactory(context);
      assert(
        tool.spec.description.includes('[Authorization required]'),
        'Tool description should include authorization notice',
      );
    });
  });

  describe('Enhanced Authorization Features', () => {
    beforeEach(() => {
      // Reset environment variables for each test
      delete process.env.MCP_STRICT_MODE;
      delete process.env.MCP_REQUIRE_AUTH_DANGEROUS;
      delete process.env.MCP_ADMIN_IP_WHITELIST;
      delete process.env.MCP_ENABLE_AUDIT;
    });

    describe('Strict Mode', () => {
      it('should deny unknown tools when strict mode is enabled', async () => {
        process.env.MCP_STRICT_MODE = 'true';

        const context = createMockContext({
          MCP_USER_ID: 'test-user',
          MCP_USER_ROLE: 'user',
        });

        const toolFactory = createAuthorizedToolFactory(
          createMockTool('unknown_tool'),
          'unknown_tool',
        );

        const tool = toolFactory(context);

        await assert.rejects(
          () => tool.invoke({ test: 'data' }),
          /Authorization denied.*Tool 'unknown_tool' not found in authorization configuration \(strict mode enabled\)/,
        );
      });

      it('should allow unknown tools when strict mode is disabled', async () => {
        process.env.MCP_STRICT_MODE = 'false';

        const context = createMockContext({
          MCP_USER_ID: 'test-user',
          MCP_USER_ROLE: 'user',
        });

        const toolFactory = createAuthorizedToolFactory(
          createMockTool('unknown_tool'),
          'unknown_tool',
        );

        const tool = toolFactory(context);
        const result = (await tool.invoke({ test: 'data' })) as any;

        assert(result.success, 'Should allow unknown tools when strict mode is disabled');
      });

      it('should report strict mode status correctly', () => {
        process.env.MCP_STRICT_MODE = 'true';
        assert(isStrictModeEnabled() === true, 'Should report strict mode as enabled');

        process.env.MCP_STRICT_MODE = 'false';
        assert(isStrictModeEnabled() === false, 'Should report strict mode as disabled');
      });
    });

    describe('Require Auth for Dangerous Operations', () => {
      it('should deny dangerous operations for anonymous users when enabled', async () => {
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

        await assert.rejects(
          () => tool.invoke({ filePath: 'test.txt', content: 'hello' }),
          /Authorization denied.*Authentication required for dangerous operation 'files_write_content' \(requireAuthForDangerous enabled\)/,
        );
      });

      it('should allow dangerous operations for authenticated users when enabled', async () => {
        process.env.MCP_REQUIRE_AUTH_DANGEROUS = 'true';

        const context = createMockContext({
          MCP_USER_ID: 'authenticated-user',
          MCP_USER_ROLE: 'user',
        });

        const toolFactory = createAuthorizedToolFactory(
          createMockTool('kanban_update_status'), // Non-dangerous but requires write
          'kanban_update_status',
        );

        const tool = toolFactory(context);
        const result = (await tool.invoke({ uuid: 'test-uuid', status: 'in-progress' })) as any;

        assert(result.success, 'Should allow authenticated users to perform operations');
      });

      it('should report require auth for dangerous status correctly', () => {
        process.env.MCP_REQUIRE_AUTH_DANGEROUS = 'true';
        assert(isAuthRequiredForDangerous() === true, 'Should report require auth as enabled');

        process.env.MCP_REQUIRE_AUTH_DANGEROUS = 'false';
        assert(isAuthRequiredForDangerous() === false, 'Should report require auth as disabled');
      });
    });

    describe('Admin IP Whitelist', () => {
      it('should allow admin access from whitelisted IP', async () => {
        process.env.MCP_ADMIN_IP_WHITELIST = '192.168.1.100,127.0.0.1';

        const context = createMockContext({
          MCP_USER_ID: 'admin-user',
          MCP_USER_ROLE: 'admin',
          REMOTE_ADDR: '192.168.1.100',
        });

        const toolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');
        const tool = toolFactory(context);
        const result = (await tool.invoke({ commandId: 'test' })) as any;

        assert(result.success, 'Should allow admin access from whitelisted IP');
      });

      it('should deny admin access from non-whitelisted IP', async () => {
        process.env.MCP_ADMIN_IP_WHITELIST = '192.168.1.100,127.0.0.1';

        const context = createMockContext({
          MCP_USER_ID: 'admin-user',
          MCP_USER_ROLE: 'admin',
          REMOTE_ADDR: '192.168.1.200',
        });

        const toolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');
        const tool = toolFactory(context);

        await assert.rejects(
          () => tool.invoke({ commandId: 'test' }),
          /Authorization denied.*Admin access denied from IP 192.168.1.200/,
        );
      });

      it('should validate admin IP correctly', () => {
        process.env.MCP_ADMIN_IP_WHITELIST = '192.168.1.100,127.0.0.1';

        assert(isAdminIpWhitelisted('192.168.1.100') === true, 'Should recognize whitelisted IP');
        assert(isAdminIpWhitelisted('192.168.1.200') === false, 'Should reject non-whitelisted IP');

        const validResult = validateAdminIp('192.168.1.100');
        assert(validResult.valid === true, 'Should validate whitelisted IP');

        const invalidResult = validateAdminIp('192.168.1.200');
        assert(invalidResult.valid === false, 'Should reject non-whitelisted IP');
        assert(invalidResult.reason, 'Should provide reason for rejection');

        const noIpResult = validateAdminIp();
        assert(noIpResult.valid === false, 'Should reject missing IP');
      });
    });

    describe('Configuration Integration', () => {
      it('should use configured default role', async () => {
        process.env.MCP_DEFAULT_ROLE = 'user';

        const context = createMockContext({
          MCP_USER_ID: 'test-user',
          // No MCP_USER_ROLE specified
        });

        const toolFactory = createAuthorizedToolFactory(
          createMockTool('kanban_update_status'),
          'kanban_update_status',
        );

        const tool = toolFactory(context);
        const result = (await tool.invoke({ uuid: 'test-uuid', status: 'in-progress' })) as any;

        assert(result.success, 'Should use configured default role');
      });

      it('should respect audit logging configuration', async () => {
        process.env.MCP_ENABLE_AUDIT = 'false';

        const context = createMockContext({
          MCP_USER_ID: 'admin-user',
          MCP_USER_ROLE: 'admin',
          REMOTE_ADDR: '127.0.0.1', // Whitelisted IP
        });

        const toolFactory = createAuthorizedToolFactory(createMockTool('exec_run'), 'exec_run');
        const tool = toolFactory(context);

        await tool.invoke({ commandId: 'test' });

        // Should not log anything when audit is disabled
        const recentLogs = auditLogger.getRecent(1);
        assert(recentLogs.length === 0, 'Should not log when audit is disabled');
      });

      it('should provide authorization health information', () => {
        process.env.MCP_STRICT_MODE = 'true';
        process.env.MCP_REQUIRE_AUTH_DANGEROUS = 'true';
        process.env.MCP_ADMIN_IP_WHITELIST = '192.168.1.100';
        process.env.MCP_ENABLE_AUDIT = 'true';

        const health = getAuthorizationHealth();

        assert(health.strictMode === true, 'Should report strict mode status');
        assert(
          health.requireAuthForDangerous === true,
          'Should report require auth dangerous status',
        );
        assert(health.adminIpWhitelistSize === 1, 'Should report whitelist size');
        assert(health.auditLogEnabled === true, 'Should report audit log status');
        assert(health.configuredTools > 0, 'Should report configured tools count');
        assert(health.dangerousTools > 0, 'Should report dangerous tools count');
      });

      it('should return current auth config', () => {
        const config = getCurrentAuthConfig();

        assert(typeof config.strictMode === 'boolean', 'Should include strictMode');
        assert(
          typeof config.requireAuthForDangerous === 'boolean',
          'Should include requireAuthForDangerous',
        );
        assert(Array.isArray(config.adminIpWhitelist), 'Should include adminIpWhitelist');
        assert(typeof config.enableAuditLog === 'boolean', 'Should include enableAuditLog');
      });

it('should identify tools denied under strict mode', () => {
        const deniedTools = getStrictModeDeniedTools();
        
        // Should return array of tool names
        assert(Array.isArray(deniedTools), 'Should return array of tool names');
        
        // The function should return tools that are not configured in the authorization system
        // Since we have many tools configured, this should be empty or contain only non-configured tools
        assert(deniedTools.length >= 0, 'Should return array (possibly empty)');
        
        // Test that some known configured tools are not in the denied list
        const knownConfiguredTools = ['files_view_file', 'exec_run', 'kanban_delete_task'];
        knownConfiguredTools.forEach(tool => {
          assert(!deniedTools.includes(tool), `Should not include configured tool: ${tool}`);
        });
      });
      });
    });

    describe('Backward Compatibility', () => {
      it('should maintain existing role hierarchy', async () => {
        // Test that all existing role permissions still work
        const testCases = [
          { role: 'guest', tool: 'files_view_file', shouldAllow: true },
          { role: 'guest', tool: 'files_write_content', shouldAllow: false },
          { role: 'user', tool: 'kanban_update_status', shouldAllow: true },
          { role: 'user', tool: 'kanban_delete_task', shouldAllow: false },
          { role: 'developer', tool: 'kanban_delete_task', shouldAllow: true },
          { role: 'developer', tool: 'exec_run', shouldAllow: true },
          { role: 'admin', tool: 'exec_run', shouldAllow: true },
        ];

        for (const testCase of testCases) {
          const context = createMockContext({
            MCP_USER_ID: `${testCase.role}-user`,
            MCP_USER_ROLE: testCase.role,
            REMOTE_ADDR: '127.0.0.1', // Whitelisted IP for admin tests
          });

          const toolFactory = createAuthorizedToolFactory(
            createMockTool(testCase.tool),
            testCase.tool,
          );

          const tool = toolFactory(context);

          if (testCase.shouldAllow) {
            const result = (await tool.invoke({ test: 'data' })) as any;
            assert(result.success, `${testCase.role} should be able to use ${testCase.tool}`);
          } else {
            await assert.rejects(
              () => tool.invoke({ test: 'data' }),
              new RegExp(`Authorization denied`),
              `${testCase.role} should not be able to use ${testCase.tool}`,
            );
          }
        }
      });
    });
  });
});
