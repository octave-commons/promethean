import path from "node:path";
import fs from "node:fs/promises";

import test from "ava";
import { execa } from "execa";

import { grep } from "../../grep.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

type Opts = {
  flags?: string;
  paths?: string[];
  exclude?: string[];
  maxMatches?: number;
  context?: number;
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

async function runRg(pattern: string, opts?: Opts) {
  const {
    flags = "g",
    paths = ["**/*.md"],
    exclude = defaultExcludes(),
    maxMatches = 200,
    context = 1,
  } = opts || {};
  const args = [
    "--json",
    "--max-count",
    String(maxMatches),
    "-C",
    String(context),
  ];
  if (flags.includes("i")) args.push("-i");
  exclude.forEach((ex: string) => {
    args.push("--glob", `!${ex}`);
  });
  const searchPaths = [];
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
    ({ stdout } = await execa("rg", args, { cwd: ROOT }));
  } catch (err: unknown) {
    const error = err as { exitCode?: number; stdout?: string };
    if (error.exitCode === 1 && typeof error.stdout === "string") {
      stdout = error.stdout;
    } else {
      throw err;
    }
  }
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  const out = [];
  const cache = new Map();
  for (const line of lines) {
    const obj = JSON.parse(line);
    if (obj.type !== "match") continue;
    const relPath = obj.data.path.text.startsWith("./")
      ? obj.data.path.text.slice(2)
      : obj.data.path.text;
    let fileLines = cache.get(relPath);
    if (!fileLines) {
      const text = await fs.readFile(path.join(ROOT, relPath), "utf8");
      fileLines = text.split(/\r?\n/);
      cache.set(relPath, fileLines);
    }
    const lineNumber = obj.data.line_number;
    const lineText = obj.data.lines.text.replace(/\n$/, "");
    const column = (obj.data.submatches?.[0]?.start ?? 0) + 1;
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

test("grep: matches ripgrep output with context and flags", async (t) => {
  const opts = {
    pattern: "heading",
    flags: "i",
    paths: ["**/*.md"],
    context: 1,
  };
  const [results, expected] = await Promise.all([
    grep(ROOT, opts),
    runRg(opts.pattern, opts),
  ]);
  t.deepEqual(results, expected);
});

test("grep: case-sensitive search overrides smart-case config", async (t) => {
  const rcPath = path.join(
    process.cwd(),
    "tests",
    "fixtures",
    "ripgrep-smart-case.rc",
  );
  const previous = process.env.RIPGREP_CONFIG_PATH;
  process.env.RIPGREP_CONFIG_PATH = rcPath;
  t.teardown(() => {
    if (previous === undefined) {
      delete process.env.RIPGREP_CONFIG_PATH;
    } else {
      process.env.RIPGREP_CONFIG_PATH = previous;
    }
  });

  const caseSensitive = await grep(ROOT, {
    pattern: "heading",
    flags: "g",
    paths: ["**/*.md"],
    context: 1,
  });
  t.is(caseSensitive.length, 0);

  const caseInsensitive = await grep(ROOT, {
    pattern: "heading",
    flags: "i",
    paths: ["**/*.md"],
    context: 1,
  });
  t.true(caseInsensitive.length >= 1);
});

test("grep: invalid regex throws error", async (t) => {
  await t.throwsAsync(() =>
    grep(ROOT, { pattern: "(*invalid", paths: ["**/*.md"] }),
  );
});
