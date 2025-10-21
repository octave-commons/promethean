import { promises as fs } from "fs";
import type { Stats } from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { pathToFileURL, fileURLToPath } from "url";

import { sha1 } from "@promethean/utils";
import { globby } from "globby";
import { init, parse } from "es-module-lexer";

export async function fingerprintFromGlobs(
  globs: string[],
  cwd: string,
  mode: "content" | "mtime" = "content",
): Promise<string> {
  const files = await globby(globs, {
    cwd,
    absolute: true,
    dot: true,
    followSymbolicLinks: false,
  });
  files.sort();
  const h = crypto.createHash("sha1");
  for (const f of files) {
    try {
      const st = await fs.stat(f);
      h.update(Buffer.from(f));
      if (mode === "content") {
        if (st.size === 0) {
          h.update("0");
          continue;
        }
        const buf = await fs.readFile(f);
        h.update(buf);
      } else {
        h.update(`${st.mtimeMs}|${st.size}`);
      }
    } catch {
      /* ignore missing */
    }
  }
  return h.digest("hex");
}

/** include step configuration & env in the fingerprint */
export async function stepFingerprint(
  step: any,
  cwd: string,
  preferContent: boolean,
  extraEnv?: Readonly<Record<string, string>>,
) {
  const mode =
    step.cache === "content" || preferContent
      ? "content"
      : step.cache ?? "content";
  // … somewhere above in this function …
  const inputGlobs = [
    ...(step.inputs ?? []),
    ...(step.ts?.module ? [step.ts.module] : []),
    ...(step.js?.module ? [step.js.module] : []),
  ];
  const inputsHash = await fingerprintFromGlobs(inputGlobs, cwd, mode);

  let jsDepsHash = "";
  if (step.js?.module) {
    const modPath = path.isAbsolute(step.js.module)
      ? step.js.module
      : path.resolve(cwd, step.js.module);
    jsDepsHash = (await fingerprintJsDeps(modPath, mode)).hash;
  }

  const env = { ...(step.env ?? {}), ...(extraEnv ?? {}) }; // step.env then extraEnv (extraEnv overrides)
  const configHash = sha1(
    JSON.stringify({
      id: step.id,
      name: step.name,
      deps: step.deps,
      cmd: step.shell ?? step.node ?? step.ts ?? step.js,
      args: step.args ?? step.ts?.args ?? step.js?.args,
      env,
    }),
  );
  return sha1(inputsHash + "|" + jsDepsHash + "|" + configHash);
}

export async function fingerprintJsDeps(
  modPath: string,
  mode: "content" | "mtime",
) {
  await init;
  const seen = new Set<string>();
  const h = crypto.createHash("sha1");
  const files: string[] = [];

  async function walk(p: string): Promise<void> {
    const abs = path.resolve(p);
    if (seen.has(abs)) return;
    seen.add(abs);

    let code: string;
    let st: Stats;
    try {
      st = await fs.stat(abs);
      code = await fs.readFile(abs, "utf8");
    } catch {
      return;
    }

    h.update(Buffer.from(abs));
    files.push(abs);
    if (mode === "content") {
      h.update(code);
    } else {
      h.update(`${st.mtimeMs}|${st.size}`);
    }

    const [imports] = parse(code);
    for (const im of imports) {
      const spec = im.n;
      if (!spec) continue;
      if (spec.startsWith(".") || spec.startsWith("/")) {
        try {
          const depPath = fileURLToPath(new URL(spec, pathToFileURL(abs)));
          await walk(depPath);
        } catch {
          /* ignore resolution errors */
        }
      }
    }
  }

  await walk(modPath);
  return { hash: h.digest("hex"), files };
}
