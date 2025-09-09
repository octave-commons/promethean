import * as fs from "node:fs/promises";
import * as path from "node:path";

import test from "ava";

import { runFooters } from "../05-footers.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = await fs.mkdtemp(path.join(process.cwd(), "test-tmp-"));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("runFooters emits wiki links", async (t) => {
  await withTmp(async (dir) => {
    const docBPath = path.join(dir, "docB.md");
    await fs.writeFile(
      docBPath,
      ["---", "uuid: uuid-b", "title: Doc B", "---", "Doc B body"].join("\n"),
      "utf8",
    );

    const docAPath = path.join(dir, "docA.md");
    await fs.writeFile(
      docAPath,
      [
        "---",
        "uuid: uuid-a",
        "related_to_uuid:",
        "  - uuid-b",
        "references:",
        "  - uuid: uuid-b",
        "    line: 1",
        "    col: 0",
        "---",
        "Doc A body",
      ].join("\n"),
      "utf8",
    );

    const docsMap = new Map([
      ["uuid-a", { path: docAPath, title: "Doc A" }],
      ["uuid-b", { path: docBPath, title: "Doc B" }],
    ]);
    const db = {
      docs: {
        iterator() {
          return (async function* () {
            for (const kv of docsMap.entries()) yield kv;
          })();
        },
      },
    };

    await runFooters({ dir }, db as any);
    const updated = await fs.readFile(docAPath, "utf8");
    t.true(updated.includes("- [[docB|Doc B]]"));
    t.regex(
      updated,
      /- \[\[docB#\^ref-[^|]+\|Doc B — L1\]\] \(line 1, col 0\)/,
    );
  });
});
