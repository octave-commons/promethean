/* eslint-disable */
// packages/docops/src/00-purge.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

import { scanFiles } from "@promethean/file-indexer";
import type { IndexedFile, ScanProgress } from "@promethean/file-indexer";

import { parseArgs, stripGeneratedSections } from "./utils.js";

// CLI entry

export type PurgeOptions = {
  dir: string;
  exts?: string[];
  dryRun?: boolean;
  files?: string[]; // limit to subset
};

// Remove frontmatter at the very top if it starts with '---' on the first line
function removeFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw;
  // match from start: ---\n ... \n---\n (YAML frontmatter)
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!m) return raw; // malformed; keep as-is
  return raw.slice(m[0].length);
}

// Remove inline links but keep the text, and drop link reference definitions
function stripLinks(body: string): string {
  // Drop reference definitions like: [id]: https://... "title"
  const lines = body.split("\n");
  const refDefRe = /^\s*\[[^\]]+\]:\s*\S+(?:\s+"[^"]*")?\s*$/;
  const kept = lines.filter((L) => !refDefRe.test(L));
  let s = kept.join("\n");
  // Replace inline links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  // Remove autolinks <http://...>
  s = s.replace(/<https?:\/\/[^>]+>/g, "");
  // Remove bare URLs
  s = s.replace(/https?:\/\/\S+/g, "");
  return s;
}

export async function runPurge(
  opts: PurgeOptions,
  onProgress?: (p: {
    step: "purge";
    done: number;
    total: number;
    message?: string;
  }) => void,
) {
  const ROOT = path.resolve(opts.dir);
  const EXTS = new Set(
    (opts.exts ?? [".md", ".mdx", ".txt"]).map((s) => s.trim().toLowerCase()),
  );
  const DRY = Boolean(opts.dryRun);

  const wanted =
    opts.files && opts.files.length
      ? new Set(opts.files.map((p) => path.resolve(p)))
      : null;
  let processed = 0;
  await scanFiles({
    root: ROOT,
    exts: EXTS,
    readContent: true,
    onFile: async (file: IndexedFile, progress: ScanProgress) => {
      const abs = path.isAbsolute(file.path)
        ? path.resolve(file.path)
        : path.resolve(ROOT, file.path);
      if (wanted && !wanted.has(abs)) return;
      const rel = path.relative(process.cwd(), abs);
      const raw = file.content ?? (await fs.readFile(abs, "utf8"));
      let body = removeFrontmatter(raw);
      body = stripGeneratedSections(body);
      body = stripLinks(body);
      if (!body.endsWith("\n")) body += "\n";
      if (DRY) {
        console.log(`purge (dry): ${rel}`);
      } else {
        await fs.writeFile(abs, body, "utf8");
        console.log(`purged: ${rel}`);
      }
      processed++;
      onProgress?.({
        step: "purge",
        done: processed,
        total: wanted ? wanted.size : progress.total,
        message: path.basename(abs),
      });
    },
  });
}
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({
    "--dir": "docs/unique",
    "--ext": ".md,.mdx,.txt",
    "--dry-run": "false",
  });
  const dir = args["--dir"] ?? "docs/unique";
  const extsArg = args["--ext"] ?? ".md,.mdx,.txt";
  const dryRun = (args["--dry-run"] ?? "false") === "true";
  runPurge({ dir, exts: extsArg.split(","), dryRun })
    .then(() => console.log("00-purge: done."))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
