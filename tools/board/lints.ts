import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listFilesRec } from '@promethean/utils/list-files-rec.js';
import { parseFrontmatter } from '@promethean/markdown/frontmatter.js';
import type { TaskFM } from './types.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..', '..');

const TASKS_DIR = path.join(REPO, 'boards', 'tasks');
const EXTS = new Set(['.md']);

const rmap = <T>(v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]).map(s => String(s).trim()).filter(Boolean)
  : typeof v === 'string' ? String(v).split(',').map(s => s.trim()).filter(Boolean)
  : [];

const free = (s: string, f = ''): string => ((s && s.trim()) || f);

const required = ['id','title','status','priority','owner','labels','created'] as const;
const statusEnum = new Set(['open','doing','blocked','done','dropped']);
const priorityEnum = new Set(['low','medium','high','critical']);

const main = async () => {
  const files = await listFilesRec(TASKS_DIR, EXTS);
  const errors: string[] = [];
  for (const f of files) {
    const md = await readFile(f, 'utf8');
    let data: Record<string, unknown>;
    try {
      ({ data } = parseFrontmatter<Record<string, unknown>>(md));
    } catch (e) {
      errors.push(`${path.basename(f)}: ${String(e)}`);
      continue;
    }
    const fm: TaskFM = {
      id: free((data.id as unknown) as string),
      title: free((data.title as unknown) as string),
      status: free((data.status as unknown) as string),
      priority: free((data.priority as unknown) as string),
      owner: free((data.owner as unknown) as string),
      labels: rmap(data.labels),
      created: free((data.created as unknown) as string),
      updated: typeof (data as any).updated === 'string' ? (data as any).updated as string : undefined,
    };

    const base = path.basename(f, '.md');
    if (!base.startsWith(fm.id)) {
      errors.push(`${path.basename(f)}: filename should start with id '${fm.id}'`);
    }

    for (const k of required) {
      if ((fm as any)[k] === '' || (k === 'labels' && fm.labels.length === 0)) {
        errors.push(`${path.basename(f)}: missing required field '${k}'`);
      }
    }

    if (!statusEnum.has(String(fm.status))) errors.push(`${path.basename(f)}: invalid status '${fm.status}'`);
    if (!priorityEnum.has(String(fm.priority))) errors.push(`${path.basename(f)}: invalid priority '${fm.priority}'`);
    if (!Array.isArray(fm.labels)) errors.push(`${path.basename(f)}: 'labels' must be an array`);
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  } else {
    console.log(`Lint OK: ${files.length} task file(s)`);
  }
};

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
