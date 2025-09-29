import * as path from "node:path";
import { promises as fs } from "node:fs";

import test from "ava";
import { openLevelCache } from "@promethean/level-cache";

import { outline } from "../02-outline.js";
import type { OutlinesFile } from "../types.js";

test("outline fallback uses GPL-3.0-only license", async (t) => {
  const cacheDir = path.join(".cache", "readmeflow-outline-test");
  const cache = await openLevelCache({ path: cacheDir });
  await cache.set("scan", {
    createdAt: new Date().toISOString(),
    packages: [
      {
        name: "@promethean/example",
        version: "0.0.0",
        dir: "",
        workspaceDeps: [],
        hasTsConfig: false,
      },
    ],
    graphMermaid: "",
  });
  await cache.close();

  await outline({ cache: cacheDir });

  const outCache = await openLevelCache<OutlinesFile>({ path: cacheDir });
  const out = (await outCache.get("outlines")) as OutlinesFile;
  await outCache.close();

  const license = out.outlines["@promethean/example"]?.sections.find(
    (s) => s.heading === "License",
  );
  t.is(license?.body, "GPL-3.0-only");

  await fs.rm(cacheDir, { recursive: true, force: true });
});
