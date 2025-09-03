// SPDX-License-Identifier: GPL-3.0-only
import { execFile, execFileSync } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

export async function readFileSafe(p: string): Promise<string> {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return "";
  }
}

export function summarize(s: string, maxLen = 2000) {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + "\n... [truncated]";
}

export async function ripgrep(cwd: string, query: string): Promise<string> {
  return new Promise((resolve) => {
    const child = execFile(
      "rg",
      ["-n", "--hidden", "--glob", "!.git", query, "."],
      { cwd },
      (err: any, stdout: string | Buffer, stderr: string | Buffer) => {
        if (err) {
          resolve(`rg error: ${stderr?.toString() || err.message}`);
        } else {
          resolve(stdout?.toString() ?? "");
        }
      },
    );
    child.on("error", (e) => resolve(`rg spawn error: ${e.message}`));
  });
}

export async function runTests(
  pattern?: string,
): Promise<{ code: number; stdout: string; stderr: string }> {
  const cmd = (process.env.TEST_CMD || "pnpm -w test").split(" ");
  const flag = process.env.TEST_PATTERN_FLAG || "-m"; // AVA match flag
  const args = pattern ? cmd.slice(1).concat([flag, pattern]) : cmd.slice(1);
  return new Promise((resolve) => {
    const [file, ...rest] = cmd;
    const fileCmd = file || "pnpm";
    const child = execFile(
      fileCmd,
      rest.concat(args),
      { cwd: process.cwd() },
      (err: any, stdout: string | Buffer, stderr: string | Buffer) => {
        resolve({
          code: err ? (err as any).code ?? 1 : 0,
          stdout: stdout?.toString() ?? "",
          stderr: stderr?.toString() ?? "",
        });
      },
    );
    child.on("error", (e) =>
      resolve({ code: 1, stdout: "", stderr: (e as any).message }),
    );
  });
}

export async function applyPatch(
  repoRoot: string,
  diffText: string,
): Promise<{ ok: boolean; output: string }> {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "patch-"));
  const patchFile = path.join(tmp, "change.patch");
  await fs.writeFile(patchFile, diffText, "utf8");
  try {
    const out = execFileSync(
      "git",
      ["apply", "-3", "--whitespace=fix", patchFile],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    return { ok: true, output: out?.toString() ?? "applied" };
  } catch (e: any) {
    const msg =
      (e.stdout?.toString() || "") + (e.stderr?.toString() || e.message || "");
    return { ok: false, output: "git apply failed:\n" + msg };
  } finally {
    try {
      await fs.rm(tmp, { recursive: true, force: true });
    } catch {}
  }
}
