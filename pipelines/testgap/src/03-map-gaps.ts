import * as path from "path";
import { promises as fs } from "fs";

import { parseArgs } from "@promethean-os/utils";

import { writeJSON } from "./utils.js";
import type { ExportScan, CoverageIndex, GapMap, GapItem } from "./types.ts";

const args = parseArgs({
  "--exports": ".cache/testgap/exports.json",
  "--coverage": ".cache/testgap/coverage.json",
  "--min-lines": "3",
  "--out": ".cache/testgap/gaps.json",
});

function severityFor(ratio: number): "high" | "med" | "low" {
  if (ratio === 0) return "high";
  if (ratio < 0.5) return "med";
  return "low";
}

async function main() {
  const exp = JSON.parse(
    await fs.readFile(
      path.resolve(args["--exports"] ?? ".cache/testgap/exports.json"),
      "utf-8",
    ),
  ) as ExportScan;
  const cov = JSON.parse(
    await fs.readFile(
      path.resolve(args["--coverage"] ?? ".cache/testgap/coverage.json"),
      "utf-8",
    ),
  ) as CoverageIndex;
  const minLines = Number(args["--min-lines"] ?? "3");

  const items: GapItem[] = [];
  for (const s of exp.symbols) {
    const fc = cov.files[s.file];
    const total = Math.max(0, s.endLine - s.startLine + 1);
    if (total < minLines) continue; // ignore tiny exports like consts
    let covered = 0;
    if (fc) {
      for (let ln = s.startLine; ln <= s.endLine; ln++)
        if (fc.coveredLines.includes(ln)) covered++;
    }
    const ratio = total ? covered / total : 0;
    const reasons: string[] = [];
    if (!fc) reasons.push("file not in coverage");
    if (ratio === 0) reasons.push("exported API uncovered");
    if (ratio > 0 && ratio < 0.5) reasons.push("partially covered");

    items.push({
      symbol: s,
      covered,
      total,
      ratio,
      severity: severityFor(ratio),
      reasons,
    });
  }

  const out: GapMap = {
    mappedAt: new Date().toISOString(),
    items: items.sort((a, b) => a.ratio - b.ratio),
  };
  const outPath = path.resolve(args["--out"] ?? ".cache/testgap/gaps.json");
  await writeJSON(outPath, out);
  console.log(
    `testgap: mapped ${items.length} symbols → ${
      args["--out"] ?? ".cache/testgap/gaps.json"
    }`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
