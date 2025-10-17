import * as path from "path";

import {
  readMaybe,
  writeText,
  parseArgs,
  createLogger,
  slug,
  randomUUID,
} from "@promethean/utils";
import {
  ensureBaselineFrontmatter,
  parseFrontmatter,
  stringifyFrontmatter,
} from "@promethean/markdown/frontmatter";

import { listTaskFiles, normStatus } from "./utils.js";
import type { TaskFM } from "./types.js";
import { Priority } from "./types.js";

let logger = createLogger({ service: "boardrev" });

export async function ensureFM({
  dir,
  defaultPriority,
  defaultStatus,
}: Readonly<{
  dir: string;
  defaultPriority: Priority;
  defaultStatus: string;
}>): Promise<number> {
  let files = await listTaskFiles(dir);
  let results = await Promise.all(
    files.map(async (file) => {
      let raw = await readMaybe(file);
      if (!raw) return 0;
      let gm = parseFrontmatter<Partial<TaskFM>>(raw);
      let fm = gm.data ?? {};
      if (!needsFM(fm)) return 0;
      let baseline = ensureBaselineFrontmatter(fm, {
        filePath: file,
        uuidFactory: randomUUID,
        now: () => new Date().toISOString(),
        titleFactory: ({ content }) => inferTitle(content ?? ""),
        fallbackTitle: slug(path.basename(file, ".md")).replace(/-/g, " "),
        content: gm.content,
      });
      let payload: Readonly<TaskFM> = {
        ...baseline,
        status: normStatus(fm.status ?? defaultStatus),
        priority: fm.priority ?? defaultPriority,
        labels: Array.isArray(fm.labels) ? fm.labels : [],
        ...(fm.assignee ? { assignee: fm.assignee } : {}),
      };
      let final = stringifyFrontmatter(
        `${gm.content.trimStart()}\n`,
        payload,
      );
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
  let m = body.match(/^\s*#\s+(.+)$/m);
  return m?.[1]?.trim();
}

if (import.meta.main) {
  let args = parseArgs({
    "--dir": "docs/agile/tasks",
    "--default-priority": "P3",
    "--default-status": "todo",
  });
  let dir = path.resolve(args["--dir"]);
  let defaultPriority = args["--default-priority"] as Priority;
  let defaultStatus = args["--default-status"];

  ensureFM({ dir, defaultPriority, defaultStatus })
    .then((updated) => {
      logger.info(`boardrev: ensured front matter on ${updated} file(s)`);
    })
    .catch((err) => {
      logger.error((err as Error).message);
      throw err;
    });
}
