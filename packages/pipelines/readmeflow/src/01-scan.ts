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
  const ROOT = path.resolve(options.root ?? "packages");
  const dirs = (await fs.readdir(ROOT, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const pkgMap = new Map<string, PkgInfo>();
  for (const d of dirs) {
    const dir = path.join(ROOT, d);
    const pj = path.join(dir, "package.json");
    try {
      const json = JSON.parse(await fs.readFile(pj, "utf-8"));
      const name = json.name ?? d;
      const maybeReadme = await readMaybe(path.join(dir, "README.md"));
      const info: PkgInfo = {
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
  for (const info of pkgMap.values()) {
    const all = {
      ...(info.dependencies ?? {}),
      ...(info.devDependencies ?? {}),
      ...(info.peerDependencies ?? {}),
    };
    const internal = Object.keys(all).filter((n) => pkgMap.has(n));
    info.workspaceDeps = internal;
  }

  // mermaid graph (packages and internal deps)
  const lines: string[] = ["flowchart LR"];
  for (const [name, info] of pkgMap) {
    const id = name.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${id}["${name}\\n${info.version}"]`);
  }
  for (const [name, info] of pkgMap) {
    const from = name.replace(/[^a-zA-Z0-9]/g, "_");
    for (const dep of info.workspaceDeps) {
      const to = dep.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`  ${from} --> ${to}`);
    }
  }

  const out: ScanOut = {
    createdAt: new Date().toISOString(),
    packages: Array.from(pkgMap.values()),
    graphMermaid: lines.join("\n"),
  };
  const cache = await openLevelCache<ScanOut>({
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
  const args = parseArgs({
    "--root": "packages",
    "--cache": ".cache/readmes",
  });
  scan({ root: args["--root"], cache: args["--cache"] }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
