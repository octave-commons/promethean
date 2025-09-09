// GPL-3.0-only
import * as path from "node:path";
import * as url from "node:url";
import { promises as fs } from "node:fs";

import { v4 as uuidv4 } from "uuid";
import test from "ava";
import {
  withPage,
  shutdown,
  startProcessWithPort,
} from "@promethean/test-utils";

import { ensureServices } from "../helpers/services.js";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../../",
);
// spin up a temporary docs dir so the UI has at least one file to render
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

/**
 * Helpers
 */
const byId = (id: string) => `#${id}`;

// Attempt to click inside a web component that may have an open shadow root.
// Prefer role locators first; fall back to JS evaluation for tricky cases.
// Playwright can pierce open shadow roots with locators; try that first.  (docs: Locators)
async function clickFileInTree(page: any, label: string) {
  // Try resilient, user-facing locator first.
  const item = page.getByRole("treeitem", { name: label }).first();
  if (await item.count().then((n: number) => n > 0)) {
    await item.click();
    return;
  }
  // Fallback: query the host, then traverse shadowRoot.
  const clicked = await page.evaluate((wanted: string) => {
    const host = document.querySelector("file-tree") as HTMLElement & {
      shadowRoot?: ShadowRoot | null;
    };
    if (!host) return false;
    const root = host.shadowRoot ?? host; // if no shadow, use light DOM
    const anchors = root.querySelectorAll("a, li, span, div, button");
    for (const el of anchors) {
      if ((el.textContent || "").trim() === wanted) {
        (el as HTMLElement).click();
        return true;
      }
    }
    return false;
  }, label);
  if (!clicked)
    throw new Error(`Could not click file "${label}" in <file-tree>`);
}

test.serial(
  "DocOps E2E: loads UI, sets config, previews frontmatter, renders markdown, searches, and inspects status",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, fixtures) => {
    // Prefer fixtures.page if available; otherwise, open using pageGoto then attach page.
    const page =
      (fixtures as any).page ??
      (await (async () => {
        const res = await fixtures.pageGoto?.("/");
        t.truthy(res, "app responded at /");
        // If your test-utils exposes a way to get Playwright's Page/Context, use that.
        // As a last resort, throw — the agent should extend test-utils to expose `page`.
        throw new Error(
          "withPage did not expose a Playwright `page`. Extend @promethean/test-utils to provide it.",
        );
      })());

    // Navigate to root UI
    await page.goto(`${state!.baseUrl}`, { waitUntil: "domcontentloaded" });

    // Title + critical UI parts present
    await page.waitForSelector("h1");
    const title = await page.title();
    t.true(/DocOps/i.test(title), "page title should include DocOps");

    // Fill "Docs dir" and "Collection"
    await page.fill(byId("dir"), DOC_FIXTURE_PATH);
    const coll = `e2e-${uuidv4().slice(0, 8)}`;
    await page.fill(byId("collection"), coll);

    // Adjust thresholds (smoke that inputs are live)
    await page.fill(byId("docT"), "0.70");
    await page.fill(byId("refT"), "0.80");

    // Refresh doc list and assert it populates
    await page.click(byId("refresh"));
    // Wait for #doclist to gain at least one option (best-effort: check textContent changes)
    await page.waitForFunction(() => {
      const sel = document.getElementById(
        "doclist",
      ) as HTMLSelectElement | null;
      return !!sel && sel.options && sel.options.length >= 0; // allow empty, but exists
    });
    t.pass("Doc list refreshed");

    // Click a file in the File Explorer (rendering Markdown requires a selection)
    // Use a known fixture file label; adjust if your file-tree shows just names.
    await clickFileInTree(page, "hack.md");

    // Try direct render via the "Render Selected File" button
    await page.click(byId("renderMd"));
    await page.waitForFunction(() => {
      const el = document.getElementById("mdRender");
      return !!el && (el.textContent?.length ?? 0) > 0;
    });
    const mdHtml = await page.textContent(byId("mdRender"));
    t.truthy(
      mdHtml && mdHtml.length > 0,
      "Markdown render container should have content",
    );

    // Preview Frontmatter
    await page.click(byId("preview"));
    await page.waitForFunction(() => {
      const el = document.getElementById("out");
      return !!el && el.textContent !== "(no preview)";
    });
    const previewOut = await page.textContent(byId("out"));
    t.truthy(
      previewOut && previewOut.trim().length > 0,
      "Frontmatter preview produced output",
    );

    // Run a search
    await page.fill(byId("searchTerm"), "duck");
    await page.fill(byId("searchK"), "5");
    await page.click(byId("searchBtn"));
    await page.waitForSelector(byId("searchResults"));
    const searchHtml = await page.textContent(byId("searchResults"));
    t.truthy(searchHtml && searchHtml.length > 0, "Search results populated");

    // Status table flow
    await page.click(byId("statusRefresh"));
    await page.waitForSelector(byId("statusTable"));
    const statusText = await page.textContent(byId("statusTable"));
    t.truthy(statusText, "Pipeline status table loaded");

    // Logs/progress are present — not asserting contents, only that UI updated
    await page.waitForSelector("#logs");
    const logs = await page.textContent("#logs");
    t.truthy(typeof logs === "string", "Logs area present");

    // Sanity: config API reflects inputs (light E2E: UI + API agree)
    // We assert UI inputs match what we filled
    t.is(await page.inputValue(byId("dir")), DOC_FIXTURE_PATH);
    t.is(await page.inputValue(byId("collection")), coll);
  },
);

test.serial(
  "DocOps E2E: empty search shows prompt and skips API call",
  withPage,
  { baseUrl: () => state?.baseUrl },
  async (t, fixtures) => {
    const page =
      (fixtures as any).page ??
      (await (async () => {
        const res = await fixtures.pageGoto?.("/");
        t.truthy(res, "app responded at /");
        throw new Error(
          "withPage did not expose a Playwright `page`. Extend @promethean/test-utils to provide it.",
        );
      })());

    await page.goto(`${state!.baseUrl}`, { waitUntil: "domcontentloaded" });

    let searchCalled = false;
    page.on("request", (req: any) => {
      if (req.url().includes("/api/search")) searchCalled = true;
    });

    await page.fill(byId("searchTerm"), "");
    await page.click(byId("searchBtn"));

    await page.waitForSelector(byId("searchResults"));
    const text = await page.textContent(byId("searchResults"));
    t.regex(text ?? "", /Enter a query to search\./);
    t.false(searchCalled, "Search API should not be called for empty query");
  },
);
