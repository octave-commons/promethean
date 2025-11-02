import * as path from "path";
import { promises as fs } from "fs";

import { z } from "zod";
import { parseArgs } from "@promethean-os/utils";
import { ollamaJSON } from "@promethean-os/utils";

import { writeJSON } from "./utils.js";
import type { GapMap, CookbookCross, PlanFile, PlanTask } from "./types.js";

const args = parseArgs({
  "--gaps": ".cache/testgap/gaps.json",
  "--cookbook": ".cache/testgap/cookbook.json",
  "--out": ".cache/testgap/plans.json",
  "--model": "qwen3:4b",
  "--threshold": "0.5", // anything below -> task
  "--max-per-pkg": "15",
});

const TaskSchema = z.object({
  title: z.string(),
  summary: z.string(),
  steps: z.array(z.string()).min(2),
  acceptance: z.array(z.string()).min(2),
  labels: z.array(z.string()).optional(),
});

async function main() {
  const gaps = JSON.parse(
    await fs.readFile(
      path.resolve(args["--gaps"] ?? ".cache/testgap/gaps.json"),
      "utf-8",
    ),
  ) as GapMap;
  const cook = JSON.parse(
    await fs.readFile(
      path.resolve(args["--cookbook"] ?? ".cache/testgap/cookbook.json"),
      "utf-8",
    ),
  ) as CookbookCross;
  void cook;
  const threshold = Number(args["--threshold"] ?? "0.5");
  const maxPer = Number(args["--max-per-pkg"] ?? "15");

  const byPkg = new Map<string, typeof gaps.items>();
  for (const it of gaps.items.filter((i) => i.ratio < threshold)) {
    (
      byPkg.get(it.symbol.pkg) ??
      byPkg.set(it.symbol.pkg, []).get(it.symbol.pkg)!
    ).push(it);
  }

  const plan: PlanFile = { plannedAt: new Date().toISOString(), tasks: {} };

  for (const [pkg, items] of byPkg) {
    const top = items.slice(0, maxPer);
    const bullets = top
      .map(
        (i) =>
          `- ${i.symbol.kind} \`${i.symbol.name}\` in ${i.symbol.file}:${
            i.symbol.startLine
          }-${i.symbol.endLine} (coverage ${(i.ratio * 100).toFixed(0)}%)`,
      )
      .join("\n");
    const sys = [
      "You are a senior test engineer. Propose concise tasks to cover missing tests.",
      "Return ONLY JSON array of tasks, each with: title, summary, steps[], acceptance[], labels[]?",
    ].join("\n");
    const user = [
      `PACKAGE: ${pkg}`,
      "UNTITLED GAPS:",
      bullets,
      "",
      "Prefer grouping by file or feature; propose jest/vitest tests with examples.",
    ].join("\n");

    let tasks: PlanTask[] = [];
    try {
      const arr = await ollamaJSON(
        args["--model"] ?? "qwen3:4b",
        `SYSTEM:\n${sys}\n\nUSER:\n${user}`,
      );
      const parsed = z.array(TaskSchema).safeParse(arr);
      const clean = (parsed.success ? parsed.data : []).slice(0, 7);
      tasks = clean.map((t) => ({
        title: t.title,
        summary: t.summary,
        steps: t.steps,
        acceptance: t.acceptance,
        labels: Array.from(
          new Set([...(t.labels ?? []), "tests", "coverage", "test-gap"]),
        ),
        priority: "P2",
        refs: top.map((i) => ({
          file: i.symbol.file,
          line: i.symbol.startLine,
          sym: i.symbol.name,
        })),
      }));
    } catch {
      tasks = [
        {
          title: `Add tests for ${pkg} uncovered exports`,
          summary: "Write unit tests for uncovered exported functions/classes.",
          steps: [
            "Create or extend spec files",
            "Add cases for edge conditions",
            "Run coverage to confirm improvement",
          ],
          acceptance: ["Coverage increases for listed exports", "CI green"],
          labels: ["tests", "coverage", "test-gap"],
          priority: "P2",
          refs: top.map((i) => ({
            file: i.symbol.file,
            line: i.symbol.startLine,
            sym: i.symbol.name,
          })),
        },
      ];
    }
    plan.tasks[pkg] = tasks;
  }

  const outPath = path.resolve(args["--out"] ?? ".cache/testgap/plans.json");
  await writeJSON(outPath, plan);
  console.log(
    `testgap: planned tasks for ${
      Object.keys(plan.tasks).length
    } package(s) → ${args["--out"] ?? ".cache/testgap/plans.json"}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
