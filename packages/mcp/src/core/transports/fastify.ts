import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

import {
  CONFIG_FILE_NAME,
  ConfigSchema,
  type AppConfig,
  type ConfigSource,
  resolveConfigPath,
  saveConfigFile,
} from "../../config/load-config.js";
import { renderUiPage } from "../../http/ui-page.js";
import { StdioHttpProxy } from "../../proxy/stdio-proxy.js";
import {
  resolveHttpEndpoints,
  type EndpointDefinition,
} from "../resolve-config.js";
import type { Transport } from "../types.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createSessionIdGenerator } from "./session-id.js";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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

type ProxyLifecycle = Pick<
  StdioHttpProxy,
  "start" | "stop" | "handle" | "spec"
>;

type RegistryEndpointDescriptor = Readonly<{
  path: string;
  kind: "registry";
  handler: McpServer;
}>;

type ProxyEndpointDescriptor = Readonly<{
  path: string;
  kind: "proxy";
  handler: ProxyLifecycle;
}>;

export type HttpEndpointDescriptor =
  | RegistryEndpointDescriptor
  | ProxyEndpointDescriptor;

type UiProxyDescriptor = Readonly<{
  handler: ProxyLifecycle;
  path: string;
}>;

const toEntries = (input: unknown): ServerEntries => {
  if (!input) return [];
  if (input instanceof Map) {
    return Array.from(input.entries());
  }
  if (
    isObject(input) &&
    "connect" in input &&
    typeof input.connect === "function"
  ) {
    return [["/mcp", input as unknown as McpServer]];
  }
  if (isObject(input)) {
    return Object.entries(input as Record<string, McpServer>);
  }
  return [["/mcp", input as unknown as McpServer]];
};

const stripTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const parseAllowedOrigins = (input: string | undefined): readonly string[] =>
  typeof input === "string"
    ? input
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    : [];

const isOriginAllowed = (
  origin: string,
  allowed: readonly string[],
): boolean => {
  const normalized = stripTrailingSlash(origin);
  return allowed.some((candidate) => {
    const normalizedCandidate = stripTrailingSlash(candidate);
    return candidate === origin || normalizedCandidate === normalized;
  });
};

const consoleAllowedOrigins = parseAllowedOrigins(
  process.env.MCP_CONSOLE_ORIGIN,
);

const descriptorsFromEntries = (
  entries: ServerEntries,
): readonly HttpEndpointDescriptor[] =>
  entries.map(([route, handler]) => ({
    path: route,
    kind: "registry" as const,
    handler,
  }));

const normalizePath = (p: string): string => (p.startsWith("/") ? p : `/${p}`);

const tryParseJson = (body: unknown): unknown => {
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString("utf8"));
    } catch {
      return undefined;
    }
  }
  if (typeof body === "string" && body.length > 0) {
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
    return JSON.parse(body.toString("utf8"));
  }
  if (typeof body === "string") {
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
    const proxiesInput = input["proxies"];
    const uiInput = input["ui"];

    const proxies = Array.isArray(proxiesInput)
      ? (proxiesInput as readonly StdioHttpProxy[])
      : [];

    const uiOptions = isObject(uiInput) ? (uiInput as UiOptions) : undefined;

    return { proxies, ui: uiOptions };
  }
  return { proxies: [] };
};

const ensureEndpointDescriptors = (
  input: unknown,
): readonly HttpEndpointDescriptor[] => {
  if (!Array.isArray(input)) return [];

  return input.map((value, index) => {
    if (!value || typeof value !== "object") {
      throw new Error(
        `fastifyTransport endpoint[${index}] must be an object descriptor`,
      );
    }

    const descriptor = value as Partial<HttpEndpointDescriptor> & {
      readonly handler?: unknown;
    };

    if (typeof descriptor.path !== "string" || descriptor.path.trim() === "") {
      throw new Error(
        `fastifyTransport endpoint[${index}] must provide a non-empty path`,
      );
    }

    if (descriptor.kind === "registry") {
      if (
        !descriptor.handler ||
        typeof descriptor.handler !== "object" ||
        typeof (descriptor.handler as McpServer).connect !== "function"
      ) {
        throw new Error(
          `fastifyTransport registry endpoint[${index}] must supply a McpServer handler`,
        );
      }

      return {
        path: descriptor.path,
        kind: "registry" as const,
        handler: descriptor.handler as McpServer,
      } satisfies RegistryEndpointDescriptor;
    }

    if (descriptor.kind === "proxy") {
      const handler = descriptor.handler as ProxyLifecycle | undefined;
      if (
        !handler ||
        typeof handler.start !== "function" ||
        typeof handler.stop !== "function" ||
        typeof handler.handle !== "function"
      ) {
        throw new Error(
          `fastifyTransport proxy endpoint[${index}] must supply a valid StdioHttpProxy`,
        );
      }

      return {
        path: descriptor.path,
        kind: "proxy" as const,
        handler,
      } satisfies ProxyEndpointDescriptor;
    }

    throw new Error(
      `fastifyTransport endpoint[${index}] must declare kind "registry" or "proxy"`,
    );
  });
};

const normalizeServerInput = (
  server: unknown,
): readonly HttpEndpointDescriptor[] => {
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
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return message;
    }
    const candidate = message as Record<string, unknown>;
    if (candidate.method !== "initialize") {
      return candidate;
    }
    const params = {
      protocolVersion: "2024-10-01",
      clientInfo: { name: "promethean-mcp", version: "dev" },
      ...(typeof candidate.params === "object" && candidate.params !== null
        ? candidate.params
        : {}),
    } as Record<string, unknown>;
    if (!params["protocolVersion"]) {
      params["protocolVersion"] = "2024-10-01";
    }
    if (!params["clientInfo"]) {
      params["clientInfo"] = { name: "promethean-mcp", version: "dev" };
    }
    return {
      jsonrpc: "2.0",
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
  if (typeof payload !== "object") {
    return false;
  }
  return isInitializeRequest(payload as JSONRPCMessage);
};

const parseProxyBody = (value: unknown): unknown => {
  if (value === null || value === undefined) return undefined;
  if (Buffer.isBuffer(value) || typeof value === "string") {
    return tryParseJson(value);
  }
  return value;
};

const ROUTE_METHODS = ["POST", "GET", "DELETE"] as const;

const createProxyHandler = (proxy: ProxyLifecycle) => {
  return async function handler(req: any, reply: any) {
    reply.hijack();
    const rawReq: IncomingMessage = req.raw;
    const rawRes: ServerResponse = reply.raw;

    const accept = String(rawReq.headers["accept"] || "");
    if (
      !(
        accept.includes("application/json") &&
        accept.includes("text/event-stream")
      )
    ) {
      rawReq.headers["accept"] = "application/json, text/event-stream";
    }

    try {
      const body = parseProxyBody(req.body);
      const normalizedBody = ensureInitializeDefaults(body);
      if (!rawReq.headers["content-type"]) {
        rawReq.headers["content-type"] = "application/json";
      }
      const accept = rawReq.headers["accept"];
      if (
        !accept ||
        !(
          typeof accept === "string" &&
          accept.includes("application/json") &&
          accept.includes("text/event-stream")
        )
      ) {
        rawReq.headers["accept"] = "application/json, text/event-stream";
      }
      await proxy.handle(rawReq, rawRes, normalizedBody);
    } catch (error: unknown) {
      if (!rawRes.headersSent) {
        rawRes.writeHead(500).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Proxy request failed",
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
  return async function handler(req: any, reply: any) {
    reply.hijack();
    const rawReq = req.raw;
    const rawRes = reply.raw;

    const accept = String(rawReq.headers["accept"] || "");
    if (
      !(
        accept.includes("application/json") &&
        accept.includes("text/event-stream")
      )
    ) {
      rawReq.headers["accept"] = "application/json, text/event-stream";
    }

    try {
      const body = tryParseJson(req.body);
      const normalizedBody = ensureInitializeDefaults(body);
      const sidHeader = rawReq.headers["mcp-session-id"] as string | undefined;
      const isInitialization = hasInitializeRequest(normalizedBody);

      let transport: StreamableHTTPServerTransport | undefined;

      if (sidHeader) {
        transport = sessions.get(sidHeader);
        if (!transport) {
          rawRes.writeHead(400).end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32000,
                message: "Bad Request: No valid session ID provided",
              },
              id: null,
            }),
          );
          return;
        }
      } else if (isInitialization) {
        let self: StreamableHTTPServerTransport;

        const t: StreamableHTTPServerTransport =
          new StreamableHTTPServerTransport({
            sessionIdGenerator: createSessionIdGenerator(crypto),
            onsessioninitialized: (sid: string): void => {
              sessions.set(sid, self);
            },
          });

        t.onclose = () => {
          if (t.sessionId) sessions.delete(t.sessionId);
        };

        self = t;
        transport = t;
        await server.connect(transport);
      } else {
        rawRes.writeHead(400).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Bad Request: No valid session ID provided",
            },
            id: null,
          }),
        );
        return;
      }

      await transport.handleRequest(rawReq, rawRes, normalizedBody);
    } catch (e: any) {
      if (!rawRes.headersSent) {
        rawRes.writeHead(400).end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32700,
              message: "Parse error",
              data: String(e?.message ?? e),
            },
            id: null,
          }),
        );
      }
    }
  };
};

const createUiState = (
  options: UiOptions,
  proxies: readonly UiProxyDescriptor[],
): UiState => ({
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

const respond = (reply: any, status: number, payload: unknown): void => {
  reply.status(status).header("content-type", "application/json").send(payload);
};

export const fastifyTransport = (opts?: {
  port?: number;
  host?: string;
}): Transport => {
  const port = opts?.port ?? Number(process.env.PORT ?? 3210);
  const host = opts?.host ?? process.env.HOST ?? "0.0.0.0";
  const app = Fastify({ logger: false });

  app.removeAllContentTypeParsers();
  app.addContentTypeParser(
    ["application/json", "application/*+json"],
    { parseAs: "buffer" },
    (_req, payload, done) => done(null, payload),
  );
  app.addContentTypeParser("*", { parseAs: "buffer" }, (_req, payload, done) =>
    done(null, payload),
  );

  app.get("/healthz", (_req, rep) => rep.send({ ok: true }));

  const sessionStores = new Map<
    string,
    Map<string, StreamableHTTPServerTransport>
  >();
  const activeProxies: ProxyLifecycle[] = [];

  return {
    start: async (server?: unknown, optionsInput?: unknown) => {
      const descriptorsFromServer = normalizeServerInput(server);
      const { proxies: proxyList, ui } = parseStartOptions(optionsInput);

      const devUiDir = path.resolve(process.cwd(), "packages/mcp/static/dev-ui");
      if (fs.existsSync(devUiDir)) {
        await app.register(fastifyStatic, {
          root: devUiDir,
          prefix: "/ui/assets/",
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
          kind: "proxy" as const,
          handler: proxy,
        })),
      ];

      if (combinedDescriptors.length === 0) {
        throw new Error(
          "fastifyTransport requires at least one MCP server or proxy",
        );
      }

      sessionStores.clear();

      const normalized = combinedDescriptors.map((descriptor) =>
        descriptor.kind === "registry"
          ? ({
              ...descriptor,
              path: normalizePath(descriptor.path),
            } satisfies RegistryEndpointDescriptor)
          : ({
              ...descriptor,
              path: normalizePath(descriptor.path),
            } satisfies ProxyEndpointDescriptor),
      );

      const seenRoutes = new Set<string>();
      for (const descriptor of normalized) {
        if (seenRoutes.has(descriptor.path)) {
          throw new Error(`Duplicate MCP endpoint path: ${descriptor.path}`);
        }
        seenRoutes.add(descriptor.path);
      }

      const proxyDescriptors = normalized.filter(
        (descriptor): descriptor is ProxyEndpointDescriptor =>
          descriptor.kind === "proxy",
      );

      const proxiesForUi: readonly UiProxyDescriptor[] = proxyDescriptors.map(
        (descriptor) => ({
          handler: descriptor.handler,
          path: descriptor.path,
        }),
      );

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

      const registerRoute = (
        url: string,
        handler: (req: any, reply: any) => Promise<void> | void,
      ): void => {
        for (const method of ROUTE_METHODS) {
          app.route({ method, url, handler });
        }
        app.options(url, (req, reply) => {
          const requestedHeaders = req.headers["access-control-request-headers"];
          const allowHeaders = Array.isArray(requestedHeaders)
            ? requestedHeaders.join(",")
            : typeof requestedHeaders === "string"
              ? requestedHeaders
              : "";
          reply
            .status(204)
            .header("allow", [...ROUTE_METHODS, "OPTIONS"].join(","))
            .header("access-control-allow-methods", [...ROUTE_METHODS, "OPTIONS"].join(","))
            .header("access-control-allow-headers", allowHeaders)
            .send();
        });
      };
      let currentUiState: UiState | undefined = uiOptions
        ? createUiState(uiOptions, proxiesForUi)
        : undefined;

      const updateUiState = (next: UiOptions): void => {
        uiOptions = next;
        currentUiState = createUiState(next, proxiesForUi);
      };

      if (uiOptions) {
        const registerUiHandlers = (instance: FastifyInstance): void => {
          instance.get("/", (_req, reply) => {
            reply
              .status(200)
              .header("content-type", "text/html; charset=utf-8")
              .send(renderUiPage());
          });

          instance.get("/ui/state", (_req, reply) => {
            if (!currentUiState) {
              respond(reply, 404, { error: "ui_unavailable" });
              return;
            }
            respond(reply, 200, currentUiState);
          });

          instance.post("/ui/chat", async (req, reply) => {
            try {
              const payload = mustParseJson(req.body) as
                | { message?: string }
                | undefined;
              const message = payload?.message?.trim();
              if (!message) {
                respond(reply, 400, {
                  error: "invalid_request",
                  message: "message is required",
                });
                return;
              }

              if (!currentUiState) {
                respond(reply, 503, { error: "ui_unavailable" });
                return;
              }

              const lower = message.toLowerCase();
              const { availableTools, httpEndpoints, configPath, proxies } =
                currentUiState;

              let responseText =
                "Ask about tools, endpoints, configuration, or proxies to get more details.";

              if (lower.includes("tool")) {
                responseText =
                  availableTools.length === 0
                    ? "No MCP tools are currently registered."
                    : `Available tools (${
                        availableTools.length
                      }): ${availableTools.map((tool) => tool.id).join(", ")}.`;
              } else if (lower.includes("endpoint")) {
                responseText =
                  httpEndpoints.length === 0
                    ? "No HTTP endpoints are configured."
                    : `HTTP endpoints (${httpEndpoints.length}): ${httpEndpoints
                        .map((endpoint) => `${endpoint.path}`)
                        .join(", ")}.`;
              } else if (lower.includes("config")) {
                responseText = `Current configuration path: ${configPath}.`;
              } else if (lower.includes("proxy")) {
                responseText =
                  proxies.length === 0
                    ? "No stdio proxies are active."
                    : `Active proxies (${proxies.length}): ${proxies
                        .map((proxy) => `${proxy.name} → ${proxy.httpPath}`)
                        .join(", ")}.`;
              }

              respond(reply, 200, { reply: responseText });
            } catch (error) {
              respond(reply, 500, {
                error: "internal_error",
                message: String((error as Error)?.message ?? error),
              });
            }
          });

          instance.post("/ui/config", async (req, reply) => {
            if (!uiOptions) {
              respond(reply, 404, { error: "ui_unavailable" });
              return;
            }

            try {
              const payload = mustParseJson(req.body) as
                | { path?: string; config?: unknown }
                | undefined;
              const configInput = payload?.config;
              if (!configInput || typeof configInput !== "object") {
                respond(reply, 400, {
                  error: "invalid_request",
                  message: "config payload is required",
                });
                return;
              }

              const requestedPath = payload?.path?.trim();
              const fallbackPath =
                uiOptions.configPath ||
                path.resolve(process.cwd(), CONFIG_FILE_NAME);
              const targetPath =
                requestedPath && requestedPath.length > 0
                  ? requestedPath
                  : fallbackPath;

              const resolvedPath = resolveConfigPath(targetPath);
              const parsedConfig = ConfigSchema.parse(configInput ?? {});
              const savedConfig = saveConfigFile(resolvedPath, parsedConfig);
              const endpoints = resolveHttpEndpoints(savedConfig);

              updateUiState({
                availableTools: uiOptions.availableTools,
                config: savedConfig,
                configSource: { type: "file", path: resolvedPath },
                configPath: resolvedPath,
                httpEndpoints: endpoints,
              });

              respond(reply, 200, currentUiState);
            } catch (error) {
              respond(reply, 400, {
                error: "invalid_config",
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
          if (descriptor.kind === "registry") {
            const sessions = new Map<string, StreamableHTTPServerTransport>();
            sessionStores.set(descriptor.path, sessions);
            registerRoute(
              descriptor.path,
              createRouteHandler(descriptor.handler, sessions),
            );
            console.log(`[mcp:http] bound endpoint ${descriptor.path}`);
            continue;
          }

          await descriptor.handler.start();
          startedProxies.push(descriptor.handler);
          registerRoute(descriptor.path, createProxyHandler(descriptor.handler));
          console.log(
            `[mcp:http] proxied stdio server ${descriptor.handler.spec.name} at ${descriptor.path}`,
          );
        }

        await app.listen({ port, host } as any);
        activeProxies.push(...startedProxies);
        console.log(`[mcp:http] listening on http://${host}:${port}`);
      } catch (error) {
        await Promise.allSettled(
          startedProxies.map(async (proxy) => {
            try {
              await proxy.stop();
            } catch {
              /* ignore */
            }
          }),
        );
        throw error;
      }
    },
    stop: async () => {
      await app.close();
      const toStop = activeProxies.splice(0, activeProxies.length);
      await Promise.allSettled(toStop.map((proxy) => proxy.stop()));
    },
  };
};
