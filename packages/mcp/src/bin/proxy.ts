#!/usr/bin/env node
import http from "node:http";
import type { IncomingMessage } from "node:http";
import process from "node:process";
import { URL } from "node:url";

import { loadStdioServerSpecs } from "../proxy/config.js";
import { StdioHttpProxy } from "../proxy/stdio-proxy.js";

const DEFAULT_CONFIG = "config/mcp_servers.edn";
const DEFAULT_PORT = 3923;
const DEFAULT_HOST = "0.0.0.0";

const args = process.argv.slice(2);

const options = {
  config: process.env.MCP_PROXY_CONFIG ?? DEFAULT_CONFIG,
  port: Number.parseInt(process.env.MCP_PROXY_PORT ?? "", 10) || DEFAULT_PORT,
  host: process.env.MCP_PROXY_HOST ?? DEFAULT_HOST,
  prefix: process.env.MCP_PROXY_PREFIX ?? "",
} as {
  config: string;
  port: number;
  host: string;
  prefix: string;
};

const showUsage = (code = 0): never => {
  console.log(`Usage: pnpm --filter @promethean/mcp proxy [options]

Options:
  -c, --config <path>   Path to mcp_servers.edn (default: ${DEFAULT_CONFIG})
  -p, --port <number>   HTTP port to listen on (default: ${DEFAULT_PORT})
  -H, --host <host>     Host interface to bind (default: ${DEFAULT_HOST})
  --prefix <path>       Optional URL prefix to prepend before each server path
  -h, --help            Show this help message
`);
  process.exit(code);
};

for (let i = 0; i < args.length; i += 1) {
  const nextArg = (): string => {
    const nextIndex = i + 1;
    if (nextIndex >= args.length) {
      showUsage(1);
    }
    const value = args[nextIndex];
    if (value === undefined) {
      showUsage(1);
    }
    i = nextIndex;
    return value!;
  };
  const arg = args[i];
  switch (arg) {
    case "-c":
    case "--config": {
      options.config = nextArg();
      break;
    }
    case "-p":
    case "--port": {
      const next = nextArg();
      const parsed = Number.parseInt(next, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        console.error(`Invalid port: ${next}`);
        process.exit(1);
      }
      options.port = parsed;
      break;
    }
    case "-H":
    case "--host": {
      options.host = nextArg();
      break;
    }
    case "--prefix": {
      options.prefix = nextArg();
      break;
    }
    case "-h":
    case "--help":
      showUsage(0);
      break;
    default:
      console.error(`Unknown argument: ${arg}`);
      showUsage(1);
  }
}

const normalizePrefix = (prefix: string): string => {
  if (!prefix) return "";
  const trimmed = prefix.trim();
  if (trimmed === "" || trimmed === "/") return "";
  const leading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return leading.endsWith("/") ? leading.slice(0, -1) : leading;
};

const prefix = normalizePrefix(options.prefix);

const joinPath = (base: string, route: string): string => {
  const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
  if (!base) return normalizedRoute;
  return `${base}${normalizedRoute}`.replace(/\/{2,}/g, "/");
};

const readBody = async (req: IncomingMessage): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const main = async () => {
  const specs = await loadStdioServerSpecs(options.config);
  const proxies = specs.map(
    (spec) =>
      new StdioHttpProxy(spec, (msg: string, ...rest: unknown[]) => {
        console.log(`[proxy:${spec.name}] ${msg}`, ...rest);
      }),
  );

  await Promise.all(
    proxies.map(async (proxy) => {
      await proxy.start();
      console.log(
        `[proxy:${proxy.spec.name}] started command: ${
          proxy.spec.command
        } ${proxy.spec.args.join(" ")}`.trim(),
      );
    }),
  );

  const routeMap = new Map<string, StdioHttpProxy>();
  for (const proxy of proxies) {
    const route = joinPath(prefix, proxy.spec.httpPath);
    if (routeMap.has(route)) {
      throw new Error(`Duplicate HTTP path generated: ${route}`);
    }
    routeMap.set(route, proxy);
    console.log(
      `[proxy:${proxy.spec.name}] available at http://${options.host}:${options.port}${route}`,
    );
  }

  const healthPayload = JSON.stringify({
    ok: true,
    routes: Array.from(routeMap.entries()).map(([path, proxy]) => ({
      path,
      name: proxy.spec.name,
      command: proxy.spec.command,
    })),
  });

  const normalizeRoute = (pathname: string): string => {
    if (pathname.length > 1 && pathname.endsWith("/")) {
      return pathname.replace(/\/+/g, "/").replace(/\/+$/, "");
    }
    return pathname;
  };

  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res
        .writeHead(400, { "content-type": "application/json" })
        .end(JSON.stringify({ error: "bad_request", message: "Missing URL" }));
      return;
    }

    if (
      req.method === "GET" &&
      (req.url === "/healthz" || req.url === "healthz")
    ) {
      res
        .writeHead(200, { "content-type": "application/json" })
        .end(healthPayload);
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const pathname = normalizeRoute(url.pathname);
    const proxy = routeMap.get(pathname);

    if (!proxy) {
      res
        .writeHead(404, { "content-type": "application/json" })
        .end(JSON.stringify({ error: "not_found", path: pathname }));
      return;
    }

    try {
      const body = req.method === "POST" ? await readBody(req) : undefined;
      await proxy.handle(req, res, body);
    } catch (error) {
      console.error(`[proxy:${proxy.spec.name}] request failed:`, error);
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" }).end(
          JSON.stringify({
            error: "proxy_failure",
            message: error instanceof Error ? error.message : String(error),
          }),
        );
      } else {
        res.end();
      }
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => {
      console.log(
        `[proxy] listening on http://${options.host}:${options.port}${
          prefix || "/"
        }`,
      );
      resolve();
    });
  });

  const shutdown = async () => {
    console.log("[proxy] shutting down...");
    await Promise.allSettled(proxies.map((proxy) => proxy.stop()));
    await new Promise<void>((resolve) => server.close(() => resolve()));
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
};

main().catch((error) => {
  console.error("Failed to start MCP stdio proxy:", error);
  process.exit(1);
});
