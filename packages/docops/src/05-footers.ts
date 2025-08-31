import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, readJSON, stripGeneratedSections, relMdLink, anchorId, injectAnchors } from "./utils";
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
const CACHE = path.join(process.cwd(), ".cache/docs-pipeline");
const DOCS_MAP = path.join(CACHE, "docs-by-uuid.json");

async function listAllMarkdown(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of ents) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(root);
  return out.filter((p) => /\.(md|mdx|txt)$/i.test(p));
}

function nearestHeadingAnchor(content: string, line: number): string | undefined {
  const lines = content.split("\n");
  for (let i = Math.max(1, line) - 1; i >= 0; i--) {
    const m = lines[i].match(/^\s{0,3}#{1,6}\s+(.*)$/);
    if (m) {
      const text = m[1].trim().toLowerCase();
      return text.replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
    }
  }
  return undefined;
}

async function main() {
  const files = await listAllMarkdown(ROOT);
  const byUuid: Record<string, { path: string; title: string }> = await readJSON(DOCS_MAP, {});

  // gather block anchors needed
  const anchorsByPath: Record<string, Array<{ line: number; id: string }>> = {};
  if (ANCHOR_STYLE === "block") {
    for (const f of files) {
      const raw = await fs.readFile(f, "utf-8");
      const { data } = matter(raw);
      const fm = data as Front;
      for (const r of fm.references ?? []) {
        const tgt = byUuid[r.uuid]; if (!tgt) continue;
        const id = anchorId(r.uuid, r.line, r.col);
        (anchorsByPath[tgt.path] ||= []).push({ line: r.line, id });
      }
    }
  }

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const fm = gm.data as Front;
    let body = gm.content;

    if (ANCHOR_STYLE === "block") {
      const needs = anchorsByPath[f] || [];
      if (needs.length) body = injectAnchors(body, needs);
    }

    const relatedLines: string[] = [];
    if (INCLUDE_RELATED) {
      for (const u of fm.related_to_uuid ?? []) {
        const ref = byUuid[u]; if (!ref) continue;
        const href = relMdLink(f, ref.path);
        const title = ref.title || u;
        relatedLines.push(`- [${title}](${href})`);
      }
      if (relatedLines.length === 0) relatedLines.push("- _None_");
    }

    const sourceLines: string[] = [];
    if (INCLUDE_SOURCES) {
      for (const r of fm.references ?? []) {
        const ref = byUuid[r.uuid]; if (!ref) continue;
        let anchor = "";
        if (ANCHOR_STYLE === "block") anchor = `^${anchorId(r.uuid, r.line, r.col)}`;
        else if (ANCHOR_STYLE === "heading") {
          const targetRaw = await fs.readFile(ref.path, "utf-8");
          const targetGm = matter(targetRaw);
          anchor = nearestHeadingAnchor(targetGm.content, r.line) || "";
        }
        const href = relMdLink(f, ref.path, anchor || undefined);
        const title = ref.title || r.uuid;
        const meta = ` (line ${r.line}, col ${r.col}${r.score != null ? `, score ${Math.round(r.score * 100) / 100}` : ""})`;
        sourceLines.push(`- [${title} — L${r.line}](${href})${meta}`);
      }
      if (sourceLines.length === 0) sourceLines.push("- _None_");
    }

    const footer = [
      "",
      START,
      INCLUDE_RELATED ? "## Related content" : "",
      ...(INCLUDE_RELATED ? relatedLines : []),
      INCLUDE_RELATED ? "" : "",
      INCLUDE_SOURCES ? "## Sources" : "",
      ...(INCLUDE_SOURCES ? sourceLines : []),
      END,
      "",
    ].filter(Boolean).join("\n");

    const cleaned = stripGeneratedSections(body);
    const finalMd = matter.stringify(cleaned + footer, fm, { language: "yaml" });

    if (args["--dry-run"] === "true") console.log(`Would update: ${path.relative(process.cwd(), f)}`);
    else await fs.writeFile(f, finalMd, "utf-8");
  }

  console.log("05-footers: done.");
}
main().catch((e) => { console.error(e); process.exit(1); });
