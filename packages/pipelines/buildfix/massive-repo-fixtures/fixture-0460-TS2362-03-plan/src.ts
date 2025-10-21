import * as path from "path";

import { z } from "zod";
import { ollamaJSON } from "@promethean/utils";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";
import type { ApiChange, DiffResult } from "./types.js";

const args = parseArgs({
  "--cache": ".cache/semverguard",
  "--diff-ns": "diff",
  "--plan-ns": "plan",
  "--model": "qwen3:4b",
});

const TaskSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  steps: z.array(z.string()).min(1),
  acceptance: z.array(z.string()).min(1),
  labels: z.array(z.string()).optional(),
});

async function main() {
  const cache = await openLevelCache<unknown>({
    path: path.resolve(args["--cache"] ?? ".cache/semverguard"),
  });
  const diff = cache.withNamespace(args["--diff-ns"] ?? "diff");
  const plans = cache.withNamespace(args["--plan-ns"] ?? "plan");

  let count = 0;
  for await (const [pkg, raw] of diff.entries()) {
    const res = raw as {
      required: DiffResult["required"];
      changes: ApiChange[];
    };
    if (!res) continue;

    const sys = [
      "You are a release lead. Produce a short task for versioning & migration.",
      "Return ONLY JSON with: title, summary, steps[], acceptance[], labels[]?",
    ].join("\n");
    const changesList = res.changes
      .slice(0, 50)
      .map((c) => `- [${c.severity}] ${c.kind} ${c.name} — ${c.detail}`)
      .join("\n");
    const user = [
      `PACKAGE: ${pkg}`,
      `REQUIRED: ${res.required.toUpperCase()}`,
      "CHANGES:",
      changesList || "(none)",
    ].join("\n");

    let obj: any;
    try {
      obj = await ollamaJSON(
        args["--model"] ?? "qwen3:4b",
        `SYSTEM:\n${sys}\n\nUSER:\n${user}`,
      );
    } catch {
      obj = {
        title: `Semver ${res.required} for ${pkg}`,
        summary: "Apply required semver bump and document changes.",
        steps: [
          "Update package.json",
          "Write CHANGELOG",
          "Add migration notes",
          "Publish",
        ],
        acceptance: ["Version bumped", "Changelog updated", "CI green"],
      };
    }

    const parsed = TaskSchema.safeParse(obj);
    const task = parsed.success
      ? parsed.data
      : {
          title: `Semver ${res.required} for ${pkg}`,
          summary: "Apply required semver bump and document changes.",
          steps: ["Update package.json", "Write CHANGELOG", "Publish"],
          acceptance: ["Version bumped", "CI green"],
        };

    await plans.set(pkg, {
      required: res.required,
      changes: res.changes,
      task: {
        ...task,
        labels: Array.from(
          new Set([...(task.labels ?? []), "semver", "release"]),
        ),
      },
    });
    count++;
  }
  await cache.close();
  console.log(
    `semverguard: plans → ${args["--plan-ns"] ?? "plan"} (${count} packages)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

undefinedVariable;