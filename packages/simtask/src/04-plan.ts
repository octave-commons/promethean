/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import { z } from "zod";
import { parseArgs, OLLAMA_URL } from "./utils.js";
import type { ScanResult, Cluster, Plan } from "./types.js";

const args = parseArgs({
  "--scan": ".cache/simtasks/functions.json",
  "--clusters": ".cache/simtasks/clusters.json",
  "--out": ".cache/simtasks/plans.json",
  "--model": "qwen3:4b",
  "--base-dir": "packages",
  "--force": "false"
});

const PlanSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  canonicalPath: z.string().min(1),
  canonicalName: z.string().min(1),
  proposedSignature: z.string().optional(),
  risks: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  acceptance: z.array(z.string()).optional()
});

async function ollamaJSON(model: string, prompt: string) {
  const res = await fetch(`${process.env.OLLAMA_URL ?? "http://localhost:11434"}/api/generate`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 }, format: "json" })
  });
  if (!res.ok) throw new Error(`ollama generate ${res.status}`);
  const data: any = await res.json();
  const raw = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
  const cleaned = raw.replace(/```json\s*/g,"").replace(/```\s*$/g,"").trim();
  return JSON.parse(cleaned);
}

async function main() {
  const SCAN = path.resolve(args["--scan"]);
  const CLS  = path.resolve(args["--clusters"]);
  const OUT  = path.resolve(args["--out"]);
  const model = args["--model"];
  const baseDir = args["--base-dir"];
  const force = args["--force"] === "true";

  const { functions }: ScanResult = JSON.parse(await fs.readFile(SCAN, "utf-8"));
  const clusters: Cluster[] = JSON.parse(await fs.readFile(CLS, "utf-8"));

  const byId = new Map(functions.map(f => [f.id, f]));
  const existing = await readJSON(OUT) as Record<string, Plan> | undefined || {};
  const plans: Record<string, Plan> = { ...existing };

  for (const c of clusters) {
    if (!force && plans[c.id]) continue;

    const members = c.memberIds.map(id => byId.get(id)!);
    const bullets = members.map((m, i) => [
      `### ITEM ${i+1}`,
      `NAME: ${m.className ? m.className + "." : ""}${m.name}`,
      `PACKAGE: ${m.pkgName}`,
      `FILE: ${m.fileRel}:${m.startLine}-${m.endLine}`,
      m.signature ? `SIGNATURE: ${m.signature}` : "",
      m.jsdoc ? `JSDOC:\n${m.jsdoc}` : "",
      `SNIPPET:\n${m.snippet.slice(0, 3000)}`
    ].filter(Boolean).join("\n")).join("\n\n");

    const sys = [
      "You are designing a consolidation refactor task for duplicate/similar functions.",
      "Return ONLY JSON with keys: title, summary, canonicalPath, canonicalName, proposedSignature?, risks?, steps?, acceptance?",
      `canonicalPath MUST be a POSIX path under '${baseDir}' and end with a reasonable filename (e.g., packages/libs/core/src/strings/format.ts).`,
      "Make steps actionable and incremental. Keep risks short. Acceptance criteria 3-7 bullets."
    ].join("\n");

    const prompt = `SYSTEM:\n${sys}\n\nUSER:\nCLUSTER ${c.id} (maxSim=${c.maxSim}, avgSim=${c.avgSim})\n\n${bullets}`;

    let obj: any;
    try { obj = await ollamaJSON(model, prompt); } catch (e) {
      obj = {
        title: `Consolidate similar functions (${c.id})`,
        summary: "Create a canonical implementation and replace callers.",
        canonicalPath: `${baseDir}/core/src/utility/${c.id}.ts`,
        canonicalName: "canonicalFunction",
        risks: ["behavior drift", "hidden callsites"],
        steps: ["create canonical file", "write tests", "migrate usages", "remove duplicates"],
        acceptance: ["all tests pass", "no duplicate definitions", "callers use canonical api"]
      };
    }

    const parsed = PlanSchema.safeParse(obj);
    const plan = parsed.success ? (obj as Plan) : {
      title: `Consolidate ${c.id}`,
      summary: "Consolidate similar functions into a single canonical implementation.",
      canonicalPath: `${baseDir}/core/src/${c.id}.ts`,
      canonicalName: "canonicalFunction"
    };

    plans[c.id] = { clusterId: c.id, ...plan };
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(plans, null, 2), "utf-8");
  console.log(`simtasks: planned ${Object.keys(plans).length} clusters -> ${path.relative(process.cwd(), OUT)}`);
}

async function readJSON(p: string): Promise<any | undefined> {
  try { return JSON.parse(await fs.readFile(p, "utf-8")); } catch { return undefined; }
}

main().catch((e) => { console.error(e); process.exit(1); });
