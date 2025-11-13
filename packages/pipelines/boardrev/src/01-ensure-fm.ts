import * as path from 'path';
import { fileURLToPath } from 'url';

import { readMaybe, writeText, parseArgs, slug, randomUUID } from '@promethean-os/utils';
import { getLogger } from '@promethean-os/logger';
import {
  ensureBaselineFrontmatter,
  parseFrontmatter,
  stringifyFrontmatter,
} from '@promethean-os/markdown/frontmatter';

import { listTaskFiles, normStatus } from './utils.js';
import type { TaskFM } from './types.js';
import { Priority } from './types.js';

const logger = getLogger('boardrev');

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
      const gm = parseFrontmatter<Partial<TaskFM>>(raw);
      const fm = gm.data ?? {};
      if (!needsFM(fm)) return 0;
      const baseline = ensureBaselineFrontmatter(fm, {
        filePath: file,
        uuidFactory: randomUUID,
        now: () => new Date().toISOString(),
        titleFactory: ({ content }) => inferTitle(content ?? ''),
        fallbackTitle: slug(path.basename(file, '.md')).replace(/-/g, ' '),
        content: gm.content,
      });
      const payload: Readonly<TaskFM> = {
        ...baseline,
        status: normStatus(fm.status ?? defaultStatus),
        priority: fm.priority ?? defaultPriority,
        labels: Array.isArray(fm.labels) ? fm.labels : [],
        ...(fm.assignee ? { assignee: fm.assignee } : {}),
      };
      const final = stringifyFrontmatter(`${gm.content.trimStart()}\n`, payload);
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    '--dir': 'docs/agile/tasks',
    '--priority': 'P3',
    '--status': 'todo',
  });
  const priorityKey = args['--priority'] as keyof typeof Priority;
  const defaultPriority = Priority[priorityKey] ?? Priority.P3;

  ensureFM({
    dir: args['--dir'],
    defaultPriority,
    defaultStatus: args['--status'],
  })
    .then((count) => {
      logger.info(`boardrev: ensured frontmatter for ${count} task(s)`);
    })
    .catch((e) => {
      logger.error((e as Error).message);
      process.exit(1);
    });
}
