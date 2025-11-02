import { promises as fs } from "fs";
import * as path from "path";

import { z } from "zod";
import { ollamaJSON } from "@promethean-os/utils";

import { parseArgs, writeJSON, randomUUID } from "./utils.js";
import type {
  ScanOutput,
  ClassesFile,
  GroupsFile,
  PlanFile,
  PlanRecipe,
} from "./types.js";

const args = parseArgs({
  "--scan": ".cache/cookbook/blocks.json",
  "--classes": ".cache/cookbook/classes.json",
  "--groups": ".cache/cookbook/groups.json",
  "--out": ".cache/cookbook/plan.json",
  "--llm": "qwen3:4b",
} as const);

const RecipeSchema = z.object({
  title: z.string().min(1),
  problem: z.string().min(1),
  runtime: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  estimated_time: z.string().min(1),
  ingredients: z.array(z.string()).min(1),
  steps: z.array(z.string()).min(2),
  code_lang: z.string().min(1),
  code: z.string().min(1),
  see_also: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

async function main() {
  const scan = JSON.parse(
    await fs.readFile(path.resolve(args["--scan"]), "utf-8"),
  ) as ScanOutput;
  const classes = JSON.parse(
    await fs.readFile(path.resolve(args["--classes"]), "utf-8"),
  ) as ClassesFile;
  const groups = JSON.parse(
    await fs.readFile(path.resolve(args["--groups"]), "utf-8"),
  ) as GroupsFile;

  const byId = new Map(scan.blocks.map((b) => [b.id, b]));
  const outGroups: Record<string, PlanRecipe[]> = {};

  for (const g of groups.groups) {
    const firstId = g.blockIds[0]!;
    const sample = byId.get(firstId)!;
    const meta = classes.classes[firstId]!;
    const sys = [
      "You produce runnable, task-oriented cookbook recipes.",
      "Return ONLY JSON with keys:",
      "title, problem, runtime, difficulty(easy|medium|hard), estimated_time('5m'..), ingredients[], steps[], code_lang, code, see_also[], tags[]",
    ].join("\n");

    const exemplars = g.blockIds
      .slice(0, 3)
      .map((id) => {
        const b = byId.get(id)!;
        return `### ${b.lang} from ${b.file}\n${b.code.slice(0, 800)}`;
      })
      .join("\n\n");

    let obj: unknown;
    try {
      obj = await ollamaJSON(
        args["--llm"],
        `SYSTEM:\n${sys}\n\nUSER:\nTASK=${meta.task}\nRUNTIME=${meta.runtime}\nLANG=${meta.language}\n\nEXAMPLES:\n${exemplars}`,
      );
    } catch {
      obj = {
        title: `${meta.language} ${meta.task} recipe`,
        problem: `How to ${meta.task} with ${meta.runtime}.`,
        runtime: meta.runtime,
        difficulty: "easy",
        estimated_time: "5m",
        ingredients: [
          meta.runtime.includes("node") ? "@promethean-os/piper" : "bash",
        ],
        steps: ["Follow the code block", "Adjust paths as needed"],
        code_lang: meta.language || "bash",
        code: sample.code,
        see_also: [],
        tags: [meta.task, meta.language],
      };
    }

    const parsed = RecipeSchema.safeParse(obj);
    const recipe: z.infer<typeof RecipeSchema> = parsed.success
      ? parsed.data
      : ({
          title: `${meta.language} ${meta.task} recipe`,
          problem: `How to ${meta.task}.`,
          runtime: meta.runtime,
          difficulty: "easy",
          estimated_time: "5m",
          ingredients: ["bash"],
          steps: ["Run the code"],
          code_lang: meta.language || "bash",
          code: sample.code,
          see_also: [],
          tags: [meta.task],
        } satisfies z.infer<typeof RecipeSchema>);

    const pr: PlanRecipe = { uuid: randomUUID(), task: meta.task, ...recipe };
    (outGroups[g.key] ||= []).push(pr);
  }

  const plan: PlanFile = {
    plannedAt: new Date().toISOString(),
    groups: outGroups,
  };
  await writeJSON(path.resolve(args["--out"]), plan);
  console.log(
    `cookbook: planned ${Object.values(outGroups).reduce(
      (a, b) => a + b.length,
      0,
    )} recipes → ${args["--out"]}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
