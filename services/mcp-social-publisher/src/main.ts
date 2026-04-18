import "dotenv/config";
import path from "node:path";
import { pathToFileURL } from "node:url";

import cors from "cors";
import express from "express";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpAuthRouter, getOAuthProtectedResourceMetadataUrl } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createMcpHttpRouter, createMcpServer } from "@workspace/aether";

import { FilePersistence } from "./auth/filePersistence.js";
import { SimpleOAuthProvider } from "./auth/simpleOAuthProvider.js";
import { publishBlueskyPost } from "./publishers/bluesky.js";
import { publishDiscordMessage } from "./publishers/discord.js";
import { ConfigStore } from "./state/configStore.js";
import { installUi } from "./ui.js";

const ENV = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(10000),
  PUBLIC_BASE_URL: z.string().url().optional(),
  ISSUER_URL: z.string().url().optional(),
  DATA_DIR: z.string().optional(),
  ADMIN_AUTH_KEY: z.string().min(12),
  INITIAL_GITHUB_ALLOWED_USERS: z.string().optional(),
  AUTO_APPROVE: z.string().optional(),
  ALLOW_UNAUTH_LOCAL: z.string().optional(),
}).parse(process.env);

const publicBaseUrl = new URL(ENV.PUBLIC_BASE_URL ?? process.env.RENDER_EXTERNAL_URL ?? `http://127.0.0.1:${ENV.PORT}`);
const issuerUrl = new URL(ENV.ISSUER_URL ?? publicBaseUrl.toString());
const resourceServerUrl = new URL("/mcp", publicBaseUrl);
const dataDir = path.resolve(
  ENV.DATA_DIR ?? (process.env.RENDER === "true" ? "/tmp/mcp-social-publisher" : path.join(process.cwd(), "data")),
);

const persistence = new FilePersistence(path.join(dataDir, "oauth-store.json"));
await persistence.init();

const configStore = new ConfigStore(path.join(dataDir, "config.json"), {
  initialGitHubUsers: splitList(ENV.INITIAL_GITHUB_ALLOWED_USERS),
});
await configStore.init();

const oauth = new SimpleOAuthProvider(
  publicBaseUrl,
  toBool(ENV.AUTO_APPROVE, true),
  [
    {
      client_id: "mcp_client_1761003752457_1krtcyb4oxe",
      client_secret: "",
      client_name: "ChatGPT",
      redirect_uris: ["https://chatgpt.com/connector_platform_oauth_redirect"],
      token_endpoint_auth_method: "client_secret_basic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    },
  ],
  24 * 60 * 60,
  30 * 24 * 60 * 60,
  persistence,
);

const app = express();
const jsonParser = express.json({ limit: "1mb" });

app.set("trust proxy", true);
app.use(cors({ origin: "*", exposedHeaders: ["mcp-session-id"] }));
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mcp-social-publisher",
    publicBaseUrl: publicBaseUrl.toString(),
    githubOAuthConfigured: configStore.hasGitHubOAuthConfig(),
    allowlistCount: configStore.getSnapshot().allowedGitHubUsers.length,
    targetCount: configStore.getPublicTargets().length,
  });
});

app.use(mcpAuthRouter({
  provider: oauth,
  issuerUrl,
  baseUrl: publicBaseUrl,
  resourceServerUrl,
  scopesSupported: ["mcp"],
  resourceName: "mcp-social-publisher",
}));

installUi(app, oauth, {
  publicBaseUrl,
  adminAuthKey: ENV.ADMIN_AUTH_KEY,
  configStore,
});

const server = createMcpServer({
  name: "mcp-social-publisher",
  version: "0.1.0",
  register: (serverInstance: McpServer) => {
    serverInstance.registerTool(
      "publisher_list_targets",
      {
        description: "List configured Bluesky and Discord publishing targets",
        inputSchema: {},
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      },
      async (): Promise<CallToolResult> => ({
        content: [{ type: "text", text: JSON.stringify(configStore.getPublicTargets(), null, 2) }],
      }),
    );

    serverInstance.registerTool(
      "publisher_publish_bluesky",
      {
        description: "Publish a post to a configured Bluesky target",
        inputSchema: {
          target: z.string().min(1).describe("Configured Bluesky target name or id"),
          text: z.string().min(1).max(300).describe("Bluesky post text, up to 300 characters"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
      },
      async ({ target, text }): Promise<CallToolResult> => {
        const binding = configStore.getBlueskyTarget(target);
        if (!binding) {
          throw new Error(`Unknown Bluesky target: ${target}`);
        }
        const result = await publishBlueskyPost(binding, text);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    );

    serverInstance.registerTool(
      "publisher_publish_discord",
      {
        description: "Publish a message to a configured Discord target",
        inputSchema: {
          target: z.string().min(1).describe("Configured Discord target name or id"),
          content: z.string().min(1).max(2000).describe("Discord message content, up to 2000 characters"),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
      },
      async ({ target, content }): Promise<CallToolResult> => {
        const binding = configStore.getDiscordTarget(target);
        if (!binding) {
          throw new Error(`Unknown Discord target: ${target}`);
        }
        const result = await publishDiscordMessage(binding, content);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    );
  },
});

const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(resourceServerUrl);
const bearer = requireBearerAuth({
  verifier: oauth,
  requiredScopes: ["mcp"],
  resourceMetadataUrl,
});

const mcpRouter = createMcpHttpRouter({
  createServer: () => server,
});

const maybeBearer: express.RequestHandler = (req, res, next) => {
  if (toBool(ENV.ALLOW_UNAUTH_LOCAL, false) && isLoopbackRequest(req)) {
    next();
    return;
  }
  bearer(req, res, next);
};

app.post("/mcp", jsonParser, maybeBearer, async (req, res) => {
  await mcpRouter.handlePost(req, res);
});

app.get("/mcp", maybeBearer, async (req, res) => {
  await mcpRouter.handleSession(req, res);
});

app.delete("/mcp", maybeBearer, async (req, res) => {
  await mcpRouter.handleSession(req, res);
});

const listener = app.listen(ENV.PORT, "0.0.0.0", () => {
  console.log(`[mcp-social-publisher] listening on ${ENV.PORT}`);
  console.log(`[mcp-social-publisher] public base ${publicBaseUrl.toString()}`);
});

const cleanup = async (): Promise<void> => {
  await oauth.stop();
  listener.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void cleanup();
});

process.on("SIGTERM", () => {
  void cleanup();
});

const entryArg = process.argv[1];
if (!entryArg || import.meta.url !== pathToFileURL(entryArg).href) {
  // module imported for tests
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function isLoopbackRequest(req: express.Request): boolean {
  const remote = req.socket.remoteAddress ?? "";
  const forwardedFor = String(req.headers["x-forwarded-for"] ?? "").split(",")[0]?.trim() ?? "";
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").toLowerCase();
  const bareHost = host.startsWith("[") ? host.slice(1, host.indexOf("]")) : host.split(":")[0] ?? "";
  return isLoopbackAddress(remote) && (!forwardedFor || isLoopbackAddress(forwardedFor)) && (!bareHost || bareHost === "localhost" || bareHost === "127.0.0.1" || bareHost === "::1");
}

function isLoopbackAddress(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized === "::1" || normalized === "127.0.0.1" || normalized === "::ffff:127.0.0.1" || normalized.startsWith("127.");
}
