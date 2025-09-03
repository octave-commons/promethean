// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import { parseArgs } from "./utils.js";
import type { GapMap } from "./types.js";

const args = parseArgs({
  "--gaps": ".cache/testgap/gaps.json",
  "--out": "docs/agile/reports/test-gaps",
});

async function main() {
  const gaps = JSON.parse(
    await fs.readFile(path.resolve(args["--gaps"]), "utf-8"),
  ) as GapMap;
  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(args["--out"], `test-gaps-${ts}.md`);

  const rows = gaps.items
    .slice(0, 500)
    .map(
      (i) =>
        `| ${i.symbol.pkg} | ${i.symbol.kind} | \`${i.symbol.name}\` | ${
          i.symbol.file
        }:${i.symbol.startLine} | ${(i.ratio * 100).toFixed(
          0,
        )}% | ${i.reasons.join("; ")} |`,
    );

  const md = [
    "# Test gap report",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "| Package | Kind | Symbol | Location | Coverage | Notes |",
    "|---|---|---|---|---:|---|",
    ...rows,
    "",
  ].join("\n");

  await fs.writeFile(out, md, "utf-8");
  await fs.writeFile(
    path.join(args["--out"], "README.md"),
    `# Test gap reports\n\n- [Latest](${path.basename(out)})\n`,
    "utf-8",
  );
  console.log(`testgap: report → ${path.relative(process.cwd(), out)}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
