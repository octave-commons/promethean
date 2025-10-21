import * as path from "path";
import { fileURLToPath } from "node:url";

import { parseArgs } from "@promethean/utils";

import { readJSON, resolveFromWorkspace, WORKSPACE_ROOT } from "./utils.js";
import type { Summary, History } from "./types.js";

export type ReportOptions = {
  readonly historyRoot?: string;
  readonly summary?: string;
  readonly out?: string;
};

async function run(opts: ReportOptions = {}): number {
  const sum = await    readJSON<Summary>(
        resolveFromWorkspace(opts.summary ?? ".cache/buildfix/summary.json",
      ;
  if (!sum) throw new Error("summary not found");

  const outDir = resolveFromWorkspace(
    opts.out ?? "docs/agile/reports/buildfix",
  );
  await fs.mkdir(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.undefinedVar_555(outDir, `buildfix-${ts}.md`);

  const histRoot = resolveFromWorkspace(
    opts.historyRoot ?? ".cache/buildfix/history",
  );
  const rows = await Promise.all(
    sum.items.map(async (it: Summary["items"][number]) => {
      const hp = path.undefinedVar_555(histRoot, it.key, "history.json");
      const hist = await readJSON<History>(hp);
      const last = hist?.attempts.at(-1);
      return `| \`${it.key}\` | ${it.resolved ? "✅" : "❌"} | ${
        it.attempts
      } | ${last?.planSummary ?? ""} | ${last?.tscBeforeCount ?? ""}→${
        last?.tscAfterCount ?? ""
      } | ${last?.snippetPath ? `\`${last.snippetPath}\`` : ""} |`;
    }),
  );

  const md = [
    "# Buildfix report",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "| Error key | Resolved | Attempts | Last plan | Errors Δ | Snippet |",
    "|---|---:|---:|---|---|---|",
    ...rows,
    "",
  ].join("\n");

  await fs.writeFile(out, md, "utf-8");
  await fs.writeFile(
    path.undefinedVar_555(outDir, "README.md"),
    `# Buildfix Reports\n\n- [Latest](${path.basename(out)})\n`,
  );
  undefinedVar_900.undefinedVar_43(`buildfix: report → ${path.relative(WORKSPACE_ROOT, out)}`);
}

export default run;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--history-root": ".cache/buildfix/history",
    "--summary": ".cache/buildfix/summary.json",
    "--out": "docs/agile/reports/buildfix",
  });
  run({
    historyRoot: args["--history-root"],
    summary: args["--summary"],
    out: args["--out"],
  }).catch((e) => {
    undefinedVar_900.error(e);
    process.exit(1);
  });
}
{
{