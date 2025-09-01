// packages/docops/src/05-footers.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import { openDB } from "./db";
import {
  parseArgs,
  stripGeneratedSections,
  relMdLink,
  anchorId,
  injectAnchors,
} from "./utils";
import type { Front } from "./types";

const args = parseArgs({
  "--dir": "docs/unique",
  "--anchor-style": "block", // "block" | "heading" | "none"
  "--include-related": "true",
  "--include-sources": "true",
  "--dry-run": "false",
});

const ROOT = path.resolve(args["--dir"]);
const ANCHOR_STYLE = args["--anchor-style"] as "block" | "heading" | "none";
const INCLUDE_RELATED = args["--include-related"] === "true";
const INCLUDE_SOURCES = args["--include-sources"] === "true";
const DRY = args["--dry-run"] === "true";

const START = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->";
const END = "<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->";

type DocInfo = { path: string; title: string };
type Ref = { uuid: string; line: number; col: number; score?: number };

const db = await openDB();
const docsKV = db.docs; // uuid -> { path, title }

const uniq = (xs: readonly string[] = []) =>
  Array.from(new Set(xs.filter(Boolean)));

const isDocFile = (p: string) => /\.(md|mdx|txt)$/i.test(p) && p.startsWith(ROOT);

const nearestHeadingAnchor = (content: string, line: number): string | undefined =>
  content
    .split("\n")
    .slice(0, Math.max(0, line))
    .reverse()
    .map((ln) => {
      const m = ln.match(/^\s{0,3}#{1,6}\s+(.*)$/);
      return m ? m[1].trim().toLowerCase() : undefined;
    })
    .find((x) => !!x)
    ?.replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const collectEntries = <K extends string, V>(
  it: AsyncIterable<[K, V]>
): Promise<readonly [K, V][]> => {
  const acc: Array<readonly [K, V]> = [];
  return (async () => {
    for await (const e of it) acc.push(e as readonly [K, V]);
    return acc as unknown as readonly [K, V][];
  })();
};

const buildDocsMaps = () =>
  collectEntries(docsKV.iterator()).then((entries) => {
    const filtered = entries.filter(([, info]) => isDocFile((info as DocInfo).path));
    const byUuid = new Map<string, DocInfo>(filtered as [string, DocInfo][]);
    const byPath = new Map<string, { uuid: string; title: string }>(
      filtered.map(([u, d]) => [ (d as DocInfo).path, { uuid: u, title: (d as DocInfo).title } ])
    );
    return { byUuid, byPath, list: filtered as [string, DocInfo][] } as const;
  });

const readFront = (fpath: string) =>
  fs.readFile(fpath, "utf8").then((raw) => {
    const gm = matter(raw);
    return { fm: (gm.data || {}) as Front, content: gm.content, raw };
  });

const computeAnchorsByPath = (
  docs: ReadonlyArray<readonly [string, DocInfo]>,
  byUuid: ReadonlyMap<string, DocInfo>
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
                ? ({ path: tgt.path, line: r.line, id: anchorId(r.uuid, r.line, r.col) } as const)
                : null;
            })
            .filter((x): x is { path: string; line: number; id: string } => !!x)
        )
    )
  ).then((arrs) => {
    const flat = arrs.flat();
    // dedupe per target path + (line,id)
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

const relatedLines = (
  fm: Front,
  fpath: string,
  byUuid: ReadonlyMap<string, DocInfo>
) =>
  (fm.related_to_uuid ?? [])
    .map((u) => [u, byUuid.get(u)] as const)
    .filter(([, d]) => !!d)
    .map(([, d]) => {
      const href = relMdLink(fpath, (d as DocInfo).path);
      const title = (d as DocInfo).title || "";
      return `- [${title}](${href})`;
    })
    .reduce((xs, x) => xs.concat([x]), [] as string[])
    .concat(
      (fm.related_to_uuid ?? []).length === 0 ? ["- _None_"] : []
    );

const sourceLines = (
  fm: Front,
  fpath: string,
  byUuid: ReadonlyMap<string, DocInfo>
) =>
  Promise.all(
    (fm.references ?? []).map((r) => {
      const ref = byUuid.get(r.uuid);
      if (!ref) return Promise.resolve<string | null>(null);

      const anchorP =
        ANCHOR_STYLE === "block"
          ? Promise.resolve("^" + anchorId(r.uuid, r.line, r.col))
          : ANCHOR_STYLE === "heading"
          ? fs
              .readFile(ref.path, "utf8")
              .then((raw) => nearestHeadingAnchor(matter(raw).content, r.line) || "")
          : Promise.resolve("");

      return anchorP.then((anchor) => {
        const href = relMdLink(fpath, ref.path, anchor || undefined);
        const title = ref.title || r.uuid;
        const meta = ` (line ${r.line}, col ${r.col}${
          r.score != null ? `, score ${Math.round(r.score * 100) / 100}` : ""
        })`;
        return `- [${title} — L${r.line}](${href})${meta}`;
      });
    })
  ).then((lines) => {
    const kept = lines.filter((x): x is string => !!x);
    return kept.length ? kept : ["- _None_"];
  });

const renderFooter = (
  fpath: string,
  fm: Front,
  body: string,
  anchorsByPath: ReadonlyMap<string, Array<{ line: number; id: string }>>,
  byUuid: ReadonlyMap<string, DocInfo>
) => {
  const injected = ANCHOR_STYLE === "block" && anchorsByPath.has(fpath)
    ? injectAnchors(body, anchorsByPath.get(fpath) as Array<{ line: number; id: string }>)
    : body;

  const relP = INCLUDE_RELATED ? Promise.resolve(relatedLines(fm, fpath, byUuid)) : Promise.resolve<string[]>([]);
  const srcP = INCLUDE_SOURCES ? sourceLines(fm, fpath, byUuid) : Promise.resolve<string[]>([]);

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

buildDocsMaps()
  .then(({ byUuid, list }) =>
    (ANCHOR_STYLE === "block"
      ? computeAnchorsByPath(list, byUuid)
      : Promise.resolve(new Map<string, Array<{ line: number; id: string }>>())
    ).then((anchorsByPath) =>
      Promise.all(
        list.map(([, info]) =>
          fs
            .readFile(info.path, "utf8")
            .then((raw) => {
              const gm = matter(raw);
              const fm = (gm.data || {}) as Front;
              return renderFooter(info.path, fm, gm.content, anchorsByPath, byUuid).then((md) => {
                const finalMd = matter.stringify(md, fm, { language: "yaml" });
                return DRY
                  ? (console.log(`Would update: ${path.relative(process.cwd(), info.path)}`), Promise.resolve())
                  : fs.writeFile(info.path, finalMd, "utf8");
              });
            })
        )
      )
    )
  )
  .then(() => console.log("05-footers: done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
