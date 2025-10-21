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
  "GET /api/chunk-hits missing id returns 400",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(`/api/chunk-hits`);
    t.truthy(res);
    t.true(res!.status() >= 400 && res!.status() < 500);
    const json = await res!.json();
    t.truthy(json.error);
  },
);

test.serial(
  "GET /api/chunks missing uuid and file returns 400",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(`/api/chunks`);
    t.truthy(res);
    t.true(res!.status() >= 400 && res!.status() < 500);
    const json = await res!.json();
    t.truthy(json.error);
  },
);

test.serial(
  "GET /api/read missing file returns 400",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(`/api/read`);
    t.truthy(res);
    t.is(res!.status(), 400);
    const json = await res!.json();
    t.truthy(json.error);
  },
);

test.serial(
  "GET /api/read rejects non-markdown",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const file = path.join(PKG_ROOT, "package.json");
    const res = await pageGoto(`/api/read?file=${encodeURIComponent(file)}`);
    t.truthy(res);
    t.is(res!.status(), 400);
    const json = await res!.json();
    t.truthy(json.error);
  },
);

test.serial(
  "GET /api/preview missing both uuid and file returns error",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(`/api/preview`);
    t.truthy(res);
    t.true(res!.status() >= 400);
    const json = await res!.json();
    t.truthy(json.error);
  },
);

test.serial(
  "GET /api/status page>1 returns empty items",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(`/api/status?limit=1&page=2`);
    t.truthy(res);
    t.is(res!.status(), 200);
    const json = await res!.json();
    t.true(Array.isArray(json.items));
    t.is(json.items.length, 0);
    t.is(json.hasMore, false);
  },
);

test.serial(
  "GET /api/files includeMeta=1 includes size/fmLen for md files",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(
      `/api/files?includeMeta=1&maxDepth=1&maxEntries=50&exts=.md`,
    );
    t.truthy(res);
    t.is(res!.status(), 200);
    const json = await res!.json();
    t.true(Array.isArray(json.tree));
    function findWithMeta(nodes: any[]): any | null {
      for (const n of nodes) {
        if (
          n.type === "file" &&
          typeof n.size === "number" &&
          typeof n.fmLen === "number"
        ) {
          return n;
        }
        if (Array.isArray(n.children)) {
          const r = findWithMeta(n.children);
          if (r) return r;
        }
      }
      return null;
    }
    const found = findWithMeta(json.tree);
    t.truthy(found);
    t.is(typeof found!.size, "number");
    t.is(typeof found!.fmLen, "number");
  },
);
