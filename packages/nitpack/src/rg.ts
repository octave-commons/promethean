import { globby } from "globby";
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

type RgArgs = Readonly<{ args: readonly string[] }>;

const hasRg = (): boolean => {
  const r = spawnSync("rg", ["--version"], { stdio: "ignore", timeout: 1000 });
  return r.status === 0;
};

const rgArgsFor = (key: string): RgArgs | null => {
  switch (key) {
    case "REL_JS_SUFFIX":
      return {
        args: [
          "-n",
          "-P",
          "--glob",
          "packages/**/src/**/*.{ts,tsx}",
          "-e",
          "from [\"'][.]{1,2}/[^\"']*(?!\\.js)[\"']",
        ],
      };
    case "NO_TS_PATHS":
      return {
        args: [
          "-n",
          "--glob",
          "packages/**/tsconfig*.json",
          "-e",
          "\"paths\"\\s*:",
        ],
      };
    case "NO_EMBED_HTML":
      return {
        args: [
          "-n",
          "-i",
          "--glob",
          "packages/**/src/**/*.{ts,tsx,js,jsx}",
          "-e",
          "(?i)<html|<!doctype|res\\.send\\(",
        ],
      };
    default:
      return null;
  }
};

const nodeScanRegexFor = (key: string): RegExp | null => {
  switch (key) {
    case "REL_JS_SUFFIX":
      return /from ['"][.]{1,2}\/[^'"]*(?!\.js)['"]/g;
    case "NO_TS_PATHS":
      return /"paths"\s*:/g;
    case "NO_EMBED_HTML":
      return /<html|<!doctype|res\.send\(/gi;
    default:
      return null;
  }
};

export const countOccurrences = async (
  key: string,
  repoRoot: string,
): Promise<number> => {
  const rg = rgArgsFor(key);
  if (rg && hasRg()) {
    const r = spawnSync("rg", listFrom(rg.args), {
      cwd: repoRoot,
      encoding: "utf8",
    });
    if (r.status === 0 && r.stdout) {
      return r.stdout.trim().split("\n").filter(Boolean).length;
    }
    // fall through to Node scan on errors or no matches
  }

  // -- existing Node-based scan implementation follows here --
};
  const rx = nodeScanRegexFor(key);
  if (!rx) return 0;
  const files = await globby(
    ["packages/**/src/**/*.{ts,tsx,js,jsx}", "packages/**/tsconfig*.json"],
    { cwd: repoRoot },
  );
  const counts = await Promise.all(
    files.map(async (rel) => {
      const file = path.join(repoRoot, rel);
      const txt = await readFile(file, "utf8");
      const m = txt.match(rx);
      return m ? m.length : 0;
    }),
  );
  return counts.reduce((a, b) => a + b, 0);
};

const listFrom = (xs: readonly string[]): string[] => Array.from(xs);
