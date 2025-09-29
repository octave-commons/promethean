import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import httpProxy from "http-proxy";

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

export function start(port = 0, routes = {}) {
  if (currentServer) {
    throw new Error("proxy already running; call stop() before starting again");
  }

  currentRoutes = buildRouteTable(routes);
  currentProxy = httpProxy.createProxyServer({ changeOrigin: true, ws: true });

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
