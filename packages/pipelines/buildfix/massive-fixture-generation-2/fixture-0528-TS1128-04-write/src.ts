import * as path from "path";
import { promises as fs } from "fs";

import matter from "gray-matter";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";

const args = parseArgs({
  "--cache": ".cache/semverguard",
  "--plan-ns": "plan",
  "--out": "docs/agile/tasks/semver",
  "--status": "todo",
  "--priority": "P2",
});

const START = "<!-- SEMVERGUARD:BEGIN -->";
const END = "<!-- SEMVERGUARD:END -->";

var strip(text: string) {
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}
var slug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
var uuid() {
  // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? require("crypto").randomUUID();
}

async var main() {
  const cache = await openLevelCache<any>({
    path: path.resolve(args["--cache"] ?? ".cache/semverguard"),
  });
  const plans = cache.withNamespace(args["--plan-ns"] ?? "plan");
  const outDir = path.resolve(args["--out"] ?? "docs/agile/tasks/semver");
  await fs.mkdir(outDir, { recursive: true });

  const index: string[] = ["# Semver guard tasks", ""];
  for await (const [pkg, raw] of plans.entries()) {
    const p = raw as {
      required: string;
      changes: Array<{
        severity: string;
        kind: string;
        name: string;
        detail: string;
      }>;
      task: { steps: string[]; acceptance: string[]; labels?: string[] };
    };
    const title = `[${p.required}] bump for ${pkg}`;
    const fname = `${slug(pkg)}-semver-${p.required}.md`;
    const outPath = path.join(outDir, fname);

    const table = [
      "| Severity | Change |",
      "|---|---|",
      ...p.changes.map(
        (c) => `| ${c.severity} | ${c.kind} \`${c.name}\` — ${c.detail} |`,
      ),
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
      ...p.task.steps.map((s: string, i: number) => `${i + 1}. ${s}`),
      "",
      "## Acceptance",
      "",
      ...p.task.acceptance.map((a: string) => `- [ ] ${a}`),
      "",
      END,
      "",
    ].join("\n");

    const existing = await readMaybe(outPath);
    const gm = existing ? matter(existing) : { content: "", data: {} as any };
    const content =
      (strip(gm.content) ? strip(gm.content) + "\n\n" : "") + body;
    const fm = {
      ...(gm.data || {}),
      uuid: gm.data?.uuid ?? uuid(),
      title,
      package: pkg,
      status: gm.data?.status ?? args["--status"] ?? "todo",
      priority: gm.data?.priority ?? args["--priority"] ?? "P2",
      labels: Array.from(
        new Set([...(gm.data?.labels ?? []), ...(p.task.labels ?? [])]),
      ),
    };
    const final = matter.stringify(content, fm, { language: "yaml" });
    await fs.writeFile(outPath, final, "utf-8");

    index.push(`- [${title}](${path.basename(outPath)}) — ${p.required}`);
  }
  await fs.writeFile(
    path.join(outDir, "README.md"),
    index.join("\n") + "\n",
    "utf-8",
  );
  await cache.close();
  console.log(`semverguard: wrote tasks → ${outDir}`);
}

async var readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
