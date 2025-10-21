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

const byId = (id: string) => `#${id}`;

// helper to click Run button inside a <docops-step>
async function runStep(page: any, step: string) {
  await page.evaluate((s: string) => {
    const el = document.querySelector(`docops-step[step="${s}"]`)!;
    const btn = el.shadowRoot!.getElementById("runBtn") as HTMLButtonElement;
    btn.click();
  }, step);
}

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

// When WebSocket construction throws, the UI should fall back to SSE and still run steps.
test.serial(
  "docops-step falls back to SSE when WebSocket fails",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, { page, pageGoto }) => {
    // Override WebSocket to force fallback
    await page.addInitScript(() => {
      (window as any).__origWS = window.WebSocket;
      window.WebSocket = class FailingWS {
        constructor() {
          throw new Error("no ws");
        }
      } as any;
    });

    const res = await pageGoto("/");
    t.truthy(res);

    await page.fill(byId("dir"), DOC_FIXTURE_PATH);
    await page.fill(byId("collection"), `ws-${uuidv4().slice(0, 8)}`);

    // Run footers step; should use SSE
    await runStep(page, "footers");

    await page.waitForFunction(() => {
      const el = document
        .querySelector('docops-step[step="footers"]')
        ?.shadowRoot?.getElementById("log");
      return el && /Step 'footers' completed\./.test(el.textContent || "");
    });

    const logText = await page.evaluate(() => {
      const el = document
        .querySelector('docops-step[step="footers"]')
        ?.shadowRoot?.getElementById("log");
      return el?.textContent || "";
    });
    t.true(
      logText.includes("Step 'footers' completed."),
      "run completed via SSE",
    );
    t.true(/Running step=footers/.test(logText), "progress logs streamed");

    // Clean up override
    await page.evaluate(() => {
      if ((window as any).__origWS) {
        window.WebSocket = (window as any).__origWS;
        delete (window as any).__origWS;
      }
    });
  },
);
