/* eslint-disable */
import { promises as fs } from "fs";
import * as path from "path";
import { once } from "node:events";
import { createWriteStream } from "node:fs";

import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import * as yaml from "yaml";

import { Chunk, Front } from "./types.js";
export {
  stripGeneratedSections,
  START_MARK,
  END_MARK,
  randomUUID,
} from "@promethean/utils";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(
  defaults: Record<string, string>,
): Record<string, string> {
  const out = { ...defaults };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]!;
    if (k.startsWith("--")) {
      const next = argv[i + 1];
      const useNext = !!next && !next.startsWith("--");
      const v = useNext ? next : "true";
      if (useNext) i++;
      out[k] = v;
    }
  }
  return out;
}

export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extnamePrefer(originalPath: string): string {
  return path.extname(originalPath) || ".md";
}

export function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    const s = await fs.readFile(file, "utf-8");
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON(file: string, data: any) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export function frontToYAML(front: Front): string {
  return yaml.stringify(front, { indent: 2, simpleKeys: true });
}

export function parseMarkdownChunks(markdown: string): Chunk[] {
  const ast = unified().use(remarkParse).parse(markdown) as any;
  const chunks: Chunk[] = [];
  let currentHeading: string | undefined;

  function extractText(node: any): string {
    let out = "";
    visit(node, (n: any) => {
      if (n.type === "text") out += n.value ?? "";
    });
    return out;
  }
  function sentenceSplit(s: string, maxLen: number): string[] {
    if (s.length <= maxLen) return [s];
    const parts = s.split(/(?<=[\.\!\?])\s+/);
    const chunks: string[] = [];
    let buf = "";
    for (const p of parts) {
      if ((buf + " " + p).trim().length > maxLen) {
        if (buf) chunks.push(buf.trim());
        buf = p;
      } else buf = (buf ? buf + " " : "") + p;
    }
    if (buf) chunks.push(buf.trim());
    const final: string[] = [];
    for (const c of chunks) {
      if (c.length <= maxLen) final.push(c);
      else
        for (let i = 0; i < c.length; i += maxLen)
          final.push(c.slice(i, i + maxLen));
    }
    return final;
  }

  visit(ast, (node: any) => {
    if (!node?.type) return;
    if (node.type === "heading") {
      currentHeading = (node.children || [])
        .map(
          (c: any) =>
            c.value || c.children?.map((cc: any) => cc.value).join(" ") || "",
        )
        .join(" ")
        .trim();
    }
    if (["paragraph", "listItem", "code"].includes(node.type)) {
      const pos = node.position;
      if (!pos) return;
      const raw = node.type === "code" ? node.value || "" : extractText(node);
      const trimmed = (raw || "").trim();
      if (!trimmed) return;
      const kind: Chunk["kind"] = node.type === "code" ? "code" : "text";
      chunks.push(
        ...sentenceSplit(trimmed, 1200).map(
          (s) =>
            ({
              id: "",
              docUuid: "",
              docPath: "",
              startLine: pos.start.line,
              startCol: pos.start.column,
              endLine: pos.end.line,
              endCol: pos.end.column,
              text: s,
              kind,
              ...(currentHeading ? { title: currentHeading } : {}),
            }) as Chunk,
        ),
      );
    }
  });

  if (chunks.length === 0 && markdown.trim()) {
    chunks.push({
      id: "",
      docUuid: "",
      docPath: "",
      startLine: 1,
      startCol: 1,
      endLine: markdown.split("\n").length,
      endCol: 1,
      text: markdown.trim(),
      kind: "text",
    });
  }
  return chunks;
}

export function relMdLink(
  fromFileAbs: string,
  toFileAbs: string,
  anchor?: string,
): string {
  const rel = path
    .relative(path.dirname(fromFileAbs), toFileAbs)
    .replace(/\\/g, "/");
  return anchor ? `${rel}#${anchor}` : rel;
}

export function anchorId(docUuid: string, line: number, col: number) {
  return `ref-${(docUuid ?? "nouuid").slice(0, 8)}-${line}-${col}`;
}

export function computeFenceMap(lines: string[]): boolean[] {
  const inside: boolean[] = new Array(lines.length).fill(false);
  let inFence = false,
    fenceChar: "`" | "~" | null = null,
    fenceLen = 0;
  const fenceRe = /^(\s*)(`{3,}|~{3,})(.*)$/;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i] ?? "";
    if (!inFence) {
      const m = L.match(fenceRe);
      if (m) {
        inFence = true;
        const grp = m[2] ?? "";
        fenceChar = grp[0] as any;
        fenceLen = grp.length;
        inside[i] = true;
        continue;
      }
    } else {
      inside[i] = true;
      const m = L.match(fenceRe);
      if (m) {
        const grp = m[2] ?? "";
        if ((grp[0] as any) === fenceChar && grp.length >= fenceLen) {
          inFence = false;
        }
      }
    }
  }
  return inside;
}

export function injectAnchors(
  content: string,
  want: Array<{ line: number; id: string }>,
): string {
  if (!want.length) return content;
  const lines = content.split("\n");
  const inside = computeFenceMap(lines);
  const uniq = new Map<string, { line: number; id: string }>();
  for (const w of want) uniq.set(`${w.line}:${w.id}`, w);
  const anchors = Array.from(uniq.values()).sort((a, b) => a.line - b.line);
  const hasIdOnOrNext = (idx: number, id: string) =>
    (lines[idx] ?? "").includes(`^${id}`) ||
    (lines[idx + 1] ?? "").trim() === `^${id}`;
  const nextOutsideIdx = (idx: number) => {
    let i = Math.min(idx, lines.length - 1);
    while (i < lines.length && inside[i]) i++;
    return i;
  };
  for (const { line, id } of anchors) {
    const idx = Math.max(1, Math.min(line, lines.length)) - 1;
    if (hasIdOnOrNext(idx, id)) continue;
    if (inside[idx]) {
      const j = nextOutsideIdx(idx + 1);
      if (j >= lines.length) lines.push(`^${id}`);
      else if (!hasIdOnOrNext(j, id)) lines.splice(j, 0, `^${id}`);
    } else {
      lines[idx] = (lines[idx] ?? "").replace(/\s*$/, ` ^${id}`);
    }
  }
  return lines.join("\n");
}

// Replacer that avoids cycles, BigInt, gigantic strings, and serializes typed arrays sanely.
export function safeReplacer() {
  const seen = new WeakSet<object>();
  return function (_key: string, value: any) {
    if (typeof value === "bigint") return Number(value); // or String(value)
    if (value && typeof value === "object") {
      if (seen.has(value)) return "__CYCLE__";
      seen.add(value);
      if (ArrayBuffer.isView(value)) {
        // Avoid dumping megabytes of vectors as JSON strings; serialize to arrays.
        return Array.from(value as unknown as ArrayLike<number>);
      }
    }
    if (typeof value === "string" && value.length > 5_000_000) {
      return `__TRUNCATED__(${value.length})`;
    }
    return value;
  };
}

/**
 * Stream an array as JSON without ever building the whole string in memory.
 * Writes: [item1,item2,...]
 */
export async function writeJSONArrayStream<T>(
  outPath: string,
  items: Iterable<T> | AsyncIterable<T>,
  replacer: (key: string, value: any) => any = safeReplacer(),
) {
  const tmp = `${outPath}.tmp`;
  const out = createWriteStream(tmp, { flags: "w" });
  const write = async (s: string) => {
    if (!out.write(s)) await once(out, "drain");
  };

  await write("[");
  let first = true;
  for await (const item of items as any) {
    const line = JSON.stringify(item, replacer);
    await write(first ? line : `,${line}`);
    first = false;
  }
  await write("]");
  out.end();
  await once(out, "close");
  await fs.rename(tmp, outPath);
}

/**
 * NDJSON (JSONL) writer: one JSON object per line. Easier to append/inspect.
 */
export async function writeNDJSON<T>(
  outPath: string,
  items: Iterable<T> | AsyncIterable<T>,
  replacer: (key: string, value: any) => any = safeReplacer(),
) {
  const tmp = `${outPath}.tmp`;
  const out = createWriteStream(tmp, { flags: "w" });
  const write = async (s: string) => {
    if (!out.write(s)) await once(out, "drain");
  };

  for await (const item of items as any) {
    await write(JSON.stringify(item, replacer));
    await write("\n");
  }
  out.end();
  await once(out, "close");
  await fs.rename(tmp, outPath);
}
