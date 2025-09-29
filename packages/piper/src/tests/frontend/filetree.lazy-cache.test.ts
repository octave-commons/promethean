import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";

import test from "ava";
import {
  startProcessWithPort,
  shutdown,
  withPage,
  Deps,
} from "@promethean/test-utils";
import type { ReadonlyDeep } from "type-fest";
import type { Page, Route, Response } from "playwright";

const PKG_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

async function write(p: string, s: string) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, "utf8");
}

const treeRoot = path.join(PKG_ROOT, "test-tmp", "lazy-load-root");
const dir1 = path.join(treeRoot, "lazy-1");
const dir2 = path.join(dir1, "lazy-2");
const dir3 = path.join(dir2, "lazy-3");
const leaf = path.join(dir3, "deep.md");
const cfgPath = path.join(treeRoot, "pipelines.json");
const CALL_STORAGE_KEY = "__piper_file_calls";
const EMPTY_PIPELINES = JSON.stringify({ pipelines: [] }, null, 2);

type DevUiProc = Readonly<{ stop: () => Promise<void>; baseUrl: string }>;

type Assertions = Readonly<{
  assertTrue: (value: boolean, message: string) => void;
  assertFalse: (value: boolean, message: string) => void;
}>;

const prepareWorkdir = async () => {
  await fs.rm(treeRoot, { recursive: true, force: true });
  await write(cfgPath, EMPTY_PIPELINES);
};

const startDevUi = async (): Promise<DevUiProc> => {
  await prepareWorkdir();
  const started = await startProcessWithPort({
    cmd: "node",
    args: [
      path.join(PKG_ROOT, "dist/dev-ui.js"),
      "--config",
      cfgPath,
      "--port",
      ":PORT",
    ],
    cwd: PKG_ROOT,
    ready: {
      kind: "http",
      url: "http://localhost:PORT/health",
      timeoutMs: 60_000,
    },
    port: { mode: "free" },
    baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
  });
  const baseUrl = started.baseUrl;
  if (!baseUrl) {
    throw new Error("dev-ui start did not return a baseUrl");
  }
  return { stop: started.stop, baseUrl };
};

const stopDevUi = async (devUi: DevUiProc) => {
  await devUi.stop();
  await shutdown().catch(() => {});
  await fs.rm(treeRoot, { recursive: true, force: true });
};

const usingDevUi = async (fn: (devUi: ReadonlyDeep<DevUiProc>) => unknown) => {
  const devUi = await startDevUi();
  const result = fn(
    devUi as ReadonlyDeep<DevUiProc>,
  ) as PromiseLike<void> | void;
  return Promise.resolve(result).then(
    async () => {
      await stopDevUi(devUi);
    },
    async (error: unknown) => {
      await stopDevUi(devUi);
      throw error;
    },
  );
};

const seedFileTree = async () => {
  await write(cfgPath, EMPTY_PIPELINES);
  await write(leaf, "# deep file\n");
  await write(cfgPath, EMPTY_PIPELINES);
};

const initCallTracking = async (page: ReadonlyDeep<Page>) => {
  await page.addInitScript((key: string) => {
    sessionStorage.setItem(key, "[]");
  }, CALL_STORAGE_KEY);
  await page.route("**/api/files**", (route: ReadonlyDeep<Route>) => {
    const url = route.request().url();
    void page.evaluate(
      ({
        capturedUrl,
        storageKey,
      }: ReadonlyDeep<{ capturedUrl: string; storageKey: string }>) => {
        const raw = sessionStorage.getItem(storageKey) ?? "[]";
        const parsed = JSON.parse(raw) as string[];
        const next = [...parsed, capturedUrl];
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      },
      { capturedUrl: url, storageKey: CALL_STORAGE_KEY },
    );
    void route.continue();
  });
};

const waitForFilesResponse = (page: ReadonlyDeep<Page>) =>
  page.waitForResponse(
    (r: ReadonlyDeep<Response>) => r.url().includes("/api/files") && r.ok(),
  );

const clickDirByLabel = (page: ReadonlyDeep<Page>, label: string) =>
  page
    .waitForFunction((text: string) => {
      const el = document.querySelector("file-tree");
      const root = el?.shadowRoot;
      if (!root) return false;
      const dirs = Array.from(root.querySelectorAll(".dir-line"));
      return dirs.some(
        (d) =>
          (d.querySelector(".dir-name") as HTMLElement)?.textContent === text,
      );
    }, label)
    .then(() =>
      page.evaluate((text: string) => {
        const el = document.querySelector("file-tree")!;
        const root = el.shadowRoot!;
        const dirs = Array.from(root.querySelectorAll(".dir-line"));
        const target = dirs.find(
          (d) =>
            (d.querySelector(".dir-name") as HTMLElement)?.textContent === text,
        ) as HTMLElement | undefined;
        if (!target) throw new Error("dir not found: " + text);
        target.click();
      }, label),
    );

const sawLoadingIndicator = async (page: ReadonlyDeep<Page>) =>
  page
    .waitForFunction(
      () => {
        const el = document.querySelector("file-tree");
        const root = el?.shadowRoot;
        return Boolean(root?.querySelector(".loading"));
      },
      { timeout: 1500 },
    )
    .then(() => true)
    .catch(() => false);

const waitForLeafRender = (page: ReadonlyDeep<Page>) =>
  page.waitForFunction(() => {
    const el = document.querySelector("file-tree");
    const root = el?.shadowRoot;
    if (!root) return false;
    return Array.from(root.querySelectorAll(".file")).some(
      (n) => (n as HTMLElement).textContent?.trim() === "deep.md",
    );
  });

const leafIsVisible = (page: ReadonlyDeep<Page>) =>
  page.evaluate(() => {
    const el = document.querySelector("file-tree")!;
    const root = el.shadowRoot!;
    return Array.from(root.querySelectorAll(".file")).some(
      (n) => (n as HTMLElement).textContent?.trim() === "deep.md",
    );
  });

const readCallCount = (page: ReadonlyDeep<Page>) =>
  page.evaluate((key: string) => {
    const raw = sessionStorage.getItem(key) ?? "[]";
    return (JSON.parse(raw) as string[]).length;
  }, CALL_STORAGE_KEY);

const readNewCalls = (page: ReadonlyDeep<Page>, start: number) =>
  page.evaluate(
    ({ key, offset }: ReadonlyDeep<{ key: string; offset: number }>) => {
      const raw = sessionStorage.getItem(key) ?? "[]";
      return (JSON.parse(raw) as string[]).slice(offset);
    },
    { key: CALL_STORAGE_KEY, offset: start },
  ) as Promise<readonly string[]>;

const reopenLeaf = async (page: ReadonlyDeep<Page>) => {
  await clickDirByLabel(page, "lazy-3");
  await clickDirByLabel(page, "lazy-3");
};

const runScenario = async (
  assertions: Assertions,
  deps: ReadonlyDeep<Deps>,
) => {
  const { assertTrue, assertFalse } = assertions;
  const { pageGoto, page } = deps;
  await seedFileTree();
  await initCallTracking(page);
  await pageGoto("/");
  await waitForFilesResponse(page);
  await page.waitForSelector("file-tree");
  await clickDirByLabel(page, "test-tmp");
  await clickDirByLabel(page, "lazy-load-root");
  await clickDirByLabel(page, "lazy-1");
  await clickDirByLabel(page, "lazy-2");
  const sawLoading = await sawLoadingIndicator(page);
  assertTrue(sawLoading, "shows loading indicator during fetch");
  await clickDirByLabel(page, "lazy-3");
  await waitForLeafRender(page);
  const leafVisible = await leafIsVisible(page);
  assertTrue(leafVisible, "deep leaf file is visible after nested expands");
  const callCount = await readCallCount(page);
  await reopenLeaf(page);
  const newCalls = await readNewCalls(page, callCount);
  const reFetchedSameDir = newCalls.some((u) => u.includes("lazy-3"));
  assertFalse(reFetchedSameDir, "re-open uses cache without refetching");
};

// Verifies lazy-loading (fetch on expand), loading indicator, and caching (no refetch on re-open)
// using the <file-tree> component rendered by the dev-ui.

test.serial("file-tree lazy loads and caches directory contents", async (t) => {
  await usingDevUi((devUi) =>
    withPage.exec(t, { baseUrl: devUi.baseUrl }, (tt, deps) => {
      const assertions: Assertions = {
        assertTrue: (value, message) => {
          tt.true(value, message);
        },
        assertFalse: (value, message) => {
          tt.false(value, message);
        },
      };
      return runScenario(assertions, deps as ReadonlyDeep<Deps>);
    }),
  );
});
