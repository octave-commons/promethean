import test from "ava";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "@modelcontextprotocol/sdk/server";
import { registerTddTools } from "../index.js";

test("scaffoldTest creates a spec", async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ava-mcp-"));
  const modulePath = path.join(tmp, "foo.ts");
  await fs.writeFile(modulePath, "export const foo = 1;\n");

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
  const handler = handlers["tdd.scaffoldTest"]!;
  const result = (await handler({
    modulePath,
    testName: "works",
  })) as { specPath: string };

  t.true(result.specPath.endsWith(".spec.ts"));
  const specContent = await fs.readFile(result.specPath, "utf8");
  t.true(specContent.includes("t.fail()"));
});

test("scaffoldTest creates a property-based spec when template=prop", async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "ava-mcp-"));
  const modulePath = path.join(tmp, "bar.ts");
  await fs.writeFile(modulePath, "export const bar = 2;\n");

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
  const handler = handlers["tdd.scaffoldTest"]!;
  const { specPath } = (await handler({
    modulePath,
    testName: "prop works",
    template: "prop",
  })) as { specPath: string };

  const specContent = await fs.readFile(specPath, "utf8");
  t.true(specContent.includes('import fc from "fast-check"'));
});
