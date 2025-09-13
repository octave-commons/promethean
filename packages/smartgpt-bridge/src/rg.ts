import fs from "fs/promises";

import { execa } from "execa";

import { normalizeToRoot } from "./files.js";

type GrepMatch = {
  path: string;
  line: number;
  column: number;
  lineText: string;
  snippet: string;
  startLine: number;
  endLine: number;
};

function splitCSV(s: string | undefined): string[] {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function defaultExcludes(): string[] {
  const env = splitCSV(process.env.EXCLUDE_GLOBS);
  return env.length
    ? env
    : ["node_modules/**", ".git/**", "dist/**", "build/**", ".obsidian/**"];
}

type GrepOptions = {
  pattern: string;
  flags?: string;
  paths?: string[];
  exclude?: string[];
  maxMatches?: number;
  context?: number;
};

export async function grep(
  ROOT_PATH: string,
  opts?: GrepOptions,
): Promise<GrepMatch[]> {
  const {
    pattern,
    flags = "g",
    paths = ["**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}"],
    exclude = defaultExcludes(),
    maxMatches = 200,
    context = 2,
  } = opts || {};
  if (!pattern || typeof pattern !== "string")
    throw new Error("Missing regex 'pattern'");
  const args = [
    "--json",
    "--max-count",
    String(maxMatches),
    "-C",
    String(context),
  ];
  if (flags.includes("i")) args.push("-i");
  exclude.forEach((ex) => args.push("--glob", `!${ex}`));
  const searchPaths: string[] = [];
  for (const p of paths) {
    if (/[?*{}\[\]]/.test(p)) {
      args.push("--glob", p);
    } else {
      searchPaths.push(p);
    }
  }
  args.push(pattern);
  if (searchPaths.length) {
    args.push(...searchPaths);
  } else {
    args.push(".");
  }
  let stdout: string;
  try {
    ({ stdout } = await execa("rg", args, { cwd: ROOT_PATH }));
  } catch (err: unknown) {
    // rg exits with code 1 when no matches are found. In that case the
    // stdout still contains a JSON summary which we can treat as an empty
    // result set.
    const e = err as {
      exitCode?: number;
      stdout?: string;
      stderr?: string;
      message?: string;
    };
    if (e.exitCode === 1 && e.stdout) {
      stdout = e.stdout;
    } else {
      const msg = e.stderr || e.message || String(err);
      throw new Error("rg error: " + msg);
    }
  }
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  const out: GrepMatch[] = [];
  const cache = new Map<string, string[]>();
  for (const line of lines) {
    const obj = JSON.parse(line);
    if (obj.type !== "match") continue;
    const relPath = obj.data.path.text.startsWith("./")
      ? obj.data.path.text.slice(2)
      : obj.data.path.text;
    let fileLines = cache.get(relPath);
    if (!fileLines) {
      const abs = normalizeToRoot(ROOT_PATH, relPath);
      try {
        const text = await fs.readFile(abs, "utf8");
        fileLines = text.split(/\r?\n/);
        cache.set(relPath, fileLines);
      } catch {
        continue;
      }
    }
    const lineNumber: number = obj.data.line_number;
    const lineText: string = obj.data.lines.text.replace(/\n$/, "");
    const column: number = (obj.data.submatches?.[0]?.start ?? 0) + 1;
    const start = Math.max(0, lineNumber - 1 - context);
    const end = Math.min(fileLines.length, lineNumber - 1 + context + 1);
    const snippet = fileLines.slice(start, end).join("\n");
    out.push({
      path: relPath,
      line: lineNumber,
      column,
      lineText,
      snippet,
      startLine: start + 1,
      endLine: end,
    });
    if (out.length >= maxMatches) break;
  }
  return out;
}
