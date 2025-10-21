import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { Project } from 'ts-morph';
export { sha1 } from '@promethean/utils';
import { getWorkspaceRoot } from './path-resolution.js';

export const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export const WORKSPACE_ROOT = getWorkspaceRoot();

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
  options: RunOptions & { timeout?: number } = {},
): Promise<RunResult> {
  const { ProcessWrapper } = await import('./timeout/process-wrapper.js');

  try {
    const result = await ProcessWrapper.execute(command, args, {
      cwd: options.cwd,
      env: options.env,
      timeout: options.timeout,
      validateCommand: true,
    });

    return {
      code: result.code,
      out: result.out,
      err: result.err,
    };
  } catch (error) {
    // Fallback to original implementation if wrapper fails
    console.warn('Process wrapper failed, falling back to original implementation:', error);

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
        stdout += String(chunk);
      });
      child.stderr?.on('data', (chunk) => {
        stderr += String(chunk);
      });
      child.on('error', (err) => {
        const message = String(err?.message ?? err);
        stderr = stderr ? `${stderr}\n${message}` : message;
        finalize(127);
      });
      child.on('close', finalize);
    });
  }
}

export function parseTsc(text: string) {
  // Matches: path/file.ts(12,34): error TS2345: Message...
  const re = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+([\s\S]+?)$/gm;
  const items: Array<{
    file: string;
    line: number;
    col: number;
    code: string;
    message: string;
  }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    items.push({
      file: m[1]!,
      line: Number(m[2]!),
      col: Number(m[3]!),
      code: m[4]!,
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
    const pad = (n: number) => String(n).padStart(String(end).length, ' ');
    return lines
      .slice(start - 1, end)
      .map((ln, i) => `${pad(start + i)} | ${ln}`)
      .join('\n');
  } catch {
    return '';
  }
}

export async function tsc(
  tsconfig: string,
  options?: { timeout?: number },
): Promise<{
  ok: boolean;
  text: string;
  diags: Array<{ file: string; line: number; col: number; code: string; message: string }>;
}> {
  const { globalTimeoutManager } = await import('./timeout/timeout-manager.js');
  const timeout = options?.timeout || globalTimeoutManager.getTimeout('tsc');

  try {
    const { withTimeout } = await import('./timeout/timeout-manager.js');

    return await withTimeout(
      'tsc',
      async () => {
        const { code, out, err } = await run(
          'npx',
          ['tsc', '-p', tsconfig, '--noEmit', '--pretty', 'false'],
          { timeout },
        );
        const text = out + '\n' + err;
        const diags = parseTsc(text);
        return { ok: code === 0, text, diags };
      },
      { tsconfig },
    );
  } catch (error) {
    // Fallback to original implementation if timeout wrapper fails
    console.warn('TSC timeout wrapper failed, falling back to original implementation:', error);

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
  // Create a temporary module with proper ts-morph resolution
  const snippetContent = await fs.readFile(snippetPath, 'utf8');

  // Replace ts-morph import with absolute path to ensure resolution
  const tsMorphAbsolutePath = path.resolve(
    WORKSPACE_ROOT,
    'node_modules/.pnpm/ts-morph@22.0.0/node_modules/ts-morph/dist/ts-morph.js',
  );
  const patchedContent = snippetContent.replace(
    /from ["']ts-morph["']/,
    `from "${tsMorphAbsolutePath}"`,
  );

  // Write patched version to temp file
  const tempPath = snippetPath + '.patched.mjs';
  await fs.writeFile(tempPath, patchedContent, 'utf8');

  try {
    const mod = await import(pathToFileURL(path.resolve(tempPath)).toString());
    if (typeof mod.apply !== 'function')
      throw new Error('snippet must export async function apply(project)');
    return mod.apply as (project: Project) => Promise<void>;
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function applySnippetToProject(tsconfigPath: string, snippetPath: string) {
  const project = new Project({ tsConfigFilePath: path.resolve(tsconfigPath) });
  const apply = await importSnippet(snippetPath);
  await apply(project);
  await project.save();
}

// TODO: Refactor all of these calls to ollama to use the ollama npm package.
// ...

export async function git(
  args: ReadonlyArray<string>,
  cwd = process.cwd(),
  options?: { timeout?: number },
): Promise<RunResult> {
  const { globalTimeoutManager } = await import('./timeout/timeout-manager.js');
  const timeout = options?.timeout || globalTimeoutManager.getTimeout('git');

  try {
    const { withTimeout } = await import('./timeout/timeout-manager.js');

    return await withTimeout(
      'git',
      async () => {
        const { code, out, err } = await run('git', args, { cwd, timeout });
        return { code, out: out.trim(), err: err.trim() };
      },
      { args, cwd },
    );
  } catch (error) {
    // Fallback to original implementation if timeout wrapper fails
    console.warn('Git timeout wrapper failed, falling back to original implementation:', error);

    const { code, out, err } = await run('git', args, { cwd });
    return { code, out: out.trim(), err: err.trim() };
  }
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

// Performance: Improved ollama integration using npm package with fallback
let ollamaPackage: any = null;
let ollamaPackageChecked = false;

async function initializeOllamaPackage() {
  if (ollamaPackageChecked) return ollamaPackage;
  ollamaPackageChecked = true;

  try {
    // Try to import the ollama package only if available
    const ollamaModule = await import('ollama').catch(() => null);
    if (ollamaModule) {
      ollamaPackage = ollamaModule.default;
      console.log('Using ollama npm package for improved performance');
    } else {
      ollamaPackage = false;
    }
  } catch (error) {
    console.warn('Ollama npm package not available, using HTTP fallback:', error);
    ollamaPackage = false;
  }

  return ollamaPackage;
}

export async function callOllama(
  model: string,
  prompt: string,
  options: {
    temperature?: number;
    schema?: object;
    system?: string;
    timeout?: number;
  } = {},
): Promise<unknown> {
  const { globalOllamaWrapper } = await import('./timeout/ollama-wrapper.js');

  try {
    const response = await globalOllamaWrapper.generateJSON(model, prompt, {
      temperature: options.temperature,
      system: options.system,
      schema: options.schema,
    });

    if (response.timedOut) {
      throw new Error(`Ollama call timed out after ${response.duration}ms`);
    }

    return response.data;
  } catch (error) {
    // Fallback to original implementation if wrapper fails
    console.warn('Ollama wrapper failed, falling back to original implementation:', error);

    const ollama = await initializeOllamaPackage();

    if (ollama && ollama !== false) {
      // Use npm package
      try {
        const response = await ollama.generate({
          model,
          prompt,
          system: options.system,
          format: options.schema ? 'json' : undefined,
          options: {
            temperature: options.temperature ?? 0,
          },
        });

        const raw = response.response;
        return JSON.parse(
          String(raw)
            .replace(/```json\s*/g, '')
            .replace(/```\s*$/g, '')
            .trim(),
        );
      } catch (error) {
        console.warn('Ollama npm package failed, falling back to HTTP:', error);
        // Fall back to HTTP implementation
      }
    }

    // Fallback to existing HTTP implementation via @promethean/utils
    const { ollamaJSON } = await import('@promethean/utils');
    return ollamaJSON(model, prompt, options);
  }
}

// Performance: Git-based snapshot management for faster rollbacks
export class GitSnapshotManager {
  private constructor(private readonly workdir: string) {}

  static async create(workdir: string): Promise<GitSnapshotManager | null> {
    try {
      // Check if we're in a git repo
      const { code } = await run('git', ['rev-parse', '--is-inside-work-tree'], { cwd: workdir });
      if (code !== 0) return null;

      return new GitSnapshotManager(workdir);
    } catch {
      return null;
    }
  }

  async createSnapshot(): Promise<string> {
    // Create a git stash with a unique message
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const stashMessage = `buildfix-snapshot-${timestamp}`;

    const { code } = await run('git', ['stash', 'push', '-m', stashMessage], { cwd: this.workdir });
    if (code !== 0) {
      throw new Error('Failed to create git stash snapshot');
    }

    // Get the stash ref for later restoration
    const { out } = await run(
      'git',
      ['stash', 'list', '--grep=^buildfix-snapshot-', '--format=%H'],
      { cwd: this.workdir },
    );
    const lines = out.trim().split('\n');
    const latestStash = lines[0];

    if (!latestStash) {
      throw new Error('Failed to retrieve stash reference');
    }

    return latestStash;
  }

  async restoreSnapshot(stashRef: string): Promise<void> {
    // Restore from the specific stash
    const { code } = await run('git', ['stash', 'pop', stashRef], { cwd: this.workdir });
    if (code !== 0) {
      throw new Error(`Failed to restore from stash ${stashRef}`);
    }
  }

  async cleanup(): Promise<void> {
    // No specific cleanup needed for git-based snapshots
    // Stashes are automatically removed when restored
  }
}

export async function createGitSnapshotManager(
  workdir: string,
): Promise<GitSnapshotManager | null> {
  return GitSnapshotManager.create(workdir);
}
