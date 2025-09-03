// SPDX-License-Identifier: GPL-3.0-only
import { exec as _exec } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Project } from "ts-morph";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(def: Record<string, string>) {
  const out = { ...def };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k.startsWith("--")) continue;
    const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
    out[k] = v;
  }
  return out;
}

export function sha1(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "h" + h.toString(16);
}

export async function run(
  cmd: string,
  cwd = process.cwd(),
): Promise<{ code: number | null; out: string; err: string }> {
  return new Promise((res) => {
    _exec(
      cmd,
      { cwd, maxBuffer: 1024 * 1024 * 64, env: { ...process.env } },
      (e, stdout, stderr) => {
        res({
          code: e ? (e as any).code ?? 1 : 0,
          out: String(stdout),
          err: String(stderr),
        });
      },
    );
  });
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
      file: m[1],
      line: Number(m[2]),
      col: Number(m[3]),
      code: m[4],
      message: m[5].trim(),
    });
  }
  return items;
}

export async function codeFrame(file: string, line: number, span = 3) {
  try {
    const raw = await fs.readFile(file, "utf-8");
    const lines = raw.split(/\r?\n/);
    const start = Math.max(1, line - span);
    const end = Math.min(lines.length, line + span);
    const pad = (n: number) => String(n).padStart(String(end).length, " ");
    return lines
      .slice(start - 1, end)
      .map((ln, i) => `${pad(start + i)} | ${ln}`)
      .join("\n");
  } catch {
    return "";
  }
}

export async function tsc(tsconfig: string) {
  const { code, out, err } = await run(
    `npx tsc -p ${tsconfig} --noEmit --pretty false`,
  );
  const text = out + "\n" + err;
  const diags = parseTsc(text);
  return { ok: code === 0, text, diags };
}

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function writeJSON(p: string, data: any) {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function readJSON<T>(p: string): Promise<T | undefined> {
  try {
    return JSON.parse(await fs.readFile(p, "utf-8"));
  } catch {
    return undefined;
  }
}

export async function importSnippet(snippetPath: string) {
  const mod = await import(pathToFileURL(path.resolve(snippetPath)).toString());
  if (typeof mod.apply !== "function")
    throw new Error("snippet must export async function apply(project)");
  return mod.apply as (project: Project) => Promise<void>;
}

export async function applySnippetToProject(
  tsconfigPath: string,
  snippetPath: string,
) {
  const project = new Project({ tsConfigFilePath: path.resolve(tsconfigPath) });
  const apply = await importSnippet(snippetPath);
  await apply(project);
  await project.save();
}

// TODO: Refactor all of these calls to ollama to use the ollama npm package.
export async function ollamaJSON(model: string, prompt: string) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0 },
      format: "json",
    }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data: any = await res.json();
  const raw =
    typeof data.response === "string"
      ? data.response
      : JSON.stringify(data.response);
  return JSON.parse(
    raw
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .trim(),
  );
}
// ...

export async function git(cmd: string, cwd = process.cwd()) {
  return new Promise<{ code: number | null; out: string; err: string }>(
    (resolve) => {
      _exec(
        `git ${cmd}`,
        { cwd, maxBuffer: 1024 * 1024 * 64, env: { ...process.env } },
        (e, stdout, stderr) => {
          resolve({
            code: e ? (e as any).code ?? 1 : 0,
            out: String(stdout).trim(),
            err: String(stderr).trim(),
          });
        },
      );
    },
  );
}

export async function isGitRepo() {
  const r = await git("rev-parse --is-inside-work-tree");
  return r.code === 0 && r.out === "true";
}

export function sanitizeBranch(s: string) {
  return s
    .replace(/[^a-zA-Z0-9._/-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
