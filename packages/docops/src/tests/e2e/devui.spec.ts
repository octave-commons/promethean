import * as path from "node:path";
import * as url from "node:url";
import { v4 as uuidv4 } from "uuid";

import test from "ava";
import { registerProcForFileWithPort, withPage } from "@promethean/test-utils";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../../",
);

const DOC_FIXTURE_PATH = path.join(PKG_ROOT, "./fixtures/docs");
const { getProc } = registerProcForFileWithPort(test, {
  cmd: "node",
  args: [
    path.join(PKG_ROOT, "dist/dev-ui.js"),
    "--dir",
    DOC_FIXTURE_PATH,
    "--collection",
    uuidv4(),
    "--port",
    ":PORT", // placeholder
  ],
  cwd: PKG_ROOT,
  env: { ...process.env },
  stdio: "inherit",
  port: { mode: "free" },
  baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
});

test(
  "Gets / ",
  withPage,
  { baseUrl: () => getProc().baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto("/");
    t.truthy(res);
  },
);

test(
  "Get /health ",
  withPage,
  { baseUrl: () => getProc().baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto("/health");
    t.truthy(res);
  },
);
