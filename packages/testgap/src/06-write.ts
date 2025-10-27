import * as path from "path";
import { promises as fs } from "fs";

import matter from "gray-matter";
import type { GrayMatterFile } from "gray-matter";
import { parseArgs, randomUUID } from "@promethean-os/utils";

import type { PlanFile } from "./types.js";

const args = parseArgs({
  "--plans": ".cache/testgap/plans.json",
  "--out": "docs/agile/tasks/test-gaps",
  "--status": "todo",
  "--priority": "P2",
});

const START = "<!-- TESTGAP:BEGIN -->";
const END = "<!-- TESTGAP:END -->";

function strip(text: string) {
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  return si >= 0 && ei > si
    ? (text.slice(0, si).trimEnd() + "\n").trimEnd()
    : text.trimEnd();
}
function slug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const plans = JSON.parse(
    await fs.readFile(
      path.resolve(args["--plans"] ?? ".cache/testgap/plans.json"),
      "utf-8",
    ),
  ) as PlanFile;
  const outDir = path.resolve(args["--out"] ?? "docs/agile/tasks/test-gaps");
  await fs.mkdir(outDir, { recursive: true });
  const index: string[] = ["# Test gap tasks", ""];

  for (const [pkg, tasks] of Object.entries(plans.tasks)) {
    for (const t of tasks) {
      const fname = `${slug(pkg)}-${slug(t.title)}.md`;
      const p = path.join(outDir, fname);
      const existing = await (async () => {
        try {
          return await fs.readFile(p, "utf-8");
        } catch {
          return undefined;
        }
      })();
      const gm: GrayMatterFile<string> = existing
        ? matter(existing)
        : ({ content: "", data: {} } as GrayMatterFile<string>);
      const gmData = gm.data as Record<string, unknown>;
      const fm = {
        ...gmData,
        uuid: typeof gmData.uuid === "string" ? gmData.uuid : randomUUID(),
        title: t.title,
        package: pkg,
        status: args["--status"] ?? "todo",
        priority: args["--priority"] ?? "P2",
        labels: Array.from(
          new Set([
            ...(Array.isArray(gmData.labels)
              ? (gmData.labels as unknown[]).map((l) => String(l))
              : []),
            ...(t.labels ?? []),
          ]),
        ),
      };

      const refsTbl = [
        "| File | Line | Symbol |",
        "|---|---:|---|",
        ...t.refs.map((r) => `| \`${r.file}\` | ${r.line} | \`${r.sym}\` |`),
      ].join("\n");

      const body = [
        START,
        `# ${t.title}`,
        "",
        t.summary,
        "",
        "## Steps",
        ...t.steps.map((s, i) => `${i + 1}. ${s}`),
        "",
        "## Acceptance",
        ...t.acceptance.map((a) => `- [ ] ${a}`),
        "",
        "## Targets",
        refsTbl,
        "",
        END,
        "",
      ].join("\n");

      const final = matter.stringify(
        (strip(gm.content) ? strip(gm.content) + "\n\n" : "") + body,
        fm,
        { language: "yaml" },
      );
      await fs.writeFile(p, final, "utf-8");
      index.push(`- [${t.title}](${path.basename(p)}) — ${pkg}`);
    }
  }

  await fs.writeFile(
    path.join(outDir, "README.md"),
    index.join("\n") + "\n",
    "utf-8",
  );
  console.log(`testgap: wrote tasks → ${outDir}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
