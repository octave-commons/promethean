import test from "ava";
import { buildRegistry } from "../src/core/registry.js";
import type { ToolFactory } from "../src/core/types.js";

const fakeTool: ToolFactory = (_ctx) => ({
  spec: { name: "hello", description: "hi" },
  invoke: async () => ({ ok: true }),
});

test("registry builds & finds tool", (t) => {
  const reg = buildRegistry([fakeTool], {
    env: {},
    fetch: fetch,
    now: () => new Date(),
  } as any);
  t.truthy(reg.get("hello"));
  t.is(reg.list().length, 1);
});
