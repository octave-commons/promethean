import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import type { FastifyInstance, FastifyListenOptions, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

import { CompatibilityCallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

import {
  CONFIG_FILE_NAME,
  ConfigSchema,
  type AppConfig,
  type ConfigSource,
  resolveConfigPath,
  saveConfigFile,
} from '../../config/load-config.js';
import { renderUiPage } from '../../http/ui-page.js';
import type { StdioHttpProxy } from '../../proxy/stdio-proxy.js';
import { resolveHttpEndpoints, type EndpointDefinition } from '../resolve-config.js';
import {
  createEndpointOpenApiDocument,
  encodeActionPathSegment,
  isZodValidationError,
  toolToActionDefinition,
  type ActionDefinition,
} from '../openapi.js';
import type { Transport, Tool } from '../types.js';
import type { IncomingMessage } from 'node:http';
import { createSessionIdGenerator } from './session-id.js';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasToolShape = (candidate: unknown): candidate is Tool =>
  isObject(candidate) &&
  'spec' in candidate &&
  isObject((candidate as { spec?: unknown }).spec) &&
  typeof (candidate as { spec: { name?: unknown } }).spec.name === 'string';

const hasFunctionProperty = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'function';

const isMcpServerHandler = (value: unknown): value is McpServer =>
  isObject(value) && hasFunctionProperty(value, 'connect');

const isProxyLifecycleHandler = (value: unknown): value is ProxyLifecycle =>
  isObject(value) &&
  hasFunctionProperty(value, 'start') &&
  hasFunctionProperty(value, 'stop') &&
  hasFunctionProperty(value, 'handle');

const isToolArray = (value: unknown): value is readonly Tool[] =>
  Array.isArray(value) && value.every((candidate) => hasToolShape(candidate));

const isEndpointDefinitionValue = (value: unknown): value is EndpointDefinition =>
  isObject(value) &&
  typeof value.path === 'string' &&
  Array.isArray(value.tools) &&
  value.tools.every((tool) => typeof tool === 'string');

const clampText = (value: string | undefined, maxLength = 300): string | undefined => {
  if (!value) return undefined;
  if (value.length <= maxLength) return value;
  const truncated = value.slice(0, maxLength).trimEnd();
  return `${truncated.replace(/[.!,;:?]*$/, '')}…`;
};

type ServerEntries = ReadonlyArray<readonly [string, McpServer]>;

type ToolSummary = Readonly<{
  id: string;
  name?: string;
  description?: string;
}>;

type UiProxyInfo = Readonly<{
  name: string;
  httpPath: string;
}>;

type UiState = Readonly<{
  config: AppConfig;
  configSource: ConfigSource;
  configPath: string;
  httpEndpoints: readonly EndpointDefinition[];
  availableTools: readonly ToolSummary[];
  proxies: readonly UiProxyInfo[];
}>;

type UiOptions = Readonly<{
  availableTools: readonly ToolSummary[];
  config: AppConfig;
  configSource: ConfigSource;
  configPath: string;
  httpEndpoints: readonly EndpointDefinition[];
}>;

type ParsedStartOptions = Readonly<{
  proxies: readonly StdioHttpProxy[];
  ui?: UiOptions;
}>;

type ProxyLifecycle = Pick<StdioHttpProxy, 'start' | 'stop' | 'handle' | 'spec'>;

type RegistryEndpointDescriptor = Readonly<{
  path: string;
  kind: 'registry';
  handler: McpServer;
  tools?: readonly Tool[];
  definition?: EndpointDefinition;
}>;

type ProxyEndpointDescriptor = Readonly<{
  path: string;
  kind: 'proxy';
  handler: ProxyLifecycle;
}>;

export type HttpEndpointDescriptor = RegistryEndpointDescriptor | ProxyEndpointDescriptor;

type UiProxyDescriptor = Readonly<{
  handler: ProxyLifecycle;
  path: string;
}>;

const toEntries = (input: unknown): ServerEntries => {
  if (!input) return [];
  if (input instanceof Map) {
    return Array.from(input.entries());
  }
  if (isObject(input) && 'connect' in input && typeof input.connect === 'function') {
    return [['/mcp', input as unknown as McpServer]];
  }
  if (isObject(input)) {
    return Object.entries(input as Record<string, McpServer>);
  }
  return [['/mcp', input as unknown as McpServer]];
};

const stripTrailingSlash = (value: string): string =>
  value.endsWith('/') ? value.slice(0, -1) : value;

const parseAllowedOrigins = (input: string | undefined): readonly string[] =>
  typeof input === 'string'
    ? input
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    : [];

const isOriginAllowed = (origin: string, allowed: readonly string[]): boolean => {
  const normalized = stripTrailingSlash(origin);
  return allowed.some((candidate) => {
    const normalizedCandidate = stripTrailingSlash(candidate);
    return candidate === origin || normalizedCandidate === normalized;
  });
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const consoleAllowedOrigins = parseAllowedOrigins(process.env.MCP_CONSOLE_ORIGIN);

const descriptorsFromEntries = (entries: ServerEntries): readonly HttpEndpointDescriptor[] =>
  entries.map(([route, handler]) => ({
    path: route,
    kind: 'registry' as const,
    handler,
  }));

const normalizePath = (p: string): string => (p.startsWith('/') ? p : `/${p}`);

const tryParseJson = (body: unknown): unknown => {
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'));
    } catch {
      return undefined;
    }
  }
  if (typeof body === 'string' && body.length > 0) {
    try {
      return JSON.parse(body);
    } catch {
      return undefined;
    }
  }
  return body;
};

const mustParseJson = (body: unknown): unknown => {
  if (body === undefined || body === null) return undefined;
  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf8'));
  }
  if (typeof body === 'string') {
    return body.length === 0 ? undefined : JSON.parse(body);
  }
  return body;
};

const parseStartOptions = (input: unknown): ParsedStartOptions => {
  if (!input) return { proxies: [] };
  if (Array.isArray(input)) {
    return { proxies: input as readonly StdioHttpProxy[] };
  }
  if (isObject(input)) {
    const proxiesInput = input['proxies'];
    const uiInput = input['ui'];

    const proxies = Array.isArray(proxiesInput) ? (proxiesInput as readonly StdioHttpProxy[]) : [];

    const uiOptions = isObject(uiInput) ? (uiInput as UiOptions) : undefined;

    return { proxies, ui: uiOptions };
  }
  return { proxies: [] };
};

const ensureEndpointDescriptors = (input: unknown): readonly HttpEndpointDescriptor[] => {
  if (!Array.isArray(input)) return [];

  return input.map((value, index) => {
    if (!value || typeof value !== 'object') {
      throw new Error(`fastifyTransport endpoint[${index}] must be an object descriptor`);
    }

    const descriptor = value as Partial<HttpEndpointDescriptor> & {
      readonly handler?: unknown;
    };

    if (typeof descriptor.path !== 'string' || descriptor.path.trim() === '') {
      throw new Error(`fastifyTransport endpoint[${index}] must provide a non-empty path`);
    }

    if (descriptor.kind === 'registry') {
      if (!isMcpServerHandler(descriptor.handler)) {
        throw new Error(
          `fastifyTransport registry endpoint[${index}] must supply a McpServer handler`,
        );
      }

      const toolsCandidate = descriptor.tools;
      const tools = isToolArray(toolsCandidate) ? toolsCandidate : undefined;
      const definitionCandidate = descriptor.definition;
      const definition = isEndpointDefinitionValue(definitionCandidate)
        ? definitionCandidate
        : undefined;

      const result: RegistryEndpointDescriptor = {
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
        throw new Error(
          `fastifyTransport proxy endpoint[${index}] must supply a valid StdioHttpProxy`,
        );
      }

      const result: ProxyEndpointDescriptor = {
        path: descriptor.path,
        kind: 'proxy',
        handler: descriptor.handler,
      };
      return result;
    }

    throw new Error(`fastifyTransport endpoint[${index}] must declare kind "registry" or "proxy"`);
  });
};

const normalizeServerInput = (server: unknown): readonly HttpEndpointDescriptor[] => {
  if (Array.isArray(server)) {
    return ensureEndpointDescriptors(server);
  }
  const entries = toEntries(server);
  if (entries.length === 0) {
    return [];
  }
  return ensureEndpointDescriptors(descriptorsFromEntries(entries));
};

const ensureInitializeDefaults = (value: unknown): unknown => {
  const normalize = (message: unknown): unknown => {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      return message;
    }
    const candidate = message as Record<string, unknown>;
    if (candidate.method !== 'initialize') {
      return candidate;
    }
    const paramsSource =
      typeof candidate.params === 'object' && candidate.params !== null
        ? (candidate.params as Record<string, unknown>)
        : {};

    const protocolVersion =
      typeof paramsSource['protocolVersion'] === 'string' &&
      paramsSource['protocolVersion'].length > 0
        ? paramsSource['protocolVersion']
        : '2024-10-01';

    const clientInfo =
      typeof paramsSource['clientInfo'] === 'object' && paramsSource['clientInfo'] !== null
        ? (paramsSource['clientInfo'] as Record<string, unknown>)
        : { name: 'promethean-mcp', version: 'dev' };

    const capabilities =
      typeof paramsSource['capabilities'] === 'object' && paramsSource['capabilities'] !== null
        ? (paramsSource['capabilities'] as Record<string, unknown>)
        : {};

    const params = {
      ...paramsSource,
      protocolVersion,
      clientInfo,

      capabilities,
    } as const;

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

const hasInitializeRequest = (payload: unknown): boolean => {
  if (!payload) {
    return false;
  }
  if (Array.isArray(payload)) {
    return payload.some((entry) => hasInitializeRequest(entry));
  }
  if (typeof payload !== 'object') {
    return false;
  }
  return isInitializeRequest(payload as JSONRPCMessage);
};

const parseProxyBody = (value: unknown): unknown => {
  if (value === null || value === undefined) return undefined;
  if (Buffer.isBuffer(value) || typeof value === 'string') {
    return tryParseJson(value);
  }
  return value;
};

const ROUTE_METHODS = ['POST', 'GET', 'DELETE'] as const;

const ensureAcceptHeader = (headers: IncomingMessage['headers']): string => {
  const current = headers['accept'];
  if (typeof current === 'string') {
    if (current.includes('application/json') && current.includes('text/event-stream')) {
      return current;
    }
  }
  if (Array.isArray(current)) {
    const joined = current.join(',');
    if (joined.includes('application/json') && joined.includes('text/event-stream')) {
      return joined;
    }
  }
  return 'application/json, text/event-stream';
};

const withHeaders = (
  rawReq: IncomingMessage,
  nextHeaders: IncomingMessage['headers'],
): IncomingMessage => {
  /* eslint-disable functional/immutable-data */
  Object.defineProperty(rawReq, 'headers', {
    value: nextHeaders,
    writable: true,
    configurable: true,
  });
  /* eslint-enable functional/immutable-data */
  return rawReq;
};

const createProxyHandler = (proxy: ProxyLifecycle) => {
  return async function handler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.hijack();
    const rawReq = request.raw;
    const rawRes = reply.raw;

    const acceptHeader = ensureAcceptHeader(rawReq.headers);
    const normalizedHeaders = {
      ...rawReq.headers,
      accept: acceptHeader,
      'content-type': rawReq.headers['content-type'] ?? 'application/json',
    };

    try {
      const body = parseProxyBody(request.body);
      const normalizedBody = ensureInitializeDefaults(body);
      await proxy.handle(withHeaders(rawReq, normalizedHeaders), rawRes, normalizedBody);
    } catch (error: unknown) {
      if (!rawRes.headersSent) {
        rawRes.writeHead(500).end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Proxy request failed',
              data: String((error as Error)?.message ?? error),
            },
            id: null,
          }),
        );
      }
    }
  };
};

const createRouteHandler = (
  server: McpServer,
  sessions: Map<string, StreamableHTTPServerTransport>,
) => {
  return async function handler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
      const sidHeader = rawReq.headers['mcp-session-id'] as string | undefined;
      const isInitialization = hasInitializeRequest(normalizedBody);

      const transport = sidHeader
        ? sessions.get(sidHeader)
        : await (async () => {
            if (!isInitialization) {
              return undefined;
            }

            const sessionTransport = new StreamableHTTPServerTransport({
              sessionIdGenerator: createSessionIdGenerator(crypto),
              onsessioninitialized: (sid: string): void => {
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
        rawRes.writeHead(400).end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          }),
        );
        return;
      }

      await transport.handleRequest(withHeaders(rawReq, normalizedHeaders), rawRes, normalizedBody);
    } catch (error) {
      if (!rawRes.headersSent) {
        rawRes.writeHead(400).end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32700,
              message: 'Parse error',
              data: String((error as Error)?.message ?? error),
            },
            id: null,
          }),
        );
      }
    }
  };
};

const createUiState = (options: UiOptions, proxies: readonly UiProxyDescriptor[]): UiState => ({
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

const respond = (reply: FastifyReply, status: number, payload: unknown): void => {
  reply.status(status).header('content-type', 'application/json').send(payload);
};

const respondWithCors = (reply: FastifyReply, status: number, payload: unknown): void => {
  reply
    .status(status)
    .header('content-type', 'application/json')
    .header('access-control-allow-origin', '*')
    .send(payload);
};

export const fastifyTransport = (opts?: { port?: number; host?: string }): Transport => {
  const port = opts?.port ?? Number(process.env.PORT ?? 3210);
  const host = opts?.host ?? process.env.HOST ?? '0.0.0.0';
  const app = Fastify({ logger: false });

  app.removeAllContentTypeParsers();
  app.addContentTypeParser(
    ['application/json', 'application/*+json'],
    { parseAs: 'buffer' },
    (_req, payload, done) => done(null, payload),
  );
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (_req, payload, done) =>
    done(null, payload),
  );

  app.get('/healthz', (_req, rep) => rep.send({ ok: true }));

  const sessionStores = new Map<string, Map<string, StreamableHTTPServerTransport>>();
  const activeProxies: ProxyLifecycle[] = [];

  return {
    start: async (server?: unknown, optionsInput?: unknown) => {
      const descriptorsFromServer = normalizeServerInput(server);
      const { proxies: proxyList, ui } = parseStartOptions(optionsInput);

      const devUiDir = path.resolve(process.cwd(), 'packages/mcp/static/dev-ui');
      if (fs.existsSync(devUiDir)) {
        await app.register(fastifyStatic, {
          root: devUiDir,
          prefix: '/ui/assets/',
          decorateReply: false,
        });
      } else {
        console.warn(
          `[mcp:http] dev-ui assets not found at ${devUiDir}. ` +
            "Run 'pnpm --filter @promethean/mcp-dev-ui build' to generate the bundle.",
        );
      }

      const combinedDescriptors: HttpEndpointDescriptor[] = [
        ...descriptorsFromServer,
        ...proxyList.map((proxy) => ({
          path: proxy.spec.httpPath,
          kind: 'proxy' as const,
          handler: proxy,
        })),
      ];

      if (combinedDescriptors.length === 0) {
        throw new Error('fastifyTransport requires at least one MCP server or proxy');
      }

      /* eslint-disable functional/immutable-data */
      sessionStores.clear();
      /* eslint-enable functional/immutable-data */

      const normalized = combinedDescriptors.map<HttpEndpointDescriptor>((descriptor) => ({
        ...descriptor,
        path: normalizePath(descriptor.path),
      }));

      const seenRoutes = new Set<string>();
      for (const descriptor of normalized) {
        if (seenRoutes.has(descriptor.path)) {
          throw new Error(`Duplicate MCP endpoint path: ${descriptor.path}`);
        }
        /* eslint-disable functional/immutable-data */
        seenRoutes.add(descriptor.path);
        /* eslint-enable functional/immutable-data */
      }

      const proxyDescriptors = normalized.filter(
        (descriptor): descriptor is ProxyEndpointDescriptor => descriptor.kind === 'proxy',
      );

      const proxiesForUi: readonly UiProxyDescriptor[] = proxyDescriptors.map((descriptor) => ({
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
              } catch {
                return path.isAbsolute(ui.configPath)
                  ? path.normalize(ui.configPath)
                  : path.resolve(process.cwd(), ui.configPath);
              }
            })(),
          }
        : undefined;

      const registerOptionsRoute = (url: string, methods: readonly string[]): void => {
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

      const registerRoute = (
        url: string,
        handler: (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void,
      ): void => {
        for (const method of ROUTE_METHODS) {
          app.route({ method, url, handler });
        }
        registerOptionsRoute(url, ROUTE_METHODS);
      };

      const headerValue = (value: unknown): string | undefined => {
        if (typeof value === 'string') {
          return value;
        }
        if (Array.isArray(value)) {
          const first = value.find((entry): entry is string => typeof entry === 'string');
          return first;
        }
        return undefined;
      };

      const forwardedHeaderValue = (value: unknown): string | undefined => {
        const raw = headerValue(value);
        if (!raw) return undefined;
        const [first] = raw.split(',');
        return first?.trim();
      };

      const resolveServerUrl = (request: FastifyRequest, basePath: string): string => {
        const baseUrl = process.env.BASE_ACTION_URL?.trim();
        if (baseUrl && baseUrl.length > 0) {
          const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          return `${normalized}${basePath}`;
        }

        const protocol =
          forwardedHeaderValue(request.headers['x-forwarded-proto']) ?? request.protocol ?? 'http';
        const hostHeader =
          forwardedHeaderValue(request.headers['x-forwarded-host']) ??
          headerValue(request.headers['host']);
        const host = hostHeader ?? request.hostname ?? 'localhost';
        const normalizedHost = host.trim().length > 0 ? host.trim() : 'localhost';

        return `${protocol}://${normalizedHost}${basePath}`;
      };

      type ActionRouteConfig = Readonly<{
        basePath: string;
        getDefinitions: () => Promise<readonly ActionDefinition[]>;
        getEndpointDefinition: (actions: readonly ActionDefinition[]) => EndpointDefinition;
        invoke: (name: string, args: unknown) => Promise<unknown>;
        validationErrorPredicate?: (error: unknown) => boolean;
      }>;

      const registerActionRoutes = ({
        basePath,
        getDefinitions,
        getEndpointDefinition,
        invoke,
        validationErrorPredicate,
      }: ActionRouteConfig): void => {
        const actionBasePath = `${basePath}/actions`;
        const actionRoute = `${actionBasePath}/:actionName`;
        const openApiPath = `${basePath}/openapi.json`;

        const respondActionError = (
          reply: FastifyReply,
          status: number,
          code: string,
          message: string,
          details?: unknown,
        ): void => {
          const payload = {
            error: code,
            message,
            ...(details ? { details } : {}),
          };
          respondWithCors(reply, status, payload);
        };

        const summarizeAction = (action: ActionDefinition) => ({
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
          } catch (error) {
            respondActionError(reply, 500, 'actions_unavailable', 'Failed to list actions.', error);
          }
        });
        registerOptionsRoute(actionBasePath, ['GET']);

        app.get(openApiPath, async (request, reply) => {
          try {
            const actions = await getDefinitions();
            if (actions.length === 0) {
              respondActionError(
                reply,
                404,
                'no_actions',
                'No actions are available for this endpoint.',
              );
              return;
            }
            const endpointDef = getEndpointDefinition(actions);
            const serverUrl = resolveServerUrl(request, basePath);
            const document = createEndpointOpenApiDocument(endpointDef, actions, serverUrl);
            respondWithCors(reply, 200, document);
          } catch (error) {
            respondActionError(
              reply,
              500,
              'openapi_error',
              'Failed to generate OpenAPI document.',
              error,
            );
          }
        });
        registerOptionsRoute(openApiPath, ['GET']);

        app.post<{ Body: unknown; Params: { actionName?: string } }>(
          actionRoute,
          async (request, reply) => {
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
              const args: unknown = parsed === undefined ? {} : parsed;
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
            } catch (error) {
              if (error instanceof SyntaxError) {
                respondActionError(reply, 400, 'invalid_json', 'Request body must be valid JSON.');
                return;
              }
              if (validationErrorPredicate?.(error)) {
                const issues = (error as { issues?: unknown }).issues;
                respondActionError(
                  reply,
                  400,
                  'invalid_request',
                  'Request validation failed.',
                  issues ? { issues } : undefined,
                );
                return;
              }
              respondActionError(
                reply,
                500,
                'tool_error',
                String((error as Error)?.message ?? error),
              );
            }
          },
        );
        registerOptionsRoute(actionRoute, ['POST']);
      };

      const createProxyActionManager = (descriptor: ProxyEndpointDescriptor) => {
        const basePath = normalizePath(descriptor.path);
        const state: {
          sessionId: string | undefined;
          initializing: Promise<void> | undefined;
          definitionsPromise: Promise<readonly ActionDefinition[]> | undefined;
        } = {
          sessionId: undefined,
          initializing: undefined,
          definitionsPromise: undefined,
        };
        /* eslint-disable functional/immutable-data */

        const ensureSession = async (): Promise<void> => {
          if (state.sessionId) return;
          if (!state.initializing) {
            const attemptInitialize = async (attempt = 0): Promise<void> => {
              const payload = {
                jsonrpc: '2.0',
                id: `init:${crypto.randomUUID()}`,
                method: 'initialize',
                params: {
                  protocolVersion: '2024-10-01',
                  clientInfo: { name: 'promethean-proxy-actions', version: 'dev' },
                },
              } as const;

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
                const error = new Error(
                  `Failed to initialize proxy at ${basePath}: ${response.statusCode} ${response.body}`,
                );
                state.sessionId = undefined;
                if (attempt < 4) {
                  const backoff = Math.min(1000, 200 * 2 ** attempt);
                  await delay(backoff);
                  return attemptInitialize(attempt + 1);
                }
                throw error;
              }

              state.sessionId = response.headers['mcp-session-id'] as string | undefined;
              try {
                await response.json();
              } catch {
                // The proxy doesn't return JSON on every request; ignore parse failures.
              }
            };

            state.initializing = attemptInitialize().finally(() => {
              state.initializing = undefined;
            });
          }

          await state.initializing;
        };

        const sendRpc = async <T>(
          method: string,
          params: Record<string, unknown> | undefined,
          parser: (result: unknown) => T,
          attempt = 0,
        ): Promise<T> => {
          await ensureSession();

          const payload = {
            jsonrpc: '2.0',
            id: `actions:${crypto.randomUUID()}`,
            method,
            ...(params ? { params } : {}),
          } as const;

          const headers: Record<string, string> =
            state.sessionId === undefined
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
            throw new Error(
              `Proxy request to ${basePath} failed: ${response.statusCode} ${response.body}`,
            );
          }

          const parseResponseJson = response.json.bind(response) as () => Promise<unknown>;
          const payloadBody: unknown = await (async () => {
            try {
              return await parseResponseJson();
            } catch {
              throw new Error('Proxy returned invalid JSON response');
            }
          })();

          if (!isObject(payloadBody)) {
            throw new Error('Proxy returned invalid JSON-RPC payload');
          }

          if (
            'error' in payloadBody &&
            payloadBody.error !== undefined &&
            payloadBody.error !== null
          ) {
            const err = payloadBody.error;
            if (isObject(err) && typeof err.message === 'string') {
              throw new Error(err.message);
            }
            throw new Error('MCP error');
          }

          if (!('result' in payloadBody)) {
            throw new Error('Proxy response missing result field');
          }

          const resultValue = (payloadBody as { result: unknown }).result;
          return parser(resultValue);
        };

        const fetchDefinitions = async (
          cursor: string | undefined = undefined,
          acc: readonly ActionDefinition[] = [],
        ): Promise<readonly ActionDefinition[]> => {
          const parseToolListResult = (
            raw: unknown,
          ): {
            tools: ReadonlyArray<Record<string, unknown> & { name: string }>;
            nextCursor?: string;
          } => {
            if (!isObject(raw)) {
              throw new Error('Proxy returned invalid tool list response');
            }

            const candidates = Array.isArray((raw as { tools?: unknown }).tools)
              ? ((raw as { tools?: unknown }).tools as readonly unknown[])
              : [];

            const tools = candidates.filter(
              (candidate): candidate is Record<string, unknown> & { name: string } =>
                isObject(candidate) && typeof candidate.name === 'string',
            );

            const nextCursorRaw = (raw as { nextCursor?: unknown }).nextCursor;
            const nextCursor =
              typeof nextCursorRaw === 'string' && nextCursorRaw.length > 0
                ? nextCursorRaw
                : undefined;

            return { tools, nextCursor };
          };

          const result = await sendRpc(
            'tools/list',
            cursor ? { cursor } : undefined,
            parseToolListResult,
          );

          const mapped = result.tools.map<ActionDefinition>((tool) => {
            const schemaSource = (tool as { inputSchema?: unknown }).inputSchema;
            const schema =
              schemaSource && typeof schemaSource === 'object'
                ? (JSON.parse(JSON.stringify(schemaSource)) as Record<string, unknown>)
                : ({ type: 'object' } as const);

            const requestSchema =
              schema && typeof schema === 'object'
                ? {
                    ...schema,
                    ...((schema as { type?: string; properties?: unknown }).type === 'object' &&
                    !(schema as { properties?: unknown }).properties
                      ? { properties: {} }
                      : {}),
                  }
                : { type: 'object', properties: {} };

            const requiresBody =
              typeof schemaSource === 'object' &&
              schemaSource !== null &&
              Array.isArray((schemaSource as { required?: unknown }).required) &&
              ((schemaSource as { required?: unknown[] }).required?.length ?? 0) > 0;

            const descriptionCandidate = (tool as { description?: unknown }).description;
            const titleCandidate = (tool as { title?: unknown }).title;
            const baseDescription =
              typeof descriptionCandidate === 'string'
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
            } satisfies ActionDefinition;
          });

          const nextCursor = result.nextCursor;
          const next = [...acc, ...mapped];
          return nextCursor ? fetchDefinitions(nextCursor, next) : next;
        };

        const listDefinitions = async (): Promise<readonly ActionDefinition[]> => {
          if (!state.definitionsPromise) {
            state.definitionsPromise = fetchDefinitions().catch((error) => {
              state.definitionsPromise = undefined;
              throw error;
            });
          }
          return state.definitionsPromise;
        };

        const invokeAction = async (name: string, args: unknown): Promise<unknown> => {
          const normalizedArgs =
            args && typeof args === 'object' && !Array.isArray(args)
              ? (args as Record<string, unknown>)
              : {};

          const result = await sendRpc('tools/call', { name, arguments: normalizedArgs }, (raw) =>
            CompatibilityCallToolResultSchema.parse(raw),
          );

          if ('structuredContent' in result && result.structuredContent !== undefined) {
            return result.structuredContent;
          }
          if (
            'toolResult' in result &&
            (result as { toolResult?: unknown }).toolResult !== undefined
          ) {
            return (result as { toolResult?: unknown }).toolResult;
          }
          return { content: result.content };
        };

        /* eslint-enable functional/immutable-data */

        return { listDefinitions, invokeAction } as const;
      };

      const registerRegistryActionEndpoints = (descriptor: RegistryEndpointDescriptor): void => {
        const tools = descriptor.tools ?? [];
        if (tools.length === 0) {
          return;
        }

        const basePath = normalizePath(descriptor.path);
        const endpointDef: EndpointDefinition = descriptor.definition ?? {
          path: basePath,
          tools: tools.map((tool) => tool.spec.name),
        };
        const actionDefinitions = tools.map(toolToActionDefinition);
        const toolMap = new Map(tools.map((tool) => [tool.spec.name, tool] as const));

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

      const registerProxyActionEndpoints = (descriptor: ProxyEndpointDescriptor): void => {
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
      let currentUiState: UiState | undefined = uiOptions
        ? createUiState(uiOptions, proxiesForUi)
        : undefined;

      const updateUiState = (next: UiOptions): void => {
        uiOptions = next;
        currentUiState = createUiState(next, proxiesForUi);
      };

      if (uiOptions) {
        const registerUiHandlers = (instance: FastifyInstance): void => {
          instance.get('/', (_req, reply) => {
            reply
              .status(200)
              .header('content-type', 'text/html; charset=utf-8')
              .send(renderUiPage());
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
              const payload = mustParseJson(req.body) as { message?: string } | undefined;
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
              let responseText =
                'Ask about tools, endpoints, configuration, or proxies to get more details.';

              if (lower.includes('tool')) {
                responseText =
                  availableTools.length === 0
                    ? 'No MCP tools are currently registered.'
                    : `Available tools (${availableTools.length}): ${availableTools
                        .map((tool) => tool.id)
                        .join(', ')}.`;
              } else if (lower.includes('endpoint')) {
                responseText =
                  httpEndpoints.length === 0
                    ? 'No HTTP endpoints are configured.'
                    : `HTTP endpoints (${httpEndpoints.length}): ${httpEndpoints
                        .map((endpoint) => `${endpoint.path}`)
                        .join(', ')}.`;
              } else if (lower.includes('config')) {
                responseText = `Current configuration path: ${configPath}.`;
              } else if (lower.includes('proxy')) {
                responseText =
                  proxies.length === 0
                    ? 'No stdio proxies are active.'
                    : `Active proxies (${proxies.length}): ${proxies
                        .map((proxy) => `${proxy.name} → ${proxy.httpPath}`)
                        .join(', ')}.`;
              }

              respond(reply, 200, { reply: responseText });
            } catch (error) {
              respond(reply, 500, {
                error: 'internal_error',
                message: String((error as Error)?.message ?? error),
              });
            }
          });

          instance.post('/ui/config', async (req, reply) => {
            if (!uiOptions) {
              respond(reply, 404, { error: 'ui_unavailable' });
              return;
            }

            try {
              const payload = mustParseJson(req.body) as
                | { path?: string; config?: unknown }
                | undefined;
              const configInput = payload?.config;
              if (!configInput || typeof configInput !== 'object') {
                respond(reply, 400, {
                  error: 'invalid_request',
                  message: 'config payload is required',
                });
                return;
              }

              const requestedPath = payload?.path?.trim();
              const fallbackPath =
                uiOptions.configPath || path.resolve(process.cwd(), CONFIG_FILE_NAME);
              const targetPath =
                requestedPath && requestedPath.length > 0 ? requestedPath : fallbackPath;

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
            } catch (error) {
              respond(reply, 400, {
                error: 'invalid_config',
                message: String((error as Error)?.message ?? error),
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
        } else {
          registerUiHandlers(app);
        }
      }

      const startedProxies: ProxyLifecycle[] = [];

      try {
        for (const descriptor of normalized) {
          if (descriptor.kind === 'registry') {
            const sessions = new Map<string, StreamableHTTPServerTransport>();
            /* eslint-disable functional/immutable-data */
            sessionStores.set(descriptor.path, sessions);
            /* eslint-enable functional/immutable-data */
            registerRoute(descriptor.path, createRouteHandler(descriptor.handler, sessions));

            registerRegistryActionEndpoints(descriptor);

            console.log(`[mcp:http] bound endpoint ${descriptor.path}`);
            continue;
          }

          await descriptor.handler.start();
          /* eslint-disable functional/immutable-data */
          startedProxies.push(descriptor.handler);
          /* eslint-enable functional/immutable-data */
          registerRoute(descriptor.path, createProxyHandler(descriptor.handler));
          registerProxyActionEndpoints(descriptor);
          console.log(
            `[mcp:http] proxied stdio server ${descriptor.handler.spec.name} at ${descriptor.path}`,
          );
        }

        const listenOptions: FastifyListenOptions = { port, host };
        await app.listen(listenOptions);
        /* eslint-disable functional/immutable-data */
        activeProxies.push(...startedProxies);
        /* eslint-enable functional/immutable-data */
        console.log(`[mcp:http] listening on http://${host}:${port}`);
      } catch (error) {
        await Promise.allSettled(
          startedProxies.map(async (proxy) => {
            try {
              await proxy.stop();
            } catch {
              // Best-effort shutdown so cleanup errors don't hide the root failure.
            }
          }),
        );
        throw error;
      }
    },
    stop: async () => {
      await app.close();
      /* eslint-disable functional/immutable-data */
      const toStop = activeProxies.splice(0, activeProxies.length);
      /* eslint-enable functional/immutable-data */
      await Promise.allSettled(toStop.map((proxy) => proxy.stop()));
    },
  };
};
