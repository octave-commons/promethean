import * as path from "path";
import { promises as fs } from "fs";

import { z } from "zod";

import { parseArgs, writeJSON, ollamaJSON } from "./utils.js";
import type { PlansFile, ApiChange } from "./types.js";

const args = parseArgs({
  "--diff": ".cache/semverguard/diff.json",
  "--out": ".cache/semverguard/plans.json",
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
  const diffPath = path.resolve(
    args["--diff"] ?? ".cache/semverguard/diff.json",
  );
  const diff = JSON.parse(await fs.readFile(diffPath, "utf-8")) as {
    results: Record<string, { required: any; changes: ApiChange[] }>;
  };

  const packages: PlansFile["packages"] = {};
  for (const [pkg, res] of Object.entries(diff.results)) {
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

    packages[pkg] = {
      required: res.required,
      changes: res.changes,
      task: {
        ...task,
        labels: Array.from(
          new Set([...(task.labels ?? []), "semver", "release"]),
        ),
      },
    };
  }

  const out: PlansFile = { plannedAt: new Date().toISOString(), packages };
  const outPath = path.resolve(
    args["--out"] ?? ".cache/semverguard/plans.json",
  );
  await writeJSON(outPath, out);
  console.log(
    `semverguard: plans → ${args["--out"] ?? ".cache/semverguard/plans.json"}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
