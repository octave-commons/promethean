import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listFilesRec } from '@promethean/utils/list-files-rec.js';
import { parseFrontmatter } from '@promethean/markdown/frontmatter.js';
import type { IndexedTask, TaskFM } from './types.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..', '..');

const TASKS_DIR = path.join(REPO, 'boards', 'tasks');
const INDEX_FILE = path.join(REPO, 'boards', 'index.json');

const EXTS = new Set(['.md']);

const rmap = <T>(v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]).map(s => String(s).trim()).filter(Boolean)
  : typeof v === 'string' ? String(v).split(',').map(s => s.trim()).filter(Boolean)
  : [];

const free = (s: string, f = ''): string => ((s && s.trim()) || f);

const normalizeTask = (data: Record<string, unknown>, filePath: string): IndexedTask => {
  const id = free((data.id as unknown) as string);
  const title = free((data.title as unknown) as string, path.basename(filePath, ".md"));
  const status = free((data.status as unknown) as string);
  const priority = free((data.priority as unknown) as string);
  const owner = free((data.owner as unknown) as string);
  const labels = rmap(data.labels);
  const created = free((data.created as unknown) as string);
  const updated = free(((data as any).updated as unknown) as string);
  const rel = path.relative(REPO, filePath);
  const base: TaskFM = { id, title, status, priority, owner, labels, created };
  const fm: TaskFM = updated ? { ...base, updated } : base;
  return { ...fm, path: rel } as IndexedTask;
};

const indexTasks = async (): Promise<IndexedTask[]> => {
  const files = await listFilesRec(TASKS_DIR, EXTS);
  const tasks = await Promise.all(files.map(async io => readFile(io, 'utf8')
    .then(raw => parseFrontmatter<Record<string, unknown>>(raw).data)
    .then(d => normalizeTask(d, io))));
  return tasks.sort((a, b) => a.id.localeCompare(b.id));
};

const main = async () => {
  const args = new Set(process.argv.slice(2));
  const write = args.has('--write');
  const tasks = await indexTasks();
  const lines = tasks.map(t => JSON.stringify(t));
  if (write) {
    await writeFile(INDEX_FILE, lines.join('\n') + '\n', 'utf8');
    console.log(`Wrote ${tasks.length} tasks to boards/index.json`);
  } else {
    lines.forEach(l => console.log(l));
  }
};

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
