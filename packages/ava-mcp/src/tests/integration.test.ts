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

test("watch commands emit output", async (t) => {
  const tmp = await fs.mkdtemp(path.join(process.cwd(), "tmp-watch-"));
  t.teardown(() => fs.rm(tmp, { recursive: true, force: true }));
  const testFile = path.join(tmp, "watch.test.js");
  await fs.writeFile(
    testFile,
    'import test from "ava";\n test("works", t => t.pass());\n',
  );

  const handlers: Record<string, any> = {};
  const server = {
    registerTool: (_n: string, _s: unknown, h: any) => {
      handlers[_n] = h;
    },
  } as any;

  registerTddTools(server);
  t.teardown(() => handlers["tdd.stopWatch"]?.());

  const rel = path.relative(process.cwd(), testFile);
  await handlers["tdd.startWatch"]({ files: [rel] });
  let output = "";
  for (let i = 0; i < 20 && !output; i++) {
    await new Promise((res) => setTimeout(res, 500));
    const res = await handlers["tdd.getWatchChanges"]();
    output = res.output;
  }
  t.true(output.length > 0);
  await handlers["tdd.stopWatch"]();
});
