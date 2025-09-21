import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TaskFM } from './types.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..', '..');
const TASKS_DIR = path.join(REPO, 'boards', 'tasks');

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
      } else {
        obj[key] = val;
      }
    }
    return obj as TaskFM;
  }
};

const listTaskFiles = async (): Promise<string[]> => {
  const entries = await readdir(TASKS_DIR, { withFileTypes: true });
  return entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => path.join(TASKS_DIR, e.name));
};

const required = ['id','title','status','priority','owner','labels','created'] as const;
const statusEnum = new Set(['open','doing','blocked','done','dropped']);
const priorityEnum = new Set(['low','medium','high','critical']);

const main = async () => {
  const files = await listTaskFiles();
  const errors: string[] = [];
  for (const f of files) {
    const md = await readFile(f, 'utf8');
    let fm: TaskFM;
    try { fm = await parseFrontMatter(md); }
    catch (e) { errors.push(`${path.basename(f)}: ${String(e)}`); continue; }

    const base = path.basename(f, '.md');
    if (!base.startsWith(fm.id)) {
      errors.push(`${path.basename(f)}: filename should start with id '${fm.id}'`);
    }

    for (const k of required) {
      if ((fm as any)[k] === undefined || (fm as any)[k] === null) {
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
