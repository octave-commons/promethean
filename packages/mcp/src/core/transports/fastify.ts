import Fastify from "fastify";
import crypto from "node:crypto";
import path from "node:path";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import {
  CONFIG_FILE_NAME,
  ConfigSchema,
  type AppConfig,
  type ConfigSource,
  saveConfigFile,
} from "../../config/load-config.js";
import { renderUiPage } from "../../http/ui-page.js";
import { StdioHttpProxy } from "../../proxy/stdio-proxy.js";
import {
  resolveHttpEndpoints,
  type EndpointDefinition,
} from "../resolve-config.js";
import type { Transport } from "../types.js";
import crypto from "node:crypto";
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
      const sidHeader = rawReq.headers["mcp-session-id"] as string | undefined;

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
      } else if (body && isInitializeRequest(body)) {
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

      await transport.handleRequest(rawReq, rawRes, body);
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

const parseProxyBody = (value: unknown): unknown => {
  if (value === null || value === undefined) return undefined;
  if (Buffer.isBuffer(value)) {
    return value.length === 0 ? undefined : value;
  }
  return value;
};

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
      await proxy.handle(rawReq, rawRes, body);
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

const createUiState = (
  options: UiOptions,
  proxies: readonly StdioHttpProxy[],
): UiState => ({
  config: options.config,
  configSource: options.configSource,
  configPath: options.configPath,
  httpEndpoints: options.httpEndpoints,
  availableTools: options.availableTools,
  proxies: proxies.map((proxy) => ({
    name: proxy.spec.name,
    httpPath: normalizePath(proxy.spec.httpPath),
  })),
});

const respond = (reply: any, status: number, payload: unknown): void => {
  reply.status(status).header("content-type", "application/json").send(payload);
};

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
      const entries = toEntries(server);
      const { proxies: proxyList, ui } = parseStartOptions(optionsInput);
    start: async (descriptorInput?: unknown, _options?: unknown) => {
      const descriptors = ensureEndpointDescriptors(descriptorInput);

      if (descriptors.length === 0) {
        throw new Error(
          "fastifyTransport requires at least one MCP server or proxy",
        );
      }

      sessionStores.clear();

      const normalized = descriptors.map((descriptor) =>
        descriptor.kind === "registry"
          ? {
              ...descriptor,
              path: normalizePath(descriptor.path),
            }
          : {
              ...descriptor,
              path: normalizePath(descriptor.path),
            },
      );

      const seenRoutes = new Set<string>();
      for (const descriptor of normalized) {
        if (seenRoutes.has(descriptor.path)) {
          throw new Error(`Duplicate MCP endpoint path: ${descriptor.path}`);
        }
        seenRoutes.add(descriptor.path);
      }

      for (const { route } of normalizedProxies) {
        if (seenRoutes.has(route)) {
          throw new Error(`Duplicate MCP endpoint path: ${route}`);
        }
        seenRoutes.add(route);
      }

      let currentUiState: UiState | undefined;

      if (ui) {
        currentUiState = createUiState(ui, proxyList);

        app.get("/", (_req, reply) => {
          reply
            .status(200)
            .header("content-type", "text/html; charset=utf-8")
            .send(renderUiPage());
        });

        app.get("/ui/state", (_req, reply) => {
          if (!currentUiState) {
            respond(reply, 404, { error: "ui_unavailable" });
            return;
          }
          respond(reply, 200, currentUiState);
        });

        app.post("/ui/chat", async (req, reply) => {
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

            const lower = message.toLowerCase();
            const tools = currentUiState?.availableTools ?? [];
            const endpoints = currentUiState?.httpEndpoints ?? [];
            const proxiesInfo = currentUiState?.proxies ?? [];

            let responseText =
              "Ask about tools, endpoints, or configuration to get more details.";

            if (lower.includes("tool")) {
              responseText =
                tools.length > 0
                  ? `Available tools: ${tools
                      .map((tool) => tool.id)
                      .join(", ")}`
                  : "No tools are currently enabled.";
            } else if (lower.includes("endpoint")) {
              responseText =
                endpoints.length > 0
                  ? `HTTP endpoints: ${endpoints
                      .map(
                        (endpoint) =>
                          `${endpoint.path} (${endpoint.tools.join(", ")})`,
                      )
                      .join("; ")}`
                  : "No HTTP endpoints configured.";
            } else if (lower.includes("config")) {
              responseText = `Configuration file: ${currentUiState?.configPath}`;
              if (proxiesInfo.length > 0) {
                responseText += ` · Proxies: ${proxiesInfo
                  .map((proxy) => `${proxy.name}@${proxy.httpPath}`)
                  .join(", ")}`;
              }
            }

            respond(reply, 200, { reply: responseText });
          } catch (error) {
            console.error("[mcp:http] failed to handle chat message", error);
            respond(reply, 400, { error: "invalid_json" });
          }
        });

        app.post("/ui/config", async (req, reply) => {
          if (!currentUiState) {
            respond(reply, 503, { error: "ui_unavailable" });
            return;
          }

          try {
            const payload = mustParseJson(req.body) as
              | { path?: unknown; config?: unknown }
              | undefined;

            if (!isObject(payload) || !("config" in payload)) {
              respond(reply, 400, {
                error: "invalid_request",
                message: "config payload is required",
              });
              return;
            }

            const targetPath =
              typeof payload.path === "string"
                ? payload.path
                : currentUiState.configSource.type === "file"
                  ? currentUiState.configSource.path
                  : CONFIG_FILE_NAME;

            const resolvedPath = path.isAbsolute(targetPath)
              ? targetPath
              : path.resolve(process.cwd(), targetPath);

            const nextConfig = ConfigSchema.parse(payload.config);
            const savedConfig = saveConfigFile(resolvedPath, nextConfig);
            const nextEndpoints = resolveHttpEndpoints(savedConfig);

            currentUiState = {
              config: savedConfig,
              configSource: { type: "file", path: resolvedPath },
              configPath: resolvedPath,
              httpEndpoints: nextEndpoints,
              availableTools: currentUiState.availableTools,
              proxies: proxyList.map((proxy) => ({
                name: proxy.spec.name,
                httpPath: normalizePath(proxy.spec.httpPath),
              })),
            };

            respond(reply, 200, currentUiState);
          } catch (error: any) {
            console.error("[mcp:http] failed to update config", error);
            respond(reply, 400, {
              error: "invalid_config",
              message: String(error?.message ?? error),
            });
          }
        });
      }

      const startedProxies: StdioHttpProxy[] = [];
      const startedProxies: ProxyLifecycle[] = [];

      try {
        for (const descriptor of normalized) {
          if (descriptor.kind === "registry") {
            const sessions = new Map<string, StreamableHTTPServerTransport>();
            sessionStores.set(descriptor.path, sessions);
            app.post(
              descriptor.path,
              createRouteHandler(descriptor.handler, sessions),
            );
            console.log(`[mcp:http] bound endpoint ${descriptor.path}`);
            continue;
          }

          await descriptor.handler.start();
          startedProxies.push(descriptor.handler);
          app.post(descriptor.path, createProxyHandler(descriptor.handler));
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
