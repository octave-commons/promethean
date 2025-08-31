/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { parseArgs } from "./utils.js";
import type { PlansFile } from "./types.js";

const args = parseArgs({
  "--plans": ".cache/semverguard/plans.json",
  "--out": "docs/agile/tasks/semver",
  "--status": "todo",
  "--priority": "P2"
});

const START="<!-- SEMVERGUARD:BEGIN -->";
const END  ="<!-- SEMVERGUARD:END -->";

function strip(text: string) {
  const si = text.indexOf(START), ei = text.indexOf(END);
  if (si>=0 && ei>si) return (text.slice(0, si).trimEnd()+"\n").trimEnd();
  return text.trimEnd();
}
function slug(s: string){ return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
function uuid(){ // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? (require("crypto").randomUUID());
}

async function main() {
  const plans = JSON.parse(await fs.readFile(path.resolve(args["--plans"]), "utf-8")) as PlansFile;
  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });

  const index: string[] = ["# Semver guard tasks", ""];
  for (const [pkg, p] of Object.entries(plans.packages)) {
    const title = `[${p.required}] bump for ${pkg}`;
    const fname = `${slug(pkg)}-semver-${p.required}.md`;
    const outPath = path.join(args["--out"], fname);

    const table = [
      "| Severity | Change |",
      "|---|---|",
      ...p.changes.map(c => `| ${c.severity} | ${c.kind} \`${c.name}\` — ${c.detail} |`)
    ].join("\n");

    const body = [
      START,
      `# ${title}`,
      "",
      `**Required bump:** \`${p.required}\``,
      "",
      "## Changes",
      "",
      table,
      "",
      "## Steps",
      "",
      ...p.task.steps.map((s,i)=>`${i+1}. ${s}`),
      "",
      "## Acceptance",
      "",
      ...p.task.acceptance.map(a=>`- [ ] ${a}`),
      "",
      END,
      ""
    ].join("\n");

    const existing = await readMaybe(outPath);
    const gm = existing ? matter(existing) : { content: "", data: {} as any };
    const content = (strip(gm.content) ? strip(gm.content) + "\n\n" : "") + body;
    const fm = {
      ...(gm.data || {}),
      uuid: gm.data?.uuid ?? uuid(),
      title,
      package: pkg,
      status: gm.data?.status ?? args["--status"],
      priority: gm.data?.priority ?? args["--priority"],
      labels: Array.from(new Set([...(gm.data?.labels ?? []), ...(p.task.labels ?? [])]))
    };
    const final = matter.stringify(content, fm, { language: "yaml" });
    await fs.writeFile(outPath, final, "utf-8");

    index.push(`- [${title}](${path.basename(outPath)}) — ${p.required}`);
  }
  await fs.writeFile(path.join(args["--out"], "README.md"), index.join("\n")+"\n", "utf-8");
  console.log(`semverguard: wrote tasks → ${args["--out"]}`);
}

async function readMaybe(p: string){ try { return await fs.readFile(p, "utf-8"); } catch { return undefined; } }

main().catch(e => { console.error(e); process.exit(1); });
