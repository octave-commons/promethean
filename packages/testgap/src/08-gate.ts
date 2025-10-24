import * as path from "path";
import { promises as fs } from "fs";

import { parseArgs } from "@promethean-os/utils";

import { writeJSON } from "./utils.js";

type GapItem = {
  symbol: {
    pkg: string;
    file: string;
    kind: string;
    name: string;
    startLine: number;
    endLine: number;
  };
  covered: number;
  total: number;
  ratio: number;
};

const args = parseArgs({
  "--gaps": ".cache/testgap/gaps.json",
  "--out": ".cache/testgap/gate.json",
  "--threshold": "0.70", // 70% default
  "--metric": "symbols", // symbols | lines
  "--min-lines": "3", // ignore exports with fewer lines than this (already filtered upstream, but kept here defensively)
});

function safePct(n: number) {
  return isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
}

async function main() {
  const threshold = Number(args["--threshold"] ?? "0.70");
  const metric = (args["--metric"] || "symbols").toLowerCase() as
    | "symbols"
    | "lines";
  const minLines = Number(args["--min-lines"] ?? "3");

  const gapsRaw = JSON.parse(
    await fs.readFile(
      path.resolve(args["--gaps"] ?? ".cache/testgap/gaps.json"),
      "utf-8",
    ),
  ) as { items: GapItem[] };
  const items = gapsRaw.items.filter((i) => i.total >= minLines);

  const byPkg = new Map<string, GapItem[]>();
  for (const it of items)
    (
      byPkg.get(it.symbol.pkg) ??
      byPkg.set(it.symbol.pkg, []).get(it.symbol.pkg)!
    ).push(it);

  const report: any = {
    threshold,
    metric,
    packages: {},
    failures: [] as string[],
    computedAt: new Date().toISOString(),
  };

  for (const [pkg, list] of byPkg) {
    if (!list.length) {
      report.packages[pkg] = {
        coverage: 1,
        pass: true,
        reason: "no-sized-exports",
      };
      continue;
    }

    let coverage = 0;
    if (metric === "symbols") {
      const total = list.length;
      const covered = list.filter((i) => i.ratio > 0).length;
      coverage = safePct(covered / total);
      report.packages[pkg] = {
        metric: "symbols",
        totalSymbols: total,
        coveredSymbols: covered,
        coverage,
        pass: coverage >= threshold,
      };
    } else {
      const total = list.reduce((a, b) => a + b.total, 0);
      const covered = list.reduce((a, b) => a + b.covered, 0);
      coverage = safePct(covered / Math.max(1, total));
      report.packages[pkg] = {
        metric: "lines",
        totalLines: total,
        coveredLines: covered,
        coverage,
        pass: coverage >= threshold,
      };
    }

    if (coverage < threshold) report.failures.push(pkg);
  }

  await writeJSON(
    path.resolve(args["--out"] ?? ".cache/testgap/gate.json"),
    report,
  );

  if (report.failures.length) {
    console.error(
      `testgap: gate FAILED for ${report.failures.length} package(s) ` +
        `below ${(threshold * 100).toFixed(
          0,
        )}% (${metric}). Failing: ${report.failures.join(", ")}`,
    );
    process.exit(1);
  } else {
    console.log(
      `testgap: gate PASSED — all packages ≥ ${(threshold * 100).toFixed(
        0,
      )}% (${metric}).`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
