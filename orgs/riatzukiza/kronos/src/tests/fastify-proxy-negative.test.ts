/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-imports */
import { createServer } from 'node:net';
import type { AddressInfo } from 'node:net';
import type { IncomingMessage, ServerResponse } from 'node:http';

import test from 'ava';
import esmock from 'esmock';

import { fastifyTransport } from '../core/transports/fastify.js';
import type { HttpEndpointDescriptor } from '../core/transports/fastify.js';
import type { StdioServerSpec } from '../proxy/config.js';

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

interface ProxyLifecycleStub {
  spec: StdioServerSpec;
  start(): Promise<void>;
  stop(): Promise<void>;
  handle(req: IncomingMessage, res: ServerResponse, body?: unknown): Promise<void>;
}

const createFakeProxy = (
  overrides?: {
    spec?: Partial<StdioServerSpec>;
    handle?: (req: IncomingMessage, res: ServerResponse, body?: unknown) => Promise<void> | void;
  },
): ProxyLifecycleStub => {
  const spec: StdioServerSpec = {
    name: 'fake-proxy',
    command: '/bin/echo',
    args: ['hello'],
    env: {},
    httpPath: '/proxy',
    ...overrides?.spec,
  };
  const handle =
    overrides?.handle ??
    (async (_req, res) => {
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    });
  return {
    spec,
    async start() {},
    async stop() {},
    async handle(req, res, body) {
      await handle(req, res, body);
    },
  };
};

const startTransportWithProxy = async (proxy: ProxyLifecycleStub) => {
  const port = await allocatePort();
  const transport = fastifyTransport({ host: '127.0.0.1', port });
  const descriptors: HttpEndpointDescriptor[] = [
    { path: proxy.spec.httpPath, kind: 'proxy', handler: proxy } as HttpEndpointDescriptor,
  ];
  await transport.start(descriptors);
  return { port, transport };
};

test('proxy endpoint responds to GET with proxy metadata', async (t) => {
  const proxy = createFakeProxy();
  const { port, transport } = await startTransportWithProxy(proxy);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${proxy.spec.httpPath}`, {
      method: 'GET',
    });

    t.is(response.status, 200);
    const payload = (await response.json()) as Record<string, unknown>;
    t.deepEqual(payload, {
      name: proxy.spec.name,
      status: 'ready',
      type: 'stdio-proxy',
      httpPath: proxy.spec.httpPath,
      message: 'Proxy server is running. Use POST for JSON-RPC requests.',
    });
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint rejects DELETE method with 404', async (t) => {
  const proxy = createFakeProxy();
  const { port, transport } = await startTransportWithProxy(proxy);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${proxy.spec.httpPath}`, {
      method: 'DELETE',
    });

    t.is(response.status, 404);
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint accepts OPTIONS method for CORS', async (t) => {
  const proxy = createFakeProxy();
  const { port, transport } = await startTransportWithProxy(proxy);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${proxy.spec.httpPath}`, {
      method: 'OPTIONS',
    });

    t.is(response.status, 204);
    t.is(response.headers.get('access-control-allow-methods'), 'POST,GET,OPTIONS');
    t.is(response.headers.get('access-control-allow-origin'), '*');
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint returns 400 for invalid JSON', async (t) => {
  const proxy = createFakeProxy({
    handle: async (_req, res) => {
      res.writeHead(500).end(JSON.stringify({ error: 'should not reach here' }));
    },
  });
  const { port, transport } = await startTransportWithProxy(proxy);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${proxy.spec.httpPath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"incomplete": json', // Invalid JSON
    });

    t.is(response.status, 400);
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

test('proxy endpoint passes Accept headers through but enforces JSON content-type', async (t) => {
  let capturedHeaders: IncomingMessage['headers'] | undefined;
  const proxy = createFakeProxy({
    handle: async (req, res) => {
      capturedHeaders = { ...req.headers };
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    },
  });
  const { port, transport } = await startTransportWithProxy(proxy);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${proxy.spec.httpPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {},
      }),
    });

    t.is(response.status, 200);
    t.truthy(capturedHeaders);

    const acceptHeader = capturedHeaders!['accept'];
    t.true(typeof acceptHeader === 'string' && acceptHeader.includes('application/json'));
    t.is(capturedHeaders!['content-type'], 'application/json');
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint patches headers object instead of replacing', async (t) => {
  let originalHeadersObject: IncomingMessage['headers'] | undefined;
  let finalHeadersObject: IncomingMessage['headers'] | undefined;

  const proxy = createFakeProxy({
    handle: async (req, res) => {
      originalHeadersObject = req.headers;
      finalHeadersObject = req.headers;
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    },
  });
  const { port, transport } = await startTransportWithProxy(proxy);

  try {
    const response = await fetch(`http://127.0.0.1:${port}${proxy.spec.httpPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json, text/event-stream',
        'x-custom-header': 'test-value',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {},
      }),
    });

    t.is(response.status, 200);
    t.is(originalHeadersObject, finalHeadersObject);
    t.is(finalHeadersObject!['x-custom-header'], 'test-value');
    const acceptHeader = finalHeadersObject!['accept'];
    t.true(typeof acceptHeader === 'string' && acceptHeader.includes('application/json'));
    t.is(finalHeadersObject!['content-type'], 'application/json');
  } finally {
    await transport.stop?.();
  }
});

test('registry endpoint still includes SSE in Accept header', async (t) => {
  let capturedHeaders: IncomingMessage['headers'] | undefined;

  // Create a mock transport that captures headers
  class MockStreamableHTTPServerTransport {
    async handleRequest(req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      capturedHeaders = { ...req.headers };
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    }

    async close(): Promise<void> {
      // no-op
    }

    async send(): Promise<void> {
      // no-op
    }
  }

  const modulePath = new URL('../core/transports/fastify.js', import.meta.url).pathname;
  const { fastifyTransport: mockFastifyTransport } = await esmock<typeof import('../core/transports/fastify.js')>(modulePath, {
    '@modelcontextprotocol/sdk/server/streamableHttp.js': {
      StreamableHTTPServerTransport: MockStreamableHTTPServerTransport,
    },
  });

  const port = await allocatePort();

  const registryHandler = { connect: async () => {} } as any;
  const descriptors: HttpEndpointDescriptor[] = [
    { path: '/registry', kind: 'registry', handler: registryHandler },
  ];

  const transport = mockFastifyTransport({ host: '127.0.0.1', port });
  await transport.start(descriptors);

  try {
    const response = await fetch(`http://127.0.0.1:${port}/registry`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json', // Client requests only JSON
      },
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

    t.is(response.status, 200);
    t.truthy(capturedHeaders);

    const acceptHeader = capturedHeaders!['accept'];
    // Registry should include SSE in Accept header
    t.is(acceptHeader, 'application/json, text/event-stream');
  } finally {
    await transport.stop?.();
  }
});
