// packages/docops/src/05-footers.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";

// DB is injected by caller
import { anchorId, injectAnchors } from "@promethean/markdown/anchors.js";
import { parseArgs, stripGeneratedSections } from "./utils.js";
import type { Front } from "./types.js";

// CLI entry

export type FootersOptions = {
  dir: string;
  anchorStyle?: "block" | "heading" | "none";
  includeRelated?: boolean;
  includeSources?: boolean;
  dryRun?: boolean;
  files?: string[]; // limit
};
let ROOT = path.resolve("docs/unique");
let ANCHOR_STYLE: "block" | "heading" | "none" = "block";
let INCLUDE_RELATED = true;
let INCLUDE_SOURCES = true;
let DRY = false;

const START = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->";
const END = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->";

type DocInfo = { path: string; title: string };
type Ref = { uuid: string; line: number; col: number; score?: number };

// (no-op)

const isDocFile = (p: string) =>
  /\.(md|mdx|txt)$/i.test(p) && p.startsWith(ROOT);

const nearestHeadingAnchor = (
  content: string,
  line: number,
): string | undefined =>
  content
    .split("\n")
    .slice(0, Math.max(0, line))
    .reverse()
    .map((ln) => {
      const m = (ln ?? "").match(/^\s{0,3}#{1,6}\s+(.*)$/);
      const grp = m?.[1];
      return grp ? grp.trim().toLowerCase() : undefined;
    })
    .find((x) => !!x)
    ?.replace(/[^a-z0-9\s-]/g, "")
    ?.replace(/\s+/g, "-")
    ?.replace(/-+/g, "-");

const collectEntries = async <K extends string, V>(
  it: AsyncIterable<[K, V]>,
) => {
  const acc: Array<readonly [K, V]> = [];
  for await (const e of it) acc.push(e as readonly [K, V]);
  return acc as unknown as readonly [K, V][];
};

const readFront = (fpath: string) =>
  fs.readFile(fpath, "utf8").then((raw) => {
    const gm = matter(raw);
    return { fm: (gm.data || {}) as Front, content: gm.content, raw };
  });

const computeAnchorsByPath = (
  docs: ReadonlyArray<readonly [string, DocInfo]>,
  byUuid: ReadonlyMap<string, DocInfo>,
) =>
  Promise.all(
    docs.map(([, info]) =>
      readFront(info.path)
        .then(({ fm }) => (fm.references ?? []) as Ref[])
        .then((refs) =>
          refs
            .map((r) => {
              const tgt = byUuid.get(r.uuid);
              return tgt
                ? ({
                    path: tgt.path,
                    line: r.line,
                    id: anchorId(r.uuid, r.line, r.col),
                  } as const)
                : null;
            })
            .filter(
              (
                x,
              ): x is {
                path: string;
                line: number;
                id: string;
              } => !!x,
            ),
        ),
    ),
  ).then((arrs) => {
    const flat = arrs.flat();
    const grouped = flat.reduce((m, a) => {
      const k = `${a.path}|${a.line}:${a.id}`;
      if (!m.has(k)) m.set(k, a);
      return m;
    }, new Map<string, { path: string; line: number; id: string }>());
    const byPath = Array.from(grouped.values()).reduce((m, a) => {
      const xs = m.get(a.path) ?? [];
      m.set(a.path, xs.concat([{ line: a.line, id: a.id }]));
      return m;
    }, new Map<string, Array<{ line: number; id: string }>>());
    return byPath;
  });

const relatedLines = (fm: Front, byUuid: ReadonlyMap<string, DocInfo>) =>
  (fm.related_to_uuid ?? [])
    .map((u: string) => [u, byUuid.get(u)] as const)
    .filter(([, d]) => !!d)
    .map(([, d]) => {
      const title = (d as DocInfo).title || "";
      const rel = path
        .relative(ROOT, (d as DocInfo).path)
        .replace(/\.md$/i, "");
      return `- [[${rel}|${title}]]`;
    })
    .reduce((xs: string[], x: string) => xs.concat([x]), [] as string[])
    .concat((fm.related_to_uuid ?? []).length === 0 ? ["- _None_"] : []);

const sourceLines = (fm: Front, byUuid: ReadonlyMap<string, DocInfo>) =>
  Promise.all(
    (fm.references ?? []).map((r: Ref) => {
      const ref = byUuid.get(r.uuid);
      if (!ref) return Promise.resolve<null>(null);

      const anchorP =
        ANCHOR_STYLE === "block"
          ? Promise.resolve("^" + anchorId(r.uuid, r.line, r.col))
          : ANCHOR_STYLE === "heading"
            ? fs
                .readFile(ref.path, "utf8")
                .then(
                  (raw) =>
                    nearestHeadingAnchor(matter(raw).content, r.line) || "",
                )
            : Promise.resolve("");

      return anchorP.then((anchor) => {
        const title = ref.title || r.uuid;
        const meta = ` (line ${r.line}, col ${r.col}${
          r.score != null ? `, score ${Math.round(r.score * 100) / 100}` : ""
        })`;
        const rel = path.relative(ROOT, ref.path).replace(/\.md$/i, "");
        const target = anchor ? `${rel}#${anchor}` : rel;
        return `- [[${target}|${title} — L${r.line}]]${meta}`;
      });
    }),
  ).then((lines: Array<string | null>) => {
    const kept = lines.filter((x): x is string => !!x);
    return kept.length ? kept : ["- _None_"];
  });

const renderFooter = (
  fpath: string,
  fm: Front,
  body: string,
  anchorsByPath: ReadonlyMap<string, Array<{ line: number; id: string }>>,
  byUuid: ReadonlyMap<string, DocInfo>,
) => {
  const injected =
    ANCHOR_STYLE === "block" && anchorsByPath.has(fpath)
      ? injectAnchors(
          body,
          anchorsByPath.get(fpath) as Array<{
            line: number;
            id: string;
          }>,
        )
      : body;

  const relP = INCLUDE_RELATED
    ? Promise.resolve(relatedLines(fm, byUuid))
    : Promise.resolve<string[]>([]);
  const srcP = INCLUDE_SOURCES
    ? sourceLines(fm, byUuid)
    : Promise.resolve<string[]>([]);

  return Promise.all([relP, srcP]).then(([rels, srcs]) => {
    const footer = [
      "",
      START,
      INCLUDE_RELATED ? "## Related content" : "",
      ...(INCLUDE_RELATED ? rels : []),
      INCLUDE_RELATED ? "" : "",
      INCLUDE_SOURCES ? "## Sources" : "",
      ...(INCLUDE_SOURCES ? srcs : []),
      END,
      "",
    ]
      .filter(Boolean)
      .join("\n");

    const cleaned = stripGeneratedSections(injected);
    return cleaned + footer;
  });
};

export async function runFooters(
  opts: FootersOptions,
  db: any,
  onProgress?: (p: { step: "footers"; done: number; total: number }) => void,
) {
  ROOT = path.resolve(opts.dir);
  ANCHOR_STYLE = opts.anchorStyle ?? "block";
  INCLUDE_RELATED = opts.includeRelated ?? true;
  INCLUDE_SOURCES = opts.includeSources ?? true;
  DRY = opts.dryRun ?? false;

  const docsKV = db.docs; // uuid -> { path, title }

  // Local helpers that close over docsKV
  const buildDocsMaps = async () => {
    const entries = await collectEntries(docsKV.iterator());
    const filtered = entries.filter(([, info]) =>
      isDocFile((info as DocInfo).path),
    );
    const byUuid = new Map<string, DocInfo>(filtered as [string, DocInfo][]);
    return { byUuid, list: filtered as [string, DocInfo][] } as const;
  };

  let { byUuid, list } = await buildDocsMaps();
  if (opts.files && opts.files.length) {
    const wanted = new Set(opts.files.map((p) => path.resolve(p)));
    list = list.filter(([, info]) => wanted.has(path.resolve(info.path)));
  }
  const anchorsByPath =
    ANCHOR_STYLE === "block"
      ? await computeAnchorsByPath(list, byUuid)
      : new Map();
  let done = 0;
  const total = list.length;
  await Promise.all(
    list.map(([, info]) =>
      fs
        .readFile(info.path, "utf8")
        .catch((error: any) => {
          if (error.code === "ENOENT") {
            // File not found - this can happen after the rename step
            // when the database still has old paths but files were renamed
            console.warn(`Warning: File not found: ${path.relative(process.cwd(), info.path)}`);
            console.warn(`This file may have been renamed by a previous step. Skipping...`);
            // Return empty content to avoid breaking the pipeline
            return "";
          }
          throw error;
        })
        .then((raw) => {
          if (!raw) {
            // Skip empty content (missing file)
            return;
          }
          const gm = matter(raw);
          const fm = (gm.data || {}) as Front;
          return renderFooter(
            info.path,
            fm,
            gm.content,
            anchorsByPath,
            byUuid,
          ).then((md) => {
            const finalMd = matter.stringify(md, fm, {
              language: "yaml",
            });
            return DRY
              ? (console.log(
                  `Would update: ${path.relative(process.cwd(), info.path)}`,
                ),
                Promise.resolve())
              : fs.writeFile(info.path, finalMd, "utf8");
          });
        })
        .then(() => {
          done++;
          onProgress?.({ step: "footers", done, total });
        }),
    ),
  );
  // db lifecycle is owned by caller
}
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    "--dir": "docs/unique",
    "--anchor-style": "block",
    "--include-related": "true",
    "--include-sources": "true",
    "--dry-run": "false",
  });
  const { openDB } = await import("./db.js");
  const db = await openDB();
  const dir = args["--dir"] ?? "docs/unique";
  const anchorStyle = (args["--anchor-style"] ?? "block") as any;
  const includeRelated = (args["--include-related"] ?? "true") === "true";
  const includeSources = (args["--include-sources"] ?? "true") === "true";
  const dryRun = (args["--dry-run"] ?? "false") === "true";
  runFooters(
    {
      dir,
      anchorStyle,
      includeRelated,
      includeSources,
      dryRun,
    },
    db,
  )
    .then(() => console.log("05-footers: done."))
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
