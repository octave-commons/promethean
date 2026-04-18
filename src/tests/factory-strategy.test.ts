import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server } from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { FastifyInstance } from "fastify";

import { createApp } from "../app.js";
import type { ProxyConfig } from "../lib/config.js";
import {
  getFactoryModelType,
  getFactoryApiProvider,
  getFactoryEndpointPath,
  buildFactoryCommonHeaders,
  buildFactoryAnthropicHeaders,
  inlineSystemPrompt,
  sanitizeFactorySystemPrompt,
  isFkKey,
} from "../lib/factory-compat.js";
import type { ProviderCredential } from "../lib/key-pool.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readRequestBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

interface TestContext {
  readonly app: FastifyInstance;
  readonly upstream: Server;
  readonly tempDir: string;
}

async function withProxyApp(
  options: {
    readonly keys: readonly string[];
    readonly keysPayload?: unknown;
    readonly models?: unknown;
    readonly handleModelCatalog?: boolean;
    readonly configOverrides?: Partial<ProxyConfig>;
    readonly upstreamHandler: (
      request: IncomingMessage,
      body: string,
    ) => Promise<{ status: number; headers?: Record<string, string>; body: string }>;
  },
  fn: (ctx: TestContext) => Promise<void>,
): Promise<void> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "factory-strategy-test-"));
  const keysPath = path.join(tempDir, "keys.json");
  const modelsPath = path.join(tempDir, "models.json");
  const requestLogsPath = path.join(tempDir, "request-logs.jsonl");
  const promptAffinityPath = path.join(tempDir, "prompt-affinity.json");
  const settingsPath = path.join(tempDir, "proxy-settings.json");

  const keysPayload = options.keysPayload ?? { keys: options.keys };
  await writeFile(keysPath, JSON.stringify(keysPayload, null, 2), "utf8");
  if (options.models) {
    await writeFile(modelsPath, JSON.stringify(options.models, null, 2), "utf8");
  }

  const upstream = createServer(async (request, response) => {
    const body = await readRequestBody(request);
    const shouldBypassHandler =
      (request.method === "GET" && request.url === "/v1/models")
      || (request.method === "GET" && request.url === "/api/tags");

    if (shouldBypassHandler && !options.handleModelCatalog) {
      response.statusCode = 404;
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ error: { message: "catalog not configured" } }));
      return;
    }

    try {
      const result = await options.upstreamHandler(request, body);
      response.statusCode = result.status;
      if (result.headers) {
        for (const [name, value] of Object.entries(result.headers)) {
          response.setHeader(name, value);
        }
      }
      response.end(result.body);
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ error: { message: String(error) } }));
    }
  });

  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const address = upstream.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve upstream server address");
  }

  const config: ProxyConfig = {
    host: "127.0.0.1",
    port: 0,
    upstreamProviderId: "vivgrid",
    upstreamFallbackProviderIds: [],
    disabledProviderIds: [],
    upstreamProviderBaseUrls: {
      vivgrid: `http://127.0.0.1:${address.port}`,
      "ollama-cloud": `http://127.0.0.1:${address.port}`,
      openai: `http://127.0.0.1:${address.port}`,
      openrouter: `http://127.0.0.1:${address.port}`,
      requesty: `http://127.0.0.1:${address.port}`,
      gemini: `http://127.0.0.1:${address.port}`,
      factory: `http://127.0.0.1:${address.port}`,
    },
    upstreamBaseUrl: `http://127.0.0.1:${address.port}`,
    openaiProviderId: "openai",
    openaiBaseUrl: `http://127.0.0.1:${address.port}`,
    openaiApiBaseUrl: `http://127.0.0.1:${address.port}`,
    openaiImagesUpstreamMode: "auto",
    ollamaBaseUrl: `http://127.0.0.1:${address.port}`,
    localOllamaEnabled: false,
    localOllamaModelPatterns: [],
    chatCompletionsPath: "/v1/chat/completions",
    openaiChatCompletionsPath: "/v1/chat/completions",
    messagesPath: "/v1/messages",
    messagesModelPrefixes: ["claude-"],
    messagesInterleavedThinkingBeta: "interleaved-thinking-2025-05-14",
    responsesPath: "/v1/responses",
    openaiResponsesPath: "/v1/responses",
    openaiImagesGenerationsPaths: ["/v1/images/generations", "/images/generations", "/codex/images/generations"],
    imageCostUsdDefault: 0,
    imageCostUsdByProvider: {},
    imagesGenerationsPath: "/v1/images/generations",
    responsesModelPrefixes: ["gpt-"],
    ollamaChatPath: "/api/chat",
    ollamaV1ChatPath: "/v1/chat/completions",
    factoryModelPrefixes: ["factory/", "factory:"],
    openaiModelPrefixes: ["openai/", "openai:"],
    ollamaModelPrefixes: ["ollama/", "ollama:"],
    keysFilePath: keysPath,
    modelsFilePath: modelsPath,
    requestLogsFilePath: requestLogsPath,
    requestLogsMaxEntries: 100000,
    requestLogsFlushMs: 0,
    promptAffinityFilePath: promptAffinityPath,
    promptAffinityFlushMs: 0,
    settingsFilePath: settingsPath,
    keyReloadMs: 50,
    keyCooldownMs: 10000,
    requestTimeoutMs: 2000,
    streamBootstrapTimeoutMs: 2000,
    upstreamTransientRetryCount: 0,
    upstreamTransientRetryBackoffMs: 1,
    allowUnauthenticated: true,
    databaseUrl: undefined,
    githubOAuthClientId: undefined,
    githubOAuthClientSecret: undefined,
    githubOAuthCallbackPath: "/auth/github/callback",
    githubAllowedUsers: [],
    sessionSecret: "test-session-token", // pragma: allowlist secret
    openaiOauthScopes: "openid profile email offline_access",
    openaiOauthClientId: "app_EMoamEEZ73f0CkXaXp7hrann",
    openaiOauthIssuer: "https://auth.openai.com",
    ...options.configOverrides,
    proxyTokenPepper: options.configOverrides?.proxyTokenPepper ?? "test-proxy-token-pepper",
    oauthRefreshMaxConcurrency: options.configOverrides?.oauthRefreshMaxConcurrency ?? 32,
    oauthRefreshBackgroundIntervalMs: options.configOverrides?.oauthRefreshBackgroundIntervalMs ?? 15_000,
    oauthRefreshProactiveWindowMs: options.configOverrides?.oauthRefreshProactiveWindowMs ?? 30 * 60_000,
  };

  const app = await createApp(config);
  try {
    await fn({ app, upstream, tempDir });
  } finally {
    await app.close();
    await new Promise<void>((resolve, reject) => {
      upstream.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function withEnv(values: Record<string, string | undefined>, fn: () => Promise<void>): Promise<void> {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    await fn();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

// ─── Unit Tests: Model Type Classification ──────────────────────────────────

// VAL-ROUTE-005: Model-to-type mapping selects correct strategy

test("getFactoryModelType maps claude-* to anthropic", () => {
  assert.equal(getFactoryModelType("claude-opus-4-5"), "anthropic");
  assert.equal(getFactoryModelType("claude-3.5-sonnet"), "anthropic");
  assert.equal(getFactoryModelType("Claude-Opus-4-5"), "anthropic");
});

test("getFactoryModelType maps gpt-* to openai", () => {
  assert.equal(getFactoryModelType("gpt-5"), "openai");
  assert.equal(getFactoryModelType("gpt-5.4"), "openai");
  assert.equal(getFactoryModelType("GPT-5"), "openai");
});

test("getFactoryModelType maps other models to common", () => {
  assert.equal(getFactoryModelType("gemini-3-pro-preview"), "common");
  assert.equal(getFactoryModelType("glm-5"), "common");
  assert.equal(getFactoryModelType("Kimi-K2.5"), "common");
  assert.equal(getFactoryModelType("DeepSeek-V3.2"), "common");
  assert.equal(getFactoryModelType("minimax-pro"), "common");
});

// VAL-HEADER-002: x-api-provider mapping

test("getFactoryApiProvider returns correct provider for each model family", () => {
  assert.equal(getFactoryApiProvider("claude-opus-4-5"), "anthropic");
  assert.equal(getFactoryApiProvider("gpt-5"), "openai");
  assert.equal(getFactoryApiProvider("gemini-3-pro-preview"), "google");
  assert.equal(getFactoryApiProvider("glm-5"), "fireworks");
  assert.equal(getFactoryApiProvider("Kimi-K2.5"), "fireworks");
  assert.equal(getFactoryApiProvider("minimax-pro"), "fireworks");
  assert.equal(getFactoryApiProvider("DeepSeek-V3.2"), "fireworks");
});

// ─── Unit Tests: Endpoint Path ──────────────────────────────────────────────

// VAL-ROUTE-007: Factory upstream URLs use /api/llm/ path prefixes

test("getFactoryEndpointPath returns correct path for each model type", () => {
  assert.equal(getFactoryEndpointPath("anthropic"), "/api/llm/a/v1/messages");
  assert.equal(getFactoryEndpointPath("openai"), "/api/llm/o/v1/responses");
  assert.equal(getFactoryEndpointPath("common"), "/api/llm/o/v1/chat/completions");
});

// ─── Unit Tests: Headers ────────────────────────────────────────────────────

// VAL-HEADER-001, VAL-HEADER-002, VAL-HEADER-003, VAL-HEADER-010, VAL-HEADER-011

test("buildFactoryCommonHeaders includes all required Factory headers", () => {
  const headers = buildFactoryCommonHeaders("gemini-3-pro-preview");

  assert.equal(headers["x-factory-client"], "cli");
  assert.equal(headers["x-api-provider"], "google");
  assert.ok(UUID_REGEX.test(headers["x-session-id"] ?? ""), "x-session-id should be a UUID");
  assert.ok(UUID_REGEX.test(headers["x-assistant-message-id"] ?? ""), "x-assistant-message-id should be a UUID");
  assert.equal(headers["user-agent"], "factory-cli/0.74.0");
  assert.equal(headers["connection"], "keep-alive");

  // Stainless SDK headers
  assert.equal(headers["x-stainless-lang"], "js");
  assert.equal(headers["x-stainless-os"], "Linux");
  assert.equal(headers["x-stainless-runtime"], "node");
  assert.equal(headers["x-stainless-arch"], "x64");
  assert.equal(headers["x-stainless-retry-count"], "0");
  assert.equal(headers["x-stainless-package-version"], "0.70.1");
  assert.equal(headers["x-stainless-runtime-version"], "v24.3.0");
});

// VAL-HEADER-004, VAL-HEADER-009: Anthropic-specific headers

test("buildFactoryAnthropicHeaders includes anthropic-specific headers", () => {
  const headers = buildFactoryAnthropicHeaders("claude-opus-4-5", { model: "claude-opus-4-5", messages: [] });

  assert.equal(headers["anthropic-version"], "2023-06-01");
  assert.equal(headers["x-api-key"], "placeholder");
  assert.equal(headers["x-client-version"], "0.74.0");
  assert.equal(headers["x-stainless-timeout"], "600");
  assert.equal(headers["x-factory-client"], "cli");
  assert.equal(headers["x-api-provider"], "anthropic");
});

test("buildFactoryAnthropicHeaders adds anthropic-beta when thinking enabled", () => {
  const thinkingPayload = {
    model: "claude-opus-4-5",
    messages: [],
    thinking: { type: "enabled", budget_tokens: 12288 },
  };
  const headers = buildFactoryAnthropicHeaders("claude-opus-4-5", thinkingPayload, "interleaved-thinking-2025-05-14");

  assert.equal(headers["anthropic-beta"], "interleaved-thinking-2025-05-14");
});

test("buildFactoryAnthropicHeaders omits anthropic-beta when thinking not enabled", () => {
  const noThinkingPayload = { model: "claude-opus-4-5", messages: [] };
  const headers = buildFactoryAnthropicHeaders("claude-opus-4-5", noThinkingPayload, "interleaved-thinking-2025-05-14");

  assert.equal(headers["anthropic-beta"], undefined);
});

// ─── Unit Tests: System Prompt Inlining ─────────────────────────────────────

// VAL-HEADER-005: System prompt handling for fk- keys

test("inlineSystemPrompt moves string system content into first user message", () => {
  const payload = {
    model: "claude-opus-4-5",
    system: "You are a helpful assistant.",
    messages: [
      { role: "user", content: "Hello" },
    ],
  };

  const result = inlineSystemPrompt(payload);
  assert.equal(result["system"], undefined);
  const messages = result["messages"] as Record<string, unknown>[];
  assert.equal(messages.length, 1);
  assert.equal(messages[0]?.["content"], "You are a helpful assistant.\n\nHello");
});

test("inlineSystemPrompt handles array system content", () => {
  const payload = {
    model: "claude-opus-4-5",
    system: [
      { type: "text", text: "System instruction 1" },
      { type: "text", text: "System instruction 2" },
    ],
    messages: [
      { role: "user", content: "Hello" },
    ],
  };

  const result = inlineSystemPrompt(payload);
  assert.equal(result["system"], undefined);
  const messages = result["messages"] as Record<string, unknown>[];
  assert.equal(messages.length, 1);
  assert.equal(messages[0]?.["content"], "System instruction 1\nSystem instruction 2\n\nHello");
});

test("inlineSystemPrompt passes through payload without system", () => {
  const payload = {
    model: "claude-opus-4-5",
    messages: [
      { role: "user", content: "Hello" },
    ],
  };

  const result = inlineSystemPrompt(payload);
  assert.equal(result["system"], undefined);
  const messages = result["messages"] as Record<string, unknown>[];
  assert.equal(messages.length, 1);
  assert.equal(messages[0]?.["content"], "Hello");
});

test("inlineSystemPrompt handles array content on first user message", () => {
  const payload = {
    model: "claude-opus-4-5",
    system: "Be helpful.",
    messages: [
      { role: "user", content: [{ type: "text", text: "Hi" }] },
    ],
  };

  const result = inlineSystemPrompt(payload);
  assert.equal(result["system"], undefined);
  const messages = result["messages"] as Record<string, unknown>[];
  const firstContent = messages[0]?.["content"];
  assert.ok(Array.isArray(firstContent));
  assert.equal((firstContent as Record<string, unknown>[]).length, 2);
  assert.equal((firstContent as Record<string, unknown>[])[0]?.["text"], "Be helpful.");
});

test("sanitizeFactorySystemPrompt replaces OpenCode system prompt", () => {
  const prompt = "You are OpenCode, the best coding agent on the planet.\n\nTool usage rules...";
  const sanitized = sanitizeFactorySystemPrompt(prompt);
  assert.notEqual(sanitized, prompt);
  assert.ok(!sanitized.includes("OpenCode"));
  assert.ok(sanitized.toLowerCase().includes("software engineering assistant"));
});

test("sanitizeFactorySystemPrompt leaves normal prompts unchanged", () => {
  const prompt = "You are a helpful assistant.";
  assert.equal(sanitizeFactorySystemPrompt(prompt), prompt);
});

// ─── Unit Tests: isFkKey ────────────────────────────────────────────────────

test("isFkKey detects fk- prefixed API keys", () => {
  const fkCredential: ProviderCredential = {
    providerId: "factory",
    accountId: "test-1",
    token: "fk-abc123",
    authType: "api_key",
  };
  const oauthCredential: ProviderCredential = {
    providerId: "factory",
    accountId: "test-2",
    token: "eyJ...",
    authType: "oauth_bearer",
    refreshToken: "rt-123",
  };

  assert.equal(isFkKey(fkCredential), true);
  assert.equal(isFkKey(oauthCredential), false);
});

// ─── Integration Tests: Endpoint Routing ────────────────────────────────────

// VAL-ROUTE-001: Claude models route to Factory Anthropic Messages endpoint

test("factory/claude-* routes to /api/llm/a/v1/messages", { concurrency: false }, async () => {
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (request, _body) => {
            capturedUrl = request.url ?? "";
            capturedHeaders = {};
            for (const [name, value] of Object.entries(request.headers)) {
              if (typeof value === "string") {
                capturedHeaders[name] = value;
              }
            }

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_123",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "Hello from Factory Claude" }],
                model: "claude-opus-4-5",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/claude-opus-4-5",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(response.statusCode, 200);
          assert.equal(capturedUrl, "/api/llm/a/v1/messages");

          // Verify Factory-specific headers
          assert.equal(capturedHeaders["x-factory-client"], "cli");
          assert.equal(capturedHeaders["x-api-provider"], "anthropic");
          assert.equal(capturedHeaders["anthropic-version"], "2023-06-01");
          assert.equal(capturedHeaders["x-api-key"], "placeholder");
          assert.equal(capturedHeaders["user-agent"], "factory-cli/0.74.0");
          assert.ok(UUID_REGEX.test(capturedHeaders["x-session-id"] ?? ""));
          assert.ok(UUID_REGEX.test(capturedHeaders["x-assistant-message-id"] ?? ""));

          // Verify stainless headers
          assert.equal(capturedHeaders["x-stainless-lang"], "js");
          assert.equal(capturedHeaders["x-stainless-os"], "Linux");
          assert.equal(capturedHeaders["x-stainless-runtime"], "node");

          // Verify response was translated to chat completion format
          const payload = response.json();
          assert.ok(isRecord(payload));
          assert.equal(payload["object"], "chat.completion");
          const choices = payload["choices"];
          assert.ok(Array.isArray(choices));
          assert.ok(choices.length > 0);
        },
      );
    },
  );
});

test("factory/claude-* injects default max_tokens when absent", { concurrency: false }, async () => {
  let capturedBody = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (_request, body) => {
            capturedBody = body;
            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_factory_default_tokens",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "ok" }],
                model: "claude-opus-4-6",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/claude-opus-4-6",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(response.statusCode, 200);
          const parsedBody = JSON.parse(capturedBody) as Record<string, unknown>;
          assert.equal(parsedBody["max_tokens"], 4096);
        },
      );
    },
  );
});

test("factory/claude-* clamps thinking budget below injected default max_tokens", { concurrency: false }, async () => {
  let capturedBody = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (_request, body) => {
            capturedBody = body;
            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_factory_reasoning_budget",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "ok" }],
                model: "claude-opus-4-6",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/claude-opus-4-6",
              messages: [{ role: "user", content: "hello" }],
              reasoning_effort: "high",
            },
          });

          assert.equal(response.statusCode, 200);
          const parsedBody = JSON.parse(capturedBody) as Record<string, unknown>;
          assert.equal(parsedBody["max_tokens"], 4096);
          assert.ok(isRecord(parsedBody["thinking"]));
          assert.equal(parsedBody["thinking"]["budget_tokens"], 4095);
        },
      );
    },
  );
});

test("claude-opus-4-6 automatically routes to Factory first", { concurrency: false }, async () => {
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: {
            providers: {
              openai: {
                auth: "oauth_bearer",
                accounts: [{ id: "openai-1", access_token: "openai-token" }],
              },
              requesty: {
                auth: "api_key",
                accounts: [{ id: "requesty-1", api_key: "requesty-token" }],
              },
            },
          },
          configOverrides: {
            upstreamProviderId: "openai",
            upstreamFallbackProviderIds: ["requesty"],
          },
          upstreamHandler: async (request, _body) => {
            capturedUrl = request.url ?? "";
            capturedHeaders = {};
            for (const [name, value] of Object.entries(request.headers)) {
              if (typeof value === "string") {
                capturedHeaders[name] = value;
              }
            }

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_factory_auto",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "Factory auto route OK" }],
                model: "claude-opus-4-6",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "claude-opus-4-6",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(response.statusCode, 200);
          assert.equal(capturedUrl, "/api/llm/a/v1/messages");
          assert.equal(capturedHeaders["x-api-provider"], "anthropic");
          assert.equal(response.headers["x-open-hax-upstream-provider"], "factory");
        },
      );
    },
  );
});

test("claude-opus-4-6 auto routing applies safe xhigh thinking budget mapping", { concurrency: false }, async () => {
  const capturedUrls: string[] = [];
  let capturedBody = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: {
            providers: {
              openai: {
                auth: "oauth_bearer",
                accounts: [{ id: "openai-1", access_token: "openai-token" }],
              },
              requesty: {
                auth: "api_key",
                accounts: [{ id: "requesty-1", api_key: "requesty-token" }],
              },
            },
          },
          configOverrides: {
            upstreamProviderId: "openai",
            upstreamFallbackProviderIds: ["requesty"],
          },
          upstreamHandler: async (request, body) => {
            capturedUrls.push(request.url ?? "");
            capturedBody = body;

            if (request.url === "/api/llm/a/v1/messages") {
              return {
                status: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  id: "msg_factory_auto_reasoning",
                  type: "message",
                  role: "assistant",
                  content: [
                    { type: "thinking", thinking: "auto-route-thinking" },
                    { type: "text", text: "Factory auto route reasoning OK" },
                  ],
                  model: "claude-opus-4-6",
                  usage: { input_tokens: 10, output_tokens: 5 },
                }),
              };
            }

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "chatcmpl_factory_auto_reasoning_fallback",
                object: "chat.completion",
                created: 123,
                model: "claude-opus-4-6",
                choices: [{ index: 0, message: { role: "assistant", content: "fallback", reasoning_content: "fallback-thinking" }, finish_reason: "stop" }],
                usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "claude-opus-4-6",
              messages: [{ role: "user", content: "hello" }],
              reasoning_effort: "xhigh",
            },
          });

          assert.equal(response.statusCode, 200);
          assert.deepEqual(capturedUrls, ["/api/llm/a/v1/messages"]);
          assert.equal(response.headers["x-open-hax-upstream-provider"], "factory");

          const parsedBody = JSON.parse(capturedBody) as Record<string, unknown>;
          assert.equal(parsedBody["max_tokens"], 4096);
          assert.ok(isRecord(parsedBody["thinking"]));
          assert.equal(parsedBody["thinking"]["budget_tokens"], 4095);
        },
      );
    },
  );
});

// VAL-ROUTE-002: GPT models route to Factory OpenAI Responses endpoint

test("factory/gpt-* routes to /api/llm/o/v1/responses", { concurrency: false }, async () => {
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (request, _body) => {
            capturedUrl = request.url ?? "";
            capturedHeaders = {};
            for (const [name, value] of Object.entries(request.headers)) {
              if (typeof value === "string") {
                capturedHeaders[name] = value;
              }
            }

            // Factory Responses endpoint returns SSE event stream
            const sseStream = [
              `event: response.created\ndata: ${JSON.stringify({ type: "response.created", response: { id: "resp_123", status: "in_progress", model: "gpt-5", output: [] } })}\n\n`,
              `event: response.output_text.delta\ndata: ${JSON.stringify({ type: "response.output_text.delta", delta: "Hello from Factory GPT" })}\n\n`,
              `event: response.completed\ndata: ${JSON.stringify({ type: "response.completed", response: { id: "resp_123", status: "completed", model: "gpt-5", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "Hello from Factory GPT" }] }], usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 } } })}\n\n`,
            ].join("");

            return {
              status: 200,
              headers: { "content-type": "text/event-stream" },
              body: sseStream,
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/gpt-5",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(response.statusCode, 200);
          assert.equal(capturedUrl, "/api/llm/o/v1/responses");

          // Verify Factory-specific headers
          assert.equal(capturedHeaders["x-factory-client"], "cli");
          assert.equal(capturedHeaders["x-api-provider"], "openai");
          assert.equal(capturedHeaders["user-agent"], "factory-cli/0.74.0");
          assert.ok(UUID_REGEX.test(capturedHeaders["x-session-id"] ?? ""));
          assert.ok(UUID_REGEX.test(capturedHeaders["x-assistant-message-id"] ?? ""));

          // Should NOT have Anthropic-specific headers
          assert.equal(capturedHeaders["anthropic-version"], undefined);
          assert.equal(capturedHeaders["x-api-key"], undefined);
        },
      );
    },
  );
});

test("/v1/responses routes gpt-* to Factory responses endpoint", { concurrency: false }, async () => {
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};
  let capturedBody: Record<string, unknown> | null = null;

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          configOverrides: {
            upstreamProviderId: "factory",
            upstreamFallbackProviderIds: [],
          },
          upstreamHandler: async (request, body) => {
            capturedUrl = request.url ?? "";
            capturedHeaders = {};
            for (const [name, value] of Object.entries(request.headers)) {
              if (typeof value === "string") {
                capturedHeaders[name] = value;
              }
            }

            capturedBody = JSON.parse(body) as Record<string, unknown>;

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ id: "resp_factory", object: "response", output: [] }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/responses",
            payload: {
              model: "gpt-5.4",
              input: "hello",
              stream: false,
            },
          });

          assert.equal(response.statusCode, 200);
          assert.equal(capturedUrl, "/api/llm/o/v1/responses");
          assert.equal(capturedHeaders["x-api-provider"], "openai");
          assert.equal(capturedHeaders["x-factory-client"], "cli");
          assert.equal(capturedHeaders["user-agent"], "factory-cli/0.74.0");

          assert.ok(capturedBody);
          assert.equal(capturedBody?.model, "gpt-5.4");
          assert.equal(capturedBody?.input, "hello");
          assert.equal(capturedBody?.stream, false);

          const payload = response.json();
          assert.ok(isRecord(payload));
          assert.equal(payload["id"], "resp_factory");
        },
      );
    },
  );
});

test("Factory 4xx responses persist sanitized prompt-rejection diagnostics", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          configOverrides: {
            upstreamProviderId: "factory",
            upstreamFallbackProviderIds: [],
          },
          upstreamHandler: async () => ({
            status: 403,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              error: {
                type: "invalid_request_error",
                code: "policy_violation",
                message: "Prompt rejected by upstream policy",
              },
            }),
          }),
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/responses",
            headers: { "content-type": "application/json" },
            payload: {
              model: "gpt-5.4",
              prompt_cache_key: "factory-diagnostic-key",
              instructions: [
                "You are OpenCode, the best coding agent on the planet.",
                "```lisp",
                "(prompt \"operation-mindfuck\")",
                "```",
              ].join("\n"),
              input: [
                {
                  role: "user",
                  content: [
                    {
                      type: "input_text",
                      text: "<available_skills><skill>debug</skill></available_skills> Read AGENTS.md and CONTRACT.edn before responding.",
                    },
                  ],
                },
              ],
              stream: false,
            },
          });

          assert.ok(response.statusCode >= 400);

          const logsResponse = await app.inject({
            method: "GET",
            url: "/api/ui/request-logs?limit=1",
          });

          assert.equal(logsResponse.statusCode, 200);
          const logsPayload: unknown = logsResponse.json();
          assert.ok(isRecord(logsPayload));
          assert.ok(Array.isArray(logsPayload.entries));
          assert.equal(logsPayload.entries.length, 1);

          const entry = logsPayload.entries[0];
          assert.ok(isRecord(entry));
          assert.equal(entry.providerId, "factory");
          assert.equal(entry.status, 403);
          assert.equal(entry.error, "Prompt rejected by upstream policy");
          assert.equal(entry.upstreamErrorCode, "policy_violation");
          assert.equal(entry.upstreamErrorType, "invalid_request_error");
          assert.equal(entry.upstreamErrorMessage, "Prompt rejected by upstream policy");
          assert.ok(isRecord(entry.factoryDiagnostics));
          assert.equal(entry.factoryDiagnostics.requestFormat, "responses");
          assert.equal(entry.factoryDiagnostics.hasInstructions, true);
          assert.equal(entry.factoryDiagnostics.hasOpencodeMarkers, true);
          assert.equal(entry.factoryDiagnostics.hasAgentProtocolMarkers, true);
          assert.equal(entry.factoryDiagnostics.hasCodeFence, true);
          assert.equal(entry.factoryDiagnostics.hasXmlLikeTags, true);
          assert.equal(entry.factoryDiagnostics.inputItemCount, 1);
          assert.equal(entry.factoryDiagnostics.messageCount, 1);
          assert.equal(entry.factoryDiagnostics.userMessageCount, 1);
          assert.match(String(entry.factoryDiagnostics.promptCacheKeyHash), /^sha256:[0-9a-f]{12}$/);
          assert.match(String(entry.factoryDiagnostics.textFingerprint), /^sha256:[0-9a-f]{12}$/);
          assert.match(String(entry.factoryDiagnostics.instructionsFingerprint), /^sha256:[0-9a-f]{12}$/);
          assert.ok(typeof entry.factoryDiagnostics.totalTextChars === "number" && entry.factoryDiagnostics.totalTextChars > 0);
          assert.ok(typeof entry.factoryDiagnostics.maxTextBlockChars === "number" && entry.factoryDiagnostics.maxTextBlockChars > 0);
        },
      );
    },
  );
});

// VAL-ROUTE-003: Common models route to Factory common endpoint

test("factory/gemini-* routes to /api/llm/o/v1/chat/completions", { concurrency: false }, async () => {
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (request, _body) => {
            capturedUrl = request.url ?? "";
            capturedHeaders = {};
            for (const [name, value] of Object.entries(request.headers)) {
              if (typeof value === "string") {
                capturedHeaders[name] = value;
              }
            }

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "chatcmpl-123",
                object: "chat.completion",
                created: 1,
                model: "gemini-3-pro-preview",
                choices: [
                  { index: 0, message: { role: "assistant", content: "Hello from Gemini" }, finish_reason: "stop" },
                ],
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/gemini-3-pro-preview",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(response.statusCode, 200);
          assert.equal(capturedUrl, "/api/llm/o/v1/chat/completions");

          // Verify Factory-specific headers
          assert.equal(capturedHeaders["x-factory-client"], "cli");
          assert.equal(capturedHeaders["x-api-provider"], "google");
          assert.equal(capturedHeaders["user-agent"], "factory-cli/0.74.0");
          assert.ok(UUID_REGEX.test(capturedHeaders["x-session-id"] ?? ""));

          // Verify stainless SDK headers
          assert.equal(capturedHeaders["x-stainless-lang"], "js");
          assert.equal(capturedHeaders["x-stainless-runtime"], "node");
        },
      );
    },
  );
});

// VAL-ROUTE-003 (DeepSeek variant)

test("factory/DeepSeek-* routes to /api/llm/o/v1/chat/completions with fireworks provider", { concurrency: false }, async () => {
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (request, _body) => {
            capturedUrl = request.url ?? "";
            capturedHeaders = {};
            for (const [name, value] of Object.entries(request.headers)) {
              if (typeof value === "string") {
                capturedHeaders[name] = value;
              }
            }

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "chatcmpl-456",
                object: "chat.completion",
                created: 1,
                model: "DeepSeek-V3.2",
                choices: [
                  { index: 0, message: { role: "assistant", content: "Hello from DeepSeek" }, finish_reason: "stop" },
                ],
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/DeepSeek-V3.2",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(response.statusCode, 200);
          assert.equal(capturedUrl, "/api/llm/o/v1/chat/completions");
          assert.equal(capturedHeaders["x-api-provider"], "fireworks");
        },
      );
    },
  );
});

// VAL-HEADER-005: System prompt inlining for Factory Anthropic requests

test("factory claude requests inline system prompt into first user message", { concurrency: false }, async () => {
  let capturedBody = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (_request, body) => {
            capturedBody = body;

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_123",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "OK" }],
                model: "claude-opus-4-5",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/claude-opus-4-5",
              messages: [
                { role: "system", content: "You are a coding assistant." },
                { role: "user", content: "Write hello world" },
              ],
            },
          });

          assert.equal(response.statusCode, 200);

          // The upstream body should NOT have a "system" field —
          // it should have been inlined into the first user message.
          const parsedBody = JSON.parse(capturedBody) as Record<string, unknown>;
          assert.equal(parsedBody["system"], undefined);

          // First user message should contain the system prompt
          const messages = parsedBody["messages"] as Record<string, unknown>[];
          assert.ok(messages.length > 0);
          const firstUser = messages.find((m) => m["role"] === "user");
          assert.ok(firstUser);
          const content = firstUser["content"];
          assert.ok(typeof content === "string");
          assert.ok(content.includes("You are a coding assistant."));
          assert.ok(content.includes("Write hello world"));
        },
      );
    },
  );
});

test("factory claude requests sanitize OpenCode system prompt before upstream", { concurrency: false }, async () => {
  let capturedBody = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (_request, body) => {
            capturedBody = body;

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_123",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "OK" }],
                model: "claude-opus-4-5",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/claude-opus-4-5",
              messages: [
                { role: "system", content: "You are OpenCode, the best coding agent on the planet." },
                { role: "user", content: "Write hello world" },
              ],
            },
          });

          assert.equal(response.statusCode, 200);

          const parsedBody = JSON.parse(capturedBody) as Record<string, unknown>;
          const messages = parsedBody["messages"] as Record<string, unknown>[];
          const firstUser = messages.find((m) => m["role"] === "user");
          assert.ok(firstUser);

          const content = firstUser["content"];
          assert.ok(typeof content === "string");
          assert.ok(!content.includes("You are OpenCode"));
          assert.ok(content.toLowerCase().includes("software engineering assistant"));
          assert.ok(content.includes("Write hello world"));
        },
      );
    },
  );
});

// VAL-HEADER-006: Messages endpoint body correctly translated

test("factory claude requests translate chat format to Anthropic Messages format", { concurrency: false }, async () => {
  let capturedBody = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (_request, body) => {
            capturedBody = body;

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_456",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "Translated response" }],
                model: "claude-opus-4-5",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/claude-opus-4-5",
              messages: [{ role: "user", content: "Test message" }],
              max_tokens: 100,
            },
          });

          assert.equal(response.statusCode, 200);

          const parsedBody = JSON.parse(capturedBody) as Record<string, unknown>;
          // Anthropic Messages format should have model and messages
          assert.equal(parsedBody["model"], "claude-opus-4-5");
          assert.ok(Array.isArray(parsedBody["messages"]));
          assert.equal(parsedBody["stream"], false); // Messages format sets stream: false
        },
      );
    },
  );
});

// VAL-HEADER-007: Responses endpoint body correctly translated

test("factory gpt requests translate chat format to Responses format", { concurrency: false }, async () => {
  let capturedBody = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (_request, body) => {
            capturedBody = body;

            // Return a Responses SSE stream
            const sseStream = [
              `event: response.completed\ndata: ${JSON.stringify({ type: "response.completed", response: { id: "resp_123", status: "completed", model: "gpt-5", output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "GPT response" }] }], usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 } } })}\n\n`,
            ].join("");

            return {
              status: 200,
              headers: { "content-type": "text/event-stream" },
              body: sseStream,
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/gpt-5",
              messages: [{ role: "user", content: "Test message" }],
            },
          });

          assert.equal(response.statusCode, 200);

          const parsedBody = JSON.parse(capturedBody) as Record<string, unknown>;
          // Responses format should have model, input (not messages), store: false
          assert.equal(parsedBody["model"], "gpt-5");
          assert.ok(Array.isArray(parsedBody["input"]), "Responses format should use 'input' not 'messages'");
          assert.equal(parsedBody["store"], false);
        },
      );
    },
  );
});

// VAL-HEADER-008: Authorization header uses Bearer format

test("factory requests use Bearer authorization header", { concurrency: false }, async () => {
  let capturedHeaders: Record<string, string> = {};

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key-auth", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          upstreamHandler: async (request, _body) => {
            capturedHeaders = {};
            for (const [name, value] of Object.entries(request.headers)) {
              if (typeof value === "string") {
                capturedHeaders[name] = value;
              }
            }

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "chatcmpl-789",
                object: "chat.completion",
                created: 1,
                model: "gemini-3-pro-preview",
                choices: [
                  { index: 0, message: { role: "assistant", content: "ok" }, finish_reason: "stop" },
                ],
              }),
            };
          },
        },
        async ({ app }) => {
          await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/gemini-3-pro-preview",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(capturedHeaders["authorization"], "Bearer fk-test-key-auth");
        },
      );
    },
  );
});

// VAL-ROUTE-006: Factory skipped when no credentials

test("factory route returns 503 when no factory credentials exist", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: { vivgrid: { accounts: ["vg-key"] } } },
          upstreamHandler: async () => {
            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ id: "should-not-reach", object: "chat.completion" }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              model: "factory/claude-opus-4-5",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          // Should get an error — no factory credentials
          assert.ok(response.statusCode >= 400);
        },
      );
    },
  );
});

// VAL-ROUTE-004: factory/ prefix forces Factory provider routing

test("factory/ prefix forces routing through Factory provider", { concurrency: false }, async () => {
  let capturedUrl = "";

  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withProxyApp(
        {
          keys: [],
          keysPayload: { providers: {} },
          configOverrides: {
            // Set a different upstream provider
            upstreamProviderId: "vivgrid",
          },
          upstreamHandler: async (request, _body) => {
            capturedUrl = request.url ?? "";

            return {
              status: 200,
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: "msg_123",
                type: "message",
                role: "assistant",
                content: [{ type: "text", text: "OK" }],
                model: "claude-opus-4-5",
                usage: { input_tokens: 10, output_tokens: 5 },
              }),
            };
          },
        },
        async ({ app }) => {
          const response = await app.inject({
            method: "POST",
            url: "/v1/chat/completions",
            payload: {
              // factory/ prefix should force Factory routing regardless of upstream
              model: "factory/claude-opus-4-5",
              messages: [{ role: "user", content: "hello" }],
            },
          });

          assert.equal(response.statusCode, 200);
          // Should have used Factory endpoint, not default vivgrid
          assert.equal(capturedUrl, "/api/llm/a/v1/messages");
        },
      );
    },
  );
});
