/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-imports */
import { createServer } from 'node:net';
import type { AddressInfo } from 'node:net';
import type { IncomingMessage, ServerResponse } from 'node:http';

import test from 'ava';
import esmock from 'esmock';
import { z } from 'zod';

import { fastifyTransport } from '../core/transports/fastify.js';
import type { HttpEndpointDescriptor } from '../core/transports/fastify.js';
import { createMcpServer } from '../core/mcp-server.js';
import type { StdioServerSpec } from '../proxy/config.js';
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

test('fastify transport forwards proxy requests', async (t) => {
  const forwardedBodies: unknown[] = [];
  let httpStarts = 0;
  let httpStops = 0;
  let stdioStarts = 0;
  let stdioStops = 0;

  class FakeStreamableHTTPServerTransport {
    public onmessage?: (message: unknown) => void | Promise<void>;

    constructor(_options?: unknown) {}

    async start(): Promise<void> {
      httpStarts += 1;
    }

    async handleRequest(_req: IncomingMessage, res: ServerResponse, body?: unknown): Promise<void> {
      forwardedBodies.push(body);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    }

    async close(): Promise<void> {
      httpStops += 1;
    }

    async send(): Promise<void> {
      // no-op for tests
    }
  }

  class FakeStdioClientTransport {
    public stderr = {
      on: (_event: string, _listener: (chunk: Buffer) => void) => {
        // ignore stderr output in tests
      },
    } as const;

    async start(): Promise<void> {
      stdioStarts += 1;
    }

    async send(): Promise<void> {
      // no-op for tests
    }

    async close(): Promise<void> {
      stdioStops += 1;
    }
  }

  const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
  const { StdioHttpProxy } = await esmock<typeof import('../proxy/stdio-proxy.js')>(modulePath, {
    '@modelcontextprotocol/sdk/client/stdio.js': {
      StdioClientTransport: FakeStdioClientTransport,
    },
    '@modelcontextprotocol/sdk/server/streamableHttp.js': {
      StreamableHTTPServerTransport: FakeStreamableHTTPServerTransport,
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
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {},
      }),
    });

    t.is(response.status, 200);
    const payload = await response.json();
    t.deepEqual(payload, { ok: true });
    t.is(httpStarts, 1);
    t.is(stdioStarts, 1);
    t.true(forwardedBodies.length >= 1);

    const parseForwardedBody = (forwarded: unknown): unknown => {
      if (Buffer.isBuffer(forwarded)) {
        return JSON.parse(forwarded.toString('utf8')) as unknown;
      }
      if (typeof forwarded === 'string') {
        return JSON.parse(forwarded) as unknown;
      }
      return forwarded;
    };

    const parsedBodies = forwardedBodies.map(parseForwardedBody);

    const initializeRequest = parsedBodies.find((body): body is Record<string, unknown> => {
      if (!body || typeof body !== 'object') {
        return false;
      }
      if ((body as { method?: unknown }).method !== 'initialize') {
        return false;
      }
      const params = (body as { params?: unknown }).params;
      if (!params || typeof params !== 'object') {
        return false;
      }
      const clientInfo = (params as { clientInfo?: unknown }).clientInfo;
      if (!clientInfo || typeof clientInfo !== 'object') {
        return false;
      }
      return (clientInfo as { name?: unknown }).name === 'promethean-mcp';
    });

    t.truthy(initializeRequest);
    t.deepEqual(initializeRequest, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-10-01',
        clientInfo: { name: 'promethean-mcp', version: 'dev' },
      },
    });

    const forwarded = forwardedBodies[0];
    const parsed = Buffer.isBuffer(forwarded)
      ? JSON.parse(forwarded.toString('utf8'))
      : typeof forwarded === 'string'
        ? JSON.parse(forwarded)
        : forwarded;
    t.deepEqual(parsed, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-10-01',
        clientInfo: { name: 'promethean-mcp', version: 'dev' },
      },
    });
  } finally {
    await transport.stop?.();
  }

  t.is(httpStops, 1);
  t.is(stdioStops, 1);
});

test('fastify registry accepts batched initialize request', async (t) => {
  const port = await allocatePort();
  const server = createMcpServer([]);
  const transport = fastifyTransport({ host: '127.0.0.1', port });

  await transport.start([{ path: '/mcp', kind: 'registry', handler: server }]);

  try {
    const response = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify([
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-10-01',
            clientInfo: { name: 'ava-test', version: '0.0.0' },
            capabilities: {},
          },
        },
      ]),
    });

    t.is(response.status, 200);
    t.truthy(response.headers.get('mcp-session-id'));
    await response.body?.cancel();
  } finally {
    await transport.stop?.();
  }
});

test('fastify registry exposes GPT action routes', async (t) => {
  const port = await allocatePort();
  const Schema = z.object({ message: z.string() }).strict();
  const tool: Tool = {
    spec: {
      name: 'test.echo',
      description: 'Echo a message back to the caller.',
      inputSchema: Schema.shape,
      stability: 'stable',
      since: '0.0.1',
      examples: [{ args: { message: 'hello' }, comment: 'Echo a greeting' }],
    },
    invoke: (raw) => {
      const { message } = Schema.parse(raw ?? {});
      return Promise.resolve({ echoed: message });
    },
  };

  const descriptor: HttpEndpointDescriptor = {
    path: '/mcp',
    kind: 'registry',
    handler: createMcpServer([tool]),
    tools: [tool],
    definition: { path: '/mcp', tools: [tool.spec.name] },
  };

  const transport = fastifyTransport({ host: '127.0.0.1', port });
  await transport.start([descriptor]);

  try {
    const openApiResponse = await fetch(`http://127.0.0.1:${port}/mcp/openapi.json`);
    t.is(openApiResponse.status, 200);
    const openApiSchema = z.object({
      openapi: z.string(),
      paths: z.record(z.unknown()),
    });
    const openApi = openApiSchema.parse(await openApiResponse.json());
    t.is(openApi.openapi, '3.1.0');
    t.truthy(openApi.paths['/actions/test.echo']);

    const listResponse = await fetch(`http://127.0.0.1:${port}/mcp/actions`);
    t.is(listResponse.status, 200);
    const listPayload = z
      .object({
        actions: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            stability: z.string(),
            since: z.string().nullable(),
          }),
        ),
      })
      .parse(await listResponse.json());
    t.true(listPayload.actions.length > 0);
    t.is(listPayload.actions[0]?.name, tool.spec.name);

    const actionResponse = await fetch(`http://127.0.0.1:${port}/mcp/actions/test.echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'world' }),
    });
    t.is(actionResponse.status, 200);
    const actionPayload = z.object({ echoed: z.string() }).parse(await actionResponse.json());
    t.deepEqual(actionPayload, { echoed: 'world' });

    const invalidResponse = await fetch(`http://127.0.0.1:${port}/mcp/actions/test.echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    t.is(invalidResponse.status, 400);
    const invalidPayload = z
      .object({ error: z.string(), message: z.string() })
      .parse(await invalidResponse.json());
    t.is(invalidPayload.error, 'invalid_json');
  } finally {
    await transport.stop?.();
  }
});

test('proxied endpoints expose action routes and OpenAPI docs', async (t) => {
  const port = await allocatePort();

  type ProxyMessageArguments = Readonly<{ text?: unknown }>;
  type ProxyMessage = Readonly<{
    id?: string | number;
    method?: string;
    params?: Readonly<{ arguments?: ProxyMessageArguments }>;
  }>;

  const toProxyMessage = (body: unknown): ProxyMessage | undefined => {
    if (!body || typeof body !== 'object') {
      return undefined;
    }

    const record = body as Record<string, unknown>;
    const idCandidate = record.id;
    const methodCandidate = record.method;
    const paramsCandidate = record.params;

    const id =
      typeof idCandidate === 'string' || typeof idCandidate === 'number' ? idCandidate : undefined;
    const method = typeof methodCandidate === 'string' ? methodCandidate : undefined;
    const params =
      paramsCandidate && typeof paramsCandidate === 'object'
        ? (() => {
            const paramsRecord = paramsCandidate as Record<string, unknown>;
            const argumentsCandidate = paramsRecord.arguments;
            const args =
              argumentsCandidate &&
              typeof argumentsCandidate === 'object' &&
              !Array.isArray(argumentsCandidate)
                ? (argumentsCandidate as ProxyMessageArguments)
                : undefined;
            return args ? ({ arguments: args } as const) : undefined;
          })()
        : undefined;

    return {
      ...(id !== undefined ? { id } : {}),
      ...(method ? { method } : {}),
      ...(params ? { params } : {}),
    };
  };

  class FakeProxy {
    public readonly spec = {
      name: 'proxy',
      command: '/bin/echo',
      args: [] as const,
      env: {} as const,
      httpPath: '/proxy',
    } as const;

    async start(): Promise<void> {
      // no-op
    }

    async stop(): Promise<void> {
      // no-op
    }

    async handle(_req: IncomingMessage, res: ServerResponse, body?: unknown): Promise<void> {
      const message = toProxyMessage(body);
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.setHeader('mcp-session-id', 'proxy-session');

      const base: Readonly<{ jsonrpc: '2.0'; id: string | number | null }> = {
        jsonrpc: '2.0',
        id: message?.id ?? null,
      };

      if (message?.method === 'initialize') {
        res.end(
          JSON.stringify({
            ...base,
            result: {
              protocolVersion: '2024-10-01',
              capabilities: {},
              serverInfo: { name: 'proxy', version: '1.0.0' },
            },
          }),
        );
        return;
      }

      if (message?.method === 'tools/list') {
        res.end(
          JSON.stringify({
            ...base,
            result: {
              tools: [
                {
                  name: 'proxy.echo',
                  description: 'Echo via proxy.',
                  inputSchema: {
                    type: 'object',
                    properties: { text: { type: 'string' } },
                    required: ['text'],
                  },
                },
              ],
              nextCursor: null,
            },
          }),
        );
        return;
      }

      if (message?.method === 'tools/call') {
        const textCandidate = message.params?.arguments?.text;
        const text = typeof textCandidate === 'string' ? textCandidate : null;
        res.end(
          JSON.stringify({
            ...base,
            result: { content: [], structuredContent: { echoed: text } },
          }),
        );
        return;
      }

      res.end(
        JSON.stringify({
          ...base,
          error: { code: -32601, message: 'Unknown method' },
        }),
      );
    }
  }

  const proxy = new FakeProxy();
  const descriptors: HttpEndpointDescriptor[] = [
    { path: proxy.spec.httpPath, kind: 'proxy', handler: proxy },
  ];

  const transport = fastifyTransport({ host: '127.0.0.1', port });
  await transport.start(descriptors);

  try {
    const listResponse = await fetch(`http://127.0.0.1:${port}/proxy/actions`);
    t.is(listResponse.status, 200);
    const ListResponseSchema = z.object({
      actions: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          stability: z.string(),
          since: z.union([z.string(), z.null()]),
        }),
      ),
    });
    const listPayload = ListResponseSchema.parse(await listResponse.json());
    t.is(listPayload.actions[0]?.name, 'proxy.echo');

    const actionResponse = await fetch(`http://127.0.0.1:${port}/proxy/actions/proxy.echo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
    t.is(actionResponse.status, 200);
    const ActionPayloadSchema = z.object({ echoed: z.union([z.string(), z.null()]) });
    const actionPayload = ActionPayloadSchema.parse(await actionResponse.json());
    t.deepEqual(actionPayload, { echoed: 'hello' });

    const openApiResponse = await fetch(`http://127.0.0.1:${port}/proxy/openapi.json`);
    t.is(openApiResponse.status, 200);
    const OpenApiSchema = z.object({
      servers: z.array(z.object({ url: z.string() })),
      paths: z.record(z.unknown()),
    });
    const openApi = OpenApiSchema.parse(await openApiResponse.json());
    t.is(openApi.servers[0]?.url, `http://127.0.0.1:${port}/proxy`);
    t.true(Object.prototype.hasOwnProperty.call(openApi.paths, '/actions/proxy.echo'));
  } finally {
    await transport.stop?.();
  }
});
