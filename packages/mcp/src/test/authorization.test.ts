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
      const context = createMockContext({
        MCP_USER_ID: 'admin-user',
        MCP_USER_ROLE: 'admin',
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
});
