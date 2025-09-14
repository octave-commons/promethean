/* eslint-disable */
import { promises as fs } from "fs";
import * as path from "path";
import { execFile as _execFile } from "child_process";

import { randomUUID, slug, sha1 } from "@promethean/utils";

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

export { slug, sha1, randomUUID };

export async function execShell(cmd: string, args: string[], cwd: string) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve) => {
      const child = _execFile(
        cmd,
        args,
        { cwd, maxBuffer: 1024 * 1024 * 64, env: { ...process.env } },
        (err, stdout, stderr) => {
          resolve({
            code: err ? (err as any).code ?? 1 : 0,
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
