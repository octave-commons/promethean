import * as path from "node:path";
import { promises as fs } from "node:fs";

import test from "ava";
import { startProcessWithPort, shutdown, withPage } from "@promethean/test-utils";

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

test.serial("hot reload keeps component input state", async (t) => {
  const tmp = path.join(PKG_ROOT, "test-tmp", "hmr-state");
  const cfgPath = path.join(tmp, "pipelines.json");
  await write(cfgPath, JSON.stringify({ pipelines: [{ name: "p", steps: [{ id: "s", js: { module: "./noop.js" } }] }] }, null, 2));
  await write(path.join(tmp, "noop.js"), "export default () => {}\n");

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
    ready: { kind: "http", url: "http://localhost:PORT/health", timeoutMs: 60_000 },
    port: { mode: "free" },
    baseUrlTemplate: (p) => `http://127.0.0.1:${p}/`,
  });

  try {
    await withPage.exec(t as any, { baseUrl: () => baseUrl! }, async (_t: any, { pageGoto, page }: any) => {
      await pageGoto("/");
      // Type into the first available input inside the first piper-step
      await page.waitForSelector("piper-step");
      const beforeVal = "custom-cwd-value";
      await page.evaluate((v: string) => {
        const el = document.querySelector("piper-step")!;
        const root = (el.shadowRoot as ShadowRoot);
        const input = root.querySelector("input[name='cwd']");
        if (input) input.value = v;
      }, beforeVal);

      // Trigger hot reload without page refresh
      await page.evaluate(async () => {
        await import(`/js/main.js?ts=${Date.now()}`);
        (window as any).__PIPER_HOT?.reloadAll?.();
      });

      // Verify input value persists
      const afterVal = await page.evaluate(() => {
        const el = document.querySelector("piper-step")!;
        const root = (el.shadowRoot as ShadowRoot);
        const input = root.querySelector("input[name='cwd']");
        return input?.value || "";
      });
      t.is(afterVal, beforeVal);
    });
  } finally {
    await stop();
    await shutdown().catch(() => {});
  }
});
