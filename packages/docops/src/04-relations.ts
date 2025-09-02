#!/usr/bin/env node
// packages/docops/src/04-relations.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import type { DBs } from "./db";
import { parseArgs } from "./utils";
import type { Chunk, Front, QueryHit } from "./types";

export type RelationsOptions = {
  docsDir: string;
  docThreshold: number;
  refThreshold: number;
  debug?: boolean;
  files?: string[]; // limit to subset
};
let ROOT = path.resolve("docs/unique");
let DOC_THRESHOLD = 0.78;
let REF_THRESHOLD = 0.6;
let DEBUG = false;
const dbg = (...xs: any[]) => {
  if (DEBUG) console.log("[04-relations]", ...xs);
};

type DocInfo = { path: string; title: string };
type DocPairs = Map<string, Map<string, number>>;
type Ref = { uuid: string; line: number; col: number; score?: number };

export async function runRelations(
  opts: RelationsOptions,
  db: DBs,
  onProgress?: (p: {
    step: "relations";
    done: number;
    total: number;
    message?: string;
  }) => void,
) {
  ROOT = path.resolve(opts.docsDir);
  DOC_THRESHOLD = opts.docThreshold;
  REF_THRESHOLD = opts.refThreshold;
  DEBUG = Boolean(opts.debug);
  const docsKV = db.docs; // uuid -> { path, title }
  const chunksKV = db.chunks; // uuid -> readonly Chunk[]
  const qhitsKV = db.root.sublevel<string, readonly QueryHit[]>("q", {
    valueEncoding: "json",
  });

  const uniq = (xs: readonly string[] = []) =>
    Array.from(new Set(xs.filter(Boolean)));
  const isDocFile = (p: string) =>
    /\.(md|mdx|txt)$/i.test(p) && p.startsWith(ROOT);
  const round2 = (n?: number) => (n == null ? n : Math.round(n * 100) / 100);

  const collectEntries = <K extends string, V>(
    it: AsyncIterable<[K, V]>,
  ): Promise<readonly [K, V][]> => {
    const out: Array<readonly [K, V]> = [];
    return (async () => {
      for await (const e of it) out.push(e as readonly [K, V]);
      return out as unknown as readonly [K, V][];
    })();
  };

  const toPairs = (uuid: string, chunks: readonly Chunk[]) =>
    Promise.all(
      chunks.map((c) =>
        qhitsKV
          .get(c.id)
          .then((hs) => (hs ?? []) as readonly QueryHit[])
          .catch(() => [] as readonly QueryHit[])
          .then((hs) =>
            hs.map((h) => [uuid, h.docUuid, h.score ?? 0] as const),
          ),
      ),
    ).then(
      (arrs) => arrs.flat() as ReadonlyArray<readonly [string, string, number]>,
    );

  const buildDocPairs = (
    entries: ReadonlyArray<readonly [string, readonly Chunk[]]>,
    allowed: ReadonlySet<string>,
  ): Promise<DocPairs> =>
    Promise.all(entries.map(([uuid, cs]) => toPairs(uuid, cs)))
      .then((all) => all.flat())
      .then((pairs) =>
        pairs.reduce<DocPairs>((acc, [a, b, score]) => {
          if (a === b) return acc;
          if (!allowed.has(a) || !allowed.has(b)) return acc;
          const m = acc.get(a) ?? new Map<string, number>();
          m.set(b, Math.max(m.get(b) ?? 0, score));
          acc.set(a, m);
          return acc;
        }, new Map()),
      );

  const refsForDoc = (
    uuid: string,
    chunks: readonly Chunk[],
    threshold: number,
    allowed: ReadonlySet<string>,
    chunksMap: ReadonlyMap<string, readonly Chunk[]>,
  ): Promise<Ref[]> =>
    Promise.all(
      chunks.map((c) =>
        qhitsKV
          .get(c.id)
          .then((hs) => (hs ?? []) as readonly QueryHit[])
          .catch(() => [] as readonly QueryHit[])
          .then((hs) =>
            hs
              .filter((h) => allowed.has(h.docUuid))
              .filter((h) => (h.score ?? 0) >= threshold)
              // filter exact text matches: if target chunk text equals source chunk text, drop
              .filter((h) => {
                const id = String((h as any).id || "");
                const [tUuid, idxStr] = id.split(":");
                const idx = Number(idxStr);
                if (!tUuid || !Number.isFinite(idx)) return true;
                const tChunks = chunksMap.get(tUuid) || [];
                const tChunk = tChunks[idx];
                if (!tChunk) return true;
                return (tChunk.text || "").trim() !== (c.text || "").trim();
              })
              .map((h) => ({
                uuid: h.docUuid,
                line: h.startLine,
                col: (h as any).startCol ?? 0,
                score: round2(h.score),
              })),
          ),
      ),
    ).then((arrs) => {
      const all = arrs.flat();
      // dedupe by (uuid:line:col)
      const dedup = all.reduce(
        (m, r) => m.set(`${r.uuid}:${r.line}:${r.col}`, r),
        new Map<string, Ref>(),
      );
      const out = Array.from(dedup.values());
      if (DEBUG)
        dbg("refsForDoc", uuid, "chunks", chunks.length, "refs", out.length);
      return out;
    });

  const peersForDoc = (
    uuid: string,
    docPairs: DocPairs,
    docsByUuid: ReadonlyMap<string, DocInfo>,
    threshold: number,
  ) => {
    const peers = Array.from((docPairs.get(uuid) ?? new Map()).entries())
      .filter(([, s]) => s >= threshold)
      .sort((a, b) => b[1] - a[1]);
    const related_to_uuid = uniq(peers.map(([u]) => u));
    const related_to_title = uniq(
      peers.map(([u]) => docsByUuid.get(u)?.title ?? u),
    );
    return { related_to_uuid, related_to_title } as const;
  };

  const writeFM = (fpath: string, fm: Front) =>
    fs.readFile(fpath, "utf8").then((raw) => {
      const gm = matter(raw);
      const out = matter.stringify(gm.content, fm, { language: "yaml" });
      return fs.writeFile(fpath, out, "utf8");
    });

  const processDoc = (
    entry: readonly [string, DocInfo],
    chunksMap: ReadonlyMap<string, readonly Chunk[]>,
    docsByUuid: ReadonlyMap<string, DocInfo>,
    docPairs: DocPairs,
    allowed: ReadonlySet<string>,
  ) => {
    const [uuid, info] = entry;
    const chunks = (chunksMap.get(uuid) ?? []) as readonly Chunk[];
    const fpath = info.path;

    return fs.readFile(fpath, "utf8").then((raw) => {
      const gm = matter(raw);
      const fm = (gm.data || {}) as Front;
      const peers = peersForDoc(uuid, docPairs, docsByUuid, DOC_THRESHOLD);
      return refsForDoc(uuid, chunks, REF_THRESHOLD, allowed, chunksMap).then(
        (newRefs) => {
          // Rebuild sections every run: no merge with previous frontmatter
          const refs = Array.from(newRefs);
          if (DEBUG && refs.length === 0)
            dbg("no-refs", { uuid, path: fpath, chunks: chunks.length });
          const next: Front = {
            ...fm,
            related_to_uuid: peers.related_to_uuid,
            related_to_title: peers.related_to_title,
            references: refs,
          };
          return writeFM(fpath, next);
        },
      );
    });
  };

  await collectEntries(docsKV.iterator())
    .then((allDocs) => {
      // Filter docs to only those under ROOT with doc-like extensions
      let scopedDocs = allDocs.filter(([, info]) =>
        isDocFile((info as DocInfo).path),
      );
      if (opts.files && opts.files.length) {
        const wanted = new Set(opts.files.map((p) => path.resolve(p)));
        scopedDocs = scopedDocs.filter(([, info]) =>
          wanted.has(path.resolve((info as DocInfo).path)),
        );
      }
      const allowedUuids = new Set(scopedDocs.map(([u]) => u));
      dbg("scopedDocs", scopedDocs.length, "allowedUuids", allowedUuids.size);
      return collectEntries(chunksKV.iterator()).then((allChunks) => {
        // Keep chunks only for allowed docs
        const scopedChunks = allChunks.filter(([uuid]) =>
          allowedUuids.has(uuid),
        );
        const totalChunks = scopedChunks.reduce(
          (n, [, cs]) => n + ((cs as readonly Chunk[])?.length ?? 0),
          0,
        );
        dbg("scopedChunkDocs", scopedChunks.length, "totalChunks", totalChunks);
        return buildDocPairs(scopedChunks, allowedUuids).then((docPairs) => {
          const docsByUuid = new Map<string, DocInfo>(
            scopedDocs as [string, DocInfo][],
          );
          const chunksMap = new Map<string, readonly Chunk[]>(
            scopedChunks as [string, readonly Chunk[]][],
          );
          let done = 0;
          const total = scopedDocs.length;
          return Promise.all(
            scopedDocs.map((e) =>
              processDoc(
                e as [string, DocInfo],
                chunksMap,
                docsByUuid,
                docPairs,
                allowedUuids,
              ).then(() => {
                done++;
                onProgress?.({ step: "relations", done, total });
              }),
            ),
          );
        });
      });
    })
    .then(() => console.log("04-relations: done."));
}

// CLI
import { pathToFileURL } from "node:url";
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    "--docs-dir": "docs/unique",
    "--doc-threshold": "0.78",
    "--ref-threshold": "0.6",
    "--debug": "false",
  });
  console.log(
    `04-relations: ROOT=${path.resolve(args["--docs-dir"])}, DOC_THRESHOLD=${
      args["--doc-threshold"]
    }, REF_THRESHOLD=${args["--ref-threshold"]}`,
  );
  const { openDB } = await import("./db");
  const db = await openDB();
  runRelations(
    {
      docsDir: args["--docs-dir"],
      docThreshold: Number(args["--doc-threshold"]),
      refThreshold: Number(args["--ref-threshold"]),
      debug: args["--debug"] === "true",
    },
    db,
  )
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await db.root.close();
      } catch {}
    });
}
