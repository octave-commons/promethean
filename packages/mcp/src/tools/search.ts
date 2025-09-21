import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { getMcpRoot, normalizeToRoot, isInsideRoot } from "../files.js";
import type { ToolFactory } from "../core/types.js";

const resolveRoot = () => getMcpRoot();

const textFile = (name: string) => {
  const ext = path.extname(name).toLowerCase();
  // very rough heuristic; users can still search anything but we'll skip obvious binaries by size+ext.
  return ![
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".pdf",
    ".zip",
    ".gz",
    ".tar",
    ".jar",
    ".exe",
    ".wasm",
  ].includes(ext);
};

const walk = async (
  abs: string,
  opts: { includeHidden: boolean; maxDepth: number },
  level = 1,
): Promise<string[]> => {
  const dirents = await fs.readdir(abs, { withFileTypes: true });
  const out: string[] = [];
  for (const d of dirents) {
    if (!opts.includeHidden && d.name.startsWith(".")) continue;
    const child = path.join(abs, d.name);
    if (d.isDirectory()) {
      if (level < opts.maxDepth) {
        out.push(...(await walk(child, opts, level + 1)));
      }
      continue;
    }
    out.push(child);
  }
  return out;
};

export const filesSearch: ToolFactory = () => {
  const shape = {
    query: z.string().describe("string or regex pattern"),
    regex: z.boolean().default(false),
    caseSensitive: z.boolean().default(false),
    includeHidden: z.boolean().default(false),
    maxDepth: z.number().int().min(1).default(25),
    maxFileSizeBytes: z.number().int().min(1).default(1_000_000),
    maxResults: z.number().int().min(1).default(200),
    rel: z.string().default("."),
  } as const;
  const Schema = z.object(shape);
  const spec = {
    name: "files.search",
    description:
      "Search file contents under a directory and return matching line snippets.",
    inputSchema: shape,
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const {
      query,
      regex,
      caseSensitive,
      includeHidden,
      maxDepth,
      maxFileSizeBytes,
      maxResults,
      rel,
    } = args;
    const ROOT = resolveRoot();
    const baseAbs = normalizeToRoot(ROOT, rel);
    const files = (await walk(baseAbs, { includeHidden, maxDepth }))
      .filter((p) => isInsideRoot(ROOT, p))
      .filter((p) => textFile(p));

    const flags = caseSensitive ? "" : "i";
    const pattern = regex
      ? new RegExp(query, flags)
      : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);

    const results: Array<{ path: string; line: number; snippet: string }> = [];

    for (const f of files) {
      if (results.length >= maxResults) break;
      try {
        const st = await fs.stat(f);
        if (st.size > maxFileSizeBytes) continue;
        if (!textFile(f)) continue;
        const rawTxt = await fs.readFile(f, "utf8");
        const lines = rawTxt.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line === undefined) continue;
          if (pattern.test(line)) {
            results.push({
              path: path.relative(ROOT, f).replace(/\\/g, "/"),
              line: i + 1,
              snippet: line,
            });
            if (results.length >= maxResults) break;
          }
        }
      } catch {
        /* ignore file errors */
      }
    }

    return { ok: true, count: results.length, results };
  };

  return { spec, invoke };
};

export default filesSearch;
