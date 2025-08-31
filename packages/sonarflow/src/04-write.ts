/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import * as yaml from "yaml";
import { parseArgs } from "./utils.js";
import type { PlanPayload } from "./types.js";

const args = parseArgs({
  "--in": ".cache/sonar/plans.json",
  "--out": "docs/agile/tasks/sonar",
  "--status": "todo",
  "--assignee": "",
  "--label": "sonarqube,quality,remediation"
});

const START = "<!-- SONARFLOW:BEGIN -->";
const END   = "<!-- SONARFLOW:END -->";

function slug(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function stripGenerated(text: string) {
  const si = text.indexOf(START), ei = text.indexOf(END);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}

async function main() {
  const { tasks, project } = JSON.parse(await fs.readFile(path.resolve(args["--in"]), "utf-8")) as PlanPayload;

  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
  const index: string[] = ["# SonarQube remediation tasks", "", `Project: \`${project}\``, ""];

  for (const t of tasks) {
    const fname = `${slug(t.title)}.md`;
    const outPath = path.join(args["--out"], fname);

    const fm = {
      uuid: cryptoRandomUUID(),
      title: t.title,
      project,
      priority: t.priority,
      status: args["--status"],
      labels: Array.from(new Set([...(args["--label"].split(",").map(s => s.trim()).filter(Boolean)), ...(t.labels ?? [])])),
      created_at: new Date().toISOString()
    };

    const refsTable = [
      "| Issue key | File |",
      "|---|---|",
      ...t.refs.map(r => `| \`${r.key}\` | \`${r.file}${r.line ? ":"+r.line : ""}\` |`)
    ].join("\n");

    const body = [
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
      ...t.acceptance.map(a => `- [ ] ${a}`),
      "",
      "## References",
      "",
      refsTable,
      "",
      END,
      ""
    ].join("\n");

    const existing = await readMaybe(outPath);
    const gm = existing ? matter(existing) : { content: "", data: {} };
    const preserved = stripGenerated(gm.content);
    const final = matter.stringify((preserved ? preserved + "\n\n" : "") + body, { ...gm.data, ...fm }, { language: "yaml" });

    await fs.writeFile(outPath, final, "utf-8");
    index.push(`- [${t.title}](${path.basename(outPath)}) — ${t.priority}`);
  }

  await fs.writeFile(path.join(args["--out"], "README.md"), index.join("\n") + "\n", "utf-8");
  console.log(`sonarflow: wrote ${tasks.length} task files → ${args["--out"]}`);
}

function cryptoRandomUUID() {
  // Node 18+
  // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? require("crypto").randomUUID();
}
async function readMaybe(p: string) {
  try { return await fs.readFile(p, "utf-8"); } catch { return undefined; }
}

main().catch((e) => { console.error(e); process.exit(1); });
