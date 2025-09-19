import test from "ava";
import { McpClient } from "../adapter.js";
import { CacheRegistry } from "../cache.js";
import { EnsoClient } from "../client.js";
import { derivedCid, derive } from "../derive.js";
import { Router } from "../router.js";
import { EnsoServer } from "../server.js";
import { AssetStore } from "../store.js";
import { ContextRegistry } from "../registry.js";
import type { Envelope } from "../types/envelope.js";
import type { ContextParticipant } from "../types/context.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OWNER: ContextParticipant = { id: "owner" };

test("adapter default handlers", async (t) => {
  const client = new McpClient({ serverId: "demo", transport: { kind: "stdio", command: "noop" } });
  t.deepEqual(await client.listTools(), []);
  const result = await client.callTool({ name: "noop", args: {}, ttlMs: 10 });
  t.false(result.ok);
  t.regex(result.error ?? "", /No handler/);
});

test("adapter custom handlers", async (t) => {
  const client = new McpClient(
    { serverId: "mcp", transport: { kind: "http-stream", url: "https://mcp.example" } },
    {
      listTools: () => [{ name: "demo" }],
      callTool: async ({ name }) => ({ ok: true, result: name }),
    },
  );
  t.deepEqual(await client.listTools(), [{ name: "demo" }]);
  const response = await client.callTool({ name: "demo", args: { q: 1 }, ttlMs: 1000 });
  t.true(response.ok);
  t.is(response.result, "demo");
});

test("cache registry operations", (t) => {
  const cache = new CacheRegistry();
  const key = { cid: "cid:sha256-abc" } as const;
  cache.put({ key, uri: "enso://asset/cid:sha256-abc", bytes: 10, mime: "text/plain", visibility: "room", ttl: 60 });
  t.truthy(cache.get(key));
  cache.evict(key);
  t.is(cache.get(key), undefined);
});

test("enso client event flow", async (t) => {
  const registry = new ContextRegistry();
  const client = new EnsoClient(registry);
  const received: Envelope[] = [];
  client.on("event:privacy.accepted", (env) => received.push(env));
  await client.connect({ proto: "ENSO-1", caps: [], privacy: { profile: "pseudonymous" } });
  t.is(received.length, 1);

  await client.post({ role: "human", parts: [{ kind: "text", text: "hi" }] });

  const asset = await client.assets.putFile("/tmp/demo.txt", "text/plain");
  t.regex(asset.cid, /^cid:sha256-/);

  const context = await client.contexts.create({
    name: "demo",
    owner: { userId: OWNER.id },
    entries: [],
  });
  t.truthy(client.contexts.get(context.ctxId));
});

test("derive utilities", async (t) => {
  const params = { foo: "bar" };
  const cidA = derivedCid("cid:sha256-source" as const, "tool", "1.0.0", params);
  const cidB = derivedCid("cid:sha256-source" as const, "tool", "1.0.0", params);
  t.is(cidA, cidB);

  const result = await derive({ purpose: "text", via: ["tool"], params }, "cid:sha256-source" as const);
  t.regex(result.cid, /^cid:sha256-/);
  t.is(result.mime, "text/markdown");
  t.is(result.meta.plan.purpose, "text");
});

test("router dispatch and fallback", async (t) => {
  const router = new Router();
  const hits: string[] = [];
  router
    .register("ping", async () => {
      hits.push("ping");
    })
    .registerFallback(() => hits.push("fallback"));

  await router.handle({ sessionId: "s", send: () => {} }, { id: "1", ts: "", room: "", from: "", kind: "event", type: "ping", payload: {} });
  await router.handle({ sessionId: "s", send: () => {} }, { id: "2", ts: "", room: "", from: "", kind: "event", type: "unknown", payload: {} });
  t.deepEqual(hits, ["ping", "fallback"]);
});

test("server dispatch", async (t) => {
  const server = new EnsoServer();
  const envelopes: Envelope[] = [];
  server.on("message", (_session, env) => envelopes.push(env));

  server.register("echo", ({ send }, env) => send(env));

  const session = server.createSession();
  await server.dispatch(session, { id: "1", ts: "", room: "", from: "", kind: "event", type: "echo", payload: "hi" });
  t.is(envelopes.length, 1);
});

test("asset store persists data", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "enso-store-"));
  const store = new AssetStore(dir);
  try {
    async function* chunks() {
      yield new TextEncoder().encode("hello");
    }
    const { cid } = await store.putChunks(chunks());
    const result = await store.read(cid);
    t.is(new TextDecoder().decode(result.data), "hello");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cli commands run without side effects", async (t) => {
  const outputs: string[] = [];
  const registry = new ContextRegistry();
  await import("../cli.js").then(async (cli) => {
    await cli.runCliCommand("help", { registry, log: (msg: string) => outputs.push(msg), error: () => {} });
    await cli.runCliCommand("list-sources", { registry, log: (msg: string) => outputs.push(msg) });
    await cli.runCliCommand("create-demo-context", { registry, log: (msg: string) => outputs.push(msg) });
  });
  t.true(outputs.length >= 3);
});
