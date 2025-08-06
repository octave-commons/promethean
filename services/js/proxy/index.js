import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

export const app = express();

const defaultRoutes = {
  "/tts": "http://127.0.0.1:5001",
  "/stt": "http://127.0.0.1:5002",
  "/vision": "http://127.0.0.1:9999",
  "/llm": "http://127.0.0.1:8888",
  "/heartbeat": "http://127.0.0.1:5005",
};

function applyRoutes(routes) {
  for (const [prefix, target] of Object.entries(routes)) {
    app.use(
      prefix,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`^${prefix}`]: "" },
      }),
    );
  }
}

let server;

export async function start(
  port = process.env.PORT || 8080,
  routes = defaultRoutes,
) {
  applyRoutes(routes);
  server = app.listen(port, () => {
    console.log(`proxy service listening on ${port}`);
  });
  return server;
}

export async function stop() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
}

if (process.env.NODE_ENV !== "test") {
  start().catch((err) => {
    console.error("Failed to start proxy service", err);
    process.exit(1);
  });
}
