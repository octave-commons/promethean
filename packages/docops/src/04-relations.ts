// packages/docops/src/04-relations.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";

import type { DBs } from "./db.js";
import { parseArgs } from "./utils.js";
import type { Chunk, Front, QueryHit } from "./types.js";

// CLI

export type RelationsOptions = {
  docsDir: string;
  docThreshold: number;
  refThreshold: number;
  refMin?: number; // lower bound for references
  refMax?: number; // upper bound for references
  maxRelated?: number; // cap related_to_* lists
  maxReferences?: number; // cap references list
  debug?: boolean;
  files?: string[]; // limit to subset
};
let ROOT = path.resolve("docs/unique");
let DOC_THRESHOLD = 0.78;
let REF_THRESHOLD = 0.6;
let REF_MIN = REF_THRESHOLD;
let REF_MAX = 1.0;
let MAX_RELATED = 25;
let MAX_REFERENCES = 100;
let DEBUG = false;
const dbg = (...xs: any[]) => {
  if (DEBUG) console.log("[04-relations]", ...xs);
};

type DocInfo = { path: string; title: string };
type Ref = { uuid: string; line: number; col: number; score?: number };

export async function runRelations(
  opts: RelationsOptions,
  db: DBs,
  onProgress?: (p: {
    step: "relations";
    done?: number;
    total?: number;
    percent?: number;
    message?: string;
  }) => void,
) {
  ROOT = path.resolve(opts.docsDir);
  DOC_THRESHOLD = opts.docThreshold;
  REF_THRESHOLD = opts.refThreshold;
  MAX_RELATED =
    Math.max(0, Number(opts.maxRelated ?? MAX_RELATED) | 0) || MAX_RELATED;
  MAX_REFERENCES =
    Math.max(0, Number(opts.maxReferences ?? MAX_REFERENCES) | 0) ||
    MAX_REFERENCES;
  REF_MIN = Number.isFinite(opts.refMin as number)
    ? Math.max(0, Math.min(1, Number(opts.refMin)))
    : REF_THRESHOLD;
  REF_MAX = Number.isFinite(opts.refMax as number)
    ? Math.max(0, Math.min(1, Number(opts.refMax)))
    : 1.0;
  if (REF_MIN > REF_MAX) [REF_MIN, REF_MAX] = [REF_MAX, REF_MIN];
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

  const collectEntries = async <K extends string, V>(
    it: AsyncIterable<[K, V]>,
  ): Promise<readonly [K, V][]> => {
    const out: Array<readonly [K, V]> = [];
    for await (const e of it) out.push(e as readonly [K, V]);
    return out as unknown as readonly [K, V][];
  };

  // Lazily fetch chunks by uuid with a small in-memory cache to reduce DB gets
  const makeChunkLoader = (db: DBs["chunks"], max = 256) => {
    const cache = new Map<string, readonly Chunk[]>();
    const order: string[] = [];
    const get = async (uuid: string): Promise<readonly Chunk[]> => {
      if (cache.has(uuid)) return cache.get(uuid)!;
      const val = (await db.get(uuid).catch(() => [])) as readonly Chunk[];
      cache.set(uuid, val);
      order.push(uuid);
      if (order.length > max) {
        const k = order.shift()!;
        cache.delete(k);
      }
      return val;
    };
    return { get } as const;
  };

  const refsForDoc = async (
    uuid: string,
    chunks: readonly Chunk[],
    threshold: number,
    allowed: ReadonlySet<string>,
    chunkLoader: { get(uuid: string): Promise<readonly Chunk[]> },
    report?: (stage: string, idx: number, of: number) => void,
  ): Promise<Ref[]> => {
    const acc = new Map<string, Ref>();
    for (let ci = 0; ci < chunks.length; ci++) {
      const c = chunks[ci]!;
      const hs = (await qhitsKV.get(c.id).catch(() => [])) || [];
      for (const h of hs) {
        if (!allowed.has(h.docUuid)) continue;
        const s = h.score ?? 0;
        if (s < Math.max(threshold, REF_MIN) || s > REF_MAX) continue;
        // filter exact text match
        const id = String((h as any).id || "");
        const [tUuid, idxStr] = id.split(":");
        const idx = Number(idxStr);
        let isExact = false;
        if (tUuid && Number.isFinite(idx)) {
          const tChunks = await chunkLoader.get(tUuid);
          const tChunk = tChunks[idx];
          if (tChunk)
            isExact = (tChunk.text || "").trim() === (c.text || "").trim();
        }
        if (isExact) continue;
        const key = `${h.docUuid}:${h.startLine}:${(h as any).startCol ?? 0}`;
        const s2 = round2(s);
        acc.set(key, {
          uuid: h.docUuid,
          line: h.startLine,
          col: (h as any).startCol ?? 0,
          ...(s2 != null ? { score: s2 } : {}),
        });
      }
      if (report && ci % 20 === 0) report("refs", ci + 1, chunks.length);
    }
    const out = Array.from(acc.values())
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, MAX_REFERENCES);
    if (DEBUG)
      dbg("refsForDoc", uuid, "chunks", chunks.length, "refs", out.length);
    return out;
  };

  const writeFM = (fpath: string, fm: Front) =>
    fs.readFile(fpath, "utf8").then((raw) => {
      const gm = matter(raw);
      const out = matter.stringify(gm.content, fm, { language: "yaml" });
      return fs.writeFile(fpath, out, "utf8");
    });

  const processDoc = (
    entry: readonly [string, DocInfo],
    docsByUuid: ReadonlyMap<string, DocInfo>,
    allowed: ReadonlySet<string>,
    chunkLoader: { get(uuid: string): Promise<readonly Chunk[]> },
    docIdx: number,
    totalDocs: number,
  ) => {
    const [uuid, info] = entry;
    const fpath = info.path;

    const report = (stage: string, idx: number, of: number) => {
      const frac = Math.max(
        0,
        Math.min(1, (docIdx + idx / Math.max(1, of)) / Math.max(1, totalDocs)),
      );
      onProgress?.({
        step: "relations",
        percent: Math.round(frac * 100),
        message: `doc ${docIdx + 1}/${totalDocs} ${stage} ${idx}/${of}`,
      });
    };

    return fs.readFile(fpath, "utf8").then(async (raw) => {
      const gm = matter(raw);
      const fm = (gm.data || {}) as Front;
      const chunks = await chunkLoader.get(uuid);

      // Compute peers: for each chunk, accumulate max score per target doc
      const maxScore = new Map<string, number>();
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i]!;
        const hs = (await qhitsKV.get(c.id).catch(() => [])) || [];
        for (const h of hs) {
          if (!allowed.has(h.docUuid)) continue;
          const s = h.score ?? 0;
          const prev = maxScore.get(h.docUuid) ?? 0;
          if (s > prev) maxScore.set(h.docUuid, s);
        }
        if (i % 20 === 0) report("peers", i + 1, chunks.length);
      }
      const peers = Array.from(maxScore.entries())
        .filter(([, s]) => s >= DOC_THRESHOLD)
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_RELATED);
      const related_to_uuid = uniq(peers.map(([u]) => u));
      const related_to_title = uniq(
        peers.map(([u]) => docsByUuid.get(u)?.title ?? u),
      );

      const refs = await refsForDoc(
        uuid,
        chunks,
        REF_THRESHOLD,
        allowed,
        chunkLoader,
        (stage, idx, of) => report(stage, idx, of),
      );
      if (DEBUG && refs.length === 0)
        dbg("no-refs", { uuid, path: fpath, chunks: chunks.length });
      const next: Front = {
        ...fm,
        related_to_uuid,
        related_to_title,
        references: Array.from(refs),
      };
      return writeFM(fpath, next);
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
      const docsByUuid = new Map<string, DocInfo>(
        scopedDocs as [string, DocInfo][],
      );
      const chunkLoader = makeChunkLoader(chunksKV);
      let done = 0;
      const total = scopedDocs.length;
      return Promise.all(
        scopedDocs.map((e, i) =>
          processDoc(
            e as [string, DocInfo],
            docsByUuid,
            allowedUuids,
            chunkLoader,
            i,
            total,
          ).then(() => {
            done++;
            onProgress?.({ step: "relations", done, total });
          }),
        ),
      );
    })
    .then(() => console.log("04-relations: done."));
}
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    "--docs-dir": "docs/unique",
    "--doc-threshold": "0.78",
    "--ref-threshold": "0.6",
    "--ref-min": "",
    "--ref-max": "",
    "--max-related": "25",
    "--max-references": "100",
    "--debug": "false",
  });
  const docsDir = args["--docs-dir"] ?? "docs/unique";
  const docT = Number(args["--doc-threshold"] ?? "0.78");
  const refT = Number(args["--ref-threshold"] ?? "0.6");
  const refMin =
    args["--ref-min"] !== "" ? Number(args["--ref-min"]) : undefined;
  const refMax =
    args["--ref-max"] !== "" ? Number(args["--ref-max"]) : undefined;
  const maxRel = Number(args["--max-related"] ?? "25");
  const maxRefs = Number(args["--max-references"] ?? "100");
  const debug = (args["--debug"] ?? "false") === "true";
  console.log(
    `04-relations: ROOT=${path.resolve(
      docsDir,
    )}, DOC_THRESHOLD=${docT}, REF_THRESHOLD=${refT}, REF_MIN=${
      refMin ?? ""
    }, REF_MAX=${
      refMax ?? ""
    }, MAX_RELATED=${maxRel}, MAX_REFERENCES=${maxRefs}`,
  );
  const { openDB } = await import("./db.js");
  const db = await openDB();
  runRelations(
    {
      docsDir,
      docThreshold: docT,
      refThreshold: refT,
      ...(refMin != null ? { refMin } : {}),
      ...(refMax != null ? { refMax } : {}),
      maxRelated: maxRel,
      maxReferences: maxRefs,
      debug,
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
