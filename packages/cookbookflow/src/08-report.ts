/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import { parseArgs, writeText } from "./utils.js";
import type { RunResultsFile, VerifyFile } from "./types.js";

const args = parseArgs({
  "--runs": ".cache/cookbook/run-results.json",
  "--verify": ".cache/cookbook/verify.json",
  "--out": "docs/agile/reports/cookbook"
});

async function main() {
    const runs = JSON.parse(await fs.readFile(path.resolve(args["--runs"] ?? ""), "utf-8")) as RunResultsFile;
    const verify = JSON.parse(await fs.readFile(path.resolve(args["--verify"] ?? ""), "utf-8")) as VerifyFile;

    const outDir = path.resolve(args["--out"] ?? "docs/agile/reports/cookbook");
    await fs.mkdir(outDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const out = path.join(outDir, `cookbook-${ts}.md`);

  const rows = runs.results.map(r => {
    const v = verify.items.find(i => i.recipePath === r.recipePath);
    const status = r.ok ? (v?.ok ? "OK" : "HASH MISMATCH") : `FAIL(${r.exitCode})`;
    return `| ${status} | ${r.recipePath} | \`${(v?.expected??"")}\` | \`${(r.stdoutHash??"")}\` | ${ (r.stderrPreview||"").replace(/\|/g,"\\|").slice(0,80) } |`;
  });

  const md = [
    "# Cookbook report",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "| Status | Recipe | Expected | Actual | stderr preview |",
    "|---|---|---|---|---|",
    ...rows,
    ""
  ].join("\n");

    await writeText(out, md);
    await writeText(path.join(outDir, "README.md"), `# Cookbook Reports\n\n- [Latest](${path.basename(out)})\n`);
    console.log(`cookbook: report → ${path.relative(process.cwd(), out)}`);
}
main().catch(e => { console.error(e); process.exit(1); });
