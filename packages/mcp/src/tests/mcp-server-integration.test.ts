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

test('MCP server handles Zod schema registration without _parse errors', async (t) => {
  const port = await allocatePort();

  // Create a test tool with Zod schemas that would previously cause the _parse error
  const TestSchema = z.object({
    message: z.string(),
    count: z.number().optional(),
  }).strict();

  const testTool: Tool = {
    spec: {
      name: 'test_zod_tool',
      description: 'Test tool with Zod schema that should not cause _parse errors',
      inputSchema: TestSchema.shape,
      stability: 'stable',
      since: '0.1.0',
    },
    invoke: async (raw) => {
      const { message, count = 1 } = TestSchema.parse(raw ?? {});
      return { result: `${message} (${count} times)` };
    },
  };

  const server = createMcpServer([testTool]);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/mcp', kind: 'registry', handler: server }]);

  try {
    // Test 1: Verify server starts without errors
    const healthResponse = await fetch(`http://127.0.0.1:${port}/healthz`);
    t.is(healthResponse.status, 200);

    // Test 2: Initialize MCP connection like ChatGPT would
    const initResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-10-01',
          clientInfo: { name: 'test-client', version: '1.0.0' },
          capabilities: {},
        },
      }),
    });

    t.is(initResponse.status, 200);
    t.truthy(initResponse.headers.get('mcp-session-id'));

    const initText = await initResponse.text();
    // Handle Server-Sent Events format
    const sseLines = initText.split('\n');
    const dataLine = sseLines.find(line => line.startsWith('data: '));
    t.truthy(dataLine);
    const initResult = JSON.parse(dataLine!.slice('data: '.length)) as any;
    t.is(initResult.result.protocolVersion, '2025-06-18');
    t.is(initResult.result.serverInfo.name, 'promethean-mcp');

    // Test 3: List tools to verify they registered without _parse errors
    const sessionId = initResponse.headers.get('mcp-session-id')!;
    const listResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }),
    });

    t.is(listResponse.status, 200);
    const listText = await listResponse.text();
    // Handle Server-Sent Events format
    const listSseLines = listText.split('\n');
    const listDataLine = listSseLines.find(line => line.startsWith('data: '));
    t.truthy(listDataLine);
    const listResult = JSON.parse(listDataLine!.slice('data: '.length)) as any;

    // Check if we got an error response
    if (listResult.error) {
      console.log('Error response:', listResult.error);
      t.fail(`MCP server returned error: ${listResult.error.message}`);
    }

    t.true(Array.isArray(listResult.result?.tools));
    t.true(listResult.result.tools.length > 0);

    const testToolInfo = listResult.result.tools.find((tool: any) => tool.name === 'test_zod_tool');
    t.truthy(testToolInfo);
    t.is(testToolInfo.description, 'Test tool with Zod schema that should not cause _parse errors');

    // Verify the input schema is properly structured
    t.truthy(testToolInfo.inputSchema);
    t.is(testToolInfo.inputSchema.type, 'object');
    t.truthy(testToolInfo.inputSchema.properties);
    t.truthy(testToolInfo.inputSchema.properties.message);
    t.is(testToolInfo.inputSchema.properties.message.type, 'string');

    // Test 4: Call the tool to verify it works correctly
    const callResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'test_zod_tool',
          arguments: {
            message: 'hello world',
            count: 5,
          },
        },
      }),
    });

    t.is(callResponse.status, 200);
    const callText = await callResponse.text();
    // Handle Server-Sent Events format
    const callSseLines = callText.split('\n');
    const callDataLine = callSseLines.find(line => line.startsWith('data: '));
    t.truthy(callDataLine);
    const callResult = JSON.parse(callDataLine!.slice('data: '.length)) as any;
    t.deepEqual(callResult.result, { result: 'hello world (5 times)' });

    // Test 5: Simulate curl-like requests to verify no _parse errors
    const curlLikeInitResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json, text/event-stream',
        'user-agent': 'curl/7.68.0',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'curl-test-1',
        method: 'initialize',
        params: {
          protocolVersion: '2024-10-01',
          clientInfo: { name: 'curl-client', version: '1.0.0' },
          capabilities: {},
        },
      }),
    });

    t.is(curlLikeInitResponse.status, 200);
    const curlLikeInitText = await curlLikeInitResponse.text();
    // Handle Server-Sent Events format
    const curlLikeSseLines = curlLikeInitText.split('\n');
    const curlLikeDataLine = curlLikeSseLines.find(line => line.startsWith('data: '));
    t.truthy(curlLikeDataLine);
    const curlLikeInitData = JSON.parse(curlLikeDataLine!.slice('data: '.length)) as any;
    t.is(curlLikeInitData.result.serverInfo.name, 'promethean-mcp');
    t.truthy(curlLikeInitData.result.capabilities);

    // Test 6: Verify no _parse errors with curl-like tool listing
    const curlLikeListResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'curl/7.68.0',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'curl-test-2',
        method: 'tools/list',
        params: {},
      }),
    });

    t.is(curlLikeListResponse.status, 400); // Should fail without session, but not crash

    // The fact we get here without any "keyValidator._parse is not a function" errors means the fix worked

    // If we get here without any "keyValidator._parse is not a function" errors, the fix worked
    t.pass('MCP server successfully handles Zod schema registration without _parse errors');

  } finally {
    await transport.stop?.();
  }
});

test('MCP server handles multiple tools with complex Zod schemas', async (t) => {
  const port = await allocatePort();

  // Create multiple tools with complex Zod schemas to stress-test the fix
  const ComplexSchema = z.object({
    items: z.array(z.object({
      id: z.string(),
      value: z.number(),
      tags: z.array(z.string()).optional(),
    })),
    config: z.object({
      enabled: z.boolean(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    }).optional(),
  }).strict();

  const complexTool: Tool = {
    spec: {
      name: 'complex_zod_tool',
      description: 'Complex tool with nested Zod schemas',
      inputSchema: ComplexSchema.shape,
      stability: 'experimental',
      since: '0.1.0',
    },
    invoke: async (raw) => {
      const parsed = ComplexSchema.parse(raw ?? {});
      const itemCount = parsed.items.length;
      const enabledCount = parsed.items.filter(item => item.value > 0).length;
      return { summary: `Processed ${itemCount} items, ${enabledCount} enabled` };
    },
  };

  const SimpleSchema = z.object({
    text: z.string().min(1).max(100),
    flag: z.boolean().default(false),
  }).strict();

  const simpleTool: Tool = {
    spec: {
      name: 'simple_zod_tool',
      description: 'Simple tool with basic Zod schema',
      inputSchema: SimpleSchema.shape,
      stability: 'stable',
      since: '0.1.0',
    },
    invoke: async (raw) => {
      const { text, flag } = SimpleSchema.parse(raw ?? {});
      return { result: flag ? text.toUpperCase() : text.toLowerCase() };
    },
  };

  const server = createMcpServer([complexTool, simpleTool]);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/mcp', kind: 'registry', handler: server }]);

  try {
    // Initialize session
    const initResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-10-01',
          clientInfo: { name: 'multi-test', version: '1.0.0' },
          capabilities: {},
        },
      }),
    });

    t.is(initResponse.status, 200);
    const initText = await initResponse.text();
    // Handle Server-Sent Events format
    const sseLines = initText.split('\n');
    const dataLine = sseLines.find(line => line.startsWith('data: '));
    t.truthy(dataLine);
    const initResult = JSON.parse(dataLine!.slice('data: '.length)) as any;
    t.is(initResult.result.protocolVersion, '2025-06-18');
    t.is(initResult.result.serverInfo.name, 'promethean-mcp');

    const sessionId = initResponse.headers.get('mcp-session-id')!;

    // List tools to verify both registered without _parse errors
    const listResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }),
    });

    t.is(listResponse.status, 200);
    const listText = await listResponse.text();
    // Handle Server-Sent Events format
    const listSseLines = listText.split('\n');
    const listDataLine = listSseLines.find(line => line.startsWith('data: '));
    t.truthy(listDataLine);
    const listResult = JSON.parse(listDataLine!.slice('data: '.length)) as any;
    t.is(listResult.result.tools.length, 2);

    const complexToolInfo = listResult.result.tools.find((tool: any) => tool.name === 'complex_zod_tool');
    const simpleToolInfo = listResult.result.tools.find((tool: any) => tool.name === 'simple_zod_tool');

    t.truthy(complexToolInfo);
    t.truthy(simpleToolInfo);

    // Verify complex schema structure
    t.is(complexToolInfo.inputSchema.type, 'object');
    t.truthy(complexToolInfo.inputSchema.properties.items);
    t.is(complexToolInfo.inputSchema.properties.items.type, 'array');

    // Verify simple schema structure
    t.is(simpleToolInfo.inputSchema.type, 'object');
    t.truthy(simpleToolInfo.inputSchema.properties.text);
    t.is(simpleToolInfo.inputSchema.properties.text.type, 'string');

    // Test both tools work correctly
    const complexCallResponse = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'complex_zod_tool',
          arguments: {
            items: [
              { id: '1', value: 10, tags: ['a', 'b'] },
              { id: '2', value: 0, tags: ['c'] },
            ],
            config: { enabled: true, priority: 'high' },
          },
        },
      }),
    });

    t.is(complexCallResponse.status, 200);
    const complexCallText = await complexCallResponse.text();
    // Handle Server-Sent Events format
    const complexCallSseLines = complexCallText.split('\n');
    const complexCallDataLine = complexCallSseLines.find(line => line.startsWith('data: '));
    t.truthy(complexCallDataLine);
    const complexCallResult = JSON.parse(complexCallDataLine!.slice('data: '.length)) as any;
    t.deepEqual(complexCallResult.result, { summary: 'Processed 2 items, 1 enabled' });

    t.pass('Multiple tools with complex Zod schemas registered and work correctly');

  } finally {
    await transport.stop?.();
  }
});