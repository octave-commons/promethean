/* eslint-disable */
import { pathToFileURL } from "url";
import { z } from "zod";
import { ollamaJSON } from "@promethean/utils";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs, sha1, pathPrefix, severityToPriority } from "./utils.js";
import type { IssueBundle, PlanTask, SonarIssue } from "./types.js";

export type PlanOpts = {
  input: string;
  output: string;
  groupBy: string;
  prefixDepth: number;
  minGroup: number;
  model: string;
};

const TaskSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  labels: z.array(z.string()).optional(),
  steps: z.array(z.string()).min(1),
  acceptance: z.array(z.string()).min(1),
});

function bundleKey(i: SonarIssue, mode: string, depth: number) {
  const parts = i.component.split(":");
  const comp = (parts.length > 1 ? parts[1] : parts[0])!;
  const pref = pathPrefix(comp, depth);
  if (mode === "rule") return `rule:${i.rule}`;
  if (mode === "prefix") return `prefix:${pref}`;
  return `rule:${i.rule}|prefix:${pref}`;
}

function bundleTitle(k: string) {
  const parts = k
    .split("|")
    .map((p) => p.replace(/^rule:/, "Rule ").replace(/^prefix:/, "Path "));
  return parts.join(" • ");
}

export async function plan(opts: PlanOpts) {
  const inPath = opts.input;
  const outPath = opts.output;
  const model = opts.model;

  const issueCache = await openLevelCache<SonarIssue | { project: string }>({
    path: inPath,
  });
  const issues: SonarIssue[] = [];
  const meta = (await issueCache.get("__meta__")) as
    | { project: string }
    | undefined;
  for await (const [k, v] of issueCache.entries()) {
    if (k !== "__meta__") issues.push(v as SonarIssue);
  }
  await issueCache.close();
  const project = meta?.project ?? "";

  const depth = opts.prefixDepth;
  const mode = opts.groupBy;
  const groups = new Map<string, SonarIssue[]>();
  for (const it of issues) {
    const k = bundleKey(it, mode, depth);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(it);
  }

  const min = opts.minGroup;
  const bundles: IssueBundle[] = [];
  for (const [k, arr] of groups) {
    if (arr.length < min) continue;
    const sev = ["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "INFO"].find((s) =>
      arr.some((it) => it.severity === s),
    ) as any;
    bundles.push({
      id: sha1(k),
      title: bundleTitle(k),
      issues: arr,
      severityTop: sev,
      types: Array.from(new Set(arr.map((a) => a.type))),
      rule: k.includes("rule:")
        ? k
            .split("|")
            .find((x) => x.startsWith("rule:"))
            ?.slice(5)
        : undefined,
      prefix: k.includes("prefix:")
        ? k
            .split("|")
            .find((x) => x.startsWith("prefix:"))
            ?.slice(7)
        : undefined,
    });
  }

  const tasks: PlanTask[] = [];
  for (const b of bundles) {
    const bullets = b.issues
      .slice(0, 30)
      .map((i) => {
        const parts = i.component.split(":");
        const file = (parts.length > 1 ? parts[1] : parts[0])!;
        return `- [${i.severity}] ${i.type} ${i.rule} — ${file}${
          i.line ? ":" + i.line : ""
        } — ${i.message}`;
      })
      .join("\n");

    const sys = [
      "You are a senior tech lead creating a short, actionable engineering task from static analysis results.",
      "Return ONLY JSON with: title, summary, labels[], steps[], acceptance[]",
      "Keep the title crisp; steps 3-7 items; acceptance 3-7 bullets.",
      "Prefer consolidation tasks (shared fix patterns) over per-issue tasks.",
    ].join("\n");

    const user = [
      `PROJECT: ${project}`,
      `BUNDLE: ${b.title}  (severity=${b.severityTop}, types=${b.types.join(
        ",",
      )})`,
      b.rule ? `RULE: ${b.rule}` : "",
      b.prefix ? `PATH: ${b.prefix}` : "",
      "",
      "ISSUES:",
      bullets,
    ]
      .filter(Boolean)
      .join("\n");

    let obj: any;
    try {
      obj = await ollamaJSON(model, `SYSTEM:\n${sys}\n\nUSER:\n${user}`);
      const parsed = TaskSchema.safeParse(obj);
      if (!parsed.success) throw new Error("invalid LLM JSON");
    } catch {
      obj = {
        title: `[${b.severityTop}] ${b.title}`,
        summary: `Address ${b.issues.length} SonarQube finding(s) related to ${
          b.rule ?? b.types.join("/")
        }.`,
        labels: [
          "sonarqube",
          "quality",
          "refactor",
          (b.rule ?? "misc").toLowerCase(),
        ],
        steps: [
          "Identify a shared remediation pattern.",
          "Implement fix in smallest path slice (feature flag if risky).",
          "Add/adjust unit tests for affected files.",
          "Run Sonar scan locally and verify issues resolved.",
        ],
        acceptance: [
          "SonarQube shows 0 remaining issues for this bundle.",
          "All unit tests pass.",
          "No increase in code smells elsewhere.",
        ],
      };
    }

    const refs = b.issues.map((i) => {
      const parts = i.component.split(":");
      const file = (parts.length > 1 ? parts[1] : parts[0])!;
      return { key: i.key, file, line: i.line };
    });

    tasks.push({
      id: b.id,
      title: obj.title,
      summary: obj.summary,
      labels: Array.from(new Set([...(obj.labels ?? []), "sonarqube"])),
      steps: obj.steps,
      acceptance: obj.acceptance,
      priority: severityToPriority(b.severityTop),
      refs,
    });
  }

  const planCache = await openLevelCache<
    PlanTask | { project: string; plannedAt: string }
  >({
    path: outPath,
  });
  for await (const [k] of planCache.entries()) {
    await planCache.del(k);
  }
  await planCache.batch([
    {
      type: "put",
      key: "__meta__",
      value: { project, plannedAt: new Date().toISOString() },
    },
    ...tasks.map((t) => ({ type: "put" as const, key: t.id, value: t })),
  ]);
  await planCache.close();
  console.log(`sonarflow: planned ${tasks.length} tasks → ${outPath}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]!).href) {
  const args = parseArgs({
    "--in": ".cache/sonar/issues",
    "--out": ".cache/sonar/plans",
    "--group-by": "rule+prefix",
    "--prefix-depth": "2",
    "--min-group": "2",
    "--model": "qwen3:4b",
  });
  plan({
    input: String(args["--in"]),
    output: String(args["--out"]),
    groupBy: String(args["--group-by"]),
    prefixDepth: Number(args["--prefix-depth"]),
    minGroup: Number(args["--min-group"]),
    model: String(args["--model"]),
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export default plan;
