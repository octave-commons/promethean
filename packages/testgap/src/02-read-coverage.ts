import * as path from "path";
import { promises as fs } from "fs";

import { globby } from "globby";
import { parseArgs } from "@promethean/utils";
import { relFromRepo } from "@promethean/utils";

import { writeJSON } from "./utils.js";
import type { CoverageIndex, FileCoverage } from "./types.js";

const args = parseArgs({
  "--lcov-globs": "{coverage/lcov.info,packages/**/coverage/lcov.info}",
  "--out": ".cache/testgap/coverage.json",
});

function parseLCOV(raw: string): FileCoverage[] {
  const out: FileCoverage[] = [];
  const blocks = raw.split("end_of_record");
  for (const b of blocks) {
    const lines = b.trim().split(/\r?\n/);
    if (!lines.length) continue;
    let file = "",
      total = 0,
      covered = 0;
    const coveredLines: number[] = [];
    for (const line of lines) {
      if (line.startsWith("SF:")) {
        const filePath = line.slice(3).trim();
        // Only apply relFromRepo if it's an absolute path, otherwise use as-is
        file = path.isAbsolute(filePath) ? relFromRepo(filePath) : filePath;
      }
      if (line.startsWith("DA:")) {
        const [nStr, hitsStr] = line.slice(3).split(",");
        const n = Number(nStr),
          hits = Number(hitsStr);
        total++;
        if (hits > 0) {
          covered++;
          coveredLines.push(n);
        }
      }
    }
    if (file)
      out.push({
        file,
        linesTotal: total,
        linesCovered: covered,
        coveredLines,
      });
  }
  return out;
}

async function main() {
  const files = await globby(
    (args["--lcov-globs"] ?? "").split(",").map((s) => s.trim()),
  );
  const idx: CoverageIndex = {
    collectedAt: new Date().toISOString(),
    files: {},
  };
  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    for (const fc of parseLCOV(raw)) idx.files[fc.file] = fc;
  }
  const outPath = path.resolve(args["--out"] ?? ".cache/testgap/coverage.json");
  await writeJSON(outPath, idx);
  console.log(
    `testgap: coverage → ${args["--out"] ?? ".cache/testgap/coverage.json"} (${
      Object.keys(idx.files).length
    } files)`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
