/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import { createServer } from 'node:net';
import type { AddressInfo } from 'node:net';
import test from 'ava';
import { z } from 'zod';

import { fastifyTransport } from '../core/transports/fastify.js';
import { createMcpServer } from '../core/mcp-server.js';
import type { Tool } from '../core/types.js';

const allocatePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => {
      server.close();
      reject(error);
    });
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo | null;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        if (!address) {
          reject(new Error('Failed to allocate ephemeral port'));
          return;
        }
        resolve(address.port);
      });
    });
  });

// Helper to create a test tool with Zod schema
const createTestTool = (name: string, schema?: z.ZodRawShape): Tool => {
  const TestSchema = schema ? z.object(schema).strict() : undefined;

  return {
    spec: {
      name,
      description: `Test tool for ${name}`,
      ...(schema ? { inputSchema: schema } : {}),
      stability: 'stable',
      since: '0.1.0',
    },
    invoke: async (raw) => {
      const parsed = TestSchema ? TestSchema.parse(raw ?? {}) : raw;
      return { result: `${name} called with ${JSON.stringify(parsed)}` };
    },
  };
};

// Helper to make MCP requests
const makeMcpRequest = async (url: string, method: string, params: any = {}, sessionId?: string) => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (sessionId) {
    headers['mcp-session-id'] = sessionId;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random().toString(36).substr(2, 9),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  const sseLines = text.split('\n');
  const dataLine = sseLines.find(line => line.startsWith('data: '));

  if (!dataLine) {
    throw new Error('No data line found in SSE response');
  }

  const result = JSON.parse(dataLine.slice('data: '.length));

  // Return both the result and the session ID if available
  if (response.headers.get('mcp-session-id')) {
    return { ...result, sessionId: response.headers.get('mcp-session-id') };
  }

  return result;
};

test('MCP /mcp endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create a simple MCP server for the /mcp endpoint
  const testTool = createTestTool('mcp_test', {
    message: z.string(),
    count: z.number().optional(),
  });

  const server = createMcpServer([testTool]);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/mcp', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/mcp`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    t.is(initResult.result.protocolVersion, '2025-06-18');
    t.is(initResult.result.serverInfo.name, 'promethean-mcp');
    t.true(initResult.result.capabilities.tools.listChanged);

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/mcp`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.true(listResult.result.tools.length > 0);

    const toolInfo = listResult.result.tools.find((tool: any) => tool.name === 'mcp_test');
    t.truthy(toolInfo);
    t.is(toolInfo.description, 'Test tool for mcp_test');

    // Call the tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/mcp`, 'tools/call', {
      name: 'mcp_test',
      arguments: { message: 'hello world', count: 3 },
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');
    const parsedResult = JSON.parse(callResult.result.content[0].text);
    t.deepEqual(parsedResult, { result: 'mcp_test called with {"message":"hello world","count":3}' });

  } finally {
    await transport.stop?.();
  }
});

test('MCP /files endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /files endpoint
  const filesTools = [
    createTestTool('files_list_directory', {
      path: z.string(),
    }),
    createTestTool('files_view_file', {
      path: z.string(),
    }),
    createTestTool('files_write_content', {
      path: z.string(),
      content: z.string(),
    }),
  ];

  const server = createMcpServer(filesTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/files', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/files`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/files`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 3);

    // Test files_list_directory tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/files`, 'tools/call', {
      name: 'files_list_directory',
      arguments: { path: '/tmp' },
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});

test('MCP /exec endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /exec endpoint
  const execTools = [
    createTestTool('exec_run', {
      command: z.string(),
      args: z.array(z.string()).optional(),
      cwd: z.string().optional(),
    }),
    createTestTool('exec_list', {}),
  ];

  const server = createMcpServer(execTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/exec', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/exec`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/exec`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 2);

    // Test exec_list tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/exec`, 'tools/call', {
      name: 'exec_list',
      arguments: {},
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});

test('MCP /kanban endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /kanban endpoint
  const kanbanTools = [
    createTestTool('kanban_get_board', {}),
    createTestTool('kanban_get_column', {
      column: z.string(),
    }),
    createTestTool('kanban_update_status', {
      taskId: z.string(),
      status: z.string(),
    }),
  ];

  const server = createMcpServer(kanbanTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/kanban', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/kanban`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/kanban`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 3);

    // Test kanban_get_board tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/kanban`, 'tools/call', {
      name: 'kanban_get_board',
      arguments: {},
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});

test('MCP /process endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /process endpoint
  const processTools = [
    createTestTool('process_enqueue_task', {
      command: z.string(),
      args: z.array(z.string()).optional(),
    }),
    createTestTool('process_get_queue', {}),
    createTestTool('process_stop_task', {
      taskId: z.string(),
    }),
  ];

  const server = createMcpServer(processTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/process', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/process`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/process`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 3);

    // Test process_get_queue tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/process`, 'tools/call', {
      name: 'process_get_queue',
      arguments: {},
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});

test('MCP /github endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /github endpoint
  const githubTools = [
    createTestTool('github_request', {
      method: z.string(),
      url: z.string(),
      body: z.any().optional(),
    }),
    createTestTool('github_rate_limit', {}),
    createTestTool('github_pr_get', {
      owner: z.string(),
      repo: z.string(),
      pullNumber: z.number(),
    }),
  ];

  const server = createMcpServer(githubTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/github', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/github`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/github`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 3);

    // Test github_rate_limit tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/github`, 'tools/call', {
      name: 'github_rate_limit',
      arguments: {},
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});

test('MCP /discord endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /discord endpoint
  const discordTools = [
    createTestTool('discord_send_message', {
      channelId: z.string(),
      content: z.string(),
    }),
    createTestTool('discord_list_messages', {
      channelId: z.string(),
      limit: z.number().optional(),
    }),
  ];

  const server = createMcpServer(discordTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/discord', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/discord`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/discord`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 2);

    // Test discord_send_message tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/discord`, 'tools/call', {
      name: 'discord_send_message',
      arguments: { channelId: 'test-channel', content: 'Hello from integration test' },
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});

test('MCP /github/review endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /github/review endpoint
  const reviewTools = [
    createTestTool('github_review_open_pull_request', {
      owner: z.string(),
      repo: z.string(),
      base: z.string(),
      head: z.string(),
      title: z.string(),
    }),
    createTestTool('github_review_submit_review', {
      owner: z.string(),
      repo: z.string(),
      pullNumber: z.number(),
      body: z.string(),
      event: z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']),
    }),
  ];

  const server = createMcpServer(reviewTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/github/review', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/github/review`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/github/review`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 2);

    // Test github_review_open_pull_request tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/github/review`, 'tools/call', {
      name: 'github_review_open_pull_request',
      arguments: {
        owner: 'test-owner',
        repo: 'test-repo',
        base: 'main',
        head: 'feature-branch',
        title: 'Test PR',
      },
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});

test('MCP /workspace endpoint integration test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /workspace endpoint
  const workspaceTools = [
    createTestTool('apply_patch', {
      patch: z.string(),
      file: z.string().optional(),
    }),
    createTestTool('pnpm_install', {}),
    createTestTool('nx_generate_package', {
      name: z.string(),
      template: z.string(),
    }),
  ];

  const server = createMcpServer(workspaceTools);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/workspace', kind: 'registry', handler: server }]);

  try {
    // Initialize MCP session
    const initResult = await makeMcpRequest(`http://127.0.0.1:${port}/workspace`, 'initialize', {
      protocolVersion: '2024-10-01',
      clientInfo: { name: 'test-client', version: '1.0.0' },
      capabilities: {},
    });

    const sessionId = (initResult as any).sessionId;

    // List tools
    const listResult = await makeMcpRequest(`http://127.0.0.1:${port}/workspace`, 'tools/list', {}, sessionId);
    t.true(Array.isArray(listResult.result.tools));
    t.is(listResult.result.tools.length, 3);

    // Test apply_patch tool
    const callResult = await makeMcpRequest(`http://127.0.0.1:${port}/workspace`, 'tools/call', {
      name: 'apply_patch',
      arguments: {
        patch: '--- a/test.txt\n+++ b/test.txt\n@@ -1 +1 @@\n-old content\n+new content',
      },
    }, sessionId);

    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

  } finally {
    await transport.stop?.();
  }
});