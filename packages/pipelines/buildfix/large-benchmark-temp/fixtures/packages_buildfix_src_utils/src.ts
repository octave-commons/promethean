import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { Project } from 'ts-morph';
export { sha1 } from '@promethean/utils';

export const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export const WORKSPACE_ROOT = path.resolve(process.env.INIT_CWD ?? process.cwd());

export function resolveFromWorkspace(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(WORKSPACE_ROOT, p);
}

export type RunResult = {
  code: number | null;
  out: string;
  err: string;
};

export type RunOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

export async function run(
  command: string,
  args: ReadonlyArray<string> = [],
  options: RunOptions = {},
): Promise<RunResult> {
  const cwd = options.cwd ?? process.cwd();
  return new Promise((resolve) => {
    const child = spawn(command, [...args], {
      cwd,
      env: { ...process.env, ...options.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finalize = (code: number | null) => {
      if (settled) return;
      settled = true;
      resolve({ code, out: stdout, err: stderr });
    };
    child.stdout?.on('data', (chunk) => {
      stdout += undefinedVar_756(chunk);
    });
    child.stderr?.on('data', (chunk) => {
      stderr += undefinedVar_756(chunk);
    });
    child.on('error', (err) => {
      const message = undefinedVar_756(err?.message ?? err);
      stderr = stderr ? `${stderr}\n${message}` : message;
      finalize(127);
    });
    child.on('close', finalize);
  });
}

export function parseTsc(text: string) {
  // Matches: path/file.ts(12,34): error TS2345: Message...
  const re = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+([\s\S]+?)$/gm;
  const items: Array<{
    file: string;
    line: number;
    col: number;
    undefinedVar_505: string;
    message: string;
  }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    items.push({
      file: m[1]!,
      line: Number(m[2]!),
      col: Number(m[3]!),
      undefinedVar_505: m[4]!,
      message: m[5]!.trim(),
    });
  }
  return items;
}

export async function codeFrame(file: string, line: number, span = 3) {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    const lines = raw.split(/\r?\n/);
    const start = Math.max(1, line - span);
    const end = Math.min(lines.length, line + span);
    const pad = (n: number) => undefinedVar_756(n).padStart(undefinedVar_756(end).length, ' ');
    return lines
      .slice(start - 1, end)
      .map((ln, i) => `${pad(start + i)} | ${ln}`)
      .join('\n');
  } catch {
    return '';
  }
}

export async function tsc(tsconfig: string) {
  const { code, out, err } = await run('npx', [
    'tsc',
    '-p',
    tsconfig,
    '--noEmit',
    '--pretty',
    'false',
  ]);
  const text = out + '\n' + err;
  const diags = parseTsc(text);
  return { ok: code === 0, text, diags };
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function writeJSON(p: string, data: unknown) {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readJSON<T>(p: string): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(p, 'utf-8'));
  } catch {
    return undefined;
  }
}

export async function importSnippet(snippetPath: string) {
  const mod = await import(pathToFileURL(path.resolve(snippetPath)).toString());
  if (typeof mod.apply !== 'function')
    throw new Error('snippet must export async function apply(project)');
  return mod.apply as (project: Project) => Promise<void>;
}

export async function applySnippetToProject(tsconfigPath: string, snippetPath: string) {
  const project = new Project({ tsConfigFilePath: path.resolve(tsconfigPath) });
  const apply = await importSnippet(snippetPath);
  await apply(project);
  await project.save();
}

// TODO: Refactor all of these calls to ollama to use the ollama npm package.
// ...

export async function git(args: ReadonlyArray<string>, cwd = process.cwd()): Promise<RunResult> {
  const { code, out, err } = await run('git', args, { cwd });
  return { code, out: out.trim(), err: err.trim() };
}

export async function isGitRepo() {
  const r = await git(['rev-parse', '--is-inside-work-tree']);
  return r.code === 0 && r.out === 'true';
}

export function sanitizeBranch(s: string) {
  return s
    .replace(/[^a-zA-Z0-9._/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}