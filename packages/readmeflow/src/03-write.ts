import * as path from "path";

import matter from "gray-matter";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "@promethean/utils";
import { writeText, readMaybe } from "./utils.js";
import type { ScanOut, OutlinesFile, Outline } from "./types.js";

const args = parseArgs({
  "--cache": ".cache/readmes",
  "--mermaid": "true",
});

const START = "<!-- READMEFLOW:BEGIN -->";
const END = "<!-- READMEFLOW:END -->";

function stripGenerated(text: string) {
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  if (si >= 0 && ei > si) return `${text.slice(0, si).trimEnd()}\n`.trimEnd();
  return text.trimEnd();
}

function makeReadme(_pkg: unknown, outline: Outline, mermaid?: string) {
  const toc = outline.includeTOC ? "[TOC]\n\n" : "";
  const sec = outline.sections
    .map((s) => `## ${s.heading}\n\n${s.body}\n`)
    .join("\n");
  const badges = (outline.badges ?? []).join(" ");
  const diag = mermaid
    ? `\n### Package graph\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n`
    : "";

  return [
    START,
    `# ${outline.title}`,
    badges ? `\n${badges}\n` : "",
    `${outline.tagline}\n`,
    toc,
    sec,
    diag,
    END,
    "",
  ].join("\n");
}

async function main() {
  const cache = await openLevelCache<ScanOut | OutlinesFile>({
    path: path.resolve(args["--cache"]),
  });
  const scan = (await cache.get("scan")) as ScanOut;
  const outlines = (await cache.get("outlines")) as OutlinesFile;

  for (const pkg of scan.packages) {
    const out = outlines.outlines[pkg.name];
    if (!out) continue;

    const readmePath = path.join(pkg.dir, "README.md");
    const existing = await readMaybe(readmePath);
    const gm = existing
      ? matter(existing)
      : { content: "", data: {} as Record<string, unknown> };

    const stripped = stripGenerated(gm.content);
    const content =
      (stripped ? `${stripped}\n\n` : "") +
      makeReadme(
        pkg,
        out,
        args["--mermaid"] === "true" ? scan.graphMermaid : undefined,
      );

    const fm = { ...gm.data };
    const final = matter.stringify(content, fm, { language: "yaml" });
    await writeText(readmePath, final);
  }
  await cache.close();
  console.log(`readmeflow: wrote ${scan.packages.length} README(s)`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
