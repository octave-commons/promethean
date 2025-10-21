import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";
import matter from "gray-matter";

import { runRelations } from "../04-relations.js";
import { parseMarkdownChunks } from "../utils.js";

function makeKV() {
  const m = new Map<any, any>();
  return {
    async put(k: any, v: any) {
      m.set(k, v);
    },
    async get(k: any) {
      if (!m.has(k)) throw new Error("not found");
      return m.get(k);
    },
    iterator() {
      const it = m[Symbol.iterator]();
      return {
        async *[Symbol.asyncIterator]() {
          for (const kv of it) yield kv as any;
        },
        async close() {},
      };
    },
    _map: m,
  };
}

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(process.cwd(), "test-tmp", String(Date.now()));
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test.serial("relations honors refMin/refMax and maxReferences", async (t) => {
  await withTmp(async (tmp) => {
    const docsDir = path.join(tmp, "docs");
    await fs.mkdir(docsDir, { recursive: true });
    const aFile = path.join(docsDir, "A.md");
    const bFile = path.join(docsDir, "B.md");
    await fs.writeFile(aFile, matter.stringify("# A\nHello.", {}), "utf8");
    await fs.writeFile(bFile, matter.stringify("# B\nWorld.", {}), "utf8");

    const chunksByUuid = new Map<string, any[]>();
    const aChunks = parseMarkdownChunks("# A\nHello.").map((c, i) => ({
      ...c,
      id: `a:${i}`,
      docUuid: "a",
      docPath: aFile,
    }));
    const bChunks = parseMarkdownChunks("# B\nWorld.").map((c, i) => ({
      ...c,
      id: `b:${i}`,
      docUuid: "b",
      docPath: bFile,
    }));
    chunksByUuid.set("a", aChunks);
    chunksByUuid.set("b", bChunks);

    const docsKV = makeKV();
    await docsKV.put("a", { path: aFile, title: "A" });
    await docsKV.put("b", { path: bFile, title: "B" });
    const chunksKV = makeKV();
    await chunksKV.put("a", aChunks);
    await chunksKV.put("b", bChunks);

    // qhits: a:0 hits b:0 with score 1.0 and 0.7; simulate duplicates across algorithm
    const qhits = new Map<string, any[]>();
    qhits.set("a:0", [
      { id: "b:0", docUuid: "b", startLine: 1, startCol: 1, score: 1.0 },
      { id: "b:0", docUuid: "b", startLine: 1, startCol: 1, score: 0.7 },
    ]);

    const db = {
      root: {
        sublevel() {
          return {
            async get(k: string) {
              return qhits.get(k) || [];
            },
          };
        },
      },
      docs: docsKV,
      chunks: chunksKV,
    } as any;

    // Set refMax below 1.0 to drop the exact 1.0 hit; cap to 1 item by maxReferences
    await runRelations(
      {
        docsDir,
        docThreshold: 0.0,
        refThreshold: 0.0,
        refMin: 0.5,
        refMax: 0.95,
        maxReferences: 1,
      },
      db,
    );

    const gm = matter.read(aFile);
    const fm = gm.data || {};
    t.true(Array.isArray(fm.references));
    t.true(fm.references.length <= 1);
    // Only the 0.7 should remain
    t.true(fm.references.every((r: any) => r.score <= 0.95));
  });
});

test.serial("relations applies default refMin/refMax", async (t) => {
  await withTmp(async (tmp) => {
    const docsDir = path.join(tmp, "docs");
    await fs.mkdir(docsDir, { recursive: true });
    const aFile = path.join(docsDir, "A.md");
    const bFile = path.join(docsDir, "B.md");
    await fs.writeFile(aFile, matter.stringify("# A\nHello.", {}), "utf8");
    await fs.writeFile(bFile, matter.stringify("# B\nWorld.", {}), "utf8");

    const chunksByUuid = new Map<string, any[]>();
    const aChunks = parseMarkdownChunks("# A\nHello.").map((c, i) => ({
      ...c,
      id: `a:${i}`,
      docUuid: "a",
      docPath: aFile,
    }));
    const bChunks = parseMarkdownChunks("# B\nWorld.").map((c, i) => ({
      ...c,
      id: `b:${i}`,
      docUuid: "b",
      docPath: bFile,
    }));
    chunksByUuid.set("a", aChunks);
    chunksByUuid.set("b", bChunks);

    const docsKV = makeKV();
    await docsKV.put("a", { path: aFile, title: "A" });
    await docsKV.put("b", { path: bFile, title: "B" });
    const chunksKV = makeKV();
    await chunksKV.put("a", aChunks);
    await chunksKV.put("b", bChunks);

    // qhits include one above 1.0 and one below default refMin (0.3)
    const qhits = new Map<string, any[]>();
    qhits.set("a:0", [
      { id: "b:0", docUuid: "b", startLine: 1, startCol: 1, score: 1.1 },
      { id: "b:0", docUuid: "b", startLine: 1, startCol: 1, score: 0.4 },
    ]);

    const db = {
      root: {
        sublevel() {
          return {
            async get(k: string) {
              return qhits.get(k) || [];
            },
          };
        },
      },
      docs: docsKV,
      chunks: chunksKV,
    } as any;

    await runRelations(
      {
        docsDir,
        docThreshold: 0.0,
        refThreshold: 0.3,
      },
      db,
    );

    const gm = matter.read(aFile);
    const fm = gm.data || {};
    t.true(Array.isArray(fm.references));
    t.deepEqual(
      fm.references.map((r: any) => r.score),
      [0.4],
    );
    t.true(fm.references.every((r: any) => r.score! <= 1 && r.score! >= 0.3));
  });
});
