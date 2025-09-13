import * as path from "node:path";
import { promises as fs } from "node:fs";

import test from "ava";
import {
  startProcessWithPort,
  shutdown,
  withPage,
} from "@promethean/test-utils";

const PKG_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
);

async function write(p: string, s: string) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, "utf8");
}

// Verifies lazy-loading (fetch on expand), loading indicator, and caching (no refetch on re-open)
// using the <file-tree> component rendered by the dev-ui.

test.serial("file-tree lazy loads and caches directory contents", async (t) => {
  const treeRoot = path.join(PKG_ROOT, "test-tmp", "lazy-load-root");
  const dir1 = path.join(treeRoot, "lazy-1");
  const dir2 = path.join(dir1, "lazy-2");
  const dir3 = path.join(dir2, "lazy-3");
  const leaf = path.join(dir3, "deep.md");
  await write(leaf, "# deep file\n");

  // Minimal pipelines to satisfy dev-ui start (not used by file-tree)
  const cfgPath = path.join(treeRoot, "pipelines.json");
  await write(cfgPath, JSON.stringify({ pipelines: [] }, null, 2));

  const { stop, baseUrl } = await startProcessWithPort({
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

  try {
    await withPage.exec(
      t as any,
      { baseUrl: () => baseUrl! },
      async (_t: any, { pageGoto, page }: any) => {
        // Count API calls to /api/files
        const apiCalls: string[] = [];
        await page.route("**/api/files**", (route: any) => {
          apiCalls.push(route.request().url());
          route.continue();
        });

        await pageGoto("/");
        await page.waitForResponse(
          (r: any) => r.url().includes("/api/files") && r.ok(),
        );

        // Expand test-tmp
        await page.waitForSelector("file-tree");
        // Work inside shadow DOM by label (robust against absolute path differences)
        const clickDirByLabel = async (label: string) => {
          await page.waitForFunction((text: string) => {
            const el = document.querySelector("file-tree");
            const root = (el?.shadowRoot as ShadowRoot) || undefined;
            if (!root) return false;
            const dirs = Array.from(root.querySelectorAll(".dir-line"));
            return !!dirs.find(
              (d) =>
                (d.querySelector(".dir-name") as HTMLElement)?.textContent ===
                text,
            );
          }, label);
          await page.evaluate((text: string) => {
            const el = document.querySelector("file-tree")!;
            const root = el.shadowRoot as ShadowRoot;
            const dirs = Array.from(root.querySelectorAll(".dir-line"));
            const target = dirs.find(
              (d) =>
                (d.querySelector(".dir-name") as HTMLElement)?.textContent ===
                text,
            ) as HTMLElement | undefined;
            if (!target) throw new Error("dir not found: " + text);
            target.click();
          }, label);
        };

        // Click to expand test-tmp, lazy-1, lazy-2, lazy-3 in sequence
        await clickDirByLabel("test-tmp");
        await clickDirByLabel("lazy-load-root");
        await clickDirByLabel("lazy-1");
        await clickDirByLabel("lazy-2");

        // When expanding lazy-2, its sub UL should momentarily show a loading indicator
        // We check existence of any .loading element at some point during expansion
        const sawLoading = await page.evaluate(async () => {
          const el = document.querySelector("file-tree")!;
          const root = el.shadowRoot as ShadowRoot;
          const start = performance.now();
          while (performance.now() - start < 1500) {
            if (root.querySelector(".loading")) return true;
            await new Promise((r) => setTimeout(r, 50));
          }
          return false;
        });
        t.true(sawLoading, "shows loading indicator during fetch");

        await clickDirByLabel("lazy-3");

        // Leaf should be visible
        const leafVisible = await page.evaluate(() => {
          const el = document.querySelector("file-tree")!;
          const root = el.shadowRoot as ShadowRoot;
          const file = Array.from(root.querySelectorAll(".file")).find(
            (n) => (n as HTMLElement).textContent?.trim() === "deep.md",
          );
          return !!file;
        });
        t.true(leafVisible, "deep leaf file is visible after nested expands");

        const callsAfterFirstOpen = apiCalls.slice();

        // Collapse and re-open lazy-3; should not trigger another /api/files for the same dir
        await clickDirByLabel("lazy-3"); // collapse
        await clickDirByLabel("lazy-3"); // reopen -> should use cache

        const newCalls = apiCalls.slice(callsAfterFirstOpen.length);
        const reFetchedSameDir = newCalls.some((u) => u.includes("lazy-3"));
        t.false(reFetchedSameDir, "re-open uses cache without refetching");
      },
    );
  } finally {
    await stop();
    await shutdown().catch(() => {});
  }
});
