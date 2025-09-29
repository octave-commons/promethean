import { promises as fs } from "fs";
import * as path from "path";

import { parseArgs, writeText } from "./utils.js";
import type { RunResultsFile, VerifyFile } from "./types.js";

const escapeTableCell = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

const wrapInlineCode = (value: string) => {
  const normalized = value.replace(/\r?\n/g, " ");
  const longestBacktickSequence =
    normalized
      .match(/`+/g)
      ?.reduce((length, sequence) => Math.max(length, sequence.length), 0) ?? 0;
  const delimiter = "`".repeat(longestBacktickSequence + 1);
  const needsPadding =
    delimiter.length > 1 &&
    (normalized.startsWith("`") || normalized.endsWith("`"));
  const content = needsPadding ? ` ${normalized} ` : normalized;
  return `${delimiter}${content}${delimiter}`;
};

const args = parseArgs({
  "--runs": ".cache/cookbook/run-results.json",
  "--verify": ".cache/cookbook/verify.json",
  "--out": "docs/agile/reports/cookbook",
} as const);

async function main() {
  const runs = JSON.parse(
    await fs.readFile(path.resolve(args["--runs"]), "utf-8"),
  ) as RunResultsFile;
  const verify = JSON.parse(
    await fs.readFile(path.resolve(args["--verify"]), "utf-8"),
  ) as VerifyFile;

  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(args["--out"], `cookbook-${ts}.md`);

  const rows = runs.results.map((r) => {
    const v = verify.items.find((i) => i.recipePath === r.recipePath);
    const status = r.ok
      ? v?.ok
        ? "OK"
        : "HASH MISMATCH"
      : `FAIL(${r.exitCode})`;
    const stderrPreview = (r.stderrPreview || "").slice(0, 80);
    return `| ${escapeTableCell(status)} | ${escapeTableCell(
      r.recipePath,
    )} | ${wrapInlineCode(v?.expected ?? "")} | ${wrapInlineCode(
      r.stdoutHash ?? "",
    )} | ${escapeTableCell(stderrPreview)} |`;
  });

  const md = [
    "# Cookbook report",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "| Status | Recipe | Expected | Actual | stderr preview |",
    "|---|---|---|---|---|",
    ...rows,
    "",
  ].join("\n");

  await writeText(out, md);
  await writeText(
    path.join(args["--out"], "README.md"),
    `# Cookbook Reports\n\n- [Latest](${path.basename(out)})\n`,
  );
  console.log(`cookbook: report → ${path.relative(process.cwd(), out)}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
