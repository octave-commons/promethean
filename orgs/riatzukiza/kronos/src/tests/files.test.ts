import test from "ava";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig } from "../config/load-config.js";

test("loadConfig defaults when nothing set", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-test-"));
  t.teardown(() => fs.rmSync(tempDir, { recursive: true, force: true }));

  const cfg = loadConfig({}, [], tempDir);
  t.is(cfg.transport, "http");
  t.deepEqual(cfg.tools, []);
  t.deepEqual(cfg.endpoints, {});
});
