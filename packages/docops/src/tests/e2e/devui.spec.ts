import * as path from "node:path";
import * as url from "node:url";

import test from "ava";
import { registerProcForFileWithPort, withPage } from "@promethean/test-utils";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
);

const { getProc } = registerProcForFileWithPort(test, {
  cmd: "node",
  args: [
    path.join(PKG_ROOT, "dist/dev-ui.js"),
    "--dir",
    "../../docs/unique",
    "--collection",
    "docs-cosine",
    "--port",
    ":PORT", // placeholder
  ],
  cwd: PKG_ROOT,
  env: { ...process.env },
  stdio: "inherit",
  ready: { kind: "http", url: "http://127.0.0.1:PORT/", timeoutMs: 15000 }, // we can enhance ready to replace :PORT too (see note)
  port: { mode: "free" },
  baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
});

test(
  withPage,
  { baseUrl: () => getProc().baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto("/");
    t.truthy(res);
  },
);

test(
  withPage,
  { baseUrl: () => getProc().baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto("/health");
    t.truthy(res);
  },
);
