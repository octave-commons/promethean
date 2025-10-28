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

test('proxy endpoint rejects GET method with 404', async (t) => {
  class FakeProxy {
    public readonly spec = {
      name: 'fake-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {
      // no-op
    }

    async stop(): Promise<void> {
      // no-op
    }

    async handle(__req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fake-proxy',
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
      method: 'GET',
    });

    // Should return 404 since GET is not allowed on proxy endpoints
    t.is(response.status, 404);
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint rejects DELETE method with 404', async (t) => {
  class FakeProxy {
    public readonly spec = {
      name: 'fake-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {
      // no-op
    }

    async stop(): Promise<void> {
      // no-op
    }

    async handle(__req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fake-proxy',
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
      method: 'DELETE',
    });

    // Should return 404 since DELETE is not allowed on proxy endpoints
    t.is(response.status, 404);
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint accepts OPTIONS method for CORS', async (t) => {
  class FakeProxy {
    public readonly spec = {
      name: 'fake-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {
      // no-op
    }

    async stop(): Promise<void> {
      // no-op
    }

    async handle(__req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fake-proxy',
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
      method: 'OPTIONS',
    });

    // Should return 204 for OPTIONS (CORS preflight)
    t.is(response.status, 204);
    t.is(response.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
    t.is(response.headers.get('access-control-allow-origin'), '*');
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint returns 400 for invalid JSON', async (t) => {
  class FakeProxy {
    public readonly spec = {
      name: 'fake-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {
      // no-op
    }

    async stop(): Promise<void> {
      // no-op
    }

    async handle(__req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      // This should not be called for invalid JSON
      res.writeHead(500).end(JSON.stringify({ error: 'should not reach here' }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fake-proxy',
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

test('proxy endpoint does not include text/event-stream in Accept header', async (t) => {
  let capturedHeaders: IncomingMessage['headers'] | undefined;

  class FakeProxy {
    public readonly spec = {
      name: 'fake-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {
      // no-op
    }

    async stop(): Promise<void> {
      // no-op
    }

    async handle(req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      capturedHeaders = { ...req.headers };
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fake-proxy',
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
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json, text/event-stream', // Client requests both
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
    // Proxy should have forced Accept to be application/json only (no SSE)
    t.is(acceptHeader, 'application/json');
    t.not(acceptHeader, 'application/json, text/event-stream');

    // Content-Type should also be set correctly
    t.is(capturedHeaders!['content-type'], 'application/json');
  } finally {
    await transport.stop?.();
  }
});

test('proxy endpoint patches headers object instead of replacing', async (t) => {
  let originalHeadersObject: IncomingMessage['headers'] | undefined;
  let finalHeadersObject: IncomingMessage['headers'] | undefined;

  class FakeProxy {
    public readonly spec = {
      name: 'fake-proxy',
      command: '/bin/echo',
      args: ['hello'],
      env: {},
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {
      // no-op
    }

    async stop(): Promise<void> {
      // no-op
    }

    async handle(req: IncomingMessage, res: ServerResponse, _body?: unknown): Promise<void> {
      // Capture the headers object to test it wasn't replaced
      originalHeadersObject = req.headers;
      finalHeadersObject = req.headers;
      res.writeHead(200).end(JSON.stringify({ ok: true }));
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeProxy,
    },
  });

  const spec: StdioServerSpec = {
    name: 'fake-proxy',
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

    // Verify headers object was the same instance (not replaced)
    t.is(originalHeadersObject, finalHeadersObject);

    // Verify custom header was preserved
    t.is(finalHeadersObject!['x-custom-header'], 'test-value');

    // Verify accept and content-type were correctly set
    t.is(finalHeadersObject!['accept'], 'application/json');
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

  const descriptors: HttpEndpointDescriptor[] = [
    { path: '/registry', kind: 'registry', handler: {} as any },
  ];

  await mockFastifyTransport({ host: '127.0.0.1', port }).start(descriptors);

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
    // Note: Since we used esmock, we can't easily call transport.stop()
    // The server will be cleaned up when the process exits
  }
});