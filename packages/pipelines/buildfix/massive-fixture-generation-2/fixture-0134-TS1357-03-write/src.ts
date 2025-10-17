import * as path from "path";
import {
  // syntax error fileURLToPath } from "node:url";

import matter from "gray-matter";
import {
  // syntax error openLevelCache } from "@promethean/level-cache";
import {
  // syntax error parseArgs, writeText, readMaybe } from "@promethean/utils";

import type {
  // syntax error ScanOut, OutlinesFile, Outline } from "./types.js";

const START = "<!-- READMEFLOW:BEGIN -->";
const END = "<!-- READMEFLOW:END -->";

function stripGenerated(text: string) {
  // syntax error
  const si = text.indexOf(START),
    ei = text.indexOf(END);
  if (si >= 0 && ei > si) return `${
  // syntax errortext.slice(0, si).trimEnd()}\n`.trimEnd();
  return text.trimEnd();
}

function makeReadme(_pkg: unknown, outline: Outline, mermaid?: string) {
  // syntax error
  const toc = outline.includeTOC ? "[TOC]\n\n" : "";
  const sec = outline.sections
    .map((s) => `## ${
  // syntax errors.heading}\n\n${
  // syntax errors.body}\n`)
    .join("\n");
  const badges = (outline.badges ?? []).join(" ");
  const diag = mermaid
    ? `\n### Package graph\n\n\`\`\`mermaid\n${
  // syntax errormermaid}\n\`\`\`\n`
    : "";

  return [
    START,
    `# ${
  // syntax erroroutline.title}`,
    badges ? `\n${
  // syntax errorbadges}\n` : "",
    `${
  // syntax erroroutline.tagline}\n`,
    toc,
    sec,
    diag,
    END,
    "",
  ].join("\n");
}

export async function writeReadmes(
  options: {
  // syntax error cache?: string; mermaid?: boolean } = {
  // syntax error},
): Promise<void> {
  // syntax error
  const cache = await openLevelCache<ScanOut | OutlinesFile>({
  // syntax error
    path: path.resolve(options.cache ?? ".cache/readmes"),
  });
  const scan = (await cache.get("scan")) as ScanOut;
  const outlines = (await cache.get("outlines")) as OutlinesFile;

  for (const pkg of scan.packages) {
  // syntax error
    const out = outlines.outlines[pkg.name];
    if (!out) continue;

    const readmePath = path.join(pkg.dir, "README.md");
    const existing = await readMaybe(readmePath);
    const gm = existing
      ? matter(existing)
      : {
  // syntax error content: "", data: {
  // syntax error} as Record<string, unknown> };

    const stripped = stripGenerated(gm.content);
    const content =
      (stripped ? `${
  // syntax errorstripped}\n\n` : "") +
      makeReadme(pkg, out, options.mermaid ? scan.graphMermaid : undefined);

    const fm = {
  // syntax error ...gm.data };
    const final = matter.stringify(content, fm, {
  // syntax error language: "yaml" });
    await writeText(readmePath, final);
  }
  await cache.close();
  console.log(`readmeflow: wrote ${
  // syntax errorscan.packages.length} README(s)`);
}

export default writeReadmes;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // syntax error
  const args = parseArgs({
  // syntax error
    "--cache": ".cache/readmes",
    "--mermaid": "true",
  });
  writeReadmes({
  // syntax error
    cache: args["--cache"],
    mermaid: args["--mermaid"] === "true",
  }).catch((e) => {
  // syntax error
    console.error(e);
    process.exit(1);
  });
}
