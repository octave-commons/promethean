import test from "ava";

import { OLLAMA_URL, ollamaEmbed, ollamaJSON } from "../ollama.js";

// simple fetch mock helper
function mockFetch(res: Response) {
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => res) as any;
  return () => {
    globalThis.fetch = orig;
  };
}

test("OLLAMA_URL has default", (t) => {
  t.is(OLLAMA_URL, process.env.OLLAMA_URL ?? "http://localhost:11434");
});

test("ollamaEmbed returns embedding", async (t) => {
  const restore = mockFetch(
    new Response(JSON.stringify({ embedding: [1, 2, 3] }), { status: 200 }),
  );
  const emb = await ollamaEmbed("m", "text");
  t.deepEqual(emb, [1, 2, 3]);
  restore();
});

test("ollamaJSON parses response", async (t) => {
  const restore = mockFetch(
    new Response(JSON.stringify({ response: '{"a":1}' }), { status: 200 }),
  );
  const obj = await ollamaJSON("m", "p");
  t.deepEqual(obj, { a: 1 });
  restore();
});

test("ollamaJSON throws on error", async (t) => {
  const restore = mockFetch(new Response("fail", { status: 500 }));
  await t.throwsAsync(() => ollamaJSON("m", "p"), {
    message: /ollama generate 500/,
  });
  restore();
});
