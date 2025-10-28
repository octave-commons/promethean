/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-imports */
import { createServer } from 'node:net';
import test from 'ava';
import esmock from 'esmock';
import { z } from 'zod';
import { fastifyTransport } from '../core/transports/fastify.js';
import { createMcpServer } from '../core/mcp-server.js';
const allocatePort = async () => new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => {
        server.close();
        reject(error);
    });
    server.listen(0, '127.0.0.1', () => {
        const address = server.address();
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
    const forwardedBodies = [];
    let httpStarts = 0;
    let httpStops = 0;
    let stdioStarts = 0;
    let stdioStops = 0;
    class FakeStreamableHTTPServerTransport {
        onmessage;
        constructor(_options) { }
        async start() {
            httpStarts += 1;
        }
        async handleRequest(_req, res, body) {
            forwardedBodies.push(body);
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        }
        async close() {
            httpStops += 1;
        }
        async send() {
            // no-op for tests
        }
    }
    class FakeStdioClientTransport {
        stderr = {
            on: (_event, _listener) => {
                // ignore stderr output in tests
            },
        };
        async start() {
            stdioStarts += 1;
        }
        async send() {
            // no-op for tests
        }
        async close() {
            stdioStops += 1;
        }
    }
    const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
    const { StdioHttpProxy } = await esmock(modulePath, {
        '@modelcontextprotocol/sdk/client/stdio.js': {
            StdioClientTransport: FakeStdioClientTransport,
        },
        '@modelcontextprotocol/sdk/server/streamableHttp.js': {
            StreamableHTTPServerTransport: FakeStreamableHTTPServerTransport,
        },
    });
    const spec = {
        name: 'fake-proxy',
        command: '/bin/echo',
        args: ['hello'],
        env: {},
        httpPath: '/proxy',
    };
    const proxy = new StdioHttpProxy(spec, () => { });
    const port = await allocatePort();
    const transport = fastifyTransport({ host: '127.0.0.1', port });
    const descriptors = [
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
        const parseForwardedBody = (forwarded) => {
            if (Buffer.isBuffer(forwarded)) {
                return JSON.parse(forwarded.toString('utf8'));
            }
            if (typeof forwarded === 'string') {
                return JSON.parse(forwarded);
            }
            return forwarded;
        };
        const parsedBodies = forwardedBodies.map(parseForwardedBody);
        const initializeRequest = parsedBodies.find((body) => {
            if (!body || typeof body !== 'object') {
                return false;
            }
            if (body.method !== 'initialize') {
                return false;
            }
            const params = body.params;
            if (!params || typeof params !== 'object') {
                return false;
            }
            const clientInfo = params.clientInfo;
            if (!clientInfo || typeof clientInfo !== 'object') {
                return false;
            }
            return clientInfo.name === 'promethean-mcp';
        });
        t.truthy(initializeRequest);
        const { params: initParams, ...initEnvelope } = initializeRequest ?? {};
        t.deepEqual(initEnvelope, { jsonrpc: '2.0', id: 1, method: 'initialize' });
        const { capabilities: initCaps, ...restInitParams } = (initParams ?? {});
        t.deepEqual(restInitParams, {
            protocolVersion: '2024-10-01',
            clientInfo: { name: 'promethean-mcp', version: 'dev' },
        });
        t.truthy(initCaps);
        const forwarded = forwardedBodies[0];
        const parsed = Buffer.isBuffer(forwarded)
            ? JSON.parse(forwarded.toString('utf8'))
            : typeof forwarded === 'string'
                ? JSON.parse(forwarded)
                : forwarded;
        const { params: forwardedParams, ...forwardedEnvelope } = (parsed ?? {});
        t.is(forwardedEnvelope.jsonrpc, '2.0');
        t.is(forwardedEnvelope.method, 'initialize');
        t.true(typeof forwardedEnvelope.id === 'number' || typeof forwardedEnvelope.id === 'string');
        const { capabilities: forwardedCaps, ...restForwardedParams } = (forwardedParams ??
            {});
        t.is(restForwardedParams.protocolVersion, '2024-10-01');
        const forwardedClient = restForwardedParams.clientInfo;
        t.truthy(forwardedClient);
        t.is(forwardedClient?.version, 'dev');
        t.is(forwardedClient?.name, 'promethean-proxy-actions');
        t.truthy(forwardedCaps);
        t.deepEqual(forwardedCaps, initCaps);
    }
    finally {
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
    }
    finally {
        await transport.stop?.();
    }
});
test('fastify registry exposes GPT action routes', async (t) => {
    const port = await allocatePort();
    const Schema = z.object({ message: z.string() }).strict();
    const tool = {
        spec: {
            name: 'test_echo',
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
    const descriptor = {
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
        t.truthy(openApi.paths['/actions/test_echo']);
        const listResponse = await fetch(`http://127.0.0.1:${port}/mcp/actions`);
        t.is(listResponse.status, 200);
        const listPayload = z
            .object({
            actions: z.array(z.object({
                name: z.string(),
                description: z.string(),
                stability: z.string(),
                since: z.string().nullable(),
            })),
        })
            .parse(await listResponse.json());
        t.true(listPayload.actions.length > 0);
        t.is(listPayload.actions[0]?.name, tool.spec.name);
        const actionResponse = await fetch(`http://127.0.0.1:${port}/mcp/actions/test_echo`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: 'world' }),
        });
        t.is(actionResponse.status, 200);
        const actionPayload = z.object({ echoed: z.string() }).parse(await actionResponse.json());
        t.deepEqual(actionPayload, { echoed: 'world' });
        const invalidResponse = await fetch(`http://127.0.0.1:${port}/mcp/actions/test_echo`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: 'not-json',
        });
        t.is(invalidResponse.status, 400);
        const invalidPayload = z
            .object({ error: z.string(), message: z.string() })
            .parse(await invalidResponse.json());
        t.is(invalidPayload.error, 'invalid_json');
    }
    finally {
        await transport.stop?.();
    }
});
test('proxied endpoints expose action routes and OpenAPI docs', async (t) => {
    const port = await allocatePort();
    const toProxyMessage = (body) => {
        if (!body || typeof body !== 'object') {
            return undefined;
        }
        const record = body;
        const idCandidate = record.id;
        const methodCandidate = record.method;
        const paramsCandidate = record.params;
        const id = typeof idCandidate === 'string' || typeof idCandidate === 'number' ? idCandidate : undefined;
        const method = typeof methodCandidate === 'string' ? methodCandidate : undefined;
        const params = paramsCandidate && typeof paramsCandidate === 'object'
            ? (() => {
                const paramsRecord = paramsCandidate;
                const argumentsCandidate = paramsRecord.arguments;
                const args = argumentsCandidate &&
                    typeof argumentsCandidate === 'object' &&
                    !Array.isArray(argumentsCandidate)
                    ? argumentsCandidate
                    : undefined;
                return args ? { arguments: args } : undefined;
            })()
            : undefined;
        return {
            ...(id !== undefined ? { id } : {}),
            ...(method ? { method } : {}),
            ...(params ? { params } : {}),
        };
    };
    class FakeProxy {
        spec = {
            name: 'proxy',
            command: '/bin/echo',
            args: [],
            env: {},
            httpPath: '/proxy',
        };
        async start() {
            // no-op
        }
        async stop() {
            // no-op
        }
        async handle(_req, res, body) {
            const message = toProxyMessage(body);
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.setHeader('mcp-session-id', 'proxy-session');
            const base = {
                jsonrpc: '2.0',
                id: message?.id ?? null,
            };
            if (message?.method === 'initialize') {
                res.end(JSON.stringify({
                    ...base,
                    result: {
                        protocolVersion: '2024-10-01',
                        capabilities: {},
                        serverInfo: { name: 'proxy', version: '1.0.0' },
                    },
                }));
                return;
            }
            if (message?.method === 'tools/list') {
                res.end(JSON.stringify({
                    ...base,
                    result: {
                        tools: [
                            {
                                name: 'proxy_echo',
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
                }));
                return;
            }
            if (message?.method === 'tools/call') {
                const textCandidate = message.params?.arguments?.text;
                const text = typeof textCandidate === 'string' ? textCandidate : null;
                res.end(JSON.stringify({
                    ...base,
                    result: { content: [], structuredContent: { echoed: text } },
                }));
                return;
            }
            res.end(JSON.stringify({
                ...base,
                error: { code: -32601, message: 'Unknown method' },
            }));
        }
    }
    const proxy = new FakeProxy();
    const descriptors = [
        { path: proxy.spec.httpPath, kind: 'proxy', handler: proxy },
    ];
    const transport = fastifyTransport({ host: '127.0.0.1', port });
    await transport.start(descriptors);
    try {
        const listResponse = await fetch(`http://127.0.0.1:${port}/proxy/actions`);
        t.is(listResponse.status, 200);
        const ListResponseSchema = z.object({
            actions: z.array(z.object({
                name: z.string(),
                description: z.string(),
                stability: z.string(),
                since: z.union([z.string(), z.null()]),
            })),
        });
        const listPayload = ListResponseSchema.parse(await listResponse.json());
        t.is(listPayload.actions[0]?.name, 'proxy_echo');
        const actionResponse = await fetch(`http://127.0.0.1:${port}/proxy/actions/proxy_echo`, {
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
        t.true(Object.prototype.hasOwnProperty.call(openApi.paths, '/actions/proxy_echo'));
    }
    finally {
        await transport.stop?.();
    }
});
//# sourceMappingURL=fastify-transport.integration.test.js.map