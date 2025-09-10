import test from "ava";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { registerTddTools } from "../index.js";

test("propertyCheck executes", async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ava-mcp-"));
  const propFile = path.join(tmp, "prop.mjs");
  await fs.writeFile(
    propFile,
    "export const always = (fc) => fc.property(fc.integer(), n => n === n);\n",
  );

  const handlers: Record<string, any> = {};
  const server = {
    registerTool: (_name: string, _schema: unknown, handler: any) => {
      handlers[_name] = handler;
    },
  } as any;

  registerTddTools(server);

  await t.notThrowsAsync(() =>
    handlers["tdd.propertyCheck"]({
      propertyModule: propFile,
      propertyExport: "always",
    }),
  );
});
