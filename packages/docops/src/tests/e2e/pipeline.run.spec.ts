// GPL-3.0-only
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

import test from "ava";
import type { ExecutionContext } from "ava";
import { v4 as uuidv4 } from "uuid";
import {
  shutdown,
  startProcessWithPort,
  withPage,
} from "@promethean/test-utils";
import type { Page } from "playwright";

import { ensureServices } from "../helpers/services.js";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../../",
);

const DOC_FIXTURE_PATH = path.join(PKG_ROOT, "test-tmp", `docs-${uuidv4()}`);
const TMP_DB = path.join(PKG_ROOT, ".cache", `docops-pipeline-${uuidv4()}`);

const serverReady = (async () => {
  await ensureServices();
  await fs.mkdir(DOC_FIXTURE_PATH, { recursive: true });
  await fs.writeFile(
    path.join(DOC_FIXTURE_PATH, "run.md"),
    "---\ntitle: run\n---\n# Sample\n",
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
  return { stop, baseUrl: baseUrl ?? "http://127.0.0.1:3000/" } as const;
})();

test.before(async () => {
  await serverReady;
});

test.after.always(async () => {
  const { stop } = await serverReady;
  await stop();
  await shutdown();
  await Promise.allSettled([
    fs.rm(TMP_DB, { recursive: true, force: true }),
    fs.rm(DOC_FIXTURE_PATH, { recursive: true, force: true }),
  ]);
});

const byId = (id: string) => `#${id}`;

type StepId =
  | "frontmatter"
  | "embed"
  | "query"
  | "relations"
  | "footers"
  | "rename";

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
async function configurePipelineUi(
  t: Readonly<ExecutionContext>,
  page: Readonly<Page>,
  baseUrl: string,
  collection: string,
) {
  await page.goto(`${baseUrl}`, { waitUntil: "domcontentloaded" });
  await page.fill(byId("dir"), DOC_FIXTURE_PATH);
  await page.fill(byId("collection"), collection);
  await page.click(byId("refresh"));
  await page.waitForFunction(() => {
    const sel = document.getElementById("doclist");
    return sel instanceof HTMLSelectElement;
  });
  await clickFileInTree(page, "run.md");
  t.pass("Configured DocOps UI for pipeline test");
}

async function runPipelineAndVerify(
  t: Readonly<ExecutionContext>,
  page: Readonly<Page>,
) {
  const steps: ReadonlyArray<StepId> = [
    "frontmatter",
    "embed",
    "query",
    "relations",
    "footers",
    "rename",
  ];

  await steps.reduce<Promise<void>>(
    async (prev, step) => {
      await prev;
      await runStepFromUi(page, step);
    },
    Promise.resolve(),
  );

  const frontmatterLog = await page.evaluate(() => {
    const host = document.querySelector('docops-step[step="frontmatter"]');
    const element = host instanceof HTMLElement ? host : null;
    const root = element?.shadowRoot ?? null;
    return root?.getElementById("log")?.textContent ?? "";
  });
  t.regex(
    frontmatterLog,
    /completed\./i,
    "Frontmatter step should report completion",
  );

  await page.click(byId("refresh"));
  await page.waitForFunction(
    () => {
      const sel = document.getElementById("doclist");
      return sel instanceof HTMLSelectElement && sel.options.length > 0;
    },
    undefined,
    { timeout: 60_000 },
  );
  const count = await page.evaluate(() => {
    const sel = document.getElementById("doclist");
    return sel instanceof HTMLSelectElement ? sel.options.length : 0;
  });
  t.true(count > 0, "Doc list repopulated after pipeline run");
}

async function clickFileInTree(page: Readonly<Page>, label: string) {
  const item = page.getByRole("treeitem", { name: label }).first();
  if (await item.count().then((n: number) => n > 0)) {
    await item.click();
    return;
  }
  const clicked = await page.evaluate((wanted: string) => {
    const host = document.querySelector("file-tree") as HTMLElement & {
      shadowRoot?: ShadowRoot | null;
    };
    if (!host) return false;
    const root = host.shadowRoot ?? host;
    const anchors = root.querySelectorAll("a, li, span, div, button");
    return Array.from(anchors).some((el) => {
      if ((el.textContent || "").trim() === wanted) {
        (el as HTMLElement).click();
        return true;
      }
      return false;
    });
  }, label);
  if (!clicked) {
    throw new Error(`Could not click file "${label}" in <file-tree>`);
  }
}

async function runStepFromUi(page: Readonly<Page>, step: StepId) {
  const hostLocator = page.locator(`docops-step[step="${step}"]`);
  await hostLocator.waitFor({ state: "attached", timeout: 30_000 });

  const clicked = await page.evaluate(
    (targetStep: StepId) => {
      const host = document.querySelector(`docops-step[step="${targetStep}"]`);
      if (!(host instanceof HTMLElement)) return false;
      const button = host.shadowRoot?.getElementById("runBtn");
      if (!(button instanceof HTMLButtonElement)) return false;
      button.click();
      return true;
    },
    step,
  );
  if (!clicked) {
    throw new Error(`Run button not found for step ${step}`);
  }

  await page.waitForFunction(
    (targetStep: StepId) => {
      const host = document.querySelector(`docops-step[step="${targetStep}"]`);
      if (!(host instanceof HTMLElement)) return false;
      const root = host.shadowRoot;
      if (!root) return false;
      const log = root.getElementById("log");
      if (!log) return false;
      const text = log.textContent ?? "";
      return /completed\./i.test(text);
    },
    step,
    { timeout: 120_000 },
  );

  const logText = await page.evaluate(
    (targetStep: StepId) => {
      const host = document.querySelector(`docops-step[step="${targetStep}"]`);
      if (!(host instanceof HTMLElement)) return "";
      const log = host.shadowRoot?.getElementById("log");
      return log?.textContent ?? "";
    },
    step,
  );

  if (/ERROR/i.test(logText)) {
    throw new Error(`Step ${step} finished with error: ${logText}`);
  }
}
/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */

test.serial(
  "DocOps Pipeline Run: executes pipeline and refreshes file tree",
  withPage,
  { baseUrl: () => undefined as unknown as string },
  async (t, fixtures) => {
    const page =
      fixtures.page ??
      (await (async () => {
        const res = await fixtures.pageGoto?.("/");
        t.truthy(res, "app responded at /");
        throw new Error(
          "withPage did not expose a Playwright `page`. Extend @promethean/test-utils to provide it.",
        );
      })());

    const { baseUrl } = await serverReady;
    const collection = `e2e-${uuidv4().slice(0, 8)}`;

    await configurePipelineUi(t, page, baseUrl, collection);
    await runPipelineAndVerify(t, page);
  },
);
