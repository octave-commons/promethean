import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";
import matter from "gray-matter";

import { runRelations } from "../04-relations.js";

async function withTmp(fn: (dir: string) => Promise<void> | void) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

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
  } as const;
}

test.serial("runRelations skips missing chunk entries", async (t) => {
  await withTmp(async (tmp) => {
    const docsDir = path.join(tmp, "docs");
    await fs.mkdir(docsDir, { recursive: true });

    const docUuid = "doc-uuid";
    const docPath = path.join(docsDir, "Doc.md");
    const raw = matter.stringify("# Doc\nBody.", {
      uuid: docUuid,
      filename: "Doc",
    });
    await fs.writeFile(docPath, raw, "utf8");

    const docsKV = makeKV();
    await docsKV.put(docUuid, { path: docPath, title: "Doc" });

    const chunksKV = {
      async get() {
        return undefined as unknown as readonly unknown[];
      },
    } as const;

    const db = {
      root: {
        sublevel() {
          return {
            async get() {
              return [];
            },
          };
        },
      },
      docs: docsKV,
      chunks: chunksKV,
    } as any;

    await t.notThrowsAsync(() =>
      runRelations(
        {
          docsDir,
          docThreshold: 0,
          refThreshold: 0,
        },
        db,
      ),
    );

    const fm = matter.read(docPath).data as Record<string, unknown>;
    t.deepEqual(fm.related_to_uuid ?? [], []);
    t.deepEqual(fm.related_to_title ?? [], []);
    t.deepEqual(fm.references ?? [], []);
  });
});
