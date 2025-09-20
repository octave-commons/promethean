import test from "ava";
import { McpClient } from "../adapter.js";
import { CacheRegistry } from "../cache.js";
import { EnsoClient } from "../client.js";
import { derivedCid, derive } from "../derive.js";
import type { DerivePlan } from "../derive.js";
import { Router } from "../router.js";
import { EnsoServer } from "../server.js";
import { connectLocal } from "../transport.js";
import { AssetStore } from "../store.js";
import { ContextRegistry } from "../registry.js";
import { runCliCommand } from "../cli.js";
import type { Envelope } from "../types/envelope.js";
import type { ContextParticipant } from "../types/context.js";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OWNER: ContextParticipant = { id: "owner" };
const CLIENT_CAPS = [
  "can.send.text",
  "can.asset.put",
  "can.context.write",
  "can.context.apply",
] as const;

test("adapter default handlers", async (t) => {
  const client = new McpClient({
    serverId: "demo",
    transport: { kind: "stdio", command: "noop" },
  });
  t.deepEqual(await client.listTools(), []);
  const result = await client.callTool({ name: "noop", args: {}, ttlMs: 10 });
  t.false(result.ok);
  t.regex(result.error ?? "", /No handler/);
});

test("adapter custom handlers", async (t) => {
  const client = new McpClient(
    {
      serverId: "mcp",
      transport: { kind: "http-stream", url: "https://mcp.example" },
    },
    {
      listTools: () => [{ name: "demo" }],
      callTool: async ({ name }) => ({ ok: true, result: name }),
    },
  );
  t.deepEqual(await client.listTools(), [{ name: "demo" }]);
  const response = await client.callTool({
    name: "demo",
    args: { q: 1 },
    ttlMs: 1000,
  });
  t.true(response.ok);
  t.is(response.result, "demo");
});

test("cache registry operations", (t) => {
  const cache = new CacheRegistry();
  const key = { cid: "cid:sha256-abc" } as const;
  cache.put({
    key,
    uri: "enso://asset/cid:sha256-abc",
    bytes: 10,
    mime: "text/plain",
    visibility: "room",
    ttl: 60,
  });
  t.truthy(cache.get(key));
  cache.evict(key);
  t.is(cache.get(key), undefined);
});

test("enso client event flow", async (t) => {
  const registry = new ContextRegistry();
  registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/demo" },
    owners: [{ userId: OWNER.id }],
    discoverability: "visible",
    availability: { mode: "public" },
    title: "Demo Source",
  });
  const server = new EnsoServer();
  const client = new EnsoClient(registry);
  const received: Envelope[] = [];
  client.on("event:privacy.accepted", (env) => received.push(env));
  const connection = await connectLocal(client, server, {
    proto: "ENSO-1",
    caps: [...CLIENT_CAPS],
    privacy: { profile: "pseudonymous" },
  });
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
  connection.disconnect();
});

test("enso client enforces handshake before sending", async (t) => {
  const client = new EnsoClient(new ContextRegistry());
  const envelope: Envelope = {
    id: "evt-1",
    ts: new Date().toISOString(),
    room: "local",
    from: "tester",
    kind: "event",
    type: "content.post",
    payload: {},
  };
  await t.throwsAsync(() => client.send(envelope), {
    message: /must be connected/,
  });
});

test("enso client requires capabilities for actions", async (t) => {
  const registry = new ContextRegistry();
  registry.registerSource({
    id: { kind: "enso-asset", location: "enso://asset/cap" },
    owners: [{ userId: OWNER.id }],
    discoverability: "visible",
    availability: { mode: "public" },
  });
  const server = new EnsoServer();
  const client = new EnsoClient(registry);
  const connection = await connectLocal(client, server, {
    proto: "ENSO-1",
    caps: ["can.asset.put"],
    privacy: { profile: "pseudonymous" },
  });
  await t.throwsAsync(() => client.post({ role: "human", parts: [] }), {
    message: /missing capability: can.send.text/,
  });
  client.updateCapabilities([
    "can.send.text",
    "can.context.write",
    "can.context.apply",
  ]);
  await client.post({ role: "human", parts: [{ kind: "text", text: "ok" }] });
  const ctx = await client.contexts.create({
    name: "caps",
    owner: { userId: OWNER.id },
    entries: [],
  });
  await client.contexts.apply(ctx.ctxId, [{ id: OWNER.id }]);
  connection.disconnect();
});

test("derive utilities", async (t) => {
  const params = { foo: "bar" };
  const cidA = derivedCid(
    "cid:sha256-source" as const,
    "tool",
    "1.0.0",
    params,
  );
  const cidB = derivedCid(
    "cid:sha256-source" as const,
    "tool",
    "1.0.0",
    params,
  );
  t.is(cidA, cidB);

  const result = await derive(
    { purpose: "text", via: ["tool"], params },
    "cid:sha256-source" as const,
  );
  t.regex(result.cid, /^cid:sha256-/);
  t.is(result.mime, "text/markdown");
  const meta = result.meta as {
    plan: DerivePlan;
    from: string;
    generatedAt: string;
  };
  t.is(meta.plan.purpose, "text");
});

test("derivedCid canonicalizes nested parameters", (t) => {
  const from = "cid:sha256-source" as const;
  const paramsA = {
    flag: true,
    steps: [
      "alpha",
      {
        tool: "beta",
        options: [
          { key: "mode", value: "fast" },
          { key: "threshold", value: 0.8 },
        ],
      },
    ],
    metadata: { tags: ["policy", "audit"], version: 1 },
  };
  const paramsB = {
    metadata: { version: 1, tags: ["policy", "audit"] },
    steps: [
      "alpha",
      {
        options: [
          { value: "fast", key: "mode" },
          { key: "threshold", value: 0.8 },
        ],
        tool: "beta",
      },
    ],
    flag: true,
  };
  const cidA = derivedCid(from, "pipeline", "1.0.0", paramsA);
  const cidB = derivedCid(from, "pipeline", "1.0.0", paramsB);
  t.is(cidA, cidB);

  const paramsC = { ...paramsA, metadata: { ...paramsA.metadata, version: 2 } };
  const cidC = derivedCid(from, "pipeline", "1.0.0", paramsC);
  t.not(cidA, cidC);
});

test("router dispatch and fallback", async (t) => {
  const router = new Router();
  const hits: string[] = [];
  router
    .register("ping", async () => {
      hits.push("ping");
    })
    .registerFallback(() => {
      hits.push("fallback");
    });

  await router.handle(
    { sessionId: "s", send: () => {} },
    {
      id: "1",
      ts: "",
      room: "",
      from: "",
      kind: "event",
      type: "ping",
      payload: {},
    },
  );
  await router.handle(
    { sessionId: "s", send: () => {} },
    {
      id: "2",
      ts: "",
      room: "",
      from: "",
      kind: "event",
      type: "unknown",
      payload: {},
    },
  );
  t.deepEqual(hits, ["ping", "fallback"]);
});

test("server dispatch", async (t) => {
  const server = new EnsoServer();
  const envelopes: Envelope[] = [];
  server.on("message", (_session, env) => envelopes.push(env));

  server.register("echo", ({ send }, env) => send(env));

  const session = server.createSession();
  await server.dispatch(session, {
    id: "1",
    ts: "",
    room: "",
    from: "",
    kind: "event",
    type: "echo",
    payload: "hi",
  });
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

test("asset store hashes data deterministically and supports ranges", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "enso-store-"));
  const store = new AssetStore(dir);
  const payload = new TextEncoder().encode("deterministic");
  try {
    async function* chunks() {
      yield payload;
    }
    const { cid, uri, bytes } = await store.putChunks(chunks());
    const expectedCid = createHash("sha256").update(payload).digest("hex");
    t.is(cid, `cid:sha256-${expectedCid}`);
    t.is(uri, `enso://asset/${cid}`);
    t.is(bytes, payload.length);

    const slice = await store.read(cid, { start: 3, end: 7 });
    t.is(new TextDecoder().decode(slice.data), "ermi");
    t.is(slice.bytes, 4);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cli commands run without side effects", async (t) => {
  const outputs: string[] = [];
  const registry = new ContextRegistry();
  await runCliCommand("help", {
    registry,
    log: (msg) => outputs.push(msg),
    error: () => {},
  });
  await runCliCommand("list-sources", {
    registry,
    log: (msg) => outputs.push(msg),
  });
  await runCliCommand("create-demo-context", {
    registry,
    log: (msg) => outputs.push(msg),
  });
  t.true(outputs.length >= 3);
});
