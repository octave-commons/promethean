// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import { parseArgs, readJSON } from "./utils.js";
import type { Summary, History } from "./types.js";

const args = parseArgs({
  "--history-root": ".cache/buildfix/history",
  "--summary": ".cache/buildfix/summary.json",
  "--out": "docs/agile/reports/buildfix",
});

async function main() {
  const sum = await readJSON<Summary>(path.resolve(args["--summary"]));
  if (!sum) throw new Error("summary not found");

  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(args["--out"], `buildfix-${ts}.md`);

  const rows = await Promise.all(
    sum.items.map(async (it: { key: string; resolved: any; attempts: any }) => {
      const hp = path.join(args["--history-root"], it.key, "history.json");
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
    path.join(args["--out"], "README.md"),
    `# Buildfix Reports\n\n- [Latest](${path.basename(out)})\n`,
  );
  console.log(`buildfix: report → ${path.relative(process.cwd(), out)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
