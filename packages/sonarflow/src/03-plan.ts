/* eslint-disable no-console */
import { z } from "zod";
import { parseArgs, writeJSON, sha1, pathPrefix, severityToPriority } from "./utils.js";
import type { FetchPayload, IssueBundle, PlanPayload, PlanTask, SonarIssue } from "./types.js";

const args = parseArgs({
  "--in": ".cache/sonar/issues.json",
  "--out": ".cache/sonar/plans.json",
  "--group-by": "rule+prefix",       // "rule" | "prefix" | "rule+prefix"
  "--prefix-depth": "2",
  "--min-group": "2",
  "--model": "qwen3:4b"
});

async function ollamaJSON(model: string, prompt: string): Promise<any> {
  const url = `${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/generate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
  });
  if (!res.ok) throw new Error(`ollama ${res.status}`);
  const data: any = await res.json();
  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
  return JSON.parse(raw.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim());
}

const TaskSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  labels: z.array(z.string()).optional(),
  steps: z.array(z.string()).min(1),
  acceptance: z.array(z.string()).min(1)
});

function bundleKey(i: SonarIssue, mode: string, depth: number) {
  const comp = i.component.includes(":") ? i.component.split(":")[1] : i.component;
  const pref = pathPrefix(comp, depth);
  if (mode === "rule") return `rule:${i.rule}`;
  if (mode === "prefix") return `prefix:${pref}`;
  return `rule:${i.rule}|prefix:${pref}`;
}

function bundleTitle(k: string) {
  const parts = k.split("|").map(p => p.replace(/^rule:/,"Rule ").replace(/^prefix:/,"Path "));
  return parts.join(" • ");
}

async function main() {
  const { issues, project } = JSON.parse(await (await fetch("file://" + process.cwd() + "/" + args["--in"])).text()) as FetchPayload;

  const depth = Number(args["--prefix-depth"]);
  const mode = args["--group-by"];
  const groups = new Map<string, SonarIssue[]>();
  for (const it of issues) {
    const k = bundleKey(it, mode, depth);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(it);
  }

  const min = Number(args["--min-group"]);
  const bundles: IssueBundle[] = [];
  for (const [k, arr] of groups) {
    if (arr.length < min) continue;
    const sev = ["BLOCKER","CRITICAL","MAJOR","MINOR","INFO"].find(s => arr.some(it => it.severity === s)) as any;
    bundles.push({
      id: sha1(k),
      title: bundleTitle(k),
      issues: arr,
      severityTop: sev,
      types: Array.from(new Set(arr.map(a => a.type))),
      rule: k.includes("rule:") ? k.split("|").find(x=>x.startsWith("rule:"))?.slice(5) : undefined,
      prefix: k.includes("prefix:") ? k.split("|").find(x=>x.startsWith("prefix:"))?.slice(7) : undefined
    });
  }

  const tasks: PlanTask[] = [];
  for (const b of bundles) {
    // Prepare compact context for LLM
    const bullets = b.issues.slice(0, 30).map(i => {
      const file = i.component.includes(":") ? i.component.split(":")[1] : i.component;
      return `- [${i.severity}] ${i.type} ${i.rule} — ${file}${i.line ? ":"+i.line : ""} — ${i.message}`;
    }).join("\n");

    const sys = [
      "You are a senior tech lead creating a short, actionable engineering task from static analysis results.",
      "Return ONLY JSON with: title, summary, labels[], steps[], acceptance[]",
      "Keep the title crisp; steps 3-7 items; acceptance 3-7 bullets.",
      "Prefer consolidation tasks (shared fix patterns) over per-issue tasks."
    ].join("\n");

    const user = [
      `PROJECT: ${project}`,
      `BUNDLE: ${b.title}  (severity=${b.severityTop}, types=${b.types.join(",")})`,
      b.rule ? `RULE: ${b.rule}` : "",
      b.prefix ? `PATH: ${b.prefix}` : "",
      "",
      "ISSUES:",
      bullets
    ].filter(Boolean).join("\n");

    let obj: any;
    try {
      obj = await ollamaJSON(args["--model"], `SYSTEM:\n${sys}\n\nUSER:\n${user}`);
      const parsed = TaskSchema.safeParse(obj);
      if (!parsed.success) throw new Error("invalid LLM JSON");
    } catch {
      // Fallback
      obj = {
        title: `[${b.severityTop}] ${b.title}`,
        summary: `Address ${b.issues.length} SonarQube finding(s) related to ${b.rule ?? b.types.join("/")}.`,
        labels: ["sonarqube","quality","refactor",(b.rule ?? "misc").toLowerCase()],
        steps: [
          "Identify a shared remediation pattern.",
          "Implement fix in smallest path slice (feature flag if risky).",
          "Add/adjust unit tests for affected files.",
          "Run Sonar scan locally and verify issues resolved."
        ],
        acceptance: [
          "SonarQube shows 0 remaining issues for this bundle.",
          "All unit tests pass.",
          "No increase in code smells elsewhere."
        ]
      };
    }

    const refs = b.issues.map(i => {
      const file = i.component.includes(":") ? i.component.split(":")[1] : i.component;
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
      refs
    });
  }

  const out: PlanPayload = { tasks, plannedAt: new Date().toISOString(), project };
  await writeJSON(args["--out"], out);
  console.log(`sonarflow: planned ${tasks.length} tasks → ${args["--out"]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
