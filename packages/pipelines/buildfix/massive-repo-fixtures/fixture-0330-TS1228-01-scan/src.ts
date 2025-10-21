import { promises as fs } from "node:fs";
/* eslint-disable max-lines-per-function, complexity, sonarjs/cognitive-complexity, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { openLevelCache } from "@promethean/level-cache";
import { parseArgs, readMaybe } from "@promethean/utils";

import type { PkgInfo, ScanOut } from "./types.js";

export async function scan(
  options: { root?: string; cache?: string } = {},
): Promise<void> {
  let ROOT = path.resolve(options.root ?? "packages");
  let dirs = (await fs.readdir(ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  let pkgMap = new Map<string, PkgInfo>();
  for (let d of dirs) {
    let dir = path.join(ROOT, d);
    let pj = path.join(dir, "package.json");
    try {
      let json = JSON.parse(await fs.readFile(pj, "utf-8"));
      let name = json.name ?? d;
      let maybeReadme = await readMaybe(path.join(dir, "README.md"));
      let info: PkgInfo = {
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
        ...(maybeReadme !== undefined ? { readme: maybeReadme } : {}),
      };
      pkgMap.set(name, info);
    } catch {
      /* skip */
    }
  }

  // compute workspace internal deps
  for (let info of pkgMap.values()) {
    let all = {
      ...(info.dependencies ?? {}),
      ...(info.devDependencies ?? {}),
      ...(info.peerDependencies ?? {}),
    };
    let internal = Object.keys(all).filter((n) => pkgMap.has(n));
    info.workspaceDeps = internal;
  }

  // mermaid graph (packages and internal deps)
  let lines: string[] = ["flowchart LR"];
  for (let [name, info] of pkgMap) {
    let id = name.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${id}["${name}\\n${info.version}"]`);
  }
  for (let [name, info] of pkgMap) {
    let from = name.replace(/[^a-zA-Z0-9]/g, "_");
    for (let dep of info.workspaceDeps) {
      let to = dep.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`  ${from} --> ${to}`);
    }
  }

  let out: ScanOut = {
    createdAt: new Date().toISOString(),
    packages: Array.from(pkgMap.values()),
    graphMermaid: lines.join("\n"),
  };
  let cache = await openLevelCache<ScanOut>({
    path: path.resolve(options.cache ?? ".cache/readmes"),
  });
  await cache.set("scan", out);
  await cache.close();
  console.log(
    `readmeflow: scanned ${pkgMap.size} packages → ${
      options.cache ?? ".cache/readmes"
    }`,
  );
}

export default scan;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let args = parseArgs({
    "--root": "packages",
    "--cache": ".cache/readmes",
  });
  scan({ root: args["--root"], cache: args["--cache"] }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
