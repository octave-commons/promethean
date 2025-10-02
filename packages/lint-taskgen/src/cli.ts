#!/usr/bin/env node
/**
 * @license GPL-3.0-only
 * lint-taskgen: Analyze ESLint JSON, emit buckets, and optionally write Kanban tasks.
 * Node >= 20 (uses built-in fetch). Native ESM.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { writeFile, readFile, mkdir, access } from 'node:fs/promises';
import process from 'node:process';

type Msg = { ruleId: string | null; line: number; column?: number; message?: string; severity?: 1 | 2 };
type Res = { filePath: string; messages: Msg[] };

const env = (k: string, d = '') => process.env[k] ?? d;
const args = new Map(process.argv.slice(2).map(s => { const [k,v] = s.startsWith('--') ? s.slice(2).split('=') : [s,'true']; return [k, v ?? 'true']; }));
const BOOL = (k: string) => args.get(k) === 'true';
const STR  = (k: string, d = '') => args.get(k) ?? d;
const INT  = (k: string, d = 0)  => Number(args.get(k) ?? d);

const USE_AFFECTED = BOOL('affected') || Boolean(env('NX_BASE') && env('NX_HEAD'));
const EMIT_KANBAN  = BOOL('emit-kanban');
const TASKS_DIR    = STR('tasks-dir', 'docs/agile/tasks');
const LIMIT        = INT('limit', 0);
const SCOPE        = STR('scope', '');

const run = (cmd: string[]): Promise<string> => new Promise((resolve, reject) => {
  const [bin, ...rest] = cmd;
  const c = spawn(bin, rest, { stdio: ['ignore','pipe','pipe'] });
  let out = '', err = '';
  c.stdout.on('data', d => out += String(d));
  c.stderr.on('data', d => err += String(d));
  c.on('close', code => {
    const ok = out.trim().startsWith('{') || out.trim().startsWith('[');
    if (ok) resolve(out); else if (code === 0) resolve(out); else reject(new Error(err || `exit ${code}`));
  });
});

const detectScope = (fp: string) => {
  const rel = path.relative(process.cwd(), fp).replaceAll('\\','/');
  const m = rel.match(/^(packages|apps)/([^/]+)/);
  return m ? `${m[1]}:${m[2]}` : 'root';
};

async function runESLintJson(): Promise<Res[]> {
  const cmd = USE_AFFECTED
    ? ['pnpm','exec','nx','affected','--target=lint','--plain','--','-f','json']
    : ['pnpm','exec','eslint','.', '-f','json'];
  const raw = await run(cmd);
  const s = raw.trim();
  const jsonStr = s.startsWith('{') ? '['+s+']' : s;
  return JSON.parse(jsonStr) as Res[];
}

function buildBuckets(results: Res[]) {
  const entries = results.flatMap(r => r.messages.filter(m => m.ruleId).map(m => ({ file: r.filePath, ruleId: String(m.ruleId), line: m.line })) );
  const map = new Map<string, { ruleId: string; scope: string; count: number; files: Set<string>; examples: string[] }>();
  for (const e of entries) {
    const scope = detectScope(e.file);
    const key = e.ruleId+'|'+scope;
    const hit = map.get(key) || { ruleId: e.ruleId, scope, count: 0, files: new Set(), examples: [] };
    hit.count++;
    hit.files.add(e.file);
    if (hit.examples.length < 10) hit.examples.push(path.relative(process.cwd(), e.file).replaceAll('\\','/')+':'+e.line);
    map.set(key, hit);
  }
  const buckets = Array.from(map.values()).map(b => ({ ruleId: b.ruleId, scope: b.scope, count: b.count, files: Array.from(b.files).length, examples: b.examples }))
    .sort((a,b) => b.count - a.count);
  const summary = { totalMessages: entries.length, bucketCount: buckets.length };
  return { summary, buckets } as const;
}

// --- Kanban emission (idempotent by slug) ---
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const NOW_ISO = () => new Date().toISOString();
const fm = (obj: Record<string, unknown>) => '---\n'+Object.entries(obj).map(([k,v]) => {
  if (k === 'labels' && Array.isArray(v)) return `${k}: [${(v as string[]).join(', ')}]`;
  return `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`;
}).join('\n')+'\n---\n\n';

async function fileExists(p: string) { try { await access(p); return true; } catch { return false; } }

async function emitKanbanTasks(buckets: Array<{ ruleId:string; scope:string; count:number; examples:string[] }>) {
  await mkdir(TASKS_DIR, { recursive: true });
  let created = 0;
  for (const b of buckets) {
    if (SCOPE && b.scope !== SCOPE) continue;
    if (LIMIT && created >= LIMIT) break;
    const title = `[Lint] ${b.ruleId} in ${b.scope}`;
    const slug = slugify(title);
    const file = path.join(TASKS_DIR, `${slug}.md`);
    if (await fileExists(file)) { continue; }
    const body = [
      `This task tracks remediation for **${b.ruleId}** across **${b.scope}**.`,
      '',
      '**Examples (seed)**',
      '```',
      ...(b.examples || []),
      '```',
      '',
      '**Plan**',
      '- Identify safe autofixes / codemods',
      '- Apply fixes incrementally (small PRs)',
      '- Add tests where behavior changes',
      '- Flip rule to error when < 10 hits',
    ].join('\n');
    const front = fm({
      uuid: String(Math.random().toString(36).slice(2))+Date.now(),
      title,
      status: 'Todo',
      priority: 'P3',
      labels: ['lint', b.ruleId, b.scope],
      created_at: NOW_ISO(),
      estimates: { complexity: null, scale: null, time_to_completion: null },
    });
    await writeFile(file, front + body + '\n', 'utf8');
    created++;
  }
  console.log(`kanban: created ${created} tasks in ${TASKS_DIR}`);
}

(async () => {
  const results = await runESLintJson();
  const { summary, buckets } = buildBuckets(results);
  await writeFile('eslint-taskgen-summary.json', JSON.stringify({ summary, buckets }, null, 2));
  console.log('Wrote eslint-taskgen-summary.json with', buckets.length, 'buckets');
  if (EMIT_KANBAN) { await emitKanbanTasks(buckets as any); }
})();
#!/usr/bin/env node
/**
 * @license GPL-3.0-only
 * lint-taskgen: Analyze ESLint JSON and output buckets (ruleId × scope) + examples.
 * Node >= 20 (uses built-in fetch). Native ESM.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import process from 'node:process';

type Msg = { ruleId: string | null; line: number; column?: number; message?: string; severity?: 1 | 2 };
type Res = { filePath: string; messages: Msg[] };

const env = (k: string, d = '') => process.env[k] ?? d;
const args = new Map(process.argv.slice(2).map(s => { const [k,v] = s.startsWith('--') ? s.slice(2).split('=') : [s,'true']; return [k, v ?? 'true']; }));
const BOOL = (k: string) => args.get(k) === 'true';
const STR  = (k: string, d = '') => args.get(k) ?? d;

const USE_AFFECTED = BOOL('affected') || Boolean(env('NX_BASE') && env('NX_HEAD'));

const run = (cmd: string[]): Promise<string> => new Promise((resolve, reject) => {
  const [bin, ...rest] = cmd;
  const c = spawn(bin, rest, { stdio: ['ignore','pipe','pipe'] });
  let out = '', err = '';
  c.stdout.on('data', d => out += String(d));
  c.stderr.on('data', d => err += String(d));
  c.on('close', code => {
    const ok = out.trim().startsWith('{') || out.trim().startsWith('[');
    if (ok) resolve(out); else if (code === 0) resolve(out); else reject(new Error(err || `exit ${code}`));
  });
});

const detectScope = (fp: string) => {
  const rel = path.relative(process.cwd(), fp).replaceAll('\\','/');
  const m = rel.match(/^(packages|apps)/([^/]+)/);
  return m ? `${m[1]}:${m[2]}` : 'root';
};

(async () => {
  const cmd = USE_AFFECTED
    ? ['pnpm','exec','nx','affected','--target=lint','--plain','--','-f','json']
    : ['pnpm','exec','eslint','.', '-f','json'];
  const raw = await run(cmd);
  const s = raw.trim();
  const results = JSON.parse(s.startsWith('{') ? '['+s+']' : s) as Res[];
  const entries = results.flatMap(r => r.messages.filter(m => m.ruleId).map(m => ({ file: r.filePath, ruleId: String(m.ruleId), line: m.line })) );
  const map = new Map<string, { ruleId: string; scope: string; count: number; files: Set<string>; examples: string[] }>();
  for (const e of entries) {
    const scope = detectScope(e.file);
    const key = e.ruleId+'|'+scope;
    const hit = map.get(key) || { ruleId: e.ruleId, scope, count: 0, files: new Set(), examples: [] };
    hit.count++;
    hit.files.add(e.file);
    if (hit.examples.length < 10) hit.examples.push(path.relative(process.cwd(), e.file).replaceAll('\\','/')+':'+e.line);
    map.set(key, hit);
  }
  const buckets = Array.from(map.values()).map(b => ({ ruleId: b.ruleId, scope: b.scope, count: b.count, files: Array.from(b.files).length, examples: b.examples }))
    .sort((a,b) => b.count - a.count);
  const summary = { totalMessages: entries.length, bucketCount: buckets.length };
  await writeFile('eslint-taskgen-summary.json', JSON.stringify({ summary, buckets }, null, 2));
  console.log('Wrote eslint-taskgen-summary.json with', buckets.length, 'buckets');
})();
#!/usr/bin/env node
/**
 * @license GPL-3.0-only
 * lint-taskgen: Analyze ESLint JSON and output buckets (ruleId × scope) + examples.
 * Node >= 20 (uses built-in fetch). Native ESM.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import process from 'node:process';

type Msg = { ruleId: string | null; line: number; column?: number; message?: string; severity?: 1 | 2 };
type Res = { filePath: string; messages: Msg[] };

const env = (k: string, d = '') => process.env[k] ?? d;
const args = new Map(process.argv.slice(2).map(s => { const [k,v] = s.startsWith('--') ? s.slice(2).split('=') : [s,'true']; return [k, v ?? 'true']; }));
const BOOL = (k: string) => args.get(k) === 'true';
const STR  = (k: string, d = '') => args.get(k) ?? d;

const USE_AFFECTED = BOOL('affected') || Boolean(env('NX_BASE') && env('NX_HEAD'));

const run = (cmd: string[]): Promise<string> => new Promise((resolve, reject) => {
  const [bin, ...rest] = cmd;
  const c = spawn(bin, rest, { stdio: ['ignore','pipe','pipe'] });
  let out = '', err = '';
  c.stdout.on('data', d => out += String(d));
  c.stderr.on('data', d => err += String(d));
  c.on('close', code => {
    const ok = out.trim().startsWith('{') || out.trim().startsWith('[');
    if (ok) resolve(out); else if (code === 0) resolve(out); else reject(new Error(err || `exit ${code}`));
  });
});

const detectScope = (fp: string) => {
  const rel = path.relative(process.cwd(), fp).replaceAll('\\','/');
  const m = rel.match(/^(packages|apps)/([^/]+)/);
  return m ? `${m[1]}:${m[2]}` : 'root';
};

(async () => {
  const cmd = USE_AFFECTED
    ? ['pnpm','exec','nx','affected','--target=lint','--plain','--','-f','json']
    : ['pnpm','exec','eslint','.', '-f','json'];
  const raw = await run(cmd);
  const s = raw.trim();
  const results = JSON.parse(s.startsWith('{') ? '['+s+']' : s) as Res[];
  const entries = results.flatMap(r => r.messages.filter(m => m.ruleId).map(m => ({ file: r.filePath, ruleId: String(m.ruleId), line: m.line })) );
  const map = new Map<string, { ruleId: string; scope: string; count: number; files: Set<string>; examples: string[] }>();
  for (const e of entries) {
    const scope = detectScope(e.file);
    const key = e.ruleId+'|'+scope;
    const hit = map.get(key) || { ruleId: e.ruleId, scope, count: 0, files: new Set(), examples: [] };
    hit.count++;
    hit.files.add(e.file);
    if (hit.examples.length < 10) hit.examples.push(path.relative(process.cwd(), e.file).replaceAll('\\','/')+':'+e.line);
    map.set(key, hit);
  }
  const buckets = Array.from(map.values()).map(b => ({ ruleId: b.ruleId, scope: b.scope, count: b.count, files: Array.from(b.files).length, examples: b.examples }))
    .sort((a,b) => b.count - a.count);
  const summary = { totalMessages: entries.length, bucketCount: buckets.length };
  await writeFile('eslint-taskgen-summary.json', JSON.stringify({ summary, buckets }, null, 2));
  console.log('Wrote eslint-taskgen-summary.json with', buckets.length, 'buckets');
})();
