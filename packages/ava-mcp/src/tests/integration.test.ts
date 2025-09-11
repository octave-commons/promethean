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

  await t.notThrowsAsync(() =>
    (
      handlers["tdd.propertyCheck"] as (arg: {
        propertyModule: string;
        propertyExport: string;
      }) => Promise<unknown>
    )({
      propertyModule: propFile,
      propertyExport: "always",
    }),
  );
});
