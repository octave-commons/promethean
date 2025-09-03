// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import { globby } from "globby";
import matter from "gray-matter";
import { parseArgs, writeJSON, sha1, execShell } from "./utils.js";
import type { RunResultsFile } from "./types.js";

const args = parseArgs({
  "--root": "docs/cookbook",
  "--out": ".cache/cookbook/run-results.json",
  "--timeout": "0"
});

async function main() {
  const files = await globby([`${args["--root"].replace(/\\/g,"/")}/**/*.md`]);
  const results: RunResultsFile["results"] = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const body = gm.content;

    // pick the first code fence as the runnable snippet
    const m = body.match(/```(\w+)?[^\n]*\n([\s\S]*?)```/);
    if (!m) { results.push({ recipePath: f, ok: false, stdoutPreview: "", stderrPreview: "no code block found", exitCode: null }); continue; }

    const lang = (m[1]||"").toLowerCase();
    const code = m[2];

    // crude sandbox: create a temp dir under .cache/cookbook/run/<slug>
    const runDir = path.join(".cache/cookbook/run", path.basename(f, ".md"));
    await fs.mkdir(runDir, { recursive: true });

    let cmd = "";
    if (lang === "bash" || lang === "sh") {
      const sh = path.join(runDir, "run.sh");
      await fs.writeFile(sh, code, "utf-8");
      cmd = `bash ${path.relative(process.cwd(), sh)}`;
    } else if (lang === "ts" || lang === "typescript") {
      const ts = path.join(runDir, "run.ts");
      await fs.writeFile(ts, code, "utf-8");
      cmd = `npx tsx ${path.relative(process.cwd(), ts)}`;
    } else if (lang === "js" || lang === "javascript") {
      const js = path.join(runDir, "run.js");
      await fs.writeFile(js, code, "utf-8");
      cmd = `node ${path.relative(process.cwd(), js)}`;
    } else {
      results.push({ recipePath: f, ok: false, stderrPreview: `unsupported code lang: ${lang}`, exitCode: null });
      continue;
    }

    const r = await execShell(cmd, process.cwd());
    const stdoutHash = sha1(r.stdout || "");
    const stderrHash = sha1(r.stderr || "");
    results.push({
      recipePath: f,
      ok: (r.code === 0),
      exitCode: r.code,
      stdoutHash,
      stderrHash,
      stdoutPreview: (r.stdout || "").slice(0, 400),
      stderrPreview: (r.stderr || "").slice(0, 400)
    });
  }

  const out: RunResultsFile = { ranAt: new Date().toISOString(), results };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(`cookbook: executed ${results.length} recipe(s) → ${args["--out"]}`);
}
main().catch(e => { console.error(e); process.exit(1); });
