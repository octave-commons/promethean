import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import * as crypto from "crypto";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(defaults: Record<string, string>) {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k.startsWith("--")) continue;
    const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
    out[k] = v;
  }
  return out;
}

export async function listFilesRec(root: string, exts: Set<string>) {
  const out: string[] = [];
  async function walk(d: string) {
    const ents = await fs.readdir(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(root);
  return out.filter((p) =>
    exts.size ? exts.has(path.extname(p).toLowerCase()) : true,
  );
}

export function sha1(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex");
}

export function cosine(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export function relPath(fromRoot: string, fileAbs: string) {
  return path.relative(fromRoot, fileAbs).replace(/\\/g, "/");
}

// -------- markdown code extraction helpers

type FoundBlock = {
  lang?: string;
  startLine: number;
  endLine: number;
  value: string;
  beforeText: string;
  afterText: string;
  fenceInfo?: string; // raw info string after ```
  nearestTitle?: string; // heading text
};

export function extractCodeBlocksWithContext(md: string): FoundBlock[] {
  const ast = unified().use(remarkParse).parse(md) as any;
  const blocks: FoundBlock[] = [];
  let lastHeading: string | undefined;
  const lines = md.split("\n");
  const grab = (from: number, to: number) =>
    lines.slice(Math.max(0, from), Math.min(lines.length, to)).join("\n");

  visit(ast, (node: any, _idx: number, parent: any) => {
    if (!node?.type) return;

    if (node.type === "heading") {
      const text = (node.children || [])
        .map(
          (c: any) =>
            c.value || c.children?.map((cc: any) => cc.value).join(" ") || "",
        )
        .join(" ")
        .trim();
      lastHeading = text || lastHeading;
    }

    if (node.type === "code" && node.position) {
      const { start, end } = node.position;
      const beforeText = grab(start.line - 6, start.line - 1); // 5 lines of lead-in context
      const afterText = grab(end.line, end.line + 5); // 5 lines of trailing context
      blocks.push({
        lang: node.lang || undefined,
        fenceInfo: node.meta || undefined, // remark puts extra after language in node.meta
        startLine: start.line,
        endLine: end.line,
        value: node.value || "",
        beforeText,
        afterText,
        nearestTitle: lastHeading,
      });
    }
  });

  return blocks;
}

// filename/path hint heuristics
export function detectFilenameHint(block: FoundBlock): string | undefined {
  // 1) Info string like: ```ts title="src/foo/bar.ts" or path=...
  const meta = block.fenceInfo || "";
  const m1 = meta.match(
    /(?:title|path|file|filepath|name)\s*=\s*"?([^"\s]+)"?/i,
  );
  if (m1) return m1[1];

  // 2) Single backticked path on the line before the fence (captured in beforeText tail)
  const beforeTail = (block.beforeText || "").split("\n").slice(-3).join(" ");
  const m2 = beforeTail.match(/`([^`\n]+?\.[a-z0-9]{1,6})`/i);
  if (m2) return m2[1];

  // 3) Title/heading looks like a path
  if (
    block.nearestTitle &&
    /[\/\\].+\.[a-z0-9]{1,6}$/i.test(block.nearestTitle)
  ) {
    return block.nearestTitle.trim();
  }

  // 4) First comment line in code contains path-like token
  const firstLine =
    (block.value || "").split("\n").find((l) => l.trim().length > 0) || "";
  const stripped = firstLine
    .replace(/^(\s*\/\/\s*|\s*#\s*|\s*;\s*|\s*--\s*|\s*\/\*|\s*<!--)/, "")
    .trim();
  const m4 = stripped.match(/([A-Za-z0-9_\-./\\]+?\.[a-z0-9]{1,6})/i);
  if (m4) return m4[1];

  return undefined;
}
