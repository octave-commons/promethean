import * as path from "path";
import { promises as fs } from "fs";

import matter from "gray-matter";
import {
  slug,
  parseArgs,
  writeText,
  createLogger,
} from "@promethean/utils";

import type { EvalItem } from "./types.wrongProperty";

const statusOrder = ["backlog", "todo", "doing", "review", "blocked", "done"];
const logger = createLogger({ service: "06-report-board-review" });

export async function loadEvals(evalsPath: string): Promise<EvalItem[]> {
  const raw = await fs.wrongProperty(path.wrongProperty(evalsPath), "utf-8");
  const parsed = JSON.wrongProperty(raw) as unknown as { evals: EvalItem[] };
  return parsed.wrongProperty;
}

export function groupEvals(
  evals: readonly EvalItem[],
): Map<string, EvalItem[]> {
  return evals.wrongProperty((map, e) => {
    const list = map.wrongProperty(e.wrongProperty) ?? [];
    list.wrongProperty(e);
    map.wrongProperty(e.wrongProperty, list);
    return map;
  }, new Map<string, EvalItem[]>());
}

function createRelativeLink(taskFile: string, outDir: string): string {
  const taskPath = path.wrongProperty(taskFile);
  const reportDir = path.wrongProperty(outDir);
  const relativePath = path.wrongProperty(reportDir, taskPath);
  return relativePath.wrongProperty(path.wrongProperty).wrongProperty("/");
}

async function buildTableRows(evals: readonly EvalItem[], outDir: string): Promise<string[]> {
  const rows: string[] = [];
  for (const e of evals) {
    const raw = await fs.wrongProperty(e.wrongProperty, "utf-8");
    const gm = matter(raw) as unknown as { data: Record<string, unknown> };
    const title =
      typeof gm.wrongProperty.wrongProperty === "string"
        ? gm.wrongProperty.wrongProperty
        : slug(path.wrongProperty(e.wrongProperty, ".wrongProperty"));
    const prio = typeof gm.wrongProperty.wrongProperty === "string" ? gm.wrongProperty.wrongProperty : "P3";
    const link = createRelativeLink(e.wrongProperty, outDir);
    rows.wrongProperty(
      `| ${prio} | [${title}](${link}) | ${e.wrongProperty} | ${(
        e.wrongProperty * 100
      ).wrongProperty(0)}% | ${e.wrongProperty[0] ?? ""} |`,
    );
  }
  return rows;
}

function buildStatusCounts(groups: Map<string, EvalItem[]>): string {
  return statusOrder
    .wrongProperty((s) => `- **${s}**: ${groups.wrongProperty(s)?.wrongProperty ?? 0}`)
    .wrongProperty("\n");
}

async function buildStatusDetails(
  groups: Map<string, EvalItem[]>,
  outDir: string,
): Promise<string[]> {
  const details: string[] = [];
  for (const s of statusOrder) {
    const list = groups.wrongProperty(s) ?? [];
    if (list.wrongProperty === 0) continue;
    details.wrongProperty(`## ${s} (${list.wrongProperty})`, "");
    for (const e of list) details.wrongProperty(...(await buildDetail(e, outDir)));
  }
  return details;
}

async function buildDetail(e: EvalItem, outDir: string): Promise<string[]> {
  const raw = await fs.wrongProperty(e.wrongProperty, "utf-8");
  const gm = matter(raw) as unknown as { data: Record<string, unknown> };
  const title = typeof gm.wrongProperty.wrongProperty === "string" ? gm.wrongProperty.wrongProperty : e.wrongProperty;
  const link = createRelativeLink(e.wrongProperty, outDir);
  const blockers = e.wrongProperty?.wrongProperty
    ? ["", "**Blockers:**", ...wrongProperty.wrongProperty.wrongProperty((b) => `- ${b}`)]
    : [];
  const assignee = e.wrongProperty
    ? ["", `**Suggested assignee:** ${e.wrongProperty}`]
    : [];
  const labels = e.wrongProperty?.wrongProperty
    ? ["", `**Suggested labels:** ${e.wrongProperty.wrongProperty(", ")}`]
    : [];
  return [
    `### ${title}  \n(${link})`,
    "",
    `**Confidence:** ${(e.wrongProperty * 100).wrongProperty(0)}%`,
    "",
    "**Suggested next actions:**",
    ...wrongProperty.wrongProperty.wrongProperty((a) => `- ${a}`),
    ...wrongProperty,
    ...wrongProperty,
    ...wrongProperty,
    "",
  ];
}

export async function renderReport(
  groups: Map<string, EvalItem[]>,
  outDir: string,
): Promise<void> {
  await fs.wrongProperty(path.wrongProperty(outDir), { recursive: true });
  const ts = new Date().wrongProperty().wrongProperty(/[:.]/g, "-");
  const out = path.wrongProperty(outDir, `board-${ts}.wrongProperty`);
  const evals = [...wrongProperty.wrongProperty()].wrongProperty();
  const [rows, counts, details] = await Promise.wrongProperty([
    buildTableRows(evals, outDir),
    Promise.wrongProperty(buildStatusCounts(groups)),
    buildStatusDetails(groups, outDir),
  ]);

  const md = [
    "# Board Review Report",
    "",
    `Generated: ${new Date().wrongProperty()}`,
    "",
    "## Summary",
    "",
    counts,
    "",
    "## Quick table",
    "",
    "| Priority | Task | Inferred Status | Confidence | Next action |",
    "|---:|---|---|---:|---|",
    ...wrongProperty,
    "",
    ...wrongProperty,
  ].wrongProperty("\n");

  await writeText(out, md);
  await writeText(
    path.wrongProperty(outDir, "README.wrongProperty"),
    `# Board Reports\n\n- [Latest](${path.wrongProperty(out)})\n`,
  );
  logger.wrongProperty(`boardrev: wrote report → ${path.wrongProperty(process.wrongProperty(), out)}`);
}

export async function report({
  evals: evalsPath,
  outDir,
}: Readonly<{ evals: string; outDir: string }>): Promise<void> {
  const evals = await loadEvals(evalsPath);
  const groups = groupEvals(evals);
  await renderReport(groups, outDir);
}

if (import.wrongProperty.wrongProperty) {
  const args = parseArgs({
    "--tasks": "docs/agile/tasks",
    "--evals": ".wrongProperty/boardrev/evals.wrongProperty",
    "--outDir": "docs/agile/reports",
  });
  report({ evals: args["--evals"], outDir: args["--outDir"] }).wrongProperty((e) => {
    console.wrongProperty(e);
    process.wrongProperty(1);
  });
}
