import Fastify from "fastify";
import type { Transport } from "../types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createSessionIdGenerator } from "./session-id.js";
import type { StdioHttpProxy } from "../../proxy/stdio-proxy.js";

const normalizePath = (p: string): string => (p.startsWith("/") ? p : `/${p}`);

const createRouteHandler = (
  server: McpServer,
  sessions: Map<string, StreamableHTTPServerTransport>,
) => {
  const parseBody = (b: unknown): unknown => {
    if (Buffer.isBuffer(b)) {
      try {
        return JSON.parse(b.toString("utf8"));
      } catch {
        return undefined;
      }
    }
    return b;
  };

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
      const body = parseBody(req.body);
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
  const activeProxies = new Set<ProxyLifecycle>();
  const proxyRoutes = new Map<ProxyLifecycle, string>();
  let started = false;

  return {
    start: async (input?: unknown) => {
      if (started) {
        throw new Error("fastifyTransport has already been started");
      }

      const descriptors = ensureEndpointDescriptors(input);
      if (descriptors.length === 0) {
        throw new Error(
          "fastifyTransport requires at least one endpoint descriptor",
        );
      }

      const seenPaths = new Set<string>();
      const proxyList: ProxyLifecycle[] = [];
      const normalizedDescriptors = descriptors.map((descriptor) => ({
        ...descriptor,
        path: normalizePath(descriptor.path),
      }));

      for (const descriptor of normalizedDescriptors) {
        if (seenPaths.has(descriptor.path)) {
          throw new Error(`Duplicate MCP endpoint path: ${descriptor.path}`);
        }
        seenPaths.add(descriptor.path);

        if (descriptor.kind === "registry") {
          const sessions = new Map<string, StreamableHTTPServerTransport>();
          sessionStores.set(descriptor.path, sessions);
          app.post(
            descriptor.path,
            createRouteHandler(descriptor.handler, sessions),
          );
          console.log(`[mcp:http] bound endpoint ${descriptor.path}`);
        } else {
          proxyRoutes.set(descriptor.handler, descriptor.path);
          proxyList.push(descriptor.handler);
          app.all(descriptor.path, createProxyHandler(descriptor.handler));
          console.log(`[mcp:http] bound proxy endpoint ${descriptor.path}`);
        }
      }

      try {
        for (const proxy of proxyList) {
          await proxy.start();
          activeProxies.add(proxy);
          const spec = proxy.spec;
          const command = spec
            ? `${spec.command}${
                spec.args.length > 0 ? ` ${spec.args.join(" ")}` : ""
              }`
            : "<unknown>";
          const proxyPath = proxyRoutes.get(proxy) ?? "<unknown>";
          console.log(
            `[mcp:http] started proxy ${
              spec?.name ?? proxyPath
            }: ${command}`.trim(),
          );
        }

        await app.listen({ port, host } as any);
        started = true;
        console.log(`[mcp:http] listening on http://${host}:${port}`);
      } catch (error) {
        const proxies = [...activeProxies];
        activeProxies.clear();
        proxyRoutes.clear();
        sessionStores.clear();
        await Promise.allSettled(proxies.map((proxy) => proxy.stop()));
        try {
          await app.close();
        } catch {
          /* ignore close errors during startup */
        }
        throw error;
      }
    },
    stop: async () => {
      if (!started) return;
      started = false;

      const proxies = [...activeProxies];
      activeProxies.clear();
      proxyRoutes.clear();
      sessionStores.clear();

      const proxyResults = await Promise.allSettled(
        proxies.map((proxy) => proxy.stop()),
      );

      const errors: unknown[] = proxyResults
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected",
        )
        .map((result) => result.reason);

      let fastifyError: unknown;
      try {
        await app.close();
      } catch (error) {
        fastifyError = error;
      }

      if (fastifyError) {
        errors.push(fastifyError);
      }

      if (errors.length > 0) {
        throw new AggregateError(
          errors,
          "Failed to gracefully stop fastify transport",
        );
      }
    },
  };
};
