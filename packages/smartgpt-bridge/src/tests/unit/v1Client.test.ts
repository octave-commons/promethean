import test from "ava";

import {
  SmartGptBridgeError,
  createSmartGptBridgeV1Client,
} from "../../client/index.js";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

test("listAgents issues a GET request and parses JSON", async (t) => {
  const calls: Array<{ input: string; init: RequestInit | undefined }> = [];
  const fetchStub: typeof fetch = async (input, init) => {
    calls.push({
      input: typeof input === "string" ? input : input.toString(),
      init,
    });
    return jsonResponse({ ok: true, agents: [] });
  };
  const client = createSmartGptBridgeV1Client({
    baseUrl: "https://bridge.test/",
    fetchImpl: fetchStub,
  });

  const result = await client.listAgents();

  t.deepEqual(result, { ok: true, agents: [] });
  t.is(calls.length, 1);
  t.is(calls[0]?.input, "https://bridge.test/v1/agents");
  t.is(calls[0]?.init?.method, "GET");
  const headers = new Headers(calls[0]?.init?.headers);
  t.is(headers.get("accept"), "application/json");
});

test("listFiles encodes path segments and filters query params", async (t) => {
  const calls: Array<{ input: string; init: RequestInit | undefined }> = [];
  const fetchStub: typeof fetch = async (input, init) => {
    calls.push({
      input: typeof input === "string" ? input : input.toString(),
      init,
    });
    return jsonResponse({ ok: true, base: ".", entries: [] });
  };
  const client = createSmartGptBridgeV1Client({
    baseUrl: "https://bridge.test/api",
    fetchImpl: fetchStub,
  });

  await client.listFiles({
    targetPath: "src/index.ts",
    tree: true,
    depth: 1,
  });

  t.is(calls.length, 1);
  t.is(
    calls[0]?.input,
    "https://bridge.test/api/v1/files/src/index.ts?tree=true&depth=1",
  );
  t.is(calls[0]?.init?.method, "GET");
});

test("respects optional path prefix for all requests", async (t) => {
  const calls: Array<string> = [];
  const fetchStub: typeof fetch = async (input) => {
    calls.push(typeof input === "string" ? input : input.toString());
    return jsonResponse({ ok: true, agents: [] });
  };
  const client = createSmartGptBridgeV1Client({
    baseUrl: "https://bridge.test/bridge", // base includes its own path
    pathPrefix: "/api", // optional prefix should be appended after base path
    fetchImpl: fetchStub,
  });

  await client.listAgents();

  t.deepEqual(calls, ["https://bridge.test/bridge/api/v1/agents"]);
});

test("runCommand surfaces SmartGptBridgeError on failure", async (t) => {
  const fetchStub: typeof fetch = async () =>
    jsonResponse({ ok: false, error: "boom" }, 500);
  const client = createSmartGptBridgeV1Client({
    baseUrl: "https://bridge.test/",
    fetchImpl: fetchStub,
  });

  const error = await t.throwsAsync(async () =>
    client.runCommand({ command: "ls" }),
  );

  t.true(error instanceof SmartGptBridgeError);
  t.is(error?.message, "Request failed with status 500");
  t.deepEqual((error as SmartGptBridgeError).body, {
    ok: false,
    error: "boom",
  });
});
