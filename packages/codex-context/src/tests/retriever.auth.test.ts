import test from "ava";
import { SmartGptrRetriever } from "../retriever.js";

const calls: any[] = [];
const fakeFetch = async (url: string, init: any) => {
  calls.push({ url, init });
  return { json: async () => ({ ok: true, results: [] }) } as any;
};

test("SmartGptrRetriever adds bearer token header", async (t) => {
  const r = new SmartGptrRetriever(
    "http://localhost:3210",
    "abc123",
    fakeFetch as any,
  );
  await r.retrieve("hello");
  t.true(calls.length > 0);
  t.is(calls[0].url, "http://localhost:3210/v1/search/semantic");
  const h = calls[0].init.headers as Record<string, string>;
  t.is(h["authorization"], "Bearer abc123");
});
