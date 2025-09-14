/* eslint-disable */
import * as path from "path";

import matter from "gray-matter";
import {
  readMaybe,
  writeText,
  parseArgs,
  createLogger,
  slug,
  randomUUID,
} from "@promethean/utils";

import { listTaskFiles, normStatus } from "./utils.js";
import type { TaskFM } from "./types.js";
import { Priority } from "./types.js";

const logger = createLogger({ service: "boardrev" });

export async function ensureFM({
  dir,
  defaultPriority,
  defaultStatus,
}: Readonly<{
  dir: string;
  defaultPriority: Priority;
  defaultStatus: string;
}>): Promise<number> {
  const files = await listTaskFiles(dir);
  const results = await Promise.all(
    files.map(async (file) => {
      const raw = await readMaybe(file);
      if (!raw) return 0;
      const gm = matter(raw);
      const fm = gm.data as Partial<TaskFM>;
      if (!needsFM(fm)) return 0;
      const title =
        fm.title ??
        inferTitle(gm.content) ??
        slug(path.basename(file, ".md")).replace(/-/g, " ");
      const payload: Readonly<TaskFM> = {
        uuid: fm.uuid ?? randomUUID(),
        title,
        status: normStatus(fm.status ?? defaultStatus),
        priority: fm.priority ?? defaultPriority,
        labels: Array.isArray(fm.labels) ? fm.labels : [],
        created_at: fm.created_at ?? new Date().toISOString(),
        ...(fm.assignee ? { assignee: fm.assignee } : {}),
      };
      const final = matter.stringify(gm.content.trimStart() + "\n", payload, {
        language: "yaml",
      });
      await writeText(file, final);
      return 1;
    }),
  );
  return results.reduce((a: number, b) => a + b, 0);
}

function needsFM(fm?: Readonly<Partial<TaskFM>>) {
  return !fm || !fm.title || !fm.uuid || !fm.status || !fm.priority;
}

function inferTitle(body: string) {
  const m = body.match(/^\s*#\s+(.+)$/m);
  return m?.[1]?.trim();
}

if (import.meta.main) {
  const args = parseArgs({
    "--dir": "docs/agile/tasks",
    "--default-priority": "P3",
    "--default-status": "todo",
  });
  const dir = path.resolve(args["--dir"]);
  const defaultPriority = args["--default-priority"] as Priority;
  const defaultStatus = args["--default-status"];

  ensureFM({ dir, defaultPriority, defaultStatus })
    .then((updated) => {
      logger.info(`boardrev: ensured front matter on ${updated} file(s)`);
    })
    .catch((err) => {
      logger.error((err as Error).message);
      throw err;
    });
}
