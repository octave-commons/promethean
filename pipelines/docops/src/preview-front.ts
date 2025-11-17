#!/usr/bin/env node
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { promises as fs } from "node:fs";

import matter from "gray-matter";

import { openDB } from "./db.js";
import type { DBs } from "./db.js";
import type { Chunk, Front, QueryHit } from "./types.js";
import { parseArgs } from "./utils.js";

type DocInfo = { path: string; title: string };
type Ref = { uuid: string; line: number; col: number; score?: number };

const args = parseArgs({
  "--dir": "docs/unique",
  "--uuid": "",
  "--file": "",
  "--doc-threshold": "0.78",
  "--ref-threshold": "0.85",
  "--debug": "false",
});

const ROOT = path.resolve(args["--dir"] ?? "docs/unique");
const DOC_THRESHOLD = Number(args["--doc-threshold"] ?? "0.78");
const REF_THRESHOLD = Number(args["--ref-threshold"] ?? "0.85");
const DEBUG = (args["--debug"] ?? "false") === "true";
const dbg = (...xs: any[]) => {
  if (DEBUG) console.log("[preview]", ...xs);
};

const uniq = (xs: readonly string[] = []) =>
  Array.from(new Set(xs.filter(Boolean)));
const round2 = (n?: number) => (n == null ? n : Math.round(n * 100) / 100);

export async function computePreview(
  frontPathOrUuid: { uuid?: string; file?: string },
  opts: {
    dir: string;
    docThreshold: number;
    refThreshold: number;
    debug?: boolean;
  },
  db?: DBs,
) {
  const created = !db;
  const mydb = db ?? (await openDB());
  const docsKV = mydb.docs;
  const chunksKV = mydb.chunks;
  const qhitsKV = mydb.root.sublevel<string, readonly QueryHit[]>("q", {
    valueEncoding: "json",
  });

  const ROOT_LOCAL = path.resolve(opts.dir);
  const docs: Array<[string, DocInfo]> = [];
  for await (const [u, info] of docsKV.iterator()) {
    const d = info as DocInfo;
    if (
      d.path &&
      d.path.startsWith(ROOT_LOCAL) &&
      /\.(md|mdx|txt)$/i.test(d.path)
    ) {
      docs.push([u, d]);
    }
  }
  // Fallback: if no docs matched the scope, include all docs
  if (docs.length === 0) {
    for await (const [u, info] of docsKV.iterator()) {
      const d = info as DocInfo;
      if (d.path && /\.(md|mdx|txt)$/i.test(d.path)) docs.push([u, d]);
    }
  }
  const byUuid = new Map<string, DocInfo>(docs);
  const allowed = new Set(docs.map(([u]) => u));

  // Pick target UUID
  let uuid = (frontPathOrUuid.uuid || "").trim();
  if (!uuid) {
    const f = path.resolve(frontPathOrUuid.file || "");
    let found = docs.find(([, info]) => path.resolve(info.path) === f);
    if (!found) {
      // fallback: scan full docsKV (no scope) to locate the file
      for await (const [u, info] of docsKV.iterator()) {
        const p = (info as DocInfo).path;
        if (p && path.resolve(p) === f) {
          found = [u, info as DocInfo] as [string, DocInfo];
          break;
        }
      }
    }
    if (!found) {
      // final fallback: read frontmatter of provided file to get uuid
      try {
        const raw = await fs.readFile(f, "utf8");
        const gm = matter(raw);
        const fm = (gm.data || {}) as Front;
        if (fm.uuid) {
          uuid = fm.uuid;
          // ensure maps include this file
          byUuid.set(uuid, {
            path: f,
            title: fm.title || fm.filename || "Doc",
          });
          allowed.add(uuid);
        }
      } catch {}
    }
    if (!uuid) {
      // attempt to resolve via chunks index
      for await (const [u, cs] of chunksKV.iterator()) {
        const arr = cs || [];
        if (arr.some((c) => path.resolve(c.docPath) === f)) {
          uuid = u;
          break;
        }
      }
    }
    if (!uuid) throw new Error(`File not found in scope: ${f}`);
    if (found) uuid = found[0];
  }
  const info = byUuid.get(uuid);
  if (!info) throw new Error(`UUID not found in scope: ${uuid}`);

  // get chunks for this doc
  const rawChunks = (await chunksKV.get(uuid).catch(() => [])) as any;
  const chunks = Array.isArray(rawChunks)
    ? (rawChunks as readonly Chunk[])
    : ([] as readonly Chunk[]);
  // compute doc-to-doc max scores
  const maxScore = new Map<string, number>();
  const refsAcc = new Map<string, Ref>();
  for (const c of chunks) {
    const raw = (await qhitsKV.get(c.id).catch(() => [])) as any;
    const hits = Array.isArray(raw)
      ? (raw as readonly QueryHit[])
      : ([] as readonly QueryHit[]);
    for (const h of hits) {
      if (!allowed.has(h.docUuid)) continue;
      // Filter exact text matches for references (skip if target chunk text equals source text)
      // Attempt to parse target chunk id as `${uuid}:${index}` and compare
      const hid: string = String((h as any).id || "");
      if (hid.includes(":")) {
        const [tUuid, idxStr] = hid.split(":");
        const idx = Number(idxStr);
        if (tUuid && Number.isFinite(idx)) {
          try {
            const tChunks = (await chunksKV
              .get(tUuid)
              .catch(() => [])) as readonly Chunk[];
            const tChunk = Array.isArray(tChunks) ? tChunks[idx] : undefined;
            if (
              tChunk &&
              (tChunk.text || "").trim() === (c.text || "").trim()
            ) {
              continue; // skip exact text matches
            }
          } catch {}
        }
      }
      const s = h.score ?? 0;
      // peers aggregation
      const prev = maxScore.get(h.docUuid) ?? 0;
      if (s > prev) maxScore.set(h.docUuid, s);
      // references above threshold
      if (s >= opts.refThreshold) {
        const k = `${h.docUuid}:${h.startLine}:${(h as any).startCol ?? 0}`;
        if (!refsAcc.has(k)) {
          const s2 = round2(s);
          refsAcc.set(k, {
            uuid: h.docUuid,
            line: h.startLine,
            col: (h as any).startCol ?? 0,
            ...(s2 != null ? { score: s2 } : {}),
          });
        }
      }
    }
  }

  const peers = Array.from(maxScore.entries())
    .filter(([, s]) => s >= opts.docThreshold)
    .sort((a, b) => b[1] - a[1]);
  const related_to_uuid = uniq(peers.map(([u]) => u));
  const related_to_title = uniq(peers.map(([u]) => byUuid.get(u)?.title ?? u));
  const references = Array.from(refsAcc.values());

  // merge with existing fm to show full picture
  const raw = await fs.readFile(info.path, "utf8");
  const gm = matter(raw);
  const fm = (gm.data || {}) as Front;

  const out: Front = {
    ...fm,
    related_to_uuid: uniq([...(fm.related_to_uuid ?? []), ...related_to_uuid]),
    related_to_title: uniq([
      ...(fm.related_to_title ?? []),
      ...related_to_title,
    ]),
    references: references,
  };
  if (opts.debug) {
    dbg("preview-target", { uuid, path: info.path, chunks: chunks.length });
    dbg("peers", peers.slice(0, 5));
    dbg("refs", references.length);
  }
  const result = { uuid, path: info.path, title: info.title, front: out };
  if (created) {
    try {
      await mydb.root.close();
    } catch {}
  }
  return result;
}

async function main() {
  // ESM-safe check for direct execution
  const isDirect =
    !!process.argv[1] &&
    pathToFileURL(process.argv[1]).href === import.meta.url;
  if (!isDirect) return;
  const uuid = args["--uuid"] || undefined;
  const file = args["--file"] || undefined;
  const frontSel: { uuid?: string; file?: string } = {};
  if (uuid) frontSel.uuid = uuid;
  if (file) frontSel.file = file;
  const res = await computePreview(frontSel, {
    dir: ROOT,
    docThreshold: DOC_THRESHOLD,
    refThreshold: REF_THRESHOLD,
    debug: DEBUG,
  });
  console.log(JSON.stringify(res, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
