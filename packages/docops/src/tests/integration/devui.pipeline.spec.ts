import * as path from "node:path";
import * as url from "node:url";
import { promises as fs } from "node:fs";

import { v4 as uuidv4 } from "uuid";

import "../helpers/setup.js";
import test from "ava";
import { shutdown, startProcessWithPort } from "@promethean/test-utils";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../../",
);

const DOC_FIXTURE_PATH = path.join(PKG_ROOT, "./fixtures/docs");
const TMP_DB = path.join(PKG_ROOT, ".cache", `docops-test-${uuidv4()}`);

let state: { stop: () => Promise<void>; baseUrl?: string } | null = null;

test.before(async () => {
  const { stop, baseUrl } = await startProcessWithPort({
    cmd: "node",
    args: [
      path.join(PKG_ROOT, "dist/dev-ui.js"),
      "--dir",
      DOC_FIXTURE_PATH,
      "--collection",
      uuidv4(),
      "--port",
      ":PORT",
    ],
    cwd: PKG_ROOT,
    env: { ...process.env, DOCOPS_DB: TMP_DB },
    stdio: "inherit",
    ready: {
      kind: "http",
      url: "http://localhost:PORT/health",
      timeoutMs: 60_000,
    },
    port: { mode: "free" },
    baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
  });
  const next: { stop: () => Promise<void>; baseUrl?: string } = { stop };
  if (baseUrl) next.baseUrl = baseUrl;
  state = next;
});

test.after.always(async () => {
  try {
    await state?.stop?.();
  } finally {
    state = null;
    try {
      await shutdown();
    } finally {
      await fs.rm(TMP_DB, { recursive: true, force: true }).catch(() => {});
    }
  }
});

test.serial("SSE /api/run-step footers completes", async (t) => {
  const file = path.join(DOC_FIXTURE_PATH, "hack.md");
  const q = new URLSearchParams({
    step: "footers",
    dir: DOC_FIXTURE_PATH,
    files: JSON.stringify([file]),
    anchorStyle: "none",
  });
  const res = await fetch(`${state!.baseUrl}api/run-step?${q.toString()}`);
  t.is(res.status, 200);
  t.true((res.headers.get("content-type") || "").includes("text/event-stream"));
  const text = await res.text();
  t.true(text.includes("Step 'footers' completed."));
});
