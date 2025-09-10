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
  "GET /api/chunks with random uuid returns empty items",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const uuid = uuidv4();
    const res = await pageGoto(`/api/chunks?uuid=${encodeURIComponent(uuid)}`);
    t.truthy(res);
    t.is(res!.status(), 200);
    const json = await res!.json();
    t.is(json.uuid, uuid);
    t.true(Array.isArray(json.items));
  },
);

test.serial(
  "GET /api/chunks with unknown file returns 400",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const abs = path.join(DOC_FIXTURE_PATH, "hack.md");
    const res = await pageGoto(`/api/chunks?file=${encodeURIComponent(abs)}`);
    t.truthy(res);
    t.is(res!.status(), 400);
    const json = await res!.json();
    t.truthy(json.error);
  },
);

test.serial(
  "GET /api/chunk-hits with random id returns empty items",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const id = `${uuidv4()}:0`;
    const res = await pageGoto(`/api/chunk-hits?id=${encodeURIComponent(id)}`);
    t.truthy(res);
    t.is(res!.status(), 200);
    const json = await res!.json();
    t.is(json.id, id);
    t.true(Array.isArray(json.items));
  },
);

test.serial(
  "GET /api/search with empty query returns []",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { pageGoto }) => {
    const res = await pageGoto(`/api/search?q=`);
    t.truthy(res);
    t.is(res!.status(), 200);
    const json = await res!.json();
    t.true(Array.isArray(json.items));
    t.is(json.items.length, 0);
  },
);
