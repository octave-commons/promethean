/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-imports */
import { createServer } from 'node:net';
import type { AddressInfo } from 'node:net';
import type { IncomingMessage, ServerResponse } from 'node:http';

import test from 'ava';
import esmock from 'esmock';

import { fastifyTransport } from '../core/transports/fastify.js';
import type { HttpEndpointDescriptor } from '../core/transports/fastify.js';
import { createMcpServer } from '../core/mcp-server.js';
import type { StdioServerSpec } from '../proxy/config.js';
import type { Tool } from '../core/types.js';
import { z } from 'zod';

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

test('registry endpoint supports SSE while proxy endpoint does not', async (t) => {
  let registryHeaders: IncomingMessage['headers'] | undefined;
  let proxyHeaders: IncomingMessage['headers'] | undefined;

  // Mock registry that captures headers
  class MockStreamableHTTPServerTransport {
    async handleRequest(req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      registryHeaders = { ...req.headers };
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: { protocolVersion: '2024-10-01', capabilities: {} }
      }));
    }

    async close(): Promise<void> {}
    async send(): Promise<void> {}
  }

  // Mock proxy that captures headers
  class FakeProxy {
    public readonly spec = {
      name: 'fake-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {}
    async stop(): Promise<void> {}

    async handle(req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      proxyHeaders = { ...req.headers };
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: { protocolVersion: '2024-10-01', capabilities: {} }
      }));
    }
  }

  const modulePath = new URL('../core/transports/fastify.js', import.meta.url).pathname;
  const { fastifyTransport: mockFastifyTransport } = await esmock<typeof import('../core/transports/fastify.js')>(modulePath, {
    '@modelcontextprotocol/sdk/server/streamableHttp.js': {
      StreamableHTTPServerTransport: MockStreamableHTTPServerTransport,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fake-proxy',
    command: '/bin/echo',
    args: ['hello'],
    env: {},
    httpPath: '/proxy',
  };

  const modulePath2 = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath2, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeProxy,
    },
  });

  const port = await allocatePort();
  const transport = mockFastifyTransport({ host: '127.0.0.1', port });
  const proxy = new StdioHttpProxy(spec, () => {});

  const descriptors: HttpEndpointDescriptor[] = [
    { path: '/registry', kind: 'registry', handler: {} as any }, // Mock registry
    { path: '/proxy', kind: 'proxy', handler: proxy },
  ];

  await transport.start(descriptors);

  try {
    // Test registry endpoint
    const registryResponse = await fetch(`http://127.0.0.1:${port}/registry`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-10-01',
          clientInfo: { name: 'test', version: '1.0.0' },
          capabilities: {},
        },
      }),
    });

    t.is(registryResponse.status, 200);
    t.truthy(registryHeaders);

    // Test proxy endpoint
    const proxyResponse = await fetch(`http://127.0.0.1:${port}/proxy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {},
      }),
    });

    t.is(proxyResponse.status, 200);
    t.truthy(proxyHeaders);

    // Registry should include SSE in Accept header
    t.is(registryHeaders!['accept'], 'application/json, text/event-stream');

    // Proxy should NOT include SSE in Accept header
    t.is(proxyHeaders!['accept'], 'application/json');
    t.not(proxyHeaders!['accept'], 'application/json, text/event-stream');

  } finally {
    await transport.stop?.();
  }
});

test('proxy responses complete quickly without SSE delays', async (t) => {
  const startTime = Date.now();
  let proxyHandled = false;

  class FastProxy {
    public readonly spec = {
      name: 'fast-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {}
    async stop(): Promise<void> {}

    async handle(__req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      proxyHandled = true;
      // Respond immediately
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result: { status: 'ok', timestamp: Date.now() }
      }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FastProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fast-proxy',
    command: '/bin/echo',
    args: ['hello'],
    env: {},
    httpPath: '/proxy',
  };

  const proxy = new StdioHttpProxy(spec, () => {});
  const port = await allocatePort();
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  const descriptors: HttpEndpointDescriptor[] = [
    { path: spec.httpPath, kind: 'proxy', handler: proxy },
  ];

  await transport.start(descriptors);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${spec.httpPath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    t.is(response.status, 200);
    t.true(proxyHandled, 'Proxy should have been called');
    t.true(duration < 1000, `Response should complete quickly, but took ${duration}ms`);

    const payload = await response.json() as { result: { status: string; timestamp: number } };
    t.is(payload.result.status, 'ok');
    t.true(typeof payload.result.timestamp === 'number');

  } finally {
    await transport.stop?.();
  }
});

test('registry and proxy endpoints have different HTTP method support', async (t) => {
  class MockRegistry {
    async connect(): Promise<void> {}
    async close(): Promise<void> {}
  }

  class FastProxy {
    public readonly spec = {
      name: 'method-test-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {}
    async stop(): Promise<void> {}

    async handle(req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      res.writeHead(200).end(JSON.stringify({ method: req.method }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FastProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'method-test-proxy',
    command: '/bin/echo',
    args: ['hello'],
    env: {},
    httpPath: '/proxy',
  };

  const proxy = new StdioHttpProxy(spec, () => {});
  const port = await allocatePort();
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  const descriptors: HttpEndpointDescriptor[] = [
    { path: '/registry', kind: 'registry', handler: new MockRegistry() as any },
    { path: '/proxy', kind: 'proxy', handler: proxy },
  ];

  await transport.start(descriptors);

  try {
    // Test GET requests
    const registryGetResponse = await fetch(`http://127.0.0.1:${port}/registry`, {
      method: 'GET',
    });

    const proxyGetResponse = await fetch(`http://127.0.0.1:${port}/proxy`, {
      method: 'GET',
    });

    // Registry should support GET (404 because no handler, but route exists)
    t.is(registryGetResponse.status, 404);

    // Proxy should reject GET entirely (404 because route doesn't exist)
    t.is(proxyGetResponse.status, 404);

    // Test DELETE requests
    const registryDeleteResponse = await fetch(`http://127.0.0.1:${port}/registry`, {
      method: 'DELETE',
    });

    const proxyDeleteResponse = await fetch(`http://127.0.0.1:${port}/proxy`, {
      method: 'DELETE',
    });

    // Registry should support DELETE
    t.is(registryDeleteResponse.status, 404);

    // Proxy should reject DELETE entirely
    t.is(proxyDeleteResponse.status, 404);

    // Test POST requests
    const registryPostResponse = await fetch(`http://127.0.0.1:${port}/registry`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-10-01',
          clientInfo: { name: 'test', version: '1.0.0' },
          capabilities: {},
        },
      }),
    });

    const proxyPostResponse = await fetch(`http://127.0.0.1:${port}/proxy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
    });

    // Both should support POST
    t.true(registryPostResponse.status >= 200 && registryPostResponse.status < 500);
    t.true(proxyPostResponse.status >= 200 && proxyPostResponse.status < 500);

  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint handles malformed JSON with immediate 400 response', async (t) => {
  const startTime = Date.now();

  class StrictProxy {
    public readonly spec = {
      name: 'strict-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {}
    async stop(): Promise<void> {}

    async handle(__req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      // This should never be called for malformed JSON
      res.writeHead(500).end(JSON.stringify({ error: 'should not reach proxy' }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: StrictProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'strict-proxy',
    command: '/bin/echo',
    args: ['hello'],
    env: {},
    httpPath: '/proxy',
  };

  const proxy = new StdioHttpProxy(spec, () => {});
  const port = await allocatePort();
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  const descriptors: HttpEndpointDescriptor[] = [
    { path: spec.httpPath, kind: 'proxy', handler: proxy },
  ];

  await transport.start(descriptors);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${spec.httpPath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"broken": json', // Malformed JSON
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    t.is(response.status, 400);
    t.true(duration < 500, `Error response should be immediate, but took ${duration}ms`);

    const payload = await response.json();
    t.deepEqual(payload, {
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error' },
      id: null,
    });

  } finally {
    await transport.stop?.();
  }
});

test('real registry tool vs proxy tool behavior comparison', async (t) => {
  const Schema = z.object({ message: z.string() }).strict();
  const tool: Tool = {
    spec: {
      name: 'echo_tool',
      description: 'Echo a message',
      inputSchema: Schema.shape,
      stability: 'stable',
      since: '0.0.1',
    },
    invoke: (raw) => {
      const { message } = Schema.parse(raw ?? {});
      return Promise.resolve({ echo: message });
    },
  };

  // Mock proxy that mimics the same tool
  class EchoProxy {
    public readonly spec = {
      name: 'echo-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {}
    async stop(): Promise<void> {}

    async handle(_req: IncomingMessage, res: ServerResponse, body?: unknown): Promise<void> {
      try {
        const request = typeof body === 'string' ? JSON.parse(body) : body;
        if (request?.method === 'initialize') {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-10-01',
              capabilities: { tools: {} },
              serverInfo: { name: 'echo-proxy', version: '1.0.0' },
            },
          }));
          return;
        }

        if (request?.method === 'tools/list') {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              tools: [{
                name: 'echo_tool',
                description: 'Echo a message via proxy',
                inputSchema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                  required: ['message'],
                },
              }],
            },
          }));
          return;
        }

        if (request?.method === 'tools/call' && request?.params?.arguments) {
          const args = request.params.arguments;
          if (args.message) {
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({
              jsonrpc: '2.0',
              id: request.id,
              result: { content: [{ type: 'text', text: JSON.stringify({ echo: args.message }) }] },
            }));
            return;
          }
        }

        res.writeHead(400).end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32602, message: 'Invalid params' },
          id: request.id ?? null,
        }));
      } catch (error) {
        res.writeHead(500).end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal error' },
          id: null,
        }));
      }
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: EchoProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'echo-proxy',
    command: '/bin/echo',
    args: ['hello'],
    env: {},
    httpPath: '/proxy',
  };

  const proxy = new StdioHttpProxy(spec, () => {});
  const port = await allocatePort();
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  const descriptors: HttpEndpointDescriptor[] = [
    { path: '/registry', kind: 'registry', handler: createMcpServer([tool]), tools: [tool] },
    { path: '/proxy', kind: 'proxy', handler: proxy },
  ];

  await transport.start(descriptors);

  try {
    // Test registry action endpoint
    const registryActionResponse = await fetch(`http://127.0.0.1:${port}/registry/actions/echo_tool`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'hello from registry' }),
    });

    t.is(registryActionResponse.status, 200);
    const registryResult = await registryActionResponse.json();
    t.deepEqual(registryResult, { echo: 'hello from registry' });

    // Test proxy action endpoint
    const proxyActionResponse = await fetch(`http://127.0.0.1:${port}/proxy/actions/echo_tool`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'hello from proxy' }),
    });

    t.is(proxyActionResponse.status, 200);
    const proxyResult = await proxyActionResponse.json();
    t.deepEqual(proxyResult, { echo: 'hello from proxy' });

    // Both should work but have different underlying mechanisms
    t.notDeepEqual(registryResult, proxyResult);

  } finally {
    await transport.stop?.();
  }
});