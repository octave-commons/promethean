import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IndexedTask, TaskFM } from './types.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..', '..');

const TASKS_DIR = path.join(REPO, 'boards', 'tasks');
const INDEX_FILE = path.join(REPO, 'boards', 'index.jsonl');

const parseFrontMatter = async (md: string): Promise<TaskFM> => {
  const fm = md.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) throw new Error('No front-matter found');
  const raw = fm[1];
  try {
    const { default: YAML } = await import('yaml');
    return YAML.parse(raw) as TaskFM;
  } catch {
    const obj: any = {};
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^([^:#]+):\s*(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      const val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        obj[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      } else if (val.startsWith('"') && val.endsWith('"')) {
        obj[key] = val.slice(1, -1);
      } else if (val === 'true' || val === 'false') {
        obj[key] = val === 'true';
      } else {
        obj[key] = val;
      }
    }
    return obj as TaskFM;
  }
};

const walk = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? await walk(p) : [p];
  }));
  return files.flat().filter(f => f.endsWith('.md'));
};

const indexTasks = async (): Promise<IndexedTask[]> => {
  const files = await walk(TASKS_DIR);
  const tasks = await Promise.all(files.map(async f => {
    const md = await readFile(f, 'utf8');
    const fm = await parseFrontMatter(md);
    return { ...fm, path: path.relative(REPO, f) } as IndexedTask;
  }));
  return tasks.sort((a, b) => a.id.localeCompare(b.id));
};

const main = async () => {
  const args = new Set(process.argv.slice(2));
  const write = args.has('--write');
  const tasks = await indexTasks();
  const lines = tasks.map(t => JSON.stringify(t));
  if (write) {
    await writeFile(INDEX_FILE, lines.join('\n') + '\n', 'utf8');
    console.log(`Wrote ${tasks.length} tasks to boards/index.jsonl`);
  } else {
    lines.forEach(l => console.log(l));
  }
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
