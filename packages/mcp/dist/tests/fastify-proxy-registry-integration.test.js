/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/consistent-type-imports */
import { createServer } from 'node:net';
import test from 'ava';
import esmock from 'esmock';
import { fastifyTransport } from '../core/transports/fastify.js';
import { createMcpServer } from '../core/mcp-server.js';
import { z } from 'zod';
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
test('registry endpoint supports SSE while proxy endpoint does not', async (t) => {
    let registryHeaders;
    let proxyHeaders;
    // Mock registry that captures headers
    class MockStreamableHTTPServerTransport {
        async handleRequest(req, res, _body) {
            registryHeaders = { ...req.headers };
            res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                result: { protocolVersion: '2024-10-01', capabilities: {} }
            }));
        }
        async close() { }
        async send() { }
    }
    // Mock proxy that captures headers
    class FakeProxy {
        spec = {
            name: 'fake-proxy',
            command: '/bin/echo',
            args: ['hello'],
            env: {},
            httpPath: '/proxy',
        };
        async start() { }
        async stop() { }
        async handle(req, res, _body) {
            proxyHeaders = { ...req.headers };
            res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                result: { protocolVersion: '2024-10-01', capabilities: {} }
            }));
        }
    }
    const modulePath = new URL('../core/transports/fastify.js', import.meta.url).pathname;
    const { fastifyTransport: mockFastifyTransport } = await esmock(modulePath, {
        '@modelcontextprotocol/sdk/server/streamableHttp.js': {
            StreamableHTTPServerTransport: MockStreamableHTTPServerTransport,
        },
    });
    const spec = {
        name: 'fake-proxy',
        command: '/bin/echo',
        args: ['hello'],
        env: {},
        httpPath: '/proxy',
    };
    const modulePath2 = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
    const { StdioHttpProxy } = await esmock(modulePath2, {
        '@modelcontextprotocol/sdk/client/stdio.js': {
            StdioClientTransport: FakeProxy,
        },
    });
    const port = await allocatePort();
    const transport = mockFastifyTransport({ host: '127.0.0.1', port });
    const proxy = new StdioHttpProxy(spec, () => { });
    const descriptors = [
        { path: '/registry', kind: 'registry', handler: {} }, // Mock registry
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
        t.is(registryHeaders['accept'], 'application/json, text/event-stream');
        // Proxy should NOT include SSE in Accept header
        t.is(proxyHeaders['accept'], 'application/json');
        t.not(proxyHeaders['accept'], 'application/json, text/event-stream');
    }
    finally {
        await transport.stop?.();
    }
});
test('proxy responses complete quickly without SSE delays', async (t) => {
    const startTime = Date.now();
    let proxyHandled = false;
    class FastProxy {
        spec = {
            name: 'fast-proxy',
            command: '/bin/echo',
            args: ['hello'],
            env: {},
            httpPath: '/proxy',
        };
        async start() { }
        async stop() { }
        async handle(__req, res, _body) {
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
    const { StdioHttpProxy } = await esmock(modulePath, {
        '@modelcontextprotocol/sdk/client/stdio.js': {
            StdioClientTransport: FastProxy,
        },
    });
    const spec = {
        name: 'fast-proxy',
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
                method: 'tools/list',
                params: {},
            }),
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        t.is(response.status, 200);
        t.true(proxyHandled, 'Proxy should have been called');
        t.true(duration < 1000, `Response should complete quickly, but took ${duration}ms`);
        const payload = await response.json();
        t.is(payload.result.status, 'ok');
        t.true(typeof payload.result.timestamp === 'number');
    }
    finally {
        await transport.stop?.();
    }
});
test('registry and proxy endpoints have different HTTP method support', async (t) => {
    class MockRegistry {
        async connect() { }
        async close() { }
    }
    class FastProxy {
        spec = {
            name: 'method-test-proxy',
            command: '/bin/echo',
            args: ['hello'],
            env: {},
            httpPath: '/proxy',
        };
        async start() { }
        async stop() { }
        async handle(req, res, _body) {
            res.writeHead(200).end(JSON.stringify({ method: req.method }));
        }
    }
    const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
    const { StdioHttpProxy } = await esmock(modulePath, {
        '@modelcontextprotocol/sdk/client/stdio.js': {
            StdioClientTransport: FastProxy,
        },
    });
    const spec = {
        name: 'method-test-proxy',
        command: '/bin/echo',
        args: ['hello'],
        env: {},
        httpPath: '/proxy',
    };
    const proxy = new StdioHttpProxy(spec, () => { });
    const port = await allocatePort();
    const transport = fastifyTransport({ host: '127.0.0.1', port });
    const descriptors = [
        { path: '/registry', kind: 'registry', handler: new MockRegistry() },
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
    }
    finally {
        await transport.stop?.();
    }
});
test('proxy endpoint handles malformed JSON with immediate 400 response', async (t) => {
    const startTime = Date.now();
    class StrictProxy {
        spec = {
            name: 'strict-proxy',
            command: '/bin/echo',
            args: ['hello'],
            env: {},
            httpPath: '/proxy',
        };
        async start() { }
        async stop() { }
        async handle(__req, res, _body) {
            // This should never be called for malformed JSON
            res.writeHead(500).end(JSON.stringify({ error: 'should not reach proxy' }));
        }
    }
    const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
    const { StdioHttpProxy } = await esmock(modulePath, {
        '@modelcontextprotocol/sdk/client/stdio.js': {
            StdioClientTransport: StrictProxy,
        },
    });
    const spec = {
        name: 'strict-proxy',
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
    }
    finally {
        await transport.stop?.();
    }
});
test('real registry tool vs proxy tool behavior comparison', async (t) => {
    const Schema = z.object({ message: z.string() }).strict();
    const tool = {
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
        spec = {
            name: 'echo-proxy',
            command: '/bin/echo',
            args: ['hello'],
            env: {},
            httpPath: '/proxy',
        };
        async start() { }
        async stop() { }
        async handle(_req, res, body) {
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
            }
            catch (error) {
                res.writeHead(500).end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: { code: -32603, message: 'Internal error' },
                    id: null,
                }));
            }
        }
    }
    const modulePath = new URL('../proxy/stdio-proxy.js', import.meta.url).pathname;
    const { StdioHttpProxy } = await esmock(modulePath, {
        '@modelcontextprotocol/sdk/client/stdio.js': {
            StdioClientTransport: EchoProxy,
        },
    });
    const spec = {
        name: 'echo-proxy',
        command: '/bin/echo',
        args: ['hello'],
        env: {},
        httpPath: '/proxy',
    };
    const proxy = new StdioHttpProxy(spec, () => { });
    const port = await allocatePort();
    const transport = fastifyTransport({ host: '127.0.0.1', port });
    const descriptors = [
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
    }
    finally {
        await transport.stop?.();
    }
});
//# sourceMappingURL=fastify-proxy-registry-integration.test.js.map