// packages/docops/src/04-relations.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import { openDB } from "./db";
import { parseArgs } from "./utils";
import type { Chunk, Front, QueryHit } from "./types";

const args = parseArgs({
  "--docs-dir": "docs/unique",
  "--doc-threshold": "0.78",
  "--ref-threshold": "0.85",
});

const ROOT = path.resolve(args["--docs-dir"]);
const DOC_THRESHOLD = Number(args["--doc-threshold"]);
const REF_THRESHOLD = Number(args["--ref-threshold"]);

type DocInfo = { path: string; title: string };
type DocPairs = Map<string, Map<string, number>>;
type Ref = { uuid: string; line: number; col: number; score?: number };

(async () => {

const db = await openDB();
const docsKV = db.docs;     // uuid -> { path, title }
const chunksKV = db.chunks; // uuid -> readonly Chunk[]
const qhitsKV = db.root.sublevel<string, readonly QueryHit[]>("q", { valueEncoding: "json" });

const uniq = (xs: readonly string[] = []) => Array.from(new Set(xs.filter(Boolean)));

const collectEntries = <K extends string, V>(
  it: AsyncIterable<[K, V]>
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
        .then((hs) => ((hs ?? []) as readonly QueryHit[]))
        .catch(() => [] as readonly QueryHit[])
        .then((hs) => hs.map((h) => [uuid, h.docUuid, h.score ?? 0] as const))
    )
  ).then((arrs) => arrs.flat() as ReadonlyArray<readonly [string, string, number]>);

const buildDocPairs = (
  entries: ReadonlyArray<readonly [string, readonly Chunk[]]>
): Promise<DocPairs> =>
  Promise.all(entries.map(([uuid, cs]) => toPairs(uuid, cs)))
    .then((all) => all.flat())
    .then((pairs) =>
      pairs.reduce<DocPairs>((acc, [a, b, score]) => {
        if (a === b) return acc;
        const m = acc.get(a) ?? new Map<string, number>();
        m.set(b, Math.max(m.get(b) ?? 0, score));
        acc.set(a, m);
        return acc;
      }, new Map())
    );

const refsForDoc = (
  uuid: string,
  chunks: readonly Chunk[],
  threshold: number
): Promise<Ref[]> =>
  Promise.all(
    chunks.map((c) =>
      qhitsKV
        .get(c.id)
        .then((hs) => ((hs ?? []) as readonly QueryHit[]))
        .catch(() => [] as readonly QueryHit[])
        .then((hs) =>
          hs
            .filter((h) => (h.score ?? 0) >= threshold)
            .map((h) => ({
              uuid: h.docUuid,
              line: h.startLine,
              col: (h as any).startCol ?? 0,
              score: Math.round((h.score ?? 0) * 100) / 100,
            }))
        )
    )
  )
    .then((arrs) => arrs.flat())
    .then((list) => {
      // dedupe by (uuid:line:col)
      const dedup = list.reduce((m, r) => m.set(`${r.uuid}:${r.line}:${r.col}`, r), new Map<string, Ref>());
      return Array.from(dedup.values()); // mutable array to satisfy Front.references type
    });

const peersForDoc = (
  uuid: string,
  docPairs: DocPairs,
  docsByUuid: ReadonlyMap<string, DocInfo>,
  threshold: number
) => {
  const peers = Array.from((docPairs.get(uuid) ?? new Map()).entries())
    .filter(([, s]) => s >= threshold)
    .sort((a, b) => b[1] - a[1]);
  const related_to_uuid = uniq(peers.map(([u]) => u));
  const related_to_title = uniq(peers.map(([u]) => docsByUuid.get(u)?.title ?? u));
  return { related_to_uuid, related_to_title } as const;
};

const writeFM = (fpath: string, fm: Front) =>
  fs
    .readFile(fpath, "utf8")
    .then((raw) => {
      const gm = matter(raw);
      const out = matter.stringify(gm.content, fm, { language: "yaml" });
      return fs.writeFile(fpath, out, "utf8");
    });

const processDoc = (
  entry: readonly [string, DocInfo],
  chunksMap: ReadonlyMap<string, readonly Chunk[]>,
  docsByUuid: ReadonlyMap<string, DocInfo>,
  docPairs: DocPairs
) => {
  const [uuid, info] = entry;
  const chunks = (chunksMap.get(uuid) ?? []) as readonly Chunk[];
  const fpath = info.path;

  return fs
    .readFile(fpath, "utf8")
    .then((raw) => {
      const gm = matter(raw);
      const fm = (gm.data || {}) as Front;
      const peers = peersForDoc(uuid, docPairs, docsByUuid, DOC_THRESHOLD);
      return refsForDoc(uuid, chunks, REF_THRESHOLD).then((refs) => {
        const next: Front = {
          ...fm,
          related_to_uuid: uniq([...(fm.related_to_uuid ?? []), ...peers.related_to_uuid]),
          related_to_title: uniq([...(fm.related_to_title ?? []), ...peers.related_to_title]),
          references: Array.from(refs), // ensure mutable array type
        };
        return writeFM(fpath, next);
      });
    });
};

collectEntries(docsKV.iterator())
  .then((docsEntries) =>
    collectEntries(chunksKV.iterator()).then((chunksEntries) =>
      buildDocPairs(chunksEntries).then((docPairs) => {
        const docsByUuid = new Map<string, DocInfo>(docsEntries as [string, DocInfo][]);
        const chunksMap = new Map<string, readonly Chunk[]>(chunksEntries as [string, readonly Chunk[]][]);
        return Promise.all(docsEntries.map((e) => processDoc(e, chunksMap, docsByUuid, docPairs)));
      })
    )
  )
  .then(() => console.log("04-relations: done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
})()
