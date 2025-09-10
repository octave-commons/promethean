import test from "ava";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "@modelcontextprotocol/sdk/server";
import { registerTddTools } from "../index.js";

test("propertyCheck executes", async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ava-mcp-"));
  const propFile = path.join(tmp, "prop.mjs");
  await fs.writeFile(
    propFile,
    "export const always = (fc) => fc.property(fc.integer(), n => n === n);\n",
  );

  const handlers: Record<string, (input: unknown) => Promise<unknown>> = {};
  const server = {
    registerTool: (
      name: string,
      _schema: unknown,
      handler: (input: unknown) => Promise<unknown>,
    ) => {
      handlers[name] = handler;
    },
  } as unknown as Server;

  registerTddTools(server);

  const handler = handlers["tdd.propertyCheck"]!;
  const res = (await handler({
    propertyModule: propFile,
    propertyExport: "always",
  })) as { ok: boolean };
  t.deepEqual(res, { ok: true });
});
