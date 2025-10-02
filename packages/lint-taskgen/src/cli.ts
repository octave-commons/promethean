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
