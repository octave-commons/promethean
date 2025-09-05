// packages/docops/src/00-purge.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { parseArgs, listFilesRec, stripGeneratedSections } from "./utils";

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
  const kept: string[] = [];
  const refDefRe = /^\s*\[[^\]]+\]:\s*\S+(?:\s+"[^"]*")?\s*$/;
  for (const L of lines) {
    if (refDefRe.test(L)) continue;
    kept.push(L);
  }
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

  let files = await listFilesRec(ROOT, EXTS);
  if (opts.files && opts.files.length) {
    const wanted = new Set(opts.files.map((p) => path.resolve(p)));
    files = files.filter((f) => wanted.has(path.resolve(f)));
  }

  let done = 0;
  for (const f of files) {
    const abs = path.resolve(f);
    const rel = path.relative(process.cwd(), abs);
    const raw = await fs.readFile(abs, "utf8");
    // 1) Remove frontmatter
    let body = removeFrontmatter(raw);
    // 2) Remove docops generated footer blocks
    body = stripGeneratedSections(body);
    // 3) Remove Markdown deeplinks
    body = stripLinks(body);
    // Normalize trailing newline
    if (!body.endsWith("\n")) body += "\n";
    if (DRY) {
      console.log(`purge (dry): ${rel}`);
    } else {
      await fs.writeFile(abs, body, "utf8");
      console.log(`purged: ${rel}`);
    }
    done++;
    onProgress?.({
      step: "purge",
      done,
      total: files.length,
      message: path.basename(abs),
    });
  }
}

// CLI entry
import { pathToFileURL } from "node:url";
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
