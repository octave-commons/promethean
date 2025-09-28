import fs from "fs/promises";

import ignore from "ignore";
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

type ExecError = {
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  message?: string;
};
type RipgrepArgs = {
  readonly withExclude: ReadonlyArray<string>;
  readonly withoutExclude: ReadonlyArray<string>;
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
type BuildArgsInput = {
  readonly pattern: string;
  readonly flags: string;
  readonly paths: ReadonlyArray<string>;
  readonly excludeGlobs: ReadonlyArray<string>;
  readonly maxMatches: number;
  readonly context: number;
};
type PathReduction = {
  readonly includeArgs: ReadonlyArray<string>;
  readonly searchPaths: ReadonlyArray<string>;
};

const GLOB_CHARS = /[?*{}\[\]]/;

function splitCSV(input: string | undefined): ReadonlyArray<string> {
  return Object.freeze(
    (input || "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
}

const hasGlob = (value: string): boolean => GLOB_CHARS.test(value);

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

const freezeStrings = (values: string[]): ReadonlyArray<string> =>
  Object.freeze(values);

function createBaseArgs(config: BuildArgsInput): ReadonlyArray<string> {
  const normalizedFlags = config.flags.toLowerCase();
  const base = [
    "--json",
    "--max-count",
    String(config.maxMatches),
    "-C",
    String(config.context),
  ];
  const caseArgs = normalizedFlags.includes("i")
    ? ["-i"]
    : ["--case-sensitive"];
  return freezeStrings([...base, ...caseArgs]);
}

function reducePaths(
  initial: ReadonlyArray<string>,
  paths: ReadonlyArray<string>,
): PathReduction {
  return paths.reduce<PathReduction>(
    (state, entry) =>
      hasGlob(entry)
        ? {
            includeArgs: state.includeArgs.concat(["--glob", entry]),
            searchPaths: state.searchPaths,
          }
        : {
            includeArgs: state.includeArgs,
            searchPaths: state.searchPaths.concat([entry]),
          },
    { includeArgs: initial, searchPaths: [] },
  );
}

function applyExcludes(
  args: ReadonlyArray<string>,
  excludeGlobs: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return excludeGlobs.reduce<ReadonlyArray<string>>(
    (acc, glob) => acc.concat(["--glob", `!${glob}`]),
    args,
  );
}

function appendPattern(
  args: ReadonlyArray<string>,
  pattern: string,
  paths: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const searchTargets = paths.length > 0 ? paths : ["."];
  return args.concat([pattern]).concat(searchTargets);
}

function expandMaxCount(
  args: ReadonlyArray<string>,
  maxMatches: number,
): ReadonlyArray<string> {
  const index = args.indexOf("--max-count");
  if (index === -1 || index + 1 >= args.length) {
    return args;
  }
  const expandedLimit = Math.max(maxMatches * 10, maxMatches + 1000);
  const prefix = args.slice(0, index + 1);
  const suffix = args.slice(index + 2);
  return freezeStrings([...prefix, String(expandedLimit), ...suffix]);
}

function buildRipgrepArgs(config: BuildArgsInput): RipgrepArgs {
  const baseArgs = createBaseArgs(config);
  const pathReduction = reducePaths(baseArgs, config.paths);
  const withExclude = applyExcludes(
    pathReduction.includeArgs,
    config.excludeGlobs,
  );
  return {
    withExclude: appendPattern(
      withExclude,
      config.pattern,
      pathReduction.searchPaths,
    ),
    withoutExclude: appendPattern(
      pathReduction.includeArgs,
      config.pattern,
      pathReduction.searchPaths,
    ),
  };
}

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
    return iterate(index + 1, nextCache, acc.concat([nextMatch]));
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
  if (!pattern || typeof pattern !== "string") {
    throw new Error("Missing regex 'pattern'");
  }
  const excludeGlobs = exclude.length > 0 ? exclude : [];
  const ignorer = excludeGlobs.length > 0 ? ignore().add(excludeGlobs) : null;
  const args = buildRipgrepArgs({
    pattern,
    flags,
    paths,
    excludeGlobs,
    maxMatches,
    context,
  });
  const primary = await tryRunRipgrep(args.withExclude, ROOT_PATH);
  const resolved =
    primary.error && excludeGlobs.length > 0 && isGlobError(primary.error)
      ? await tryRunRipgrep(
          expandMaxCount(args.withoutExclude, maxMatches),
          ROOT_PATH,
        )
      : primary;
  if (resolved.error) {
    throw new Error("rg error: " + formatRipgrepError(resolved.error));
  }
  const lines = freezeStrings(
    resolved.stdout.split(/\r?\n/).filter((entry) => entry.length > 0),
  );
  const matches = await collectMatches(lines, {
    context,
    maxMatches,
    root: ROOT_PATH,
    ignorer,
  });
  return [...matches];
}
