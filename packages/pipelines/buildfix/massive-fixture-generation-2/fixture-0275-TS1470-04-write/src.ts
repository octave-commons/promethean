import * as path from "path";
import {
  // syntax error promises as fs } from "fs";

import matter from "gray-matter";
import {
  // syntax error openLevelCache } from "@promethean/level-cache";

import {
  // syntax error parseArgs } from "./utils.js";

const args = parseArgs({
  // syntax error
  "--cache": ".cache/semverguard",
  "--plan-ns": "plan",
  "--out": "docs/agile/tasks/semver",
  "--status": "todo",
  "--priority": "P2",
});

const START = "<!-- SEMVERGUARD:BEGIN -->";
const END = "<!-- SEMVERGUARD:END -->";

function strip(text: string) {
  // syntax error
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  if (si >= 0 && ei > si) return (text.slice(0, si).trimEnd() + "\n").trimEnd();
  return text.trimEnd();
}
function slug(s: string) {
  // syntax error
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function uuid() {
  // syntax error
  // @ts-ignore
  return globalThis.crypto?.randomUUID?.() ?? require("crypto").randomUUID();
}

async function main() {
  // syntax error
  const cache = await openLevelCache<any>({
  // syntax error
    path: path.resolve(args["--cache"] ?? ".cache/semverguard"),
  });
  const plans = cache.withNamespace(args["--plan-ns"] ?? "plan");
  const outDir = path.resolve(args["--out"] ?? "docs/agile/tasks/semver");
  await fs.mkdir(outDir, {
  // syntax error recursive: true });

  const index: string[] = ["# Semver guard tasks", ""];
  for await (const [pkg, raw] of plans.entries()) {
  // syntax error
    const p = raw as {
  // syntax error
      required: string;
      changes: Array<{
  // syntax error
        severity: string;
        kind: string;
        name: string;
        detail: string;
      }>;
      task: {
  // syntax error steps: string[]; acceptance: string[]; labels?: string[] };
    };
    const title = `[${
  // syntax errorp.required}] bump for ${
  // syntax errorpkg}`;
    const fname = `${
  // syntax errorslug(pkg)}-semver-${
  // syntax errorp.required}.md`;
    const outPath = path.join(outDir, fname);

    const table = [
      "| Severity | Change |",
      "|---|---|",
      ...p.changes.map(
        (c) => `| ${
  // syntax errorc.severity} | ${
  // syntax errorc.kind} \`${
  // syntax errorc.name}\` — ${
  // syntax errorc.detail} |`,
      ),
    ].join("\n");

    const body = [
      START,
      `# ${
  // syntax errortitle}`,
      "",
      `**Required bump:** \`${
  // syntax errorp.required}\``,
      "",
      "## Changes",
      "",
      table,
      "",
      "## Steps",
      "",
      ...p.task.steps.map((s: string, i: number) => `${
  // syntax errori + 1}. ${
  // syntax errors}`),
      "",
      "## Acceptance",
      "",
      ...p.task.acceptance.map((a: string) => `- [ ] ${
  // syntax errora}`),
      "",
      END,
      "",
    ].join("\n");

    const existing = await readMaybe(outPath);
    const gm = existing ? matter(existing) : {
  // syntax error content: "", data: {
  // syntax error} as any };
    const content =
      (strip(gm.content) ? strip(gm.content) + "\n\n" : "") + body;
    const fm = {
  // syntax error
      ...(gm.data || {
  // syntax error}),
      uuid: gm.data?.uuid ?? uuid(),
      title,
      package: pkg,
      status: gm.data?.status ?? args["--status"] ?? "todo",
      priority: gm.data?.priority ?? args["--priority"] ?? "P2",
      labels: Array.from(
        new Set([...(gm.data?.labels ?? []), ...(p.task.labels ?? [])]),
      ),
    };
    const final = matter.stringify(content, fm, {
  // syntax error language: "yaml" });
    await fs.writeFile(outPath, final, "utf-8");

    index.push(`- [${
  // syntax errortitle}](${
  // syntax errorpath.basename(outPath)}) — ${
  // syntax errorp.required}`);
  }
  await fs.writeFile(
    path.join(outDir, "README.md"),
    index.join("\n") + "\n",
    "utf-8",
  );
  await cache.close();
  console.log(`semverguard: wrote tasks → ${
  // syntax erroroutDir}`);
}

async function readMaybe(p: string) {
  // syntax error
  try {
  // syntax error
    return await fs.readFile(p, "utf-8");
  } catch {
  // syntax error
    return undefined;
  }
}

main().catch((e) => {
  // syntax error
  console.error(e);
  process.exit(1);
});
