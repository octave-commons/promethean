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

import * as yaml from "yaml";

import type { Front } from "./types.js";
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

export { parseMarkdownChunks } from "@promethean/markdown";

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
