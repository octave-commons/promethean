import { promises as fs } from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { pathToFileURL } from "url";

import matter from "gray-matter";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";
import type { Cluster, Plan, FunctionInfo } from "./types.js";

export type WriteArgs = {
  "--scan"?: string;
  "--clusters"?: string;
  "--plans"?: string;
  "--out"?: string;
  "--priority"?: string;
  "--status"?: string;
  "--label"?: string;
};

const START = "<!-- SIMTASKS:BEGIN -->";
const END = "<!-- SIMTASKS:END -->";

function stripGenerated(text: string) {
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}

function slug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mermaidForCluster(plan: Plan, members: FunctionInfo[]) {
  // package-level view: members' packages -> canonical target
  const pkgs = Array.from(new Set(members.map((m) => m.pkgName))).sort();
  const nodes = [`C["${escapeMd(plan.canonicalPath)}"]`].concat(
    pkgs.map((p, i) => `P${i + 1}["${escapeMd(p)}"]`),
  );
  const edges = pkgs.map((_, i) => `P${i + 1} --> C`);
  return [
    "```mermaid",
    "graph LR",
    `  ${nodes.join("\n  ")}`,
    `  ${edges.join("\n  ")}`,
    "```",
  ].join("\n");
}
function escapeMd(s: string) {
  // Leverage JSON string escaping to cover quotes, backslashes, and control chars.
  // Slice off the surrounding quotes to keep the inner escaped value.
  return JSON.stringify(s).slice(1, -1);
}

export async function writeTasks(args: WriteArgs) {
  const SCAN = path.resolve(args["--scan"] ?? ".cache/simtasks/functions");
  const CLS = path.resolve(
    args["--clusters"] ?? ".cache/simtasks/clusters.json",
  );
  const PLANS = path.resolve(args["--plans"] ?? ".cache/simtasks/plans.json");
  const OUT = path.resolve(args["--out"] ?? "docs/agile/tasks");
  const priority = args["--priority"] ?? "P2";
  const status = args["--status"] ?? "todo";
  const labels = (args["--label"] ?? "duplication,refactor,consolidation")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const fnCache = await openLevelCache<FunctionInfo[]>({ path: SCAN });
  const functions = (await fnCache.get("functions")) ?? [];
  await fnCache.close();
  const clusters: Cluster[] = JSON.parse(await fs.readFile(CLS, "utf-8"));
  const plans: Record<string, Plan> = JSON.parse(
    await fs.readFile(PLANS, "utf-8"),
  );

  const byId = new Map(functions.map((f) => [f.id, f]));
  await fs.mkdir(OUT, { recursive: true });

  const indexLines: string[] = ["# Consolidation Tasks", ""];
  for (const c of clusters) {
    const plan = plans[c.id];
    const members = c.memberIds
      .map((id) => byId.get(id)!)
      .sort((a, b) => a.pkgName.localeCompare(b.pkgName));

    const title = plan?.title ?? `Consolidate ${c.id}`;
    const fname = `${slug(title)}.md`;
    const outPath = path.join(OUT, fname);

    const fm = {
      uuid: cryptoRandomUUID(),
      title,
      cluster_id: c.id,
      cluster_size: members.length,
      similarity: { max: c.maxSim, avg: c.avgSim },
      priority,
      status,
      labels,
      created_at: new Date().toISOString(),
    };

    const tableLines = [
      "| Package | File | Name | Kind | Exported | Signature |",
      "|---|---|---|---|:---:|---|",
      ...members.map(
        (m) =>
          `| ${m.pkgName} | \`${m.fileRel}:${m.startLine}-${m.endLine}\` | \`${
            m.className ? m.className + "." : ""
          }${m.name}\` | ${m.kind} | ${m.exported ? "✓" : "—"} | ${
            m.signature ? `\`${m.signature}\`` : "_"
          } |`,
      ),
    ];

    const checklist =
      (plan?.acceptance ?? []).map((x) => `- [ ] ${x}`).join("\n") ||
      "- [ ] Canonical file created\n- [ ] Tests added\n- [ ] All callsites migrated\n- [ ] Duplicates removed";

    const mermaid = plan ? mermaidForCluster(plan, members) : "";

    const body = [
      START,
      `# ${title}`,
      "",
      plan?.summary ?? "_No summary provided._",
      "",
      "## Proposed canonicalization",
      "",
      plan?.canonicalPath ? `**Target file:** \`${plan.canonicalPath}\`` : "",
      plan?.canonicalName ? `**Function name:** \`${plan.canonicalName}\`` : "",
      plan?.proposedSignature
        ? `\n**Proposed signature:** \`${plan.proposedSignature}\`\n`
        : "",
      "",
      mermaid,
      "",
      "## Affected functions",
      "",
      ...tableLines,
      "",
      plan?.steps?.length
        ? "## Migration steps\n\n" + plan.steps.map((s) => `1. ${s}`).join("\n")
        : "",
      plan?.risks?.length
        ? "\n## Risks\n\n" + plan.risks.map((r) => `- ${r}`).join("\n")
        : "",
      "## Acceptance criteria",
      "",
      checklist,
      "",
      "## Notes",
      "",
      "_Add any investigation notes or decisions here._",
      END,
      "",
    ]
      .filter(Boolean)
      .join("\n");

    // Preserve anything above markers on re-run
    const existing = await readMaybe(outPath);
    const gm = existing ? matter(existing) : { content: "", data: {} };
    const preserved = stripGenerated(gm.content);
    const final = matter.stringify(
      (preserved ? preserved + "\n\n" : "") + body,
      { ...gm.data, ...fm },
      { language: "yaml" },
    );

    await fs.writeFile(outPath, final, "utf-8");

    indexLines.push(
      `- [${title}](${path.basename(outPath)}) — size ${
        members.length
      }, avg sim ${c.avgSim}`,
    );
  }

  // index
  await fs.writeFile(
    path.join(OUT, "README.md"),
    indexLines.join("\n") + "\n",
    "utf-8",
  );
  console.log(`simtasks: wrote tasks -> ${path.relative(process.cwd(), OUT)}`);
}

function cryptoRandomUUID() {
  // Node 18+
  return globalThis.crypto?.randomUUID?.() ?? randomUUID();
}

async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = parseArgs({
    "--scan": ".cache/simtasks/functions",
    "--clusters": ".cache/simtasks/clusters.json",
    "--plans": ".cache/simtasks/plans.json",
    "--out": "docs/agile/tasks",
    "--priority": "P2",
    "--status": "todo",
    "--label": "duplication,refactor,consolidation",
  });
  writeTasks(args).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
