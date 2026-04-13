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

test('MCP /files endpoint smoke test', async (t) => {
  const port = await allocatePort();

  // Create test tools for /files endpoint
  const TestSchema = z.object({
    path: z.string(),
  }).strict();

  const testTool: Tool = {
    spec: {
      name: 'files_list_directory',
      description: 'List directory contents',
      inputSchema: TestSchema.shape,
      stability: 'stable',
      since: '0.1.0',
    },
    invoke: async (raw) => {
      const { path } = TestSchema.parse(raw ?? {});
      return { result: `Directory listing for: ${path}` };
    },
  };

  const server = createMcpServer([testTool]);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/files', kind: 'registry', handler: server }]);

  try {
    // Test 1: Health check
    const healthResponse = await fetch(`http://127.0.0.1:${port}/healthz`);
    t.is(healthResponse.status, 200);

    // Test 2: Initialize MCP connection
    const initResponse = await fetch(`http://127.0.0.1:${port}/files`, {
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

    const initText = await initResponse.text();
    const sseLines = initText.split('\n');
    const dataLine = sseLines.find(line => line.startsWith('data: '));
    t.truthy(dataLine);

    const initResult = JSON.parse(dataLine!.slice('data: '.length)) as any;
    t.is(initResult.result.protocolVersion, '2025-06-18');
    t.is(initResult.result.serverInfo.name, 'promethean-mcp');

    const sessionId = initResponse.headers.get('mcp-session-id');
    t.truthy(sessionId);

    // Test 3: List tools
    const listResponse = await fetch(`http://127.0.0.1:${port}/files`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(sessionId ? { 'mcp-session-id': sessionId } : {}),
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
    const listSseLines = listText.split('\n');
    const listDataLine = listSseLines.find(line => line.startsWith('data: '));
    t.truthy(listDataLine);

    const listResult = JSON.parse(listDataLine!.slice('data: '.length)) as any;
    t.true(Array.isArray(listResult.result?.tools));
    t.is(listResult.result.tools.length, 1);

    const toolInfo = listResult.result.tools[0];
    t.is(toolInfo.name, 'files_list_directory');
    t.is(toolInfo.description, 'List directory contents');

    // Test 4: Call the tool
    const callResponse = await fetch(`http://127.0.0.1:${port}/files`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(sessionId ? { 'mcp-session-id': sessionId } : {}),
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'files_list_directory',
          arguments: { path: '/tmp' },
        },
      }),
    });

    t.is(callResponse.status, 200);
    const callText = await callResponse.text();
    const callSseLines = callText.split('\n');
    const callDataLine = callSseLines.find(line => line.startsWith('data: '));
    t.truthy(callDataLine);

    const callResult = JSON.parse(callDataLine!.slice('data: '.length)) as any;
    t.true(Array.isArray(callResult.result.content));
    t.is(callResult.result.content[0].type, 'text');

    const parsedResult = JSON.parse(callResult.result.content[0].text);
    t.deepEqual(parsedResult, { result: 'Directory listing for: /tmp' });

  } finally {
    await transport.stop?.();
  }
});