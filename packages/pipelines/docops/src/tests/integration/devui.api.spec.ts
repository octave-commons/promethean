import * as path from "node:path";
import * as url from "node:url";
import { promises as fs } from "node:fs";

import { v4 as uuidv4 } from "uuid";

import "../helpers/setup.js";
import test from "ava";
import {
  withPage,
  shutdown,
  startProcessWithPort,
} from "@promethean/test-utils";

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

test.serial(
  "GET /api/config returns dir/collection/ws",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto("/api/config");
    t.truthy(res);
    const json = await res!.json();
    t.is(typeof json.dir, "string");
    t.true(json.dir.endsWith("fixtures/docs"));
    t.is(typeof json.collection, "string");
    t.is(typeof json.ws, "boolean");
  },
);

test.serial(
  "GET /api/files returns tree and cache headers",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(
      "/api/files?maxDepth=2&maxEntries=50&includeMeta=1",
    );
    t.truthy(res);
    t.is(res!.status(), 200);
    t.is(
      res!.headers()["cache-control"],
      "no-store, no-cache, must-revalidate",
    );
    const json = await res!.json();
    // returns { dir, tree }
    if (typeof json.dir !== "undefined") {
      t.is(typeof json.dir, "string");
      t.true(String(json.dir).endsWith("fixtures/docs"));
    }
    t.true(Array.isArray(json.tree));
    if (json.tree.length > 0) {
      t.is(typeof json.tree[0].name, "string");
    }
  },
);

test.serial(
  "GET /api/docs returns an array (possibly empty)",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto("/api/docs");
    t.truthy(res);
    const json = await res!.json();
    t.true(Array.isArray(json));
  },
);

test.serial(
  "GET /api/read serves file content inside dir",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const file = path.join(DOC_FIXTURE_PATH, "test.md");
    const res = await pageGoto(`/api/read?file=${encodeURIComponent(file)}`);
    t.truthy(res);
    t.is(res!.headers()["content-type"], "text/plain; charset=utf-8");
    const txt = await res!.text();
    t.true(typeof txt === "string" && txt.length > 0);
  },
);

test.serial(
  "GET /api/preview with unknown file returns error",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const file = path.join(DOC_FIXTURE_PATH, "__nope__.md");
    const res = await pageGoto(`/api/preview?file=${encodeURIComponent(file)}`);
    t.truthy(res);
    const json = await res!.json();
    t.truthy(json.error);
  },
);

test.serial(
  "GET /api/status returns items/page/hasMore/total",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto("/api/status?limit=10&page=1&onlyIncomplete=1");
    t.truthy(res);
    t.is(
      res!.headers()["cache-control"],
      "no-store, no-cache, must-revalidate",
    );
    const json = await res!.json();
    t.true(Array.isArray(json.items));
    t.is(typeof json.page, "number");
    t.is(typeof json.hasMore, "boolean");
    t.is(typeof json.total, "number");
  },
);
