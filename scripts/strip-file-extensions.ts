#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const REPO = process.env.REPO_ROOT ?? process.cwd();
const TASKS_DIR = path.join(REPO, "docs/agile/tasks");
const BOARD_PATH = path.join(REPO, "docs/agile/boards/kanban.md");

const args = new Map<string, string | true>(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : ["_", a];
  }) as any,
);
const APPLY = args.has("apply"); // --apply to write changes
const RM = args.has("rm"); // --rm to remove true dupes
const VERBOSE = args.has("verbose");

type Plan = {
  from: string;
  to: string;
  reason: string;
  action: "rename" | "delete";
};
type LinkEdit = { file: string; changes: number };

function log(...x: any[]) {
  if (VERBOSE) console.log(...x);
}

// --- helpers ---------------------------------------------------------------

function collapseMdExt(name: string): string {
  return name.replace(/(\.md)+$/i, ".md");
}

function slugify(title: string): string {
  // keep digits/letters/underscore/hyphen; collapse runs; lower-case
  const base = title
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return base || "untitled";
}

function extractWikiTitle(line: string): string[] {
  // returns all wikilinks on line (raw inside [[...]])
  const out: string[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1]);
  return out;
}

function splitKanbanSettings(md: string): { content: string; footer: string } {
  const start = md.search(/^\s*%%\s*kanban:settings\b/m);
  if (start >= 0)
    return {
      content: md.slice(0, start).replace(/\s+$/, ""),
      footer: md.slice(start),
    };
  return { content: md.replace(/\s+$/, ""), footer: "" };
}

function stripFenceBlocks(md: string): string[] {
  // returns lines but marks code blocks so we can avoid link edits inside
  return md.split(/\r?\n/);
}

function inCodeFenceTracker() {
  let fence = false;
  return (line: string) => {
    if (/^\s*```/.test(line)) fence = !fence;
    return fence;
  };
}

// --- scan tasks & plan fixes ----------------------------------------------

async function listTaskFiles(): Promise<string[]> {
  const items = await fs.readdir(TASKS_DIR, { withFileTypes: true });
  const files: string[] = [];
  for (const it of items) {
    if (it.isFile()) files.push(path.join(TASKS_DIR, it.name));
  }
  return files;
}

async function readTitleFor(file: string): Promise<string | null> {
  try {
    const txt = await fs.readFile(file, "utf8");
    // prefer explicit title from first wiki heading or frontmatter 'title:'
    const m1 = txt.match(/^\s*title:\s*["']?(.+?)["']?\s*$/im);
    if (m1) return m1[1].trim();
    const m2 = txt.match(/^#\s+(.+)$/m);
    if (m2) return m2[1].trim();
    // fallback: infer from board-style link embedded in file, else filename
    return path.basename(file, path.extname(file));
  } catch {
    return null;
  }
}

async function plan(): Promise<{
  moves: Plan[];
  deletes: Plan[];
  conflicts: Record<string, string[]>;
}> {
  const files = await listTaskFiles();
  const moves: Plan[] = [];
  const deletes: Plan[] = [];
  const seen: Record<string, string[]> = {};
  for (const file of files) {
    const base0 = path.basename(file);
    const collapsed = collapseMdExt(base0);
    const title = await readTitleFor(file);
    const slug = slugify(title ?? path.basename(collapsed, ".md"));
    const target = `${slug}.md`;
    const from = file;
    const to = path.join(TASKS_DIR, target);

    // plan extension collapse
    if (base0 !== collapsed && collapsed === target) {
      moves.push({
        from,
        to: path.join(TASKS_DIR, collapsed),
        reason: "collapse .md chain",
        action: "rename",
      });
    }

    // plan canonical rename
    if (path.basename(collapsed) !== target) {
      moves.push({ from, to, reason: "canonicalize name", action: "rename" });
    }

    // track for dupes
    const key = path.basename(to);
    (seen[key] ??= []).push(from);
  }

  // dedupe: if multiple different source files map to same canonical
  const conflicts: Record<string, string[]> = {};
  for (const [canon, group] of Object.entries(seen)) {
    if (group.length > 1) conflicts[canon] = group;
  }

  // If --rm, schedule deletes for exact-content dupes
  if (RM) {
    for (const [canon, group] of Object.entries(conflicts)) {
      // keep the newest mtime; delete exact dup content
      const bodies = await Promise.all(
        group.map(async (g) => ({
          f: g,
          b: await fs.readFile(g, "utf8").catch(() => ""),
          st: await fs.stat(g).catch(() => null),
        })),
      );
      // compare content equality ignoring trailing whitespace
      const byNorm = new Map<string, { f: string; st: any }[]>();
      for (const { f, b, st } of bodies) {
        const norm = b.replace(/\s+$/g, "");
        (byNorm.get(norm) ?? byNorm.set(norm, []).get(norm)!).push({ f, st });
      }
      // if all equal, delete all but newest
      if (byNorm.size === 1) {
        const set = [...byNorm.values()][0].sort(
          (a, b) => (b.st?.mtimeMs ?? 0) - (a.st?.mtimeMs ?? 0),
        );
        const keep = set.shift()!;
        for (const d of set)
          deletes.push({
            from: d.f,
            to: keep.f,
            reason: `duplicate of ${path.basename(keep.f)}`,
            action: "delete",
          });
      }
      // else leave as conflict to manually merge
    }
  }

  // de-dup move list (avoid double plans on same file)
  const seenFrom = new Set<string>();
  const uniqMoves: Plan[] = [];
  for (const m of moves) {
    if (seenFrom.has(m.from)) continue;
    seenFrom.add(m.from);
    uniqMoves.push(m);
  }

  return { moves: uniqMoves, deletes, conflicts };
}

// --- link updates (board + tasks) -----------------------------------------

async function updateLinks(
  files: string[],
  renameMap: Map<string, string>,
): Promise<LinkEdit[]> {
  const edits: LinkEdit[] = [];
  const candidates = [BOARD_PATH, ...files]; // board + all tasks
  for (const file of candidates) {
    const exists = await fs
      .stat(file)
      .then(() => true)
      .catch(() => false);
    if (!exists) continue;
    const orig = await fs.readFile(file, "utf8");
    const { content, footer } =
      file === BOARD_PATH
        ? splitKanbanSettings(orig)
        : { content: orig, footer: "" };
    const lines = stripFenceBlocks(content);
    const inFence = inCodeFenceTracker();

    let changed = 0;
    const out = lines
      .map((line) => {
        if (inFence(line)) return line; // skip code fences
        const links = extractWikiTitle(line);
        if (links.length === 0) return line;
        let newline = line;
        for (const raw of links) {
          const [fileOrTitle, alias] = raw.split("|");
          const base = collapseMdExt(fileOrTitle.trim());
          const basename = path.basename(base).toLowerCase();
          const canon = basename.endsWith(".md") ? basename : basename + ".md";
          const newName =
            renameMap.get(canon) || renameMap.get(basename) || null;
          if (newName && newName !== canon) {
            const newRaw = alias ? `${newName}|${alias}` : `${newName}`;
            newline = newline.replace(`[[${raw}]]`, `[[${newRaw}]]`);
            changed++;
          }
        }
        return newline;
      })
      .join("\n");

    if (changed > 0) {
      edits.push({ file, changes: changed });
      if (APPLY) {
        const text = footer
          ? out.endsWith("\n")
            ? out + footer
            : out + "\n" + footer
          : out;
        const tmp = file + ".tmp";
        await fs.writeFile(tmp, text, "utf8");
        await fs.rename(tmp, file);
      }
    }
  }
  return edits;
}

// --- main ------------------------------------------------------------------

(async () => {
  const { moves, deletes, conflicts } = await plan();

  // Build rename map for link fixes (oldBasename -> newBasename)
  const renameMap = new Map<string, string>();
  for (const m of moves) {
    const oldBase = collapseMdExt(path.basename(m.from)).toLowerCase();
    const newBase = path.basename(m.to).toLowerCase();
    renameMap.set(oldBase, newBase);
  }

  // Report
  console.log(`Dry-run: ${!APPLY ? "yes" : "no"}   (--apply to write)`);
  console.log(
    `Remove exact dupes: ${
      RM ? "yes" : "no"
    }   (--rm to delete truly identical files)`,
  );
  console.log("");

  if (
    moves.length === 0 &&
    deletes.length === 0 &&
    Object.keys(conflicts).length === 0
  ) {
    console.log("No filename fixes needed. ✅");
    process.exit(0);
  }

  if (moves.length) {
    console.log("Planned renames:");
    for (const m of moves)
      console.log(
        `  • ${path.basename(m.from)}  →  ${path.basename(m.to)}   (${
          m.reason
        })`,
      );
  }
  if (deletes.length) {
    console.log("\nPlanned deletes (exact dupes):");
    for (const d of deletes)
      console.log(
        `  • delete ${path.basename(d.from)}   (kept: ${path.basename(d.to)})`,
      );
  }
  if (Object.keys(conflicts).length) {
    console.log("\nConflicts (different contents map to same canonical):");
    for (const [canon, group] of Object.entries(conflicts)) {
      console.log(`  • ${canon}:`);
      group.forEach((g) => console.log(`      - ${path.basename(g)}`));
    }
  }

  // Apply filesystem changes
  if (APPLY) {
    for (const d of deletes) await fs.unlink(d.from).catch(() => {});
    for (const m of moves) {
      if (m.action === "rename") {
        // ensure target dir exists
        await fs.rename(m.from, m.to).catch(async (e) => {
          // if target exists and is same file, ignore; else bubble
          if (e && (e as any).code === "EEXIST") return;
          throw e;
        });
      }
    }
  }

  // Update links if we changed names (or will change on apply)
  const taskFiles = await listTaskFiles();
  const edits = await updateLinks(taskFiles, renameMap);
  if (edits.length) {
    console.log("\nLink updates:");
    for (const e of edits)
      console.log(
        `  • ${path.relative(REPO, e.file)}  (+${e.changes} changes)`,
      );
  }

  console.log("\nDone.");
})();
