import test from "ava";

import { OLLAMA_URL, ollamaEmbed, ollamaJSON } from "../ollama.js";

// simple fetch mock helper
function mockFetch(res: () => Response) {
  const orig = globalThis.fetch;
  // eslint-disable-next-line functional/immutable-data
  globalThis.fetch = (async (_input: RequestInfo | URL, _init?: RequestInit) =>
    res()) as unknown as typeof fetch;
  return () => {
    // eslint-disable-next-line functional/immutable-data
    globalThis.fetch = orig;
  };
}

test("OLLAMA_URL has default", (t) => {
  t.is(OLLAMA_URL, process.env.OLLAMA_URL ?? "http://localhost:11434");
});

test.serial("ollamaEmbed returns embedding", async (t) => {
  const restore = mockFetch(
    () =>
      new Response(JSON.stringify({ embedding: [1, 2, 3] }), { status: 200 }),
  );
  const emb = await ollamaEmbed("m", "text");
  t.deepEqual(emb, [1, 2, 3]);
  restore();
});

test.serial("ollamaEmbed retries and fails after max attempts", async (t) => {
  // eslint-disable-next-line functional/prefer-immutable-types
  const calls: number[] = [];
  const restore = mockFetch(() => {
    // eslint-disable-next-line functional/immutable-data
    calls.push(1);
    return new Response("busy", { status: 503 });
  });
  await t.throwsAsync(() => ollamaEmbed("m", "text"), {
    message: /ollama embeddings 503/,
  });
  t.is(calls.length, 3);
  restore();
});

test.serial("ollamaJSON parses response", async (t) => {
  const restore = mockFetch(
    () =>
      new Response(JSON.stringify({ response: '{"a":1}' }), { status: 200 }),
  );
  const obj = await ollamaJSON("m", "p");
  t.deepEqual(obj, { a: 1 });
  restore();
});

test.serial("ollamaJSON throws on error", async (t) => {
  const restore = mockFetch(() => new Response("fail", { status: 500 }));
  await t.throwsAsync(() => ollamaJSON("m", "p"), {
    message: /ollama generate 500/,
  });
  restore();
});
