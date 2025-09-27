import test from "ava";
import {
  parseToolCall,
  callTool,
} from "@promethean/llm-chat-frontend/src/frontend/tools.js";

test("parseToolCall returns tool object for valid JSON", (t) => {
  const tool = parseToolCall('{"tool":"codeSearch","args":{"q":"test"}}');
  t.deepEqual(tool, { tool: "codeSearch", args: { q: "test" } });
});

test("parseToolCall returns null for invalid JSON", (t) => {
  t.is(parseToolCall("not json"), null);
  t.is(parseToolCall('{"tool":"x"}'), null);
});

test("callTool invokes fetch with correct spec", async (t) => {
  const originalFetch = global.fetch;
  let called = {};
  global.fetch = async (url, options) => {
    called = { url, options };
    return { json: async () => ({ result: 1 }) };
  };
  const res = await callTool("codeSearch", { q: "abc" });
  t.deepEqual(res, { result: 1 });
  t.is(called.url, "/bridge/v1/search/code");
  t.is(called.options.method, "POST");
  t.is(called.options.headers["Content-Type"], "application/json");
  t.deepEqual(JSON.parse(called.options.body), { q: "abc" });
  global.fetch = originalFetch;
});

test("callTool returns error for unknown tool", async (t) => {
  const res = await callTool("unknown", {});
  t.deepEqual(res, { error: "Unknown tool unknown" });
});
