/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { parseArgs, writeText, slug } from "./utils.js";
import type { EvalItem } from "./types.js";

const args = parseArgs({
  "--tasks": "docs/agile/tasks",
  "--evals": ".cache/boardrev/evals.json",
  "--outDir": "docs/agile/reports"
});

async function main() {
  const evals: { evals: EvalItem[] } = JSON.parse(await fs.readFile(path.resolve(args["--evals"]), "utf-8"));
  await fs.mkdir(path.resolve(args["--outDir"]), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(args["--outDir"], `board-${ts}.md`);

  // group by inferred status
  const groups = new Map<string, EvalItem[]>();
  for (const e of evals.evals) (groups.get(e.inferred_status) ?? groups.set(e.inferred_status, []).get(e.inferred_status)!).push(e);

  // load titles/priorities
  const rows: string[] = [];
  for (const e of evals.evals) {
    const raw = await fs.readFile(e.taskFile, "utf-8");
    const gm = matter(raw);
    const title = gm.data?.title ?? slug(path.basename(e.taskFile, ".md"));
    const prio = gm.data?.priority ?? "P3";
    const link = relFromRepo(e.taskFile);
    rows.push(`| ${prio} | [${title}](${link}) | ${e.inferred_status} | ${(e.confidence*100).toFixed(0)}% | ${e.suggested_actions[0] ?? ""} |`);
  }

  // summary
  const statusOrder = ["backlog","todo","doing","review","blocked","done"];
  const counts = statusOrder.map(s => `- **${s}**: ${groups.get(s)?.length ?? 0}`).join("\n");

  const details: string[] = [];
  for (const s of statusOrder) {
    const list = groups.get(s) ?? [];
    if (!list.length) continue;
    details.push(`## ${s} (${list.length})`, "");
    for (const e of list) {
      const gm = matter(await fs.readFile(e.taskFile, "utf-8"));
      const title = gm.data?.title ?? e.taskFile;
      const link = relFromRepo(e.taskFile);
      details.push(
        `### ${title}  \n(${link})`,
        "",
        `**Confidence:** ${(e.confidence*100).toFixed(0)}%`,
        "",
        "**Suggested next actions:**",
        ...e.suggested_actions.map(a => `- ${a}`),
        e.blockers?.length ? "\n**Blockers:**\n" + e.blockers.map(b => `- ${b}`).join("\n") : "",
        e.suggested_assignee ? `\n**Suggested assignee:** ${e.suggested_assignee}\n` : "",
        e.suggested_labels?.length ? `\n**Suggested labels:** ${e.suggested_labels.join(", ")}\n` : "",
        ""
      );
    }
  }

  const md = [
    "# Board Review Report",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "## Summary",
    "",
    counts,
    "",
    "## Quick table",
    "",
    "| Priority | Task | Inferred Status | Confidence | Next action |",
    "|---:|---|---|---:|---|",
    ...rows,
    "",
    ...details
  ].join("\n");

  await writeText(out, md);
  await writeText(path.join(args["--outDir"], "README.md"), `# Board Reports\n\n- [Latest](${path.basename(out)})\n`);
  console.log(`boardrev: wrote report → ${path.relative(process.cwd(), out)}`);
}

function relFromRepo(abs: string) {
  return abs.replace(process.cwd().replace(/\\/g,"/") + "/", "");
}

main().catch(e => { console.error(e); process.exit(1); });
