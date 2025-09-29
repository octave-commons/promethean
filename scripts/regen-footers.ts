/* eslint-disable no-console */
/**
 * regen-footers.ts
 *
 * Purpose: Separate pass that ONLY:
 *  - injects Obsidian-friendly anchors (block IDs) for referenced lines (optional)
 *  - replaces the generated footer with Markdown links:
 *      - Related content: [Title](relative/path.md)
 *      - Sources: [Title — L123](relative/path.md#^block-id) (line/col/score)
 *
 * Reads ONLY existing frontmatter:
 *   - related_to_uuid, related_to_title
 *   - references: [{ uuid, line, col, score? }]
 *
 * No renaming, no embeddings, no model calls, no frontmatter changes (unless flags).
 */

import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import * as yaml from "yaml";
import {
  anchorId,
  computeFenceMap,
  injectAnchors,
  relMdLink,
} from "@promethean/markdown/anchors.js";
import { listFilesRec } from "@promethean/utils/list-files-rec";
import {
  stripGeneratedSections,
  START_MARK,
  END_MARK,
} from "@promethean/utils";

type Front = {
  uuid?: string;
  filename?: string;
  related_to_title?: string[];
  related_to_uuid?: string[];
  references?: Array<{
    uuid: string;
    line: number;
    col: number;
    score?: number;
  }>;
  [k: string]: any;
};

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--anchor-style": "block", // "block" | "heading" | "none"
  "--include-related": "true",
  "--include-sources": "true",
  "--frontmatter-trim": "false", // if true, trim FM lists to max below
  "--max-fm-related": "15",
  "--max-fm-refs": "25",
  "--dry-run": "false",
});

const ROOT_DIR = path.resolve(process.cwd(), args["--dir"]);
const EXTS = new Set(
  args["--ext"].split(",").map((s) => s.trim().toLowerCase()),
);
const ANCHOR_STYLE = args["--anchor-style"] as "block" | "heading" | "none";
const INCLUDE_RELATED = args["--include-related"] === "true";
const INCLUDE_SOURCES = args["--include-sources"] === "true";
const TRIM_FM = args["--frontmatter-trim"] === "true";
const MAX_FM_RELATED = Number(args["--max-fm-related"]);
const MAX_FM_REFS = Number(args["--max-fm-refs"]);
const DRY_RUN = args["--dry-run"] === "true";

function parseArgs(defaults: Record<string, string>): Record<string, string> {
  const out = { ...defaults };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) {
      const v =
        argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[k] = v;
    }
  }
  return out;
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFor(front: Front, filePath: string): string {
  return front.filename || path.parse(filePath).name;
}

// For heading-style anchors, generate slug from the nearest heading above a line
function nearestHeadingAnchor(
  content: string,
  line: number,
): string | undefined {
  const lines = content.split("\n");
  for (let i = Math.max(1, line) - 1; i >= 0; i--) {
    const m = lines[i].match(/^\s{0,3}#{1,6}\s+(.*)$/);
    if (m) {
      const text = m[1].trim().toLowerCase();
      const anchor = text
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      return anchor || undefined;
    }
  }
  return undefined;
}

async function main() {
  const files = await listFilesRec(ROOT_DIR, EXTS);
  console.log(`Found ${files.length} file(s) in ${ROOT_DIR}`);

  // Pass 1: read all frontmatters; map uuid -> { path, title }
  const frontsByPath: Record<string, Front> = {};
  const byUuid: Record<string, { path: string; title: string }> = {};

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const fm = (gm.data || {}) as Front;
    frontsByPath[f] = fm;
    if (fm.uuid) {
      byUuid[fm.uuid] = { path: f, title: titleFor(fm, f) };
    }
  }

  // Optionally trim FM lists (to reduce YAML bloat).
  if (TRIM_FM) {
    for (const f of files) {
      const fm = frontsByPath[f];
      let changed = false;
      if (fm.related_to_uuid && fm.related_to_uuid.length > MAX_FM_RELATED) {
        fm.related_to_uuid = fm.related_to_uuid.slice(0, MAX_FM_RELATED);
        changed = true;
      }
      if (fm.related_to_title && fm.related_to_title.length > MAX_FM_RELATED) {
        fm.related_to_title = fm.related_to_title.slice(0, MAX_FM_RELATED);
        changed = true;
      }
      if (fm.references && fm.references.length > MAX_FM_REFS) {
        fm.references = fm.references.slice(0, MAX_FM_REFS);
        changed = true;
      }
      if (changed && !DRY_RUN) {
        // Do NOT modify body, just FM
        const raw = await fs.readFile(f, "utf-8");
        const gm = matter(raw);
        const newRaw = matter.stringify(gm.content, fm, { language: "yaml" });
        await fs.writeFile(f, newRaw, "utf-8");
      }
    }
  }

  // If block anchors are requested, gather all needed anchors per target doc
  const anchorsNeededByDoc: Record<
    string,
    Array<{ line: number; id: string }>
  > = {};
  if (ANCHOR_STYLE === "block") {
    for (const f of files) {
      const fm = frontsByPath[f];
      const refs = fm.references || [];
      for (const r of refs) {
        const target = byUuid[r.uuid];
        if (!target) continue;
        const id = anchorId(r.uuid, r.line, r.col);
        (anchorsNeededByDoc[target.path] ||= []).push({ line: r.line, id });
      }
    }
  }

  // Pass 2: per-file update footers (and inject anchors if requested)
  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const fm = frontsByPath[f];
    const content0 = gm.content;

    let content = content0;

    // Inject block anchors into THIS file if any refs point here
    if (ANCHOR_STYLE === "block") {
      const needs = anchorsNeededByDoc[f] || [];
      if (needs.length) {
        content = injectAnchors(content, needs);
      }
    }

    // Build footer
    const me = f;
    const myTitle = titleFor(fm, f);

    const relatedLines: string[] = [];
    if (INCLUDE_RELATED) {
      const relUuids = fm.related_to_uuid || [];
      for (const u of relUuids) {
        const ref = byUuid[u];
        if (!ref) continue;
        const href = relMdLink(me, ref.path);
        const title = byUuid[u]?.title ?? u;
        relatedLines.push(`- [${title}](${href})`);
      }
      if (relatedLines.length === 0) relatedLines.push("- _None_");
    }

    const sourceLines: string[] = [];
    if (INCLUDE_SOURCES) {
      const refs = fm.references || [];
      for (const r of refs) {
        const ref = byUuid[r.uuid];
        if (!ref) continue;
        let anchor = "";
        if (ANCHOR_STYLE === "block") {
          anchor = `^${anchorId(r.uuid, r.line, r.col)}`;
        } else if (ANCHOR_STYLE === "heading") {
          // best-effort heading near that line in target doc
          const targetRaw = await fs.readFile(ref.path, "utf-8");
          const targetGm = matter(targetRaw);
          const heading = nearestHeadingAnchor(targetGm.content, r.line);
          if (heading) anchor = heading;
        } // none -> empty

        const href = relMdLink(me, ref.path, anchor || undefined);
        const title = ref.title || r.uuid;
        const meta = ` (line ${r.line}, col ${r.col}${
          r.score != null ? `, score ${round2(r.score)}` : ""
        })`;
        sourceLines.push(`- [${title} — L${r.line}](${href})${meta}`);
      }
      if (sourceLines.length === 0) sourceLines.push("- _None_");
    }

    const footer = [
      "",
      START_MARK,
      INCLUDE_RELATED ? "## Related content" : "",
      ...(INCLUDE_RELATED ? relatedLines : []),
      INCLUDE_RELATED ? "" : "",
      INCLUDE_SOURCES ? "## Sources" : "",
      ...(INCLUDE_SOURCES ? sourceLines : []),
      END_MARK,
      "",
    ]
      .filter((x) => x !== "")
      .join("\n");

    const cleaned = stripGeneratedSections(content, START_MARK, END_MARK);
    const finalMd = matter.stringify(cleaned + footer, fm, {
      language: "yaml",
    });

    if (DRY_RUN) {
      console.log(`Would update: ${path.relative(process.cwd(), f)}`);
    } else {
      await fs.writeFile(f, finalMd, "utf-8");
    }
  }

  console.log("Footer regeneration complete.");
}

function round2(n?: number): number | undefined {
  if (n == null) return n;
  return Math.round(n * 100) / 100;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
