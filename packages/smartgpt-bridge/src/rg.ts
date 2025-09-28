import fs from "fs/promises";

import ignore from "ignore";
import { execa } from "execa";

import { normalizeToRoot } from "./files.js";
import {
  buildRipgrepArgs,
  expandMaxCount,
  freezeStrings,
  type RipgrepArgs,
} from "./rgArgs.js";

type GrepMatch = {
  path: string;
  line: number;
  column: number;
  lineText: string;
  snippet: string;
  startLine: number;
  endLine: number;
};

type ExecError = {
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  message?: string;
};
type RipgrepRunResult = { readonly stdout: string; readonly error?: ExecError };
type ParsedMatch = {
  readonly path: string;
  readonly lineNumber: number;
  readonly lineText: string;
  readonly column: number;
};
type CacheState = ReadonlyMap<string, ReadonlyArray<string>>;
type CollectOptions = {
  readonly context: number;
  readonly maxMatches: number;
  readonly root: string;
  readonly ignorer: ReturnType<typeof ignore> | null;
};
const DEFAULT_MAX_MATCHES = 200;
const DEFAULT_CONTEXT = 2;
const DEFAULT_PATH_GLOBS = Object.freeze<ReadonlyArray<string>>([
  "**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}",
]);

type NormalizedOptions = {
  readonly pattern: string;
  readonly flags: string;
  readonly paths: ReadonlyArray<string>;
  readonly excludeGlobs: ReadonlyArray<string>;
  readonly ignorer: ReturnType<typeof ignore> | null;
  readonly maxMatches: number;
  readonly context: number;
};

function normalizeNonNegativeInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.floor(value));
}

function splitCSV(input: string | undefined): ReadonlyArray<string> {
  return Object.freeze(
    (input || "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
}

function defaultExcludes(): ReadonlyArray<string> {
  const env = splitCSV(process.env.EXCLUDE_GLOBS);
  return env.length > 0
    ? env
    : ["node_modules/**", ".git/**", "dist/**", "build/**", ".obsidian/**"];
}

const formatRipgrepError = (err: ExecError): string => {
  const stderr = err.stderr?.trim();
  if (stderr) return stderr;
  const message = err.message?.trim();
  return message || "unknown ripgrep error";
};

const isGlobError = (err: ExecError): boolean =>
  /\bglob\b/.test(`${err.stderr ?? ""} ${err.message ?? ""}`.toLowerCase());

const tryRunRipgrep = (
  args: ReadonlyArray<string>,
  cwd: string,
): Promise<RipgrepRunResult> =>
  execa("rg", args, { cwd })
    .then(({ stdout }) => ({ stdout }))
    .catch((error: ExecError) =>
      error.exitCode === 1 && typeof error.stdout === "string"
        ? { stdout: error.stdout }
        : { stdout: "", error },
    );

const normalizeForIgnore = (pathname: string): string =>
  pathname.replace(/\\/g, "/");

async function collectMatches(
  lines: ReadonlyArray<string>,
  options: CollectOptions,
): Promise<ReadonlyArray<GrepMatch>> {
  const iterate = async (
    index: number,
    cache: CacheState,
    acc: ReadonlyArray<GrepMatch>,
  ): Promise<ReadonlyArray<GrepMatch>> => {
    if (index >= lines.length || acc.length >= options.maxMatches) {
      return acc;
    }
    const currentLine = lines[index];
    if (typeof currentLine !== "string") {
      return iterate(index + 1, cache, acc);
    }
    const parsed = parseMatchLine(currentLine);
    if (!parsed) {
      return iterate(index + 1, cache, acc);
    }
    if (options.ignorer?.ignores(normalizeForIgnore(parsed.path)) === true) {
      return iterate(index + 1, cache, acc);
    }
    const { cache: nextCache, lines: fileLines } = await readFileLines(
      options.root,
      parsed.path,
      cache,
    );
    if (!fileLines) {
      return iterate(index + 1, nextCache, acc);
    }
    const nextMatch = createMatch(parsed, fileLines, options.context);
    const nextAcc = acc.concat([nextMatch]);
    if (nextAcc.length >= options.maxMatches) {
      return nextAcc.slice(0, options.maxMatches);
    }
    return iterate(index + 1, nextCache, nextAcc);
  };
  return iterate(0, new Map<string, ReadonlyArray<string>>(), []);
}

function parseMatchLine(line: string): ParsedMatch | null {
  const raw: unknown = JSON.parse(line);
  if (!isRecord(raw) || raw.type !== "match") return null;
  const data = raw.data;
  if (!isRecord(data)) return null;
  const pathInfo = data.path;
  const linesInfo = data.lines;
  const lineNumber = data.line_number;
  if (!isRecord(pathInfo) || typeof pathInfo.text !== "string") return null;
  if (!isRecord(linesInfo) || typeof linesInfo.text !== "string") return null;
  if (typeof lineNumber !== "number") return null;
  const column = firstSubmatchColumn(data.submatches);
  return {
    path: pathInfo.text.startsWith("./")
      ? pathInfo.text.slice(2)
      : pathInfo.text,
    lineNumber,
    lineText: linesInfo.text.replace(/\n$/, ""),
    column,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function firstSubmatchColumn(input: unknown): number {
  if (!Array.isArray(input)) {
    return 1;
  }
  const start = input
    .filter(isRecord)
    .map((record) => record.start)
    .find((value): value is number => typeof value === "number");
  return (start ?? 0) + 1;
}

function readFileLines(
  root: string,
  relPath: string,
  cache: CacheState,
): Promise<{ cache: CacheState; lines: ReadonlyArray<string> | null }> {
  const existing = cache.get(relPath);
  if (existing) {
    return Promise.resolve({ cache, lines: existing });
  }
  const absolute = normalizeToRoot(root, relPath);
  return fs
    .readFile(absolute, "utf8")
    .then((text) => {
      const segments = freezeStrings(text.split(/\r?\n/));
      const nextCache: CacheState = new Map([...cache, [relPath, segments]]);
      return { cache: nextCache, lines: segments };
    })
    .catch(() => ({ cache, lines: null }));
}

function createMatch(
  parsed: ParsedMatch,
  lines: ReadonlyArray<string>,
  context: number,
): GrepMatch {
  const start = Math.max(0, parsed.lineNumber - 1 - context);
  const end = Math.min(lines.length, parsed.lineNumber - 1 + context + 1);
  return {
    path: parsed.path,
    line: parsed.lineNumber,
    column: parsed.column,
    lineText: parsed.lineText,
    snippet: lines.slice(start, end).join("\n"),
    startLine: start + 1,
    endLine: end,
  };
}

type GrepOptions = {
  pattern: string;
  flags?: string;
  paths?: ReadonlyArray<string>;
  exclude?: ReadonlyArray<string>;
  maxMatches?: number;
  context?: number;
};

function normalizeOptions(opts?: GrepOptions): NormalizedOptions {
  const {
    pattern,
    flags = "g",
    paths = DEFAULT_PATH_GLOBS,
    exclude = defaultExcludes(),
    maxMatches: rawMaxMatches = DEFAULT_MAX_MATCHES,
    context: rawContext = DEFAULT_CONTEXT,
  } = opts || {};
  if (!pattern || typeof pattern !== "string") {
    throw new Error("Missing regex 'pattern'");
  }
  const maxMatches = normalizeNonNegativeInteger(
    rawMaxMatches,
    DEFAULT_MAX_MATCHES,
  );
  const context = normalizeNonNegativeInteger(rawContext, DEFAULT_CONTEXT);
  const excludeGlobs = exclude.length > 0 ? exclude : [];
  const ignorer = excludeGlobs.length > 0 ? ignore().add(excludeGlobs) : null;
  return {
    pattern,
    flags,
    paths,
    excludeGlobs,
    ignorer,
    maxMatches,
    context,
  };
}

async function runRipgrepWithFallback(
  root: string,
  args: RipgrepArgs,
  maxMatches: number,
  hasExclude: boolean,
): Promise<RipgrepRunResult> {
  const primary = await tryRunRipgrep(args.withExclude, root);
  if (!primary.error) {
    return primary;
  }
  if (!hasExclude || !isGlobError(primary.error)) {
    return primary;
  }
  return tryRunRipgrep(expandMaxCount(args.withoutExclude, maxMatches), root);
}

export async function grep(
  ROOT_PATH: string,
  opts?: GrepOptions,
): Promise<GrepMatch[]> {
  const normalized = normalizeOptions(opts);
  if (normalized.maxMatches === 0) {
    return [];
  }
  const args = buildRipgrepArgs({
    pattern: normalized.pattern,
    flags: normalized.flags,
    paths: normalized.paths,
    excludeGlobs: normalized.excludeGlobs,
    maxMatches: normalized.maxMatches,
    context: normalized.context,
  });
  const resolved = await runRipgrepWithFallback(
    ROOT_PATH,
    args,
    normalized.maxMatches,
    normalized.excludeGlobs.length > 0,
  );
  if (resolved.error) {
    throw new Error("rg error: " + formatRipgrepError(resolved.error));
  }
  const lines = freezeStrings(
    resolved.stdout.split(/\r?\n/).filter((entry) => entry.length > 0),
  );
  const matches = await collectMatches(lines, {
    context: normalized.context,
    maxMatches: normalized.maxMatches,
    root: ROOT_PATH,
    ignorer: normalized.ignorer,
  });
  return [...matches];
}
