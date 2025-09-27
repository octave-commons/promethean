import http from "node:http";
import { readFile } from "node:fs/promises";
import { EventEmitter } from "node:events";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const httpProxyPromise = import("http-proxy")
  .then((mod) => (mod?.default ? mod.default : mod))
  .catch((error) => {
    if (
      error &&
      (error.code === "ERR_MODULE_NOT_FOUND" ||
        error.message?.includes("Cannot find package 'http-proxy'"))
    ) {
      return null;
    }
    throw error;
  });

let warnedAboutMissingHttpProxy = false;

function warnMissingHttpProxy() {
  if (warnedAboutMissingHttpProxy) return;
  warnedAboutMissingHttpProxy = true;
  console.warn(
    "[services/js/proxy] Optional dependency 'http-proxy' not found; falling back to built-in HTTP forwarding (WebSocket proxying disabled).",
  );
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");

const llmRoot = join(repoRoot, "node_modules/@promethean/llm-chat-frontend");
const smartgptRoot = join(
  repoRoot,
  "node_modules/@promethean/smartgpt-dashboard-frontend",
);

const staticFiles = new Map([
  [
    "/llm-chat",
    {
      path: join(llmRoot, "static/index.html"),
      type: "text/html; charset=utf-8",
    },
  ],
  [
    "/llm-chat/",
    {
      path: join(llmRoot, "static/index.html"),
      type: "text/html; charset=utf-8",
    },
  ],
  [
    "/llm-chat/chat.js",
    {
      path: join(llmRoot, "dist/frontend/chat.js"),
      type: "application/javascript",
    },
  ],
  [
    "/llm-chat/tools.js",
    {
      path: join(llmRoot, "dist/frontend/tools.js"),
      type: "application/javascript",
    },
  ],
  [
    "/smartgpt-dashboard",
    {
      path: join(smartgptRoot, "static/index.html"),
      type: "text/html; charset=utf-8",
    },
  ],
  [
    "/smartgpt-dashboard/",
    {
      path: join(smartgptRoot, "static/index.html"),
      type: "text/html; charset=utf-8",
    },
  ],
  [
    "/smartgpt-dashboard/main.js",
    {
      path: join(smartgptRoot, "dist/frontend/main.js"),
      type: "application/javascript",
    },
  ],
  [
    "/smartgpt-dashboard/styles.css",
    {
      path: join(smartgptRoot, "static/styles.css"),
      type: "text/css; charset=utf-8",
    },
  ],
  [
    "/smartgpt-dashboard/wc/components.js",
    {
      path: join(smartgptRoot, "dist/frontend/wc/components.js"),
      type: "application/javascript",
    },
  ],
  [
    "/main.js",
    {
      path: join(smartgptRoot, "dist/frontend/main.js"),
      type: "application/javascript",
    },
  ],
  [
    "/styles.css",
    {
      path: join(smartgptRoot, "static/styles.css"),
      type: "text/css; charset=utf-8",
    },
  ],
  [
    "/wc/components.js",
    {
      path: join(smartgptRoot, "dist/frontend/wc/components.js"),
      type: "application/javascript",
    },
  ],
]);

let currentServer = null;
let currentProxy = null;
let currentRoutes = [];

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function normaliseHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers || {})
      .filter(([, value]) => typeof value !== "undefined")
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(", ") : String(value ?? ""),
      ]),
  );
}

async function collectRequestBody(req, method) {
  if (!method || method === "GET" || method === "HEAD") {
    return undefined;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) return undefined;
  return Buffer.concat(chunks);
}

async function forwardHttpRequest(req, res, options) {
  const target = options?.target;
  if (!target) {
    throw new Error("proxy target is required");
  }

  const base = new URL(target);
  const forwardUrl = new URL(req.url || "/", base);
  const method = req.method || "GET";

  const headers = normaliseHeaders(req.headers);
  for (const header of hopByHopHeaders) {
    delete headers[header];
  }
  if (options?.changeOrigin) {
    headers.host = forwardUrl.host;
  }

  const body = await collectRequestBody(req, method);
  if (!body) {
    delete headers["content-length"];
  } else {
    headers["content-length"] = String(body.length);
  }

  const init = {
    method,
    headers,
  };
  if (body && body.length > 0) {
    init.body = body;
    init.duplex = "half";
  }

  const response = await fetch(forwardUrl, init);

  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  const setCookie = response.headers.getSetCookie?.() ?? [];
  response.headers.forEach((value, key) => {
    if (key === "set-cookie" || hopByHopHeaders.has(key)) return;
    res.setHeader(key, value);
  });
  if (setCookie.length > 0) {
    res.setHeader("set-cookie", setCookie);
  }

  if (
    method === "HEAD" ||
    response.status === 204 ||
    response.status === 304 ||
    !response.body
  ) {
    res.end();
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}

function createFallbackProxy() {
  warnMissingHttpProxy();
  const emitter = new EventEmitter();

  return {
    web(req, res, options) {
      forwardHttpRequest(req, res, options).catch((error) => {
        emitter.emit("error", error, req, res);
      });
    },
    ws(req, socket) {
      const error = new Error(
        "WebSocket proxying requires the optional 'http-proxy' dependency.",
      );
      emitter.emit("error", error, req, undefined);
      if (socket.writable) {
        socket.write(
          "HTTP/1.1 502 Bad Gateway\r\n" +
            "Content-Type: application/json\r\n" +
            "Connection: close\r\n\r\n" +
            JSON.stringify({
              error: "proxy_ws_unavailable",
              message: error.message,
            }),
        );
      }
      socket.destroy();
    },
    close() {
      emitter.removeAllListeners();
    },
    on(event, listener) {
      emitter.on(event, listener);
    },
    off(event, listener) {
      emitter.off(event, listener);
    },
  };
}

async function createProxyServer(options) {
  const httpProxy = await httpProxyPromise;
  if (httpProxy) {
    return httpProxy.createProxyServer(options);
  }
  return createFallbackProxy();
}

function buildRouteTable(routes) {
  return Object.entries(routes || {})
    .filter(
      ([prefix, target]) =>
        typeof prefix === "string" && prefix.startsWith("/"),
    )
    .map(([prefix, target]) => ({ prefix, target: String(target) }))
    .sort((a, b) => b.prefix.length - a.prefix.length);
}

async function tryServeStatic(req, res) {
  const url = req.url || "/";
  const entry = staticFiles.get(url);
  if (!entry) return false;
  try {
    const buf = await readFile(entry.path);
    res.statusCode = 200;
    res.setHeader("Content-Type", entry.type);
    res.setHeader("Cache-Control", "no-cache");
    res.end(buf);
  } catch (err) {
    res.statusCode = 404;
    res.end("Not found");
  }
  return true;
}

export async function start(port = 0, routes = {}) {
  if (currentServer) {
    throw new Error("proxy already running; call stop() before starting again");
  }

  currentRoutes = buildRouteTable(routes);
  currentProxy = await createProxyServer({ changeOrigin: true, ws: true });

  currentProxy.on("error", (err, req, res) => {
    if (!res || res.headersSent) return;
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "proxy_error", message: err.message }));
  });

  const server = http.createServer(async (req, res) => {
    if (await tryServeStatic(req, res)) return;

    const match = currentRoutes.find(({ prefix }) =>
      (req.url || "").startsWith(prefix),
    );
    if (match) {
      const originalUrl = req.url || "/";
      const remainder = originalUrl.slice(match.prefix.length) || "/";
      req.url = remainder.startsWith("/") ? remainder : `/${remainder}`;
      currentProxy.web(req, res, { target: match.target, changeOrigin: true });
      return;
    }

    res.statusCode = 404;
    res.end("Not found");
  });

  server.on("upgrade", (req, socket, head) => {
    const match = currentRoutes.find(({ prefix }) =>
      (req.url || "").startsWith(prefix),
    );
    if (!match) {
      socket.destroy();
      return;
    }
    const remainder = (req.url || "/").slice(match.prefix.length) || "/";
    req.url = remainder.startsWith("/") ? remainder : `/${remainder}`;
    currentProxy.ws(req, socket, head, {
      target: match.target,
      changeOrigin: true,
    });
  });

  server.listen(port);
  currentServer = server;
  return server;
}

export async function stop() {
  if (!currentServer) return;
  const server = currentServer;
  currentServer = null;
  currentRoutes = [];
  const proxy = currentProxy;
  currentProxy = null;

  await new Promise((resolve) => server.close(resolve));
  if (proxy) {
    proxy.close();
  }
}
