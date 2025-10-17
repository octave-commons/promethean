// GPL-3.0-only
/* eslint-disable functional/no-let, max-lines-per-function, @typescript-eslint/no-unsafe-argument */
import * as path from "node:path";
import * as url from "node:url";
import { promises as fs } from "node:fs";

import { v4 as uuidv4 } from "uuid";
import test from "ava";
import {
  withPage,
  shutdown,
  startProcessWithPort,
  type Deps,
} from "@promethean/test-utils";

import { ensureServices } from "../helpers/services.js";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../../",
);
// temporary docs directory
const DOC_FIXTURE_PATH = path.join(PKG_ROOT, "test-tmp", `docs-${uuidv4()}`);
const TMP_DB = path.join(PKG_ROOT, ".cache", `docops-e2e-${uuidv4()}`);

let state: { stop: () => Promise<void>; baseUrl?: string } | null = null;

test.before(async () => {
  await ensureServices();
  await fs.mkdir(DOC_FIXTURE_PATH, { recursive: true });
  await fs.writeFile(
    path.join(DOC_FIXTURE_PATH, "hack.md"),
    "---\ntitle: hack\n---\n# Hello\n",
  );
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
      url: "http://127.0.0.1:PORT/health",
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
      await Promise.all([
        fs.rm(TMP_DB, { recursive: true, force: true }).catch(() => {}),
        fs
          .rm(DOC_FIXTURE_PATH, { recursive: true, force: true })
          .catch(() => {}),
      ]);
    }
  }
});

const byId = (id: string) => `#${id}`;

test.serial(
  "DocOps E2E: refresh picks up new files in file-tree and doclist",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { page, pageGoto }: Deps) => {
    const res = await pageGoto("/");
    t.truthy(res, "app responded at /");

    await page.goto(`${state!.baseUrl}`, { waitUntil: "domcontentloaded" });

    await page.fill(byId("dir"), DOC_FIXTURE_PATH);
    await page.fill(byId("collection"), `e2e-${uuidv4().slice(0, 8)}`);

    await page.click(byId("refresh"));
    await page.waitForSelector("#doclist");

    const newFileName = "newfile.md";
    const newFilePath = path.join(DOC_FIXTURE_PATH, newFileName);
    const docUuid = uuidv4();
    await fs.writeFile(
      newFilePath,
      [
        "---",
        `uuid: ${docUuid}`,
        "filename: newfile",
        "description: test file",
        "tags:",
        "  - test",
        "---",
        "# new file\n",
      ].join("\n"),
    );
    // run frontmatter step via API to ingest the new file into the doc store
    await page.evaluate(
      ({ dir, file }: { dir: string; file: string }) =>
        new Promise<void>((resolve, reject) => {
          const params = new URLSearchParams({
            step: "frontmatter",
            dir,
            files: JSON.stringify([file]),
          });
          const es = new EventSource(`/api/run-step?${params.toString()}`);
          es.onmessage = (ev) => {
            if (/(?:completed)/i.test(ev.data || "")) {
              es.close();
              resolve();
            }
          };
          es.onerror = () => {
            es.close();
            reject(new Error("sse error"));
          };
        }),
      { dir: DOC_FIXTURE_PATH, file: newFilePath },
    );

    await page.click(byId("refresh"));

    await page.waitForFunction((name: string) => {
      const sel = document.getElementById(
        "doclist",
      ) as HTMLSelectElement | null;
      if (!sel) return false;
      return Array.from(sel.options).some((o) => o.textContent?.includes(name));
    }, newFileName);
    const doclistHas = await page.evaluate((name: string) => {
      const sel = document.getElementById(
        "doclist",
      ) as HTMLSelectElement | null;
      if (!sel) return false;
      return Array.from(sel.options).some((o) => o.textContent?.includes(name));
    }, newFileName);
    t.true(doclistHas, "#doclist should contain newfile.md");

    await page.waitForFunction((name: string) => {
      const host = document.querySelector("file-tree") as HTMLElement & {
        shadowRoot?: ShadowRoot | null;
      };
      if (!host) return false;
      const root = host.shadowRoot ?? host;
      const anchors = root.querySelectorAll("a, li, span, div, button");
      return Array.from(anchors).some(
        (el) => (el.textContent || "").trim() === name,
      );
    }, newFileName);
    const treeHas = await page.evaluate((name: string) => {
      const host = document.querySelector("file-tree") as HTMLElement & {
        shadowRoot?: ShadowRoot | null;
      };
      if (!host) return false;
      const root = host.shadowRoot ?? host;
      const anchors = root.querySelectorAll("a, li, span, div, button");
      return Array.from(anchors).some(
        (el) => (el.textContent || "").trim() === name,
      );
    }, newFileName);
    t.true(treeHas, "<file-tree> should contain newfile.md");
  },
);
