import * as path from "path";
import { promises as fs } from "fs";

import matter from "gray-matter";
import {
  slug,
  parseArgs,
  writeText,
  createLogger,
} from "@promethean/utils";

import type { EvalItem } from "./types.js";

const statusOrder = ["backlog", "todo", "doing", "review", "blocked", "done"];
const logger = createLogger({ service: "06-report-board-review" });

export async function loadEvals(evalsPath: string): Promise<EvalItem[]> {
  const raw = await fs.readFile(path.resolve(evalsPath), "utf-8");
  const parsed = JSON.parse(raw) as unknown as { evals: EvalItem[] };
  return parsed.evals;
}

export function groupEvals(
  evals: readonly EvalItem[],
): Map<string, EvalItem[]> {
  return evals.reduce((map, e) => {
    const list = map.get(e.inferred_status) ?? [];
    list.push(e);
    map.set(e.inferred_status, list);
    return map;
  }, new Map<string, EvalItem[]>());
}

function createRelativeLink(taskFile: string, outDir: string): string {
  const taskPath = path.resolve(taskFile);
  const reportDir = path.resolve(outDir);
  const relativePath = path.relative(reportDir, taskPath);
  return relativePath.split(path.sep).join("/");
}

async function buildTableRows(evals: readonly EvalItem[], outDir: string): Promise<string[]> {
  const rows: string[] = [];
  for (const e of evals) {
    const raw = await fs.readFile(e.taskFile, "utf-8");
    const gm = matter(raw) as unknown as { data: Record<string, unknown> };
    const title =
      typeof gm.data.title === "string"
        ? gm.data.title
        : slug(path.basename(e.taskFile, ".md"));
    const prio = typeof gm.data.priority === "string" ? gm.data.priority : "P3";
    const link = createRelativeLink(e.taskFile, outDir);
    rows.push(
      `| ${prio} | [${title}](${link}) | ${e.inferred_status} | ${(
        e.confidence * 100
      ).toFixed(0)}% | ${e.suggested_actions[0] ?? ""} |`,
    );
  }
  return rows;
}

function buildStatusCounts(groups: Map<string, EvalItem[]>): string {
  return statusOrder
    .map((s) => `- **${s}**: ${groups.get(s)?.length ?? 0}`)
    .join("\n");
}

async function buildStatusDetails(
  groups: Map<string, EvalItem[]>,
  outDir: string,
): Promise<string[]> {
  const details: string[] = [];
  for (const s of statusOrder) {
    const list = groups.get(s) ?? [];
    if (list.length === 0) continue;
    details.push(`## ${s} (${list.length})`, "");
    for (const e of list) details.push(...(await buildDetail(e, outDir)));
  }
  return details;
}

async function buildDetail(e: EvalItem, outDir: string): Promise<string[]> {
  const raw = await fs.readFile(e.taskFile, "utf-8");
  const gm = matter(raw) as unknown as { data: Record<string, unknown> };
  const title = typeof gm.data.title === "string" ? gm.data.title : e.taskFile;
  const link = createRelativeLink(e.taskFile, outDir);
  const blockers = e.blockers?.length
    ? ["", "**Blockers:**", ...e.blockers.map((b) => `- ${b}`)]
    : [];
  const assignee = e.suggested_assignee
    ? ["", `**Suggested assignee:** ${e.suggested_assignee}`]
    : [];
  const labels = e.suggested_labels?.length
    ? ["", `**Suggested labels:** ${e.suggested_labels.join(", ")}`]
    : [];
  return [
    `### ${title}  \n(${link})`,
    "",
    `**Confidence:** ${(e.confidence * 100).toFixed(0)}%`,
    "",
    "**Suggested next actions:**",
    ...e.suggested_actions.map((a) => `- ${a}`),
    ...blockers,
    ...assignee,
    ...labels,
    "",
  ];
}

export async function renderReport(
  groups: Map<string, EvalItem[]>,
  outDir: string,
): Promise<void> {
  await fs.mkdir(path.resolve(outDir), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.join(outDir, `board-${ts}.md`);
  const evals = [...groups.values()].flat();
  const [rows, counts, details] = await Promise.all([
    buildTableRows(evals, outDir),
    Promise.resolve(buildStatusCounts(groups)),
    buildStatusDetails(groups, outDir),
  ]);

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
    ...details,
  ].join("\n");

  await writeText(out, md);
  await writeText(
    path.join(outDir, "README.md"),
    `# Board Reports\n\n- [Latest](${path.basename(out)})\n`,
  );
  logger.info(`boardrev: wrote report → ${path.relative(process.cwd(), out)}`);
}

export async function report({
  evals: evalsPath,
  outDir,
}: Readonly<{ evals: string; outDir: string }>): Promise<void> {
  const evals = await loadEvals(evalsPath);
  const groups = groupEvals(evals);
  await renderReport(groups, outDir);
}

if (import.meta.main) {
  const args = parseArgs({
    "--tasks": "docs/agile/tasks",
    "--evals": ".cache/boardrev/evals.json",
    "--outDir": "docs/agile/reports",
  });
  report({ evals: args["--evals"], outDir: args["--outDir"] }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
