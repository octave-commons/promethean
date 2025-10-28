import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
// Import security middleware
import { createSecurityMiddleware } from '../../security/index.js';
// Import OAuth integration
import { createOAuthFastifyIntegration, } from '../../auth/fastify-integration.js';
import { AuthenticationManager } from '../../core/authentication.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { CompatibilityCallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { CONFIG_FILE_NAME, ConfigSchema, resolveConfigPath, saveConfigFile, } from '../../config/load-config.js';
import { renderUiPage } from '../../http/ui-page.js';
import { resolveHttpEndpoints } from '../resolve-config.js';
import { createEndpointOpenApiDocument, isZodValidationError, toolToActionDefinition, } from '../openapi.js';
import { createSessionIdGenerator } from './session-id.js';
const isObject = (value) => typeof value === 'object' && value !== null;
const hasToolShape = (candidate) => isObject(candidate) &&
    'spec' in candidate &&
    isObject(candidate.spec) &&
    typeof candidate.spec.name === 'string';
const hasFunctionProperty = (value, key) => typeof value[key] === 'function';
const isMcpServerHandler = (value) => isObject(value) && hasFunctionProperty(value, 'connect');
const isProxyLifecycleHandler = (value) => isObject(value) &&
    hasFunctionProperty(value, 'start') &&
    hasFunctionProperty(value, 'stop') &&
    hasFunctionProperty(value, 'handle');
const isToolArray = (value) => Array.isArray(value) && value.every((candidate) => hasToolShape(candidate));
const isEndpointDefinitionValue = (value) => isObject(value) &&
    typeof value.path === 'string' &&
    Array.isArray(value.tools) &&
    value.tools.every((tool) => typeof tool === 'string');
const clampText = (value, maxLength = 300) => {
    if (!value)
        return undefined;
    if (value.length <= maxLength)
        return value;
    const truncated = value.slice(0, maxLength).trimEnd();
    return `${truncated.replace(/[.!,;:?]*$/, '')}…`;
};
const toEntries = (input) => {
    if (!input)
        return [];
    if (input instanceof Map) {
        return Array.from(input.entries());
    }
    if (isObject(input) && 'connect' in input && typeof input.connect === 'function') {
        return [['/mcp', input]];
    }
    if (isObject(input)) {
        return Object.entries(input);
    }
    return [['/mcp', input]];
};
const stripTrailingSlash = (value) => value.endsWith('/') ? value.slice(0, -1) : value;
const parseAllowedOrigins = (input) => typeof input === 'string'
    ? input
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    : [];
const isOriginAllowed = (origin, allowed) => {
    const normalized = stripTrailingSlash(origin);
    return allowed.some((candidate) => {
        const normalizedCandidate = stripTrailingSlash(candidate);
        return candidate === origin || normalizedCandidate === normalized;
    });
};
const delay = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
const consoleAllowedOrigins = parseAllowedOrigins(process.env.MCP_CONSOLE_ORIGIN);
const descriptorsFromEntries = (entries) => entries.map(([route, handler]) => ({
    path: route,
    kind: 'registry',
    handler,
}));
const normalizePath = (p) => (p.startsWith('/') ? p : `/${p}`);
const tryParseJson = (body) => {
    if (Buffer.isBuffer(body)) {
        try {
            return JSON.parse(body.toString('utf8'));
        }
        catch {
            return undefined;
        }
    }
    if (typeof body === 'string' && body.length > 0) {
        try {
            return JSON.parse(body);
        }
        catch {
            return undefined;
        }
    }
    return body;
};
const mustParseJson = (body) => {
    if (body === undefined || body === null)
        return undefined;
    if (Buffer.isBuffer(body)) {
        return JSON.parse(body.toString('utf8'));
    }
    if (typeof body === 'string') {
        return body.length === 0 ? undefined : JSON.parse(body);
    }
    return body;
};
const parseStartOptions = (input) => {
    if (!input)
        return { proxies: [] };
    if (Array.isArray(input)) {
        return { proxies: input };
    }
    if (isObject(input)) {
        const proxiesInput = input['proxies'];
        const uiInput = input['ui'];
        const proxies = Array.isArray(proxiesInput) ? proxiesInput : [];
        const uiOptions = isObject(uiInput) ? uiInput : undefined;
        return { proxies, ui: uiOptions };
    }
    return { proxies: [] };
};
const ensureEndpointDescriptors = (input) => {
    if (!Array.isArray(input))
        return [];
    return input.map((value, index) => {
        if (!value || typeof value !== 'object') {
            throw new Error(`fastifyTransport endpoint[${index}] must be an object descriptor`);
        }
        const descriptor = value;
        if (typeof descriptor.path !== 'string' || descriptor.path.trim() === '') {
            throw new Error(`fastifyTransport endpoint[${index}] must provide a non-empty path`);
        }
        if (descriptor.kind === 'registry') {
            if (!isMcpServerHandler(descriptor.handler)) {
                throw new Error(`fastifyTransport registry endpoint[${index}] must supply a McpServer handler`);
            }
            const toolsCandidate = descriptor.tools;
            const tools = isToolArray(toolsCandidate) ? toolsCandidate : undefined;
            const definitionCandidate = descriptor.definition;
            const definition = isEndpointDefinitionValue(definitionCandidate)
                ? definitionCandidate
                : undefined;
            const result = {
                path: descriptor.path,
                kind: 'registry',
                handler: descriptor.handler,
                ...(tools ? { tools } : {}),
                ...(definition ? { definition } : {}),
            };
            return result;
        }
        if (descriptor.kind === 'proxy') {
            if (!isProxyLifecycleHandler(descriptor.handler)) {
                throw new Error(`fastifyTransport proxy endpoint[${index}] must supply a valid StdioHttpProxy`);
            }
            const result = {
                path: descriptor.path,
                kind: 'proxy',
                handler: descriptor.handler,
            };
            return result;
        }
        throw new Error(`fastifyTransport endpoint[${index}] must declare kind "registry" or "proxy"`);
    });
};
const normalizeServerInput = (server) => {
    if (Array.isArray(server)) {
        return ensureEndpointDescriptors(server);
    }
    const entries = toEntries(server);
    if (entries.length === 0) {
        return [];
    }
    return ensureEndpointDescriptors(descriptorsFromEntries(entries));
};
const ensureInitializeDefaults = (value) => {
    const normalize = (message) => {
        if (!message || typeof message !== 'object' || Array.isArray(message)) {
            return message;
        }
        const candidate = message;
        if (candidate.method !== 'initialize') {
            return candidate;
        }
        const paramsSource = typeof candidate.params === 'object' && candidate.params !== null
            ? candidate.params
            : {};
        const protocolVersion = typeof paramsSource['protocolVersion'] === 'string' &&
            paramsSource['protocolVersion'].length > 0
            ? paramsSource['protocolVersion']
            : '2024-10-01';
        const clientInfo = typeof paramsSource['clientInfo'] === 'object' && paramsSource['clientInfo'] !== null
            ? paramsSource['clientInfo']
            : { name: 'promethean-mcp', version: 'dev' };
        const capabilities = typeof paramsSource['capabilities'] === 'object' && paramsSource['capabilities'] !== null
            ? paramsSource['capabilities']
            : {};
        const params = {
            ...paramsSource,
            protocolVersion,
            clientInfo,
            capabilities,
        };
        return {
            jsonrpc: '2.0',
            ...candidate,
            params,
        };
    };
    if (Array.isArray(value)) {
        return value.map((item) => normalize(item));
    }
    return normalize(value);
};
const hasInitializeRequest = (payload) => {
    if (!payload) {
        return false;
    }
    if (Array.isArray(payload)) {
        return payload.some((entry) => hasInitializeRequest(entry));
    }
    if (typeof payload !== 'object') {
        return false;
    }
    return isInitializeRequest(payload);
};
const ROUTE_METHODS = ['POST', 'GET', 'DELETE'];
const PROXY_METHODS = ['POST', 'GET'];
const ensureAcceptHeader = (headers, includeSse = true) => {
    const current = headers['accept'];
    if (typeof current === 'string') {
        if (includeSse &&
            current.includes('application/json') &&
            current.includes('text/event-stream')) {
            return current;
        }
        if (!includeSse && current.includes('application/json')) {
            return current;
        }
    }
    if (Array.isArray(current)) {
        const joined = current.join(',');
        if (includeSse && joined.includes('application/json') && joined.includes('text/event-stream')) {
            return joined;
        }
        if (!includeSse && joined.includes('application/json')) {
            return joined;
        }
    }
    return includeSse ? 'application/json, text/event-stream' : 'application/json';
};
const withHeaders = (rawReq, nextHeaders) => {
    /* eslint-disable functional/immutable-data */
    Object.defineProperty(rawReq, 'headers', {
        value: nextHeaders,
        writable: true,
        configurable: true,
    });
    /* eslint-enable functional/immutable-data */
    return rawReq;
};
const createProxyHandler = (proxy) => {
    return async function handler(request, reply) {
        const rawReq = request.raw;
        const rawRes = reply.raw;
        // Handle GET requests for health checks and discovery
        if (request.method === 'GET') {
            // Check if proxy has any initialization issues
            const isHealthy = true; // TODO: Add actual health check
            const status = isHealthy ? 'ready' : 'initializing';
            rawRes
                .writeHead(200, {
                'content-type': 'application/json',
                'access-control-allow-origin': '*',
            })
                .end(JSON.stringify({
                name: proxy.spec.name,
                status,
                type: 'stdio-proxy',
                httpPath: proxy.spec.httpPath,
                message: isHealthy
                    ? 'Proxy server is running. Use POST for JSON-RPC requests.'
                    : 'Proxy server is initializing. Please wait before making POST requests.',
            }));
            return;
        }
        reply.hijack();
        // For proxy endpoints: Accept JSON only (no SSE)
        const acceptHeader = ensureAcceptHeader(rawReq.headers, false);
        // Patch specific header keys only, don't replace the object
        // eslint-disable-next-line functional/immutable-data
        rawReq.headers['accept'] = acceptHeader;
        // eslint-disable-next-line functional/immutable-data
        rawReq.headers['content-type'] = rawReq.headers['content-type'] ?? 'application/json';
        // Strict JSON parsing - fail fast on invalid JSON
        let normalizedBody;
        try {
            normalizedBody = ensureInitializeDefaults(mustParseJson(request.body));
        }
        catch {
            rawRes.writeHead(400).end(JSON.stringify({
                jsonrpc: '2.0',
                error: { code: -32700, message: 'Parse error' },
                id: null,
            }));
            return;
        }
        try {
            await proxy.handle(rawReq, rawRes, normalizedBody);
        }
        catch (error) {
            if (!rawRes.headersSent) {
                rawRes.writeHead(500).end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Proxy request failed',
                        data: String(error?.message ?? error),
                    },
                    id: null,
                }));
            }
        }
    };
};
const createRouteHandler = (server, sessions) => {
    return async function handler(request, reply) {
        reply.hijack();
        const rawReq = request.raw;
        const rawRes = reply.raw;
        const normalizedHeaders = {
            ...rawReq.headers,
            accept: ensureAcceptHeader(rawReq.headers),
            'content-type': rawReq.headers['content-type'] ?? 'application/json',
        };
        try {
            const body = tryParseJson(request.body);
            const normalizedBody = ensureInitializeDefaults(body);
            const sidHeader = rawReq.headers['mcp-session-id'];
            const isInitialization = hasInitializeRequest(normalizedBody);
            const transport = sidHeader
                ? sessions.get(sidHeader)
                : await (async () => {
                    if (!isInitialization) {
                        return undefined;
                    }
                    const sessionTransport = new StreamableHTTPServerTransport({
                        sessionIdGenerator: createSessionIdGenerator(crypto),
                        onsessioninitialized: (sid) => {
                            /* eslint-disable functional/immutable-data */
                            sessions.set(sid, sessionTransport);
                            /* eslint-enable functional/immutable-data */
                        },
                    });
                    /* eslint-disable-next-line functional/immutable-data */
                    sessionTransport.onclose = () => {
                        if (sessionTransport.sessionId) {
                            /* eslint-disable-next-line functional/immutable-data */
                            sessions.delete(sessionTransport.sessionId);
                        }
                    };
                    await server.connect(sessionTransport);
                    return sessionTransport;
                })();
            if (!transport) {
                rawRes.writeHead(400).end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: null,
                }));
                return;
            }
            await transport.handleRequest(withHeaders(rawReq, normalizedHeaders), rawRes, normalizedBody);
        }
        catch (error) {
            if (!rawRes.headersSent) {
                rawRes.writeHead(400).end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32700,
                        message: 'Parse error',
                        data: String(error?.message ?? error),
                    },
                    id: null,
                }));
            }
        }
    };
};
const createUiState = (options, proxies) => ({
    config: options.config,
    configSource: options.configSource,
    configPath: options.configPath,
    httpEndpoints: options.httpEndpoints,
    availableTools: options.availableTools,
    proxies: proxies.map((descriptor) => ({
        name: descriptor.handler.spec.name,
        httpPath: descriptor.path,
    })),
});
const respond = (reply, status, payload) => {
    reply.status(status).header('content-type', 'application/json').send(payload);
};
const respondWithCors = (reply, status, payload) => {
    reply
        .status(status)
        .header('content-type', 'application/json')
        .header('access-control-allow-origin', '*')
        .send(payload);
};
export const fastifyTransport = (opts) => {
    const port = opts?.port ?? Number(process.env.PORT ?? 3210);
    const host = opts?.host ?? process.env.HOST ?? '0.0.0.0';
    const isVerboseLogging = process.env.MCP_VERBOSE_LOGGING === 'true' || process.env.MCP_DEBUG === 'true';
    const app = Fastify({ logger: false });
    // Test each security component individually by disabling them one by one
    console.log(`🧪 TESTING: Starting with NO security middleware to establish baseline`);
    // Add diagnostic logging to track request flow
    app.addHook('onRequest', async (request, _reply) => {
        console.log(`🔍 REQUEST: ${request.method} ${request.url} at ${new Date().toISOString()}`);
    });
    // Initialize security middleware but DON'T register it yet
    const securityMiddleware = createSecurityMiddleware({
        enableSecurityHeaders: false, // Disable headers first
        enableAuditLog: false, // Disable audit logging to avoid conflicts
        allowedOrigins: ['*'], // Configure based on your needs
        rateLimitMaxRequests: 10000, // Much higher limit
        rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
        globalRateLimitMaxPerMinute: 10000, // Much higher limit
        globalRateLimitMaxPerHour: 100000, // Much higher limit
    });
    // We'll register security middleware step by step to identify the problematic hook
    console.log(`🧪 TESTING: Security middleware created but NOT registered yet`);
    console.log(`🧪 TESTING: Test baseline first, then we'll add security hooks one by one`);
    // Add comprehensive request logging middleware
    if (isVerboseLogging) {
        app.addHook('onRequest', async (request, _reply) => {
            const timestamp = new Date().toISOString();
            const requestId = Math.random().toString(36).substr(2, 9);
            // Store request metadata for response logging
            request.requestId = requestId;
            request.requestStartTime = Date.now();
            console.log(`\n🔍 [${timestamp}] [${requestId}] INCOMING REQUEST`);
            console.log(`   Method: ${request.method}`);
            console.log(`   URL: ${request.url}`);
            console.log(`   Headers:`, JSON.stringify(request.headers, null, 2));
            console.log(`   Query:`, JSON.stringify(request.query, null, 2));
            // For POST requests, try to get the raw body before it's fully parsed
            if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
                // Store raw body reference for later logging
                request.rawBodyForLogging = request.body;
            }
            console.log(`   Remote IP: ${request.ip}`);
            console.log(`   User-Agent: ${request.headers['user-agent'] || '<unknown>'}`);
        });
        // Add a hook after body parsing to log the actual body content
        app.addHook('preHandler', async (request, _reply) => {
            const requestId = request.requestId;
            if (!requestId)
                return;
            // Log body for POST/PUT requests after parsing (be careful with sensitive data)
            if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
                try {
                    const body = request.body;
                    if (body) {
                        if (Buffer.isBuffer(body)) {
                            const bodyStr = body.toString('utf8');
                            // Truncate large bodies
                            const displayBody = bodyStr.length > 500 ? bodyStr.substring(0, 500) + '...' : bodyStr;
                            console.log(`   Body (${body.length} bytes):`, displayBody);
                        }
                        else if (typeof body === 'string') {
                            const displayBody = body.length > 500 ? body.substring(0, 500) + '...' : body;
                            console.log(`   Body (${body.length} chars):`, displayBody);
                        }
                        else {
                            console.log(`   Body:`, JSON.stringify(body, null, 2));
                        }
                    }
                    else {
                        console.log(`   Body: <empty>`);
                    }
                }
                catch (error) {
                    console.log(`   Body: <could not parse body: ${error.message}>`);
                }
            }
        });
        app.addHook('onResponse', async (request, reply) => {
            const requestId = request.requestId;
            const startTime = request.requestStartTime;
            const duration = startTime ? Date.now() - startTime : 'unknown';
            const timestamp = new Date().toISOString();
            console.log(`\n📤 [${timestamp}] [${requestId}] RESPONSE`);
            console.log(`   Status: ${reply.statusCode}`);
            console.log(`   Duration: ${duration}ms`);
            console.log(`   Response Headers:`, JSON.stringify(reply.getHeaders(), null, 2));
            // Log response body for successful requests (sample only)
            const contentType = reply.getHeader('content-type');
            if (reply.statusCode < 300 &&
                typeof contentType === 'string' &&
                contentType.includes('application/json')) {
                try {
                    // We can't easily access the response body here without buffering
                    // but we can note that a JSON response was sent
                    console.log(`   Response: JSON response sent`);
                }
                catch (error) {
                    console.log(`   Response: <could not parse response: ${error.message}>`);
                }
            }
            console.log(`═══════════════════════════════════════════════════════════════`);
        });
        app.addHook('onError', async (request, _reply, error) => {
            const requestId = request.requestId;
            const timestamp = new Date().toISOString();
            console.log(`\n❌ [${timestamp}] [${requestId}] ERROR`);
            console.log(`   Error: ${error.message}`);
            console.log(`   Stack: ${error.stack}`);
            console.log(`═══════════════════════════════════════════════════════════════`);
        });
    }
    app.removeAllContentTypeParsers();
    app.addContentTypeParser(['application/json', 'application/*+json'], { parseAs: 'buffer' }, (_req, payload, done) => done(null, payload));
    app.addContentTypeParser('*', { parseAs: 'buffer' }, (_req, payload, done) => done(null, payload));
    app.get('/healthz', (_req, rep) => rep.send({ ok: true }));
    // Security endpoints
    app.get('/security/stats', (_req, reply) => {
        const stats = securityMiddleware.getSecurityStats();
        respondWithCors(reply, 200, {
            ...stats,
            timestamp: new Date().toISOString(),
        });
    });
    app.get('/security/audit-log', (req, reply) => {
        const query = req.query;
        const options = {
            limit: query.limit ? parseInt(query.limit, 10) : 100,
            clientIp: query.clientIp,
            onlyViolations: query.onlyViolations === 'true',
        };
        if (query.startTime) {
            options.startTime = new Date(query.startTime);
        }
        if (query.endTime) {
            options.endTime = new Date(query.endTime);
        }
        const auditLog = securityMiddleware.getAuditLog(options);
        respondWithCors(reply, 200, {
            entries: auditLog,
            total: auditLog.length,
            timestamp: new Date().toISOString(),
        });
    });
    const sessionStores = new Map();
    const activeProxies = [];
    // Initialize OAuth integration
    const authManager = new AuthenticationManager();
    let oauthIntegration;
    return {
        start: async (server, optionsInput) => {
            const descriptorsFromServer = normalizeServerInput(server);
            const { proxies: proxyList, ui } = parseStartOptions(optionsInput);
            const devUiDir = path.resolve(process.cwd(), 'packages/mcp/static/dev-ui');
            if (fs.existsSync(devUiDir)) {
                await app.register(fastifyStatic, {
                    root: devUiDir,
                    prefix: '/ui/assets/',
                    decorateReply: false,
                });
            }
            else {
                console.warn(`[mcp:http] dev-ui assets not found at ${devUiDir}. ` +
                    "Run 'pnpm --filter @promethean-os/mcp-dev-ui build' to generate the bundle.");
            }
            // Initialize OAuth integration if enabled
            try {
                oauthIntegration = createOAuthFastifyIntegration(authManager);
                await oauthIntegration.initialize(app, {
                    enableOAuth: process.env.OAUTH_ENABLED === 'true' || process.env.MCP_OAUTH_ENABLED === 'true',
                    configPath: process.env.OAUTH_CONFIG_PATH,
                    cookieDomain: process.env.OAUTH_COOKIE_DOMAIN,
                    secureCookies: process.env.OAUTH_SECURE_COOKIES === 'true',
                    sameSitePolicy: process.env.OAUTH_SAME_SITE_POLICY || 'strict',
                });
                console.log('[mcp:http] OAuth integration initialized successfully');
            }
            catch (error) {
                console.warn('[mcp:http] OAuth integration failed to initialize:', error);
                console.log('[mcp:http] Continuing without OAuth authentication');
            }
            const combinedDescriptors = [
                ...descriptorsFromServer,
                ...proxyList.map((proxy) => ({
                    path: proxy.spec.httpPath,
                    kind: 'proxy',
                    handler: proxy,
                })),
            ];
            if (combinedDescriptors.length === 0) {
                throw new Error('fastifyTransport requires at least one MCP server or proxy');
            }
            /* eslint-disable functional/immutable-data */
            sessionStores.clear();
            /* eslint-enable functional/immutable-data */
            const normalized = combinedDescriptors.map((descriptor) => ({
                ...descriptor,
                path: normalizePath(descriptor.path),
            }));
            const seenRoutes = new Set();
            for (const descriptor of normalized) {
                if (seenRoutes.has(descriptor.path)) {
                    throw new Error(`Duplicate MCP endpoint path: ${descriptor.path}`);
                }
                /* eslint-disable functional/immutable-data */
                seenRoutes.add(descriptor.path);
                /* eslint-enable functional/immutable-data */
            }
            const proxyDescriptors = normalized.filter((descriptor) => descriptor.kind === 'proxy');
            const proxiesForUi = proxyDescriptors.map((descriptor) => ({
                handler: descriptor.handler,
                path: descriptor.path,
            }));
            // eslint-disable-next-line functional/no-let
            let uiOptions = ui
                ? {
                    ...ui,
                    configPath: (() => {
                        try {
                            return resolveConfigPath(ui.configPath);
                        }
                        catch {
                            return path.isAbsolute(ui.configPath)
                                ? path.normalize(ui.configPath)
                                : path.resolve(process.cwd(), ui.configPath);
                        }
                    })(),
                }
                : undefined;
            const registerOptionsRoute = (url, methods) => {
                app.options(url, (request, reply) => {
                    const requestedHeaders = request.headers['access-control-request-headers'];
                    const allowHeaders = Array.isArray(requestedHeaders)
                        ? requestedHeaders.join(',')
                        : typeof requestedHeaders === 'string'
                            ? requestedHeaders
                            : '';
                    reply
                        .status(204)
                        .header('allow', [...methods, 'OPTIONS'].join(','))
                        .header('access-control-allow-methods', [...methods, 'OPTIONS'].join(','))
                        .header('access-control-allow-headers', allowHeaders)
                        .header('access-control-allow-origin', '*')
                        .send();
                });
            };
            const registerRoute = (url, handler, methods = ROUTE_METHODS) => {
                for (const method of methods) {
                    app.route({ method: method, url, handler });
                }
                registerOptionsRoute(url, methods);
            };
            const headerValue = (value) => {
                if (typeof value === 'string') {
                    return value;
                }
                if (Array.isArray(value)) {
                    const first = value.find((entry) => typeof entry === 'string');
                    return first;
                }
                return undefined;
            };
            const forwardedHeaderValue = (value) => {
                const raw = headerValue(value);
                if (!raw)
                    return undefined;
                const [first] = raw.split(',');
                return first?.trim();
            };
            const resolveServerUrl = (request, basePath) => {
                const baseUrl = process.env.BASE_ACTION_URL?.trim();
                if (baseUrl && baseUrl.length > 0) {
                    const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    return `${normalized}${basePath}`;
                }
                const protocol = forwardedHeaderValue(request.headers['x-forwarded-proto']) ?? request.protocol ?? 'http';
                const hostHeader = forwardedHeaderValue(request.headers['x-forwarded-host']) ??
                    headerValue(request.headers['host']);
                const host = hostHeader ?? request.hostname ?? 'localhost';
                const normalizedHost = host.trim().length > 0 ? host.trim() : 'localhost';
                return `${protocol}://${normalizedHost}${basePath}`;
            };
            const registerActionRoutes = ({ basePath, getDefinitions, getEndpointDefinition, invoke, validationErrorPredicate, }) => {
                const actionBasePath = `${basePath}/actions`;
                const actionRoute = `${actionBasePath}/:actionName`;
                const openApiPath = `${basePath}/openapi.json`;
                const respondActionError = (reply, status, code, message, details) => {
                    const payload = {
                        error: code,
                        message,
                        ...(details ? { details } : {}),
                    };
                    respondWithCors(reply, status, payload);
                };
                const summarizeAction = (action) => ({
                    name: action.name,
                    description: action.description ?? '',
                    stability: action.stability,
                    since: action.since,
                });
                void getDefinitions()
                    .then((actions) => {
                    if (actions.length === 0) {
                        return;
                    }
                    const names = actions.map((action) => action.name).join(', ');
                    console.log(`[mcp:http] actions available at ${actionBasePath}: ${names}`);
                })
                    .catch((error) => {
                    console.warn(`[mcp:http] failed to resolve actions for ${basePath}:`, error);
                });
                app.get(actionBasePath, async (_request, reply) => {
                    try {
                        const actions = await getDefinitions();
                        respondWithCors(reply, 200, { actions: actions.map(summarizeAction) });
                    }
                    catch (error) {
                        respondActionError(reply, 500, 'actions_unavailable', 'Failed to list actions.', error);
                    }
                });
                registerOptionsRoute(actionBasePath, ['GET']);
                app.get(openApiPath, async (request, reply) => {
                    try {
                        const actions = await getDefinitions();
                        if (actions.length === 0) {
                            respondActionError(reply, 404, 'no_actions', 'No actions are available for this endpoint.');
                            return;
                        }
                        const endpointDef = getEndpointDefinition(actions);
                        const serverUrl = resolveServerUrl(request, basePath);
                        const document = createEndpointOpenApiDocument(endpointDef, actions, serverUrl);
                        respondWithCors(reply, 200, document);
                    }
                    catch (error) {
                        respondActionError(reply, 500, 'openapi_error', 'Failed to generate OpenAPI document.', error);
                    }
                });
                registerOptionsRoute(openApiPath, ['GET']);
                app.post(actionRoute, async (request, reply) => {
                    const actionName = request.params.actionName;
                    if (!actionName) {
                        respondActionError(reply, 404, 'not_found', 'Action not specified.');
                        return;
                    }
                    try {
                        const actions = await getDefinitions();
                        if (!actions.some((action) => action.name === actionName)) {
                            respondActionError(reply, 404, 'not_found', `Action ${actionName} not found.`);
                            return;
                        }
                        const parsed = mustParseJson(request.body);
                        const args = parsed === undefined ? {} : parsed;
                        const result = await invoke(actionName, args);
                        if (result === undefined || result === null) {
                            respondWithCors(reply, 200, { result: null });
                            return;
                        }
                        if (typeof result === 'string') {
                            respondWithCors(reply, 200, { result });
                            return;
                        }
                        if (typeof result === 'number' || typeof result === 'boolean') {
                            respondWithCors(reply, 200, { result });
                            return;
                        }
                        if (Array.isArray(result)) {
                            respondWithCors(reply, 200, { result });
                            return;
                        }
                        respondWithCors(reply, 200, result);
                    }
                    catch (error) {
                        if (error instanceof SyntaxError) {
                            respondActionError(reply, 400, 'invalid_json', 'Request body must be valid JSON.');
                            return;
                        }
                        if (validationErrorPredicate?.(error)) {
                            const issues = error.issues;
                            respondActionError(reply, 400, 'invalid_request', 'Request validation failed.', issues ? { issues } : undefined);
                            return;
                        }
                        respondActionError(reply, 500, 'tool_error', String(error?.message ?? error));
                    }
                });
                registerOptionsRoute(actionRoute, ['POST']);
            };
            const createProxyActionManager = (descriptor) => {
                const basePath = normalizePath(descriptor.path);
                const state = {
                    sessionId: undefined,
                    initializing: undefined,
                    definitionsPromise: undefined,
                };
                /* eslint-disable functional/immutable-data */
                const ensureSession = async () => {
                    if (state.sessionId)
                        return;
                    if (!state.initializing) {
                        const attemptInitialize = async (attempt = 0) => {
                            const payload = {
                                jsonrpc: '2.0',
                                id: `init:${crypto.randomUUID()}`,
                                method: 'initialize',
                                params: {
                                    protocolVersion: '2024-10-01',
                                    clientInfo: { name: 'promethean-proxy-actions', version: 'dev' },
                                },
                            };
                            const response = await app.inject({
                                method: 'POST',
                                url: basePath,
                                headers: {
                                    'content-type': 'application/json',
                                    accept: 'application/json, text/event-stream',
                                },
                                payload: JSON.stringify(payload),
                            });
                            if (response.statusCode >= 400) {
                                const error = new Error(`Failed to initialize proxy at ${basePath}: ${response.statusCode} ${response.body}`);
                                state.sessionId = undefined;
                                if (attempt < 4) {
                                    const backoff = Math.min(1000, 200 * 2 ** attempt);
                                    await delay(backoff);
                                    return attemptInitialize(attempt + 1);
                                }
                                throw error;
                            }
                            state.sessionId = response.headers['mcp-session-id'];
                            try {
                                await response.json();
                                // Send the required 'initialized' notification after successful initialization
                                const initializedPayload = {
                                    jsonrpc: '2.0',
                                    method: 'initialized',
                                    params: {},
                                };
                                await app.inject({
                                    method: 'POST',
                                    url: basePath,
                                    headers: {
                                        'content-type': 'application/json',
                                        'mcp-session-id': state.sessionId,
                                    },
                                    payload: JSON.stringify(initializedPayload),
                                });
                                // Wait longer for servers to complete initialization after sending initialized notification
                                await new Promise((resolve) => setTimeout(resolve, 2000));
                            }
                            catch {
                                /* ignore */
                            }
                        };
                        state.initializing = attemptInitialize().finally(() => {
                            state.initializing = undefined;
                        });
                    }
                    await state.initializing;
                };
                const sendRpc = async (method, params, parser, attempt = 0) => {
                    await ensureSession();
                    const payload = {
                        jsonrpc: '2.0',
                        id: `actions:${crypto.randomUUID()}`,
                        method,
                        ...(params ? { params } : {}),
                    };
                    const headers = state.sessionId === undefined
                        ? {
                            'content-type': 'application/json',
                            accept: 'application/json, text/event-stream',
                        }
                        : {
                            'content-type': 'application/json',
                            accept: 'application/json, text/event-stream',
                            'mcp-session-id': state.sessionId,
                        };
                    const response = await app.inject({
                        method: 'POST',
                        url: basePath,
                        headers,
                        payload: JSON.stringify(payload),
                    });
                    if ((response.statusCode === 404 || response.statusCode === 400) && attempt === 0) {
                        state.sessionId = undefined;
                        state.definitionsPromise = undefined;
                        return sendRpc(method, params, parser, attempt + 1);
                    }
                    if (response.statusCode >= 400) {
                        throw new Error(`Proxy request to ${basePath} failed: ${response.statusCode} ${response.body}`);
                    }
                    // Handle Server-Sent Events (SSE) format from stdio proxies
                    const parseResponseJson = async () => {
                        // Check if this is an SSE response
                        if (response.headers['content-type'] === 'text/event-stream') {
                            const body = response.body || '';
                            // Parse SSE format: "data: {json}" lines
                            const lines = body.split('\n');
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    try {
                                        return JSON.parse(line.slice(6));
                                    }
                                    catch {
                                        // Skip invalid JSON lines
                                        continue;
                                    }
                                }
                            }
                            throw new Error('No valid JSON data found in SSE response');
                        }
                        else {
                            // Regular JSON response
                            try {
                                return await response.json();
                            }
                            catch {
                                throw new Error('Proxy returned invalid JSON response');
                            }
                        }
                    };
                    const payloadBody = await parseResponseJson();
                    if (!isObject(payloadBody)) {
                        throw new Error('Proxy returned invalid JSON-RPC payload');
                    }
                    if ('error' in payloadBody &&
                        payloadBody.error !== undefined &&
                        payloadBody.error !== null) {
                        const err = payloadBody.error;
                        if (isObject(err) && typeof err.message === 'string') {
                            throw new Error(err.message);
                        }
                        throw new Error('MCP error');
                    }
                    if (!('result' in payloadBody)) {
                        throw new Error('Proxy response missing result field');
                    }
                    const resultValue = payloadBody.result;
                    return parser(resultValue);
                };
                const fetchDefinitions = async (cursor = undefined, acc = []) => {
                    const parseToolListResult = (raw) => {
                        if (!isObject(raw)) {
                            throw new Error('Proxy returned invalid tool list response');
                        }
                        const candidates = Array.isArray(raw.tools)
                            ? raw.tools
                            : [];
                        const tools = candidates.filter((candidate) => isObject(candidate) && typeof candidate.name === 'string');
                        const nextCursorRaw = raw.nextCursor;
                        const nextCursor = typeof nextCursorRaw === 'string' && nextCursorRaw.length > 0
                            ? nextCursorRaw
                            : undefined;
                        return { tools, nextCursor };
                    };
                    // Intelligent retry with exponential backoff for slow-initializing servers
                    let retryCount = 0;
                    const maxRetries = 10; // More retries for slow servers
                    let retryDelay = 500; // Start with 500ms
                    const maxDelay = 10000; // Max 10 seconds between retries
                    let result;
                    while (retryCount <= maxRetries) {
                        try {
                            result = await sendRpc('tools/list', cursor ? { cursor } : undefined, parseToolListResult);
                            break; // Success, exit retry loop
                        }
                        catch (error) {
                            retryCount++;
                            if (retryCount > maxRetries || !(error instanceof Error)) {
                                throw error; // Re-throw if max retries exceeded or non-Error
                            }
                            // Retry on initialization errors with exponential backoff
                            if (error.message.includes('Invalid request parameters') ||
                                error.message.includes('before initialization was complete') ||
                                error.message.includes('Not connected')) {
                                if (retryCount <= maxRetries) {
                                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                                    // Exponential backoff with jitter
                                    retryDelay = Math.min(maxDelay, retryDelay * 1.5 + Math.random() * 1000);
                                    continue;
                                }
                            }
                            throw error; // Re-throw if it's a different error type
                        }
                    }
                    const mapped = (result?.tools || []).map((tool) => {
                        const schemaSource = tool.inputSchema;
                        const schema = schemaSource && typeof schemaSource === 'object'
                            ? JSON.parse(JSON.stringify(schemaSource))
                            : { type: 'object' };
                        const requestSchema = schema && typeof schema === 'object'
                            ? {
                                ...schema,
                                ...(schema.type === 'object' &&
                                    !schema.properties
                                    ? { properties: {} }
                                    : {}),
                            }
                            : { type: 'object', properties: {} };
                        const requiresBody = typeof schemaSource === 'object' &&
                            schemaSource !== null &&
                            Array.isArray(schemaSource.required) &&
                            (schemaSource.required?.length ?? 0) > 0;
                        const descriptionCandidate = tool.description;
                        const titleCandidate = tool.title;
                        const baseDescription = typeof descriptionCandidate === 'string'
                            ? descriptionCandidate
                            : typeof titleCandidate === 'string'
                                ? titleCandidate
                                : undefined;
                        const description = clampText(baseDescription);
                        return {
                            name: tool.name,
                            description,
                            stability: 'experimental',
                            since: null,
                            requestSchema,
                            requiresBody,
                        };
                    });
                    const nextCursor = result?.nextCursor;
                    const next = [...acc, ...mapped];
                    return nextCursor ? fetchDefinitions(nextCursor, next) : next;
                };
                const listDefinitions = async () => {
                    if (!state.definitionsPromise) {
                        state.definitionsPromise = fetchDefinitions().catch((error) => {
                            state.definitionsPromise = undefined;
                            throw error;
                        });
                    }
                    return state.definitionsPromise;
                };
                const invokeAction = async (name, args) => {
                    const normalizedArgs = args && typeof args === 'object' && !Array.isArray(args)
                        ? args
                        : {};
                    const result = await sendRpc('tools/call', { name, arguments: normalizedArgs }, (raw) => CompatibilityCallToolResultSchema.parse(raw));
                    if ('structuredContent' in result && result.structuredContent !== undefined) {
                        return result.structuredContent;
                    }
                    if ('toolResult' in result &&
                        result.toolResult !== undefined) {
                        return result.toolResult;
                    }
                    return { content: result.content };
                };
                /* eslint-enable functional/immutable-data */
                return { listDefinitions, invokeAction };
            };
            const registerRegistryActionEndpoints = (descriptor) => {
                const tools = descriptor.tools ?? [];
                if (tools.length === 0) {
                    return;
                }
                const basePath = normalizePath(descriptor.path);
                const endpointDef = descriptor.definition ?? {
                    path: basePath,
                    tools: tools.map((tool) => tool.spec.name),
                };
                const actionDefinitions = tools.map(toolToActionDefinition);
                const toolMap = new Map(tools.map((tool) => [tool.spec.name, tool]));
                registerActionRoutes({
                    basePath,
                    getDefinitions: () => Promise.resolve(actionDefinitions),
                    getEndpointDefinition: () => endpointDef,
                    invoke: (name, args) => {
                        const tool = toolMap.get(name);
                        if (!tool) {
                            throw new Error(`Tool ${name} not found`);
                        }
                        return tool.invoke(args);
                    },
                    validationErrorPredicate: isZodValidationError,
                });
            };
            const registerProxyActionEndpoints = (descriptor) => {
                const basePath = normalizePath(descriptor.path);
                const manager = createProxyActionManager(descriptor);
                registerActionRoutes({
                    basePath,
                    getDefinitions: () => manager.listDefinitions(),
                    getEndpointDefinition: (actions) => ({
                        path: basePath,
                        tools: actions.map((action) => action.name),
                    }),
                    invoke: (name, args) => manager.invokeAction(name, args),
                });
            };
            // eslint-disable-next-line functional/no-let
            let currentUiState = uiOptions
                ? createUiState(uiOptions, proxiesForUi)
                : undefined;
            const updateUiState = (next) => {
                uiOptions = next;
                currentUiState = createUiState(next, proxiesForUi);
            };
            if (uiOptions) {
                const registerUiHandlers = (instance) => {
                    instance.get('/', (_req, reply) => {
                        reply
                            .status(200)
                            .header('content-type', 'text/html; charset=utf-8')
                            .send(renderUiPage());
                    });
                    // OAuth test interface
                    instance.get('/oauth-test', (_req, reply) => {
                        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP OAuth Test Interface</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #e1e5e9;
            border-radius: 6px;
        }
        .button {
            background: #0969da;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .button:hover {
            background: #0860ca;
        }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .success { background: #dafbe1; color: #1a7f37; }
        .info { background: #ddf4ff; color: #0969da; }
        .error { background: #ffebe9; color: #cf222e; }
        .endpoint {
            font-family: monospace;
            background: #f6f8fa;
            padding: 8px 12px;
            border-radius: 4px;
            margin: 5px 0;
        }
        .test-section {
            background: #fff8c5;
            border: 1px solid #d4a017;
            padding: 15px;
            border-radius: 6px;
        }
        pre {
            white-space: pre-wrap;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 MCP OAuth Test Interface</h1>
            <p>Test OAuth integration for ChatGPT MCP connector</p>
        </div>

        <div class="section">
            <h2>📋 Server Information</h2>
            <div class="status info">
                <strong>Server Status:</strong> Running on ${window.location.host}
            </div>
            <div class="endpoint">
                <strong>Base URL:</strong> http://${window.location.host}
            </div>
        </div>

        <div class="section">
            <h2>🔗 OAuth Endpoints</h2>
            <div class="endpoint">
                <strong>Health:</strong> /auth/oauth/health
            </div>
            <div class="endpoint">
                <strong>Providers:</strong> /auth/oauth/providers
            </div>
            <div class="endpoint">
                <strong>OAuth Discovery:</strong> /.well-known/oauth-authorization-server/mcp
            </div>
            <div class="endpoint">
                <strong>OpenID Discovery:</strong> /.well-known/openid-configuration/mcp
            </div>
        </div>

        <div class="section">
            <h2>🧪 Test OAuth Flow</h2>
            <p>Test the OAuth implementation that simulates ChatGPT's MCP connector:</p>
            
            <div class="test-section">
                <h3>1. Standard OAuth Flow</h3>
                <p>Simulates a regular OAuth authorization flow:</p>
                <a href="/auth/oauth/login?response_type=code&client_id=test&redirect_uri=http://localhost:3001/auth/oauth/callback&state=test123" class="button">
                    🚀 Start Standard OAuth
                </a>
            </div>

            <div class="test-section">
                <h3>2. ChatGPT MCP Flow</h3>
                <p>Simulates ChatGPT's PKCE token exchange:</p>
                <button onclick="testChatGPTFlow()" class="button">
                    🤖 Test ChatGPT MCP Flow
                </button>
            </div>

            <div id="result" style="margin-top: 20px;"></div>
        </div>

        <div class="section">
            <h2>📖 API Testing</h2>
            <p>Test the endpoints directly:</p>
            <button onclick="testHealth()" class="button">
                🏥 Test Health
            </button>
            <button onclick="testProviders()" class="button">
                📋 Test Providers
            </button>
            <button onclick="testDiscovery()" class="button">
                🔍 Test OAuth Discovery
            </button>
        </div>
    </div>

    <script>
        async function testHealth() {
            try {
                const response = await fetch('/auth/oauth/health');
                const data = await response.json();
                showResult('Health Check', 'success', \`✅ \${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                showResult('Health Check', 'error', \`❌ \${error.message}\`);
            }
        }

        async function testProviders() {
            try {
                const response = await fetch('/auth/oauth/providers');
                const data = await response.json();
                showResult('Providers', 'success', \`✅ \${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                showResult('Providers', 'error', \`❌ \${error.message}\`);
            }
        }

        async function testDiscovery() {
            try {
                const response = await fetch('/.well-known/oauth-authorization-server/mcp');
                const data = await response.json();
                showResult('OAuth Discovery', 'success', \`✅ \${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                showResult('OAuth Discovery', 'error', \`❌ \${error.message}\`);
            }
        }

        async function testChatGPTFlow() {
            showResult('ChatGPT MCP Flow', 'info', '🔄 Testing ChatGPT PKCE flow...');
            
            try {
                // Simulate ChatGPT's PKCE token request
                const response = await fetch('/auth/oauth/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        grant_type: 'authorization_code',
                        code: 'simulated_auth_code_12345',
                        redirect_uri: 'https://chatgpt.com/connector_platform_oauth_redirect',
                        code_verifier: 'simulated_code_verifier_67890',
                    }),
                });

                const data = await response.json();
                
                if (response.ok) {
                    showResult('ChatGPT MCP Flow', 'success', 
                        \`✅ ChatGPT PKCE flow successful!\\n\\nResponse: \${JSON.stringify(data, null, 2)}\`);
                } else {
                    showResult('ChatGPT MCP Flow', 'error', 
                        \`❌ ChatGPT PKCE flow failed: \${JSON.stringify(data, null, 2)}\`);
                }
            } catch (error) {
                showResult('ChatGPT MCP Flow', 'error', \`❌ Error: \${error.message}\`);
            }
        }

        function showResult(title, type, message) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = \`
                <div class="status \${type}">
                    <strong>\${title}:</strong>
                    <pre>\${message}</pre>
                </div>
            \`;
        }

        // Auto-test health on load
        window.addEventListener('load', testHealth);
    </script>
</body>
</html>`;
                        reply.type('text/html').send(html);
                    });
                    instance.get('/ui/state', (_req, reply) => {
                        if (!currentUiState) {
                            respond(reply, 404, { error: 'ui_unavailable' });
                            return;
                        }
                        respond(reply, 200, currentUiState);
                    });
                    instance.post('/ui/chat', async (req, reply) => {
                        try {
                            const payload = mustParseJson(req.body);
                            const message = payload?.message?.trim();
                            if (!message) {
                                respond(reply, 400, {
                                    error: 'invalid_request',
                                    message: 'message is required',
                                });
                                return;
                            }
                            if (!currentUiState) {
                                respond(reply, 503, { error: 'ui_unavailable' });
                                return;
                            }
                            const lower = message.toLowerCase();
                            const { availableTools, httpEndpoints, configPath, proxies } = currentUiState;
                            // eslint-disable-next-line functional/no-let
                            let responseText = 'Ask about tools, endpoints, configuration, or proxies to get more details.';
                            if (lower.includes('tool')) {
                                responseText =
                                    availableTools.length === 0
                                        ? 'No MCP tools are currently registered.'
                                        : `Available tools (${availableTools.length}): ${availableTools
                                            .map((tool) => tool.id)
                                            .join(', ')}.`;
                            }
                            else if (lower.includes('endpoint')) {
                                responseText =
                                    httpEndpoints.length === 0
                                        ? 'No HTTP endpoints are configured.'
                                        : `HTTP endpoints (${httpEndpoints.length}): ${httpEndpoints
                                            .map((endpoint) => `${endpoint.path}`)
                                            .join(', ')}.`;
                            }
                            else if (lower.includes('config')) {
                                responseText = `Current configuration path: ${configPath}.`;
                            }
                            else if (lower.includes('proxy')) {
                                responseText =
                                    proxies.length === 0
                                        ? 'No stdio proxies are active.'
                                        : `Active proxies (${proxies.length}): ${proxies
                                            .map((proxy) => `${proxy.name} → ${proxy.httpPath}`)
                                            .join(', ')}.`;
                            }
                            respond(reply, 200, { reply: responseText });
                        }
                        catch (error) {
                            respond(reply, 500, {
                                error: 'internal_error',
                                message: String(error?.message ?? error),
                            });
                        }
                    });
                    instance.post('/ui/config', async (req, reply) => {
                        if (!uiOptions) {
                            respond(reply, 404, { error: 'ui_unavailable' });
                            return;
                        }
                        try {
                            const payload = mustParseJson(req.body);
                            const configInput = payload?.config;
                            if (!configInput || typeof configInput !== 'object') {
                                respond(reply, 400, {
                                    error: 'invalid_request',
                                    message: 'config payload is required',
                                });
                                return;
                            }
                            const requestedPath = payload?.path?.trim();
                            const fallbackPath = uiOptions.configPath || path.resolve(process.cwd(), CONFIG_FILE_NAME);
                            const targetPath = requestedPath && requestedPath.length > 0 ? requestedPath : fallbackPath;
                            const resolvedPath = resolveConfigPath(targetPath);
                            const parsedConfig = ConfigSchema.parse(configInput ?? {});
                            const savedConfig = saveConfigFile(resolvedPath, parsedConfig);
                            const endpoints = resolveHttpEndpoints(savedConfig);
                            updateUiState({
                                availableTools: uiOptions.availableTools,
                                config: savedConfig,
                                configSource: { type: 'file', path: resolvedPath },
                                configPath: resolvedPath,
                                httpEndpoints: endpoints,
                            });
                            respond(reply, 200, currentUiState);
                        }
                        catch (error) {
                            respond(reply, 400, {
                                error: 'invalid_config',
                                message: String(error?.message ?? error),
                            });
                        }
                    });
                };
                if (consoleAllowedOrigins.length > 0) {
                    await app.register(async (instance) => {
                        await instance.register(fastifyCors, {
                            origin: (origin, cb) => {
                                if (!origin) {
                                    cb(null, false);
                                    return;
                                }
                                cb(null, isOriginAllowed(origin, consoleAllowedOrigins));
                            },
                            credentials: true,
                        });
                        registerUiHandlers(instance);
                    });
                }
                else {
                    registerUiHandlers(app);
                }
            }
            const startedProxies = [];
            try {
                // First, start all proxy handlers before any route registration
                for (const descriptor of normalized) {
                    if (descriptor.kind === 'proxy') {
                        await descriptor.handler.start();
                        /* eslint-disable functional/immutable-data */
                        startedProxies.push(descriptor.handler);
                        /* eslint-enable functional/immutable-data */
                    }
                }
                // Now register all routes after all proxies are started
                for (const descriptor of normalized) {
                    if (descriptor.kind === 'registry') {
                        const sessions = new Map();
                        /* eslint-disable functional/immutable-data */
                        sessionStores.set(descriptor.path, sessions);
                        /* eslint-enable functional/immutable-data */
                        registerRoute(descriptor.path, createRouteHandler(descriptor.handler, sessions));
                        registerRegistryActionEndpoints(descriptor);
                        console.log(`[mcp:http] bound endpoint ${descriptor.path}`);
                    }
                    else {
                        registerRoute(descriptor.path, createProxyHandler(descriptor.handler), PROXY_METHODS);
                        registerProxyActionEndpoints(descriptor);
                        console.log(`[mcp:http] proxied stdio server ${descriptor.handler.spec.name} at ${descriptor.path}`);
                    }
                }
                // Add catch-all route for 404 logging when verbose logging is enabled
                if (isVerboseLogging) {
                    app.setNotFoundHandler(async (request, reply) => {
                        const requestId = request.requestId || Math.random().toString(36).substr(2, 9);
                        const timestamp = new Date().toISOString();
                        console.log(`\n❌ [${timestamp}] [${requestId}] 404 NOT FOUND`);
                        console.log(`   Method: ${request.method}`);
                        console.log(`   URL: ${request.url}`);
                        console.log(`   Headers:`, JSON.stringify(request.headers, null, 2));
                        console.log(`   Query:`, JSON.stringify(request.query, null, 2));
                        console.log(`   Available endpoints:`);
                        // List all registered routes
                        const registeredRoutes = [];
                        for (const descriptor of normalized) {
                            registeredRoutes.push(`${descriptor.path} (${descriptor.kind})`);
                        }
                        registeredRoutes.push('/healthz');
                        registeredRoutes.push('/ui*');
                        registeredRoutes.forEach((route) => {
                            console.log(`     - ${route}`);
                        });
                        // Send JSON response instead of default Fastify 404
                        reply
                            .status(404)
                            .header('content-type', 'application/json')
                            .send({
                            error: 'Not Found',
                            message: `No route found for ${request.method} ${request.url}`,
                            availableEndpoints: registeredRoutes,
                            timestamp,
                        });
                        console.log(`═══════════════════════════════════════════════════════════════`);
                    });
                }
                const listenOptions = { port, host };
                await app.listen(listenOptions);
                /* eslint-disable functional/immutable-data */
                activeProxies.push(...startedProxies);
                /* eslint-enable functional/immutable-data */
                if (isVerboseLogging) {
                    console.log(`\n🔍 MCP Verbose Logging Enabled`);
                    console.log(`🌐 Server listening on http://${host}:${port}`);
                    console.log(`📝 All requests will be logged with full details`);
                    console.log(`🚀 Use MCP_VERBOSE_LOGGING=true to enable, MCP_VERBOSE_LOGGING=false to disable\n`);
                }
                else {
                    console.log(`[mcp:http] listening on http://${host}:${port}`);
                    console.log(`💡 Tip: Set MCP_VERBOSE_LOGGING=true to enable request logging`);
                }
            }
            catch (error) {
                await Promise.allSettled(startedProxies.map(async (proxy) => {
                    try {
                        await proxy.stop();
                    }
                    catch {
                        /* ignore */
                    }
                }));
                throw error;
            }
        },
        stop: async () => {
            await app.close();
            // Cleanup security middleware
            securityMiddleware.destroy();
            // Cleanup OAuth integration
            if (oauthIntegration) {
                try {
                    await oauthIntegration.cleanup();
                    console.log('[mcp:http] OAuth integration cleaned up successfully');
                }
                catch (error) {
                    console.warn('[mcp:http] OAuth cleanup failed:', error);
                }
            }
            /* eslint-disable functional/immutable-data */
            const toStop = activeProxies.splice(0, activeProxies.length);
            /* eslint-enable functional/immutable-data */
            await Promise.allSettled(toStop.map((proxy) => proxy.stop()));
        },
    };
};
//# sourceMappingURL=fastify.js.map