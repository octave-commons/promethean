import test from "ava";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { registerTddTools } from "../index.js";

test("scaffoldTest creates a spec", async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ava-mcp-"));
  const modulePath = path.join(tmp, "foo.ts");
  await fs.writeFile(modulePath, "export const foo = 1;\n");

  const handlers: Record<string, any> = {};
  const server = {
    registerTool: (_name: string, _schema: unknown, handler: any) => {
      handlers[_name] = handler;
    },
  } as any;

  registerTddTools(server);
  const result = await handlers["tdd.scaffoldTest"]({
    modulePath,
    testName: "works",
  });

  const specContent = await fs.readFile(result.specPath, "utf8");
  t.true(specContent.includes("t.fail()"));
});
