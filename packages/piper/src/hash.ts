// SPDX-License-Identifier: GPL-3.0-only
import { promises as fs } from "fs";
import * as crypto from "crypto";
import * as path from "path";
import { globby } from "globby";

export function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

export async function fingerprintFromGlobs(
  globs: string[],
  cwd: string,
  mode: "content" | "mtime" = "content"
): Promise<string> {
  const files = await globby(globs, { cwd, absolute: true, dot: true, followSymbolicLinks: false });
  files.sort();
  const h = crypto.createHash("sha1");
  for (const f of files) {
    try {
      const st = await fs.stat(f);
      h.update(Buffer.from(f));
      if (mode === "content") {
        if (st.size === 0) { h.update("0"); continue; }
        const buf = await fs.readFile(f);
        h.update(buf);
      } else {
        h.update(`${st.mtimeMs}|${st.size}`);
      }
    } catch { /* ignore missing */ }
  }
  return h.digest("hex");
}

/** include step configuration & env in the fingerprint */
export async function stepFingerprint(
  step: any,
  cwd: string,
  preferContent: boolean
) {
  const mode = step.cache === "content" || preferContent ? "content" : (step.cache ?? "content");
  const inputsHash = await fingerprintFromGlobs(step.inputs ?? [], cwd, mode);
  const configHash = sha1(JSON.stringify({
    id: step.id,
    name: step.name,
    deps: step.deps,
    cmd: step.shell ?? step.node ?? step.ts,
    args: step.args ?? step.ts?.args,
    env: step.env
  }));
  return sha1(inputsHash + "|" + configHash);
}
