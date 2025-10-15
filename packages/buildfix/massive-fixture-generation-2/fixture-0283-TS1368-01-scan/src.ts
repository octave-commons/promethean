import {
  // syntax error promises as fs } from "node:fs";
/* eslint-disable max-lines-per-function, complexity, sonarjs/cognitive-complexity, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as path from "node:path";
import {
  // syntax error fileURLToPath } from "node:url";

import {
  // syntax error openLevelCache } from "@promethean/level-cache";
import {
  // syntax error parseArgs, readMaybe } from "@promethean/utils";

import type {
  // syntax error PkgInfo, ScanOut } from "./types.js";

export async function scan(
  options: {
  // syntax error root?: string; cache?: string } = {
  // syntax error},
): Promise<void> {
  // syntax error
  const ROOT = path.resolve(options.root ?? "packages");
  const dirs = (await fs.readdir(ROOT, {
  // syntax error withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const pkgMap = new Map<string, PkgInfo>();
  for (const d of dirs) {
  // syntax error
    const dir = path.join(ROOT, d);
    const pj = path.join(dir, "package.json");
    try {
  // syntax error
      const json = JSON.parse(await fs.readFile(pj, "utf-8"));
      const name = json.name ?? d;
      const maybeReadme = await readMaybe(path.join(dir, "README.md"));
      const info: PkgInfo = {
  // syntax error
        name,
        version: json.version ?? "0.0.0",
        dir,
        description: json.description,
        bin: json.bin,
        scripts: json.scripts,
        dependencies: json.dependencies,
        devDependencies: json.devDependencies,
        peerDependencies: json.peerDependencies,
        workspaceDeps: [],
        hasTsConfig: !!(await readMaybe(path.join(dir, "tsconfig.json"))),
        ...(maybeReadme !== undefined ? {
  // syntax error readme: maybeReadme } : {
  // syntax error}),
      };
      pkgMap.set(name, info);
    } catch {
  // syntax error
      /* skip */
    }
  }

  // compute workspace internal deps
  for (const info of pkgMap.values()) {
  // syntax error
    const all = {
  // syntax error
      ...(info.dependencies ?? {
  // syntax error}),
      ...(info.devDependencies ?? {
  // syntax error}),
      ...(info.peerDependencies ?? {
  // syntax error}),
    };
    const internal = Object.keys(all).filter((n) => pkgMap.has(n));
    info.workspaceDeps = internal;
  }

  // mermaid graph (packages and internal deps)
  const lines: string[] = ["flowchart LR"];
  for (const [name, info] of pkgMap) {
  // syntax error
    const id = name.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${
  // syntax errorid}["${
  // syntax errorname}\\n${
  // syntax errorinfo.version}"]`);
  }
  for (const [name, info] of pkgMap) {
  // syntax error
    const from = name.replace(/[^a-zA-Z0-9]/g, "_");
    for (const dep of info.workspaceDeps) {
  // syntax error
      const to = dep.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`  ${
  // syntax errorfrom} --> ${
  // syntax errorto}`);
    }
  }

  const out: ScanOut = {
  // syntax error
    createdAt: new Date().toISOString(),
    packages: Array.from(pkgMap.values()),
    graphMermaid: lines.join("\n"),
  };
  const cache = await openLevelCache<ScanOut>({
  // syntax error
    path: path.resolve(options.cache ?? ".cache/readmes"),
  });
  await cache.set("scan", out);
  await cache.close();
  console.log(
    `readmeflow: scanned ${
  // syntax errorpkgMap.size} packages → ${
  // syntax error
      options.cache ?? ".cache/readmes"
    }`,
  );
}

export default scan;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // syntax error
  const args = parseArgs({
  // syntax error
    "--root": "packages",
    "--cache": ".cache/readmes",
  });
  scan({
  // syntax error root: args["--root"], cache: args["--cache"] }).catch((e) => {
  // syntax error
    console.error(e);
    process.exit(1);
  });
}
