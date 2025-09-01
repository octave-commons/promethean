/* eslint-disable no-console */
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, listTaskFiles, readMaybe, writeText, normStatus, slug } from "./utils.js";
import type { TaskFM } from "./types.js";

const args = parseArgs({
  "--dir": "docs/agile/tasks",
  "--default-priority": "P3",
  "--default-status": "todo"
});

function randomUUID() {
  // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? (await import("crypto")).randomUUID();
}

async function main() {
  const dir = path.resolve(args["--dir"]);
  const files = await listTaskFiles(dir);
  let updated = 0;

  for (const f of files) {
    const raw = await readMaybe(f); if (!raw) continue;
    const gm = matter(raw);
    const fm = gm.data as Partial<TaskFM>;
    const needs = !fm || !fm.title || !fm.uuid || !fm.status || !fm.priority;

    if (!needs) continue;

    const title = fm.title ?? inferTitle(gm.content) ?? slug(path.basename(f, ".md")).replace(/-/g, " ");
    const payload: TaskFM = {
      uuid: fm.uuid ?? randomUUID(),
      title,
      status: normStatus(fm.status ?? args["--default-status"]),
      priority: (fm.priority as any) ?? args["--default-priority"],
      labels: Array.isArray(fm.labels) ? fm.labels : [],
      created_at: fm.created_at ?? new Date().toISOString(),
      assignee: fm.assignee ?? undefined
    };

    const final = matter.stringify(gm.content.trimStart() + "\n", payload, { language: "yaml" });
    await writeText(f, final);
    updated++;
  }
  console.log(`boardrev: ensured front matter on ${updated} file(s)`);
}

function inferTitle(body: string) {
  const m = body.match(/^\s*#\s+(.+)$/m);
  return m ? m[1].trim() : undefined;
}

main().catch(e => { console.error(e); process.exit(1); });
