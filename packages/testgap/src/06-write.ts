/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { parseArgs } from "./utils.js";
import type { PlanFile } from "./types.js";

const args = parseArgs({
  "--plans": ".cache/testgap/plans.json",
  "--out": "docs/agile/tasks/test-gaps",
  "--status": "todo",
  "--priority": "P2"
});

const START="<!-- TESTGAP:BEGIN -->";
const END="<!-- TESTGAP:END -->";

function strip(text: string){ const si=text.indexOf(START), ei=text.indexOf(END); return (si>=0 && ei>si) ? (text.slice(0,si).trimEnd()+"\n").trimEnd() : text.trimEnd(); }
function slug(s: string){ return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
function uuid(){ // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? (require("crypto").randomUUID());
}

async function main() {
  const plans = JSON.parse(await fs.readFile(path.resolve(args["--plans"]), "utf-8")) as PlanFile;
  await fs.mkdir(path.resolve(args["--out"]), { recursive: true });
  const index: string[] = ["# Test gap tasks", ""];

  for (const [pkg, tasks] of Object.entries(plans.tasks)) {
    for (const t of tasks) {
      const fname = `${slug(pkg)}-${slug(t.title)}.md`;
      const p = path.join(args["--out"], fname);
      const existing = await (async()=>{ try { return await fs.readFile(p,"utf-8"); } catch { return undefined; } })();
      const gm = existing ? matter(existing) : { content: "", data: {} as any };
      const fm = { ...(gm as any).data, uuid: gm?.data?.uuid ?? uuid(), title: t.title, package: pkg, status: args["--status"], priority: args["--priority"], labels: Array.from(new Set([...(gm?.data?.labels ?? []), ...(t.labels ?? [])])) };

      const refsTbl = [
        "| File | Line | Symbol |",
        "|---|---:|---|",
        ...t.refs.map(r => `| \`${r.file}\` | ${r.line} | \`${r.sym}\` |`)
      ].join("\n");

      const body = [
        START,
        `# ${t.title}`,
        "",
        t.summary,
        "",
        "## Steps",
        ...t.steps.map((s,i)=>`${i+1}. ${s}`),
        "",
        "## Acceptance",
        ...t.acceptance.map(a=>`- [ ] ${a}`),
        "",
        "## Targets",
        refsTbl,
        "",
        END,
        ""
      ].join("\n");

      const final = matter.stringify((strip(gm.content) ? strip(gm.content)+"\n\n" : "") + body, fm, { language: "yaml" });
      await fs.writeFile(p, final, "utf-8");
      index.push(`- [${t.title}](${path.basename(p)}) — ${pkg}`);
    }
  }

  await fs.writeFile(path.join(args["--out"], "README.md"), index.join("\n")+"\n", "utf-8");
  console.log(`testgap: wrote tasks → ${args["--out"]}`);
}
main().catch(e => { console.error(e); process.exit(1); });
