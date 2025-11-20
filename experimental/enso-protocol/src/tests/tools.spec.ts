import test from "ava";
import { ToolRegistry } from "../tools.js";
import type { ToolCall } from "../types/tools.js";

function createCall(overrides: Partial<ToolCall> = {}): ToolCall {
  return {
    callId: "call-1",
    provider: "native",
    name: "echo",
    args: { value: 1 },
    ...overrides,
  };
}

test("tool registry advertises registered tools", (t) => {
  const registry = new ToolRegistry();
  registry.register("native", {
    name: "echo",
    handler: (args) => args,
    schema: { type: "object" },
    resources: [{ name: "docs", uri: "https://example.test/echo" }],
  });

  const advert = registry.advertisement("native");
  t.deepEqual(advert.tools, [{ name: "echo", schema: { type: "object" } }]);
  t.deepEqual(advert.resources, [
    { name: "docs", uri: "https://example.test/echo" },
  ]);
});

test("tool invocation resolves within ttl", async (t) => {
  const registry = new ToolRegistry();
  registry.register("native", {
    name: "echo",
    handler: async (args) => {
      const { value } = args as { value: unknown };
      return { echoed: value };
    },
    timeoutMs: 1_000,
  });
  const result = await registry.invoke(createCall({ ttlMs: 500 }));
  t.true(result.ok);
  t.deepEqual(result.result, { echoed: 1 });
});

test("tool invocation reports timeout", async (t) => {
  const registry = new ToolRegistry();
  registry.register("native", {
    name: "slow",
    handler: () =>
      new Promise((resolve) => setTimeout(() => resolve("done"), 100)),
  });
  const result = await registry.invoke(createCall({ name: "slow", ttlMs: 10 }));
  t.false(result.ok);
  t.is(result.error, "timeout");
});
