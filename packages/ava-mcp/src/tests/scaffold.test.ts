import test from "ava";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { registerTddTools } from "../index.js";

test("scaffoldTest creates a spec", async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ava-mcp-"));
  const modulePath = path.join(tmp, "foo.ts");
  await fs.writeFile(modulePath, "export const foo = 1;\n");

  const handlers: Record<string, (input: unknown) => unknown> = {};
  const server = {
    registerTool: (
      name: string,
      _schema: unknown,
      handler: (input: unknown) => unknown,
    ) => {
      handlers[name] = handler;
    },
  };

  // biome-ignore lint/suspicious/noExplicitAny: test server stub
  registerTddTools(server as any);
  const result = await (
    handlers["tdd.scaffoldTest"] as (arg: {
      modulePath: string;
      testName: string;
      template?: "unit" | "prop";
    }) => Promise<{ specPath: string }>
  )({
    modulePath,
    testName: "works",
  });

  const specContent = await fs.readFile(result.specPath, "utf8");
  t.true(specContent.includes("t.fail()"));
});
