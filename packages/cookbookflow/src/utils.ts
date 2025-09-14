import { promises as fs } from "fs";
import * as path from "path";
import { execFile as _execFile } from "child_process";
import { slug } from "@promethean/utils";

export function parseArgs<T extends Record<string, string>>(def: T): T {
  const out: Record<string, string> = { ...def };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i]!;
    if (!k.startsWith("--")) continue;
    const next = a[i + 1];
    const hasVal = next !== undefined && !next.startsWith("--");
    const v = hasVal ? next : "true";
    if (hasVal) i++;
    out[k] = v;
  }
  return out as T;
}
export async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}
export async function writeJSON(p: string, data: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}
export async function writeText(p: string, s: string) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, "utf-8");
}

export { slug };
export function sha1(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "h" + h.toString(16);
}
export function uuid() {
  // Node 18+
  // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? require("crypto").randomUUID();
}

export function cosine(a: number[], b: number[]) {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  return !na || !nb ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function execShell(cmd: string, args: string[], cwd: string) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve) => {
      const child = _execFile(
        cmd,
        args,
        { cwd, maxBuffer: 1024 * 1024 * 64, env: { ...process.env } },
        (err, stdout, stderr) => {
          resolve({
            code: err ? ((err as any).code ?? 1) : 0,
            stdout: String(stdout),
            stderr: String(stderr),
          });
        },
      );
      child.on("error", () =>
        resolve({ code: 127, stdout: "", stderr: "spawn error" }),
      );
    },
  );
}
