/* eslint-disable functional/no-let, functional/no-loop-statements, functional/immutable-data, functional/prefer-immutable-types, @typescript-eslint/prefer-readonly-parameter-types, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion, max-lines-per-function, sonarjs/cognitive-complexity */
import { promises as fs } from "fs";
import * as path from "path";
import {
  anchorId,
  computeFenceMap,
  injectAnchors,
  relMdLink,
} from "@promethean/markdown/anchors.js";
import { once } from "node:events";
import { createWriteStream } from "node:fs";

import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import * as yaml from "yaml";
import type { Code, Content, Heading, Root, Text } from "mdast";
import type { Position } from "unist";

import { Chunk, Front } from "./types.js";
export {
  stripGeneratedSections,
  START_MARK,
  END_MARK,
  randomUUID,
} from "@promethean/utils";

export { anchorId, computeFenceMap, injectAnchors, relMdLink };

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

export async function writeJSON<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export function frontToYAML(front: Front): string {
  return yaml.stringify(front, { indent: 2, simpleKeys: true });
}

export function parseMarkdownChunks(markdown: string): Chunk[] {
  const ast = unified().use(remarkParse).parse(markdown) as Root;
  const chunks: Chunk[] = [];
  let currentHeading: string | undefined;

  function extractText(node: Content): string {
    let out = "";
    visit(node, (n) => {
      if (n.type === "text") out += (n as Text).value ?? "";
    });
    return out;
  }
  function sentenceSplit(s: string, maxLen: number): string[] {
    if (s.length <= maxLen) return [s];
    const parts = s.split(/(?<=[\.\!\?])\s+/);
    let buf = "";
    const chunks = parts.reduce<string[]>((acc, p, idx) => {
      if ((buf + " " + p).trim().length > maxLen) {
        if (buf) acc.push(buf.trim());
        buf = p;
      } else {
        buf = (buf ? `${buf} ` : "") + p;
      }
      if (idx === parts.length - 1 && buf) acc.push(buf.trim());
      return acc;
    }, []);
    return chunks.flatMap((c) =>
      c.length <= maxLen
        ? [c]
        : Array.from({ length: Math.ceil(c.length / maxLen) }, (_, i) =>
            c.slice(i * maxLen, i * maxLen + maxLen),
          ),
    );
  }

  visit(ast, (node) => {
    if (!node?.type) return;
    if (node.type === "heading") {
      const heading = node as Heading;
      currentHeading = (heading.children || [])
        .map((c) => (c as Text).value ?? "")
        .join(" ")
        .trim();
    }
    if (
      node.type === "paragraph" ||
      node.type === "listItem" ||
      node.type === "code"
    ) {
      const pos = node.position as Position | undefined;
      if (!pos) return;
      const raw =
        node.type === "code" ? (node as Code).value ?? "" : extractText(node);
      const trimmed = raw.trim();
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
