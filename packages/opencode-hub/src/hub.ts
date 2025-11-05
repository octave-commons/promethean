import Fastify from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import { WebSocketServer } from "ws";
import { HubConfig, Repo, ChatMessage } from "./types.js";

export function createHubServer(cfg: HubConfig, repos: Map<string, Repo>) {
  const app = Fastify({ logger: true });

  app.get("/api/repos", async () => Array.from(repos.values()));

  // Proxy: /repo/:id/* -> opencode server for that repo
  app.register(fastifyHttpProxy, {
    upstream: "",
    prefix: "/repo",
    rewritePrefix: "",
    async preHandler(req, reply) {
      const [_, repoId, ...rest] = req.url.split("/");
      const r = repos.get(repoId);
      if (!r?.port) return reply.code(404).send({ error: "repo not running" });
      // @ts-ignore
      this.upstream = `http://127.0.0.1:${r.port}`;
      // @ts-ignore
      req.url = "/" + rest.join("/");
    }
  });

  app.get("/", async (_req, reply) => {
    reply.header("content-type","text/html");
    reply.send(`<!doctype html><meta http-equiv="refresh" content="0; url=/ui/index.html">`);
  });

  // Static UI
  app.register(import("@fastify/static")).then(() => {
    // dynamic import of @fastify/static at runtime
  });
  // Workaround dynamic import for ESM
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const staticPlugin = (await import("@fastify/static")).default;
    const { fileURLToPath } = await import("node:url");
    const { dirname, join } = await import("node:path");
    const __dirname = dirname(fileURLToPath(import.meta.url));
    app.register(staticPlugin, { root: join(__dirname, "../ui/resources/public"), prefix: "/ui/" });
  })();

  const server = app;

  // WebSocket for chat (very simple broadcast bus for now)
  const wss = new WebSocketServer({ noServer: true });

  // Upgrade handler to route /ws
  // @ts-ignore
  server.server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/ws")) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws) => {
    ws.on("message", async (buf) => {
      try {
        const msg = JSON.parse(String(buf)) as ChatMessage;
        // For now, echo
        const reply = { ...msg, id: `${msg.id}-reply`, role: "assistant", text: `ack: ${msg.text}`, ts: Date.now() };
        ws.send(JSON.stringify(reply));
      } catch (e) {
        ws.send(JSON.stringify({ error: String(e) }));
      }
    });
  });

  return app;
}