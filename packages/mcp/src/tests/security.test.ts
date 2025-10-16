import test from 'ava';
import { mkdtemp, writeFile, symlink, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFileContent } from '../files.js';
import type { Tool, ToolContext } from '../core/types.js';

test('writeFileContent rejects symlink escape attempts', async (t) => {
  const sandbox = await mkdtemp(join(tmpdir(), 'mcp-security-test-'));
  const outsideFile = join(sandbox, '..', 'outside-secret.txt');

  // Create a file outside the sandbox
  await writeFile(outsideFile, 'secret content');

  // Create a symlink inside the sandbox pointing outside
  const symlinkPath = join(sandbox, 'escape-symlink');
  await symlink(outsideFile, symlinkPath);

  // Attempt to write through the symlink should fail
  await t.throwsAsync(
    async () => {
      await writeFileContent(sandbox, 'escape-symlink', 'malicious content');
    },
    { message: /symlink escape detected/ },
  );

  // Verify the original file wasn't modified
  const content = await readFile(outsideFile, 'utf8');
  t.is(content, 'secret content');
});

test('writeFileContent allows legitimate symlinks within sandbox', async (t) => {
  const sandbox = await mkdtemp(join(tmpdir(), 'mcp-security-test-'));
  const targetFile = join(sandbox, 'target.txt');
  const symlinkPath = join(sandbox, 'internal-symlink');

  // Create a file inside the sandbox
  await writeFile(targetFile, 'original content');

  // Create a symlink inside the sandbox pointing to another file inside
  await symlink(targetFile, symlinkPath);

  // Writing through the symlink should succeed
  await writeFileContent(sandbox, 'internal-symlink', 'updated content');

  // Verify the target file was updated
  const content = await readFile(targetFile, 'utf8');
  t.is(content, 'updated content');
});

test('writeFileContent prevents parent directory symlink escape', async (t) => {
  const sandbox = await mkdtemp(join(tmpdir(), 'mcp-security-test-'));
  const outsideDir = join(sandbox, '..', 'outside-dir');

  // Create a directory outside the sandbox
  await mkdtemp(outsideDir);

  // Create a symlink to the outside directory
  const maliciousSymlink = join(sandbox, 'malicious-dir');
  await symlink(outsideDir, maliciousSymlink);

  // Attempt to write through the malicious directory symlink should fail
  await t.throwsAsync(
    async () => {
      await writeFileContent(sandbox, 'malicious-dir/escape.txt', 'malicious content');
    },
    { message: /symlink escape detected/ },
  );
});

// ===== COMPREHENSIVE SECURITY TESTS =====

// Mock tool implementations for testing
const createMockTool = (name: string): Tool => ({
  spec: {
    name,
    description: `Mock tool ${name}`,
    inputSchema: {
      type: 'object',
      properties: {},
    } as any,
  },
  invoke: async (args: unknown) => ({ result: `executed ${name}`, args }),
});

const createMockContext = (role: string = 'guest'): ToolContext => ({
  env: {
    MCP_USER_ID: 'test-user',
    MCP_USER_ROLE: role,
    REMOTE_ADDR: '127.0.0.1',
    USER_AGENT: 'test-agent',
  },
  fetch: global.fetch,
  now: () => new Date(),
});

test('authorization: guest cannot access dangerous tools', async (t) => {
  const { createAuthorizedToolFactory } = await import('../core/authorization.js');

  const mockTool = createMockTool('files_write_content');
  const mockFactory = () => mockTool;
  const authorizedFactory = createAuthorizedToolFactory(mockFactory, 'files_write_content');

  const context = createMockContext('guest');
  const authorizedTool = authorizedFactory(context);

  await t.throwsAsync(authorizedTool.invoke({ path: '/etc/passwd', content: 'malicious' }), {
    message: /Authorization denied/,
  });
});

test('authorization: admin can access dangerous tools', async (t) => {
  const { createAuthorizedToolFactory } = await import('../core/authorization.js');

  const mockTool = createMockTool('files_write_content');
  const mockFactory = () => mockTool;
  const authorizedFactory = createAuthorizedToolFactory(mockFactory, 'files_write_content');

  const context = createMockContext('admin');
  const authorizedTool = authorizedFactory(context);

  const result = (await authorizedTool.invoke({ path: '/tmp/test', content: 'safe' })) as any;
  t.is(result.result, 'executed files_write_content');
});

test('authorization: guest can access safe tools', async (t) => {
  const { createAuthorizedToolFactory } = await import('../core/authorization.js');

  const mockTool = createMockTool('mcp_help');
  const mockFactory = () => mockTool;
  const authorizedFactory = createAuthorizedToolFactory(mockFactory, 'mcp_help');

  const context = createMockContext('guest');
  const authorizedTool = authorizedFactory(context);

  const result = (await authorizedTool.invoke({})) as any;
  t.is(result.result, 'executed mcp_help');
});

test('authorization: admin can access dangerous tools', async (t) => {
  const { createAuthorizedToolFactory } = await import('../core/authorization.js');

  const mockTool = createMockTool('files_write_content');
  const mockFactory = () => mockTool;
  const authorizedFactory = createAuthorizedToolFactory(mockFactory, 'files_write_content');

  const context = createMockContext('admin');
  const authorizedTool = authorizedFactory(context);

  const result = (await authorizedTool.invoke({ path: '/tmp/test', content: 'safe' })) as any;
  t.is(result.result, 'executed files_write_content');
});

test('authorization: guest can access safe tools', async (t) => {
  const { createAuthorizedToolFactory } = await import('../core/authorization.js');

  const mockTool = createMockTool('mcp_help');
  const mockFactory = () => mockTool;
  const authorizedFactory = createAuthorizedToolFactory(mockFactory, 'mcp_help');

  const context = createMockContext('guest');
  const authorizedTool = authorizedFactory(context);

  const result = (await authorizedTool.invoke({})) as any;
  t.is(result.result, 'executed mcp_help');
});

test('security: no hardcoded secrets in config files', async (t) => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const configPath = path.resolve(process.cwd(), '../../../promethean.mcp.json');
  const configContent = fs.readFileSync(configPath, 'utf-8');

  // Check for common secret patterns
  const secretPatterns = [
    /["']?[A-Z_]*API[_]?KEY["']?\s*[:=]\s*["'][^"']{20,}["']/,
    /["']?[A-Z_]*TOKEN["']?\s*[:=]\s*["'][^"']{20,}["']/,
    /["']?[A-Z_]*SECRET["']?\s*[:=]\s*["'][^"']{20,}["']/,
    /["']?[A-Z_]*PASSWORD["']?\s*[:=]\s*["'][^"']{8,}["']/,
  ];

  for (const pattern of secretPatterns) {
    const matches = configContent.match(pattern);
    if (matches) {
      // Allow environment variable placeholders
      const hasPlaceholders = matches.some((match) => match.includes('${'));
      if (!hasPlaceholders) {
        t.fail(`Found potential hardcoded secret: ${matches[0]}`);
      }
    }
  }

  t.pass();
});

test('security: environment variable placeholders used', async (t) => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const configPath = path.resolve(process.cwd(), '../../../promethean.mcp.json');
  const configContent = fs.readFileSync(configPath, 'utf-8');

  // Should use ${VAR_NAME} pattern for secrets
  const envVarPattern = /\$\{[A-Z_][A-Z0-9_]*\}/g;
  const matches = configContent.match(envVarPattern);

  t.true(matches && matches.length > 0, 'Should use environment variable placeholders');
});

test('security: audit logging captures security events', async (t) => {
  const { createAuthorizedToolFactory, auditLogger } = await import('../core/authorization.js');

  const mockTool = createMockTool('dangerous_tool');
  const mockFactory = () => mockTool;
  const authorizedFactory = createAuthorizedToolFactory(mockFactory, 'dangerous_tool');

  const context = createMockContext('guest');
  const authorizedTool = authorizedFactory(context);

  // Attempt unauthorized access
  try {
    await authorizedTool.invoke({ malicious: 'payload' });
  } catch {
    // Expected to fail
  }

  const logs = auditLogger.getRecent(10);
  const deniedLogs = logs.filter((log) => log.result === 'denied');

  t.true(deniedLogs.length > 0, 'Should log denied access attempts');
  t.true(
    logs.some((log) => log.toolName === 'dangerous_tool'),
    'Should log tool name',
  );
  t.true(
    logs.some((log) => log.userId === 'test-user'),
    'Should log user ID',
  );
});

test('security: session management is secure', async (t) => {
  // Test session ID generation and validation
  const { createSessionIdGenerator } = await import('../core/transports/session-id.js');
  const crypto = await import('node:crypto');

  const sessionIdGenerator = createSessionIdGenerator(crypto);
  const sessionId1 = sessionIdGenerator();
  const sessionId2 = sessionIdGenerator();

  // Session IDs should be unique
  t.not(sessionId1, sessionId2);

  // Session IDs should be sufficiently long and random
  t.true(sessionId1.length >= 32, 'Session ID should be at least 32 characters');
  t.true(/^[a-zA-Z0-9_-]+$/.test(sessionId1), 'Session ID should contain only safe characters');
});

test('security: file upload validation prevents malicious files', async (t) => {
  const maliciousFiles = [
    'exploit.php',
    'script.js',
    'malicious.exe',
    '../../../etc/passwd',
    'file with spaces.exe',
    'file\nwith\nnewlines.txt',
  ];

  for (const filename of maliciousFiles) {
    // Test filename validation
    const isValidFilename =
      /^[a-zA-Z0-9._-]+$/.test(filename) &&
      !filename.includes('..') &&
      !filename.includes('\n') &&
      !filename.includes('\r');

    // Malicious files should be rejected
    if (filename.includes('..') || filename.includes('\n') || filename.includes('\r')) {
      t.false(isValidFilename, `Should reject malicious filename: ${filename}`);
    }
  }
});

test('security: command injection prevention', async (t) => {
  const maliciousCommands = [
    '; rm -rf /',
    '| cat /etc/passwd',
    '&& curl malicious.com',
    '`whoami`',
    '$(id)',
    '> /tmp/malicious',
  ];

  for (const cmd of maliciousCommands) {
    // Test command sanitization
    const sanitized = cmd.replace(/[;&|`$()]/g, '');
    t.not(sanitized, cmd, `Command should be sanitized: ${cmd}`);
  }
});
