/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import { parseArgs, readMaybe, writeJSON } from "./utils.js";
import type { PkgInfo, ScanOut } from "./types.js";

const args = parseArgs({
  "--root": "packages",
  "--out": ".cache/readmes/scan.json"
});

async function main() {
  const ROOT = path.resolve(args["--root"]);
  const dirs = (await fs.readdir(ROOT, { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name);

  const pkgMap = new Map<string, PkgInfo>();
  for (const d of dirs) {
    const dir = path.join(ROOT, d);
    const pj = path.join(dir, "package.json");
    try {
      const json = JSON.parse(await fs.readFile(pj, "utf-8"));
      const name = json.name ?? d;
      const info: PkgInfo = {
        name, version: json.version ?? "0.0.0", dir,
        description: json.description, bin: json.bin, scripts: json.scripts,
        dependencies: json.dependencies, devDependencies: json.devDependencies, peerDependencies: json.peerDependencies,
        workspaceDeps: [], hasTsConfig: !!(await readMaybe(path.join(dir, "tsconfig.json"))),
        readme: await readMaybe(path.join(dir, "README.md"))
      };
      pkgMap.set(name, info);
    } catch { /* skip */ }
  }

  // compute workspace internal deps
  for (const info of pkgMap.values()) {
    const all = { ...(info.dependencies ?? {}), ...(info.devDependencies ?? {}), ...(info.peerDependencies ?? {}) };
    const internal = Object.keys(all).filter(n => pkgMap.has(n));
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

  const out: ScanOut = { createdAt: new Date().toISOString(), packages: Array.from(pkgMap.values()), graphMermaid: lines.join("\n") };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(`readmeflow: scanned ${pkgMap.size} packages → ${args["--out"]}`);
}
main().catch(e => { console.error(e); process.exit(1); });
