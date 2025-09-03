// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { parseArgs, writeText, readMaybe } from "./utils.js";
import type { ScanOut, OutlinesFile } from "./types.js";

const args = parseArgs({
  "--scan": ".cache/readmes/scan.json",
  "--outlines": ".cache/readmes/outlines.json",
  "--mermaid": "true"
});

const START="<!-- READMEFLOW:BEGIN -->";
const END  ="<!-- READMEFLOW:END -->";

function stripGenerated(text: string) {
  const si = text.indexOf(START), ei = text.indexOf(END);
  if (si>=0 && ei>si) return (text.slice(0, si).trimEnd()+"\n").trimEnd();
  return text.trimEnd();
}

function makeReadme(pkg: any, outline: any, mermaid?: string) {
  const toc = outline.includeTOC ? "[TOC]\n\n" : "";
  const sec = outline.sections.map((s: any) => `## ${s.heading}\n\n${s.body}\n`).join("\n");
  const badges = (outline.badges ?? []).join(" ");
  const diag = mermaid ? `\n### Package graph\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n` : "";

  return [
    START,
    `# ${outline.title}`,
    badges ? `\n${badges}\n` : "",
    `${outline.tagline}\n`,
    toc,
    sec,
    diag,
    END,
    ""
  ].join("\n");
}

async function main() {
  const scan = JSON.parse(await fs.readFile(path.resolve(args["--scan"]), "utf-8")) as ScanOut;
  const outlines = JSON.parse(await fs.readFile(path.resolve(args["--outlines"]), "utf-8")) as OutlinesFile;

  for (const pkg of scan.packages) {
    const out = outlines.outlines[pkg.name];
    if (!out) continue;

    const readmePath = path.join(pkg.dir, "README.md");
    const existing = await readMaybe(readmePath);
    const gm = existing ? matter(existing) : { content: "", data: {} as any };

    const content = (stripGenerated(gm.content) ? stripGenerated(gm.content) + "\n\n" : "") +
      makeReadme(pkg, out, (args["--mermaid"] === "true") ? scan.graphMermaid : undefined);

    const fm = { ...(gm as any).data };
    const final = matter.stringify(content, fm, { language: "yaml" });
    await writeText(readmePath, final);
  }
  console.log(`readmeflow: wrote ${scan.packages.length} README(s)`);
}
main().catch(e => { console.error(e); process.exit(1); });
