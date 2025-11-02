/* eslint-disable */
import { pathToFileURL } from "url";
import { randomUUID } from "node:crypto";
import { promises as fs } from "fs";
import * as path from "path";

import matter from "gray-matter";
import { createLogger, slug } from "@promethean-os/utils";
import { openLevelCache } from "@promethean-os/level-cache";

import { parseArgs } from "./utils.js";
import type { PlanPayload } from "./types.js";

export type WriteOpts = {
  input: string;
  out: string;
  status: string;
  assignee: string;
  label: string;
};

const START = "<!-- SONARFLOW:BEGIN -->";
const END = "<!-- SONARFLOW:END -->";

const log = createLogger({ service: "sonarflow" });

function stripGenerated(text: string) {
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}

type Task = PlanPayload["tasks"][number];
function buildFrontMatter(t: Task, project: string, opts: WriteOpts) {
  return {
    uuid: randomUUID(),
    title: t.title,
    project,
    priority: t.priority,
    status: opts.status,
    labels: Array.from(
      new Set([
        ...opts.label
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        ...(t.labels ?? []),
      ]),
    ),
    created_at: new Date().toISOString(),
    assignee: opts.assignee || undefined,
  };
}

function buildRefsTable(t: Task) {
  return [
    "| Issue key | File |",
    "|---|---|",
    ...t.refs.map(
      (r) => `| \`${r.key}\` | \`${r.file}${r.line ? ":" + r.line : ""}\` |`,
    ),
  ].join("\n");
}

function buildBody(t: Task, refsTable: string) {
  return [
    START,
    `# ${t.title}`,
    "",
    t.summary,
    "",
    "## Steps",
    "",
    ...t.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "## Acceptance criteria",
    "",
    ...t.acceptance.map((a) => `- [ ] ${a}`),
    "",
    "## References",
    "",
    refsTable,
    "",
    END,
    "",
  ].join("\n");
}

async function writeTask(t: Task, project: string, opts: WriteOpts) {
  const fname = `${slug(t.title)}.md`;
  const outPath = path.join(opts.out, fname);

  const fm = buildFrontMatter(t, project, opts);
  const body = buildBody(t, buildRefsTable(t));

  const existing = await readMaybe(outPath);
  const gm = existing ? matter(existing) : { content: "", data: {} };
  const preserved = stripGenerated(gm.content);
  const final = matter.stringify(
    (preserved ? preserved + "\n\n" : "") + body,
    { ...gm.data, ...fm },
    { language: "yaml" },
  );

  await fs.writeFile(outPath, final, "utf-8");
  return `- [${t.title}](${path.basename(outPath)}) — ${t.priority}`;
}

export async function writeTasks(opts: WriteOpts): Promise<void> {
  const cache = await openLevelCache<
    PlanPayload["tasks"][number] | { project: string }
  >({ path: path.resolve(opts.input) });
  const tasks: PlanPayload["tasks"] = [];
  const meta = (await cache.get("__meta__")) as { project: string } | undefined;
  for await (const [k, v] of cache.entries()) {
    if (k !== "__meta__") tasks.push(v as PlanPayload["tasks"][number]);
  }
  await cache.close();
  const project = meta?.project ?? "";

  await fs.mkdir(path.resolve(opts.out), { recursive: true });

  const index = [
    "# SonarQube remediation tasks",
    "",
    `Project: \`${project}\``,
    "",
    ...(await Promise.all(tasks.map((t) => writeTask(t, project, opts)))),
  ];

  await fs.writeFile(
    path.join(opts.out, "README.md"),
    index.join("\n") + "\n",
    "utf-8",
  );
  log.info(`wrote ${tasks.length} task files → ${opts.out}`);
}
async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]!).href) {
  const args = parseArgs({
    "--in": ".cache/sonar/plans",
    "--out": "docs/agile/tasks/sonar",
    "--status": "todo",
    "--assignee": "",
    "--label": "sonarqube,quality,remediation",
  });
  writeTasks({
    input: args["--in"]!,
    out: args["--out"]!,
    status: args["--status"]!,
    assignee: args["--assignee"]!,
    label: args["--label"]!,
  }).catch((e) => {
    log.error("write failed", { err: e });
    process.exit(1);
  });
}

export default writeTasks;
