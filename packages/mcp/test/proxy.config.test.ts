import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import test from "ava";

import { loadStdioServerSpecs } from "../src/proxy/config.js";

test("loadStdioServerSpecs respects cwd and scoped package args", async (t) => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "mcp-proxy-config-"));
  const configPath = path.join(tmp, "servers.edn");
  await writeFile(
    configPath,
    `{:mcp-servers {:scoped {:command "echo"
                              :args ["@pinkpixel/npm-helper-mcp" "./relative"]
                              :cwd "./nested"}}}`,
    "utf8",
  );

  const specs = await loadStdioServerSpecs(configPath);

  t.is(specs.length, 1);
  const [spec] = specs;
  t.is(spec.cwd, path.resolve(tmp, "nested"));
  t.deepEqual(spec.args, [
    "@pinkpixel/npm-helper-mcp",
    path.resolve(tmp, "relative"),
  ]);
});
